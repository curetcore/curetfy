# Fase 3: Escalamiento y Features Avanzados

> Objetivo: Expandir funcionalidades para competir con Releasit y aumentar revenue.

## Timeline

| Mes | Objetivo |
|-----|----------|
| 1-2 | Upsells y Quantity Offers |
| 3 | Integraciones (Sheets, Pixel) |
| 4 | Analytics avanzado |
| 5 | Multi-WhatsApp y A/B Testing |
| 6+ | Expansión y optimización |

---

## 1. Sistema de Upsells

### 1.1 Tipos de Upsells

| Tipo | Descripción | Implementación |
|------|-------------|----------------|
| **Pre-purchase** | Mostrar antes de confirmar | En el formulario modal |
| **One-tick** | Checkbox para agregar producto | Checkbox en form |
| **Quantity Offer** | Descuento por cantidad | Select con precios |
| **Downsell** | Si rechaza upsell, ofrecer alternativa | Lógica condicional |

### 1.2 Schema de Base de Datos

```prisma
// prisma/schema.prisma - Extensiones Fase 3

model Upsell {
  id              String    @id @default(cuid())
  shopId          String
  shop            Shop      @relation(fields: [shopId], references: [id], onDelete: Cascade)

  name            String
  type            UpsellType
  active          Boolean   @default(true)

  // Producto del upsell
  productId       String
  productTitle    String
  productImage    String?
  variantId       String?

  // Configuración
  discountType    DiscountType @default(PERCENTAGE)
  discountValue   Decimal   @default(0)
  displayText     String    // "Agrega X por solo $Y"

  // Targeting
  triggerProducts String[]  // Productos que activan el upsell
  triggerCollections String[]
  minCartTotal    Decimal?
  maxCartTotal    Decimal?

  // Downsell (si aplica)
  downsellId      String?
  downsell        Upsell?   @relation("UpsellDownsell", fields: [downsellId], references: [id])
  parentUpsell    Upsell?   @relation("UpsellDownsell")

  // Analytics
  impressions     Int       @default(0)
  conversions     Int       @default(0)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([shopId, active])
}

model QuantityOffer {
  id              String    @id @default(cuid())
  shopId          String
  shop            Shop      @relation(fields: [shopId], references: [id], onDelete: Cascade)

  name            String
  active          Boolean   @default(true)

  // Configuración de tiers
  tiers           Json      // [{ quantity: 2, discountPercent: 10, label: "2x - 10% OFF" }]

  // Targeting
  products        String[]
  collections     String[]
  applyToAll      Boolean   @default(false)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum UpsellType {
  PRE_PURCHASE
  ONE_TICK
  POST_PURCHASE
}

enum DiscountType {
  PERCENTAGE
  FIXED_AMOUNT
  FREE_SHIPPING
}
```

### 1.3 UI de Upsells en Formulario

```liquid
{% comment %} extensions/cod-form/blocks/cod-button.liquid - Sección Upsells {% endcomment %}

<div class="curetfy-upsells" style="display: none;">
  <div class="curetfy-upsell-header">
    <span class="curetfy-upsell-badge">Oferta especial</span>
  </div>

  <div class="curetfy-upsell-item" data-upsell-id="">
    <div class="curetfy-upsell-image">
      <img src="" alt="">
    </div>
    <div class="curetfy-upsell-info">
      <p class="curetfy-upsell-title"></p>
      <p class="curetfy-upsell-price">
        <span class="curetfy-upsell-original"></span>
        <span class="curetfy-upsell-discount"></span>
      </p>
    </div>
    <label class="curetfy-upsell-checkbox">
      <input type="checkbox" name="upsell" value="">
      <span class="curetfy-checkmark"></span>
    </label>
  </div>
</div>

{% comment %} Quantity Offers {% endcomment %}
<div class="curetfy-quantity-offers" style="display: none;">
  <label>Cantidad:</label>
  <div class="curetfy-quantity-options">
    {% comment %} Populated by JS {% endcomment %}
  </div>
</div>
```

### 1.4 Dashboard de Upsells

```tsx
// app/routes/app.upsells.tsx

import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import {
  Page,
  Layout,
  Card,
  ResourceList,
  ResourceItem,
  Text,
  Badge,
  Button,
  BlockStack,
  InlineStack,
  Thumbnail,
  EmptyState,
} from "@shopify/polaris";
import { authenticate } from "~/shopify.server";
import { prisma } from "~/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);

  const shop = await prisma.shop.findUnique({
    where: { shopDomain: session.shop },
    include: {
      upsells: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return json({ upsells: shop?.upsells || [] });
}

export default function Upsells() {
  const { upsells } = useLoaderData<typeof loader>();

  if (upsells.length === 0) {
    return (
      <Page
        title="Upsells"
        primaryAction={{
          content: "Crear upsell",
          url: "/app/upsells/new",
        }}
      >
        <Card>
          <EmptyState
            heading="Aumenta tus ventas con upsells"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            action={{
              content: "Crear primer upsell",
              url: "/app/upsells/new",
            }}
          >
            <p>
              Los upsells pueden aumentar tu ticket promedio hasta un 30%.
              Ofrece productos complementarios en el formulario de compra.
            </p>
          </EmptyState>
        </Card>
      </Page>
    );
  }

  return (
    <Page
      title="Upsells"
      primaryAction={{
        content: "Crear upsell",
        url: "/app/upsells/new",
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <ResourceList
              items={upsells}
              renderItem={(upsell) => (
                <ResourceItem
                  id={upsell.id}
                  url={`/app/upsells/${upsell.id}`}
                  media={
                    <Thumbnail
                      source={upsell.productImage || ""}
                      alt={upsell.productTitle}
                    />
                  }
                >
                  <InlineStack align="space-between">
                    <BlockStack gap="100">
                      <Text variant="bodyMd" fontWeight="bold">
                        {upsell.name}
                      </Text>
                      <Text variant="bodySm" tone="subdued">
                        {upsell.productTitle}
                      </Text>
                    </BlockStack>
                    <InlineStack gap="200">
                      <Badge tone={upsell.active ? "success" : "info"}>
                        {upsell.active ? "Activo" : "Inactivo"}
                      </Badge>
                      <Text variant="bodySm">
                        {upsell.conversions}/{upsell.impressions} conv.
                      </Text>
                    </InlineStack>
                  </InlineStack>
                </ResourceItem>
              )}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

---

## 2. Integración Google Sheets

### 2.1 OAuth con Google

```tsx
// app/lib/google-sheets.server.ts

import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.HOST}/api/google/callback`
);

export function getGoogleAuthUrl(shopId: string) {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/spreadsheets",
    ],
    state: shopId,
  });
}

export async function appendToSheet(
  accessToken: string,
  spreadsheetId: string,
  order: any
) {
  oauth2Client.setCredentials({ access_token: accessToken });

  const sheets = google.sheets({ version: "v4", auth: oauth2Client });

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Órdenes!A:J",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        new Date().toISOString(),
        order.shopifyOrderNumber,
        order.customerName,
        order.customerPhone,
        order.customerAddress,
        order.customerProvince,
        order.productTitle,
        order.quantity,
        order.total,
        order.status,
      ]],
    },
  });
}
```

### 2.2 Configuración en Dashboard

```tsx
// app/routes/app.integrations.google-sheets.tsx

import { useState } from "react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Button,
  TextField,
  Banner,
} from "@shopify/polaris";

export default function GoogleSheetsIntegration() {
  const { shop } = useLoaderData<typeof loader>();
  const [spreadsheetId, setSpreadsheetId] = useState(shop.googleSpreadsheetId || "");

  const isConnected = !!shop.googleAccessToken;

  return (
    <Page
      title="Google Sheets"
      backAction={{ content: "Integraciones", url: "/app/integrations" }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Exportar órdenes a Google Sheets
              </Text>

              {!isConnected ? (
                <>
                  <Text>
                    Conecta tu cuenta de Google para exportar órdenes
                    automáticamente a una hoja de cálculo.
                  </Text>
                  <Button
                    url={`/api/google/auth?shop=${shop.id}`}
                    external
                  >
                    Conectar Google
                  </Button>
                </>
              ) : (
                <>
                  <Banner status="success">
                    Google conectado correctamente
                  </Banner>

                  <TextField
                    label="ID del Spreadsheet"
                    value={spreadsheetId}
                    onChange={setSpreadsheetId}
                    helpText="Encuentra el ID en la URL de tu spreadsheet"
                    placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  />

                  <Button submit>Guardar</Button>
                </>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

---

## 3. Facebook Pixel (Web Pixel Extension)

### 3.1 Web Pixel Extension (Requerido para Built for Shopify)

```tsx
// extensions/web-pixel/src/index.ts

import { register } from "@shopify/web-pixels-extension";

register(({ analytics, browser, settings }) => {
  // Inicializar Facebook Pixel
  const pixelId = settings.facebookPixelId;

  if (!pixelId) return;

  // Cargar SDK de Facebook
  browser.load(`https://connect.facebook.net/en_US/fbevents.js`).then(() => {
    fbq("init", pixelId);
    fbq("track", "PageView");
  });

  // Eventos estándar de Shopify
  analytics.subscribe("page_viewed", (event) => {
    fbq("track", "PageView");
  });

  analytics.subscribe("product_viewed", (event) => {
    const { productVariant } = event.data;
    fbq("track", "ViewContent", {
      content_ids: [productVariant.id],
      content_name: productVariant.title,
      content_type: "product",
      value: productVariant.price.amount,
      currency: productVariant.price.currencyCode,
    });
  });

  analytics.subscribe("product_added_to_cart", (event) => {
    const { cartLine } = event.data;
    fbq("track", "AddToCart", {
      content_ids: [cartLine.merchandise.id],
      content_name: cartLine.merchandise.title,
      content_type: "product",
      value: cartLine.cost.totalAmount.amount,
      currency: cartLine.cost.totalAmount.currencyCode,
    });
  });

  // Evento custom para COD Form
  analytics.subscribe("curetfy_order_created", (event) => {
    const { order } = event.data;
    fbq("track", "Purchase", {
      content_ids: [order.productId],
      content_name: order.productTitle,
      content_type: "product",
      value: order.total,
      currency: order.currency,
      num_items: order.quantity,
    });
  });
});
```

### 3.2 Configuración del Pixel

```toml
# extensions/web-pixel/shopify.extension.toml

api_version = "2024-10"

[[extensions]]
type = "web_pixel"
name = "Curetfy Pixel"
handle = "curetfy-pixel"

[extensions.settings]
  [[extensions.settings.fields]]
  key = "facebookPixelId"
  name = "Facebook Pixel ID"
  description = "Tu ID de Facebook Pixel"
  type = "single_line_text_field"
```

---

## 4. Analytics Dashboard

### 4.1 Métricas Clave

```tsx
// app/routes/app.analytics.tsx

import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  DataTable,
} from "@shopify/polaris";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);

  const shop = await prisma.shop.findUnique({
    where: { shopDomain: session.shop },
  });

  // Métricas de los últimos 30 días
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const orders = await prisma.order.findMany({
    where: {
      shopId: shop?.id,
      createdAt: { gte: thirtyDaysAgo },
    },
    orderBy: { createdAt: "asc" },
  });

  const upsellStats = await prisma.upsell.aggregate({
    where: { shopId: shop?.id },
    _sum: {
      impressions: true,
      conversions: true,
    },
  });

  // Calcular métricas
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const conversionRate = upsellStats._sum.impressions
    ? (upsellStats._sum.conversions! / upsellStats._sum.impressions!) * 100
    : 0;

  // Datos para gráfico
  const chartData = groupOrdersByDay(orders);

  return json({
    totalOrders,
    totalRevenue,
    avgOrderValue,
    conversionRate,
    chartData,
  });
}

export default function Analytics() {
  const { totalOrders, totalRevenue, avgOrderValue, conversionRate, chartData } =
    useLoaderData<typeof loader>();

  return (
    <Page title="Analytics">
      <Layout>
        {/* KPI Cards */}
        <Layout.Section variant="oneQuarter">
          <Card>
            <BlockStack gap="200">
              <Text variant="bodySm" tone="subdued">Órdenes (30 días)</Text>
              <Text variant="heading2xl">{totalOrders}</Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneQuarter">
          <Card>
            <BlockStack gap="200">
              <Text variant="bodySm" tone="subdued">Revenue</Text>
              <Text variant="heading2xl">
                ${totalRevenue.toLocaleString()}
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneQuarter">
          <Card>
            <BlockStack gap="200">
              <Text variant="bodySm" tone="subdued">Ticket Promedio</Text>
              <Text variant="heading2xl">
                ${avgOrderValue.toFixed(2)}
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneQuarter">
          <Card>
            <BlockStack gap="200">
              <Text variant="bodySm" tone="subdued">Conv. Upsells</Text>
              <Text variant="heading2xl">
                {conversionRate.toFixed(1)}%
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Chart */}
        <Layout.Section>
          <Card title="Órdenes por día">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#5c6ac4"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

---

## 5. Multi-WhatsApp

### 5.1 Múltiples Números por Tienda

```prisma
// prisma/schema.prisma

model WhatsAppNumber {
  id              String    @id @default(cuid())
  shopId          String
  shop            Shop      @relation(fields: [shopId], references: [id], onDelete: Cascade)

  phone           String
  label           String    // "Ventas", "Soporte", etc.
  isDefault       Boolean   @default(false)

  // Routing rules
  products        String[]  // Productos asignados a este número
  collections     String[]
  countries       String[]

  createdAt       DateTime  @default(now())

  @@index([shopId])
}
```

### 5.2 Lógica de Routing

```tsx
// app/lib/whatsapp-routing.server.ts

export async function getWhatsAppNumber(
  shopId: string,
  order: {
    productId: string;
    collectionIds: string[];
    country: string;
  }
): Promise<string> {
  // Buscar número específico para el producto
  let number = await prisma.whatsAppNumber.findFirst({
    where: {
      shopId,
      products: { has: order.productId },
    },
  });

  if (number) return number.phone;

  // Buscar por colección
  number = await prisma.whatsAppNumber.findFirst({
    where: {
      shopId,
      collections: { hasSome: order.collectionIds },
    },
  });

  if (number) return number.phone;

  // Buscar por país
  number = await prisma.whatsAppNumber.findFirst({
    where: {
      shopId,
      countries: { has: order.country },
    },
  });

  if (number) return number.phone;

  // Usar número default
  number = await prisma.whatsAppNumber.findFirst({
    where: { shopId, isDefault: true },
  });

  return number?.phone || "";
}
```

---

## 6. A/B Testing

### 6.1 Sistema de Experimentos

```prisma
model Experiment {
  id              String    @id @default(cuid())
  shopId          String
  shop            Shop      @relation(fields: [shopId], references: [id], onDelete: Cascade)

  name            String
  type            ExperimentType
  status          ExperimentStatus @default(DRAFT)

  // Variantes
  variants        Json      // [{ id, name, weight, config }]

  // Resultados
  startedAt       DateTime?
  endedAt         DateTime?
  winnerVariant   String?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model ExperimentEvent {
  id              String    @id @default(cuid())
  experimentId    String
  variantId       String
  visitorId       String
  eventType       String    // "impression", "conversion"
  metadata        Json?

  createdAt       DateTime  @default(now())

  @@index([experimentId, variantId])
}

enum ExperimentType {
  BUTTON_TEXT
  BUTTON_COLOR
  FORM_LAYOUT
  UPSELL
}

enum ExperimentStatus {
  DRAFT
  RUNNING
  PAUSED
  COMPLETED
}
```

### 6.2 Asignación de Variantes

```tsx
// app/lib/ab-testing.server.ts

import crypto from "crypto";

export function assignVariant(
  experimentId: string,
  visitorId: string,
  variants: Array<{ id: string; weight: number }>
): string {
  // Deterministic assignment based on visitor + experiment
  const hash = crypto
    .createHash("md5")
    .update(`${experimentId}:${visitorId}`)
    .digest("hex");

  const hashValue = parseInt(hash.substring(0, 8), 16) / 0xffffffff;

  let cumulativeWeight = 0;
  for (const variant of variants) {
    cumulativeWeight += variant.weight;
    if (hashValue <= cumulativeWeight) {
      return variant.id;
    }
  }

  return variants[0].id;
}

export async function trackExperimentEvent(
  experimentId: string,
  variantId: string,
  visitorId: string,
  eventType: "impression" | "conversion"
) {
  await prisma.experimentEvent.create({
    data: {
      experimentId,
      variantId,
      visitorId,
      eventType,
    },
  });
}
```

---

## 7. Expansión Regional

### 7.1 Provincias/Estados por País

```tsx
// app/lib/regions.ts

export const LATAM_REGIONS: Record<string, Array<{ code: string; name: string }>> = {
  DO: [
    { code: "DN", name: "Distrito Nacional" },
    { code: "SD", name: "Santo Domingo" },
    { code: "SC", name: "Santiago" },
    { code: "LP", name: "La Vega" },
    { code: "PP", name: "Puerto Plata" },
    { code: "SJ", name: "San Juan" },
    { code: "DU", name: "Duarte" },
    { code: "SP", name: "San Pedro de Macorís" },
    { code: "RO", name: "La Romana" },
    { code: "SE", name: "San Cristóbal" },
    // ... más provincias
  ],
  CO: [
    { code: "BOG", name: "Bogotá D.C." },
    { code: "ANT", name: "Antioquia" },
    { code: "VAC", name: "Valle del Cauca" },
    { code: "ATL", name: "Atlántico" },
    { code: "SAN", name: "Santander" },
    // ... más departamentos
  ],
  MX: [
    { code: "CMX", name: "Ciudad de México" },
    { code: "JAL", name: "Jalisco" },
    { code: "NLE", name: "Nuevo León" },
    { code: "PUE", name: "Puebla" },
    // ... más estados
  ],
  // Más países...
};

export function getRegionsForCountry(countryCode: string) {
  return LATAM_REGIONS[countryCode] || [];
}
```

---

## 8. API Pública (Plan Unlimited)

### 8.1 API REST para Merchants

```tsx
// app/routes/api.v1.orders.tsx

import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { validateApiKey } from "~/lib/api-auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const shop = await validateApiKey(request);

  if (!shop) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (shop.plan !== "UNLIMITED") {
    return json({ error: "API access requires Unlimited plan" }, { status: 403 });
  }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");

  const orders = await prisma.order.findMany({
    where: { shopId: shop.id },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const total = await prisma.order.count({
    where: { shopId: shop.id },
  });

  return json({
    orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  // POST: Crear orden vía API
  // PUT: Actualizar estado de orden
  // DELETE: Cancelar orden
}
```

---

## 9. Roadmap de Features

### 9.1 Prioridad Alta

| Feature | Impacto en Revenue | Complejidad |
|---------|-------------------|-------------|
| Upsells One-Tick | Alto | Media |
| Quantity Offers | Alto | Baja |
| Google Sheets | Medio | Media |
| Facebook Pixel | Medio | Media |

### 9.2 Prioridad Media

| Feature | Impacto en Revenue | Complejidad |
|---------|-------------------|-------------|
| Multi-WhatsApp | Medio | Baja |
| Analytics | Bajo | Media |
| A/B Testing | Medio | Alta |
| TikTok Pixel | Bajo | Baja |

### 9.3 Prioridad Baja (Futuro)

| Feature | Notas |
|---------|-------|
| App móvil para merchants | Gestionar pedidos desde celular |
| Integración con shipping | Calculadora de envío en vivo |
| Chat widget | Alternativa a WhatsApp |
| SMS fallback | Para países sin WhatsApp |

---

## 10. Métricas de Éxito Fase 3

| Métrica | Objetivo 6 meses |
|---------|------------------|
| Instalaciones activas | 500+ |
| Revenue mensual (MRR) | $5,000+ |
| Conversion rate upsells | 15%+ |
| Churn rate | <5% |
| Reviews positivos | 50+ (4.5+ stars) |
| Ticket promedio aumentado | +20% |
