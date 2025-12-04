-- Add Shop order configuration fields
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "orderTagPrefix" TEXT DEFAULT 'cod-form';
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "orderTags" TEXT[] DEFAULT ARRAY['pago-contraentrega', 'curetfy']::TEXT[];
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "createDraftOrder" BOOLEAN DEFAULT true;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "orderNote" TEXT DEFAULT 'Pedido creado via Curetfy COD Form';

-- Add Shop order options
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "useCodPaymentMethod" BOOLEAN DEFAULT true;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "saveUtmParams" BOOLEAN DEFAULT true;

-- Add Shop form options
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "disableAutoDiscounts" BOOLEAN DEFAULT false;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "disableAutocomplete" BOOLEAN DEFAULT false;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "removeLeadingZeroPhone" BOOLEAN DEFAULT false;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "addCodFormTag" BOOLEAN DEFAULT true;

-- Add Shop form labels
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "labelName" TEXT DEFAULT 'Nombre completo';
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "labelPhone" TEXT DEFAULT 'Teléfono / WhatsApp';
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "labelEmail" TEXT DEFAULT 'Email (opcional)';
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "labelAddress" TEXT DEFAULT 'Dirección de entrega';
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "labelCity" TEXT DEFAULT 'Ciudad';
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "labelProvince" TEXT DEFAULT 'Provincia / Estado';
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "labelPostalCode" TEXT DEFAULT 'Código postal';
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "labelNotes" TEXT DEFAULT 'Notas del pedido';
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "labelQuantity" TEXT DEFAULT 'Cantidad';

-- Add Shop form placeholders
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "placeholderName" TEXT DEFAULT 'Ej: Juan Pérez';
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "placeholderPhone" TEXT DEFAULT 'Ej: 809-555-1234';
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "placeholderEmail" TEXT DEFAULT 'Ej: juan@email.com';
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "placeholderAddress" TEXT DEFAULT 'Calle, número, sector...';
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "placeholderCity" TEXT DEFAULT 'Ej: Santo Domingo';
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "placeholderNotes" TEXT DEFAULT 'Instrucciones especiales...';
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "placeholderPostal" TEXT DEFAULT 'Ej: 10101';

-- Add Shop form fields visibility
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "showEmail" BOOLEAN DEFAULT false;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "showCity" BOOLEAN DEFAULT true;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "showProvince" BOOLEAN DEFAULT true;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "showPostalCode" BOOLEAN DEFAULT false;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "showNotes" BOOLEAN DEFAULT true;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "showQuantity" BOOLEAN DEFAULT true;

-- Add Shop form fields required
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "requireEmail" BOOLEAN DEFAULT false;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "requireCity" BOOLEAN DEFAULT false;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "requireProvince" BOOLEAN DEFAULT true;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "requirePostalCode" BOOLEAN DEFAULT false;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "requireNotes" BOOLEAN DEFAULT false;

-- Add Shop modal customization
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "formSubtitle" TEXT DEFAULT 'Ingresa tus datos para recibir tu pedido';
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "submitButtonText" TEXT DEFAULT 'Enviar pedido por WhatsApp';
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "submitButtonColor" TEXT DEFAULT '#25D366';
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "modalHeaderColor" TEXT DEFAULT '#000000';
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "modalAccentColor" TEXT DEFAULT '#25D366';
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "showProductImage" BOOLEAN DEFAULT true;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "showProductPrice" BOOLEAN DEFAULT true;

-- Add Shop field ordering and customization
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "fieldOrder" JSONB DEFAULT '["name", "phone", "email", "address", "city", "province", "postalCode", "notes", "quantity"]';
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "customFields" JSONB DEFAULT '[]';

-- Add Shop custom content
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "customImageUrl" TEXT;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "customImagePosition" TEXT DEFAULT 'none';
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "customHtmlTop" TEXT;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "customHtmlBottom" TEXT;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "customCss" TEXT;

-- Add Shop modal options
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "hideCloseButton" BOOLEAN DEFAULT false;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "hideFieldLabels" BOOLEAN DEFAULT false;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "enableRTL" BOOLEAN DEFAULT false;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "fullscreenMobile" BOOLEAN DEFAULT true;

-- Add Shop shipping rates
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "enableShipping" BOOLEAN DEFAULT false;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "shippingSource" TEXT DEFAULT 'custom';
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "customShippingRates" JSONB;

-- Add Shop success/error messages
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "successTitle" TEXT DEFAULT '¡Pedido enviado!';
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "successMessage" TEXT DEFAULT 'Te redirigiremos a WhatsApp para confirmar tu pedido.';
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "errorTitle" TEXT DEFAULT 'Error';
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "errorMessage" TEXT DEFAULT 'Hubo un problema al procesar tu pedido. Intenta de nuevo.';

-- Add Shop country/region configuration
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "provincesConfig" JSONB;

-- Add Shop product settings
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "enableAllProducts" BOOLEAN DEFAULT true;

-- Add Shop advanced settings
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "autoRedirectWhatsApp" BOOLEAN DEFAULT true;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "redirectDelay" INTEGER DEFAULT 2000;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "enableAnalytics" BOOLEAN DEFAULT true;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "enablePixel" BOOLEAN DEFAULT false;
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "pixelId" TEXT;

-- Add Order UTM tracking fields
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "utmSource" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "utmMedium" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "utmCampaign" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "utmTerm" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "utmContent" TEXT;

-- Create index for Order UTM tracking
CREATE INDEX IF NOT EXISTS "Order_shopId_utmSource_utmMedium_utmCampaign_idx" ON "Order"("shopId", "utmSource", "utmMedium", "utmCampaign");

-- Create FormOpen table
CREATE TABLE IF NOT EXISTS "FormOpen" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "productId" TEXT,
    "productTitle" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "pageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormOpen_pkey" PRIMARY KEY ("id")
);

-- Create indexes for FormOpen
CREATE INDEX IF NOT EXISTS "FormOpen_shopId_createdAt_idx" ON "FormOpen"("shopId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "FormOpen_shopId_utmSource_utmMedium_utmCampaign_idx" ON "FormOpen"("shopId", "utmSource", "utmMedium", "utmCampaign");

-- Add foreign key for FormOpen
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'FormOpen_shopId_fkey'
    ) THEN
        ALTER TABLE "FormOpen" ADD CONSTRAINT "FormOpen_shopId_fkey"
        FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
