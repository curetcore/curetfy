/**
 * Visitors API
 *
 * Built for Shopify Requirement 5.7.2:
 * "Implement the Visitors API to log customer identifying information"
 *
 * Endpoints:
 * - POST: Log visitor session or identify visitor
 * - GET: Get visitor analytics for a shop
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  findOrCreateVisitor,
  identifyVisitor,
  updateVisitorActivity,
  linkVisitorToOrder,
  getVisitorAnalytics,
} from "../services/visitors.server";
import prisma from "../db.server";

// ============================================================================
// ACTION (POST) - Log visitor session or identify visitor
// ============================================================================

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ success: false, error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { action: visitorAction, shop, ...data } = body;

    if (!shop) {
      return json({
        success: false,
        error: "Shop parameter required",
      }, { status: 400 });
    }

    // Get shop ID from domain
    const shopData = await prisma.shop.findUnique({
      where: { shopDomain: shop },
      select: { id: true },
    });

    if (!shopData) {
      return json({
        success: false,
        error: "Shop not found",
      }, { status: 404 });
    }

    switch (visitorAction) {
      case "session": {
        // Log new visitor session
        const result = await findOrCreateVisitor({
          shopId: shopData.id,
          sessionId: data.sessionId,
          fingerprint: data.fingerprint,
          ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
          userAgent: request.headers.get("user-agent") || undefined,
          referrer: data.referrer,
          landingPage: data.landingPage,
          utmSource: data.utmSource,
          utmMedium: data.utmMedium,
          utmCampaign: data.utmCampaign,
          utmTerm: data.utmTerm,
          utmContent: data.utmContent,
        });

        return json(result);
      }

      case "identify": {
        // Identify visitor with customer data
        if (!data.visitorId) {
          return json({
            success: false,
            error: "visitorId required for identify action",
          }, { status: 400 });
        }

        const result = await identifyVisitor(data.visitorId, {
          phone: data.phone,
          email: data.email,
          name: data.name,
          customerId: data.customerId,
          customerGid: data.customerGid,
        });

        return json(result);
      }

      case "activity": {
        // Log visitor activity
        if (!data.visitorId || !data.event) {
          return json({
            success: false,
            error: "visitorId and event required for activity action",
          }, { status: 400 });
        }

        await updateVisitorActivity(data.visitorId, {
          event: data.event,
          metadata: data.metadata,
        });

        return json({ success: true });
      }

      case "convert": {
        // Link visitor to order
        if (!data.visitorId || !data.orderId) {
          return json({
            success: false,
            error: "visitorId and orderId required for convert action",
          }, { status: 400 });
        }

        await linkVisitorToOrder(data.visitorId, data.orderId);

        return json({ success: true });
      }

      default:
        return json({
          success: false,
          error: "Invalid action. Use: session, identify, activity, or convert",
        }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in visitors API:", error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
};

// ============================================================================
// LOADER (GET) - Get visitor analytics
// ============================================================================

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const days = parseInt(url.searchParams.get("days") || "30", 10);

  if (!shop) {
    return json({
      success: false,
      error: "Shop parameter required",
    }, { status: 400 });
  }

  try {
    const shopData = await prisma.shop.findUnique({
      where: { shopDomain: shop },
      select: { id: true },
    });

    if (!shopData) {
      return json({
        success: false,
        error: "Shop not found",
      }, { status: 404 });
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await getVisitorAnalytics(shopData.id, startDate, endDate);

    return json({
      success: true,
      data: {
        period: { startDate, endDate, days },
        ...analytics,
      },
    });
  } catch (error) {
    console.error("Error getting visitor analytics:", error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
};
