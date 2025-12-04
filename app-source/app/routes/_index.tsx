import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const hostname = url.hostname;

  // Show home page if no shop parameter (public access)
  const hasShopParam = url.searchParams.has("shop");
  if (!hasShopParam && !url.pathname.startsWith("/app")) {
    return redirect("/home");
  }

  // Preserve query parameters for Shopify OAuth
  const searchParams = url.searchParams.toString();
  const redirectUrl = searchParams ? `/app?${searchParams}` : "/app";

  return redirect(redirectUrl);
};
