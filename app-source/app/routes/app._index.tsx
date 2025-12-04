import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
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
  Box,
  Divider,
  Icon,
  DataTable,
} from "@shopify/polaris";
import {
  SettingsIcon,
  PhoneIcon,
  CodeIcon,
  ChartVerticalFilledIcon,
  OrderIcon,
  CashDollarIcon,
  TargetIcon,
} from "@shopify/polaris-icons";
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

  // Get orders last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const ordersLast7Days = await prisma.order.count({
    where: {
      shopId: shop.id,
      createdAt: { gte: sevenDaysAgo },
    },
  });

  // Get revenue last 7 days
  const revenueData = await prisma.order.aggregate({
    where: {
      shopId: shop.id,
      createdAt: { gte: sevenDaysAgo },
    },
    _sum: { total: true },
  });

  const revenueLast7Days = revenueData._sum.total || 0;

  // Get total revenue
  const totalRevenueData = await prisma.order.aggregate({
    where: { shopId: shop.id },
    _sum: { total: true },
  });
  const totalRevenue = totalRevenueData._sum.total || 0;

  // Calculate stats
  const orderLimit = PLAN_LIMITS[shop.plan] || 60;
  const usagePercentage = orderLimit === Infinity ? 0 : Math.round((ordersThisMonth / orderLimit) * 100);

  // Mock form opens for now (would need real tracking)
  const formOpensLast7Days = Math.round(ordersLast7Days * 10); // Estimate ~10% conversion
  const conversionRate = formOpensLast7Days > 0 ? ((ordersLast7Days / formOpensLast7Days) * 100).toFixed(1) : "0.0";

  return json({
    shop: {
      ...shop,
      ordersThisMonth,
    },
    stats: {
      ordersLast7Days,
      formOpensLast7Days,
      revenueLast7Days: Number(revenueLast7Days),
      conversionRate,
      totalRevenue: Number(totalRevenue),
    },
    orderLimit,
    usagePercentage,
    setupComplete: !!shop.whatsappNumber,
  });
};

export default function Dashboard() {
  const { shop, stats, orderLimit, usagePercentage, setupComplete } = useLoaderData<typeof loader>();

  const currency = "DOP"; // Would get from shop settings

  return (
    <Page>
      <TitleBar title="Dashboard" />
      <BlockStack gap="500">
        {/* Setup Banner */}
        {!setupComplete && (
          <Banner
            title="Completa la configuración"
            tone="warning"
            action={{ content: "Configurar WhatsApp", url: "/app/settings" }}
          >
            <p>Agrega tu número de WhatsApp para empezar a recibir pedidos COD.</p>
          </Banner>
        )}

        {/* Installation Guide */}
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between" blockAlign="center">
              <BlockStack gap="100">
                <Text as="h2" variant="headingLg">Curetfy COD Form</Text>
                <Text as="p" tone="subdued">Tu formulario de pago contra entrega con WhatsApp</Text>
              </BlockStack>
              <Badge tone={setupComplete ? "success" : "attention"}>
                {setupComplete ? "Activo" : "Configuración pendiente"}
              </Badge>
            </InlineStack>
            <Divider />
            <InlineStack gap="300" wrap>
              <Button url={`https://${shop.shopDomain}/admin/themes/current/editor`} external>
                Instalar en tema
              </Button>
              <Button url="/app/settings" variant="secondary">
                Configurar formulario
              </Button>
            </InlineStack>
          </BlockStack>
        </Card>

        {/* Quick Access Links */}
        <Layout>
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300">
                <InlineStack gap="200" blockAlign="center">
                  <Icon source={PhoneIcon} tone="base" />
                  <Text as="h3" variant="headingMd">WhatsApp</Text>
                </InlineStack>
                <Text as="p" variant="headingLg" fontWeight="semibold">
                  {shop.whatsappNumber || "No configurado"}
                </Text>
                <Button url="/app/settings" size="slim" variant="secondary">
                  {shop.whatsappNumber ? "Cambiar número" : "Configurar"}
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300">
                <InlineStack gap="200" blockAlign="center">
                  <Icon source={SettingsIcon} tone="base" />
                  <Text as="h3" variant="headingMd">Formulario</Text>
                </InlineStack>
                <Text as="p" variant="bodySm" tone="subdued">
                  Personaliza campos, colores y mensajes
                </Text>
                <Button url="/app/settings" size="slim" variant="secondary">
                  Editar formulario
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300">
                <InlineStack gap="200" blockAlign="center">
                  <Icon source={CodeIcon} tone="base" />
                  <Text as="h3" variant="headingMd">Facebook Pixel</Text>
                </InlineStack>
                <Text as="p" variant="bodySm" tone="subdued">
                  {shop.enablePixel && shop.pixelId ? `ID: ${shop.pixelId}` : "No configurado"}
                </Text>
                <Button url="/app/settings?tab=4" size="slim" variant="secondary">
                  Configurar Pixel
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Stats Summary - Last 7 Days */}
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">Últimos 7 días</Text>
            <Layout>
              <Layout.Section variant="oneQuarter">
                <BlockStack gap="200">
                  <InlineStack gap="200" blockAlign="center">
                    <Icon source={ChartVerticalFilledIcon} tone="info" />
                    <Text as="span" tone="subdued">Aberturas de formulario</Text>
                  </InlineStack>
                  <Text as="p" variant="heading2xl" fontWeight="bold">
                    {stats.formOpensLast7Days}
                  </Text>
                </BlockStack>
              </Layout.Section>
              <Layout.Section variant="oneQuarter">
                <BlockStack gap="200">
                  <InlineStack gap="200" blockAlign="center">
                    <Icon source={OrderIcon} tone="success" />
                    <Text as="span" tone="subdued">Pedidos</Text>
                  </InlineStack>
                  <Text as="p" variant="heading2xl" fontWeight="bold">
                    {stats.ordersLast7Days}
                  </Text>
                </BlockStack>
              </Layout.Section>
              <Layout.Section variant="oneQuarter">
                <BlockStack gap="200">
                  <InlineStack gap="200" blockAlign="center">
                    <Icon source={CashDollarIcon} tone="success" />
                    <Text as="span" tone="subdued">Ingresos</Text>
                  </InlineStack>
                  <Text as="p" variant="heading2xl" fontWeight="bold">
                    {currency} {stats.revenueLast7Days.toLocaleString()}
                  </Text>
                </BlockStack>
              </Layout.Section>
              <Layout.Section variant="oneQuarter">
                <BlockStack gap="200">
                  <InlineStack gap="200" blockAlign="center">
                    <Icon source={TargetIcon} tone="warning" />
                    <Text as="span" tone="subdued">Tasa de conversión</Text>
                  </InlineStack>
                  <Text as="p" variant="heading2xl" fontWeight="bold">
                    {stats.conversionRate}%
                  </Text>
                </BlockStack>
              </Layout.Section>
            </Layout>
          </BlockStack>
        </Card>

        {/* Analytics Charts - Placeholder */}
        <Layout>
          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Aberturas de formulario</Text>
                <Box padding="800" background="bg-surface-secondary" borderRadius="200">
                  <BlockStack gap="200" inlineAlign="center">
                    <Text as="p" variant="heading2xl" fontWeight="bold">{stats.formOpensLast7Days}</Text>
                    <Text as="p" tone="subdued" variant="bodySm">
                      Próximamente: Gráfico de tendencias
                    </Text>
                  </BlockStack>
                </Box>
                <Text as="p" variant="bodySm" tone="subdued">
                  Las fechas en este gráfico usan la zona horaria UTC.
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Pedidos</Text>
                <Box padding="800" background="bg-surface-secondary" borderRadius="200">
                  <BlockStack gap="200" inlineAlign="center">
                    <Text as="p" variant="heading2xl" fontWeight="bold">{stats.ordersLast7Days}</Text>
                    <Text as="p" tone="subdued" variant="bodySm">
                      Próximamente: Gráfico de tendencias
                    </Text>
                  </BlockStack>
                </Box>
                <Text as="p" variant="bodySm" tone="subdued">
                  Las fechas en este gráfico usan la zona horaria UTC.
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        <Layout>
          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Ingresos</Text>
                <Box padding="800" background="bg-surface-secondary" borderRadius="200">
                  <BlockStack gap="200" inlineAlign="center">
                    <Text as="p" variant="heading2xl" fontWeight="bold">
                      {currency} {stats.revenueLast7Days.toLocaleString()}
                    </Text>
                    <Text as="p" tone="subdued" variant="bodySm">
                      Próximamente: Gráfico de tendencias
                    </Text>
                  </BlockStack>
                </Box>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Tasa de conversión</Text>
                <Box padding="800" background="bg-surface-secondary" borderRadius="200">
                  <BlockStack gap="200" inlineAlign="center">
                    <Text as="p" variant="heading2xl" fontWeight="bold">{stats.conversionRate}%</Text>
                    <Text as="p" tone="subdued" variant="bodySm">
                      Próximamente: Gráfico de tendencias
                    </Text>
                  </BlockStack>
                </Box>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Total Revenue Banner */}
        <Card>
          <InlineStack align="center" blockAlign="center" gap="200">
            <Text as="p" tone="subdued">Total generado con Curetfy:</Text>
            <Text as="p" variant="headingLg" fontWeight="bold" tone="success">
              {currency} {stats.totalRevenue.toLocaleString()}
            </Text>
          </InlineStack>
        </Card>

        {/* Plan Usage */}
        <Layout>
          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">Plan actual</Text>
                  <Badge tone={shop.plan === "FREE" ? "info" : "success"}>
                    {shop.plan}
                  </Badge>
                </InlineStack>
                {orderLimit !== Infinity && (
                  <BlockStack gap="200">
                    <Box
                      background="bg-surface-secondary"
                      borderRadius="200"
                      padding="200"
                    >
                      <div
                        style={{
                          width: `${Math.min(usagePercentage, 100)}%`,
                          height: "8px",
                          background: usagePercentage > 80 ? "#d72c0d" : "#008060",
                          borderRadius: "4px",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </Box>
                    <InlineStack align="space-between">
                      <Text as="p" variant="bodySm" tone="subdued">
                        {shop.ordersThisMonth} de {orderLimit} órdenes este mes
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        {usagePercentage}%
                      </Text>
                    </InlineStack>
                  </BlockStack>
                )}
                {orderLimit === Infinity && (
                  <Text as="p" variant="bodySm" tone="subdued">Órdenes ilimitadas</Text>
                )}
                <Button url="/app/billing">Ver planes de facturación</Button>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Recursos</Text>
                <BlockStack gap="200">
                  <Button url="https://help.curetcore.com" external variant="plain" textAlign="start">
                    Centro de ayuda
                  </Button>
                  <Button url="https://curetcore.com/contact" external variant="plain" textAlign="start">
                    Contactar soporte
                  </Button>
                  <Button url="https://curetcore.com/utm-guide" external variant="plain" textAlign="start">
                    Cómo usar UTM para rastrear campañas
                  </Button>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
