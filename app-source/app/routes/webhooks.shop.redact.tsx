import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Shop redact - delete all shop data (48 hours after uninstall)
  const shopData = await prisma.shop.findUnique({
    where: { shopDomain: shop },
  });

  if (shopData) {
    // Delete all orders for this shop
    await prisma.order.deleteMany({
      where: { shopId: shopData.id },
    });

    // Delete the shop record
    await prisma.shop.delete({
      where: { id: shopData.id },
    });

    console.log(`Deleted all data for shop ${shop}`);
  }

  return json({ success: true });
};
