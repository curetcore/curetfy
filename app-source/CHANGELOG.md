# Curetfy COD Form - Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

## [4.1.0] - 2024-12-04

### Mejorado
- Consolidar secciones del schema del botón a 6 headers (límite de Shopify)
- Corregir precisión decimal de hover_scale (máximo 1 dígito permitido)
- Usar iconos SVG inline en vez de snippet externo
- Eliminar variables Liquid no utilizadas

## [4.0.0] - 2024-12-04

### Agregado
- 11 animaciones de botón: pulse, glow, shake, bounce, wiggle, heartbeat, flash, rubber, swing, tada
- 10 tipos de iconos: WhatsApp, carrito, bolsa, teléfono, camión, check, estrella, corazón, rayo, escudo
- Texto secundario en botón: precio, precio con descuento, envío gratis, personalizado
- Hover personalizable con colores y escala
- Bordes configurables (ancho, estilo, color)
- Habilitado en páginas: producto, carrito, colección, index
- Alineación del botón: izquierda, centro, derecha
- Condiciones de visibilidad por stock

### Mejorado
- Widget del formulario completamente reescrito (v4.0.0)
- API config actualizada con 20+ nuevos campos
- CSS con nuevas animaciones y estilos

## [3.5.0] - 2024-12-03

### Agregado
- Consolidación de configuraciones duplicadas entre páginas
- Comisión COD (fija o porcentual)
- Límites de pedido (mínimo y máximo)
- Términos y condiciones con checkbox obligatorio
- Provincias bloqueadas para restringir entregas
- Plantilla de mensaje WhatsApp mejorada

## [3.0.0] - 2024-12-02

### Agregado
- Envío gratis con umbral mínimo configurable
- Barra de progreso para envío gratis
- Opción de recogida en tienda (pickup)
- Importación de tarifas de envío desde Shopify
- Drag & Drop para ordenar métodos de envío
- Múltiples zonas de envío

### Mejorado
- Interfaz de configuración de envíos rediseñada
- Vista previa del formulario en tiempo real

## [2.5.0] - 2024-12-01

### Agregado
- Configuración de impuestos con soporte ITBIS
- Cupones de descuento en el formulario
- Resumen de orden con desglose de costos
- Métodos de envío en la vista previa

### Mejorado
- Mover sección de envío arriba del formulario
- Mejor organización de pestañas de configuración

## [2.0.0] - 2024-11-30

### Agregado
- Campos personalizados ilimitados
- Tipos de campo: texto, textarea, select, checkbox, radio, número, email, teléfono
- Drag & Drop para ordenar campos
- Vista previa en tiempo real del formulario
- Iconos en el selector de campos
- Color de texto del header personalizable

### Mejorado
- Interfaz de administración con Polaris
- Valores por defecto sin prefijos de ejemplo
- Migración de base de datos para nuevos campos

## [1.0.0] - 2024-11-28

### Release inicial
- Formulario de pedido COD básico
- Integración con WhatsApp
- Campos estándar: nombre, teléfono, email, dirección, ciudad, provincia, notas
- Selector de cantidad
- Botón configurable desde el editor de tema
- Panel de administración básico
- Soporte para tiendas embebidas de Shopify
