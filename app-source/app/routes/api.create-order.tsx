import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  PLAN_LIMITS,
  checkAndResetBillingCycle,
  getShopByDomain,
  getShopById,
  createOrderWithTransaction,
  buildTemplateData,
  generateWhatsAppLink,
  isValidWhatsAppNumber,
  type OrderRequestBody,
  type OrderResult,
} from "../services/order.server";
import prisma from "../db.server";

// ============================================================================
// MAIN ACTION HANDLER
// ============================================================================

export const action = async ({ request }: ActionFunctionArgs) => {
  // Only allow POST
  if (request.method !== "POST") {
    return json({
      success: false,
      error: "Method not allowed",
      code: "METHOD_NOT_ALLOWED",
    }, { status: 405 });
  }

  try {
    const body: OrderRequestBody = await request.json();
    const {
      shop,
      productId,
      productTitle,
      variantId,
      variantTitle,
      productImage,
      quantity = 1,
      price,
      currency = "USD",
      customer,
      shippingRate,
      codFee = 0,
      discount = 0,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
    } = body;

    // ========================================================================
    // VALIDATION
    // ========================================================================

    const validationErrors: string[] = [];

    if (!shop) validationErrors.push("shop is required");
    if (!productId) validationErrors.push("productId is required");
    if (!productTitle) validationErrors.push("productTitle is required");
    if (!customer?.name) validationErrors.push("customer.name is required");
    if (!customer?.phone) validationErrors.push("customer.phone is required");
    if (!customer?.address) validationErrors.push("customer.address is required");

    if (validationErrors.length > 0) {
      return json({
        success: false,
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: validationErrors,
      }, { status: 400 });
    }

    // ========================================================================
    // GET SHOP & CHECK BILLING
    // ========================================================================

    const shopData = await getShopByDomain(shop);

    if (!shopData) {
      return json({
        success: false,
        error: "Shop not found or app not installed",
        code: "SHOP_NOT_FOUND",
      }, { status: 404 });
    }

    // Check and reset billing cycle if needed
    await checkAndResetBillingCycle(shopData.id, shopData.billingCycleStart);

    // Reload shop data after potential reset
    const updatedShopData = await getShopById(shopData.id);

    if (!updatedShopData) {
      return json({
        success: false,
        error: "Shop data error",
        code: "SHOP_DATA_ERROR",
      }, { status: 500 });
    }

    // Check order limits
    const orderLimit = PLAN_LIMITS[updatedShopData.plan] || 100;
    if (updatedShopData.ordersThisMonth >= orderLimit) {
      return json({
        success: false,
        error: "Order limit reached for your plan",
        code: "ORDER_LIMIT_REACHED",
        upgradeRequired: true,
        currentPlan: updatedShopData.plan,
        ordersUsed: updatedShopData.ordersThisMonth,
        orderLimit: orderLimit === Infinity ? "unlimited" : orderLimit,
      }, { status: 403 });
    }

    // ========================================================================
    // CALCULATE TOTALS
    // ========================================================================

    const unitPrice = parseFloat(price) || 0;
    const shippingCost = shippingRate?.price || 0;
    const subtotal = unitPrice * quantity;
    const total = subtotal + shippingCost + codFee - discount;

    // ========================================================================
    // CREATE ORDER WITH TRANSACTION (Atomic operation)
    // ========================================================================

    const orderResult = await createOrderWithTransaction({
      shopId: updatedShopData.id,
      customer,
      productId,
      productTitle,
      variantId,
      variantTitle,
      productImage,
      quantity,
      unitPrice,
      subtotal,
      shippingCost,
      shippingRateName: shippingRate?.name,
      codFee,
      discount,
      total,
      currency,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
    });

    // ========================================================================
    // GENERATE WHATSAPP LINK
    // ========================================================================

    const templateData = buildTemplateData({
      orderNumber: orderResult.orderNumber,
      orderId: orderResult.order.id,
      customer,
      productTitle,
      variantTitle,
      quantity,
      unitPrice,
      subtotal,
      shippingCost,
      shippingRateName: shippingRate?.name,
      codFee,
      discount,
      total,
      currency,
    });

    let whatsappLink: string | null = null;
    const hasValidWhatsApp = isValidWhatsAppNumber(updatedShopData.whatsappNumber);

    if (hasValidWhatsApp && updatedShopData.messageTemplate) {
      whatsappLink = generateWhatsAppLink({
        phone: updatedShopData.whatsappNumber!,
        template: updatedShopData.messageTemplate,
        data: templateData,
      });
    }

    // ========================================================================
    // RETURN SUCCESS RESPONSE
    // ========================================================================

    const response: { success: true; data: OrderResult; warnings?: string[] } = {
      success: true,
      data: {
        orderId: orderResult.order.id,
        orderNumber: orderResult.orderNumber,
        subtotal: subtotal.toFixed(2),
        shipping: shippingCost.toFixed(2),
        codFee: codFee.toFixed(2),
        discount: discount.toFixed(2),
        total: total.toFixed(2),
        currency,
        whatsappLink,
        whatsappNumber: hasValidWhatsApp ? updatedShopData.whatsappNumber : null,
      },
    };

    // Add warnings if WhatsApp is not configured
    if (!hasValidWhatsApp) {
      response.warnings = ["WhatsApp number not configured or invalid. Customer cannot be redirected to WhatsApp."];
    }

    return json(response);

  } catch (error) {
    console.error("Error creating order:", error);

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Transaction")) {
        return json({
          success: false,
          error: "Order creation failed due to high traffic. Please try again.",
          code: "TRANSACTION_ERROR",
        }, { status: 503 });
      }
    }

    return json({
      success: false,
      error: "Failed to create order",
      code: "INTERNAL_ERROR",
    }, { status: 500 });
  }
};

// ============================================================================
// LOADER (GET) - Return shop config
// ============================================================================

export const loader = async ({ request }: ActionFunctionArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return json({
      success: false,
      error: "Shop parameter required",
      code: "MISSING_SHOP_PARAM",
    }, { status: 400 });
  }

  const shopData = await prisma.shop.findUnique({
    where: { shopDomain: shop },
    select: {
      whatsappNumber: true,
      buttonText: true,
      buttonColor: true,
      buttonTextColor: true,
      formTitle: true,
      countries: true,
      defaultCountry: true,
      messageTemplate: true,
      formEnabled: true,
    },
  });

  if (!shopData) {
    return json({
      success: false,
      error: "Shop not found",
      code: "SHOP_NOT_FOUND",
    }, { status: 404 });
  }

  // Validate WhatsApp configuration
  const whatsappConfigured = isValidWhatsAppNumber(shopData.whatsappNumber);

  return json({
    success: true,
    config: {
      ...shopData,
      whatsappConfigured,
    },
  });
};
