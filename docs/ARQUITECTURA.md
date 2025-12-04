# Arquitectura Técnica

> Documentación completa de la arquitectura de Curetfy - COD Form

## Visión General

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTE (Storefront)                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Theme App Extension                               │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │   │
│  │  │  COD Button  │──│  Modal Form  │──│  WhatsApp Redirect       │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLOUDFLARE / AWS CLOUDFRONT                    │
│                                    (CDN + SSL)                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SERVIDOR (Contabo VPS)                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Remix Application                            │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │   │
│  │  │   OAuth &    │  │   Admin UI   │  │   API Endpoints          │  │   │
│  │  │   Session    │  │   (Polaris)  │  │   (REST/GraphQL)         │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘  │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │   │
│  │  │   Webhooks   │  │   Billing    │  │   Background Jobs        │  │   │
│  │  │   Handler    │  │   Service    │  │   (if needed)            │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│  ┌───────────────────────────────────┴───────────────────────────────┐     │
│  │                                                                    │     │
│  ▼                                                                    ▼     │
│  ┌──────────────┐                                          ┌──────────────┐│
│  │  PostgreSQL  │                                          │    Redis     ││
│  │  (Prisma)    │                                          │  (Sessions)  ││
│  └──────────────┘                                          └──────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SHOPIFY PLATFORM                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Admin API   │  │  Storefront  │  │   Billing    │  │   Webhooks   │   │
│  │  (GraphQL)   │  │     API      │  │     API      │  │              │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Stack Tecnológico

### Core

| Componente | Tecnología | Versión | Justificación |
|------------|------------|---------|---------------|
| Runtime | Node.js | 20 LTS | Estabilidad, soporte largo |
| Framework | Remix | 2.x | Template oficial Shopify |
| UI | Polaris React | 13.x | Requerido Built for Shopify |
| ORM | Prisma | 5.x | Type-safe, migraciones |
| Language | TypeScript | 5.x | Type safety |

### Base de Datos

| Componente | Tecnología | Configuración |
|------------|------------|---------------|
| Primary DB | PostgreSQL | 16.x |
| Connection Pool | Prisma | `connection_limit=10` |
| Sessions | Redis | 7.x (opcional prod) |

### Infraestructura

| Componente | Servicio | Notas |
|------------|----------|-------|
| VPS | Contabo | VPS S (4 vCPU, 8GB RAM) |
| CDN | CloudFlare | Free tier suficiente |
| SSL | Let's Encrypt | Auto-renewal con Caddy |
| DNS | CloudFlare | Proxied |

### Shopify

| Componente | Versión/Tipo |
|------------|--------------|
| API Version | 2024-10 |
| App Bridge | 4.x |
| Theme Extension | Theme App Extension |
| Web Pixel | Web Pixels Extension |

---

## Estructura del Proyecto

```
curetfy/
├── app/                              # Remix application
│   ├── routes/                       # Route handlers
│   │   ├── app._index.tsx           # Dashboard
│   │   ├── app.orders.tsx           # Orders list
│   │   ├── app.orders.$id.tsx       # Order detail
│   │   ├── app.settings.tsx         # Settings
│   │   ├── app.form-design.tsx      # Form customization
│   │   ├── app.billing.tsx          # Billing/plans
│   │   ├── app.analytics.tsx        # Analytics (Fase 3)
│   │   ├── app.upsells.tsx          # Upsells (Fase 3)
│   │   ├── app.integrations.tsx     # Integrations
│   │   ├── api.create-order.tsx     # Order creation API
│   │   ├── api.config.$shop.tsx     # Public config API
│   │   ├── webhooks.tsx             # Webhook handler
│   │   └── auth.$.tsx               # OAuth routes
│   │
│   ├── components/                   # React components
│   │   ├── OrdersTable.tsx
│   │   ├── SettingsForm.tsx
│   │   ├── FormPreview.tsx
│   │   ├── StatsCard.tsx
│   │   └── ...
│   │
│   ├── lib/                          # Business logic
│   │   ├── shopify.server.ts        # Shopify client config
│   │   ├── shopify-orders.server.ts # Order creation
│   │   ├── whatsapp.server.ts       # WhatsApp link generation
│   │   ├── billing.server.ts        # Billing logic
│   │   ├── regions.ts               # Country/province data
│   │   └── utils.ts                 # Helpers
│   │
│   ├── db.server.ts                  # Prisma client
│   ├── root.tsx                      # Root layout
│   └── entry.server.tsx              # Server entry
│
├── extensions/                        # Shopify extensions
│   ├── cod-form/                     # Theme App Extension
│   │   ├── blocks/
│   │   │   └── cod-button.liquid    # Main block
│   │   ├── assets/
│   │   │   ├── cod-form.js          # Form logic
│   │   │   └── cod-form.css         # Styles
│   │   ├── locales/
│   │   │   ├── en.default.json
│   │   │   └── es.json
│   │   └── shopify.extension.toml
│   │
│   ├── web-pixel/                    # Web Pixel Extension (Fase 3)
│   │   ├── src/
│   │   │   └── index.ts
│   │   └── shopify.extension.toml
│   │
│   └── customer-segment/             # Customer Segment Action (Fase 2)
│       ├── src/
│       │   └── index.tsx
│       └── shopify.extension.toml
│
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── migrations/                   # Migration files
│
├── public/                           # Static assets
│
├── scripts/                          # Utility scripts
│   ├── seed.ts                      # Database seeding
│   └── migrate-prod.ts              # Production migration
│
├── tests/                            # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example                      # Environment template
├── shopify.app.toml                  # Shopify app config
├── remix.config.js                   # Remix config
├── tailwind.config.js                # Tailwind (if used)
├── tsconfig.json                     # TypeScript config
├── package.json
└── README.md
```

---

## Flujos de Datos

### Flujo 1: Instalación de App

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Merchant  │────▶│  App Store  │────▶│   OAuth     │────▶│   Our App   │
│   clicks    │     │   Install   │     │   Flow      │     │   Server    │
│   install   │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                   │
                                                                   ▼
                                              ┌─────────────────────────────┐
                                              │  1. Validate OAuth          │
                                              │  2. Exchange code → token   │
                                              │  3. Create/update Shop      │
                                              │  4. Register webhooks       │
                                              │  5. Redirect to dashboard   │
                                              └─────────────────────────────┘
```

### Flujo 2: Cliente Crea Orden

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              STOREFRONT                                   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. Customer clicks "Comprar por WhatsApp"                              │
│                          │                                               │
│                          ▼                                               │
│  2. Modal opens with form                                               │
│     - Name, Phone, Address, Province                                    │
│     - Quantity selector                                                 │
│     - Upsells (if configured)                                          │
│                          │                                               │
│                          ▼                                               │
│  3. Customer submits form                                               │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           API SERVER                                      │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  POST /api/create-order                                                 │
│                                                                          │
│  4. Validate input data                                                 │
│  5. Check order limits (plan)                                           │
│  6. Create Shopify order via Admin API                                  │
│  7. Save order in our database                                          │
│  8. Increment order counter                                             │
│  9. Generate WhatsApp link                                              │
│  10. Return { success, whatsappLink }                                   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           STOREFRONT                                      │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  11. Redirect to WhatsApp                                               │
│      wa.me/+18095551234?text=...                                        │
│                                                                          │
│  12. Customer sends message                                             │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Flujo 3: Webhooks GDPR

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Shopify   │────▶│  POST       │────▶│  Process    │
│   triggers  │     │  /webhooks  │     │  webhook    │
│   webhook   │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
                    ▼                          ▼                          ▼
           ┌───────────────┐         ┌───────────────┐         ┌───────────────┐
           │ APP_UNINSTALL │         │ CUSTOMERS_    │         │ SHOP_REDACT   │
           │               │         │ REDACT        │         │               │
           │ Clear token   │         │ Anonymize     │         │ Delete all    │
           │ Keep data     │         │ customer data │         │ shop data     │
           └───────────────┘         └───────────────┘         └───────────────┘
```

---

## Base de Datos

### Diagrama ER

```
┌─────────────────┐       ┌─────────────────┐
│      Shop       │       │      Order      │
├─────────────────┤       ├─────────────────┤
│ id              │───┐   │ id              │
│ shopDomain      │   │   │ shopId          │──┐
│ accessToken     │   │   │ shopifyOrderId  │  │
│ whatsappNumber  │   │   │ customerName    │  │
│ messageTemplate │   │   │ customerPhone   │  │
│ buttonText      │   │   │ customerAddress │  │
│ buttonColor     │   │   │ productId       │  │
│ formTitle       │   │   │ productTitle    │  │
│ countries[]     │   │   │ quantity        │  │
│ plan            │   │   │ total           │  │
│ ordersThisMonth │   │   │ status          │  │
│ billingStart    │   │   │ whatsappSent    │  │
│ createdAt       │   │   │ createdAt       │  │
│ updatedAt       │   └───│                 │  │
└─────────────────┘       └─────────────────┘  │
        │                         ▲            │
        │                         │            │
        │    ┌────────────────────┘            │
        │    │                                 │
        ▼    │                                 │
┌─────────────────┐       ┌─────────────────┐ │
│     Upsell      │       │ WhatsAppNumber  │ │
├─────────────────┤       ├─────────────────┤ │
│ id              │       │ id              │ │
│ shopId          │───────│ shopId          │─┘
│ name            │       │ phone           │
│ type            │       │ label           │
│ productId       │       │ isDefault       │
│ discountType    │       │ products[]      │
│ discountValue   │       │ collections[]   │
│ triggerProducts │       │ countries[]     │
│ impressions     │       │ createdAt       │
│ conversions     │       └─────────────────┘
│ createdAt       │
└─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│   Experiment    │       │ ExperimentEvent │
├─────────────────┤       ├─────────────────┤
│ id              │───┐   │ id              │
│ shopId          │   │   │ experimentId    │──┐
│ name            │   │   │ variantId       │  │
│ type            │   │   │ visitorId       │  │
│ status          │   │   │ eventType       │  │
│ variants (JSON) │   │   │ createdAt       │  │
│ startedAt       │   └───│                 │  │
│ endedAt         │       └─────────────────┘  │
│ winnerVariant   │               ▲            │
└─────────────────┘               └────────────┘
```

### Índices Importantes

```sql
-- Performance queries
CREATE INDEX idx_orders_shop_created ON "Order"("shopId", "createdAt" DESC);
CREATE INDEX idx_orders_status ON "Order"("status");
CREATE INDEX idx_upsells_shop_active ON "Upsell"("shopId", "active");
CREATE INDEX idx_experiments_shop_status ON "Experiment"("shopId", "status");

-- Unique constraints
CREATE UNIQUE INDEX idx_shop_domain ON "Shop"("shopDomain");
```

---

## API Endpoints

### Internos (Admin App)

| Method | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/app` | Dashboard |
| GET | `/app/orders` | Lista órdenes |
| GET | `/app/orders/:id` | Detalle orden |
| POST | `/app/settings` | Guardar config |
| GET | `/app/billing` | Ver planes |
| POST | `/app/billing/subscribe` | Suscribirse |

### Públicos (Storefront)

| Method | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/config/:shop` | Obtener config pública |
| POST | `/api/create-order` | Crear orden |

### Webhooks

| Endpoint | Topics |
|----------|--------|
| `/webhooks` | `app/uninstalled`, `customers/*`, `shop/redact` |

---

## Seguridad

### Autenticación

```tsx
// Todas las rutas /app/* requieren autenticación
export async function loader({ request }: LoaderFunctionArgs) {
  // authenticate.admin verifica:
  // 1. Session válida
  // 2. Token no expirado
  // 3. Shop existe
  const { session, admin } = await authenticate.admin(request);

  // session.shop = "tienda.myshopify.com"
  // admin = GraphQL client autenticado
}
```

### Webhook Verification

```tsx
// Verificar HMAC de webhooks
export async function action({ request }: ActionFunctionArgs) {
  const { topic, shop, payload } = await authenticate.webhook(request);
  // authenticate.webhook verifica:
  // 1. HMAC signature
  // 2. Timestamp (replay attacks)
}
```

### API Pública

```tsx
// /api/create-order - Verificar origen
export async function action({ request }: ActionFunctionArgs) {
  const origin = request.headers.get("origin");
  const shop = await getShopFromOrigin(origin);

  if (!shop) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
}
```

### Headers de Seguridad

```tsx
// Configurado automáticamente por App Bridge
// X-Frame-Options: ALLOW-FROM https://*.myshopify.com
// Content-Security-Policy: frame-ancestors https://*.myshopify.com
```

---

## Deployment

### Servidor Contabo

```bash
# Estructura en servidor
/var/www/curetfy/
├── current/              # Symlink a release actual
├── releases/
│   ├── 20241201120000/
│   └── 20241202150000/
├── shared/
│   ├── .env
│   └── node_modules/
└── logs/
```

### Docker Compose (Producción)

```yaml
# docker-compose.yml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/curetfy
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=curetfy
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=curetfy
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  caddy_data:
```

### Caddyfile

```
app.curetcore.com {
    reverse_proxy app:3000
    encode gzip
}
```

### CI/CD (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install & Build
        run: |
          npm ci
          npm run build

      - name: Deploy to Contabo
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /var/www/curetfy
            git pull origin main
            npm ci --production
            npm run build
            pm2 restart curetfy
```

---

## Monitoreo

### Logs

```typescript
// Structured logging
import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: { colorize: true },
  },
});

// Usage
logger.info({ shop, orderId }, "Order created");
logger.error({ error, shop }, "Failed to create order");
```

### Health Check

```tsx
// app/routes/health.tsx
export async function loader() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return json({ status: "ok", db: "connected" });
  } catch (error) {
    return json({ status: "error", db: "disconnected" }, { status: 500 });
  }
}
```

### Métricas (Opcional)

```typescript
// Prometheus metrics
import { collectDefaultMetrics, Counter, Histogram } from "prom-client";

collectDefaultMetrics();

export const ordersCreated = new Counter({
  name: "curetfy_orders_created_total",
  help: "Total orders created",
  labelNames: ["shop", "plan"],
});

export const orderCreationDuration = new Histogram({
  name: "curetfy_order_creation_duration_seconds",
  help: "Order creation duration",
});
```

---

## Escalabilidad

### Fase 1 (MVP)

- 1 servidor Contabo (4 vCPU, 8GB RAM)
- PostgreSQL local
- Sin Redis (sessions en DB)
- Capacidad: ~100 tiendas, ~10k órdenes/mes

### Fase 2 (Growth)

- Agregar Redis para sessions
- CloudFlare CDN
- Capacidad: ~500 tiendas, ~50k órdenes/mes

### Fase 3 (Scale)

- Migrar DB a managed PostgreSQL (AWS RDS)
- Redis managed (ElastiCache)
- Múltiples instancias de app
- Load balancer
- Capacidad: ~2000 tiendas, ~200k órdenes/mes

### Fase 4 (Enterprise)

- Kubernetes
- Auto-scaling
- Multi-region
- Capacidad: Ilimitada

---

## Costos Estimados

### Fase 1 (MVP)

| Servicio | Costo Mensual |
|----------|---------------|
| Contabo VPS S | $6 |
| Dominio | ~$1 |
| CloudFlare | $0 (free) |
| **Total** | **~$7/mes** |

### Fase 2-3 (Growth)

| Servicio | Costo Mensual |
|----------|---------------|
| Contabo VPS M | $12 |
| Managed PostgreSQL | $15-30 |
| Redis | $15 |
| CloudFlare Pro | $20 |
| **Total** | **~$60-80/mes** |

### Break-even

Con plan Pro a $7.99/mes:
- 10 tiendas = $80/mes (break-even Fase 2)
- 50 tiendas = $400/mes (profitable)
- 100 tiendas = $800/mes (muy profitable)
