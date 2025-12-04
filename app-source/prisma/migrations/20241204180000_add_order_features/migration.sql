-- COD Fee
ALTER TABLE "Shop" ADD COLUMN "enableCodFee" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Shop" ADD COLUMN "codFeeType" TEXT NOT NULL DEFAULT 'fixed';
ALTER TABLE "Shop" ADD COLUMN "codFeeAmount" TEXT NOT NULL DEFAULT '0';
ALTER TABLE "Shop" ADD COLUMN "codFeeLabel" TEXT NOT NULL DEFAULT 'Cargo por pago contra entrega';

-- Order Limits
ALTER TABLE "Shop" ADD COLUMN "enableMinOrder" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Shop" ADD COLUMN "minOrderAmount" TEXT NOT NULL DEFAULT '0';
ALTER TABLE "Shop" ADD COLUMN "minOrderMessage" TEXT NOT NULL DEFAULT 'El monto mínimo de compra es {monto}';
ALTER TABLE "Shop" ADD COLUMN "enableMaxOrder" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Shop" ADD COLUMN "maxOrderAmount" TEXT NOT NULL DEFAULT '0';
ALTER TABLE "Shop" ADD COLUMN "maxOrderMessage" TEXT NOT NULL DEFAULT 'El monto máximo de compra es {monto}';

-- Terms and Conditions
ALTER TABLE "Shop" ADD COLUMN "enableTerms" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Shop" ADD COLUMN "termsText" TEXT NOT NULL DEFAULT 'Acepto los términos y condiciones';
ALTER TABLE "Shop" ADD COLUMN "termsUrl" TEXT;
ALTER TABLE "Shop" ADD COLUMN "termsRequired" BOOLEAN NOT NULL DEFAULT true;

-- WhatsApp Template
ALTER TABLE "Shop" ADD COLUMN "whatsappTemplate" TEXT NOT NULL DEFAULT '*Nuevo Pedido*

*Cliente:* {nombre}
*Teléfono:* {telefono}
*Dirección:* {direccion}

*Productos:*
{productos}

*Subtotal:* {subtotal}
*Envío:* {envio}
*Total:* {total}';

-- Blocked Provinces
ALTER TABLE "Shop" ADD COLUMN "enableBlockedProvinces" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Shop" ADD COLUMN "blockedProvinces" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Shop" ADD COLUMN "blockedProvinceMessage" TEXT NOT NULL DEFAULT 'Lo sentimos, no realizamos envíos a esta provincia';
