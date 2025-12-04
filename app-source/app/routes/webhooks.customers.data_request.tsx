import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Customer data request - return data we have about the customer
  // In a real implementation, you would send this data to the merchant
  const shopData = await prisma.shop.findUnique({
    where: { shopDomain: shop },
  });

  if (shopData && payload?.customer?.phone) {
    const customerOrders = await prisma.order.findMany({
      where: {
        shopId: shopData.id,
        customerPhone: payload.customer.phone,
      },
      select: {
        id: true,
        customerName: true,
        customerPhone: true,
        customerAddress: true,
        customerProvince: true,
        productTitle: true,
        quantity: true,
        total: true,
        createdAt: true,
      },
    });

    console.log(`Customer data for ${payload.customer.phone}:`, customerOrders);
    // In production: Send this data to merchant via email or store for retrieval
  }

  return json({ success: true });
};
