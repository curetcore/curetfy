# Cómo contribuir

Curetfy COD Form es un proyecto privado de CURET / Curetcore. Este documento describe el proceso para contribuir al proyecto.

## Código de conducta

Todos los participantes deben leer nuestro [código de conducta](CODE_OF_CONDUCT.md) para entender qué acciones son aceptables.

## Reportar bugs

### Dónde encontrar issues conocidos

Todos los issues se rastrean en GitHub con la etiqueta [bug](https://github.com/curetcore/curetfy/labels/bug).

### Reportar nuevos issues

Para reducir duplicados, busca en los issues abiertos antes de crear uno nuevo. Al [abrir un issue](https://github.com/curetcore/curetfy/issues/new), completa la plantilla lo más posible.

## Pull requests

### Antes de enviar un PR

1. Asegúrate de que el código compila (`npm run build`)
2. Prueba los cambios en una tienda de desarrollo
3. Verifica que el deploy a Shopify funciona (`npm run deploy`)
4. Actualiza la documentación si es necesario
5. Agrega una entrada al CHANGELOG.md

### Proceso de revisión

Tu PR será revisado y se puede:
- Aprobar y mergear
- Solicitar cambios
- Cerrar con una explicación

## Estilo de código

- Usar TypeScript donde sea posible
- Seguir las convenciones de Polaris para componentes de UI
- Usar nombres descriptivos en español para variables de negocio
- Comentar código complejo

## Estructura del proyecto

```
app/routes/      # Rutas de Remix
extensions/      # Extensiones de tema de Shopify
prisma/          # Schema de base de datos
```
