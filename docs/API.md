# API Documentation

> Especificación de endpoints internos y públicos de Curetfy

## Base URLs

| Entorno | URL |
|---------|-----|
| Development | `http://localhost:3000` |
| Production | `https://app.curetcore.com` |

---

## Autenticación

### Endpoints Admin (Internos)

Los endpoints `/app/*` usan autenticación de Shopify via session tokens.

```typescript
// Automáticamente manejado por authenticate.admin
const { session, admin } = await authenticate.admin(request);
```

### Endpoints Públicos (Storefront)

Los endpoints `/api/*` validan el origen de la petición.

```typescript
// Headers requeridos
Origin: https://tienda.myshopify.com
Content-Type: application/json
```

---

## Endpoints Públicos

### GET `/api/config/:shop`

Obtiene la configuración pública del formulario para una tienda.

**Parámetros URL:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| shop | string | Dominio de la tienda (ej: `tienda.myshopify.com`) |

**Response 200:**
```json
{
  "success": true,
  "config": {
    "whatsappNumber": "+18095551234",
    "buttonText": "Comprar por WhatsApp",
    "buttonColor": "#25D366",
    "buttonTextColor": "#FFFFFF",
    "formTitle": "Completa tu pedido",
    "countries": ["DO", "CO", "MX"],
    "enabledProducts": ["gid://shopify/Product/123"],
    "enabledCollections": ["gid://shopify/Collection/456"],
    "messageTemplate": "🛒 *Nuevo Pedido*\n\nProducto: {{product}}...",
    "upsells": [
      {
        "id": "upsell_123",
        "productId": "gid://shopify/Product/789",
        "productTitle": "Funda Protectora",
        "productImage": "https://cdn.shopify.com/...",
        "discountPercent": 20,
        "displayText": "Agrega funda con 20% OFF"
      }
    ],
    "quantityOffers": [
      { "quantity": 2, "discountPercent": 10, "label": "2 unidades - 10% OFF" },
      { "quantity": 3, "discountPercent": 15, "label": "3 unidades - 15% OFF" }
    ]
  }
}
```

**Response 404:**
```json
{
  "success": false,
  "error": "Shop not found"
}
```

---

### POST `/api/create-order`

Crea una nueva orden COD.

**Headers:**
```
Content-Type: application/json
Origin: https://tienda.myshopify.com
```

**Request Body:**
```json
{
  "shop": "tienda.myshopify.com",
  "productId": "gid://shopify/Product/123456789",
  "productTitle": "Camiseta Premium",
  "variantId": "gid://shopify/ProductVariant/987654321",
  "quantity": 2,
  "price": "29.99",
  "currency": "DOP",
  "customer": {
    "name": "Juan Pérez",
    "phone": "+18095551234",
    "address": "Calle Principal #123, Sector Centro",
    "province": "Santo Domingo",
    "country": "DO"
  },
  "upsells": [
    {
      "id": "upsell_123",
      "productId": "gid://shopify/Product/789",
      "variantId": "gid://shopify/ProductVariant/456",
      "quantity": 1,
      "price": "15.99"
    }
  ]
}
```

**Request Fields:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| shop | string | Sí | Dominio de la tienda |
| productId | string | Sí | ID del producto Shopify |
| productTitle | string | Sí | Título del producto |
| variantId | string | No | ID de la variante |
| quantity | number | Sí | Cantidad (min: 1) |
| price | string | Sí | Precio unitario |
| currency | string | No | Código de moneda (default: DOP) |
| customer.name | string | Sí | Nombre del cliente |
| customer.phone | string | Sí | Teléfono del cliente |
| customer.address | string | Sí | Dirección de entrega |
| customer.province | string | Sí | Provincia/Estado |
| customer.country | string | No | Código de país (default: DO) |
| upsells | array | No | Productos adicionales |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "orderId": "ord_abc123def456",
    "shopifyOrderId": "gid://shopify/Order/5555555555",
    "shopifyOrderNumber": "#1234",
    "total": "75.97",
    "currency": "DOP",
    "whatsappLink": "https://wa.me/18095551234?text=%F0%9F%9B%92%20*Nuevo%20Pedido*%0A%0AProducto%3A%20Camiseta%20Premium..."
  }
}
```

**Response 400 (Validación):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "customer.phone": "Invalid phone number format"
  }
}
```

**Response 403 (Límite alcanzado):**
```json
{
  "success": false,
  "error": "Order limit reached",
  "upgradeRequired": true,
  "currentPlan": "FREE",
  "ordersUsed": 60,
  "orderLimit": 60
}
```

**Response 404:**
```json
{
  "success": false,
  "error": "Shop not found or app not installed"
}
```

**Response 500:**
```json
{
  "success": false,
  "error": "Failed to create order",
  "message": "Internal server error"
}
```

---

### POST `/api/track-event`

Registra eventos para analytics (Fase 3).

**Request Body:**
```json
{
  "shop": "tienda.myshopify.com",
  "event": "form_opened",
  "data": {
    "productId": "gid://shopify/Product/123",
    "source": "product_page",
    "visitorId": "vis_abc123"
  }
}
```

**Eventos Soportados:**

| Evento | Descripción |
|--------|-------------|
| `form_opened` | Usuario abrió el formulario |
| `form_submitted` | Usuario envió el formulario |
| `form_abandoned` | Usuario cerró sin enviar |
| `upsell_shown` | Upsell mostrado |
| `upsell_accepted` | Upsell aceptado |
| `upsell_rejected` | Upsell rechazado |
| `whatsapp_opened` | Redirigido a WhatsApp |

**Response 200:**
```json
{
  "success": true
}
```

---

## Endpoints Admin (Internos)

Estos endpoints requieren sesión activa de Shopify.

### GET `/app`

Dashboard principal.

### GET `/app/orders`

Lista de órdenes con paginación.

**Query Params:**
| Param | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| page | number | 1 | Página actual |
| limit | number | 20 | Órdenes por página |
| status | string | all | Filtrar por status |
| search | string | - | Buscar por nombre/teléfono |

### GET `/app/orders/:id`

Detalle de una orden específica.

### POST `/app/settings`

Actualizar configuración de la tienda.

**Request Body:**
```json
{
  "whatsappNumber": "+18095551234",
  "messageTemplate": "🛒 *Nuevo Pedido*...",
  "buttonText": "Comprar Ahora",
  "buttonColor": "#25D366",
  "formTitle": "Tu Pedido",
  "countries": ["DO", "CO"],
  "enabledProducts": [],
  "enabledCollections": []
}
```

### GET `/app/billing`

Obtener información de planes y uso actual.

### POST `/app/billing/subscribe`

Suscribirse a un plan.

**Request Body:**
```json
{
  "plan": "PRO"
}
```

**Response:**
```json
{
  "success": true,
  "confirmationUrl": "https://admin.shopify.com/..."
}
```

---

## Webhooks

### POST `/webhooks`

Endpoint único para todos los webhooks de Shopify.

**Headers Verificados:**
```
X-Shopify-Topic: app/uninstalled
X-Shopify-Hmac-Sha256: [signature]
X-Shopify-Shop-Domain: tienda.myshopify.com
X-Shopify-API-Version: 2024-10
```

**Topics Manejados:**

| Topic | Acción |
|-------|--------|
| `app/uninstalled` | Limpiar token, mantener datos |
| `customers/data_request` | Exportar datos del cliente |
| `customers/redact` | Anonimizar datos del cliente |
| `shop/redact` | Eliminar todos los datos |

---

## Códigos de Error

| Código | Significado |
|--------|-------------|
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Sin autenticación |
| 403 | Forbidden - Sin permisos o límite alcanzado |
| 404 | Not Found - Recurso no existe |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

---

## Rate Limiting

| Endpoint | Límite |
|----------|--------|
| `/api/create-order` | 60 req/min por tienda |
| `/api/config/:shop` | 120 req/min por tienda |
| `/api/track-event` | 300 req/min por tienda |

---

## Ejemplos de Uso

### JavaScript (Storefront)

```javascript
// Crear orden desde el formulario
async function createOrder(formData) {
  const response = await fetch('https://app.curetfy.com/api/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      shop: window.Shopify.shop,
      productId: formData.productId,
      productTitle: formData.productTitle,
      variantId: formData.variantId,
      quantity: formData.quantity,
      price: formData.price,
      customer: {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        province: formData.province,
        country: 'DO',
      },
    }),
  });

  const result = await response.json();

  if (result.success) {
    // Redirigir a WhatsApp
    window.location.href = result.data.whatsappLink;
  } else {
    // Mostrar error
    alert(result.error);
  }
}
```

### cURL

```bash
# Obtener configuración
curl -X GET "https://app.curetfy.com/api/config/tienda.myshopify.com"

# Crear orden
curl -X POST "https://app.curetfy.com/api/create-order" \
  -H "Content-Type: application/json" \
  -H "Origin: https://tienda.myshopify.com" \
  -d '{
    "shop": "tienda.myshopify.com",
    "productId": "gid://shopify/Product/123",
    "productTitle": "Test Product",
    "quantity": 1,
    "price": "29.99",
    "customer": {
      "name": "Test User",
      "phone": "+18095551234",
      "address": "Test Address",
      "province": "Santo Domingo",
      "country": "DO"
    }
  }'
```

---

## Shopify GraphQL Mutations

### Crear Orden

```graphql
mutation createOrder($input: OrderInput!) {
  orderCreate(input: $input) {
    order {
      id
      name
      totalPriceSet {
        shopMoney {
          amount
          currencyCode
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "lineItems": [
      {
        "variantId": "gid://shopify/ProductVariant/123",
        "quantity": 2
      }
    ],
    "shippingAddress": {
      "firstName": "Juan",
      "lastName": "Pérez",
      "address1": "Calle Principal #123",
      "city": "Santo Domingo",
      "province": "Santo Domingo",
      "country": "DO",
      "phone": "+18095551234"
    },
    "customAttributes": [
      { "key": "payment_method", "value": "COD" },
      { "key": "source", "value": "curetfy" }
    ],
    "tags": ["curetfy", "cod"],
    "note": "Pedido COD via Curetfy"
  }
}
```

---

## Versionado

La API usa versionado implícito. Cambios breaking se anunciarán con 30 días de anticipación.

Versión actual: **v1** (implícita en URLs)

Futura: `/api/v2/...` cuando sea necesario.
