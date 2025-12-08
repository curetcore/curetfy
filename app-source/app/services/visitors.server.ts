/**
 * Visitors Service
 *
 * Built for Shopify Requirement 5.7.2:
 * "Log customer identifying information via the Visitors API"
 *
 * This service tracks visitor interactions and associates them with customers
 * when they submit the COD form.
 */

import prisma from "../db.server";

// ============================================================================
// TYPES
// ============================================================================

export interface VisitorData {
  shopId: string;
  sessionId?: string;
  fingerprint?: string;
  ip?: string;
  userAgent?: string;
  referrer?: string;
  landingPage?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

export interface VisitorIdentification {
  phone?: string;
  email?: string;
  name?: string;
  customerId?: string;
  customerGid?: string;
}

export interface VisitorLogResult {
  success: boolean;
  visitorId?: string;
  error?: string;
}

// ============================================================================
// VISITOR LOGGING
// ============================================================================

/**
 * Log a new visitor session
 * Called when form is first displayed to a user
 */
export async function logVisitorSession(data: VisitorData): Promise<VisitorLogResult> {
  try {
    const visitor = await prisma.visitor.create({
      data: {
        shopId: data.shopId,
        sessionId: data.sessionId || generateSessionId(),
        fingerprint: data.fingerprint,
        ipAddress: data.ip,
        userAgent: data.userAgent,
        referrer: data.referrer,
        landingPage: data.landingPage,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        utmTerm: data.utmTerm,
        utmContent: data.utmContent,
        firstSeen: new Date(),
        lastSeen: new Date(),
      },
    });

    return {
      success: true,
      visitorId: visitor.id,
    };
  } catch (error) {
    console.error("Error logging visitor session:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Identify a visitor with customer data
 * Called when customer submits the COD form
 */
export async function identifyVisitor(
  visitorId: string,
  identification: VisitorIdentification
): Promise<VisitorLogResult> {
  try {
    await prisma.visitor.update({
      where: { id: visitorId },
      data: {
        phone: identification.phone,
        email: identification.email,
        customerName: identification.name,
        shopifyCustomerId: identification.customerId,
        shopifyCustomerGid: identification.customerGid,
        identifiedAt: new Date(),
        lastSeen: new Date(),
      },
    });

    return { success: true, visitorId };
  } catch (error) {
    console.error("Error identifying visitor:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update visitor activity
 * Called on form interactions (field focus, validation, etc.)
 */
export async function updateVisitorActivity(
  visitorId: string,
  activity: {
    event: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    await prisma.$transaction([
      // Update last seen
      prisma.visitor.update({
        where: { id: visitorId },
        data: { lastSeen: new Date() },
      }),
      // Log activity
      prisma.visitorActivity.create({
        data: {
          visitorId,
          event: activity.event,
          metadata: activity.metadata ? JSON.stringify(activity.metadata) : null,
        },
      }),
    ]);
  } catch (error) {
    console.error("Error updating visitor activity:", error);
  }
}

/**
 * Find visitor by session ID
 */
export async function findVisitorBySession(
  shopId: string,
  sessionId: string
) {
  return prisma.visitor.findFirst({
    where: {
      shopId,
      sessionId,
    },
  });
}

/**
 * Find or create visitor for a session
 */
export async function findOrCreateVisitor(
  data: VisitorData
): Promise<VisitorLogResult> {
  try {
    // Try to find existing visitor by session
    if (data.sessionId) {
      const existing = await findVisitorBySession(data.shopId, data.sessionId);
      if (existing) {
        // Update last seen
        await prisma.visitor.update({
          where: { id: existing.id },
          data: { lastSeen: new Date() },
        });
        return { success: true, visitorId: existing.id };
      }
    }

    // Create new visitor
    return logVisitorSession(data);
  } catch (error) {
    console.error("Error in findOrCreateVisitor:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Link visitor to order
 */
export async function linkVisitorToOrder(
  visitorId: string,
  orderId: string
): Promise<void> {
  try {
    await prisma.visitor.update({
      where: { id: visitorId },
      data: {
        orderId,
        convertedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error linking visitor to order:", error);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `vs_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Get visitor analytics for a shop
 */
export async function getVisitorAnalytics(
  shopId: string,
  startDate: Date,
  endDate: Date
) {
  const [totalVisitors, identifiedVisitors, convertedVisitors] = await Promise.all([
    prisma.visitor.count({
      where: {
        shopId,
        firstSeen: { gte: startDate, lte: endDate },
      },
    }),
    prisma.visitor.count({
      where: {
        shopId,
        firstSeen: { gte: startDate, lte: endDate },
        identifiedAt: { not: null },
      },
    }),
    prisma.visitor.count({
      where: {
        shopId,
        firstSeen: { gte: startDate, lte: endDate },
        convertedAt: { not: null },
      },
    }),
  ]);

  return {
    totalVisitors,
    identifiedVisitors,
    convertedVisitors,
    identificationRate: totalVisitors > 0 ? (identifiedVisitors / totalVisitors) * 100 : 0,
    conversionRate: totalVisitors > 0 ? (convertedVisitors / totalVisitors) * 100 : 0,
  };
}
