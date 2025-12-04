# Curetfy - Notas de Deployment

## Errores Comunes y Soluciones

### 1. Prisma Migration con DATETIME (SQLite vs PostgreSQL)

**Error:**
```
Database error code: 42704
ERROR: type "datetime" does not exist
```

**Causa:** El template de Shopify Remix usa SQLite por defecto, que usa `DATETIME`. PostgreSQL usa `TIMESTAMP`.

**Solución:**
- Eliminar las migraciones generadas para SQLite: `rm -rf prisma/migrations/`
- Crear nuevas migraciones manualmente con sintaxis PostgreSQL
- Usar `TIMESTAMP(3)` en lugar de `DATETIME`

```sql
-- SQLite (incorrecto para PostgreSQL)
"expires" DATETIME

-- PostgreSQL (correcto)
"expires" TIMESTAMP(3)
```

---

### 2. Conflicto de Versiones de Prisma

**Error:**
```
npm error peer @prisma/client@"^6.6.0" from @shopify/shopify-app-session-storage-prisma@6.0.9
```

**Causa:** `@shopify/shopify-app-session-storage-prisma` requiere Prisma 6.x, no 7.x

**Solución:**
```bash
npm install prisma@6.19.0 @prisma/client@6.19.0 --save-exact
```

---

### 3. package-lock.json en .gitignore

**Error:**
```
npm error The `npm ci` command can only install with an existing package-lock.json
```

**Causa:** El template incluye `package-lock.json` en `.gitignore`

**Solución:**
- Remover `package-lock.json` del `.gitignore`
- Generar el lockfile: `npm install --package-lock-only`
- Commit y push del lockfile

---

### 4. Migraciones Fallidas en Base de Datos

**Error:**
```
Error: P3009 - migrate found failed migrations in the target database
```

**Causa:** Una migración anterior falló y quedó registrada

**Solución:**
```bash
# Resetear el schema de PostgreSQL
docker exec <container> psql -U curetfy -d curetfy -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'

# O solo la tabla de migraciones
docker exec <container> psql -U curetfy -d curetfy -c 'DROP TABLE IF EXISTS _prisma_migrations CASCADE;'
```

---

### 5. Pantalla en Blanco (Missing Root Route)

**Error:** La app carga pero muestra pantalla en blanco

**Causa:** Falta la ruta raíz (`_index.tsx`) que redirige a `/app`

**Solución:** Crear `app/routes/_index.tsx`:
```typescript
import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const searchParams = url.searchParams.toString();
  const redirectUrl = searchParams ? `/app?${searchParams}` : "/app";
  return redirect(redirectUrl);
};
```

---

## Configuración de Producción

### Variables de Entorno Requeridas

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=disable
SHOPIFY_API_KEY=tu_api_key
SHOPIFY_API_SECRET=tu_api_secret
SHOPIFY_APP_URL=https://app.tudominio.com
SCOPES=read_products,write_products,read_orders,write_orders,write_draft_orders,read_customers,write_customers
```

### Shopify Partners - Configuración

1. **Scopes requeridos:**
   ```
   read_products,write_products,read_orders,write_orders,write_draft_orders,read_customers,write_customers
   ```

2. **Redirect URLs:**
   ```
   https://app.tudominio.com/auth/callback
   https://app.tudominio.com/auth/shopify/callback
   https://app.tudominio.com/api/auth/callback
   ```

3. **GDPR Webhooks:** Configurados automáticamente en `shopify.app.toml`

---

## Estructura de Archivos Críticos

```
app-source/
├── prisma/
│   ├── schema.prisma          # Schema con provider "postgresql"
│   └── migrations/
│       ├── migration_lock.toml # provider = "postgresql"
│       └── 20241204000000_init/
│           └── migration.sql   # SQL con sintaxis PostgreSQL
├── app/
│   └── routes/
│       ├── _index.tsx         # Redirect a /app (IMPORTANTE)
│       ├── app.tsx            # Layout principal
│       └── app._index.tsx     # Dashboard
├── .gitignore                 # SIN package-lock.json
├── package.json               # Prisma 6.x (NO 7.x)
└── Dockerfile                 # Multi-stage build
```

---

## Checklist Pre-Deployment

- [ ] `package-lock.json` NO está en `.gitignore`
- [ ] Prisma versión 6.x (compatible con Shopify)
- [ ] Migraciones con sintaxis PostgreSQL (`TIMESTAMP` no `DATETIME`)
- [ ] Ruta `_index.tsx` existe y redirige a `/app`
- [ ] Variables de entorno configuradas en Easypanel
- [ ] Base de datos PostgreSQL creada y accesible
- [ ] `shopify.app.toml` tiene el `client_id` correcto

---

### 6. Theme Extension - Schema Inválido

**Error:**
```
Invalid tag 'schema': unknown key 'presets'
Invalid tag 'schema': enabled_on.groups[0]: must be one of header, footer, aside
```

**Causa:** Los App Blocks tienen restricciones de schema diferentes a los Theme Sections

**Solución:**
- Remover `presets` del schema (solo aplica a sections, no app blocks)
- En `enabled_on.groups`, solo usar: `header`, `footer`, `aside` (no `body`)
- O simplemente usar solo `templates` sin `groups`:
```json
"enabled_on": {
  "templates": ["product"]
}
```

---

### 7. shopify.app.toml - Campos Faltantes/Obsoletos

**Error:**
```
Validation errors in shopify.app.toml:
• [embedded]: Boolean is required
• Unsupported section(s): scopes
```

**Causa:** Nuevas versiones del Shopify CLI requieren formato actualizado

**Solución:**
```toml
# Agregar campo embedded a nivel raíz
embedded = true

# Cambiar scopes a access_scopes
[access_scopes]
scopes = "read_products,write_products,..."
```

---

### 8. Shopify CLI Desactualizado

**Error:**
```
CLI version 3.83.2 is no longer supported
```

**Solución:**
```bash
npm install -g @shopify/cli@latest
```

---

## Theme Extension Deployment

Para desplegar cambios en la Theme Extension:

```bash
cd app-source
shopify app deploy --force
```

**Nota:** Requiere autenticación con Shopify Partners. El CLI mostrará un código para verificar en el navegador.

---

## Comandos Útiles

```bash
# Ver logs del contenedor
docker logs <container_name> --tail 100

# Resetear base de datos
docker exec <db_container> psql -U user -d database -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'

# Verificar tablas
docker exec <db_container> psql -U user -d database -c '\dt'

# Re-generar package-lock.json
npm install --package-lock-only
```
