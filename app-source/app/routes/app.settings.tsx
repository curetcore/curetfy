import { useState, useCallback, useEffect, useRef, useMemo } from "react";
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
  ResourceItem,
  ResourceList,
  ButtonGroup,
  Collapsible,
  Tooltip,
} from "@shopify/polaris";
import {
  PersonIcon,
  PhoneIcon,
  EmailIcon,
  LocationIcon,
  GlobeIcon,
  NoteIcon,
  HashtagIcon,
  TextIcon,
  TextAlignLeftIcon,
  ListBulletedIcon,
  CalendarIcon,
  CheckIcon,
  ImageIcon,
  CodeIcon,
  LinkIcon,
  PlusIcon,
  DeleteIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  AlertCircleIcon,
  DragHandleIcon,
  UndoIcon,
  RedoIcon,
  ChevronRightIcon,
} from "@shopify/polaris-icons";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

// Category colors for form fields
const CATEGORY_COLORS = {
  essential: { bg: "#f0fdf4", border: "#22c55e", badge: "success" as const },
  custom: { bg: "#eff6ff", border: "#3b82f6", badge: "info" as const },
  decorative: { bg: "#faf5ff", border: "#a855f7", badge: "attention" as const },
};

// Field category mapping
const getFieldCategory = (type: string): "essential" | "custom" | "decorative" => {
  const essentialFields = ["name", "phone", "email", "address", "city", "province", "postalCode", "notes", "quantity"];
  const decorativeFields = ["heading", "image", "html", "link_button"];
  if (essentialFields.includes(type)) return "essential";
  if (decorativeFields.includes(type)) return "decorative";
  return "custom";
};

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
  const { session, admin } = await authenticate.admin(request);

  const shop = await prisma.shop.findUnique({
    where: { shopDomain: session.shop },
  });

  // Fetch a random product for preview
  let sampleProduct = null;
  try {
    const productsResponse = await admin.graphql(`
      query {
        products(first: 10) {
          edges {
            node {
              id
              title
              featuredImage {
                url
              }
              variants(first: 1) {
                edges {
                  node {
                    price
                  }
                }
              }
            }
          }
        }
      }
    `);
    const productsData = await productsResponse.json();
    const products = productsData.data?.products?.edges || [];
    if (products.length > 0) {
      // Pick a random product
      const randomProduct = products[Math.floor(Math.random() * products.length)].node;
      sampleProduct = {
        title: randomProduct.title,
        image: randomProduct.featuredImage?.url || null,
        price: randomProduct.variants?.edges?.[0]?.node?.price || "0.00",
      };
    }
  } catch (error) {
    console.error("Error fetching sample product:", error);
  }

  // Get the next order number from store (for auto-sequence)
  let nextOrderNumber = 1;
  try {
    const ordersResponse = await admin.graphql(`
      query {
        orders(first: 1, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              name
            }
          }
        }
      }
    `);
    const ordersData = await ordersResponse.json();
    const lastOrderName = ordersData.data?.orders?.edges?.[0]?.node?.name || "#0";
    // Extract number from order name like "#1042"
    const orderNum = parseInt(lastOrderName.replace(/[^0-9]/g, ''), 10) || 0;
    nextOrderNumber = orderNum + 1;
  } catch (error) {
    console.error("Error fetching order count:", error);
  }

  return json({ shop, provincesConfig: PROVINCES_BY_COUNTRY, sampleProduct, nextOrderNumber });
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
// FORM BUILDER COMPONENTS
// ============================================

// Field type configuration
const FIELD_TYPES: Record<string, { label: string; icon: any; maxCount: number }> = {
  // Essential COD fields
  name: { label: "Nombre", icon: PersonIcon, maxCount: 1 },
  phone: { label: "Teléfono", icon: PhoneIcon, maxCount: 1 },
  email: { label: "Email", icon: EmailIcon, maxCount: 1 },
  address: { label: "Dirección", icon: LocationIcon, maxCount: 1 },
  city: { label: "Ciudad", icon: GlobeIcon, maxCount: 1 },
  province: { label: "Provincia", icon: GlobeIcon, maxCount: 1 },
  postalCode: { label: "Código postal", icon: LocationIcon, maxCount: 1 },
  notes: { label: "Notas", icon: NoteIcon, maxCount: 1 },
  quantity: { label: "Cantidad", icon: HashtagIcon, maxCount: 1 },
  // Custom input fields
  text: { label: "Texto", icon: TextIcon, maxCount: 99 },
  textarea: { label: "Área de texto", icon: TextAlignLeftIcon, maxCount: 99 },
  select: { label: "Desplegable", icon: ListBulletedIcon, maxCount: 99 },
  radio: { label: "Opción única", icon: CheckIcon, maxCount: 99 },
  checkbox: { label: "Casilla", icon: CheckIcon, maxCount: 99 },
  number: { label: "Número", icon: HashtagIcon, maxCount: 99 },
  date: { label: "Fecha", icon: CalendarIcon, maxCount: 99 },
  // Decorative elements
  heading: { label: "Título", icon: TextIcon, maxCount: 99 },
  image: { label: "Imagen", icon: ImageIcon, maxCount: 99 },
  html: { label: "HTML", icon: CodeIcon, maxCount: 99 },
  link_button: { label: "Botón", icon: LinkIcon, maxCount: 99 },
};

// Sortable Field Card Component
interface SortableFieldCardProps {
  element: any;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (updates: any) => void;
  onRemove: () => void;
}

function SortableFieldCard({ element, index, isExpanded, onToggle, onUpdate, onRemove }: SortableFieldCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const config = FIELD_TYPES[element.type] || { label: element.type, icon: TextIcon };
  const category = getFieldCategory(element.type);
  const colors = CATEGORY_COLORS[category];
  const isDecorative = category === "decorative";

  const categoryLabels = {
    essential: "Esencial",
    custom: "Personalizado",
    decorative: "Decorativo",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{
        borderRadius: "12px",
        border: `1px solid ${isDragging ? colors.border : "#e3e3e3"}`,
        borderLeft: `4px solid ${colors.border}`,
        background: isDragging ? colors.bg : "#ffffff",
        overflow: "hidden",
        transition: "all 0.2s ease",
        boxShadow: isDragging ? "0 8px 24px rgba(0,0,0,0.15)" : "0 1px 3px rgba(0,0,0,0.08)",
      }}>
        {/* Header - Always visible */}
        <div
          style={{
            padding: "12px 16px",
            cursor: "pointer",
            background: isExpanded ? colors.bg : "transparent",
            transition: "background 0.2s ease",
          }}
          onClick={onToggle}
        >
          <InlineStack align="space-between" blockAlign="center">
            <InlineStack gap="300" blockAlign="center">
              {/* Drag Handle */}
              <div
                {...attributes}
                {...listeners}
                style={{
                  cursor: "grab",
                  padding: "4px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Icon source={DragHandleIcon} tone="subdued" />
              </div>

              {/* Index */}
              <div style={{
                width: "24px",
                height: "24px",
                borderRadius: "6px",
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "600",
                color: colors.border,
              }}>
                {index + 1}
              </div>

              {/* Icon & Label */}
              <Icon source={config.icon} tone="base" />
              <BlockStack gap="0">
                <Text as="span" variant="bodyMd" fontWeight="semibold">
                  {element.label || config.label}
                </Text>
                <InlineStack gap="100">
                  <Text as="span" variant="bodySm" tone="subdued">{config.label}</Text>
                  {element.required && <Badge tone="critical" size="small">Requerido</Badge>}
                </InlineStack>
              </BlockStack>
            </InlineStack>

            <InlineStack gap="200" blockAlign="center">
              <Badge tone={colors.badge} size="small">{categoryLabels[category]}</Badge>
              <div style={{
                transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}>
                <Icon source={ChevronRightIcon} tone="subdued" />
              </div>
            </InlineStack>
          </InlineStack>
        </div>

        {/* Expandable Content */}
        <Collapsible open={isExpanded} id={`field-${element.id}`}>
          <div style={{
            padding: "0 16px 16px 16px",
            borderTop: `1px solid ${colors.border}20`,
          }}>
            <BlockStack gap="300">
              {/* Label Field */}
              {element.type !== "html" && (
                <TextField
                  label={element.type === "heading" ? "Texto" : "Etiqueta"}
                  value={element.label || ""}
                  onChange={(value) => onUpdate({ label: value })}
                  autoComplete="off"
                  size="slim"
                />
              )}

              {/* Placeholder Field */}
              {["text", "textarea", "number", "name", "phone", "email", "address", "city", "postalCode", "notes"].includes(element.type) && (
                <TextField
                  label="Placeholder"
                  value={element.placeholder || ""}
                  onChange={(value) => onUpdate({ placeholder: value })}
                  autoComplete="off"
                  size="slim"
                />
              )}

              {/* Options for select/radio */}
              {["select", "radio"].includes(element.type) && (
                <TextField
                  label="Opciones"
                  value={(element.options || []).join(", ")}
                  onChange={(value) => onUpdate({
                    options: value.split(",").map((o: string) => o.trim()).filter(Boolean)
                  })}
                  autoComplete="off"
                  size="slim"
                  helpText="Separadas por coma: Opción 1, Opción 2"
                />
              )}

              {/* HTML content */}
              {element.type === "html" && (
                <TextField
                  label="Código HTML"
                  value={element.content || ""}
                  onChange={(value) => onUpdate({ content: value })}
                  multiline={3}
                  autoComplete="off"
                  monospaced
                />
              )}

              {/* Image URL */}
              {element.type === "image" && (
                <TextField
                  label="URL de imagen"
                  value={element.imageUrl || ""}
                  onChange={(value) => onUpdate({ imageUrl: value })}
                  autoComplete="off"
                  size="slim"
                />
              )}

              {/* Link Button URL */}
              {element.type === "link_button" && (
                <TextField
                  label="URL del enlace"
                  value={element.url || ""}
                  onChange={(value) => onUpdate({ url: value })}
                  autoComplete="off"
                  size="slim"
                />
              )}

              {/* Actions Row */}
              <InlineStack align="space-between" blockAlign="center">
                {/* Required Checkbox */}
                {!isDecorative && (
                  <Checkbox
                    label="Campo obligatorio"
                    checked={element.required || false}
                    onChange={(value) => onUpdate({ required: value })}
                  />
                )}
                {isDecorative && <div />}

                {/* Delete Button */}
                <Button
                  icon={DeleteIcon}
                  tone="critical"
                  variant="plain"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                >
                  Eliminar
                </Button>
              </InlineStack>
            </BlockStack>
          </div>
        </Collapsible>
      </div>
    </div>
  );
}

// ============================================
// PREVIEW COMPONENTS
// ============================================

// Form/Modal Preview Component
function FormModalPreview({
  formState,
  previewType,
  sampleProduct,
}: {
  formState: any;
  previewType: "form" | "fields" | "modal";
  sampleProduct?: { title: string; image: string | null; price: string } | null;
}) {
  const provinces = PROVINCES_BY_COUNTRY[formState.defaultCountry] || PROVINCES_BY_COUNTRY.DO;
  const customFields = formState.customFields as any[] || [];

  // Use sample product from store or fallback
  const productTitle = sampleProduct?.title || "Producto de ejemplo";
  const productImage = sampleProduct?.image;
  const productPrice = sampleProduct?.price ? `$${parseFloat(sampleProduct.price).toLocaleString('es-DO', { minimumFractionDigits: 2 })}` : "RD$ 1,250.00";

  const hideLabels = formState.hideFieldLabels;
  const fieldStyle = { marginBottom: "16px" };
  const labelStyle = {
    display: hideLabels ? "none" : "block",
    fontSize: "13px",
    fontWeight: 500 as const,
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

  // Render any field from customFields
  const renderCustomField = (field: any) => {
    switch (field.type) {
      case "name":
        return (
          <div key={field.id} style={fieldStyle}>
            <label style={labelStyle}>{field.label || "Nombre completo"} {field.required ? "*" : ""}</label>
            <input type="text" placeholder={field.placeholder || "Ej: Juan Pérez"} readOnly style={inputStyle} />
          </div>
        );
      case "phone":
        return (
          <div key={field.id} style={fieldStyle}>
            <label style={labelStyle}>{field.label || "Teléfono / WhatsApp"} {field.required ? "*" : ""}</label>
            <input type="text" placeholder={field.placeholder || "Ej: 809-555-1234"} readOnly style={inputStyle} />
          </div>
        );
      case "email":
        return (
          <div key={field.id} style={fieldStyle}>
            <label style={labelStyle}>{field.label || "Email"} {field.required ? "*" : ""}</label>
            <input type="text" placeholder={field.placeholder || "Ej: juan@email.com"} readOnly style={inputStyle} />
          </div>
        );
      case "address":
        return (
          <div key={field.id} style={fieldStyle}>
            <label style={labelStyle}>{field.label || "Dirección de entrega"} {field.required ? "*" : ""}</label>
            <input type="text" placeholder={field.placeholder || "Calle, número, sector..."} readOnly style={inputStyle} />
          </div>
        );
      case "city":
        return (
          <div key={field.id} style={fieldStyle}>
            <label style={labelStyle}>{field.label || "Ciudad"} {field.required ? "*" : ""}</label>
            <input type="text" placeholder={field.placeholder || "Ej: Santo Domingo"} readOnly style={inputStyle} />
          </div>
        );
      case "province":
        return (
          <div key={field.id} style={fieldStyle}>
            <label style={labelStyle}>{field.label || "Provincia"} {field.required ? "*" : ""}</label>
            <select disabled style={{ ...inputStyle, background: "#fff" }}>
              <option>Seleccionar...</option>
              {provinces.slice(0, 3).map((p) => (<option key={p.value}>{p.label}</option>))}
            </select>
          </div>
        );
      case "postalCode":
        return (
          <div key={field.id} style={fieldStyle}>
            <label style={labelStyle}>{field.label || "Código postal"} {field.required ? "*" : ""}</label>
            <input type="text" placeholder={field.placeholder || "Ej: 10101"} readOnly style={inputStyle} />
          </div>
        );
      case "notes":
        return (
          <div key={field.id} style={fieldStyle}>
            <label style={labelStyle}>{field.label || "Notas del pedido"} {field.required ? "*" : ""}</label>
            <textarea placeholder={field.placeholder || "Instrucciones especiales..."} readOnly style={{ ...inputStyle, minHeight: "60px", resize: "none" }} />
          </div>
        );
      case "quantity":
        return (
          <div key={field.id} style={fieldStyle}>
            <label style={labelStyle}>{field.label || "Cantidad"}</label>
            <div style={{ display: "flex", border: "1px solid #e1e3e5", borderRadius: "8px", overflow: "hidden", width: "fit-content" }}>
              <button style={{ width: "40px", border: "none", background: "#fafbfb", fontSize: "18px", cursor: "pointer" }}>−</button>
              <input type="text" value="1" readOnly style={{ width: "50px", textAlign: "center", border: "none", borderLeft: "1px solid #e1e3e5", borderRight: "1px solid #e1e3e5", fontSize: "14px", fontWeight: 500 }} />
              <button style={{ width: "40px", border: "none", background: "#fafbfb", fontSize: "18px", cursor: "pointer" }}>+</button>
            </div>
          </div>
        );
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
          <div key={field.id} style={{ ...fieldStyle, textAlign: "center" as const }}>
            <img src={field.imageUrl} alt={field.label} style={{ maxWidth: "100%", maxHeight: "120px", borderRadius: "8px" }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        ) : null;
      case "html":
        return field.content ? (
          <div key={field.id} style={{ ...fieldStyle, padding: "12px", background: "#f9fafb", borderRadius: "8px", fontSize: "13px" }} dangerouslySetInnerHTML={{ __html: field.content }} />
        ) : null;
      case "link_button":
        return (
          <div key={field.id} style={{ ...fieldStyle, textAlign: "center" as const }}>
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
          {productImage ? (
            <img
              src={productImage}
              alt={productTitle}
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "8px",
                objectFit: "cover",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
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
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: "14px", color: "#1a1a1a" }}>
              {productTitle}
            </div>
            {formState.showProductPrice && (
              <div style={{ fontWeight: 600, fontSize: "15px", color: "#1a1a1a", marginTop: "4px" }}>
                {productPrice}
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

        {/* Render all fields from customFields in order */}
        {customFields.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center" as const, color: "#6b7177", fontSize: "13px" }}>
            Agrega campos al formulario para ver la vista previa
          </div>
        ) : (
          customFields.map((field) => renderCustomField(field))
        )}


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
          <span style={{ fontSize: "17px" }}>{productPrice}</span>
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
  const { shop, sampleProduct, nextOrderNumber } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [selectedTab, setSelectedTab] = useState(0);
  const [showSaved, setShowSaved] = useState(false);
  const [previewMode, setPreviewMode] = useState<"form" | "success">("form");

  // Form builder state
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  const [fieldHistory, setFieldHistory] = useState<any[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Auto-load default COD template if form is empty on first load
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!hasInitialized.current && (formState.customFields as any[]).length === 0) {
      hasInitialized.current = true;
      const defaultCODTemplate = [
        { id: `field_${Date.now()}_1`, type: "name", label: "Nombre completo", placeholder: "Ej: Juan Pérez", required: true, options: [], content: "", imageUrl: "", url: "" },
        { id: `field_${Date.now()}_2`, type: "phone", label: "Teléfono / WhatsApp", placeholder: "Ej: 809-555-1234", required: true, options: [], content: "", imageUrl: "", url: "" },
        { id: `field_${Date.now()}_3`, type: "address", label: "Dirección de entrega", placeholder: "Calle, número, sector...", required: true, options: [], content: "", imageUrl: "", url: "" },
        { id: `field_${Date.now()}_4`, type: "city", label: "Ciudad", placeholder: "Ej: Santo Domingo", required: false, options: [], content: "", imageUrl: "", url: "" },
        { id: `field_${Date.now()}_5`, type: "province", label: "Provincia / Estado", placeholder: "", required: false, options: [], content: "", imageUrl: "", url: "" },
      ];
      setFormState(prev => ({ ...prev, customFields: defaultCODTemplate }));
    }
  }, []);

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
    { id: "form-builder", content: "Formulario", accessibilityLabel: "Formulario" },
    { id: "shipping", content: "Envíos", accessibilityLabel: "Envíos" },
    { id: "orders", content: "Pedidos", accessibilityLabel: "Pedidos" },
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
  const showPreview = selectedTab === 0; // Solo Formulario muestra preview

  return (
    <Page
      backAction={{ content: "Dashboard", url: "/app" }}
      title="Diseño del formulario"
      primaryAction={{
        content: "Guardar cambios",
        onAction: handleSubmit,
        loading: isSubmitting,
      }}
    >
      <TitleBar title="Diseño del formulario" />

      {showSaved && (
        <Box paddingBlockEnd="400">
          <Banner tone="success" onDismiss={() => setShowSaved(false)}>
            Cambios guardados correctamente
          </Banner>
        </Box>
      )}


      <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
        <Box paddingBlockStart="400">
          {/* TAB: Unified Form Builder */}
          {selectedTab === 0 && (() => {
            // All elements from customFields
            const allElements = formState.customFields as any[];

            // Count how many times each type appears
            const typeCounts: Record<string, number> = {};
            allElements.forEach(el => {
              typeCounts[el.type] = (typeCounts[el.type] || 0) + 1;
            });

            // Fields that can only be added once
            const singleUseFields = ["name", "phone", "address", "email", "city", "province", "postalCode", "notes", "quantity"];

            // Default values for COD fields
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

            const addElement = (type: string) => {
              const typeConfig = FIELD_TYPES[type];
              if (typeConfig && typeCounts[type] >= typeConfig.maxCount) return;

              // Save to history for undo
              setFieldHistory(prev => [...prev.slice(0, historyIndex + 1), allElements]);
              setHistoryIndex(prev => prev + 1);

              const defaults = fieldDefaults[type] || {
                label: FIELD_TYPES[type]?.label || "Nuevo elemento",
                placeholder: "",
                required: false
              };

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

              const newFields = [...allElements, newField];
              setFormState(prev => ({ ...prev, customFields: newFields }));

              // Auto-expand the new field
              setExpandedFields(prev => new Set([...prev, newField.id]));

              // Auto-scroll to new element
              setTimeout(() => {
                const elements = document.querySelectorAll('[data-field-id]');
                const lastElement = elements[elements.length - 1];
                if (lastElement) {
                  lastElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }, 100);
            };

            const updateElement = (index: number, updates: any) => {
              const newFields = [...allElements];
              newFields[index] = { ...newFields[index], ...updates };
              setFormState(prev => ({ ...prev, customFields: newFields }));
            };

            const removeElement = (index: number) => {
              // Save to history for undo
              setFieldHistory(prev => [...prev.slice(0, historyIndex + 1), allElements]);
              setHistoryIndex(prev => prev + 1);

              const newFields = allElements.filter((_, i) => i !== index);
              setFormState(prev => ({ ...prev, customFields: newFields }));
            };

            const handleDragEnd = (event: DragEndEvent) => {
              const { active, over } = event;
              if (over && active.id !== over.id) {
                // Save to history for undo
                setFieldHistory(prev => [...prev.slice(0, historyIndex + 1), allElements]);
                setHistoryIndex(prev => prev + 1);

                const oldIndex = allElements.findIndex((el: any) => el.id === active.id);
                const newIndex = allElements.findIndex((el: any) => el.id === over.id);
                const newFields = arrayMove(allElements, oldIndex, newIndex);
                setFormState(prev => ({ ...prev, customFields: newFields }));
              }
            };

            const handleUndo = () => {
              if (historyIndex >= 0) {
                const previousState = fieldHistory[historyIndex];
                setFormState(prev => ({ ...prev, customFields: previousState }));
                setHistoryIndex(prev => prev - 1);
              }
            };

            const handleRedo = () => {
              if (historyIndex < fieldHistory.length - 1) {
                const nextState = fieldHistory[historyIndex + 2] || allElements;
                setFormState(prev => ({ ...prev, customFields: nextState }));
                setHistoryIndex(prev => prev + 1);
              }
            };

            const toggleExpanded = (fieldId: string) => {
              setExpandedFields(prev => {
                const newSet = new Set(prev);
                if (newSet.has(fieldId)) {
                  newSet.delete(fieldId);
                } else {
                  newSet.add(fieldId);
                }
                return newSet;
              });
            };

            const collapseAll = () => setExpandedFields(new Set());
            const expandAll = () => setExpandedFields(new Set(allElements.map((el: any) => el.id)));

            // Render an add button with counter
            const AddFieldButton = ({ type, variant = "secondary" }: { type: string; variant?: "primary" | "secondary" }) => {
              const config = FIELD_TYPES[type];
              if (!config) return null;
              const count = typeCounts[type] || 0;
              const isAtLimit = count >= config.maxCount;
              const isSingleUse = singleUseFields.includes(type);
              const category = getFieldCategory(type);
              const colors = CATEGORY_COLORS[category];

              return (
                <div style={{
                  display: "inline-block",
                  borderRadius: "8px",
                  background: isAtLimit ? "#f3f3f3" : colors.bg,
                  border: `1px solid ${isAtLimit ? "#ddd" : colors.border}`,
                  overflow: "hidden",
                }}>
                  <Button
                    onClick={() => addElement(type)}
                    size="slim"
                    variant="tertiary"
                    disabled={isAtLimit}
                    icon={config.icon}
                  >
                    {config.label}
                    {isSingleUse && count > 0 && " ✓"}
                  </Button>
                </div>
              );
            };

            return (
              <Layout>
                <Layout.Section>
                  {/* HEADER - Add Field Buttons */}
                  <Card>
                    <BlockStack gap="400">
                      <BlockStack gap="100">
                        <Text as="h2" variant="headingSm">Constructor de formulario</Text>
                        <Text as="p" variant="bodySm" tone="subdued">
                          Arrastra para reordenar. Haz clic para expandir y editar.
                        </Text>
                      </BlockStack>

                      {/* Essential COD fields */}
                      <BlockStack gap="200">
                        <InlineStack gap="200" blockAlign="center">
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: CATEGORY_COLORS.essential.border }} />
                          <Text as="span" variant="headingSm">Campos esenciales</Text>
                        </InlineStack>
                        <InlineStack gap="200" wrap>
                          <AddFieldButton type="name" variant="primary" />
                          <AddFieldButton type="phone" variant="primary" />
                          <AddFieldButton type="address" variant="primary" />
                          <AddFieldButton type="city" />
                          <AddFieldButton type="province" />
                          <AddFieldButton type="email" />
                          <AddFieldButton type="notes" />
                          <AddFieldButton type="quantity" />
                          <AddFieldButton type="postalCode" />
                        </InlineStack>
                      </BlockStack>

                      <Divider />

                      {/* Custom input fields */}
                      <BlockStack gap="200">
                        <InlineStack gap="200" blockAlign="center">
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: CATEGORY_COLORS.custom.border }} />
                          <Text as="span" variant="headingSm">Campos personalizados</Text>
                        </InlineStack>
                        <InlineStack gap="200" wrap>
                          <AddFieldButton type="text" />
                          <AddFieldButton type="textarea" />
                          <AddFieldButton type="select" />
                          <AddFieldButton type="radio" />
                          <AddFieldButton type="checkbox" />
                          <AddFieldButton type="number" />
                          <AddFieldButton type="date" />
                        </InlineStack>
                      </BlockStack>

                      <Divider />

                      {/* Decorative elements */}
                      <BlockStack gap="200">
                        <InlineStack gap="200" blockAlign="center">
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: CATEGORY_COLORS.decorative.border }} />
                          <Text as="span" variant="headingSm">Elementos decorativos</Text>
                        </InlineStack>
                        <InlineStack gap="200" wrap>
                          <AddFieldButton type="heading" />
                          <AddFieldButton type="image" />
                          <AddFieldButton type="html" />
                          <AddFieldButton type="link_button" />
                        </InlineStack>
                      </BlockStack>
                    </BlockStack>
                  </Card>

                  {/* ELEMENTS LIST with Drag & Drop */}
                  <Box paddingBlockStart="400">
                    <BlockStack gap="300">
                      {/* Header with actions */}
                      <InlineStack align="space-between" blockAlign="center">
                        <Text as="h3" variant="headingSm">
                          Campos del formulario ({allElements.length})
                        </Text>
                        <InlineStack gap="200">
                          <Tooltip content="Deshacer">
                            <Button
                              icon={UndoIcon}
                              size="slim"
                              variant="tertiary"
                              onClick={handleUndo}
                              disabled={historyIndex < 0}
                              accessibilityLabel="Deshacer"
                            />
                          </Tooltip>
                          <Tooltip content="Rehacer">
                            <Button
                              icon={RedoIcon}
                              size="slim"
                              variant="tertiary"
                              onClick={handleRedo}
                              disabled={historyIndex >= fieldHistory.length - 1}
                              accessibilityLabel="Rehacer"
                            />
                          </Tooltip>
                          {allElements.length > 0 && (
                            <>
                              <Button size="slim" variant="tertiary" onClick={collapseAll}>
                                Colapsar
                              </Button>
                              <Button size="slim" variant="tertiary" onClick={expandAll}>
                                Expandir
                              </Button>
                            </>
                          )}
                        </InlineStack>
                      </InlineStack>

                      {allElements.length === 0 ? (
                        <div style={{
                          border: "2px dashed #e3e3e3",
                          borderRadius: "12px",
                          padding: "48px 24px",
                          textAlign: "center",
                          background: "#fafafa",
                        }}>
                          <BlockStack gap="300" inlineAlign="center">
                            <div style={{
                              width: "64px",
                              height: "64px",
                              borderRadius: "50%",
                              background: "#f0f0f0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}>
                              <Icon source={PlusIcon} tone="subdued" />
                            </div>
                            <Text as="p" variant="bodyMd" tone="subdued">
                              Tu formulario está vacío
                            </Text>
                            <Text as="p" variant="bodySm" tone="subdued">
                              Agrega campos usando los botones de arriba
                            </Text>
                          </BlockStack>
                        </div>
                      ) : (
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext
                            items={allElements.map((el: any) => el.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <BlockStack gap="200">
                              {allElements.map((element: any, index: number) => (
                                <SortableFieldCard
                                  key={element.id}
                                  element={element}
                                  index={index}
                                  isExpanded={expandedFields.has(element.id)}
                                  onToggle={() => toggleExpanded(element.id)}
                                  onUpdate={(updates) => updateElement(index, updates)}
                                  onRemove={() => removeElement(index)}
                                />
                              ))}
                            </BlockStack>
                          </SortableContext>
                        </DndContext>
                      )}
                    </BlockStack>
                  </Box>

                  {/* REGIONAL CONFIG */}
                  <Box paddingBlockStart="400">
                    <Card>
                      <BlockStack gap="400" inlineAlign="start">
                        <Text as="h2" variant="headingSm">Configuración regional</Text>
                        <Select
                          label="País"
                          options={COUNTRIES}
                          value={formState.defaultCountry}
                          onChange={handleChange("defaultCountry")}
                          helpText="Las provincias/estados se cargarán según el país seleccionado"
                        />
                      </BlockStack>
                    </Card>
                  </Box>

                  {/* OPTIONS */}
                  <Box paddingBlockStart="400">
                    <Card>
                      <BlockStack gap="400" inlineAlign="start">
                        <Text as="h2" variant="headingSm">Opciones</Text>
                        <FormLayout>
                          <Checkbox
                            label="Ocultar etiquetas"
                            helpText="Solo mostrar placeholders"
                            checked={formState.hideFieldLabels}
                            onChange={handleChange("hideFieldLabels")}
                          />
                          <Checkbox
                            label="Texto RTL"
                            helpText="Derecha a izquierda (árabe, hebreo)"
                            checked={formState.enableRTL}
                            onChange={handleChange("enableRTL")}
                          />
                          <TextField
                            label="CSS personalizado"
                            value={formState.customCss}
                            onChange={handleChange("customCss")}
                            multiline={2}
                            autoComplete="off"
                            monospaced
                          />
                        </FormLayout>
                      </BlockStack>
                    </Card>
                  </Box>

                  {/* MODAL CUSTOMIZATION */}
                  <Box paddingBlockStart="400">
                    <Card>
                      <BlockStack gap="400" inlineAlign="start">
                        <Text as="h2" variant="headingSm">Personalización del modal</Text>
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
                          <FormLayout.Group>
                            <TextField
                              label="Color del botón"
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

                  {/* SUCCESS/ERROR MESSAGES */}
                  <Box paddingBlockStart="400">
                    <Card>
                      <BlockStack gap="400" inlineAlign="start">
                        <Text as="h2" variant="headingSm">Mensajes de éxito y error</Text>
                        <FormLayout>
                          <FormLayout.Group>
                            <TextField
                              label="Título de éxito"
                              value={formState.successTitle}
                              onChange={handleChange("successTitle")}
                              autoComplete="off"
                            />
                            <TextField
                              label="Título de error"
                              value={formState.errorTitle}
                              onChange={handleChange("errorTitle")}
                              autoComplete="off"
                            />
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

                {/* PREVIEW */}
                <Layout.Section variant="oneThird">
                  <div style={{ position: "sticky", top: "20px" }}>
                    <Card>
                      <BlockStack gap="400" inlineAlign="start">
                        <InlineStack align="space-between" wrap={false}>
                          <Text as="h2" variant="headingSm">Vista previa</Text>
                          <InlineStack gap="100" blockAlign="center">
                            <span style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: "#22c55e",
                              display: "inline-block",
                              animation: "pulse 2s infinite",
                            }} />
                            <Text as="span" variant="bodySm" tone="success">En vivo</Text>
                          </InlineStack>
                        </InlineStack>
                        <ButtonGroup variant="segmented" fullWidth>
                          <Button
                            pressed={previewMode === "form"}
                            onClick={() => setPreviewMode("form")}
                            size="slim"
                          >
                            Formulario
                          </Button>
                          <Button
                            pressed={previewMode === "success"}
                            onClick={() => setPreviewMode("success")}
                            size="slim"
                          >
                            Confirmacion
                          </Button>
                        </ButtonGroup>
                        {previewMode === "form" ? (
                          <FormModalPreview formState={formState} previewType="form" sampleProduct={sampleProduct} />
                        ) : (
                          <SuccessPreview formState={formState} />
                        )}
                      </BlockStack>
                    </Card>
                  </div>
                </Layout.Section>
              </Layout>
            );
          })()}

          {/* TAB: Shipping Rates */}
          {selectedTab === 1 && (() => {
            const shippingRates = (formState.customShippingRates as any[]) || [];

            const addShippingRate = () => {
              const newRate = {
                id: `rate_${Date.now()}`,
                name: "",
                price: "0.00",
                condition: "always",
                minOrder: "",
                maxOrder: "",
                provinces: [],
              };
              setFormState(prev => ({
                ...prev,
                customShippingRates: [...shippingRates, newRate]
              }));
            };

            const updateShippingRate = (index: number, updates: any) => {
              const newRates = [...shippingRates];
              newRates[index] = { ...newRates[index], ...updates };
              setFormState(prev => ({ ...prev, customShippingRates: newRates }));
            };

            const removeShippingRate = (index: number) => {
              const newRates = shippingRates.filter((_, i) => i !== index);
              setFormState(prev => ({ ...prev, customShippingRates: newRates }));
            };

            return (
              <Layout>
                <Layout.Section>
                  <Card>
                    <BlockStack gap="400" inlineAlign="start">
                      <BlockStack gap="200">
                        <Text as="h2" variant="headingLg">Tarifas de envío</Text>
                        <Text as="p" tone="subdued">
                          Configura tus tarifas de envío para tu formulario. Todos los precios se utilizarán en la divisa de tu tienda.
                        </Text>
                      </BlockStack>

                      <Checkbox
                        label="Habilitar tarifas de envío"
                        helpText="Mostrar opciones de envío en el formulario"
                        checked={formState.enableShipping}
                        onChange={handleChange("enableShipping")}
                      />
                    </BlockStack>
                  </Card>

                  {formState.enableShipping && (
                    <Box paddingBlockStart="400">
                      <Card>
                        <BlockStack gap="400">
                          <InlineStack align="space-between">
                            <Text as="h2" variant="headingSm">Tarifas configuradas</Text>
                            <Button onClick={addShippingRate} icon={PlusIcon}>
                              Agregar tarifa
                            </Button>
                          </InlineStack>

                          {shippingRates.length === 0 ? (
                            <Box padding="400" background="bg-surface-secondary" borderRadius="200">
                              <BlockStack gap="200" inlineAlign="center">
                                <Text as="p" tone="subdued" alignment="center">
                                  No tienes tarifas de envío configuradas. Agrega una para comenzar.
                                </Text>
                                <Button onClick={addShippingRate}>Agregar primera tarifa</Button>
                              </BlockStack>
                            </Box>
                          ) : (
                            <BlockStack gap="300">
                              {shippingRates.map((rate, index) => (
                                <Card key={rate.id}>
                                  <BlockStack gap="300">
                                    <InlineStack align="space-between" blockAlign="center">
                                      <Text as="span" variant="bodyMd" fontWeight="semibold">
                                        {rate.name || "Sin nombre"}
                                      </Text>
                                      <Button
                                        icon={DeleteIcon}
                                        tone="critical"
                                        size="slim"
                                        onClick={() => removeShippingRate(index)}
                                      />
                                    </InlineStack>
                                    <FormLayout>
                                      <FormLayout.Group>
                                        <TextField
                                          label="Nombre"
                                          value={rate.name}
                                          onChange={(value) => updateShippingRate(index, { name: value })}
                                          placeholder="Ej: Delivery en Santo Domingo"
                                          autoComplete="off"
                                        />
                                        <TextField
                                          label="Precio"
                                          value={rate.price}
                                          onChange={(value) => updateShippingRate(index, { price: value })}
                                          type="number"
                                          prefix="$"
                                          autoComplete="off"
                                        />
                                      </FormLayout.Group>
                                      <Select
                                        label="Condición"
                                        options={[
                                          { value: "always", label: "Siempre visible" },
                                          { value: "min_order", label: "Monto mínimo de orden" },
                                          { value: "province", label: "Por provincia" },
                                        ]}
                                        value={rate.condition}
                                        onChange={(value) => updateShippingRate(index, { condition: value })}
                                      />
                                      {rate.condition === "min_order" && (
                                        <TextField
                                          label="Monto mínimo"
                                          value={rate.minOrder}
                                          onChange={(value) => updateShippingRate(index, { minOrder: value })}
                                          type="number"
                                          prefix="$"
                                          autoComplete="off"
                                        />
                                      )}
                                    </FormLayout>
                                  </BlockStack>
                                </Card>
                              ))}
                            </BlockStack>
                          )}
                        </BlockStack>
                      </Card>
                    </Box>
                  )}
                </Layout.Section>
              </Layout>
            );
          })()}

          {/* TAB: Order Configuration */}
          {selectedTab === 2 && (
            <Layout>
              <Layout.Section>
                <Card>
                  <BlockStack gap="400" inlineAlign="start">
                    <Text as="h2" variant="headingSm">Etiquetas de pedidos</Text>
                    <FormLayout>
                      <TextField
                        label="Prefijo de etiqueta"
                        value={formState.orderTagPrefix}
                        onChange={handleChange("orderTagPrefix")}
                        helpText={`Próxima orden: ${formState.orderTagPrefix}-${nextOrderNumber}. Sigue la secuencia de tu tienda.`}
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
                    <BlockStack gap="400" inlineAlign="start">
                      <Text as="h2" variant="headingSm">Creación de pedidos</Text>
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

                  </Box>
      </Tabs>
    </Page>
  );
}
