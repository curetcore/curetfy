-- Update existing placeholder values to remove "Ej: " prefix
UPDATE "Shop" SET "placeholderName" = 'Juan Pérez' WHERE "placeholderName" = 'Ej: Juan Pérez';
UPDATE "Shop" SET "placeholderPhone" = '809-555-1234' WHERE "placeholderPhone" = 'Ej: 809-555-1234';
UPDATE "Shop" SET "placeholderEmail" = 'juan@email.com' WHERE "placeholderEmail" = 'Ej: juan@email.com';
UPDATE "Shop" SET "placeholderCity" = 'Santo Domingo' WHERE "placeholderCity" = 'Ej: Santo Domingo';
UPDATE "Shop" SET "placeholderPostal" = '10101' WHERE "placeholderPostal" = 'Ej: 10101';

-- Also update the column defaults
ALTER TABLE "Shop" ALTER COLUMN "placeholderName" SET DEFAULT 'Juan Pérez';
ALTER TABLE "Shop" ALTER COLUMN "placeholderPhone" SET DEFAULT '809-555-1234';
ALTER TABLE "Shop" ALTER COLUMN "placeholderEmail" SET DEFAULT 'juan@email.com';
ALTER TABLE "Shop" ALTER COLUMN "placeholderCity" SET DEFAULT 'Santo Domingo';
ALTER TABLE "Shop" ALTER COLUMN "placeholderPostal" SET DEFAULT '10101';
