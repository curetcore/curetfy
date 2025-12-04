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
    { id: "form-builder", content: "Formulario", accessibilityLabel: "Formulario" },
    { id: "modal", content: "Modal", accessibilityLabel: "Modal" },
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
  const showPreview = selectedTab <= 2; // WhatsApp, Formulario, Modal

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
                        autoComplete="off"
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

          {/* TAB: Unified Form Builder */}
          {selectedTab === 1 && (() => {
            // Build unified list of all elements
            const allElements = (formState.customFields as any[]).map((field, idx) => ({
              ...field,
              _index: idx,
              _isCustom: true,
            }));

            // Element type labels and icons
            const typeInfo: Record<string, { label: string; icon: string; color: string }> = {
              // Input fields
              name: { label: "Nombre", icon: "👤", color: "#5C6AC4" },
              phone: { label: "Teléfono", icon: "📱", color: "#5C6AC4" },
              email: { label: "Email", icon: "✉️", color: "#5C6AC4" },
              address: { label: "Dirección", icon: "📍", color: "#5C6AC4" },
              city: { label: "Ciudad", icon: "🏙️", color: "#5C6AC4" },
              province: { label: "Provincia", icon: "🗺️", color: "#5C6AC4" },
              postalCode: { label: "Código postal", icon: "📮", color: "#5C6AC4" },
              notes: { label: "Notas", icon: "📝", color: "#5C6AC4" },
              quantity: { label: "Cantidad", icon: "🔢", color: "#5C6AC4" },
              // Custom types
              text: { label: "Campo de texto", icon: "✏️", color: "#00A0AC" },
              textarea: { label: "Área de texto", icon: "📄", color: "#00A0AC" },
              select: { label: "Desplegable", icon: "📋", color: "#00A0AC" },
              radio: { label: "Opción única", icon: "🔘", color: "#00A0AC" },
              checkbox: { label: "Casilla", icon: "☑️", color: "#00A0AC" },
              date: { label: "Fecha", icon: "📅", color: "#00A0AC" },
              number: { label: "Número", icon: "#️⃣", color: "#00A0AC" },
              // Decorative
              heading: { label: "Título/Texto", icon: "🏷️", color: "#637381" },
              image: { label: "Imagen", icon: "🖼️", color: "#637381" },
              html: { label: "HTML", icon: "🧩", color: "#637381" },
              link_button: { label: "Botón enlace", icon: "🔗", color: "#637381" },
            };

            const addElement = (type: string) => {
              // Default labels and placeholders for COD essential fields
              const fieldDefaults: Record<string, { label: string; placeholder: string; required: boolean }> = {
                name: { label: "Nombre completo", placeholder: "Ej: Juan Pérez", required: true },
                phone: { label: "Teléfono / WhatsApp", placeholder: "Ej: 809-555-1234", required: true },
                email: { label: "Email", placeholder: "Ej: juan@email.com", required: false },
                address: { label: "Dirección de entrega", placeholder: "Calle, número, sector...", required: true },
                city: { label: "Ciudad", placeholder: "Ej: Santo Domingo", required: false },
                province: { label: "Provincia / Estado", placeholder: "", required: false },
                postalCode: { label: "Código postal", placeholder: "Ej: 10101", required: false },
                notes: { label: "Notas del pedido", placeholder: "Instrucciones especiales...", required: false },
                quantity: { label: "Cantidad", placeholder: "", required: false },
              };

              const defaults = fieldDefaults[type] || { label: typeInfo[type]?.label || "Nuevo elemento", placeholder: "", required: false };

              const newField = {
                id: `field_${Date.now()}`,
                type,
                label: defaults.label,
                placeholder: defaults.placeholder,
                required: defaults.required,
                options: [],
                content: "",
                imageUrl: "",
                url: "",
              };
              setFormState(prev => ({
                ...prev,
                customFields: [...(prev.customFields as any[]), newField]
              }));
            };

            const updateElement = (index: number, updates: any) => {
              const newFields = [...(formState.customFields as any[])];
              newFields[index] = { ...newFields[index], ...updates };
              setFormState(prev => ({ ...prev, customFields: newFields }));
            };

            const removeElement = (index: number) => {
              const newFields = (formState.customFields as any[]).filter((_, i) => i !== index);
              setFormState(prev => ({ ...prev, customFields: newFields }));
            };

            const moveElement = (index: number, direction: "up" | "down") => {
              const newFields = [...(formState.customFields as any[])];
              const newIndex = direction === "up" ? index - 1 : index + 1;
              if (newIndex < 0 || newIndex >= newFields.length) return;
              [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
              setFormState(prev => ({ ...prev, customFields: newFields }));
            };

            return (
              <Layout>
                <Layout.Section>
                  {/* HEADER & ADD BUTTON */}
                  <Card>
                    <BlockStack gap="400">
                      <InlineStack align="space-between" blockAlign="start">
                        <BlockStack gap="200">
                          <Text as="h2" variant="headingLg">Constructor de formulario</Text>
                          <Text as="p" tone="subdued">
                            Arma tu formulario agregando elementos y ordenándolos como quieras.
                          </Text>
                        </BlockStack>
                        {allElements.length === 0 && (
                          <Button
                            variant="primary"
                            onClick={() => {
                              // Add all essential COD fields at once
                              const essentialFields = [
                                { id: `field_${Date.now()}_1`, type: "name", label: "Nombre completo", placeholder: "Ej: Juan Pérez", required: true, options: [], content: "", imageUrl: "", url: "" },
                                { id: `field_${Date.now()}_2`, type: "phone", label: "Teléfono / WhatsApp", placeholder: "Ej: 809-555-1234", required: true, options: [], content: "", imageUrl: "", url: "" },
                                { id: `field_${Date.now()}_3`, type: "address", label: "Dirección de entrega", placeholder: "Calle, número, sector...", required: true, options: [], content: "", imageUrl: "", url: "" },
                                { id: `field_${Date.now()}_4`, type: "city", label: "Ciudad", placeholder: "Ej: Santo Domingo", required: false, options: [], content: "", imageUrl: "", url: "" },
                                { id: `field_${Date.now()}_5`, type: "province", label: "Provincia", placeholder: "", required: false, options: [], content: "", imageUrl: "", url: "" },
                              ];
                              setFormState(prev => ({
                                ...prev,
                                customFields: essentialFields
                              }));
                            }}
                          >
                            🚀 Comenzar con plantilla COD
                          </Button>
                        )}
                      </InlineStack>

                      {/* Quick add - Essential COD fields */}
                      <BlockStack gap="300">
                        <Text as="p" variant="headingSm">📦 Campos esenciales COD:</Text>
                        <InlineStack gap="200" wrap>
                          <Button onClick={() => addElement("name")} size="slim" variant="primary">👤 Nombre</Button>
                          <Button onClick={() => addElement("phone")} size="slim" variant="primary">📱 Teléfono</Button>
                          <Button onClick={() => addElement("address")} size="slim" variant="primary">📍 Dirección</Button>
                          <Button onClick={() => addElement("city")} size="slim">🏙️ Ciudad</Button>
                          <Button onClick={() => addElement("province")} size="slim">🗺️ Provincia</Button>
                          <Button onClick={() => addElement("email")} size="slim">✉️ Email</Button>
                          <Button onClick={() => addElement("notes")} size="slim">📝 Notas</Button>
                          <Button onClick={() => addElement("quantity")} size="slim">🔢 Cantidad</Button>
                        </InlineStack>
                      </BlockStack>

                      {/* Quick add - Custom elements */}
                      <BlockStack gap="300">
                        <Text as="p" variant="headingSm">🎨 Elementos personalizados:</Text>
                        <InlineStack gap="200" wrap>
                          <Button onClick={() => addElement("text")} size="slim">✏️ Texto</Button>
                          <Button onClick={() => addElement("textarea")} size="slim">📄 Área texto</Button>
                          <Button onClick={() => addElement("select")} size="slim">📋 Desplegable</Button>
                          <Button onClick={() => addElement("radio")} size="slim">🔘 Opciones</Button>
                          <Button onClick={() => addElement("checkbox")} size="slim">☑️ Casilla</Button>
                          <Button onClick={() => addElement("number")} size="slim">#️⃣ Número</Button>
                          <Button onClick={() => addElement("date")} size="slim">📅 Fecha</Button>
                        </InlineStack>
                      </BlockStack>

                      {/* Quick add - Decorative */}
                      <BlockStack gap="300">
                        <Text as="p" variant="headingSm">✨ Elementos decorativos:</Text>
                        <InlineStack gap="200" wrap>
                          <Button onClick={() => addElement("heading")} size="slim">🏷️ Título</Button>
                          <Button onClick={() => addElement("image")} size="slim">🖼️ Imagen/GIF</Button>
                          <Button onClick={() => addElement("html")} size="slim">🧩 HTML</Button>
                          <Button onClick={() => addElement("link_button")} size="slim">🔗 Botón enlace</Button>
                        </InlineStack>
                      </BlockStack>
                    </BlockStack>
                  </Card>

                  {/* ELEMENTS LIST */}
                  <Box paddingBlockStart="400">
                    <BlockStack gap="300">
                      {allElements.length === 0 ? (
                        <Card>
                          <BlockStack gap="400" inlineAlign="center">
                            <div style={{ fontSize: "48px", opacity: 0.5 }}>📝</div>
                            <Text as="p" tone="subdued" alignment="center">
                              Tu formulario está vacío. Usa los botones de arriba para agregar elementos.
                            </Text>
                          </BlockStack>
                        </Card>
                      ) : (
                        allElements.map((element, index) => {
                          const info = typeInfo[element.type] || { label: element.type, icon: "📦", color: "#637381" };
                          const isDecorative = ["heading", "image", "html", "link_button"].includes(element.type);

                          return (
                            <div
                              key={element.id}
                              style={{
                                background: "#fff",
                                border: "1px solid #e1e3e5",
                                borderRadius: "12px",
                                borderLeft: `4px solid ${info.color}`,
                                overflow: "hidden",
                              }}
                            >
                              {/* Element header */}
                              <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "12px 16px",
                                background: "#fafbfc",
                                borderBottom: "1px solid #e1e3e5",
                              }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                  {/* Position indicator */}
                                  <div style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    background: info.color,
                                    color: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                  }}>
                                    {index + 1}
                                  </div>
                                  <span style={{ fontSize: "18px" }}>{info.icon}</span>
                                  <div>
                                    <div style={{ fontWeight: 600, fontSize: "14px" }}>
                                      {element.label || info.label}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#637381" }}>
                                      {info.label}
                                      {element.required && <span style={{ color: "#D72C0D", marginLeft: "6px" }}>• Requerido</span>}
                                    </div>
                                  </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  {/* Move buttons */}
                                  <button
                                    onClick={() => moveElement(index, "up")}
                                    disabled={index === 0}
                                    style={{
                                      padding: "6px 10px",
                                      border: "1px solid #e1e3e5",
                                      borderRadius: "6px",
                                      background: index === 0 ? "#f6f6f7" : "#fff",
                                      cursor: index === 0 ? "default" : "pointer",
                                      opacity: index === 0 ? 0.4 : 1,
                                      fontSize: "14px",
                                    }}
                                    title="Mover arriba"
                                  >
                                    ↑
                                  </button>
                                  <button
                                    onClick={() => moveElement(index, "down")}
                                    disabled={index === allElements.length - 1}
                                    style={{
                                      padding: "6px 10px",
                                      border: "1px solid #e1e3e5",
                                      borderRadius: "6px",
                                      background: index === allElements.length - 1 ? "#f6f6f7" : "#fff",
                                      cursor: index === allElements.length - 1 ? "default" : "pointer",
                                      opacity: index === allElements.length - 1 ? 0.4 : 1,
                                      fontSize: "14px",
                                    }}
                                    title="Mover abajo"
                                  >
                                    ↓
                                  </button>
                                  <button
                                    onClick={() => removeElement(index)}
                                    style={{
                                      padding: "6px 10px",
                                      border: "1px solid #ffd2cc",
                                      borderRadius: "6px",
                                      background: "#fff5f5",
                                      color: "#D72C0D",
                                      cursor: "pointer",
                                      fontSize: "14px",
                                    }}
                                    title="Eliminar"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>

                              {/* Element config */}
                              <div style={{ padding: "16px" }}>
                                <FormLayout>
                                  {/* Type selector */}
                                  <Select
                                    label="Tipo de elemento"
                                    options={[
                                      { label: "── Campos COD esenciales ──", value: "", disabled: true },
                                      { value: "name", label: "👤 Nombre" },
                                      { value: "phone", label: "📱 Teléfono" },
                                      { value: "email", label: "✉️ Email" },
                                      { value: "address", label: "📍 Dirección" },
                                      { value: "city", label: "🏙️ Ciudad" },
                                      { value: "province", label: "🗺️ Provincia" },
                                      { value: "postalCode", label: "📮 Código postal" },
                                      { value: "notes", label: "📝 Notas" },
                                      { value: "quantity", label: "🔢 Cantidad" },
                                      { label: "── Campos personalizados ──", value: "_custom", disabled: true },
                                      { value: "text", label: "✏️ Campo de texto" },
                                      { value: "textarea", label: "📄 Área de texto" },
                                      { value: "number", label: "#️⃣ Número" },
                                      { value: "select", label: "📋 Desplegable" },
                                      { value: "radio", label: "🔘 Opción única" },
                                      { value: "checkbox", label: "☑️ Casilla" },
                                      { value: "date", label: "📅 Fecha" },
                                      { label: "── Elementos decorativos ──", value: "_deco", disabled: true },
                                      { value: "heading", label: "🏷️ Título o texto" },
                                      { value: "image", label: "🖼️ Imagen o GIF" },
                                      { value: "html", label: "🧩 Código HTML" },
                                      { value: "link_button", label: "🔗 Botón con enlace" },
                                    ]}
                                    value={element.type}
                                    onChange={(value) => updateElement(index, { type: value })}
                                  />

                                  {/* Label for non-HTML types */}
                                  {element.type !== "html" && (
                                    <TextField
                                      label={element.type === "heading" ? "Texto a mostrar" : "Etiqueta del campo"}
                                      value={element.label || ""}
                                      onChange={(value) => updateElement(index, { label: value })}
                                      autoComplete="off"
                                    />
                                  )}

                                  {/* Placeholder for input types */}
                                  {["text", "textarea", "number"].includes(element.type) && (
                                    <TextField
                                      label="Texto de ayuda (placeholder)"
                                      value={element.placeholder || ""}
                                      onChange={(value) => updateElement(index, { placeholder: value })}
                                      autoComplete="off"
                                    />
                                  )}

                                  {/* Options for select/radio */}
                                  {["select", "radio"].includes(element.type) && (
                                    <TextField
                                      label="Opciones (una por línea o separadas por coma)"
                                      value={(element.options || []).join(", ")}
                                      onChange={(value) => updateElement(index, {
                                        options: value.split(/[,\n]/).map((o: string) => o.trim()).filter(Boolean)
                                      })}
                                      multiline={2}
                                      autoComplete="off"
                                      helpText="Ejemplo: Opción 1, Opción 2, Opción 3"
                                    />
                                  )}

                                  {/* HTML content */}
                                  {element.type === "html" && (
                                    <TextField
                                      label="Código HTML"
                                      value={element.content || ""}
                                      onChange={(value) => updateElement(index, { content: value })}
                                      multiline={4}
                                      autoComplete="off"
                                      monospaced
                                      helpText="Puedes usar HTML para mostrar mensajes, banners, etc."
                                    />
                                  )}

                                  {/* Image URL */}
                                  {element.type === "image" && (
                                    <TextField
                                      label="URL de la imagen"
                                      value={element.imageUrl || ""}
                                      onChange={(value) => updateElement(index, { imageUrl: value })}
                                      autoComplete="off"
                                      helpText="Pega la URL de una imagen o GIF"
                                    />
                                  )}

                                  {/* Link button URL */}
                                  {element.type === "link_button" && (
                                    <TextField
                                      label="URL del enlace"
                                      value={element.url || ""}
                                      onChange={(value) => updateElement(index, { url: value })}
                                      autoComplete="off"
                                      helpText="A dónde llevará el botón al hacer clic"
                                    />
                                  )}

                                  {/* Required toggle for input fields */}
                                  {!isDecorative && (
                                    <Checkbox
                                      label="Este campo es obligatorio"
                                      checked={element.required || false}
                                      onChange={(value) => updateElement(index, { required: value })}
                                    />
                                  )}
                                </FormLayout>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </BlockStack>
                  </Box>

                  {/* COUNTRIES & OPTIONS */}
                  <Box paddingBlockStart="400">
                    <Card>
                      <BlockStack gap="400">
                        <Text as="h2" variant="headingMd">Configuración regional</Text>
                        <FormLayout>
                          <TextField
                            label="Países habilitados"
                            value={formState.countries}
                            onChange={handleChange("countries")}
                            helpText="Códigos separados por coma: DO, CO, MX, PE, CL, AR"
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

                  {/* FORM OPTIONS */}
                  <Box paddingBlockStart="400">
                    <Card>
                      <BlockStack gap="400">
                        <Text as="h2" variant="headingMd">Opciones de visualización</Text>
                        <FormLayout>
                          <Checkbox
                            label="Ocultar etiquetas de campos"
                            helpText="Solo mostrar placeholders, estilo más limpio"
                            checked={formState.hideFieldLabels}
                            onChange={handleChange("hideFieldLabels")}
                          />
                          <Checkbox
                            label="Texto de derecha a izquierda (RTL)"
                            helpText="Para árabe, hebreo y otros idiomas RTL"
                            checked={formState.enableRTL}
                            onChange={handleChange("enableRTL")}
                          />
                          <TextField
                            label="CSS personalizado (avanzado)"
                            value={formState.customCss}
                            onChange={handleChange("customCss")}
                            multiline={3}
                            autoComplete="off"
                            monospaced
                            helpText="Estilos CSS adicionales para el formulario"
                          />
                        </FormLayout>
                      </BlockStack>
                    </Card>
                  </Box>
                </Layout.Section>

                {/* PREVIEW */}
                <Layout.Section variant="oneThird">
                  <div style={{ position: "sticky", top: "20px" }}>
                    <Card>
                      <BlockStack gap="400">
                        <InlineStack align="space-between">
                          <Text as="h2" variant="headingMd">Vista previa</Text>
                          <Badge tone="info">En tiempo real</Badge>
                        </InlineStack>
                        <FormModalPreview formState={formState} previewType="form" />
                      </BlockStack>
                    </Card>
                  </div>
                </Layout.Section>
              </Layout>
            );
          })()}

          {/* TAB: Modal Customization */}
          {selectedTab === 2 && (
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

          {/* TAB: Order Configuration */}
          {selectedTab === 3 && (
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
          {selectedTab === 4 && (
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
