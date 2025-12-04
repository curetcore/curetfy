import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  DataTable,
  Badge,
  Text,
  BlockStack,
  Pagination,
  Filters,
  EmptyState,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

const ITEMS_PER_PAGE = 20;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const status = url.searchParams.get("status") || undefined;
  const search = url.searchParams.get("search") || undefined;

  const shop = await prisma.shop.findUnique({
    where: { shopDomain: session.shop },
  });

  if (!shop) {
    return json({ orders: [], total: 0, page: 1, totalPages: 1 });
  }

  const where: any = { shopId: shop.id };
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { customerName: { contains: search, mode: "insensitive" } },
      { customerPhone: { contains: search } },
      { shopifyOrderNumber: { contains: search } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.order.count({ where }),
  ]);

  return json({
    orders,
    total,
    page,
    totalPages: Math.ceil(total / ITEMS_PER_PAGE),
  });
};

export default function Orders() {
  const { orders, total, page, totalPages } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const statusBadge = (status: string) => {
    const tones: Record<string, "success" | "info" | "warning" | "critical"> = {
      PENDING: "warning",
      CONFIRMED: "info",
      PROCESSING: "info",
      SHIPPED: "info",
      DELIVERED: "success",
      CANCELLED: "critical",
      RETURNED: "critical",
    };
    return <Badge tone={tones[status] || "info"}>{status}</Badge>;
  };

  const rows = orders.map((order) => [
    order.shopifyOrderNumber || order.id.slice(0, 8),
    order.customerName,
    order.customerPhone,
    order.productTitle,
    order.quantity,
    `${order.currency} ${Number(order.total).toFixed(2)}`,
    statusBadge(order.status),
    new Date(order.createdAt).toLocaleDateString("es-DO"),
  ]);

  if (orders.length === 0) {
    return (
      <Page backAction={{ content: "Dashboard", url: "/app" }} title="Órdenes">
        <TitleBar title="Órdenes" />
        <Card>
          <EmptyState
            heading="No hay órdenes"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>Los pedidos aparecerán aquí cuando los clientes usen el formulario COD.</p>
          </EmptyState>
        </Card>
      </Page>
    );
  }

  return (
    <Page backAction={{ content: "Dashboard", url: "/app" }} title="Órdenes">
      <TitleBar title="Órdenes" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="p" variant="bodySm" tone="subdued">
                {total} órdenes en total
              </Text>
              <DataTable
                columnContentTypes={["text", "text", "text", "text", "numeric", "text", "text", "text"]}
                headings={["#", "Cliente", "Teléfono", "Producto", "Cant.", "Total", "Estado", "Fecha"]}
                rows={rows}
              />
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
                  <Pagination
                    hasPrevious={page > 1}
                    hasNext={page < totalPages}
                    onPrevious={() => setSearchParams({ page: String(page - 1) })}
                    onNext={() => setSearchParams({ page: String(page + 1) })}
                  />
                </div>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
