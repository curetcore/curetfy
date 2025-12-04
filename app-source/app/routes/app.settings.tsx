import { useState, useCallback } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Button,
  BlockStack,
  Text,
  Banner,
  Select,
  Checkbox,
  Tabs,
  InlineStack,
  Divider,
  Badge,
  Box,
  Icon,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

// Default provinces by country
const PROVINCES_BY_COUNTRY: Record<string, { value: string; label: string }[]> = {
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
  ],
};

const COUNTRIES = [
  { value: "DO", label: "República Dominicana" },
  { value: "CO", label: "Colombia" },
  { value: "MX", label: "México" },
  { value: "PE", label: "Perú" },
  { value: "CL", label: "Chile" },
  { value: "AR", label: "Argentina" },
  { value: "EC", label: "Ecuador" },
  { value: "VE", label: "Venezuela" },
  { value: "PA", label: "Panamá" },
  { value: "CR", label: "Costa Rica" },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const shop = await prisma.shop.findUnique({
    where: { shopDomain: session.shop },
  });

  return json({ shop, provincesConfig: PROVINCES_BY_COUNTRY });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  // Parse all form fields
  const updateData: Record<string, any> = {};

  // Text fields
  const textFields = [
    'whatsappNumber', 'messageTemplate', 'orderTagPrefix', 'orderNote',
    'labelName', 'labelPhone', 'labelEmail', 'labelAddress', 'labelCity',
    'labelProvince', 'labelPostalCode', 'labelNotes', 'labelQuantity',
    'placeholderName', 'placeholderPhone', 'placeholderEmail', 'placeholderAddress',
    'placeholderCity', 'placeholderNotes', 'placeholderPostal',
    'formTitle', 'formSubtitle', 'submitButtonText', 'submitButtonColor',
    'modalHeaderColor', 'modalAccentColor',
    'successTitle', 'successMessage', 'errorTitle', 'errorMessage',
    'defaultCountry', 'pixelId',
    'buttonText', 'buttonColor', 'buttonTextColor',
    // Customization fields
    'customImageUrl', 'customImagePosition', 'customHtmlTop', 'customHtmlBottom', 'customCss',
    // Shipping
    'shippingSource'
  ];

  textFields.forEach(field => {
    const value = formData.get(field);
    if (value !== null) {
      updateData[field] = value as string;
    }
  });

  // Boolean fields
  const booleanFields = [
    'createDraftOrder', 'showEmail', 'showCity', 'showProvince', 'showPostalCode',
    'showNotes', 'showQuantity', 'requireEmail', 'requireCity', 'requireProvince',
    'requirePostalCode', 'requireNotes', 'showProductImage', 'showProductPrice',
    'enableAllProducts', 'autoRedirectWhatsApp', 'enableAnalytics', 'enablePixel',
    // Modal options
    'hideCloseButton', 'hideFieldLabels', 'enableRTL', 'fullscreenMobile',
    // Shipping
    'enableShipping'
  ];

  booleanFields.forEach(field => {
    const value = formData.get(field);
    updateData[field] = value === 'true' || value === 'on';
  });

  // Array fields
  const orderTags = formData.get('orderTags') as string;
  if (orderTags) {
    updateData.orderTags = orderTags.split(',').map(t => t.trim()).filter(Boolean);
  }

  const countries = formData.get('countries') as string;
  if (countries) {
    updateData.countries = countries.split(',').map(c => c.trim()).filter(Boolean);
  }

  // Number fields
  const redirectDelay = formData.get('redirectDelay');
  if (redirectDelay) {
    updateData.redirectDelay = parseInt(redirectDelay as string, 10) || 2000;
  }

  // JSON fields
  const fieldOrder = formData.get('fieldOrder');
  if (fieldOrder) {
    try {
      // If it's already a JSON string (array), parse it
      updateData.fieldOrder = JSON.parse(fieldOrder as string);
    } catch {
      // If it's a comma-separated string, split it
      updateData.fieldOrder = (fieldOrder as string).split(',').map(f => f.trim()).filter(Boolean);
    }
  }

  const customShippingRates = formData.get('customShippingRates');
  if (customShippingRates) {
    try {
      updateData.customShippingRates = JSON.parse(customShippingRates as string);
    } catch {
      updateData.customShippingRates = [];
    }
  }

  const customFields = formData.get('customFields');
  if (customFields) {
    try {
      updateData.customFields = JSON.parse(customFields as string);
    } catch {
      updateData.customFields = [];
    }
  }

  await prisma.shop.upsert({
    where: { shopDomain: session.shop },
    update: updateData,
    create: {
      shopDomain: session.shop,
      ...updateData,
    },
  });

  return json({ success: true });
};

// ============================================
// PREVIEW COMPONENTS
// ============================================

// WhatsApp Message Preview
function WhatsAppPreview({ template }: { template: string }) {
  const sampleData = {
    orderNumber: "COD-001",
    name: "Juan Pérez",
    phone: "+1 809 555 1234",
    email: "juan@email.com",
    address: "Calle Principal #123, Sector Centro",
    city: "Santo Domingo",
    province: "Distrito Nacional",
    country: "República Dominicana",
    postalCode: "10101",
    notes: "Entregar después de las 5pm",
    total: "RD$ 2,500.00",
  };

  // Sample products for the template
  const sampleProducts = [
    { title: "Camiseta Premium Negra", quantity: 2, price: "RD$ 1,250.00" },
    { title: "Pantalón Jogger Gris", quantity: 1, price: "RD$ 1,890.00" },
  ];

  let preview = template;

  // Handle products block - replace entire block with expanded products
  const productsBlockRegex = /\{\{#products\}\}([\s\S]*?)\{\{\/products\}\}/g;
  const productsMatch = template.match(productsBlockRegex);

  if (productsMatch) {
    // Get the template inside the products block
    const blockContent = productsMatch[0]
      .replace(/\{\{#products\}\}/, '')
      .replace(/\{\{\/products\}\}/, '');

    // Generate output for each sample product
    const productsOutput = sampleProducts.map(product => {
      return blockContent
        .replace(/\{\{title\}\}/g, product.title)
        .replace(/\{\{quantity\}\}/g, String(product.quantity))
        .replace(/\{\{price\}\}/g, product.price);
    }).join('');

    preview = preview.replace(productsBlockRegex, productsOutput);
  }

  // Replace simple variables (outside products block)
  preview = preview
    .replace(/\{\{orderNumber\}\}/g, sampleData.orderNumber)
    .replace(/\{\{name\}\}/g, sampleData.name)
    .replace(/\{\{phone\}\}/g, sampleData.phone)
    .replace(/\{\{email\}\}/g, sampleData.email)
    .replace(/\{\{address\}\}/g, sampleData.address)
    .replace(/\{\{city\}\}/g, sampleData.city)
    .replace(/\{\{province\}\}/g, sampleData.province)
    .replace(/\{\{country\}\}/g, sampleData.country)
    .replace(/\{\{postalCode\}\}/g, sampleData.postalCode)
    .replace(/\{\{notes\}\}/g, sampleData.notes)
    .replace(/\{\{total\}\}/g, sampleData.total)
    // Also handle legacy single product variables
    .replace(/\{\{product\}\}/g, "Camiseta Premium Negra")
    .replace(/\{\{quantity\}\}/g, "2")
    .replace(/\{\{price\}\}/g, "RD$ 1,250.00");

  return (
    <div style={{
      background: "#e5ddd5",
      borderRadius: "12px",
      padding: "16px",
      maxHeight: "400px",
      overflowY: "auto",
    }}>
      <div style={{
        background: "#dcf8c6",
        borderRadius: "8px",
        padding: "12px",
        maxWidth: "90%",
        marginLeft: "auto",
        boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
        whiteSpace: "pre-wrap",
        fontSize: "14px",
        lineHeight: "1.5",
      }}>
        {preview}
        <div style={{
          fontSize: "11px",
          color: "#667781",
          textAlign: "right",
          marginTop: "4px",
        }}>
          12:30 PM ✓✓
        </div>
      </div>
    </div>
  );
}

// Form/Modal Preview Component
function FormModalPreview({
  formState,
  previewType,
}: {
  formState: any;
  previewType: "form" | "fields" | "modal";
}) {
  const provinces = PROVINCES_BY_COUNTRY[formState.defaultCountry] || PROVINCES_BY_COUNTRY.DO;
  const fieldOrder = formState.fieldOrder as string[] || ["name", "phone", "email", "address", "city", "province", "postalCode", "notes", "quantity"];

  // Helper to check if a field is visible
  const isFieldVisible = (fieldId: string) => {
    if (fieldId === "name" || fieldId === "phone" || fieldId === "address") return true;
    if (fieldId === "email") return formState.showEmail;
    if (fieldId === "city") return formState.showCity;
    if (fieldId === "province") return formState.showProvince;
    if (fieldId === "postalCode") return formState.showPostalCode;
    if (fieldId === "notes") return formState.showNotes;
    if (fieldId === "quantity") return formState.showQuantity;
    return false;
  };

  // Helper to check if a field is required
  const isFieldRequired = (fieldId: string) => {
    if (fieldId === "name" || fieldId === "phone" || fieldId === "address") return true;
    if (fieldId === "email") return formState.requireEmail;
    if (fieldId === "city") return formState.requireCity;
    if (fieldId === "province") return formState.requireProvince;
    if (fieldId === "postalCode") return formState.requirePostalCode;
    if (fieldId === "notes") return formState.requireNotes;
    return false;
  };

  // Render individual field
  const renderField = (fieldId: string) => {
    if (!isFieldVisible(fieldId)) return null;

    const hideLabels = formState.hideFieldLabels;
    const fieldStyle = { marginBottom: "16px" };
    const labelStyle = {
      display: hideLabels ? "none" : "block",
      fontSize: "13px",
      fontWeight: 500,
      marginBottom: "6px",
      color: "#1a1a1a"
    };
    const inputStyle = {
      width: "100%",
      padding: "10px 12px",
      border: "1px solid #e1e3e5",
      borderRadius: "8px",
      fontSize: "14px",
      boxSizing: "border-box" as const,
    };

    switch (fieldId) {
      case "name":
        return (
          <div key={fieldId} style={fieldStyle}>
            <label style={labelStyle}>{formState.labelName || "Nombre completo"} *</label>
            <input type="text" placeholder={formState.placeholderName || "Ej: Juan Pérez"} readOnly style={inputStyle} />
          </div>
        );
      case "phone":
        return (
          <div key={fieldId} style={fieldStyle}>
            <label style={labelStyle}>{formState.labelPhone || "Teléfono / WhatsApp"} *</label>
            <input type="text" placeholder={formState.placeholderPhone || "Ej: 809-555-1234"} readOnly style={inputStyle} />
          </div>
        );
      case "email":
        return (
          <div key={fieldId} style={fieldStyle}>
            <label style={labelStyle}>{formState.labelEmail || "Email"} {isFieldRequired(fieldId) ? "*" : ""}</label>
            <input type="text" placeholder={formState.placeholderEmail || "Ej: juan@email.com"} readOnly style={inputStyle} />
          </div>
        );
      case "address":
        return (
          <div key={fieldId} style={fieldStyle}>
            <label style={labelStyle}>{formState.labelAddress || "Dirección de entrega"} *</label>
            <input type="text" placeholder={formState.placeholderAddress || "Calle, número, sector..."} readOnly style={inputStyle} />
          </div>
        );
      case "city":
        return (
          <div key={fieldId} style={fieldStyle}>
            <label style={labelStyle}>{formState.labelCity || "Ciudad"} {isFieldRequired(fieldId) ? "*" : ""}</label>
            <input type="text" placeholder={formState.placeholderCity || "Ej: Santo Domingo"} readOnly style={inputStyle} />
          </div>
        );
      case "province":
        return (
          <div key={fieldId} style={fieldStyle}>
            <label style={labelStyle}>{formState.labelProvince || "Provincia"} {isFieldRequired(fieldId) ? "*" : ""}</label>
            <select disabled style={{ ...inputStyle, background: "#fff" }}>
              <option>Seleccionar...</option>
              {provinces.slice(0, 3).map((p) => (<option key={p.value}>{p.label}</option>))}
            </select>
          </div>
        );
      case "postalCode":
        return (
          <div key={fieldId} style={fieldStyle}>
            <label style={labelStyle}>{formState.labelPostalCode || "Código postal"} {isFieldRequired(fieldId) ? "*" : ""}</label>
            <input type="text" placeholder={formState.placeholderPostal || "Ej: 10101"} readOnly style={inputStyle} />
          </div>
        );
      case "notes":
        return (
          <div key={fieldId} style={fieldStyle}>
            <label style={labelStyle}>{formState.labelNotes || "Notas del pedido"} {isFieldRequired(fieldId) ? "*" : ""}</label>
            <textarea placeholder={formState.placeholderNotes || "Instrucciones especiales..."} readOnly style={{ ...inputStyle, minHeight: "60px", resize: "none" }} />
          </div>
        );
      case "quantity":
        return (
          <div key={fieldId} style={fieldStyle}>
            <label style={labelStyle}>{formState.labelQuantity || "Cantidad"}</label>
            <div style={{ display: "flex", border: "1px solid #e1e3e5", borderRadius: "8px", overflow: "hidden", width: "fit-content" }}>
              <button style={{ width: "40px", border: "none", background: "#fafbfb", fontSize: "18px", cursor: "pointer" }}>−</button>
              <input type="text" value="1" readOnly style={{ width: "50px", textAlign: "center", border: "none", borderLeft: "1px solid #e1e3e5", borderRight: "1px solid #e1e3e5", fontSize: "14px", fontWeight: 500 }} />
              <button style={{ width: "40px", border: "none", background: "#fafbfb", fontSize: "18px", cursor: "pointer" }}>+</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Custom image component
  const CustomImage = () => {
    if (!formState.customImageUrl || formState.customImagePosition === "none") return null;
    return (
      <div style={{ padding: "12px 20px", textAlign: "center" }}>
        <img
          src={formState.customImageUrl}
          alt="Custom"
          style={{ maxWidth: "100%", maxHeight: "150px", borderRadius: "8px" }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </div>
    );
  };

  // Check RTL and other modal options
  const isRTL = formState.enableRTL;
  const hideLabels = formState.hideFieldLabels;
  const hideClose = formState.hideCloseButton;

  return (
    <div style={{
      background: "#fff",
      borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      overflow: "hidden",
      maxWidth: "100%",
      direction: isRTL ? "rtl" : "ltr",
    }}>
      {/* Custom CSS Preview Notice */}
      {formState.customCss && (
        <div style={{ background: "#f0f4ff", padding: "8px 12px", fontSize: "11px", color: "#5c6ac4" }}>
          CSS personalizado aplicado
        </div>
      )}

      {/* RTL Notice */}
      {isRTL && (
        <div style={{ background: "#fff3cd", padding: "8px 12px", fontSize: "11px", color: "#856404" }}>
          Modo RTL activado
        </div>
      )}

      {/* Modal Header */}
      <div style={{
        background: formState.modalHeaderColor || "#000",
        color: "#fff",
        padding: "16px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span style={{ fontWeight: 600, fontSize: "17px" }}>
          {formState.formTitle || "Completa tu pedido"}
        </span>
        {!hideClose && (
          <span style={{ cursor: "pointer", fontSize: "20px" }}>×</span>
        )}
      </div>

      {/* Custom Image - Top */}
      {formState.customImagePosition === "top" && <CustomImage />}

      {/* Product Summary */}
      {formState.showProductImage && (
        <div style={{
          display: "flex",
          gap: "12px",
          padding: "16px 20px",
          background: "#fafbfb",
          borderBottom: "1px solid #e1e3e5",
        }}>
          <div style={{
            width: "64px",
            height: "64px",
            background: "#e1e3e5",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#6b7177",
            fontSize: "24px",
          }}>
            📦
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: "14px", color: "#1a1a1a" }}>
              Producto de Ejemplo
            </div>
            {formState.showProductPrice && (
              <div style={{ fontWeight: 600, fontSize: "15px", color: "#1a1a1a", marginTop: "4px" }}>
                RD$ 1,250.00
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Image - After Product */}
      {formState.customImagePosition === "after_product" && <CustomImage />}

      {/* Subtitle */}
      {formState.formSubtitle && (
        <div style={{
          padding: "12px 20px",
          background: "#f6f6f7",
          fontSize: "13px",
          color: "#6b7177",
          textAlign: "center",
        }}>
          {formState.formSubtitle}
        </div>
      )}

      {/* Form Fields */}
      <div style={{ padding: "20px" }}>
        {/* Custom HTML Top */}
        {formState.customHtmlTop && (
          <div
            style={{ marginBottom: "16px", padding: "12px", background: "#f9fafb", borderRadius: "8px", fontSize: "13px" }}
            dangerouslySetInnerHTML={{ __html: formState.customHtmlTop }}
          />
        )}

        {/* Render fields in order */}
        {fieldOrder.map((fieldId) => renderField(fieldId))}

        {/* Render custom fields */}
        {(formState.customFields as any[] || []).map((field: any) => {
          const fieldStyle = { marginBottom: "16px" };
          const labelStyle = {
            display: formState.hideFieldLabels ? "none" : "block",
            fontSize: "13px",
            fontWeight: 500,
            marginBottom: "6px",
            color: "#1a1a1a"
          };
          const inputStyle = {
            width: "100%",
            padding: "10px 12px",
            border: "1px solid #e1e3e5",
            borderRadius: "8px",
            fontSize: "14px",
            boxSizing: "border-box" as const,
          };

          switch (field.type) {
            case "text":
            case "number":
              return (
                <div key={field.id} style={fieldStyle}>
                  <label style={labelStyle}>{field.label} {field.required ? "*" : ""}</label>
                  <input type={field.type} placeholder={field.placeholder || ""} readOnly style={inputStyle} />
                </div>
              );
            case "textarea":
              return (
                <div key={field.id} style={fieldStyle}>
                  <label style={labelStyle}>{field.label} {field.required ? "*" : ""}</label>
                  <textarea placeholder={field.placeholder || ""} readOnly style={{ ...inputStyle, minHeight: "60px", resize: "none" }} />
                </div>
              );
            case "select":
              return (
                <div key={field.id} style={fieldStyle}>
                  <label style={labelStyle}>{field.label} {field.required ? "*" : ""}</label>
                  <select disabled style={{ ...inputStyle, background: "#fff" }}>
                    <option>Seleccionar...</option>
                    {(field.options || []).map((opt: string, i: number) => (<option key={i}>{opt}</option>))}
                  </select>
                </div>
              );
            case "radio":
              return (
                <div key={field.id} style={fieldStyle}>
                  <label style={labelStyle}>{field.label} {field.required ? "*" : ""}</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                    {(field.options || []).map((opt: string, i: number) => (
                      <label key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer" }}>
                        <input type="radio" name={field.id} disabled style={{ margin: 0 }} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              );
            case "checkbox":
              return (
                <div key={field.id} style={{ ...fieldStyle, display: "flex", alignItems: "center", gap: "8px" }}>
                  <input type="checkbox" disabled style={{ margin: 0, width: "18px", height: "18px" }} />
                  <label style={{ fontSize: "14px", color: "#1a1a1a" }}>{field.label} {field.required ? "*" : ""}</label>
                </div>
              );
            case "date":
              return (
                <div key={field.id} style={fieldStyle}>
                  <label style={labelStyle}>{field.label} {field.required ? "*" : ""}</label>
                  <input type="date" readOnly style={inputStyle} />
                </div>
              );
            case "heading":
              return (
                <div key={field.id} style={{ ...fieldStyle, padding: "8px 0" }}>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "#1a1a1a" }}>{field.label}</div>
                </div>
              );
            case "image":
              return field.imageUrl ? (
                <div key={field.id} style={{ ...fieldStyle, textAlign: "center" }}>
                  <img src={field.imageUrl} alt={field.label} style={{ maxWidth: "100%", maxHeight: "120px", borderRadius: "8px" }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              ) : null;
            case "link_button":
              return (
                <div key={field.id} style={{ ...fieldStyle, textAlign: "center" }}>
                  <a href="#" style={{
                    display: "inline-block",
                    padding: "10px 20px",
                    background: "#f6f6f7",
                    color: "#1a1a1a",
                    textDecoration: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 500,
                    border: "1px solid #e1e3e5",
                  }}>
                    {field.label}
                  </a>
                </div>
              );
            default:
              return null;
          }
        })}

        {/* Custom Image - Bottom */}
        {formState.customImagePosition === "bottom" && <CustomImage />}

        {/* Custom HTML Bottom */}
        {formState.customHtmlBottom && (
          <div
            style={{ marginBottom: "16px", padding: "12px", background: "#f9fafb", borderRadius: "8px", fontSize: "13px" }}
            dangerouslySetInnerHTML={{ __html: formState.customHtmlBottom }}
          />
        )}

        {/* Total */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 0",
          borderTop: "1px solid #e1e3e5",
          fontWeight: 600,
        }}>
          <span>Total:</span>
          <span style={{ fontSize: "17px" }}>RD$ 1,250.00</span>
        </div>

        {/* Submit Button */}
        <button style={{
          width: "100%",
          padding: "14px 20px",
          background: formState.submitButtonColor || "#25D366",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontSize: "15px",
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          {formState.submitButtonText || "Enviar pedido por WhatsApp"}
        </button>
      </div>
    </div>
  );
}

// Success Message Preview
function SuccessPreview({ formState }: { formState: any }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      padding: "48px 24px",
      textAlign: "center",
    }}>
      <div style={{ marginBottom: "16px" }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="#008060">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
      <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 600, color: "#1a1a1a" }}>
        {formState.successTitle || "¡Pedido enviado!"}
      </h3>
      <p style={{ margin: "0 0 24px", color: "#6b7177", fontSize: "14px", lineHeight: 1.5 }}>
        {formState.successMessage || "Te redirigiremos a WhatsApp para confirmar tu pedido."}
      </p>
      <a
        href="#"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 24px",
          background: "#25D366",
          color: "#fff",
          textDecoration: "none",
          borderRadius: "8px",
          fontWeight: 600,
          fontSize: "15px",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Abrir WhatsApp
      </a>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function Settings() {
  const { shop } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [selectedTab, setSelectedTab] = useState(0);
  const [showSaved, setShowSaved] = useState(false);

  const [formState, setFormState] = useState({
    // WhatsApp
    whatsappNumber: shop?.whatsappNumber || "",
    messageTemplate: shop?.messageTemplate || "🛒 *Nuevo Pedido #{{orderNumber}}*\n\n{{#products}}*Producto:* {{title}}\n*Cantidad:* {{quantity}}\n*Precio:* {{price}}\n{{/products}}\n*Total:* {{total}}\n\n*Cliente:* {{name}}\n*Teléfono:* {{phone}}\n*Dirección:* {{address}}\n*Ciudad:* {{city}}\n*Provincia:* {{province}}",

    // Order Config
    orderTagPrefix: shop?.orderTagPrefix || "cod-form",
    orderTags: (shop?.orderTags || ["pago-contraentrega", "curetfy"]).join(", "),
    createDraftOrder: shop?.createDraftOrder ?? true,
    orderNote: shop?.orderNote || "Pedido creado via Curetfy COD Form",

    // Labels
    labelName: shop?.labelName || "Nombre completo",
    labelPhone: shop?.labelPhone || "Teléfono / WhatsApp",
    labelEmail: shop?.labelEmail || "Email (opcional)",
    labelAddress: shop?.labelAddress || "Dirección de entrega",
    labelCity: shop?.labelCity || "Ciudad",
    labelProvince: shop?.labelProvince || "Provincia / Estado",
    labelPostalCode: shop?.labelPostalCode || "Código postal",
    labelNotes: shop?.labelNotes || "Notas del pedido",
    labelQuantity: shop?.labelQuantity || "Cantidad",

    // Placeholders
    placeholderName: shop?.placeholderName || "Ej: Juan Pérez",
    placeholderPhone: shop?.placeholderPhone || "Ej: 809-555-1234",
    placeholderEmail: shop?.placeholderEmail || "Ej: juan@email.com",
    placeholderAddress: shop?.placeholderAddress || "Calle, número, sector...",
    placeholderCity: shop?.placeholderCity || "Ej: Santo Domingo",
    placeholderNotes: shop?.placeholderNotes || "Instrucciones especiales...",
    placeholderPostal: shop?.placeholderPostal || "Ej: 10101",

    // Visibility
    showEmail: shop?.showEmail ?? false,
    showCity: shop?.showCity ?? true,
    showProvince: shop?.showProvince ?? true,
    showPostalCode: shop?.showPostalCode ?? false,
    showNotes: shop?.showNotes ?? true,
    showQuantity: shop?.showQuantity ?? true,

    // Required
    requireEmail: shop?.requireEmail ?? false,
    requireCity: shop?.requireCity ?? false,
    requireProvince: shop?.requireProvince ?? true,
    requirePostalCode: shop?.requirePostalCode ?? false,
    requireNotes: shop?.requireNotes ?? false,

    // Modal
    formTitle: shop?.formTitle || "Completa tu pedido",
    formSubtitle: shop?.formSubtitle || "Ingresa tus datos para recibir tu pedido",
    submitButtonText: shop?.submitButtonText || "Enviar pedido por WhatsApp",
    submitButtonColor: shop?.submitButtonColor || "#25D366",
    modalHeaderColor: shop?.modalHeaderColor || "#000000",
    modalAccentColor: shop?.modalAccentColor || "#25D366",
    showProductImage: shop?.showProductImage ?? true,
    showProductPrice: shop?.showProductPrice ?? true,

    // Messages
    successTitle: shop?.successTitle || "¡Pedido enviado!",
    successMessage: shop?.successMessage || "Te redirigiremos a WhatsApp para confirmar tu pedido.",
    errorTitle: shop?.errorTitle || "Error",
    errorMessage: shop?.errorMessage || "Hubo un problema al procesar tu pedido. Intenta de nuevo.",

    // Countries
    countries: (shop?.countries || ["DO"]).join(", "),
    defaultCountry: shop?.defaultCountry || "DO",

    // Advanced
    autoRedirectWhatsApp: shop?.autoRedirectWhatsApp ?? true,
    redirectDelay: shop?.redirectDelay?.toString() || "2000",
    enableAnalytics: shop?.enableAnalytics ?? true,
    enablePixel: shop?.enablePixel ?? false,
    pixelId: shop?.pixelId || "",
    enableAllProducts: shop?.enableAllProducts ?? true,

    // Field Order & Customization
    fieldOrder: shop?.fieldOrder || ["name", "phone", "email", "address", "city", "province", "postalCode", "notes", "quantity"],
    customImageUrl: shop?.customImageUrl || "",
    customImagePosition: shop?.customImagePosition || "none",
    customHtmlTop: shop?.customHtmlTop || "",
    customHtmlBottom: shop?.customHtmlBottom || "",
    customCss: shop?.customCss || "",

    // Modal Options
    hideCloseButton: shop?.hideCloseButton ?? false,
    hideFieldLabels: shop?.hideFieldLabels ?? false,
    enableRTL: shop?.enableRTL ?? false,
    fullscreenMobile: shop?.fullscreenMobile ?? true,

    // Shipping
    enableShipping: shop?.enableShipping ?? false,
    shippingSource: shop?.shippingSource || "custom",
    customShippingRates: shop?.customShippingRates || [],

    // Custom Fields
    customFields: shop?.customFields || [],
  });

  const handleChange = useCallback((field: string) => (value: string | boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = () => {
    const data = new FormData();
    Object.entries(formState).forEach(([key, value]) => {
      // Serialize arrays and objects as JSON
      if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        data.append(key, JSON.stringify(value));
      } else {
        data.append(key, String(value));
      }
    });
    submit(data, { method: "POST" });
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  // Handler for field order changes
  const moveField = useCallback((fromIndex: number, toIndex: number) => {
    setFormState((prev) => {
      const newOrder = [...(prev.fieldOrder as string[])];
      const [removed] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, removed);
      return { ...prev, fieldOrder: newOrder };
    });
  }, []);

  const tabs = [
    { id: "whatsapp", content: "WhatsApp", accessibilityLabel: "WhatsApp" },
    { id: "form", content: "Formulario", accessibilityLabel: "Formulario" },
    { id: "fields", content: "Campos", accessibilityLabel: "Campos" },
    { id: "modal", content: "Modal", accessibilityLabel: "Modal" },
    { id: "custom-fields", content: "Campos extras", accessibilityLabel: "Campos extras" },
    { id: "customize", content: "Personalizar", accessibilityLabel: "Personalizar" },
    { id: "orders", content: "Pedidos", accessibilityLabel: "Pedidos" },
    { id: "advanced", content: "Avanzado", accessibilityLabel: "Avanzado" },
  ];

  // Field labels for drag and drop
  const fieldLabels: Record<string, string> = {
    name: formState.labelName || "Nombre completo",
    phone: formState.labelPhone || "Teléfono / WhatsApp",
    email: formState.labelEmail || "Email",
    address: formState.labelAddress || "Dirección de entrega",
    city: formState.labelCity || "Ciudad",
    province: formState.labelProvince || "Provincia",
    postalCode: formState.labelPostalCode || "Código postal",
    notes: formState.labelNotes || "Notas",
    quantity: formState.labelQuantity || "Cantidad",
  };

  // Determine if we should show preview
  const showPreview = selectedTab <= 5; // WhatsApp, Formulario, Campos, Modal, Campos extras, Personalizar

  return (
    <Page
      backAction={{ content: "Dashboard", url: "/app" }}
      title="Configuración"
      primaryAction={{
        content: "Guardar cambios",
        onAction: handleSubmit,
        loading: isSubmitting,
      }}
    >
      <TitleBar title="Configuración" />

      {showSaved && (
        <Box paddingBlockEnd="400">
          <Banner tone="success" onDismiss={() => setShowSaved(false)}>
            Configuración guardada correctamente
          </Banner>
        </Box>
      )}

      {!shop?.whatsappNumber && (
        <Box paddingBlockEnd="400">
          <Banner tone="warning">
            Configura tu número de WhatsApp para empezar a recibir pedidos.
          </Banner>
        </Box>
      )}

      <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
        <Box paddingBlockStart="400">
          {/* TAB: WhatsApp */}
          {selectedTab === 0 && (
            <Layout>
              <Layout.Section>
                <Card>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">Configuración de WhatsApp</Text>
                    <FormLayout>
                      <TextField
                        label="Número de WhatsApp"
                        value={formState.whatsappNumber}
                        onChange={handleChange("whatsappNumber")}
                        placeholder="+1 809 555 1234"
                        helpText="Incluye el código de país. Los pedidos se enviarán a este número."
                        autoComplete="tel"
                      />
                      <TextField
                        label="Plantilla de mensaje"
                        value={formState.messageTemplate}
                        onChange={handleChange("messageTemplate")}
                        multiline={8}
                        helpText="Variables: {{orderNumber}}, {{name}}, {{phone}}, {{address}}, {{city}}, {{province}}, {{total}}, {{#products}}...{{/products}}"
                      />
                    </FormLayout>
                  </BlockStack>
                </Card>

                <Box paddingBlockStart="400">
                  <Card>
                    <BlockStack gap="400">
                      <Text as="h2" variant="headingMd">Variables disponibles</Text>
                      <BlockStack gap="200">
                        <Text as="p" variant="bodySm"><Badge>{"{{orderNumber}}"}</Badge> - Número de orden</Text>
                        <Text as="p" variant="bodySm"><Badge>{"{{name}}"}</Badge> - Nombre del cliente</Text>
                        <Text as="p" variant="bodySm"><Badge>{"{{phone}}"}</Badge> - Teléfono del cliente</Text>
                        <Text as="p" variant="bodySm"><Badge>{"{{email}}"}</Badge> - Email del cliente</Text>
                        <Text as="p" variant="bodySm"><Badge>{"{{address}}"}</Badge> - Dirección de entrega</Text>
                        <Text as="p" variant="bodySm"><Badge>{"{{city}}"}</Badge> - Ciudad</Text>
                        <Text as="p" variant="bodySm"><Badge>{"{{province}}"}</Badge> - Provincia/Estado</Text>
                        <Text as="p" variant="bodySm"><Badge>{"{{notes}}"}</Badge> - Notas del pedido</Text>
                        <Text as="p" variant="bodySm"><Badge>{"{{total}}"}</Badge> - Total del pedido</Text>
                        <Text as="p" variant="bodySm"><Badge>{"{{#products}}...{{/products}}"}</Badge> - Lista de productos</Text>
                      </BlockStack>
                    </BlockStack>
                  </Card>
                </Box>
              </Layout.Section>

              {/* PREVIEW: WhatsApp */}
              <Layout.Section variant="oneThird">
                <Card>
                  <BlockStack gap="400">
                    <InlineStack align="space-between">
                      <Text as="h2" variant="headingMd">Vista previa</Text>
                      <Badge tone="info">En tiempo real</Badge>
                    </InlineStack>
                    <WhatsAppPreview template={formState.messageTemplate} />
                  </BlockStack>
                </Card>
              </Layout.Section>
            </Layout>
          )}

          {/* TAB: Form Labels & Placeholders */}
          {selectedTab === 1 && (
            <Layout>
              <Layout.Section>
                <Card>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">Etiquetas de campos</Text>
                    <FormLayout>
                      <FormLayout.Group>
                        <TextField label="Nombre" value={formState.labelName} onChange={handleChange("labelName")} autoComplete="off" />
                        <TextField label="Teléfono" value={formState.labelPhone} onChange={handleChange("labelPhone")} autoComplete="off" />
                      </FormLayout.Group>
                      <FormLayout.Group>
                        <TextField label="Email" value={formState.labelEmail} onChange={handleChange("labelEmail")} autoComplete="off" />
                        <TextField label="Dirección" value={formState.labelAddress} onChange={handleChange("labelAddress")} autoComplete="off" />
                      </FormLayout.Group>
                      <FormLayout.Group>
                        <TextField label="Ciudad" value={formState.labelCity} onChange={handleChange("labelCity")} autoComplete="off" />
                        <TextField label="Provincia" value={formState.labelProvince} onChange={handleChange("labelProvince")} autoComplete="off" />
                      </FormLayout.Group>
                      <FormLayout.Group>
                        <TextField label="Código postal" value={formState.labelPostalCode} onChange={handleChange("labelPostalCode")} autoComplete="off" />
                        <TextField label="Notas" value={formState.labelNotes} onChange={handleChange("labelNotes")} autoComplete="off" />
                      </FormLayout.Group>
                      <TextField label="Cantidad" value={formState.labelQuantity} onChange={handleChange("labelQuantity")} autoComplete="off" />
                    </FormLayout>
                  </BlockStack>
                </Card>

                <Box paddingBlockStart="400">
                  <Card>
                    <BlockStack gap="400">
                      <Text as="h2" variant="headingMd">Placeholders (texto de ayuda)</Text>
                      <FormLayout>
                        <FormLayout.Group>
                          <TextField label="Nombre" value={formState.placeholderName} onChange={handleChange("placeholderName")} autoComplete="off" />
                          <TextField label="Teléfono" value={formState.placeholderPhone} onChange={handleChange("placeholderPhone")} autoComplete="off" />
                        </FormLayout.Group>
                        <FormLayout.Group>
                          <TextField label="Email" value={formState.placeholderEmail} onChange={handleChange("placeholderEmail")} autoComplete="off" />
                          <TextField label="Dirección" value={formState.placeholderAddress} onChange={handleChange("placeholderAddress")} autoComplete="off" />
                        </FormLayout.Group>
                        <FormLayout.Group>
                          <TextField label="Ciudad" value={formState.placeholderCity} onChange={handleChange("placeholderCity")} autoComplete="off" />
                          <TextField label="Notas" value={formState.placeholderNotes} onChange={handleChange("placeholderNotes")} autoComplete="off" />
                        </FormLayout.Group>
                        <TextField label="Código postal" value={formState.placeholderPostal} onChange={handleChange("placeholderPostal")} autoComplete="off" />
                      </FormLayout>
                    </BlockStack>
                  </Card>
                </Box>
              </Layout.Section>

              {/* PREVIEW: Form */}
              <Layout.Section variant="oneThird">
                <Card>
                  <BlockStack gap="400">
                    <InlineStack align="space-between">
                      <Text as="h2" variant="headingMd">Vista previa</Text>
                      <Badge tone="info">En tiempo real</Badge>
                    </InlineStack>
                    <FormModalPreview formState={formState} previewType="form" />
                  </BlockStack>
                </Card>
              </Layout.Section>
            </Layout>
          )}

          {/* TAB: Field Visibility & Requirements */}
          {selectedTab === 2 && (
            <Layout>
              <Layout.Section>
                <Card>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">Campos visibles</Text>
                    <Text as="p" variant="bodySm" tone="subdued">Nombre, Teléfono y Dirección siempre son visibles y requeridos.</Text>
                    <FormLayout>
                      <InlineStack gap="400" wrap>
                        <Checkbox label="Email" checked={formState.showEmail} onChange={handleChange("showEmail")} />
                        <Checkbox label="Ciudad" checked={formState.showCity} onChange={handleChange("showCity")} />
                        <Checkbox label="Provincia" checked={formState.showProvince} onChange={handleChange("showProvince")} />
                        <Checkbox label="Código postal" checked={formState.showPostalCode} onChange={handleChange("showPostalCode")} />
                        <Checkbox label="Notas" checked={formState.showNotes} onChange={handleChange("showNotes")} />
                        <Checkbox label="Selector de cantidad" checked={formState.showQuantity} onChange={handleChange("showQuantity")} />
                      </InlineStack>
                    </FormLayout>
                  </BlockStack>
                </Card>

                <Box paddingBlockStart="400">
                  <Card>
                    <BlockStack gap="400">
                      <Text as="h2" variant="headingMd">Campos requeridos</Text>
                      <Text as="p" variant="bodySm" tone="subdued">Solo aplica a campos que están visibles.</Text>
                      <FormLayout>
                        <InlineStack gap="400" wrap>
                          <Checkbox label="Email requerido" checked={formState.requireEmail} onChange={handleChange("requireEmail")} disabled={!formState.showEmail} />
                          <Checkbox label="Ciudad requerida" checked={formState.requireCity} onChange={handleChange("requireCity")} disabled={!formState.showCity} />
                          <Checkbox label="Provincia requerida" checked={formState.requireProvince} onChange={handleChange("requireProvince")} disabled={!formState.showProvince} />
                          <Checkbox label="Código postal requerido" checked={formState.requirePostalCode} onChange={handleChange("requirePostalCode")} disabled={!formState.showPostalCode} />
                          <Checkbox label="Notas requeridas" checked={formState.requireNotes} onChange={handleChange("requireNotes")} disabled={!formState.showNotes} />
                        </InlineStack>
                      </FormLayout>
                    </BlockStack>
                  </Card>
                </Box>

                <Box paddingBlockStart="400">
                  <Card>
                    <BlockStack gap="400">
                      <Text as="h2" variant="headingMd">Países y regiones</Text>
                      <FormLayout>
                        <TextField
                          label="Países habilitados"
                          value={formState.countries}
                          onChange={handleChange("countries")}
                          helpText="Códigos ISO separados por coma: DO, CO, MX, PE, CL, AR"
                          autoComplete="off"
                        />
                        <Select
                          label="País por defecto"
                          options={COUNTRIES}
                          value={formState.defaultCountry}
                          onChange={handleChange("defaultCountry")}
                        />
                      </FormLayout>
                    </BlockStack>
                  </Card>
                </Box>
              </Layout.Section>

              {/* PREVIEW: Fields */}
              <Layout.Section variant="oneThird">
                <Card>
                  <BlockStack gap="400">
                    <InlineStack align="space-between">
                      <Text as="h2" variant="headingMd">Vista previa</Text>
                      <Badge tone="info">En tiempo real</Badge>
                    </InlineStack>
                    <FormModalPreview formState={formState} previewType="fields" />
                  </BlockStack>
                </Card>
              </Layout.Section>
            </Layout>
          )}

          {/* TAB: Modal Customization */}
          {selectedTab === 3 && (
            <Layout>
              <Layout.Section>
                <Card>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">Textos del modal</Text>
                    <FormLayout>
                      <TextField
                        label="Título del formulario"
                        value={formState.formTitle}
                        onChange={handleChange("formTitle")}
                        autoComplete="off"
                      />
                      <TextField
                        label="Subtítulo"
                        value={formState.formSubtitle}
                        onChange={handleChange("formSubtitle")}
                        autoComplete="off"
                      />
                      <TextField
                        label="Texto del botón de envío"
                        value={formState.submitButtonText}
                        onChange={handleChange("submitButtonText")}
                        autoComplete="off"
                      />
                    </FormLayout>
                  </BlockStack>
                </Card>

                <Box paddingBlockStart="400">
                  <Card>
                    <BlockStack gap="400">
                      <Text as="h2" variant="headingMd">Colores del modal</Text>
                      <FormLayout>
                        <FormLayout.Group>
                          <TextField
                            label="Color del botón de envío"
                            value={formState.submitButtonColor}
                            onChange={handleChange("submitButtonColor")}
                            prefix={
                              <div style={{
                                width: "20px",
                                height: "20px",
                                borderRadius: "4px",
                                background: formState.submitButtonColor,
                                border: "1px solid #ddd",
                              }} />
                            }
                            autoComplete="off"
                          />
                          <TextField
                            label="Color del encabezado"
                            value={formState.modalHeaderColor}
                            onChange={handleChange("modalHeaderColor")}
                            prefix={
                              <div style={{
                                width: "20px",
                                height: "20px",
                                borderRadius: "4px",
                                background: formState.modalHeaderColor,
                                border: "1px solid #ddd",
                              }} />
                            }
                            autoComplete="off"
                          />
                        </FormLayout.Group>
                        <TextField
                          label="Color de acento"
                          value={formState.modalAccentColor}
                          onChange={handleChange("modalAccentColor")}
                          prefix={
                            <div style={{
                              width: "20px",
                              height: "20px",
                              borderRadius: "4px",
                              background: formState.modalAccentColor,
                              border: "1px solid #ddd",
                            }} />
                          }
                          autoComplete="off"
                        />
                      </FormLayout>
                    </BlockStack>
                  </Card>
                </Box>

                <Box paddingBlockStart="400">
                  <Card>
                    <BlockStack gap="400">
                      <Text as="h2" variant="headingMd">Opciones de visualización</Text>
                      <FormLayout>
                        <Checkbox
                          label="Mostrar imagen del producto"
                          checked={formState.showProductImage}
                          onChange={handleChange("showProductImage")}
                        />
                        <Checkbox
                          label="Mostrar precio del producto"
                          checked={formState.showProductPrice}
                          onChange={handleChange("showProductPrice")}
                        />
                      </FormLayout>
                    </BlockStack>
                  </Card>
                </Box>

                <Box paddingBlockStart="400">
                  <Card>
                    <BlockStack gap="400">
                      <Text as="h2" variant="headingMd">Mensajes de éxito y error</Text>
                      <FormLayout>
                        <FormLayout.Group>
                          <TextField label="Título de éxito" value={formState.successTitle} onChange={handleChange("successTitle")} autoComplete="off" />
                          <TextField label="Título de error" value={formState.errorTitle} onChange={handleChange("errorTitle")} autoComplete="off" />
                        </FormLayout.Group>
                        <TextField
                          label="Mensaje de éxito"
                          value={formState.successMessage}
                          onChange={handleChange("successMessage")}
                          multiline={2}
                          autoComplete="off"
                        />
                        <TextField
                          label="Mensaje de error"
                          value={formState.errorMessage}
                          onChange={handleChange("errorMessage")}
                          multiline={2}
                          autoComplete="off"
                        />
                      </FormLayout>
                    </BlockStack>
                  </Card>
                </Box>
              </Layout.Section>

              {/* PREVIEW: Modal */}
              <Layout.Section variant="oneThird">
                <BlockStack gap="400">
                  <Card>
                    <BlockStack gap="400">
                      <InlineStack align="space-between">
                        <Text as="h2" variant="headingMd">Vista previa del modal</Text>
                        <Badge tone="info">En tiempo real</Badge>
                      </InlineStack>
                      <FormModalPreview formState={formState} previewType="modal" />
                    </BlockStack>
                  </Card>

                  <Card>
                    <BlockStack gap="400">
                      <Text as="h2" variant="headingMd">Vista previa: Éxito</Text>
                      <SuccessPreview formState={formState} />
                    </BlockStack>
                  </Card>
                </BlockStack>
              </Layout.Section>
            </Layout>
          )}

          {/* TAB: Campos extras (Custom Fields) */}
          {selectedTab === 4 && (
            <Layout>
              <Layout.Section>
                <Card>
                  <BlockStack gap="400">
                    <InlineStack align="space-between">
                      <Text as="h2" variant="headingMd">Campos personalizados</Text>
                      <Button
                        onClick={() => {
                          const newField = {
                            id: `field_${Date.now()}`,
                            type: "text",
                            label: "Nuevo campo",
                            placeholder: "",
                            required: false,
                            options: [],
                          };
                          setFormState(prev => ({
                            ...prev,
                            customFields: [...(prev.customFields as any[]), newField]
                          }));
                        }}
                      >
                        Agregar campo
                      </Button>
                    </InlineStack>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Agrega campos adicionales al formulario como selectores, checkboxes, fechas, etc.
                    </Text>

                    {(formState.customFields as any[]).length === 0 ? (
                      <Banner tone="info">
                        <p>No hay campos personalizados. Haz clic en "Agregar campo" para crear uno.</p>
                      </Banner>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {(formState.customFields as any[]).map((field, index) => (
                          <Card key={field.id}>
                            <BlockStack gap="300">
                              <InlineStack align="space-between">
                                <InlineStack gap="200">
                                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                    <button
                                      onClick={() => {
                                        if (index > 0) {
                                          const newFields = [...(formState.customFields as any[])];
                                          [newFields[index], newFields[index - 1]] = [newFields[index - 1], newFields[index]];
                                          setFormState(prev => ({ ...prev, customFields: newFields }));
                                        }
                                      }}
                                      disabled={index === 0}
                                      style={{ background: "none", border: "none", cursor: index === 0 ? "default" : "pointer", opacity: index === 0 ? 0.3 : 1, padding: "2px" }}
                                    >
                                      ▲
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (index < (formState.customFields as any[]).length - 1) {
                                          const newFields = [...(formState.customFields as any[])];
                                          [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
                                          setFormState(prev => ({ ...prev, customFields: newFields }));
                                        }
                                      }}
                                      disabled={index === (formState.customFields as any[]).length - 1}
                                      style={{ background: "none", border: "none", cursor: index === (formState.customFields as any[]).length - 1 ? "default" : "pointer", opacity: index === (formState.customFields as any[]).length - 1 ? 0.3 : 1, padding: "2px" }}
                                    >
                                      ▼
                                    </button>
                                  </div>
                                  <Badge tone={field.required ? "attention" : "info"}>
                                    {field.type === "text" && "Texto"}
                                    {field.type === "textarea" && "Área de texto"}
                                    {field.type === "select" && "Desplegable"}
                                    {field.type === "radio" && "Selección única"}
                                    {field.type === "checkbox" && "Casilla"}
                                    {field.type === "date" && "Fecha"}
                                    {field.type === "number" && "Número"}
                                    {field.type === "heading" && "Título"}
                                    {field.type === "image" && "Imagen"}
                                    {field.type === "link_button" && "Botón con enlace"}
                                  </Badge>
                                  <Text as="span" fontWeight="semibold">{field.label}</Text>
                                </InlineStack>
                                <Button
                                  tone="critical"
                                  variant="plain"
                                  onClick={() => {
                                    const newFields = (formState.customFields as any[]).filter((_, i) => i !== index);
                                    setFormState(prev => ({ ...prev, customFields: newFields }));
                                  }}
                                >
                                  Eliminar
                                </Button>
                              </InlineStack>

                              <FormLayout>
                                <FormLayout.Group>
                                  <Select
                                    label="Tipo de campo"
                                    options={[
                                      { value: "text", label: "Campo de texto" },
                                      { value: "textarea", label: "Área de texto" },
                                      { value: "select", label: "Campo desplegable" },
                                      { value: "radio", label: "Selección única (radio)" },
                                      { value: "checkbox", label: "Casilla de verificación" },
                                      { value: "date", label: "Selector de fecha" },
                                      { value: "number", label: "Campo numérico" },
                                      { value: "heading", label: "Título o texto" },
                                      { value: "image", label: "Imagen o GIF" },
                                      { value: "link_button", label: "Botón con enlace" },
                                    ]}
                                    value={field.type}
                                    onChange={(value) => {
                                      const newFields = [...(formState.customFields as any[])];
                                      newFields[index] = { ...field, type: value };
                                      setFormState(prev => ({ ...prev, customFields: newFields }));
                                    }}
                                  />
                                  <TextField
                                    label="Etiqueta"
                                    value={field.label}
                                    onChange={(value) => {
                                      const newFields = [...(formState.customFields as any[])];
                                      newFields[index] = { ...field, label: value };
                                      setFormState(prev => ({ ...prev, customFields: newFields }));
                                    }}
                                    autoComplete="off"
                                  />
                                </FormLayout.Group>

                                {/* Placeholder for text/textarea/number */}
                                {["text", "textarea", "number"].includes(field.type) && (
                                  <TextField
                                    label="Placeholder"
                                    value={field.placeholder || ""}
                                    onChange={(value) => {
                                      const newFields = [...(formState.customFields as any[])];
                                      newFields[index] = { ...field, placeholder: value };
                                      setFormState(prev => ({ ...prev, customFields: newFields }));
                                    }}
                                    autoComplete="off"
                                  />
                                )}

                                {/* Options for select/radio */}
                                {["select", "radio"].includes(field.type) && (
                                  <TextField
                                    label="Opciones (separadas por coma)"
                                    value={(field.options || []).join(", ")}
                                    onChange={(value) => {
                                      const newFields = [...(formState.customFields as any[])];
                                      newFields[index] = { ...field, options: value.split(",").map(o => o.trim()).filter(Boolean) };
                                      setFormState(prev => ({ ...prev, customFields: newFields }));
                                    }}
                                    placeholder="Opción 1, Opción 2, Opción 3"
                                    autoComplete="off"
                                  />
                                )}

                                {/* URL for link_button */}
                                {field.type === "link_button" && (
                                  <TextField
                                    label="URL del enlace"
                                    value={field.url || ""}
                                    onChange={(value) => {
                                      const newFields = [...(formState.customFields as any[])];
                                      newFields[index] = { ...field, url: value };
                                      setFormState(prev => ({ ...prev, customFields: newFields }));
                                    }}
                                    placeholder="https://ejemplo.com/terminos"
                                    autoComplete="off"
                                  />
                                )}

                                {/* Image URL for image */}
                                {field.type === "image" && (
                                  <TextField
                                    label="URL de la imagen"
                                    value={field.imageUrl || ""}
                                    onChange={(value) => {
                                      const newFields = [...(formState.customFields as any[])];
                                      newFields[index] = { ...field, imageUrl: value };
                                      setFormState(prev => ({ ...prev, customFields: newFields }));
                                    }}
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                    autoComplete="off"
                                  />
                                )}

                                {/* Required checkbox (not for decorative types) */}
                                {!["heading", "image", "link_button"].includes(field.type) && (
                                  <Checkbox
                                    label="Campo requerido"
                                    checked={field.required}
                                    onChange={(value) => {
                                      const newFields = [...(formState.customFields as any[])];
                                      newFields[index] = { ...field, required: value };
                                      setFormState(prev => ({ ...prev, customFields: newFields }));
                                    }}
                                  />
                                )}
                              </FormLayout>
                            </BlockStack>
                          </Card>
                        ))}
                      </div>
                    )}
                  </BlockStack>
                </Card>

                <Box paddingBlockStart="400">
                  <Card>
                    <BlockStack gap="300">
                      <Text as="h2" variant="headingMd">Tipos de campos disponibles</Text>
                      <BlockStack gap="200">
                        <Text as="p" variant="bodySm"><Badge>Texto</Badge> Campo de texto simple</Text>
                        <Text as="p" variant="bodySm"><Badge>Área de texto</Badge> Para textos largos</Text>
                        <Text as="p" variant="bodySm"><Badge>Desplegable</Badge> Selección de opciones en dropdown</Text>
                        <Text as="p" variant="bodySm"><Badge>Selección única</Badge> Radio buttons</Text>
                        <Text as="p" variant="bodySm"><Badge>Casilla</Badge> Checkbox (ej: acepto términos)</Text>
                        <Text as="p" variant="bodySm"><Badge>Fecha</Badge> Selector de fecha</Text>
                        <Text as="p" variant="bodySm"><Badge>Número</Badge> Solo números</Text>
                        <Text as="p" variant="bodySm"><Badge tone="subdued">Título</Badge> Texto decorativo</Text>
                        <Text as="p" variant="bodySm"><Badge tone="subdued">Imagen</Badge> Imagen o GIF decorativo</Text>
                        <Text as="p" variant="bodySm"><Badge tone="subdued">Botón enlace</Badge> Botón que abre URL</Text>
                      </BlockStack>
                    </BlockStack>
                  </Card>
                </Box>
              </Layout.Section>

              {/* PREVIEW: Campos extras */}
              <Layout.Section variant="oneThird">
                <Card>
                  <BlockStack gap="400">
                    <InlineStack align="space-between">
                      <Text as="h2" variant="headingMd">Vista previa</Text>
                      <Badge tone="info">En tiempo real</Badge>
                    </InlineStack>
                    <FormModalPreview formState={formState} previewType="modal" />
                  </BlockStack>
                </Card>
              </Layout.Section>
            </Layout>
          )}

          {/* TAB: Personalizar (Field Order, Custom Content) */}
          {selectedTab === 5 && (
            <Layout>
              <Layout.Section>
                <Card>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">Orden de campos</Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Arrastra los campos para cambiar el orden en que aparecen en el formulario.
                    </Text>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {(formState.fieldOrder as string[]).map((fieldId, index) => {
                        const isVisible =
                          fieldId === "name" ||
                          fieldId === "phone" ||
                          fieldId === "address" ||
                          (fieldId === "email" && formState.showEmail) ||
                          (fieldId === "city" && formState.showCity) ||
                          (fieldId === "province" && formState.showProvince) ||
                          (fieldId === "postalCode" && formState.showPostalCode) ||
                          (fieldId === "notes" && formState.showNotes) ||
                          (fieldId === "quantity" && formState.showQuantity);

                        return (
                          <div
                            key={fieldId}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              padding: "12px 16px",
                              background: isVisible ? "#fff" : "#f6f6f7",
                              border: "1px solid #e1e3e5",
                              borderRadius: "8px",
                              opacity: isVisible ? 1 : 0.5,
                            }}
                          >
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <button
                                onClick={() => index > 0 && moveField(index, index - 1)}
                                disabled={index === 0}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: index === 0 ? "default" : "pointer",
                                  padding: "2px",
                                  opacity: index === 0 ? 0.3 : 1,
                                }}
                              >
                                ▲
                              </button>
                              <button
                                onClick={() => index < (formState.fieldOrder as string[]).length - 1 && moveField(index, index + 1)}
                                disabled={index === (formState.fieldOrder as string[]).length - 1}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: index === (formState.fieldOrder as string[]).length - 1 ? "default" : "pointer",
                                  padding: "2px",
                                  opacity: index === (formState.fieldOrder as string[]).length - 1 ? 0.3 : 1,
                                }}
                              >
                                ▼
                              </button>
                            </div>
                            <span style={{ fontWeight: 500, flex: 1 }}>
                              {fieldLabels[fieldId] || fieldId}
                            </span>
                            {!isVisible && (
                              <Badge tone="subdued">Oculto</Badge>
                            )}
                            {(fieldId === "name" || fieldId === "phone" || fieldId === "address") && (
                              <Badge tone="info">Requerido</Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </BlockStack>
                </Card>

                <Box paddingBlockStart="400">
                  <Card>
                    <BlockStack gap="400">
                      <Text as="h2" variant="headingMd">Imagen personalizada</Text>
                      <FormLayout>
                        <TextField
                          label="URL de la imagen"
                          value={formState.customImageUrl}
                          onChange={handleChange("customImageUrl")}
                          placeholder="https://ejemplo.com/imagen.jpg"
                          helpText="URL de una imagen para mostrar en el modal"
                          autoComplete="off"
                        />
                        <Select
                          label="Posición de la imagen"
                          options={[
                            { value: "none", label: "No mostrar imagen" },
                            { value: "top", label: "Arriba del formulario" },
                            { value: "after_product", label: "Después del producto" },
                            { value: "bottom", label: "Antes del botón de envío" },
                          ]}
                          value={formState.customImagePosition}
                          onChange={handleChange("customImagePosition")}
                        />
                      </FormLayout>
                    </BlockStack>
                  </Card>
                </Box>

                <Box paddingBlockStart="400">
                  <Card>
                    <BlockStack gap="400">
                      <Text as="h2" variant="headingMd">HTML personalizado</Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        Puedes agregar HTML o Liquid para personalizar el modal. Usa con cuidado.
                      </Text>
                      <FormLayout>
                        <TextField
                          label="HTML arriba del formulario"
                          value={formState.customHtmlTop}
                          onChange={handleChange("customHtmlTop")}
                          multiline={4}
                          placeholder="<div class='promo-banner'>¡Envío gratis hoy!</div>"
                          helpText="Se mostrará antes de los campos del formulario"
                          autoComplete="off"
                          monospaced
                        />
                        <TextField
                          label="HTML abajo del formulario"
                          value={formState.customHtmlBottom}
                          onChange={handleChange("customHtmlBottom")}
                          multiline={4}
                          placeholder="<p class='terms'>Al enviar aceptas los términos</p>"
                          helpText="Se mostrará antes del botón de envío"
                          autoComplete="off"
                          monospaced
                        />
                      </FormLayout>
                    </BlockStack>
                  </Card>
                </Box>

                <Box paddingBlockStart="400">
                  <Card>
                    <BlockStack gap="400">
                      <Text as="h2" variant="headingMd">CSS personalizado</Text>
                      <FormLayout>
                        <TextField
                          label="Estilos CSS adicionales"
                          value={formState.customCss}
                          onChange={handleChange("customCss")}
                          multiline={6}
                          placeholder={`.curetfy-modal { border-radius: 20px; }\n.curetfy-submit-btn { font-size: 18px; }`}
                          helpText="CSS personalizado para el formulario"
                          autoComplete="off"
                          monospaced
                        />
                      </FormLayout>
                    </BlockStack>
                  </Card>
                </Box>

                <Box paddingBlockStart="400">
                  <Card>
                    <BlockStack gap="400">
                      <Text as="h2" variant="headingMd">Opciones del modal</Text>
                      <FormLayout>
                        <Checkbox
                          label="Ocultar botón de cierre"
                          helpText="Esconde la X para cerrar el modal"
                          checked={formState.hideCloseButton}
                          onChange={handleChange("hideCloseButton")}
                        />
                        <Checkbox
                          label="Ocultar etiquetas de campos"
                          helpText="Solo muestra los placeholders, oculta las etiquetas"
                          checked={formState.hideFieldLabels}
                          onChange={handleChange("hideFieldLabels")}
                        />
                        <Checkbox
                          label="Habilitar soporte RTL"
                          helpText="Para idiomas que se leen de derecha a izquierda (árabe, hebreo)"
                          checked={formState.enableRTL}
                          onChange={handleChange("enableRTL")}
                        />
                        <Checkbox
                          label="Pantalla completa en móvil"
                          helpText="El modal ocupa toda la pantalla en dispositivos móviles"
                          checked={formState.fullscreenMobile}
                          onChange={handleChange("fullscreenMobile")}
                        />
                      </FormLayout>
                    </BlockStack>
                  </Card>
                </Box>

                <Box paddingBlockStart="400">
                  <Card>
                    <BlockStack gap="400">
                      <Text as="h2" variant="headingMd">Tarifas de envío</Text>
                      <FormLayout>
                        <Checkbox
                          label="Habilitar tarifas de envío"
                          helpText="Permite agregar costos de envío a los pedidos"
                          checked={formState.enableShipping}
                          onChange={handleChange("enableShipping")}
                        />
                        {formState.enableShipping && (
                          <>
                            <Select
                              label="Fuente de tarifas"
                              options={[
                                { value: "custom", label: "Tarifas personalizadas" },
                                { value: "shopify", label: "Importar desde Shopify (próximamente)" },
                              ]}
                              value={formState.shippingSource}
                              onChange={handleChange("shippingSource")}
                            />
                            {formState.shippingSource === "custom" && (
                              <Banner tone="info">
                                <p>Configura las tarifas de envío en la pestaña "Envíos" que se habilitará próximamente.</p>
                              </Banner>
                            )}
                          </>
                        )}
                      </FormLayout>
                    </BlockStack>
                  </Card>
                </Box>
              </Layout.Section>

              {/* PREVIEW: Personalizar */}
              <Layout.Section variant="oneThird">
                <Card>
                  <BlockStack gap="400">
                    <InlineStack align="space-between">
                      <Text as="h2" variant="headingMd">Vista previa</Text>
                      <Badge tone="info">En tiempo real</Badge>
                    </InlineStack>
                    <FormModalPreview formState={formState} previewType="modal" />
                  </BlockStack>
                </Card>
              </Layout.Section>
            </Layout>
          )}

          {/* TAB: Order Configuration */}
          {selectedTab === 6 && (
            <Layout>
              <Layout.Section>
                <Card>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">Etiquetas de pedidos</Text>
                    <FormLayout>
                      <TextField
                        label="Prefijo de etiqueta"
                        value={formState.orderTagPrefix}
                        onChange={handleChange("orderTagPrefix")}
                        helpText="Se agregará al número de orden: cod-form-001"
                        autoComplete="off"
                      />
                      <TextField
                        label="Etiquetas automáticas"
                        value={formState.orderTags}
                        onChange={handleChange("orderTags")}
                        helpText="Separadas por coma. Se agregarán a cada pedido en Shopify."
                        autoComplete="off"
                      />
                    </FormLayout>
                  </BlockStack>
                </Card>

                <Box paddingBlockStart="400">
                  <Card>
                    <BlockStack gap="400">
                      <Text as="h2" variant="headingMd">Creación de pedidos</Text>
                      <FormLayout>
                        <Checkbox
                          label="Crear orden borrador en Shopify"
                          helpText="Si está activo, se creará una orden borrador que podrás convertir en orden real después de confirmar el pago."
                          checked={formState.createDraftOrder}
                          onChange={handleChange("createDraftOrder")}
                        />
                        <TextField
                          label="Nota interna del pedido"
                          value={formState.orderNote}
                          onChange={handleChange("orderNote")}
                          multiline={2}
                          helpText="Esta nota se agregará internamente al pedido en Shopify."
                          autoComplete="off"
                        />
                      </FormLayout>
                    </BlockStack>
                  </Card>
                </Box>
              </Layout.Section>
            </Layout>
          )}

          {/* TAB: Advanced */}
          {selectedTab === 7 && (
            <Layout>
              <Layout.Section>
                <Card>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">Redirección a WhatsApp</Text>
                    <FormLayout>
                      <Checkbox
                        label="Redirigir automáticamente a WhatsApp"
                        helpText="Al enviar el formulario, el cliente será redirigido a WhatsApp automáticamente."
                        checked={formState.autoRedirectWhatsApp}
                        onChange={handleChange("autoRedirectWhatsApp")}
                      />
                      <TextField
                        label="Tiempo de espera (ms)"
                        value={formState.redirectDelay}
                        onChange={handleChange("redirectDelay")}
                        type="number"
                        helpText="Milisegundos a esperar antes de redirigir (2000 = 2 segundos)"
                        autoComplete="off"
                      />
                    </FormLayout>
                  </BlockStack>
                </Card>

                <Box paddingBlockStart="400">
                  <Card>
                    <BlockStack gap="400">
                      <Text as="h2" variant="headingMd">Analytics y Tracking</Text>
                      <FormLayout>
                        <Checkbox
                          label="Habilitar analytics interno"
                          helpText="Registra estadísticas de uso del formulario."
                          checked={formState.enableAnalytics}
                          onChange={handleChange("enableAnalytics")}
                        />
                        <Checkbox
                          label="Habilitar Facebook Pixel"
                          helpText="Envía eventos de conversión a Facebook."
                          checked={formState.enablePixel}
                          onChange={handleChange("enablePixel")}
                        />
                        {formState.enablePixel && (
                          <TextField
                            label="Facebook Pixel ID"
                            value={formState.pixelId}
                            onChange={handleChange("pixelId")}
                            placeholder="123456789012345"
                            autoComplete="off"
                          />
                        )}
                      </FormLayout>
                    </BlockStack>
                  </Card>
                </Box>

                <Box paddingBlockStart="400">
                  <Card>
                    <BlockStack gap="400">
                      <Text as="h2" variant="headingMd">Productos</Text>
                      <FormLayout>
                        <Checkbox
                          label="Habilitar en todos los productos"
                          helpText="Si está desactivado, deberás seleccionar productos específicos."
                          checked={formState.enableAllProducts}
                          onChange={handleChange("enableAllProducts")}
                        />
                      </FormLayout>
                    </BlockStack>
                  </Card>
                </Box>
              </Layout.Section>
            </Layout>
          )}
        </Box>
      </Tabs>
    </Page>
  );
}
