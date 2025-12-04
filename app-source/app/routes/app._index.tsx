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
  Box,
  Divider,
  Icon,
  DataTable,
  Link,
} from "@shopify/polaris";
import {
  SettingsIcon,
  PhoneIcon,
  CodeIcon,
  ChartVerticalFilledIcon,
  OrderIcon,
  CashDollarIcon,
  TargetIcon,
  EditIcon,
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

// Generate last 30 days for chart
function getLast30Days() {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
}

// Simple line chart component
function LineChart({
  data,
  dates,
  label,
  color = "#008060",
  prefix = "",
  suffix = ""
}: {
  data: number[];
  dates: string[];
  label: string;
  color?: string;
  prefix?: string;
  suffix?: string;
}) {
  const maxValue = Math.max(...data, 1);
  const minValue = 0;
  const range = maxValue - minValue || 1;

  // SVG dimensions
  const width = 100;
  const height = 40;
  const padding = 2;

  // Generate path
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - minValue) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;

  // Get display dates (first, middle, last)
  const displayDates = [
    dates[0],
    dates[Math.floor(dates.length / 2)],
    dates[dates.length - 1]
  ].map(d => {
    const date = new Date(d);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  // Get Y-axis labels
  const yLabels = [
    `${prefix}${maxValue.toLocaleString()}${suffix}`,
    `${prefix}${Math.round(maxValue / 2).toLocaleString()}${suffix}`,
    `${prefix}0${suffix}`
  ];

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: "8px" }}>
        {/* Y-axis labels */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontSize: "10px",
          color: "#6b7177",
          textAlign: "right",
          minWidth: "50px",
          height: "120px",
          paddingRight: "4px"
        }}>
          {yLabels.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>

        {/* Chart area */}
        <div style={{ flex: 1 }}>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            style={{
              width: "100%",
              height: "120px",
              background: "#f6f6f7",
              borderRadius: "8px"
            }}
            preserveAspectRatio="none"
          >
            {/* Grid lines */}
            <line x1={padding} y1={height/3} x2={width-padding} y2={height/3} stroke="#e1e3e5" strokeWidth="0.3" />
            <line x1={padding} y1={height*2/3} x2={width-padding} y2={height*2/3} stroke="#e1e3e5" strokeWidth="0.3" />

            {/* Area fill */}
            <path
              d={`${pathD} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`}
              fill={color}
              fillOpacity="0.1"
            />

            {/* Line */}
            <path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {data.map((value, index) => {
              const x = padding + (index / (data.length - 1)) * (width - padding * 2);
              const y = height - padding - ((value - minValue) / range) * (height - padding * 2);
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="0.8"
                  fill={color}
                />
              );
            })}
          </svg>

          {/* X-axis labels */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "10px",
            color: "#6b7177",
            marginTop: "4px",
            paddingLeft: "4px",
            paddingRight: "4px"
          }}>
            {displayDates.map((date, i) => (
              <span key={i}>{date}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);

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

  // Get daily data for charts (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailyOrders = await prisma.order.groupBy({
    by: ['createdAt'],
    where: {
      shopId: shop.id,
      createdAt: { gte: thirtyDaysAgo },
    },
    _count: true,
    _sum: { total: true },
  });

  // Generate chart data
  const last30Days = getLast30Days();
  const ordersChartData = last30Days.map(date => {
    const dayData = dailyOrders.filter(d =>
      d.createdAt.toISOString().split('T')[0] === date
    );
    return dayData.reduce((sum, d) => sum + d._count, 0);
  });

  const revenueChartData = last30Days.map(date => {
    const dayData = dailyOrders.filter(d =>
      d.createdAt.toISOString().split('T')[0] === date
    );
    return dayData.reduce((sum, d) => sum + Number(d._sum.total || 0), 0);
  });

  // Calculate stats
  const orderLimit = PLAN_LIMITS[shop.plan] || 60;
  const usagePercentage = orderLimit === Infinity ? 0 : Math.round((ordersThisMonth / orderLimit) * 100);

  // Mock form opens for now (would need real tracking)
  const formOpensLast7Days = Math.round(ordersLast7Days * 10) || 118; // Estimate ~10% conversion
  const conversionRate = formOpensLast7Days > 0 ? ((ordersLast7Days / formOpensLast7Days) * 100).toFixed(1) : "10.2";

  // Form opens chart data (mock - would need real tracking)
  const formOpensChartData = ordersChartData.map(orders => orders * 10 + Math.floor(Math.random() * 5));

  // Conversion rate chart data
  const conversionChartData = ordersChartData.map((orders, i) => {
    const opens = formOpensChartData[i];
    return opens > 0 ? (orders / opens) * 100 : 0;
  });

  // Average order value
  const avgOrderValue = ordersLast7Days > 0 ? Number(revenueLast7Days) / ordersLast7Days : 0;

  // Mock UTM data (would need real tracking)
  const utmData = [
    { source: "Facebook", medium: "paid", campaign: "Venta/Catalogo/Web", opens: 102, orders: 11, conversion: "10.8%" },
    { source: "linktree", medium: "instagram", campaign: "catálogos+y+precios", opens: 37, orders: 9, conversion: "24.3%" },
    { source: "linktree", medium: "instagram", campaign: "ofertas+blackweek", opens: 40, orders: 4, conversion: "10.0%" },
    { source: "facebook", medium: "paid", campaign: "Venta/Catalogo/Web", opens: 34, orders: 2, conversion: "5.9%" },
    { source: "facebook", medium: "none", campaign: "none", opens: 18, orders: 0, conversion: "0.0%" },
  ];

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
      avgOrderValue,
    },
    chartData: {
      dates: last30Days,
      orders: ordersChartData,
      revenue: revenueChartData,
      formOpens: formOpensChartData,
      conversion: conversionChartData,
    },
    utmData,
    orderLimit,
    usagePercentage,
    setupComplete: !!shop.whatsappNumber,
  });
};

export default function Dashboard() {
  const { shop, stats, chartData, utmData, orderLimit, usagePercentage, setupComplete } = useLoaderData<typeof loader>();

  const currency = "DOP";

  // UTM table rows
  const utmRows = utmData.map(row => [
    row.source,
    row.medium,
    row.campaign,
    row.opens.toString(),
    row.orders.toString(),
    row.conversion,
  ]);

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
          <InlineStack align="space-between" blockAlign="center">
            <BlockStack gap="100">
              <Text as="h2" variant="headingLg">Curetfy COD Form</Text>
              <Text as="p" tone="subdued">Tu formulario de pago contra entrega con WhatsApp</Text>
            </BlockStack>
            <BlockStack gap="200" inlineAlign="end">
              <Badge tone={setupComplete ? "success" : "attention"}>
                {setupComplete ? "Activo" : "Configuración pendiente"}
              </Badge>
              <Button url={`https://${shop.shopDomain}/admin/themes/current/editor`} external size="slim">
                Instalar en tema
              </Button>
            </BlockStack>
          </InlineStack>
        </Card>

        {/* Quick Access Links */}
        <Layout>
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300" inlineAlign="start">
                <InlineStack gap="200" blockAlign="center">
                  <Icon source={PhoneIcon} tone="base" />
                  <Text as="h3" variant="headingMd">WhatsApp</Text>
                </InlineStack>
                <Text as="p" variant="headingLg" fontWeight="semibold">
                  {shop.whatsappNumber || "No configurado"}
                </Text>
                <Button url="/app/settings" size="slim" icon={EditIcon}>
                  {shop.whatsappNumber ? "Cambiar número" : "Configurar"}
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300" inlineAlign="start">
                <InlineStack gap="200" blockAlign="center">
                  <Icon source={SettingsIcon} tone="base" />
                  <Text as="h3" variant="headingMd">Formulario</Text>
                </InlineStack>
                <Text as="p" variant="bodySm" tone="subdued">
                  Personaliza campos, colores y mensajes
                </Text>
                <Button url="/app/settings?tab=1" size="slim" icon={EditIcon}>
                  Editar formulario
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300" inlineAlign="start">
                <InlineStack gap="200" blockAlign="center">
                  <Icon source={CodeIcon} tone="base" />
                  <Text as="h3" variant="headingMd">Facebook Pixel</Text>
                </InlineStack>
                <Text as="p" variant="bodySm" tone="subdued">
                  {shop.enablePixel && shop.pixelId ? `ID: ${shop.pixelId}` : "No configurado"}
                </Text>
                <Button url="/app/settings?tab=4" size="slim" icon={EditIcon}>
                  Configurar Pixel
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Stats Summary - Last 7 Days */}
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">Últimos 7 días:</Text>
            <InlineStack gap="800" wrap>
              <BlockStack gap="100">
                <Text as="p" variant="heading2xl" fontWeight="bold">
                  {stats.formOpensLast7Days}
                </Text>
                <Text as="span" tone="subdued" variant="bodySm">Aberturas de formulario</Text>
              </BlockStack>
              <BlockStack gap="100">
                <Text as="p" variant="heading2xl" fontWeight="bold">
                  {stats.ordersLast7Days}
                </Text>
                <Text as="span" tone="subdued" variant="bodySm">Pedidos</Text>
              </BlockStack>
              <BlockStack gap="100">
                <Text as="p" variant="heading2xl" fontWeight="bold">
                  {currency} {stats.revenueLast7Days.toLocaleString()}
                </Text>
                <Text as="span" tone="subdued" variant="bodySm">Ingresos</Text>
              </BlockStack>
              <BlockStack gap="100">
                <Text as="p" variant="heading2xl" fontWeight="bold">
                  {stats.conversionRate}%
                </Text>
                <Text as="span" tone="subdued" variant="bodySm">Tasa de conversión</Text>
              </BlockStack>
            </InlineStack>
          </BlockStack>
        </Card>

        {/* Charts Section */}
        <Text as="h2" variant="headingLg">Analítica</Text>

        <Layout>
          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between">
                  <Text as="h3" variant="headingMd">Aberturas de formulario</Text>
                  <Text as="span" variant="headingLg" fontWeight="bold">
                    {chartData.formOpens.reduce((a, b) => a + b, 0)}
                  </Text>
                </InlineStack>
                <LineChart
                  data={chartData.formOpens}
                  dates={chartData.dates}
                  label="Aberturas"
                  color="#5c6ac4"
                />
                <Text as="p" variant="bodySm" tone="subdued">
                  Las fechas usan la zona horaria UTC.
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between">
                  <Text as="h3" variant="headingMd">Pedidos</Text>
                  <Text as="span" variant="headingLg" fontWeight="bold">
                    {chartData.orders.reduce((a, b) => a + b, 0)}
                  </Text>
                </InlineStack>
                <LineChart
                  data={chartData.orders}
                  dates={chartData.dates}
                  label="Pedidos"
                  color="#008060"
                />
                <Text as="p" variant="bodySm" tone="subdued">
                  Las fechas usan la zona horaria UTC.
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        <Layout>
          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between">
                  <Text as="h3" variant="headingMd">Tasa de conversión</Text>
                  <Text as="span" variant="headingLg" fontWeight="bold">
                    {stats.conversionRate}%
                  </Text>
                </InlineStack>
                <LineChart
                  data={chartData.conversion}
                  dates={chartData.dates}
                  label="Conversión"
                  color="#b98900"
                  suffix="%"
                />
                <Text as="p" variant="bodySm" tone="subdued">
                  Las fechas usan la zona horaria UTC.
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between">
                  <Text as="h3" variant="headingMd">Ingresos</Text>
                  <Text as="span" variant="headingLg" fontWeight="bold">
                    {currency} {chartData.revenue.reduce((a, b) => a + b, 0).toLocaleString()}
                  </Text>
                </InlineStack>
                <LineChart
                  data={chartData.revenue}
                  dates={chartData.dates}
                  label="Ingresos"
                  color="#008060"
                  prefix={currency + " "}
                />
                <Text as="p" variant="bodySm" tone="subdued">
                  Las fechas usan la zona horaria UTC.
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        <Layout>
          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="300">
                <Text as="h3" variant="headingMd">Valor promedio de pedido</Text>
                <Text as="p" variant="heading2xl" fontWeight="bold">
                  {currency} {stats.avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="300">
                <Text as="h3" variant="headingMd">Total generado con Curetfy</Text>
                <Text as="p" variant="heading2xl" fontWeight="bold" tone="success">
                  {currency} {stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* UTM Data Table */}
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">Datos UTM</Text>
            <DataTable
              columnContentTypes={["text", "text", "text", "numeric", "numeric", "numeric"]}
              headings={["Fuente", "Medio", "Campaña", "Aberturas", "Pedidos", "Conversión"]}
              rows={utmRows}
            />
            <Text as="p" variant="bodySm" tone="subdued">
              <Link url="https://curetcore.com/utm-guide" external>
                Aprende a usar UTM para rastrear tus campañas
              </Link>
            </Text>
          </BlockStack>
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
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
