-- Add Free Shipping fields
ALTER TABLE "Shop" ADD COLUMN "freeShippingEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Shop" ADD COLUMN "freeShippingThreshold" TEXT NOT NULL DEFAULT '2000';
ALTER TABLE "Shop" ADD COLUMN "freeShippingLabel" TEXT NOT NULL DEFAULT 'Envío gratis';

-- Add Store Pickup fields
ALTER TABLE "Shop" ADD COLUMN "enablePickup" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Shop" ADD COLUMN "pickupName" TEXT NOT NULL DEFAULT 'Recoger en tienda';
ALTER TABLE "Shop" ADD COLUMN "pickupAddress" TEXT;
ALTER TABLE "Shop" ADD COLUMN "pickupInstructions" TEXT;
