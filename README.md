# Curetfy - COD Form

> Formulario de pedidos Cash on Delivery con integración WhatsApp para Shopify. Optimizado para LATAM.

![Shopify](https://img.shields.io/badge/Shopify-App-green)
![Built for Shopify](https://img.shields.io/badge/Built%20for-Shopify-blue)
![License](https://img.shields.io/badge/License-Proprietary-red)

## Descripción

**Curetfy - COD Form** es una aplicación de Shopify que permite a los merchants crear formularios de pedido simplificados con pago contra entrega (Cash on Delivery). Los clientes completan el formulario y el pedido se envía directamente al WhatsApp del merchant.

### Características Principales

- Formulario COD de 1-click
- Integración nativa con WhatsApp (wa.me)
- Optimizado para mercados LATAM (RD, Colombia, México, etc.)
- Dashboard de administración embebido
- Theme App Extension (sin modificar código del tema)
- Cumple requisitos "Built for Shopify"

## Documentación

| Documento | Descripción |
|-----------|-------------|
| [FASE-1-MVP.md](./docs/FASE-1-MVP.md) | MVP para Shopify App Store |
| [FASE-2-BUILT-FOR-SHOPIFY.md](./docs/FASE-2-BUILT-FOR-SHOPIFY.md) | Certificación Built for Shopify |
| [FASE-3-ESCALAMIENTO.md](./docs/FASE-3-ESCALAMIENTO.md) | Features avanzados y escalamiento |
| [ARQUITECTURA.md](./docs/ARQUITECTURA.md) | Arquitectura técnica completa |
| [API.md](./docs/API.md) | Especificaciones de API |
| [THEME-EXTENSION.md](./docs/THEME-EXTENSION.md) | Theme App Extension specs |

## Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Framework | Remix (template oficial Shopify) |
| UI | Polaris React |
| Database | PostgreSQL + Prisma |
| Sessions | Redis |
| Hosting | Contabo VPS + AWS CloudFront |
| Theme Extension | Liquid + Vanilla JS |

## Estructura del Proyecto

```
curetfy/
├── app/                          # Remix application
│   ├── routes/                   # App routes
│   ├── components/               # Polaris components
│   └── lib/                      # Utilities
├── extensions/
│   └── cod-form/                 # Theme App Extension
├── prisma/
│   └── schema.prisma             # Database schema
├── docs/                         # Documentation
├── shopify.app.toml              # Shopify app config
└── package.json
```

## Planes de Precios

| Plan | Precio | Órdenes/Mes | Características |
|------|--------|-------------|-----------------|
| **Free** | $0 | 60 | Formulario básico, 1 número WhatsApp |
| **Pro** | $7.99/mes | 500 | Upsells, quantity offers, analytics |
| **Business** | $19.99/mes | 2,000 | Multi-WhatsApp, Google Sheets, Pixel |
| **Unlimited** | $49.99/mes | ∞ | Todo + soporte prioritario |

## Requisitos Previos

- Node.js 18+
- Cuenta Shopify Partners
- Tienda de desarrollo Shopify
- PostgreSQL
- Redis (producción)

## Desarrollo Local

```bash
# Clonar repositorio
git clone https://github.com/curetcore/curetfy.git
cd curetfy

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar desarrollo
npm run dev
```

## Roadmap

- [x] Documentación inicial
- [ ] **Fase 1**: MVP (App Store Ready)
- [ ] **Fase 2**: Built for Shopify certification
- [ ] **Fase 3**: Features avanzados

## Equipo

- **Curetcore** - Desarrollo y mantenimiento

## Licencia

Propietario - Curetcore © 2024
