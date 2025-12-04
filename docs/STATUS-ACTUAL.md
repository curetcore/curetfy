# Estado Actual del Proyecto - Curetfy COD Form

> Última actualización: 2025-12-04 (v7)

## Resumen Ejecutivo

**Curetfy COD Form** es una app de Shopify para órdenes Cash on Delivery (COD) con integración WhatsApp, enfocada en el mercado LATAM (principalmente República Dominicana).

---

## Completado

### 1. Infraestructura Base
- [x] App creada con Shopify Remix Template
- [x] Configuración `shopify.app.toml` completa
- [x] Client ID: `f111f17bd25329a09376d46941b6532e`
- [x] PostgreSQL configurado (Easypanel)
- [x] Prisma 6.19.0 con schema funcional
- [x] Deploy en Easypanel (Contabo VPS)
- [x] Dominio: `app.curetcore.com`

### 2. Dashboard (App Embebida) - REDISEÑADO v7
- [x] **Dashboard principal** (`app._index.tsx`) con analytics
  - Encabezado con título y botón de instalación en tema
  - Tarjetas de acceso rápido: WhatsApp, Formulario, Facebook Pixel
  - Estadísticas de últimos 7 días (aberturas, pedidos, ingresos, conversión)
  - **Gráficos SVG reales** con ejes de fecha y puntos de datos:
    - Aberturas de formulario (últimos 30 días)
    - Pedidos (últimos 30 días)
    - Tasa de conversión (últimos 30 días)
    - Ingresos (últimos 30 días)
  - **Tabla de datos UTM** con fuente, medio, campaña, aberturas, pedidos, conversión
  - Banner de ingresos totales generados
  - Barra de progreso del plan
- [x] **Página de configuración** (`app.settings.tsx`) - Constructor de formularios
  - **Vista previa con producto aleatorio** de la tienda real (imagen, nombre, precio)
  - **Prefijo de etiqueta auto-secuencial** - muestra próximo número de orden de la tienda
- [x] **Página de billing** (`app.billing.tsx`) - "Planes de facturación"
- [x] ~~Página de órdenes~~ - ELIMINADA (gestión en Shopify Admin)
- [x] Integración con Polaris UI y Polaris Icons

### 3. API
- [x] Endpoint crear orden (`api.create-order.tsx`)
- [x] Endpoint configuración (`api.config.tsx`)
- [x] Webhooks GDPR completos:
  - `customers/data_request`
  - `customers/redact`
  - `shop/redact`
  - `app/uninstalled`

### 4. Theme App Extension (v5)
- [x] **COD Buy Button** - Bloque manual para producto
- [x] **COD Auto Button** - App Embed auto-instalable
- [x] Soporte de carrito completo (múltiples productos)
- [x] Modal profesional estilo Shopify
- [x] CSS profesional con variables
- [x] Responsive (modal slide-up en móvil)
- [x] JavaScript v3.0 - Carga configuración dinámica desde API

### 5. Sistema de Configuración (v6) - 5 TABS

#### Tab 1: WhatsApp
- Número de WhatsApp
- Plantilla de mensaje con variables Mustache

#### Tab 2: Formulario (Constructor Unificado)
- **Constructor de campos estilo page-builder**
  - Campos esenciales: Nombre, Teléfono, Dirección, Ciudad, Provincia, Email, Notas
  - Campos de entrada: Texto, Textarea, Select, Radio, Checkbox, Número, Fecha
  - Elementos decorativos: Encabezado, Imagen, HTML, Botón enlace
- **Límites de campos** - Campos esenciales solo pueden agregarse una vez
- **Iconos Polaris** para cada tipo de campo
- **Auto-scroll** a nuevos campos agregados
- **Plantilla COD por defecto** carga automáticamente (nombre, teléfono, dirección, ciudad, provincia)
- **Vista previa en tiempo real** sincronizada con el orden de campos
- Configuración regional (selector de país)
- Opciones (ocultar etiquetas, RTL, CSS personalizado)
- Personalización del modal (título, subtítulo, colores, botón)
- Mensajes de éxito y error

#### Tab 3: Envíos (NUEVO)
- Habilitar/deshabilitar tarifas de envío
- Gestión de tarifas personalizadas:
  - Nombre de la tarifa
  - Precio
  - Condición (siempre visible, monto mínimo, por provincia)

#### Tab 4: Pedidos
- Prefijo de etiqueta de orden
- Etiquetas automáticas (separadas por coma)
- Crear orden borrador en Shopify
- Nota interna del pedido

#### Tab 5: Avanzado
- Redirección automática a WhatsApp
- Tiempo de espera (delay)
- Analytics interno
- Facebook Pixel (ID configurable)
- Productos habilitados

### 6. Variables de Plantilla WhatsApp
```
{{orderNumber}}, {{name}}, {{phone}}, {{email}}, {{address}},
{{city}}, {{province}}, {{country}}, {{postalCode}}, {{notes}},
{{products}}, {{title}}, {{quantity}}, {{price}}, {{total}}
```

### 7. Países y Provincias Soportados
- DO (República Dominicana) - 32 provincias
- CO (Colombia) - 20 departamentos
- MX (México) - 20 estados
- PE (Perú) - 10 regiones
- CL (Chile) - 10 regiones
- AR (Argentina) - 10 provincias
- EC (Ecuador) - 10 provincias

### 8. Estructura de Archivos

```
app-source/
├── app/
│   ├── routes/
│   │   ├── _index.tsx           # Redirect a /app
│   │   ├── app.tsx              # Layout principal
│   │   ├── app._index.tsx       # Dashboard con analytics
│   │   ├── app.settings.tsx     # Constructor de formulario (5 tabs)
│   │   ├── app.billing.tsx      # Planes de facturación
│   │   ├── app.analytics.tsx    # Analytics (placeholder)
│   │   ├── api.config.tsx       # API configuración
│   │   ├── api.create-order.tsx # API crear orden
│   │   └── webhooks.*.tsx       # Webhooks GDPR
│   ├── shopify.server.ts
│   └── db.server.ts
├── prisma/
│   └── schema.prisma            # 40+ campos de configuración
└── extensions/
    └── cod-form/
        ├── shopify.extension.toml
        ├── blocks/
        │   ├── cod-button.liquid
        │   └── auto-button.liquid
        └── assets/
            ├── cod-form.css
            └── cod-form.js
```

### 9. Base de Datos (Prisma Schema)
- Shop: Configuración completa de la tienda (40+ campos)
- Session: Sesiones de Shopify
- Order: Pedidos COD con toda la información del cliente
- Enums: Plan (FREE, PRO, BUSINESS, UNLIMITED), OrderStatus

---

## Errores Resueltos (Documentación para Futuras Sesiones)

### 1. Prisma DATETIME vs TIMESTAMP
**Error:** PostgreSQL no soporta DATETIME
**Solución:** Usar `@db.Timestamp()` o dejar que Prisma infiera TIMESTAMP

### 2. Prisma Version Conflict
**Error:** Shopify requiere Prisma 6.x, no 7.x
**Solución:**
```bash
npm install prisma@6.19.0 @prisma/client@6.19.0 --save-exact
```

### 3. package-lock.json Missing
**Error:** Template tiene `package-lock.json` en `.gitignore`
**Solución:** Remover de `.gitignore` y generar nuevo lockfile

### 4. Failed Migrations P3009
**Error:** Migración anterior falló y bloqueó nuevas
**Solución:**
```sql
DROP TABLE IF EXISTS _prisma_migrations;
```
Luego: `npx prisma migrate dev`

### 5. Blank Screen
**Error:** Falta ruta raíz que redirija a `/app`
**Solución:** Crear `app/routes/_index.tsx`:
```tsx
import { redirect } from "@remix-run/node";
export const loader = () => redirect("/app");
```

### 6. Theme Extension Schema Errors
**Error:** "presets" no permitido, "body" no válido en enabled_on
**Solución:** Remover presets, usar solo `templates: ["product"]`

### 7. shopify.app.toml Validation
**Error:** Falta `embedded` y formato incorrecto de `scopes`
**Solución:**
```toml
embedded = true

[access_scopes]
scopes = "read_products,write_orders,..."
```

### 8. CLI Outdated
**Error:** Versión 3.83.2 no soportada
**Solución:** `npm install -g @shopify/cli@latest`

### 9. Schema Headers Limit
**Error:** Máximo 6 headers (non-interactive settings) por bloque
**Solución:** Combinar secciones (ej: "Animación y espaciado")

### 10. Preview no sincroniza con reordenamiento
**Error:** Al mover campos arriba/abajo, la vista previa no se actualizaba
**Solución:** Refactorizar `FormModalPreview` para renderizar desde `customFields` directamente con `renderCustomField()`, no desde el viejo sistema de `fieldOrder`

### 11. Declaración duplicada de variable
**Error:** `hideLabels` declarada dos veces en el mismo scope
**Solución:** Remover la declaración duplicada, mantener solo una al inicio del componente

---

## Próximos Pasos

### ACCIÓN REQUERIDA: Rebuild en Easypanel
**El código está en GitHub pero el contenedor necesita rebuild:**

1. Ir a https://easypanel.curetcore.com
2. Proyecto: `apps` → Servicio: `curetfy`
3. Click en "Deploy" o "Rebuild" para obtener el nuevo código
4. Verificar que el build complete sin errores

### Después del Rebuild
1. [ ] Verificar que `/api/config?shop=test` responda correctamente
2. [ ] Probar la página de Settings en el admin de Shopify
3. [ ] Configurar número WhatsApp
4. [ ] Probar flujo completo: formulario → orden → WhatsApp

### Fase 1 - MVP (Pendiente)
1. [ ] Implementar gráficos reales de analytics (no placeholders)
2. [ ] Implementar tracking de aberturas de formulario
3. [ ] Implementar planes de billing funcionales con Shopify Billing API
4. [ ] Crear screenshots para App Store (1600x900)
5. [ ] Crear ícono de app (1200x1200)
6. [ ] Escribir descripción y política de privacidad
7. [ ] Submit a Shopify App Store

### Fase 2 - Built for Shopify
- Ver `docs/FASE-2-BUILT-FOR-SHOPIFY.md`

### Fase 3 - Escalamiento
- Ver `docs/FASE-3-ESCALAMIENTO.md`

---

## Comandos Útiles

```bash
# Desarrollo local
cd app-source && shopify app dev

# Deploy extensión
cd app-source && shopify app deploy --force

# Ver logs en Easypanel
# Panel: https://easypanel.curetcore.com

# Prisma
npx prisma migrate dev
npx prisma studio
npx prisma db push  # Para cambios rápidos sin migración

# Build local
npm run build
```

---

## URLs Importantes

| Recurso | URL |
|---------|-----|
| App Dashboard | https://app.curetcore.com |
| Shopify Partners | https://partners.shopify.com |
| Shopify App | https://dev.shopify.com/dashboard/4940756/apps/301103087617 |
| GitHub | https://github.com/curetcore/curetfy |
| Easypanel | https://easypanel.curetcore.com |

---

## Commits Recientes

| Commit | Descripción |
|--------|-------------|
| `ee2b39a` | Dashboard real charts + UTM table + random product preview + order sequence |
| `decbb08` | Major UI redesign: dashboard analytics, shipping rates, consolidated settings |
| `7d022cb` | Fix form builder: sync preview with reordering + auto-load default template |
| `aadb338` | Redesign form builder with unified page-builder style interface |
| `8161a3b` | Consolidate settings tabs: unify form builder into single Formulario tab |

---

## Contacto

- **Organización:** CURET
- **App Handle:** curetfy-cod-form
