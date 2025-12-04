import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const hostname = url.hostname;

  // Show landing page for curetfy.curetcore.com subdomain
  if (hostname === "curetfy.curetcore.com" || hostname === "localhost") {
    // Check if it's a Shopify OAuth request (has shop parameter)
    const hasShopParam = url.searchParams.has("shop");
    if (!hasShopParam) {
      return redirect("/landing");
    }
  }

  // Preserve query parameters for Shopify OAuth
  const searchParams = url.searchParams.toString();
  const redirectUrl = searchParams ? `/app?${searchParams}` : "/app";

  return redirect(redirectUrl);
};
