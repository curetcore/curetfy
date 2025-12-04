import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const hostname = url.hostname;

  // Show app landing page if no shop parameter (public access)
  const hasShopParam = url.searchParams.has("shop");
  if (!hasShopParam && !url.pathname.startsWith("/app")) {
    return redirect("/curetfy");
  }

  // Preserve query parameters for Shopify OAuth
  const searchParams = url.searchParams.toString();
  const redirectUrl = searchParams ? `/app?${searchParams}` : "/app";

  return redirect(redirectUrl);
};
