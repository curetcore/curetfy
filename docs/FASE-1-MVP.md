# Fase 1: MVP (App Store Ready)

> Objetivo: Publicar la app en Shopify App Store con funcionalidades core.

## Timeline Estimado

| Semana | Entregable |
|--------|------------|
| 1 | Setup proyecto, OAuth, estructura base |
| 2 | Theme Extension (formulario), UI dashboard |
| 3 | Crear órdenes API, WhatsApp integration |
| 4 | Dashboard completo, configuraciones |
| 5 | Billing API, planes de pago |
| 6 | Testing, optimización, submit App Store |

---

## 1. Setup Inicial

### 1.1 Crear App en Shopify Partners

```bash
# Instalar Shopify CLI
npm install -g @shopify/cli@latest

# Crear app con template Remix
shopify app init --template remix

# Nombre: curetfy-cod-form
```

### 1.2 Configuración shopify.app.toml

```toml
name = "Curetfy - COD Form"
client_id = "YOUR_CLIENT_ID"
application_url = "https://app.curetcore.com"
embedded = true

[access_scopes]
scopes = "read_products,write_products,read_orders,write_orders,read_customers,write_customers,read_draft_orders,write_draft_orders"

[auth]
redirect_urls = [
  "https://app.curetcore.com/auth/callback",
  "https://app.curetcore.com/auth/shopify/callback"
]

[webhooks]
api_version = "2024-10"

  [[webhooks.subscriptions]]
  topics = ["app/uninstalled"]
  uri = "/webhooks/app-uninstalled"

  [[webhooks.subscriptions]]
  topics = ["customers/data_request"]
  uri = "/webhooks/customers-data-request"

  [[webhooks.subscriptions]]
  topics = ["customers/redact"]
  uri = "/webhooks/customers-redact"

  [[webhooks.subscriptions]]
  topics = ["shop/redact"]
  uri = "/webhooks/shop-redact"

[pos]
embedded = false

[[extensions]]
  type = "theme_app_extension"
  name = "COD Form"
  handle = "cod-form"
```

### 1.3 Variables de Entorno

```env
# .env
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SCOPES=read_products,write_products,read_orders,write_orders,read_customers,write_customers
HOST=https://app.curetcore.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/curetfy

# Redis (production)
REDIS_URL=redis://localhost:6379
```

---

## 2. Base de Datos

### 2.1 Schema Prisma

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Shop {
  id              String    @id @default(cuid())
  shopDomain      String    @unique
  accessToken     String

  // Configuración
  whatsappNumber  String?
  messageTemplate String?   @default("🛒 *Nuevo Pedido*\n\nProducto: {{product}}\nCantidad: {{quantity}}\nTotal: {{total}}\n\nCliente: {{name}}\nTeléfono: {{phone}}\nDirección: {{address}}\nProvincia: {{province}}")

  // Branding
  buttonText      String    @default("Comprar por WhatsApp")
  buttonColor     String    @default("#25D366")
  formTitle       String    @default("Completa tu pedido")

  // Settings
  enabledProducts String[]  @default([])
  enabledCollections String[] @default([])
  countries       String[]  @default(["DO", "CO", "MX", "PE", "CL", "AR"])

  // Billing
  plan            Plan      @default(FREE)
  ordersThisMonth Int       @default(0)
  billingCycleStart DateTime @default(now())

  // Relations
  orders          Order[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Order {
  id              String    @id @default(cuid())
  shopId          String
  shop            Shop      @relation(fields: [shopId], references: [id], onDelete: Cascade)

  // Shopify
  shopifyOrderId  String?
  shopifyOrderNumber String?

  // Customer Info
  customerName    String
  customerPhone   String
  customerAddress String
  customerProvince String
  customerCountry String    @default("DO")

  // Order Details
  productId       String
  productTitle    String
  productVariantId String?
  quantity        Int       @default(1)
  price           Decimal
  total           Decimal
  currency        String    @default("DOP")

  // Status
  status          OrderStatus @default(PENDING)
  whatsappSent    Boolean   @default(false)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([shopId, createdAt])
}

enum Plan {
  FREE
  PRO
  BUSINESS
  UNLIMITED
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}
```

### 2.2 Migraciones

```bash
# Crear migración inicial
npx prisma migrate dev --name init

# Generar cliente
npx prisma generate
```

---

## 3. Rutas de la Aplicación

### 3.1 Estructura de Rutas

```
app/routes/
├── app._index.tsx          # Dashboard principal
├── app.settings.tsx        # Configuración general
├── app.form-design.tsx     # Diseño del formulario
├── app.orders.tsx          # Lista de órdenes
├── app.orders.$id.tsx      # Detalle de orden
├── app.billing.tsx         # Planes y facturación
├── app.analytics.tsx       # Estadísticas básicas
├── api.create-order.tsx    # API para crear orden
├── api.config.tsx          # API para obtener config
├── webhooks.tsx            # Webhooks handler
└── auth.$.tsx              # OAuth routes
```

### 3.2 Dashboard Principal (app._index.tsx)

```tsx
import { json, type LoaderFunctionArgs } from "@remix-run/node";
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
} from "@shopify/polaris";
import { authenticate } from "~/shopify.server";
import { prisma } from "~/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);

  const shop = await prisma.shop.findUnique({
    where: { shopDomain: session.shop },
    include: {
      orders: {
        take: 5,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const ordersThisMonth = await prisma.order.count({
    where: {
      shopId: shop?.id,
      createdAt: {
        gte: shop?.billingCycleStart,
      },
    },
  });

  return json({
    shop,
    ordersThisMonth,
    orderLimit: getPlanLimit(shop?.plan || "FREE"),
  });
}

function getPlanLimit(plan: string): number {
  const limits: Record<string, number> = {
    FREE: 60,
    PRO: 500,
    BUSINESS: 2000,
    UNLIMITED: Infinity,
  };
  return limits[plan] || 60;
}

export default function Dashboard() {
  const { shop, ordersThisMonth, orderLimit } = useLoaderData<typeof loader>();

  const setupComplete = shop?.whatsappNumber;
  const usagePercentage = (ordersThisMonth / orderLimit) * 100;

  return (
    <Page title="Dashboard">
      <BlockStack gap="500">
        {!setupComplete && (
          <Banner
            title="Completa la configuración"
            action={{ content: "Configurar", url: "/app/settings" }}
            status="warning"
          >
            Agrega tu número de WhatsApp para empezar a recibir pedidos.
          </Banner>
        )}

        <Layout>
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">Órdenes este mes</Text>
                <InlineStack align="space-between">
                  <Text as="p" variant="heading2xl">{ordersThisMonth}</Text>
                  <Badge>{shop?.plan || "FREE"}</Badge>
                </InlineStack>
                <Text as="p" variant="bodySm" tone="subdued">
                  {orderLimit === Infinity
                    ? "Ilimitadas"
                    : `${ordersThisMonth} de ${orderLimit}`}
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">WhatsApp</Text>
                <Text as="p" variant="headingLg">
                  {shop?.whatsappNumber || "No configurado"}
                </Text>
                <Button url="/app/settings" size="slim">
                  {shop?.whatsappNumber ? "Cambiar" : "Configurar"}
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">Estado</Text>
                <Badge tone={setupComplete ? "success" : "attention"}>
                  {setupComplete ? "Activo" : "Pendiente setup"}
                </Badge>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">Últimos pedidos</Text>
                  <Button url="/app/orders" variant="plain">Ver todos</Button>
                </InlineStack>
                {/* Orders table component */}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
```

---

## 4. Theme App Extension

### 4.1 Estructura

```
extensions/cod-form/
├── blocks/
│   └── cod-button.liquid
├── assets/
│   ├── cod-form.js
│   └── cod-form.css
├── locales/
│   ├── en.default.json
│   └── es.json
└── shopify.extension.toml
```

### 4.2 Configuración (shopify.extension.toml)

```toml
api_version = "2024-10"

[[extensions]]
type = "theme"
name = "COD Form"
handle = "cod-form"

  [[extensions.blocks]]
  type = "product"
  name = "COD Buy Button"
  template = "cod-button"

  [[extensions.blocks]]
  type = "page"
  name = "COD Form Standalone"
  template = "cod-button"
```

### 4.3 Block Principal (blocks/cod-button.liquid)

```liquid
{% comment %}
  Curetfy COD Form - Buy Button Block
{% endcomment %}

<div
  id="curetfy-cod-form-{{ block.id }}"
  class="curetfy-cod-container"
  data-product-id="{{ product.id }}"
  data-product-title="{{ product.title | escape }}"
  data-product-price="{{ product.selected_or_first_available_variant.price | money }}"
  data-product-image="{{ product.featured_image | image_url: width: 200 }}"
  data-variant-id="{{ product.selected_or_first_available_variant.id }}"
  data-shop="{{ shop.permanent_domain }}"
  data-currency="{{ shop.currency }}"
>
  <button
    type="button"
    class="curetfy-cod-button"
    style="
      background-color: {{ block.settings.button_color }};
      color: {{ block.settings.button_text_color }};
      border-radius: {{ block.settings.button_radius }}px;
      padding: {{ block.settings.button_padding }}px {{ block.settings.button_padding | times: 2 }}px;
      font-size: {{ block.settings.button_font_size }}px;
      width: {{ block.settings.button_full_width | yepnope: '100%', 'auto' }};
    "
  >
    {{ block.settings.button_text }}
  </button>
</div>

<!-- Modal Form -->
<div id="curetfy-modal-{{ block.id }}" class="curetfy-modal" style="display: none;">
  <div class="curetfy-modal-content">
    <button type="button" class="curetfy-modal-close">&times;</button>

    <div class="curetfy-modal-header">
      <h2>{{ block.settings.form_title }}</h2>
    </div>

    <div class="curetfy-product-summary">
      <img class="curetfy-product-image" src="" alt="">
      <div class="curetfy-product-info">
        <p class="curetfy-product-title"></p>
        <p class="curetfy-product-price"></p>
      </div>
    </div>

    <form class="curetfy-form" id="curetfy-form-{{ block.id }}">
      <div class="curetfy-form-group">
        <label for="curetfy-name-{{ block.id }}">{{ 'form.name' | t }}</label>
        <input
          type="text"
          id="curetfy-name-{{ block.id }}"
          name="name"
          required
          placeholder="{{ 'form.name_placeholder' | t }}"
        >
      </div>

      <div class="curetfy-form-group">
        <label for="curetfy-phone-{{ block.id }}">{{ 'form.phone' | t }}</label>
        <input
          type="tel"
          id="curetfy-phone-{{ block.id }}"
          name="phone"
          required
          placeholder="{{ 'form.phone_placeholder' | t }}"
        >
      </div>

      <div class="curetfy-form-group">
        <label for="curetfy-address-{{ block.id }}">{{ 'form.address' | t }}</label>
        <textarea
          id="curetfy-address-{{ block.id }}"
          name="address"
          required
          placeholder="{{ 'form.address_placeholder' | t }}"
          rows="2"
        ></textarea>
      </div>

      <div class="curetfy-form-row">
        <div class="curetfy-form-group curetfy-form-group--half">
          <label for="curetfy-province-{{ block.id }}">{{ 'form.province' | t }}</label>
          <select id="curetfy-province-{{ block.id }}" name="province" required>
            <option value="">{{ 'form.select_province' | t }}</option>
          </select>
        </div>

        <div class="curetfy-form-group curetfy-form-group--half">
          <label for="curetfy-quantity-{{ block.id }}">{{ 'form.quantity' | t }}</label>
          <input
            type="number"
            id="curetfy-quantity-{{ block.id }}"
            name="quantity"
            min="1"
            value="1"
          >
        </div>
      </div>

      <div class="curetfy-form-total">
        <span>{{ 'form.total' | t }}:</span>
        <span class="curetfy-total-amount"></span>
      </div>

      <button type="submit" class="curetfy-submit-button" style="background-color: {{ block.settings.button_color }};">
        {{ 'form.submit' | t }}
      </button>
    </form>
  </div>
</div>

<script src="{{ 'cod-form.js' | asset_url }}" defer></script>
<link rel="stylesheet" href="{{ 'cod-form.css' | asset_url }}">

{% schema %}
{
  "name": "COD Buy Button",
  "target": "section",
  "settings": [
    {
      "type": "text",
      "id": "button_text",
      "label": "Button Text",
      "default": "Comprar por WhatsApp"
    },
    {
      "type": "color",
      "id": "button_color",
      "label": "Button Color",
      "default": "#25D366"
    },
    {
      "type": "color",
      "id": "button_text_color",
      "label": "Button Text Color",
      "default": "#FFFFFF"
    },
    {
      "type": "range",
      "id": "button_radius",
      "label": "Button Radius",
      "min": 0,
      "max": 30,
      "step": 2,
      "default": 8,
      "unit": "px"
    },
    {
      "type": "range",
      "id": "button_padding",
      "label": "Button Padding",
      "min": 8,
      "max": 24,
      "step": 2,
      "default": 12,
      "unit": "px"
    },
    {
      "type": "range",
      "id": "button_font_size",
      "label": "Font Size",
      "min": 12,
      "max": 24,
      "step": 1,
      "default": 16,
      "unit": "px"
    },
    {
      "type": "checkbox",
      "id": "button_full_width",
      "label": "Full Width Button",
      "default": true
    },
    {
      "type": "text",
      "id": "form_title",
      "label": "Form Title",
      "default": "Completa tu pedido"
    }
  ]
}
{% endschema %}
```

---

## 5. API Crear Orden

### 5.1 Endpoint (app/routes/api.create-order.tsx)

```tsx
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { prisma } from "~/db.server";
import { createShopifyOrder } from "~/lib/shopify-orders.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const {
      shop,
      productId,
      productTitle,
      variantId,
      quantity,
      price,
      name,
      phone,
      address,
      province,
      country = "DO",
    } = body;

    // Validar campos requeridos
    if (!shop || !productId || !name || !phone || !address) {
      return json({ error: "Missing required fields" }, { status: 400 });
    }

    // Obtener configuración de la tienda
    const shopData = await prisma.shop.findUnique({
      where: { shopDomain: shop },
    });

    if (!shopData) {
      return json({ error: "Shop not found" }, { status: 404 });
    }

    // Verificar límite de órdenes
    const orderLimit = getPlanLimit(shopData.plan);
    if (shopData.ordersThisMonth >= orderLimit) {
      return json({
        error: "Order limit reached",
        upgradeRequired: true
      }, { status: 403 });
    }

    // Calcular total
    const total = parseFloat(price) * quantity;

    // Crear orden en Shopify
    const shopifyOrder = await createShopifyOrder({
      accessToken: shopData.accessToken,
      shop: shop,
      customer: { name, phone, address, province, country },
      lineItems: [{
        variantId,
        quantity,
      }],
      paymentMethod: "COD",
    });

    // Guardar orden en nuestra DB
    const order = await prisma.order.create({
      data: {
        shopId: shopData.id,
        shopifyOrderId: shopifyOrder?.id,
        shopifyOrderNumber: shopifyOrder?.name,
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        customerProvince: province,
        customerCountry: country,
        productId,
        productTitle,
        productVariantId: variantId,
        quantity,
        price,
        total,
        status: "PENDING",
      },
    });

    // Incrementar contador de órdenes
    await prisma.shop.update({
      where: { id: shopData.id },
      data: { ordersThisMonth: { increment: 1 } },
    });

    // Generar link de WhatsApp
    const whatsappLink = generateWhatsAppLink({
      phone: shopData.whatsappNumber!,
      template: shopData.messageTemplate!,
      order: {
        product: productTitle,
        quantity,
        total: formatCurrency(total, "DOP"),
        name,
        phone,
        address,
        province,
      },
    });

    return json({
      success: true,
      orderId: order.id,
      shopifyOrderNumber: shopifyOrder?.name,
      whatsappLink,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return json({ error: "Failed to create order" }, { status: 500 });
  }
}

function getPlanLimit(plan: string): number {
  const limits: Record<string, number> = {
    FREE: 60,
    PRO: 500,
    BUSINESS: 2000,
    UNLIMITED: Infinity,
  };
  return limits[plan] || 60;
}

function generateWhatsAppLink(params: {
  phone: string;
  template: string;
  order: Record<string, any>;
}): string {
  let message = params.template;

  Object.entries(params.order).forEach(([key, value]) => {
    message = message.replace(new RegExp(`{{${key}}}`, "g"), String(value));
  });

  const encodedMessage = encodeURIComponent(message);
  const cleanPhone = params.phone.replace(/\D/g, "");

  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency,
  }).format(amount);
}
```

---

## 6. Billing API

### 6.1 Planes de Suscripción

```tsx
// app/lib/billing.server.ts

import { authenticate } from "~/shopify.server";

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    orderLimit: 60,
    features: [
      "60 órdenes/mes",
      "1 número WhatsApp",
      "Formulario básico",
      "Soporte por email",
    ],
  },
  PRO: {
    name: "Pro",
    price: 7.99,
    orderLimit: 500,
    features: [
      "500 órdenes/mes",
      "1 número WhatsApp",
      "Upsells y ofertas",
      "Analytics básico",
      "Soporte prioritario",
    ],
  },
  BUSINESS: {
    name: "Business",
    price: 19.99,
    orderLimit: 2000,
    features: [
      "2,000 órdenes/mes",
      "Múltiples WhatsApp",
      "Google Sheets",
      "Facebook Pixel",
      "Analytics avanzado",
    ],
  },
  UNLIMITED: {
    name: "Unlimited",
    price: 49.99,
    orderLimit: Infinity,
    features: [
      "Órdenes ilimitadas",
      "Todo en Business",
      "A/B Testing",
      "Soporte dedicado",
      "API access",
    ],
  },
};

export async function createSubscription(
  request: Request,
  plan: keyof typeof PLANS
) {
  const { billing } = await authenticate.admin(request);

  const planConfig = PLANS[plan];

  if (planConfig.price === 0) {
    return { success: true, plan: "FREE" };
  }

  const response = await billing.request({
    plan: {
      name: `Curetfy ${planConfig.name}`,
      amount: planConfig.price,
      currencyCode: "USD",
      interval: "EVERY_30_DAYS",
    },
    isTest: process.env.NODE_ENV !== "production",
    returnUrl: `${process.env.HOST}/app/billing/confirm?plan=${plan}`,
  });

  return response;
}
```

---

## 7. Webhooks GDPR

### 7.1 Handler (app/routes/webhooks.tsx)

```tsx
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import { prisma } from "~/db.server";

export async function action({ request }: ActionFunctionArgs) {
  const { topic, shop, payload } = await authenticate.webhook(request);

  switch (topic) {
    case "APP_UNINSTALLED":
      await handleAppUninstalled(shop);
      break;

    case "CUSTOMERS_DATA_REQUEST":
      await handleCustomersDataRequest(shop, payload);
      break;

    case "CUSTOMERS_REDACT":
      await handleCustomersRedact(shop, payload);
      break;

    case "SHOP_REDACT":
      await handleShopRedact(shop);
      break;

    default:
      console.log(`Unhandled webhook topic: ${topic}`);
  }

  return json({ success: true });
}

async function handleAppUninstalled(shop: string) {
  // Marcar tienda como desinstalada, pero mantener datos por periodo de gracia
  await prisma.shop.update({
    where: { shopDomain: shop },
    data: { accessToken: "" },
  });
}

async function handleCustomersDataRequest(shop: string, payload: any) {
  const { customer } = payload;

  // Buscar órdenes del cliente
  const shopData = await prisma.shop.findUnique({
    where: { shopDomain: shop },
  });

  if (shopData) {
    const orders = await prisma.order.findMany({
      where: {
        shopId: shopData.id,
        customerPhone: customer.phone,
      },
    });

    // En producción: enviar datos al merchant por email
    console.log("Customer data request:", { customer, orders });
  }
}

async function handleCustomersRedact(shop: string, payload: any) {
  const { customer } = payload;

  const shopData = await prisma.shop.findUnique({
    where: { shopDomain: shop },
  });

  if (shopData) {
    // Anonimizar datos del cliente
    await prisma.order.updateMany({
      where: {
        shopId: shopData.id,
        customerPhone: customer.phone,
      },
      data: {
        customerName: "[REDACTED]",
        customerPhone: "[REDACTED]",
        customerAddress: "[REDACTED]",
      },
    });
  }
}

async function handleShopRedact(shop: string) {
  // Eliminar todos los datos de la tienda
  const shopData = await prisma.shop.findUnique({
    where: { shopDomain: shop },
  });

  if (shopData) {
    await prisma.order.deleteMany({
      where: { shopId: shopData.id },
    });

    await prisma.shop.delete({
      where: { id: shopData.id },
    });
  }
}
```

---

## 8. Checklist Pre-Submit

### 8.1 Funcionalidad

- [ ] OAuth funciona correctamente
- [ ] Dashboard carga sin errores
- [ ] Configuración de WhatsApp se guarda
- [ ] Theme Extension aparece en editor de temas
- [ ] Formulario COD funciona en storefront
- [ ] Órdenes se crean en Shopify
- [ ] Link de WhatsApp se genera correctamente
- [ ] Billing/planes funcionan
- [ ] Contador de órdenes funciona

### 8.2 Seguridad

- [ ] Session tokens implementados
- [ ] No cookies de terceros
- [ ] HTTPS en todos los endpoints
- [ ] Webhooks GDPR implementados
- [ ] Validación de inputs

### 8.3 Rendimiento

- [ ] Lighthouse score > -10 puntos
- [ ] Theme extension < 10KB JS
- [ ] Tiempos de respuesta < 500ms

### 8.4 App Listing

- [ ] Nombre: "Curetfy - COD Form"
- [ ] Icono 1200x1200px
- [ ] Screenshots 1600x900px (mínimo 3)
- [ ] Descripción clara
- [ ] Política de privacidad
- [ ] Documentación de soporte

---

## 9. Submission

```bash
# Validar app
shopify app validate

# Deploy extensions
shopify app deploy

# Submit para review
shopify app release
```

---

## Criterios de Éxito Fase 1

| Métrica | Objetivo |
|---------|----------|
| App publicada en App Store | ✓ |
| OAuth funcional | ✓ |
| Crear órdenes | ✓ |
| WhatsApp integration | ✓ |
| Billing activado | ✓ |
| 0 errores en review | ✓ |
