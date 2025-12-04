import { json, type ActionFunctionArgs } from "@remix-run/node";
import prisma from "../db.server";

// Track form opens - called from storefront when modal opens
export async function action({ request }: ActionFunctionArgs) {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405, headers });
  }

  try {
    const body = await request.json();
    const {
      shop: shopDomain,
      productId,
      productTitle,
      utmSource,
      utmMedium,
      utmCampaign,
      pageUrl,
    } = body;

    if (!shopDomain) {
      return json({ error: "Shop domain is required" }, { status: 400, headers });
    }

    // Find shop
    const shop = await prisma.shop.findUnique({
      where: { shopDomain },
    });

    if (!shop) {
      return json({ error: "Shop not found" }, { status: 404, headers });
    }

    // Get IP and user agent from request
    const ipAddress = request.headers.get("x-forwarded-for") ||
                      request.headers.get("x-real-ip") ||
                      "unknown";
    const userAgent = request.headers.get("user-agent") || undefined;

    // Create form open record
    await prisma.formOpen.create({
      data: {
        shopId: shop.id,
        productId: productId || null,
        productTitle: productTitle || null,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        ipAddress,
        userAgent,
        pageUrl: pageUrl || null,
      },
    });

    return json({ success: true }, { headers });

  } catch (error) {
    console.error("Error tracking form open:", error);
    return json({ error: "Failed to track" }, { status: 500, headers });
  }
}

// Handle OPTIONS for CORS preflight
export async function loader({ request }: ActionFunctionArgs) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
  return json({ error: "Method not allowed" }, { status: 405 });
}
