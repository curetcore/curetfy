import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Customer redact - anonymize customer data
  const shopData = await prisma.shop.findUnique({
    where: { shopDomain: shop },
  });

  if (shopData && payload?.customer?.phone) {
    // Anonymize customer data in orders
    await prisma.order.updateMany({
      where: {
        shopId: shopData.id,
        customerPhone: payload.customer.phone,
      },
      data: {
        customerName: "[REDACTED]",
        customerPhone: "[REDACTED]",
        customerEmail: null,
        customerAddress: "[REDACTED]",
        customerNotes: null,
      },
    });

    console.log(`Redacted data for customer ${payload.customer.phone} in shop ${shop}`);
  }

  return json({ success: true });
};
