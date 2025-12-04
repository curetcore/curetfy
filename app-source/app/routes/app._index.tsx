import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  Button,
  Banner,
  ProgressBar,
  Box,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

const PLAN_LIMITS: Record<string, number> = {
  FREE: 60,
  PRO: 500,
  BUSINESS: 2000,
  UNLIMITED: Infinity,
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Find or create shop
  let shop = await prisma.shop.findUnique({
    where: { shopDomain: session.shop },
  });

  if (!shop) {
    shop = await prisma.shop.create({
      data: { shopDomain: session.shop },
    });
  }

  // Get orders this month
  const ordersThisMonth = await prisma.order.count({
    where: {
      shopId: shop.id,
      createdAt: { gte: shop.billingCycleStart },
    },
  });

  // Get recent orders
  const recentOrders = await prisma.order.findMany({
    where: { shopId: shop.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Calculate stats
  const orderLimit = PLAN_LIMITS[shop.plan] || 60;
  const usagePercentage = orderLimit === Infinity ? 0 : Math.round((ordersThisMonth / orderLimit) * 100);

  return json({
    shop: {
      ...shop,
      ordersThisMonth,
    },
    recentOrders,
    orderLimit,
    usagePercentage,
    setupComplete: !!shop.whatsappNumber,
  });
};

export default function Dashboard() {
  const { shop, recentOrders, orderLimit, usagePercentage, setupComplete } = useLoaderData<typeof loader>();

  return (
    <Page>
      <TitleBar title="Dashboard" />
      <BlockStack gap="500">
        {!setupComplete && (
          <Banner
            title="Completa la configuración"
            tone="warning"
            action={{ content: "Configurar WhatsApp", url: "/app/settings" }}
          >
            <p>Agrega tu número de WhatsApp para empezar a recibir pedidos COD.</p>
          </Banner>
        )}

        <Layout>
          {/* Stats Cards */}
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Órdenes este mes</Text>
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="p" variant="heading2xl" fontWeight="bold">
                    {shop.ordersThisMonth}
                  </Text>
                  <Badge tone={shop.plan === "FREE" ? "info" : "success"}>
                    {shop.plan}
                  </Badge>
                </InlineStack>
                {orderLimit !== Infinity && (
                  <BlockStack gap="200">
                    <ProgressBar
                      progress={usagePercentage}
                      tone={usagePercentage > 80 ? "critical" : "primary"}
                      size="small"
                    />
                    <Text as="p" variant="bodySm" tone="subdued">
                      {shop.ordersThisMonth} de {orderLimit} órdenes
                    </Text>
                  </BlockStack>
                )}
                {orderLimit === Infinity && (
                  <Text as="p" variant="bodySm" tone="subdued">Órdenes ilimitadas</Text>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">WhatsApp</Text>
                <Text as="p" variant="headingLg" fontWeight="semibold">
                  {shop.whatsappNumber || "No configurado"}
                </Text>
                <Button url="/app/settings" size="slim">
                  {shop.whatsappNumber ? "Cambiar número" : "Configurar"}
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Estado</Text>
                <InlineStack gap="200" align="start">
                  <Badge tone={setupComplete ? "success" : "attention"}>
                    {setupComplete ? "Activo" : "Pendiente"}
                  </Badge>
                </InlineStack>
                <Text as="p" variant="bodySm" tone="subdued">
                  {setupComplete
                    ? "Tu formulario COD está listo para recibir pedidos"
                    : "Configura WhatsApp para activar"}
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Recent Orders */}
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">Últimos pedidos</Text>
                  <Button url="/app/orders" variant="plain">Ver todos</Button>
                </InlineStack>
                <Divider />
                {recentOrders.length === 0 ? (
                  <Box padding="400">
                    <BlockStack gap="200" inlineAlign="center">
                      <Text as="p" tone="subdued">
                        No hay pedidos todavía
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        Los pedidos aparecerán aquí cuando los clientes completen el formulario COD
                      </Text>
                    </BlockStack>
                  </Box>
                ) : (
                  <BlockStack gap="300">
                    {recentOrders.map((order) => (
                      <Box key={order.id} padding="200">
                        <InlineStack align="space-between" blockAlign="center">
                          <BlockStack gap="100">
                            <Text as="p" variant="bodyMd" fontWeight="semibold">
                              {order.customerName}
                            </Text>
                            <Text as="p" variant="bodySm" tone="subdued">
                              {order.productTitle} × {order.quantity}
                            </Text>
                          </BlockStack>
                          <BlockStack gap="100" inlineAlign="end">
                            <Text as="p" variant="bodyMd" fontWeight="semibold">
                              {order.currency} {Number(order.total).toFixed(2)}
                            </Text>
                            <Badge
                              tone={
                                order.status === "DELIVERED" ? "success" :
                                order.status === "CANCELLED" ? "critical" :
                                "info"
                              }
                            >
                              {order.status}
                            </Badge>
                          </BlockStack>
                        </InlineStack>
                      </Box>
                    ))}
                  </BlockStack>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Quick Setup */}
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Configuración rápida</Text>
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text as="span">1. WhatsApp</Text>
                    <Badge tone={shop.whatsappNumber ? "success" : "attention"}>
                      {shop.whatsappNumber ? "✓" : "Pendiente"}
                    </Badge>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text as="span">2. Activar bloque</Text>
                    <Badge tone="info">Ver guía</Badge>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text as="span">3. Probar formulario</Text>
                    <Badge tone="info">Opcional</Badge>
                  </InlineStack>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
