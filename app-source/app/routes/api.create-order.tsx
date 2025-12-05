import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import prisma from "../db.server";

const PLAN_LIMITS: Record<string, number> = {
  FREE: 100,
  PRO: Infinity,
};

export const action = async ({ request }: ActionFunctionArgs) => {
  // Only allow POST
  if (request.method !== "POST") {
    return json({ success: false, error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const {
      shop,
      productId,
      productTitle,
      variantId,
      quantity = 1,
      price,
      currency = "USD",
      customer,
      // UTM tracking
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
    } = body;

    // Validate required fields
    if (!shop || !productId || !customer?.name || !customer?.phone || !customer?.address) {
      return json({
        success: false,
        error: "Missing required fields",
      }, { status: 400 });
    }

    // Get shop configuration
    const shopData = await prisma.shop.findUnique({
      where: { shopDomain: shop },
    });

    if (!shopData) {
      return json({
        success: false,
        error: "Shop not found or app not installed",
      }, { status: 404 });
    }

    // Check order limits
    const orderLimit = PLAN_LIMITS[shopData.plan] || 60;
    if (shopData.ordersThisMonth >= orderLimit) {
      return json({
        success: false,
        error: "Order limit reached",
        upgradeRequired: true,
        currentPlan: shopData.plan,
        ordersUsed: shopData.ordersThisMonth,
        orderLimit,
      }, { status: 403 });
    }

    // Calculate totals
    const unitPrice = parseFloat(price) || 0;
    const subtotal = unitPrice * quantity;
    const total = subtotal; // No discount for now

    // Generate order number
    const orderCount = await prisma.order.count({ where: { shopId: shopData.id } });
    const orderNumber = `COD-${String(orderCount + 1).padStart(5, "0")}`;

    // Create order in our database
    const order = await prisma.order.create({
      data: {
        shopId: shopData.id,
        shopifyOrderNumber: orderNumber,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        customerProvince: customer.province || "",
        customerCountry: customer.country || "DO",
        productId,
        productTitle,
        productVariantId: variantId,
        quantity,
        unitPrice,
        subtotal,
        total,
        currency,
        status: "PENDING",
        // UTM tracking
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        utmTerm: utmTerm || null,
        utmContent: utmContent || null,
      },
    });

    // Increment order counter
    await prisma.shop.update({
      where: { id: shopData.id },
      data: { ordersThisMonth: { increment: 1 } },
    });

    // Generate WhatsApp link
    const whatsappLink = generateWhatsAppLink({
      phone: shopData.whatsappNumber || "",
      template: shopData.messageTemplate || "",
      data: {
        orderNumber,
        product: productTitle,
        quantity: String(quantity),
        total: formatCurrency(total, currency),
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        province: customer.province || "",
      },
    });

    return json({
      success: true,
      data: {
        orderId: order.id,
        shopifyOrderNumber: orderNumber,
        total: total.toFixed(2),
        currency,
        whatsappLink,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return json({
      success: false,
      error: "Failed to create order",
    }, { status: 500 });
  }
};

function generateWhatsAppLink(params: {
  phone: string;
  template: string;
  data: Record<string, string>;
}): string {
  let message = params.template;

  // Replace template variables
  Object.entries(params.data).forEach(([key, value]) => {
    message = message.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  });

  // Clean phone number
  const cleanPhone = params.phone.replace(/\D/g, "");

  // Encode message
  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

function formatCurrency(amount: number, currency: string): string {
  try {
    // Use locale based on currency for proper formatting
    const localeMap: Record<string, string> = {
      USD: "en-US",
      DOP: "es-DO",
      COP: "es-CO",
      MXN: "es-MX",
      PEN: "es-PE",
      CLP: "es-CL",
      ARS: "es-AR",
      EUR: "es-ES",
    };
    const locale = localeMap[currency] || "en-US";

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

// Handle GET for config
export const loader = async ({ request }: ActionFunctionArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return json({ success: false, error: "Shop parameter required" }, { status: 400 });
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
    },
  });

  if (!shopData) {
    return json({ success: false, error: "Shop not found" }, { status: 404 });
  }

  return json({
    success: true,
    config: shopData,
  });
};
