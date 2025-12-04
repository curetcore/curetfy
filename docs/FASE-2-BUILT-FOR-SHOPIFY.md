# Fase 2: Built for Shopify Certification

> Objetivo: Obtener la certificación "Built for Shopify" cumpliendo todos los requisitos de performance, diseño e integración.

## Prerequisitos

Antes de aplicar para Built for Shopify:

| Requisito | Estado |
|-----------|--------|
| App publicada en App Store | Fase 1 |
| Mínimo 50 instalaciones activas | Post-launch |
| Mínimo 5 reviews | Post-launch |
| Sin infracciones en Partner Program | Mantener |
| Calificación mínima en App Store | Mantener |

---

## 1. Requisitos de Performance

### 1.1 Web Vitals del Admin (App Embebida)

La app debe mantener estas métricas en percentil 75 (mínimo 100 llamadas en 28 días):

| Métrica | Umbral | Cómo Medir |
|---------|--------|------------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | App Bridge reporta automáticamente |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | App Bridge reporta automáticamente |
| **INP** (Interaction to Next Paint) | ≤ 200ms | App Bridge reporta automáticamente |

### 1.2 Optimizaciones Requeridas

```tsx
// app/root.tsx - Optimizaciones de carga

import { Links, Meta, Outlet, Scripts } from "@remix-run/react";

export default function App() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        {/* Preconnect para recursos críticos */}
        <link rel="preconnect" href="https://cdn.shopify.com" />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
```

### 1.3 Lazy Loading de Componentes

```tsx
// app/routes/app.analytics.tsx

import { lazy, Suspense } from "react";
import { SkeletonPage, Layout, Card, SkeletonBodyText } from "@shopify/polaris";

// Lazy load componentes pesados
const AnalyticsChart = lazy(() => import("~/components/AnalyticsChart"));

function AnalyticsSkeleton() {
  return (
    <SkeletonPage title="Analytics">
      <Layout>
        <Layout.Section>
          <Card>
            <SkeletonBodyText lines={10} />
          </Card>
        </Layout.Section>
      </Layout>
    </SkeletonPage>
  );
}

export default function Analytics() {
  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <AnalyticsChart />
    </Suspense>
  );
}
```

### 1.4 Rendimiento Storefront

**Requisito:** No reducir Lighthouse score más de 10 puntos.

```javascript
// extensions/cod-form/assets/cod-form.js

// IMPORTANTE: Mantener el JS mínimo y eficiente
// Target: < 10KB minificado

(function() {
  'use strict';

  // Defer initialization hasta que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // Usar delegación de eventos en lugar de múltiples listeners
    document.addEventListener('click', handleClick);
  }

  function handleClick(e) {
    const button = e.target.closest('.curetfy-cod-button');
    if (button) {
      openModal(button);
    }

    const closeBtn = e.target.closest('.curetfy-modal-close');
    if (closeBtn) {
      closeModal();
    }
  }

  // Lazy load del modal solo cuando se necesita
  let modalLoaded = false;

  function openModal(button) {
    if (!modalLoaded) {
      loadModalStyles();
      modalLoaded = true;
    }
    // ... rest of modal logic
  }

  function loadModalStyles() {
    // Cargar CSS solo cuando se abre el modal
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = window.curetfyAssets?.modalCss;
    document.head.appendChild(link);
  }
})();
```

### 1.5 Medición de Performance

```bash
# Medir Lighthouse en diferentes páginas
# Usar weighted methodology: Home (17%), Product (40%), Collection (43%)

# Instalar lighthouse CI
npm install -g @lhci/cli

# Crear configuración
cat > lighthouserc.js << 'EOF'
module.exports = {
  ci: {
    collect: {
      url: [
        'https://tu-tienda.myshopify.com/',
        'https://tu-tienda.myshopify.com/products/test-product',
        'https://tu-tienda.myshopify.com/collections/all'
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
      },
    },
  },
};
EOF

# Ejecutar tests
lhci autorun
```

---

## 2. Requisitos de Integración

### 2.1 App Bridge Obligatorio

```tsx
// app/shopify.server.ts

import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { prisma } from "./db.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  apiVersion: ApiVersion.October24,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  isEmbeddedApp: true, // OBLIGATORIO para Built for Shopify
  future: {
    unstable_newEmbeddedAuthStrategy: true,
  },
  // App Bridge se configura automáticamente
});

export default shopify;
export const authenticate = shopify.authenticate;
```

### 2.2 Signup Sin Fricción

```tsx
// app/routes/app._index.tsx

// NO requerir registro adicional
// Usar credenciales de Shopify directamente

export async function loader({ request }: LoaderFunctionArgs) {
  // authenticate.admin ya maneja la sesión
  const { session, admin } = await authenticate.admin(request);

  // Crear o actualizar tienda automáticamente
  const shop = await prisma.shop.upsert({
    where: { shopDomain: session.shop },
    update: {
      accessToken: session.accessToken,
    },
    create: {
      shopDomain: session.shop,
      accessToken: session.accessToken!,
    },
  });

  // Usuario ya está autenticado, sin formularios de registro
  return json({ shop });
}
```

### 2.3 Navegación Integrada

```tsx
// app/routes/app.tsx - Layout principal

import { NavMenu } from "@shopify/app-bridge-react";
import { Outlet } from "@remix-run/react";

export default function AppLayout() {
  return (
    <>
      {/* Navegación integrada con Shopify Admin */}
      <NavMenu>
        <a href="/app" rel="home">Dashboard</a>
        <a href="/app/orders">Órdenes</a>
        <a href="/app/form-design">Diseño</a>
        <a href="/app/settings">Configuración</a>
        <a href="/app/billing">Planes</a>
      </NavMenu>
      <Outlet />
    </>
  );
}
```

### 2.4 Contextual Save Bar

```tsx
// app/routes/app.settings.tsx

import { useCallback, useState } from "react";
import { ContextualSaveBar, Page, Layout, Card, FormLayout, TextField } from "@shopify/polaris";
import { useSubmit } from "@remix-run/react";

export default function Settings() {
  const [isDirty, setIsDirty] = useState(false);
  const [formData, setFormData] = useState({
    whatsappNumber: "",
    messageTemplate: "",
  });
  const submit = useSubmit();

  const handleChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  const handleSave = useCallback(() => {
    submit(formData, { method: "POST" });
    setIsDirty(false);
  }, [formData, submit]);

  const handleDiscard = useCallback(() => {
    // Reset to original values
    setIsDirty(false);
  }, []);

  return (
    <Page title="Configuración">
      {/* Contextual Save Bar - Requerido por Built for Shopify */}
      {isDirty && (
        <ContextualSaveBar
          message="Cambios sin guardar"
          saveAction={{
            onAction: handleSave,
            loading: false,
            disabled: false,
          }}
          discardAction={{
            onAction: handleDiscard,
          }}
        />
      )}

      <Layout>
        <Layout.Section>
          <Card>
            <FormLayout>
              <TextField
                label="Número de WhatsApp"
                value={formData.whatsappNumber}
                onChange={(v) => handleChange("whatsappNumber", v)}
                placeholder="+1 809 555 1234"
                autoComplete="tel"
              />
              <TextField
                label="Mensaje Template"
                value={formData.messageTemplate}
                onChange={(v) => handleChange("messageTemplate", v)}
                multiline={4}
              />
            </FormLayout>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

### 2.5 Theme App Extension (Sin Asset API)

```toml
# extensions/cod-form/shopify.extension.toml

# IMPORTANTE: Usar theme app extensions, NO Asset API
# Built for Shopify prohíbe modificar archivos del tema directamente

api_version = "2024-10"

[[extensions]]
type = "theme"
name = "COD Form"
handle = "cod-form"

# Los bloques se activan desde el Theme Editor
# No requieren modificación de código del tema
```

---

## 3. Requisitos de Diseño

### 3.1 Polaris UI Completo

```tsx
// CORRECTO: Usar componentes Polaris
import {
  Page,
  Layout,
  Card,
  Button,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  Banner,
  Modal,
  TextField,
  Select,
  Checkbox,
  ResourceList,
  ResourceItem,
  Thumbnail,
  Pagination,
  EmptyState,
  SkeletonPage,
  SkeletonBodyText,
} from "@shopify/polaris";

// INCORRECTO: Componentes custom que replican Polaris
// ❌ <CustomButton>, <CustomCard>, <CustomModal>
```

### 3.2 Responsive Design

```tsx
// Polaris ya es responsive, pero verificar breakpoints

import { useBreakpoints } from "@shopify/polaris";

export default function Dashboard() {
  const { smUp, mdUp, lgUp } = useBreakpoints();

  return (
    <Page>
      <Layout>
        {/* Columnas se ajustan automáticamente */}
        <Layout.Section variant={mdUp ? "oneThird" : "fullWidth"}>
          <Card>Stats</Card>
        </Layout.Section>

        <Layout.Section variant={mdUp ? "twoThirds" : "fullWidth"}>
          <Card>Content</Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

### 3.3 Mensajes de Error Correctos

```tsx
// CORRECTO: Errors en rojo, contextuales, no auto-dismiss

import { Banner, InlineError } from "@shopify/polaris";

// Banner de error
<Banner status="critical" title="Error al guardar">
  No se pudo guardar la configuración. Por favor intenta de nuevo.
</Banner>

// Error inline en campos
<TextField
  label="WhatsApp"
  value={phone}
  onChange={setPhone}
  error={phoneError ? "Número inválido. Usa formato internacional." : undefined}
/>

// INCORRECTO:
// ❌ Toast que desaparece automáticamente para errores
// ❌ Colores no-rojos para errores
// ❌ Mensajes genéricos como "Error"
```

### 3.4 Estados Empty y Loading

```tsx
// Empty State
import { EmptyState, Card } from "@shopify/polaris";

function OrdersEmpty() {
  return (
    <Card>
      <EmptyState
        heading="No hay órdenes todavía"
        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        action={{
          content: "Ver documentación",
          url: "/app/help",
        }}
      >
        <p>Las órdenes aparecerán aquí cuando los clientes completen el formulario.</p>
      </EmptyState>
    </Card>
  );
}

// Loading State
import { SkeletonPage, Layout, Card, SkeletonBodyText } from "@shopify/polaris";

function OrdersLoading() {
  return (
    <SkeletonPage title="Órdenes">
      <Layout>
        <Layout.Section>
          <Card>
            <SkeletonBodyText lines={5} />
          </Card>
        </Layout.Section>
      </Layout>
    </SkeletonPage>
  );
}
```

### 3.5 No Pressure Tactics

```tsx
// PROHIBIDO por Built for Shopify:

// ❌ Countdown timers en UI de la app
// ❌ "Oferta termina en 2:34:56"

// ❌ Guilt/shame messaging
// ❌ "¿Seguro que quieres perder ventas?"

// ❌ Recompensas por reviews
// ❌ "Deja una review y obtén 1 mes gratis"

// ❌ Pop-ups automáticos de upgrade
// ❌ Modal que aparece al cargar pidiendo upgrade

// CORRECTO: Información clara sobre límites
<Banner status="info">
  Has usado 55 de 60 órdenes este mes.
  <Button url="/app/billing">Ver planes</Button>
</Banner>
```

---

## 4. Requisitos por Categoría (Forms)

Nuestra app cae en la categoría **Forms**. Requisitos específicos:

### 4.1 Customer Segment Action Extension

```tsx
// extensions/customer-segment-action/src/index.tsx

import {
  reactExtension,
  useApi,
  AdminAction,
  BlockStack,
  Text,
  Button,
} from "@shopify/ui-extensions-react/admin";

export default reactExtension(
  "admin.customer-segment-details.action.render",
  () => <CustomerSegmentAction />
);

function CustomerSegmentAction() {
  const { extension } = useApi();

  const handleSync = async () => {
    // Sincronizar datos del segmento con nuestra app
    await fetch("/api/sync-segment", {
      method: "POST",
      body: JSON.stringify({
        segmentId: extension.target.id,
      }),
    });
  };

  return (
    <AdminAction
      title="Curetfy COD"
      primaryAction={
        <Button onPress={handleSync}>Sincronizar segmento</Button>
      }
    >
      <BlockStack>
        <Text>
          Sincroniza este segmento de clientes con Curetfy para
          personalizar formularios COD.
        </Text>
      </BlockStack>
    </AdminAction>
  );
}
```

### 4.2 Visitors API

```tsx
// app/lib/visitors.server.ts

import { authenticate } from "~/shopify.server";

export async function getVisitorData(request: Request, visitorId: string) {
  const { admin } = await authenticate.admin(request);

  // Usar Visitors API para identificar visitantes
  const response = await admin.graphql(`
    query getVisitor($id: ID!) {
      visitor(id: $id) {
        id
        email
        phone
        marketingState
        lastSeen
      }
    }
  `, {
    variables: { id: visitorId }
  });

  return response.json();
}
```

### 4.3 Sincronizar Datos de Cliente

```tsx
// app/lib/customer-sync.server.ts

export async function syncCustomerData(
  admin: any,
  orderData: {
    email?: string;
    phone: string;
    name: string;
    address: string;
  }
) {
  // Buscar o crear cliente en Shopify
  const customerResponse = await admin.graphql(`
    mutation customerCreate($input: CustomerInput!) {
      customerCreate(input: $input) {
        customer {
          id
          email
          phone
        }
        userErrors {
          field
          message
        }
      }
    }
  `, {
    variables: {
      input: {
        phone: orderData.phone,
        firstName: orderData.name.split(" ")[0],
        lastName: orderData.name.split(" ").slice(1).join(" "),
        addresses: [{
          address1: orderData.address,
        }],
        tags: ["curetfy-cod"],
      }
    }
  });

  return customerResponse.json();
}
```

---

## 5. Checklist Built for Shopify

### 5.1 Performance

- [ ] LCP ≤ 2.5s (percentil 75)
- [ ] CLS ≤ 0.1 (percentil 75)
- [ ] INP ≤ 200ms (percentil 75)
- [ ] Lighthouse storefront: -10 puntos máximo
- [ ] Theme extension JS < 10KB
- [ ] Mínimo 100 llamadas en 28 días para métricas

### 5.2 Integración

- [ ] App embebida con App Bridge
- [ ] Signup sin fricción (sin formularios de registro)
- [ ] NavMenu integrado
- [ ] Flujos principales en admin (no redirecciones externas)
- [ ] Theme app extension (no Asset API)
- [ ] Configuraciones dentro del admin

### 5.3 Diseño

- [ ] 100% Polaris components
- [ ] Mobile responsive
- [ ] Contextual Save Bar para formularios
- [ ] Mensajes de error en rojo y persistentes
- [ ] Empty states apropiados
- [ ] Loading states (skeletons)
- [ ] Sin pressure tactics
- [ ] Ads/promociones dismissables

### 5.4 Categoría Forms

- [ ] Customer segment action extension
- [ ] Visitors API implementada
- [ ] Sincronización de datos de cliente

### 5.5 Volumen Mínimo

- [ ] 50+ instalaciones activas
- [ ] 5+ reviews
- [ ] Buena reputación (sin infracciones)

---

## 6. Proceso de Aplicación

### 6.1 Verificar Elegibilidad

```bash
# En Partner Dashboard > Apps > [Tu App] > Distribution
# Verificar sección "Built for Shopify"
```

### 6.2 Auto-Evaluación

Shopify evalúa automáticamente:
- Web Vitals del admin
- Performance del storefront
- Cumplimiento de requisitos de categoría

### 6.3 Revisión Manual

Si pasa auto-evaluación:
- Shopify hace revisión manual de UX
- Verifican cumplimiento de diseño
- ~2-4 semanas proceso

### 6.4 Mantenimiento

- Revisión anual de cumplimiento
- 60 días de gracia si fallas métricas
- Perder status si no corriges

---

## 7. Beneficios de Built for Shopify

| Beneficio | Impacto |
|-----------|---------|
| Badge en App Store | +49% instalaciones promedio |
| Mejor ranking en búsqueda | Mayor visibilidad |
| Confianza de merchants | Más conversiones |
| Acceso a features exclusivos | Early access |
| Soporte prioritario | Mejor relación con Shopify |

---

## 8. Timeline Fase 2

| Semana | Tarea |
|--------|-------|
| 1 | Optimizar performance admin (Web Vitals) |
| 2 | Optimizar theme extension |
| 3 | Implementar customer segment extension |
| 4 | Implementar Visitors API |
| 5 | Review de diseño Polaris |
| 6 | Testing y métricas |
| 7 | Esperar 28 días de data |
| 8+ | Submit y esperar review |

---

## Criterios de Éxito Fase 2

| Métrica | Objetivo |
|---------|----------|
| Built for Shopify badge | ✓ |
| LCP < 2.5s | ✓ |
| CLS < 0.1 | ✓ |
| INP < 200ms | ✓ |
| 50+ instalaciones | ✓ |
| 5+ reviews | ✓ |
