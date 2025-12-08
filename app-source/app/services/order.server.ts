import prisma from "../db.server";

// ============================================================================
// CONSTANTS
// ============================================================================

export const PLAN_LIMITS: Record<string, number> = {
  FREE: 100,
  PRO: Infinity,
};

export const BILLING_CYCLE_DAYS = 30;

// Currency to locale mapping for proper formatting
export const CURRENCY_LOCALE_MAP: Record<string, string> = {
  USD: "en-US",
  DOP: "es-DO",
  COP: "es-CO",
  MXN: "es-MX",
  PEN: "es-PE",
  CLP: "es-CL",
  ARS: "es-AR",
  EUR: "es-ES",
  BRL: "pt-BR",
  GTQ: "es-GT",
  HNL: "es-HN",
  NIO: "es-NI",
  PAB: "es-PA",
  CRC: "es-CR",
  PYG: "es-PY",
  UYU: "es-UY",
  BOB: "es-BO",
  VES: "es-VE",
};

// ============================================================================
// TYPES
// ============================================================================

export interface CustomerData {
  name: string;
  phone: string;
  email?: string;
  address: string;
  address2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
}

export interface OrderRequestBody {
  shop: string;
  productId: string;
  productTitle: string;
  variantId?: string;
  variantTitle?: string;
  productImage?: string;
  quantity?: number;
  price: string;
  compareAtPrice?: string;
  currency?: string;
  customer: CustomerData;
  shippingRate?: {
    name: string;
    price: number;
  };
  codFee?: number;
  discount?: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

export interface OrderResult {
  orderId: string;
  orderNumber: string;
  subtotal: string;
  shipping: string;
  codFee: string;
  discount: string;
  total: string;
  currency: string;
  whatsappLink: string | null;
  whatsappNumber: string | null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format currency with proper locale
 */
export function formatCurrency(amount: number, currency: string): string {
  try {
    const locale = CURRENCY_LOCALE_MAP[currency] || "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Parse customer name into first and last name
 */
export function parseCustomerName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ");
  return { firstName, lastName };
}

/**
 * Replace template variables - supports both {var} and {{var}} formats
 */
export function replaceTemplateVariables(template: string, data: Record<string, string>): string {
  let result = template;

  Object.entries(data).forEach(([key, value]) => {
    // Replace both {key} and {{key}} formats
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  });

  return result;
}

/**
 * Validate and clean phone number for WhatsApp
 */
export function cleanPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  return phone.replace(/\D/g, "");
}

/**
 * Validate WhatsApp number is usable
 */
export function isValidWhatsAppNumber(phone: string | null | undefined): boolean {
  if (!phone) return false;
  const cleaned = cleanPhoneNumber(phone);
  // WhatsApp numbers should be at least 10 digits (with country code)
  return cleaned.length >= 10;
}

/**
 * Generate WhatsApp link with all template variables
 */
export function generateWhatsAppLink(params: {
  phone: string;
  template: string;
  data: Record<string, string>;
}): string | null {
  const cleanPhone = cleanPhoneNumber(params.phone);

  if (!cleanPhone || cleanPhone.length < 10) {
    return null;
  }

  const message = replaceTemplateVariables(params.template, params.data);
  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Check if billing cycle needs reset and reset if necessary
 */
export async function checkAndResetBillingCycle(shopId: string, billingCycleStart: Date): Promise<boolean> {
  const now = new Date();
  const cycleStart = new Date(billingCycleStart);
  const daysSinceCycleStart = Math.floor((now.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceCycleStart >= BILLING_CYCLE_DAYS) {
    // Reset billing cycle
    await prisma.shop.update({
      where: { id: shopId },
      data: {
        ordersThisMonth: 0,
        billingCycleStart: now,
      },
    });
    return true;
  }

  return false;
}

/**
 * Get shop by domain
 */
export async function getShopByDomain(shopDomain: string) {
  return prisma.shop.findUnique({
    where: { shopDomain },
  });
}

/**
 * Get shop by ID
 */
export async function getShopById(shopId: string) {
  return prisma.shop.findUnique({
    where: { id: shopId },
  });
}

/**
 * Create order with atomic transaction
 */
export async function createOrderWithTransaction(params: {
  shopId: string;
  customer: CustomerData;
  productId: string;
  productTitle: string;
  variantId?: string;
  variantTitle?: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  shippingCost: number;
  shippingRateName?: string;
  codFee: number;
  discount: number;
  total: number;
  currency: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}) {
  return prisma.$transaction(async (tx) => {
    // Atomically increment order sequence and get new value
    const updatedShop = await tx.shop.update({
      where: { id: params.shopId },
      data: {
        orderSequence: { increment: 1 },
        ordersThisMonth: { increment: 1 },
      },
      select: { orderSequence: true },
    });

    // Generate order number from atomic sequence
    const orderNumber = `COD-${String(updatedShop.orderSequence).padStart(5, "0")}`;

    // Create order with all fields
    const order = await tx.order.create({
      data: {
        shopId: params.shopId,
        shopifyOrderNumber: orderNumber,
        customerName: params.customer.name,
        customerPhone: params.customer.phone,
        customerEmail: params.customer.email || null,
        customerAddress: params.customer.address,
        customerCity: params.customer.city || null,
        customerProvince: params.customer.province || "",
        customerCountry: params.customer.country || "",
        customerNotes: params.customer.notes || null,
        productId: params.productId,
        productTitle: params.productTitle,
        productVariantId: params.variantId || null,
        productVariantTitle: params.variantTitle || null,
        productImage: params.productImage || null,
        quantity: params.quantity,
        unitPrice: params.unitPrice,
        subtotal: params.subtotal,
        shippingCost: params.shippingCost,
        shippingRateName: params.shippingRateName || null,
        codFee: params.codFee,
        discount: params.discount,
        total: params.total,
        currency: params.currency,
        status: "PENDING",
        // UTM tracking
        utmSource: params.utmSource || null,
        utmMedium: params.utmMedium || null,
        utmCampaign: params.utmCampaign || null,
        utmTerm: params.utmTerm || null,
        utmContent: params.utmContent || null,
      },
    });

    return { order, orderNumber };
  }, {
    timeout: 10000, // 10 second timeout
  });
}

/**
 * Build template data for WhatsApp message
 */
export function buildTemplateData(params: {
  orderNumber: string;
  orderId: string;
  customer: CustomerData;
  productTitle: string;
  variantTitle?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  shippingCost: number;
  shippingRateName?: string;
  codFee: number;
  discount: number;
  total: number;
  currency: string;
}): Record<string, string> {
  const { firstName, lastName } = parseCustomerName(params.customer.name);

  return {
    // Order info
    order_number: params.orderNumber,
    order_id: params.orderId,
    order_total: formatCurrency(params.total, params.currency),

    // Customer info - multiple formats for flexibility
    first_name: firstName,
    last_name: lastName,
    name: params.customer.name,
    nombre: params.customer.name,
    phone: params.customer.phone,
    telefono: params.customer.phone,
    email: params.customer.email || "",
    correo: params.customer.email || "",

    // Address info
    address: params.customer.address,
    direccion: params.customer.address,
    address2: params.customer.address2 || "",
    city: params.customer.city || "",
    ciudad: params.customer.city || "",
    province: params.customer.province || "",
    provincia: params.customer.province || "",
    postal_code: params.customer.postalCode || "",
    codigo_postal: params.customer.postalCode || "",
    country: params.customer.country || "",
    pais: params.customer.country || "",
    notes: params.customer.notes || "",
    notas: params.customer.notes || "",

    // Product info
    product: params.productTitle,
    producto: params.productTitle,
    product_title: params.productTitle,
    variant: params.variantTitle || "",
    variante: params.variantTitle || "",
    quantity: String(params.quantity),
    cantidad: String(params.quantity),

    // Financial info
    subtotal: formatCurrency(params.subtotal, params.currency),
    shipping: formatCurrency(params.shippingCost, params.currency),
    envio: formatCurrency(params.shippingCost, params.currency),
    shipping_rate_name: params.shippingRateName || "N/A",
    cod_fee: formatCurrency(params.codFee, params.currency),
    cargo_cod: formatCurrency(params.codFee, params.currency),
    discount: formatCurrency(params.discount, params.currency),
    descuento: formatCurrency(params.discount, params.currency),
    total: formatCurrency(params.total, params.currency),

    // Legacy variable names for backwards compatibility
    orderNumber: params.orderNumber,
    products_summary_with_quantity: `${params.quantity}x ${params.productTitle} (${formatCurrency(params.unitPrice, params.currency)})`,
    productos: `${params.quantity}x ${params.productTitle} (${formatCurrency(params.unitPrice, params.currency)})`,
  };
}
