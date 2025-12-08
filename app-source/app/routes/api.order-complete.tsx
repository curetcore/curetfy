/**
 * Complete Order API
 *
 * Built for Shopify Requirements:
 * - 5.7.1: Customer Segment support via metafields
 * - 5.7.2: Visitors API integration
 * - 5.7.3: Customer sync with Shopify
 *
 * This endpoint handles the complete order flow:
 * 1. Validates order data
 * 2. Syncs customer to Shopify (creates/updates)
 * 3. Updates customer metafields for segmentation
 * 4. Creates the order in local database
 * 5. Links visitor to order (if visitor tracking enabled)
 * 6. Returns WhatsApp link for redirect
 */

import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import {
  PLAN_LIMITS,
  checkAndResetBillingCycle,
  createOrderWithTransaction,
  buildTemplateData,
  generateWhatsAppLink,
  isValidWhatsAppNumber,
  parseCustomerName,
  type CustomerData,
} from "../services/order.server";
import { syncCustomerToShopify } from "../services/customer-sync.server";
import { updateCustomerMetafieldsForCOD, initializeCustomerMetafields } from "../services/customer-metafields.server";
import { identifyVisitor, linkVisitorToOrder } from "../services/visitors.server";

// ============================================================================
// TYPES
// ============================================================================

interface CompleteOrderRequest {
  shop: string;
  productId: string;
  productTitle: string;
  variantId?: string;
  variantTitle?: string;
  productImage?: string;
  quantity?: number;
  price: string;
  currency?: string;
  customer: CustomerData;
  shippingRate?: {
    name: string;
    price: number;
  };
  codFee?: number;
  discount?: number;
  visitorId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

// ============================================================================
// ACTION (POST)
// ============================================================================

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({
      success: false,
      error: "Method not allowed",
      code: "METHOD_NOT_ALLOWED",
    }, { status: 405 });
  }

  try {
    const body: CompleteOrderRequest = await request.json();
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
      visitorId,
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
    // GET SHOP DATA & CHECK BILLING
    // ========================================================================

    const shopData = await prisma.shop.findUnique({
      where: { shopDomain: shop },
    });

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
    const updatedShopData = await prisma.shop.findUnique({
      where: { id: shopData.id },
    });

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
    // SYNC CUSTOMER TO SHOPIFY (Requirement 5.7.3)
    // ========================================================================

    let customerSyncResult = null;
    let shopifyCustomerId: string | undefined;
    let shopifyCustomerGid: string | undefined;

    // Get Shopify admin API access
    const session = await prisma.session.findFirst({
      where: { shop },
      orderBy: { id: "desc" },
    });

    if (session?.accessToken) {
      try {
        // Create a simple admin API wrapper for customer sync
        const { firstName, lastName } = parseCustomerName(customer.name);

        const adminApiUrl = `https://${shop}/admin/api/2024-10/graphql.json`;

        // Sync customer to Shopify
        const syncResponse = await syncCustomerViaRest({
          shopDomain: shop,
          accessToken: session.accessToken,
          customerData: {
            email: customer.email,
            phone: customer.phone,
            firstName,
            lastName,
            address: {
              address1: customer.address,
              address2: customer.address2,
              city: customer.city,
              province: customer.province,
              country: customer.country || updatedShopData.defaultCountry,
              zip: customer.postalCode,
            },
            tags: ["curetfy_cod_form"],
            note: customer.notes,
          },
        });

        if (syncResponse.success) {
          shopifyCustomerId = syncResponse.customerId;
          shopifyCustomerGid = syncResponse.customerGid;
          customerSyncResult = {
            synced: true,
            isNewCustomer: syncResponse.isNewCustomer,
          };

          // Update customer metafields for segmentation (Requirement 5.7.1)
          if (shopifyCustomerGid) {
            await updateCustomerMetafieldsViaRest({
              shopDomain: shop,
              accessToken: session.accessToken,
              customerGid: shopifyCustomerGid,
              orderTotal: total,
              isNewCustomer: syncResponse.isNewCustomer,
            });
          }
        }
      } catch (error) {
        console.error("Customer sync error:", error);
        customerSyncResult = {
          synced: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }

    // ========================================================================
    // CREATE ORDER WITH TRANSACTION
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
    // LINK VISITOR TO ORDER (Requirement 5.7.2)
    // ========================================================================

    if (visitorId) {
      try {
        // Identify visitor with customer data
        await identifyVisitor(visitorId, {
          phone: customer.phone,
          email: customer.email,
          name: customer.name,
          customerId: shopifyCustomerId,
          customerGid: shopifyCustomerGid,
        });

        // Link visitor to converted order
        await linkVisitorToOrder(visitorId, orderResult.order.id);
      } catch (error) {
        console.error("Visitor tracking error:", error);
      }
    }

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

    const response: any = {
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
        customerSync: customerSyncResult,
        shopifyCustomerId,
      },
    };

    if (!hasValidWhatsApp) {
      response.warnings = ["WhatsApp number not configured or invalid."];
    }

    return json(response);

  } catch (error) {
    console.error("Error creating order:", error);

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
// HELPER FUNCTIONS
// ============================================================================

/**
 * Sync customer to Shopify via REST API
 */
async function syncCustomerViaRest(params: {
  shopDomain: string;
  accessToken: string;
  customerData: {
    email?: string;
    phone: string;
    firstName: string;
    lastName: string;
    address?: {
      address1: string;
      address2?: string;
      city?: string;
      province?: string;
      country?: string;
      zip?: string;
    };
    tags?: string[];
    note?: string;
  };
}): Promise<{ success: boolean; customerId?: string; customerGid?: string; isNewCustomer: boolean; error?: string }> {
  const { shopDomain, accessToken, customerData } = params;

  // Format phone for Shopify (E.164)
  let formattedPhone = customerData.phone.replace(/[^\d+]/g, "");
  if (!formattedPhone.startsWith("+")) {
    formattedPhone = "+" + formattedPhone;
  }

  // GraphQL query to find customer
  const searchQuery = `
    query FindCustomer($query: String!) {
      customers(first: 1, query: $query) {
        edges {
          node {
            id
            legacyResourceId
            email
            phone
            tags
          }
        }
      }
    }
  `;

  const graphqlUrl = `https://${shopDomain}/admin/api/2024-10/graphql.json`;

  try {
    // Search for existing customer by phone
    const searchResponse = await fetch(graphqlUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query: searchQuery,
        variables: { query: `phone:${formattedPhone}` },
      }),
    });

    const searchData = await searchResponse.json();
    let existingCustomer = searchData.data?.customers?.edges?.[0]?.node;

    // If not found by phone and email provided, search by email
    if (!existingCustomer && customerData.email) {
      const emailSearchResponse = await fetch(graphqlUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({
          query: searchQuery,
          variables: { query: `email:${customerData.email}` },
        }),
      });

      const emailSearchData = await emailSearchResponse.json();
      existingCustomer = emailSearchData.data?.customers?.edges?.[0]?.node;
    }

    if (existingCustomer) {
      // Update existing customer - add tag if not present
      const existingTags = existingCustomer.tags || [];
      if (!existingTags.includes("curetfy_cod_form")) {
        const addTagMutation = `
          mutation TagsAdd($id: ID!, $tags: [String!]!) {
            tagsAdd(id: $id, tags: $tags) {
              userErrors { field message }
            }
          }
        `;

        await fetch(graphqlUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": accessToken,
          },
          body: JSON.stringify({
            query: addTagMutation,
            variables: { id: existingCustomer.id, tags: ["curetfy_cod_form"] },
          }),
        });
      }

      return {
        success: true,
        customerId: existingCustomer.legacyResourceId,
        customerGid: existingCustomer.id,
        isNewCustomer: false,
      };
    }

    // Create new customer
    const createMutation = `
      mutation CustomerCreate($input: CustomerInput!) {
        customerCreate(input: $input) {
          customer {
            id
            legacyResourceId
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const createInput: any = {
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      phone: formattedPhone,
      tags: customerData.tags || ["curetfy_cod_form"],
    };

    if (customerData.email) {
      createInput.email = customerData.email;
    }

    if (customerData.address) {
      createInput.addresses = [{
        address1: customerData.address.address1,
        address2: customerData.address.address2 || null,
        city: customerData.address.city || null,
        province: customerData.address.province || null,
        country: customerData.address.country || "DO",
        zip: customerData.address.zip || null,
      }];
    }

    if (customerData.note) {
      createInput.note = customerData.note;
    }

    const createResponse = await fetch(graphqlUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query: createMutation,
        variables: { input: createInput },
      }),
    });

    const createData = await createResponse.json();

    if (createData.data?.customerCreate?.userErrors?.length > 0) {
      const errors = createData.data.customerCreate.userErrors;
      console.error("Customer create errors:", errors);
      return {
        success: false,
        error: errors.map((e: any) => e.message).join(", "),
        isNewCustomer: false,
      };
    }

    const newCustomer = createData.data?.customerCreate?.customer;

    if (!newCustomer) {
      return {
        success: false,
        error: "Failed to create customer",
        isNewCustomer: false,
      };
    }

    return {
      success: true,
      customerId: newCustomer.legacyResourceId,
      customerGid: newCustomer.id,
      isNewCustomer: true,
    };
  } catch (error) {
    console.error("Error syncing customer via REST:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      isNewCustomer: false,
    };
  }
}

/**
 * Update customer metafields via REST API
 */
async function updateCustomerMetafieldsViaRest(params: {
  shopDomain: string;
  accessToken: string;
  customerGid: string;
  orderTotal: number;
  isNewCustomer: boolean;
}): Promise<void> {
  const { shopDomain, accessToken, customerGid, orderTotal, isNewCustomer } = params;
  const graphqlUrl = `https://${shopDomain}/admin/api/2024-10/graphql.json`;
  const now = new Date().toISOString();

  try {
    if (isNewCustomer) {
      // Initialize metafields for new customer
      const metafields = [
        {
          ownerId: customerGid,
          namespace: "curetfy",
          key: "cod_orders_count",
          type: "number_integer",
          value: "1",
        },
        {
          ownerId: customerGid,
          namespace: "curetfy",
          key: "total_cod_spent",
          type: "number_decimal",
          value: orderTotal.toFixed(2),
        },
        {
          ownerId: customerGid,
          namespace: "curetfy",
          key: "first_cod_order_date",
          type: "date_time",
          value: now,
        },
        {
          ownerId: customerGid,
          namespace: "curetfy",
          key: "last_cod_order_date",
          type: "date_time",
          value: now,
        },
      ];

      const mutation = `
        mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafields) {
            userErrors { field message }
          }
        }
      `;

      await fetch(graphqlUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({
          query: mutation,
          variables: { metafields },
        }),
      });
    } else {
      // Get current values and increment
      const getQuery = `
        query GetCustomerMetafields($id: ID!) {
          customer(id: $id) {
            ordersCount: metafield(namespace: "curetfy", key: "cod_orders_count") { value }
            totalSpent: metafield(namespace: "curetfy", key: "total_cod_spent") { value }
            firstOrder: metafield(namespace: "curetfy", key: "first_cod_order_date") { value }
          }
        }
      `;

      const getResponse = await fetch(graphqlUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({
          query: getQuery,
          variables: { id: customerGid },
        }),
      });

      const getData = await getResponse.json();
      const customer = getData.data?.customer;

      const currentCount = parseInt(customer?.ordersCount?.value || "0", 10);
      const currentTotal = parseFloat(customer?.totalSpent?.value || "0");
      const hasFirstOrder = !!customer?.firstOrder?.value;

      const metafields: any[] = [
        {
          ownerId: customerGid,
          namespace: "curetfy",
          key: "cod_orders_count",
          type: "number_integer",
          value: String(currentCount + 1),
        },
        {
          ownerId: customerGid,
          namespace: "curetfy",
          key: "total_cod_spent",
          type: "number_decimal",
          value: (currentTotal + orderTotal).toFixed(2),
        },
        {
          ownerId: customerGid,
          namespace: "curetfy",
          key: "last_cod_order_date",
          type: "date_time",
          value: now,
        },
      ];

      if (!hasFirstOrder) {
        metafields.push({
          ownerId: customerGid,
          namespace: "curetfy",
          key: "first_cod_order_date",
          type: "date_time",
          value: now,
        });
      }

      const mutation = `
        mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafields) {
            userErrors { field message }
          }
        }
      `;

      await fetch(graphqlUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({
          query: mutation,
          variables: { metafields },
        }),
      });
    }
  } catch (error) {
    console.error("Error updating customer metafields:", error);
  }
}
