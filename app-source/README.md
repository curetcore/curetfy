# Curetfy COD Form

Aplicación de Shopify para pedidos COD (Cash on Delivery / Pago contra entrega) con integración de WhatsApp, diseñada específicamente para el mercado LATAM.

## Características principales

### Formulario de pedido COD
- Modal profesional con diseño estilo Shopify/Polaris
- Campos configurables (nombre, teléfono, email, dirección, ciudad, provincia, notas)
- Campos personalizados ilimitados (texto, select, checkbox, radio, número, etc.)
- Validación en tiempo real
- Selector de cantidad con controles +/-
- Soporte para producto individual y carrito completo

### Integración WhatsApp
- Envío automático de pedidos por WhatsApp
- Plantilla de mensaje personalizable con variables dinámicas
- Soporte para múltiples formatos de número de teléfono
- Redirección automática después del pedido

### Opciones de envío
- Envío estándar con precio configurable
- Envío gratis con umbral mínimo de compra
- Barra de progreso para envío gratis
- Recogida en tienda (pickup)
- Múltiples opciones de envío simultáneas

### Cargos adicionales
- Comisión COD (fija o porcentual)
- Límites de pedido (mínimo y máximo)
- Resumen de orden con desglose de costos

### Restricciones geográficas
- Provincias/estados bloqueados
- Términos y condiciones obligatorios
- Validación de áreas de cobertura

### Personalización del botón
- 11 animaciones disponibles (pulse, glow, shake, bounce, wiggle, heartbeat, flash, rubber, swing, tada)
- 10 iconos (WhatsApp, carrito, bolsa, teléfono, camión, check, estrella, corazón, rayo, escudo)
- Colores, gradientes, bordes personalizables
- Texto secundario (precio, descuento, envío gratis)
- Configuración desde el editor de tema de Shopify

### Panel de administración
- Interfaz completa en Polaris (diseño nativo de Shopify)
- Vista previa en tiempo real del formulario
- Drag & Drop para ordenar campos personalizados
- Configuración por pestañas organizadas:
  - **Formulario**: Campos, títulos, botón de envío
  - **Diseño**: Colores, header, imágenes, CSS personalizado
  - **Pedidos**: Comportamiento, borradores, límites
  - **Integraciones**: WhatsApp, Facebook Pixel, próximamente más

### Soporte RTL
- Soporte completo para idiomas de derecha a izquierda
- Interfaz adaptable automáticamente

## Tech Stack

- **Framework**: Remix (React)
- **UI**: Shopify Polaris v12
- **Base de datos**: Prisma + SQLite/PostgreSQL
- **Autenticación**: Shopify App Bridge
- **Extensión**: Theme App Extension (bloque de tema)

## Estructura del proyecto

```
app/
├── routes/
│   ├── app._index.tsx      # Dashboard principal
│   ├── app.settings.tsx    # Configuración del formulario
│   ├── app.integraciones.tsx # Integraciones (WhatsApp, etc.)
│   ├── api.config.tsx      # API para el widget
│   └── api.create-order.tsx # API para crear pedidos
├── shopify.server.ts       # Configuración Shopify
└── db.server.ts            # Cliente Prisma

extensions/
└── cod-form/
    ├── blocks/
    │   └── cod-button.liquid  # Bloque del botón COD
    └── assets/
        ├── cod-form.js        # Widget del formulario
        └── cod-form.css       # Estilos del widget
```

## Instalación

### Prerrequisitos

- Node.js 18.20+ o 20.10+
- Cuenta de Shopify Partner
- Tienda de desarrollo de Shopify

### Setup

```bash
# Clonar repositorio
git clone https://github.com/curetcore/curetfy.git
cd curetfy

# Instalar dependencias
npm install

# Configurar base de datos
npm run setup

# Iniciar desarrollo
npm run dev
```

### Despliegue

```bash
# Build de producción
npm run build

# Desplegar a Shopify
npm run deploy
```

## Configuración

### Variables de entorno

El archivo `shopify.app.toml` contiene la configuración principal:

```toml
client_id = "tu_client_id"
name = "Curetfy - COD Form"
application_url = "https://tu-dominio.com"
```

### Permisos requeridos

- `read_products` - Leer productos
- `write_products` - Escribir productos
- `read_orders` - Leer pedidos
- `write_orders` - Escribir pedidos
- `write_draft_orders` - Crear borradores de pedido
- `read_customers` - Leer clientes
- `write_customers` - Escribir clientes

## API Endpoints

### GET /api/config
Retorna la configuración del widget para una tienda específica.

### POST /api/create-order
Crea un nuevo pedido COD.

### GET /api/track-open
Tracking de aperturas del formulario (analytics).

## Uso en la tienda

1. Instalar la app desde el panel de Shopify
2. Configurar los campos del formulario en "Configuración"
3. Configurar WhatsApp en "Integraciones"
4. Ir al editor de tema de Shopify
5. Agregar el bloque "COD Buy Button" a la página de producto
6. Personalizar colores, animaciones e iconos desde el editor

## Licencia

Propietario - CURET / Curetcore

## Soporte

Para soporte técnico, contactar a: soporte@curetcore.com
