import { json, type LoaderFunctionArgs } from "@remix-run/node";
import prisma from "../db.server";

// Provinces by country
const PROVINCES: Record<string, { value: string; label: string }[]> = {
  DO: [
    { value: "Distrito Nacional", label: "Distrito Nacional" },
    { value: "Santo Domingo", label: "Santo Domingo" },
    { value: "Santiago", label: "Santiago" },
    { value: "La Vega", label: "La Vega" },
    { value: "San Cristóbal", label: "San Cristóbal" },
    { value: "Puerto Plata", label: "Puerto Plata" },
    { value: "Duarte", label: "Duarte" },
    { value: "La Romana", label: "La Romana" },
    { value: "San Pedro de Macorís", label: "San Pedro de Macorís" },
    { value: "Espaillat", label: "Espaillat" },
    { value: "Azua", label: "Azua" },
    { value: "Barahona", label: "Barahona" },
    { value: "Monte Plata", label: "Monte Plata" },
    { value: "Peravia", label: "Peravia" },
    { value: "Sánchez Ramírez", label: "Sánchez Ramírez" },
    { value: "Valverde", label: "Valverde" },
    { value: "Monseñor Nouel", label: "Monseñor Nouel" },
    { value: "María Trinidad Sánchez", label: "María Trinidad Sánchez" },
    { value: "Samaná", label: "Samaná" },
    { value: "Hermanas Mirabal", label: "Hermanas Mirabal" },
    { value: "Monte Cristi", label: "Monte Cristi" },
    { value: "Hato Mayor", label: "Hato Mayor" },
    { value: "El Seibo", label: "El Seibo" },
    { value: "La Altagracia", label: "La Altagracia" },
    { value: "San Juan", label: "San Juan" },
    { value: "Elías Piña", label: "Elías Piña" },
    { value: "Baoruco", label: "Baoruco" },
    { value: "Independencia", label: "Independencia" },
    { value: "Pedernales", label: "Pedernales" },
    { value: "Dajabón", label: "Dajabón" },
    { value: "Santiago Rodríguez", label: "Santiago Rodríguez" },
  ],
  CO: [
    { value: "Bogotá D.C.", label: "Bogotá D.C." },
    { value: "Antioquia", label: "Antioquia" },
    { value: "Valle del Cauca", label: "Valle del Cauca" },
    { value: "Atlántico", label: "Atlántico" },
    { value: "Cundinamarca", label: "Cundinamarca" },
    { value: "Santander", label: "Santander" },
    { value: "Bolívar", label: "Bolívar" },
    { value: "Nariño", label: "Nariño" },
    { value: "Córdoba", label: "Córdoba" },
    { value: "Tolima", label: "Tolima" },
    { value: "Norte de Santander", label: "Norte de Santander" },
    { value: "Boyacá", label: "Boyacá" },
    { value: "Cauca", label: "Cauca" },
    { value: "Magdalena", label: "Magdalena" },
    { value: "Huila", label: "Huila" },
    { value: "Cesar", label: "Cesar" },
    { value: "Risaralda", label: "Risaralda" },
    { value: "Caldas", label: "Caldas" },
    { value: "Meta", label: "Meta" },
    { value: "Sucre", label: "Sucre" },
  ],
  MX: [
    { value: "Ciudad de México", label: "Ciudad de México" },
    { value: "Estado de México", label: "Estado de México" },
    { value: "Jalisco", label: "Jalisco" },
    { value: "Nuevo León", label: "Nuevo León" },
    { value: "Puebla", label: "Puebla" },
    { value: "Guanajuato", label: "Guanajuato" },
    { value: "Chihuahua", label: "Chihuahua" },
    { value: "Veracruz", label: "Veracruz" },
    { value: "Michoacán", label: "Michoacán" },
    { value: "Oaxaca", label: "Oaxaca" },
    { value: "Chiapas", label: "Chiapas" },
    { value: "Guerrero", label: "Guerrero" },
    { value: "Tamaulipas", label: "Tamaulipas" },
    { value: "Baja California", label: "Baja California" },
    { value: "Sinaloa", label: "Sinaloa" },
    { value: "Coahuila", label: "Coahuila" },
    { value: "Sonora", label: "Sonora" },
    { value: "Hidalgo", label: "Hidalgo" },
    { value: "San Luis Potosí", label: "San Luis Potosí" },
    { value: "Tabasco", label: "Tabasco" },
  ],
  PE: [
    { value: "Lima", label: "Lima" },
    { value: "Arequipa", label: "Arequipa" },
    { value: "La Libertad", label: "La Libertad" },
    { value: "Piura", label: "Piura" },
    { value: "Callao", label: "Callao" },
    { value: "Cusco", label: "Cusco" },
    { value: "Junín", label: "Junín" },
    { value: "Lambayeque", label: "Lambayeque" },
    { value: "Ancash", label: "Ancash" },
    { value: "Ica", label: "Ica" },
  ],
  CL: [
    { value: "Santiago", label: "Región Metropolitana" },
    { value: "Valparaíso", label: "Valparaíso" },
    { value: "Biobío", label: "Biobío" },
    { value: "Maule", label: "Maule" },
    { value: "La Araucanía", label: "La Araucanía" },
    { value: "O'Higgins", label: "O'Higgins" },
    { value: "Los Lagos", label: "Los Lagos" },
    { value: "Coquimbo", label: "Coquimbo" },
    { value: "Antofagasta", label: "Antofagasta" },
    { value: "Los Ríos", label: "Los Ríos" },
  ],
  AR: [
    { value: "Buenos Aires", label: "Buenos Aires" },
    { value: "CABA", label: "Ciudad Autónoma de Buenos Aires" },
    { value: "Córdoba", label: "Córdoba" },
    { value: "Santa Fe", label: "Santa Fe" },
    { value: "Mendoza", label: "Mendoza" },
    { value: "Tucumán", label: "Tucumán" },
    { value: "Entre Ríos", label: "Entre Ríos" },
    { value: "Salta", label: "Salta" },
    { value: "Misiones", label: "Misiones" },
    { value: "Chaco", label: "Chaco" },
  ],
  EC: [
    { value: "Guayas", label: "Guayas" },
    { value: "Pichincha", label: "Pichincha" },
    { value: "Manabí", label: "Manabí" },
    { value: "Los Ríos", label: "Los Ríos" },
    { value: "Azuay", label: "Azuay" },
    { value: "El Oro", label: "El Oro" },
    { value: "Esmeraldas", label: "Esmeraldas" },
    { value: "Tungurahua", label: "Tungurahua" },
    { value: "Chimborazo", label: "Chimborazo" },
    { value: "Loja", label: "Loja" },
  ],
};

const COUNTRIES: Record<string, string> = {
  DO: "República Dominicana",
  CO: "Colombia",
  MX: "México",
  PE: "Perú",
  CL: "Chile",
  AR: "Argentina",
  EC: "Ecuador",
  VE: "Venezuela",
  PA: "Panamá",
  CR: "Costa Rica",
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const shopDomain = url.searchParams.get("shop");

  // CORS headers for cross-origin requests from storefront
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "public, max-age=60", // Cache for 1 minute
  };

  if (!shopDomain) {
    return json({ error: "Shop domain is required" }, { status: 400, headers });
  }

  try {
    const shop = await prisma.shop.findUnique({
      where: { shopDomain },
    });

    if (!shop) {
      // Return default config if shop not found
      return json({
        config: getDefaultConfig(),
        provinces: PROVINCES,
        countries: COUNTRIES,
      }, { headers });
    }

    // Build config object for storefront
    const config = {
      // WhatsApp
      whatsappNumber: shop.whatsappNumber || "",
      messageTemplate: shop.messageTemplate || "",

      // Order
      orderTagPrefix: shop.orderTagPrefix,
      orderTags: shop.orderTags,
      createDraftOrder: shop.createDraftOrder,
      orderNote: shop.orderNote,

      // Labels
      labels: {
        name: shop.labelName,
        phone: shop.labelPhone,
        email: shop.labelEmail,
        address: shop.labelAddress,
        city: shop.labelCity,
        province: shop.labelProvince,
        postalCode: shop.labelPostalCode,
        notes: shop.labelNotes,
        quantity: shop.labelQuantity,
      },

      // Placeholders
      placeholders: {
        name: shop.placeholderName,
        phone: shop.placeholderPhone,
        email: shop.placeholderEmail,
        address: shop.placeholderAddress,
        city: shop.placeholderCity,
        notes: shop.placeholderNotes,
        postalCode: shop.placeholderPostal,
      },

      // Field visibility
      fields: {
        showEmail: shop.showEmail,
        showCity: shop.showCity,
        showProvince: shop.showProvince,
        showPostalCode: shop.showPostalCode,
        showNotes: shop.showNotes,
        showQuantity: shop.showQuantity,
      },

      // Required fields
      required: {
        email: shop.requireEmail,
        city: shop.requireCity,
        province: shop.requireProvince,
        postalCode: shop.requirePostalCode,
        notes: shop.requireNotes,
      },

      // Modal
      modal: {
        title: shop.formTitle,
        subtitle: shop.formSubtitle,
        submitText: shop.submitButtonText,
        submitColor: shop.submitButtonColor,
        headerColor: shop.modalHeaderColor,
        accentColor: shop.modalAccentColor,
        showProductImage: shop.showProductImage,
        showProductPrice: shop.showProductPrice,
      },

      // Messages
      messages: {
        successTitle: shop.successTitle,
        successMessage: shop.successMessage,
        errorTitle: shop.errorTitle,
        errorMessage: shop.errorMessage,
      },

      // Countries
      countries: shop.countries,
      defaultCountry: shop.defaultCountry,

      // Advanced
      autoRedirectWhatsApp: shop.autoRedirectWhatsApp,
      redirectDelay: shop.redirectDelay,
      enableAnalytics: shop.enableAnalytics,
      enablePixel: shop.enablePixel,
      pixelId: shop.pixelId,

      // Customization
      fieldOrder: shop.fieldOrder || ["name", "phone", "email", "address", "city", "province", "postalCode", "notes", "quantity"],
      customImageUrl: shop.customImageUrl || "",
      customImagePosition: shop.customImagePosition || "none",
      customHtmlTop: shop.customHtmlTop || "",
      customHtmlBottom: shop.customHtmlBottom || "",
      customCss: shop.customCss || "",

      // Modal options
      hideCloseButton: shop.hideCloseButton ?? false,
      hideFieldLabels: shop.hideFieldLabels ?? false,
      enableRTL: shop.enableRTL ?? false,
      fullscreenMobile: shop.fullscreenMobile ?? true,

      // Shipping
      enableShipping: shop.enableShipping ?? false,
      shippingSource: shop.shippingSource || "custom",
      customShippingRates: shop.customShippingRates || [],

      // Custom Fields
      customFields: shop.customFields || [],
    };

    // Get provinces for enabled countries
    const enabledProvinces: Record<string, typeof PROVINCES.DO> = {};
    shop.countries.forEach(countryCode => {
      if (PROVINCES[countryCode]) {
        enabledProvinces[countryCode] = PROVINCES[countryCode];
      }
    });

    // Get country names for enabled countries
    const enabledCountries: Record<string, string> = {};
    shop.countries.forEach(countryCode => {
      if (COUNTRIES[countryCode]) {
        enabledCountries[countryCode] = COUNTRIES[countryCode];
      }
    });

    return json({
      config,
      provinces: enabledProvinces,
      countries: enabledCountries,
    }, { headers });

  } catch (error) {
    console.error("Error fetching config:", error);
    return json({
      error: "Failed to fetch config",
      config: getDefaultConfig(),
      provinces: PROVINCES,
      countries: COUNTRIES,
    }, { status: 500, headers });
  }
}

function getDefaultConfig() {
  return {
    whatsappNumber: "",
    messageTemplate: "🛒 *Nuevo Pedido*\n\n*Producto:* {{product}}\n*Total:* {{total}}\n\n*Cliente:* {{name}}\n*Teléfono:* {{phone}}\n*Dirección:* {{address}}",
    orderTagPrefix: "cod-form",
    orderTags: ["pago-contraentrega", "curetfy"],
    createDraftOrder: true,
    orderNote: "Pedido creado via Curetfy COD Form",
    labels: {
      name: "Nombre completo",
      phone: "Teléfono / WhatsApp",
      email: "Email (opcional)",
      address: "Dirección de entrega",
      city: "Ciudad",
      province: "Provincia / Estado",
      postalCode: "Código postal",
      notes: "Notas del pedido",
      quantity: "Cantidad",
    },
    placeholders: {
      name: "Ej: Juan Pérez",
      phone: "Ej: 809-555-1234",
      email: "Ej: juan@email.com",
      address: "Calle, número, sector...",
      city: "Ej: Santo Domingo",
      notes: "Instrucciones especiales...",
      postalCode: "Ej: 10101",
    },
    fields: {
      showEmail: false,
      showCity: true,
      showProvince: true,
      showPostalCode: false,
      showNotes: true,
      showQuantity: true,
    },
    required: {
      email: false,
      city: false,
      province: true,
      postalCode: false,
      notes: false,
    },
    modal: {
      title: "Completa tu pedido",
      subtitle: "Ingresa tus datos para recibir tu pedido",
      submitText: "Enviar pedido por WhatsApp",
      submitColor: "#25D366",
      headerColor: "#000000",
      accentColor: "#25D366",
      showProductImage: true,
      showProductPrice: true,
    },
    messages: {
      successTitle: "¡Pedido enviado!",
      successMessage: "Te redirigiremos a WhatsApp para confirmar tu pedido.",
      errorTitle: "Error",
      errorMessage: "Hubo un problema al procesar tu pedido. Intenta de nuevo.",
    },
    countries: ["DO"],
    defaultCountry: "DO",
    autoRedirectWhatsApp: true,
    redirectDelay: 2000,
    enableAnalytics: true,
    enablePixel: false,
    pixelId: "",
    // Customization
    fieldOrder: ["name", "phone", "email", "address", "city", "province", "postalCode", "notes", "quantity"],
    customImageUrl: "",
    customImagePosition: "none",
    customHtmlTop: "",
    customHtmlBottom: "",
    customCss: "",
    // Modal options
    hideCloseButton: false,
    hideFieldLabels: false,
    enableRTL: false,
    fullscreenMobile: true,
    // Shipping
    enableShipping: false,
    shippingSource: "custom",
    customShippingRates: [],
    // Custom Fields
    customFields: [],
  };
}

// Handle OPTIONS for CORS preflight
export async function action({ request }: LoaderFunctionArgs) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
  return json({ error: "Method not allowed" }, { status: 405 });
}
