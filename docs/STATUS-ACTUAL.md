# Estado Actual del Proyecto - Curetfy COD Form

> Última actualización: 2025-12-04 (v5)

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

### 2. Dashboard (App Embebida)
- [x] Ruta principal con redirect (`_index.tsx`)
- [x] Página de configuración (`app.settings.tsx`) **- NUEVA v3.0**
- [x] Página de órdenes (`app.orders.tsx`)
- [x] Página de billing (`app.billing.tsx`)
- [x] Integración con Polaris UI

### 3. API
- [x] Endpoint crear orden (`api.create-order.tsx`)
- [x] Endpoint configuración (`api.config.tsx`) **- NUEVO**
- [x] Webhooks GDPR completos:
  - `customers/data_request`
  - `customers/redact`
  - `shop/redact`
  - `app/uninstalled`

### 4. Theme App Extension (v5) - COMPLETAMENTE CONFIGURABLE
- [x] **COD Buy Button** - Bloque manual para producto
- [x] **COD Auto Button** - App Embed auto-instalable
- [x] Soporte de carrito completo (múltiples productos)
- [x] Modal profesional estilo Shopify
- [x] **Configuraciones en Theme Editor (botón):**
  - Texto del botón
  - Tamaño y peso de fuente
  - Color principal y texto
  - Degradado (2 colores + ángulo)
  - Bordes redondeados
  - Padding horizontal/vertical
  - Ancho completo
  - Sombra
  - Íconos (WhatsApp, Carrito, Bolsa)
  - Tamaño del ícono
  - Animaciones (Pulso, Brillo, Vibrar, Rebote)
  - Márgenes superior/inferior
- [x] CSS profesional con variables
- [x] Responsive (modal slide-up en móvil)
- [x] Detecta 9+ selectores de botón "Add to Cart"
- [x] **JavaScript v3.0** - Carga configuración dinámica desde API

### 5. Sistema de Configuración Completo (NUEVO)

#### 5.1 Página de Settings (6 pestañas)
- **WhatsApp**: Número, plantilla de mensaje con variables
- **Formulario**: Labels y placeholders editables
- **Campos**: Visibilidad y requeridos (email, ciudad, provincia, código postal, notas, cantidad)
- **Modal**: Título, subtítulo, colores, imagen/precio producto
- **Pedidos**: Tags, prefijo, draft order, nota
- **Avanzado**: Redirect automático, delay, analytics, Facebook Pixel

#### 5.2 Variables de Plantilla WhatsApp
```
{{orderNumber}}, {{name}}, {{phone}}, {{email}}, {{address}},
{{city}}, {{province}}, {{country}}, {{postalCode}}, {{notes}},
{{products}}, {{title}}, {{quantity}}, {{price}}, {{total}}
```

#### 5.3 Países y Provincias Soportados
- DO (República Dominicana) - 32 provincias
- CO (Colombia) - 20 departamentos
- MX (México) - 20 estados
- PE (Perú) - 10 regiones
- CL (Chile) - 10 regiones
- AR (Argentina) - 10 provincias
- EC (Ecuador) - 10 provincias

### 6. Archivos de la Extensión

```
extensions/cod-form/
├── shopify.extension.toml    # Configuración de la extensión
├── blocks/
│   ├── cod-button.liquid     # Bloque manual (product template)
│   └── auto-button.liquid    # App Embed (auto-instala)
└── assets/
    ├── cod-form.css          # Estilos profesionales
    └── cod-form.js           # Lógica v3.0 (fetch config desde API)
```

### 7. Base de Datos (Prisma Schema)
40+ campos de configuración incluyendo:
- Configuración WhatsApp
- Configuración de pedidos Shopify
- Labels y placeholders del formulario
- Visibilidad y campos requeridos
- Personalización del modal
- Mensajes de éxito/error
- Configuración de países
- Ajustes avanzados

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
1. [ ] Implementar planes de billing funcionales
2. [ ] Agregar analytics básicos
3. [ ] Crear screenshots para App Store (1600x900)
4. [ ] Crear ícono de app (1200x1200)
5. [ ] Escribir descripción y política de privacidad
6. [ ] Submit a Shopify App Store

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

## Contacto

- **Organización:** CURET
- **App Handle:** curetfy-cod-form
