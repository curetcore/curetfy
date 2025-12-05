import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, billing } = await authenticate.admin(request);
  const url = new URL(request.url);
  const plan = url.searchParams.get("plan");
  const chargeId = url.searchParams.get("charge_id");

  if (!plan) {
    return redirect("/app/billing?error=missing_plan");
  }

  // Verify the charge was accepted
  if (chargeId) {
    try {
      // Update the shop's plan in the database
      await prisma.shop.update({
        where: { shopDomain: session.shop },
        data: {
          plan: plan as "FREE" | "PRO",
          shopifyChargeId: chargeId,
        },
      });

      return redirect("/app?success=plan_upgraded");
    } catch (error) {
      console.error("Error updating plan:", error);
      return redirect("/app/billing?error=update_failed");
    }
  }

  // If no charge_id, the user probably cancelled
  return redirect("/app/billing?error=cancelled");
};
