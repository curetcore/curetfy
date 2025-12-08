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
  BlockStack,
  Text,
  Banner,
  Checkbox,
  Box,
  InlineStack,
  Badge,
  Select,
  Divider,
  RadioButton,
  Link,
  ButtonGroup,
  Button,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

// WhatsApp Message Preview Component
function WhatsAppPreview({ template, shopName }: { template: string; shopName: string }) {
  const sampleData: Record<string, string> = {
    order_number: "COD-00001",
    order_id: "12345",
    order_total: "$125.00",
    first_name: "Cliente",
    last_name: "Ejemplo",
    phone: "+1 555 123 4567",
    email: "cliente@email.com",
    address: "Dirección de ejemplo #123",
    address2: "Apt 4B",
    city: "Ciudad",
    province: "Provincia",
    zip_code: "10101",
    order_note: "Entregar después de las 5pm",
    shipping_rate_name: "Envío estándar",
    product_title: "Producto de ejemplo",
    product_quantity: "2",
    products_summary_with_quantity: "2x Producto Premium ($50.00)\n1x Producto Básico ($25.00)",
  };

  let preview = template;

  // Replace all placeholders with sample data
  Object.entries(sampleData).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    preview = preview.replace(regex, value);
  });

  // Convert WhatsApp formatting to HTML (*bold*, _italic_)
  const formatWhatsAppToHtml = (text: string) => {
    return text
      .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
      .replace(/_([^_]+)_/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  const formattedPreview = formatWhatsAppToHtml(preview);
  const displayName = shopName.replace('.myshopify.com', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div style={{
      background: "#f0f2f5",
      borderRadius: "12px",
      overflow: "hidden",
      border: "1px solid #e0e0e0",
    }}>
      {/* WhatsApp Header */}
      <div style={{
        background: "#008069",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: "#25D366",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#ffffff", fontWeight: "500", fontSize: "16px" }}>{displayName}</div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px" }}>en línea</div>
        </div>
      </div>

      {/* Chat Area */}
      <div style={{
        background: "#efeae2",
        padding: "16px",
        minHeight: "280px",
        maxHeight: "400px",
        overflowY: "auto",
      }}>
        {/* Message Bubble */}
        <div style={{
          background: "#ffffff",
          borderRadius: "8px",
          borderTopLeftRadius: "0",
          padding: "8px 12px",
          maxWidth: "85%",
          boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
          fontSize: "14.2px",
          lineHeight: "1.5",
          color: "#111b21",
        }}>
          <span dangerouslySetInnerHTML={{ __html: formattedPreview }} />
          <div style={{
            fontSize: "11px",
            color: "#667781",
            textAlign: "right",
            marginTop: "4px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "4px",
          }}>
            12:30
            <svg width="16" height="11" viewBox="0 0 16 11" fill="#53bdeb">
              <path d="M11.071.653a.457.457 0 00-.304-.102.493.493 0 00-.381.178l-6.19 7.636-2.405-2.272a.463.463 0 00-.336-.146.47.47 0 00-.343.146l-.311.31a.445.445 0 00-.14.337c0 .136.047.25.14.343l2.996 2.996a.724.724 0 00.502.203.697.697 0 00.546-.266l6.646-8.417a.497.497 0 00.108-.299.441.441 0 00-.14-.337l-.388-.31zm4 0a.457.457 0 00-.303-.102.493.493 0 00-.382.178l-6.19 7.636-1.028-.97-.686.654 1.54 1.54a.724.724 0 00.501.203.697.697 0 00.547-.266l6.646-8.417a.497.497 0 00.108-.299.441.441 0 00-.14-.337l-.388-.31z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const shop = await prisma.shop.findUnique({
    where: { shopDomain: session.shop },
    select: {
      // Shop info
      shopDomain: true,
      // WhatsApp
      whatsappNumber: true,
      messageTemplate: true,
      redirectType: true,
      customRedirectUrl: true,
      // Visibility
      formEnabled: true,
      enableOnProductPages: true,
      enableOnCartPage: true,
      hideCartBuyNowButton: true,
      productButtonAction: true,
      hideAddToCartButton: true,
      hideProductBuyNowButton: true,
      disableOnHomePage: true,
      disableOnCollectionPages: true,
      // Limits
      limitToSpecificProducts: true,
      limitToSpecificCollections: true,
      excludeProducts: true,
      excludeCollections: true,
      limitToCountries: true,
      orderMinimum: true,
      orderMaximum: true,
      // Order options
      useCodPaymentMethod: true,
      createDraftOrder: true,
      saveUtmParams: true,
      // Form options
      disableAutoDiscounts: true,
      disableAutocomplete: true,
      removeLeadingZeroPhone: true,
      addCodFormTag: true,
      // Integrations
      autoRedirectWhatsApp: true,
      redirectDelay: true,
      enableAnalytics: true,
      enablePixel: true,
      pixelId: true,
      enableAllProducts: true,
    },
  });

  return json({ shop });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const updateData: Record<string, any> = {};

  // Boolean fields
  const booleanFields = [
    // Visibility
    'formEnabled',
    'enableOnProductPages',
    'enableOnCartPage',
    'hideCartBuyNowButton',
    'hideAddToCartButton',
    'hideProductBuyNowButton',
    'disableOnHomePage',
    'disableOnCollectionPages',
    // Limits
    'limitToSpecificProducts',
    'limitToSpecificCollections',
    'excludeProducts',
    'excludeCollections',
    'limitToCountries',
    // Order options
    'useCodPaymentMethod',
    'createDraftOrder',
    'saveUtmParams',
    // Form options
    'disableAutoDiscounts',
    'disableAutocomplete',
    'removeLeadingZeroPhone',
    'addCodFormTag',
    // Integrations
    'autoRedirectWhatsApp',
    'enableAnalytics',
    'enablePixel',
    'enableAllProducts',
  ];

  // String fields
  const productButtonAction = formData.get('productButtonAction');
  if (productButtonAction !== null) {
    updateData.productButtonAction = productButtonAction as string;
  }

  booleanFields.forEach(field => {
    const value = formData.get(field);
    if (value !== null) {
      updateData[field] = value === 'true' || value === 'on';
    }
  });

  // Text fields
  const pixelId = formData.get('pixelId');
  if (pixelId !== null) {
    updateData.pixelId = pixelId as string;
  }

  const whatsappNumber = formData.get('whatsappNumber');
  if (whatsappNumber !== null) {
    updateData.whatsappNumber = whatsappNumber as string;
  }

  const messageTemplate = formData.get('messageTemplate');
  if (messageTemplate !== null) {
    updateData.messageTemplate = messageTemplate as string;
  }

  const redirectType = formData.get('redirectType');
  if (redirectType !== null) {
    updateData.redirectType = redirectType as string;
  }

  const customRedirectUrl = formData.get('customRedirectUrl');
  if (customRedirectUrl !== null) {
    updateData.customRedirectUrl = customRedirectUrl as string;
  }

  // Number fields
  const redirectDelay = formData.get('redirectDelay');
  if (redirectDelay) {
    updateData.redirectDelay = parseInt(redirectDelay as string, 10) || 2000;
  }

  // Decimal fields (order limits)
  const orderMinimum = formData.get('orderMinimum');
  if (orderMinimum !== null) {
    const val = parseFloat(orderMinimum as string);
    updateData.orderMinimum = isNaN(val) || val <= 0 ? null : val;
  }

  const orderMaximum = formData.get('orderMaximum');
  if (orderMaximum !== null) {
    const val = parseFloat(orderMaximum as string);
    updateData.orderMaximum = isNaN(val) || val <= 0 ? null : val;
  }

  await prisma.shop.update({
    where: { shopDomain: session.shop },
    data: updateData,
  });

  return json({ success: true });
};

export default function Integraciones() {
  const { shop } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [showSaved, setShowSaved] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);

  const [formState, setFormState] = useState({
    // WhatsApp
    whatsappNumber: shop?.whatsappNumber || "",
    messageTemplate: shop?.messageTemplate || "Hola, realicé un pedido el cual me gustaría que sea entregado tomando en cuenta los siguientes datos.\n\nNumero de orden: {order_number}\nTotal de la compra: {order_total}\nLo que compré fue: {products_summary_with_quantity}\n\nPersona autorizada de recibir:\nNombre: {first_name} {last_name}\nWhatsApp: {phone}\nCorreo electronico: {email}\n\nDirección de entrega:\n{address}, {province}\n\nAgradezco su pronta atención y confirmación del envío.\n\nSaludos cordiales,\n\n{first_name} {last_name}",
    redirectType: shop?.redirectType || "whatsapp",
    customRedirectUrl: shop?.customRedirectUrl || "",
    // Visibility
    formEnabled: shop?.formEnabled ?? true,
    enableOnProductPages: shop?.enableOnProductPages ?? true,
    enableOnCartPage: shop?.enableOnCartPage ?? false,
    hideCartBuyNowButton: shop?.hideCartBuyNowButton ?? false,
    productButtonAction: shop?.productButtonAction || "current",
    hideAddToCartButton: shop?.hideAddToCartButton ?? false,
    hideProductBuyNowButton: shop?.hideProductBuyNowButton ?? false,
    disableOnHomePage: shop?.disableOnHomePage ?? false,
    disableOnCollectionPages: shop?.disableOnCollectionPages ?? false,
    // Limits
    limitToSpecificProducts: shop?.limitToSpecificProducts ?? false,
    limitToSpecificCollections: shop?.limitToSpecificCollections ?? false,
    excludeProducts: shop?.excludeProducts ?? false,
    excludeCollections: shop?.excludeCollections ?? false,
    limitToCountries: shop?.limitToCountries ?? false,
    orderMinimum: shop?.orderMinimum ? String(shop.orderMinimum) : "",
    orderMaximum: shop?.orderMaximum ? String(shop.orderMaximum) : "",
    // Order options
    useCodPaymentMethod: shop?.useCodPaymentMethod ?? true,
    createDraftOrder: shop?.createDraftOrder ?? true,
    saveUtmParams: shop?.saveUtmParams ?? true,
    // Form options
    disableAutoDiscounts: shop?.disableAutoDiscounts ?? false,
    disableAutocomplete: shop?.disableAutocomplete ?? false,
    removeLeadingZeroPhone: shop?.removeLeadingZeroPhone ?? false,
    addCodFormTag: shop?.addCodFormTag ?? true,
    // Integrations
    autoRedirectWhatsApp: shop?.autoRedirectWhatsApp ?? true,
    redirectDelay: String(shop?.redirectDelay || 2000),
    enableAnalytics: shop?.enableAnalytics ?? true,
    enablePixel: shop?.enablePixel ?? false,
    pixelId: shop?.pixelId || "",
    enableAllProducts: shop?.enableAllProducts ?? true,
  });

  const handleChange = useCallback((field: string) => (value: boolean | string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(() => {
    const formData = new FormData();

    // WhatsApp
    formData.append('whatsappNumber', formState.whatsappNumber);
    formData.append('messageTemplate', formState.messageTemplate);
    formData.append('redirectType', formState.redirectType);
    formData.append('customRedirectUrl', formState.customRedirectUrl);
    // Visibility
    formData.append('formEnabled', String(formState.formEnabled));
    formData.append('enableOnProductPages', String(formState.enableOnProductPages));
    formData.append('enableOnCartPage', String(formState.enableOnCartPage));
    formData.append('hideCartBuyNowButton', String(formState.hideCartBuyNowButton));
    formData.append('productButtonAction', formState.productButtonAction);
    formData.append('hideAddToCartButton', String(formState.hideAddToCartButton));
    formData.append('hideProductBuyNowButton', String(formState.hideProductBuyNowButton));
    formData.append('disableOnHomePage', String(formState.disableOnHomePage));
    formData.append('disableOnCollectionPages', String(formState.disableOnCollectionPages));
    // Limits
    formData.append('limitToSpecificProducts', String(formState.limitToSpecificProducts));
    formData.append('limitToSpecificCollections', String(formState.limitToSpecificCollections));
    formData.append('excludeProducts', String(formState.excludeProducts));
    formData.append('excludeCollections', String(formState.excludeCollections));
    formData.append('limitToCountries', String(formState.limitToCountries));
    formData.append('orderMinimum', formState.orderMinimum);
    formData.append('orderMaximum', formState.orderMaximum);
    // Order options
    formData.append('useCodPaymentMethod', String(formState.useCodPaymentMethod));
    formData.append('createDraftOrder', String(formState.createDraftOrder));
    formData.append('saveUtmParams', String(formState.saveUtmParams));
    // Form options
    formData.append('disableAutoDiscounts', String(formState.disableAutoDiscounts));
    formData.append('disableAutocomplete', String(formState.disableAutocomplete));
    formData.append('removeLeadingZeroPhone', String(formState.removeLeadingZeroPhone));
    formData.append('addCodFormTag', String(formState.addCodFormTag));
    // Integrations
    formData.append('autoRedirectWhatsApp', String(formState.autoRedirectWhatsApp));
    formData.append('redirectDelay', formState.redirectDelay);
    formData.append('enableAnalytics', String(formState.enableAnalytics));
    formData.append('enablePixel', String(formState.enablePixel));
    formData.append('pixelId', formState.pixelId);
    formData.append('enableAllProducts', String(formState.enableAllProducts));

    submit(formData, { method: "post" });
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  }, [formState, submit]);

  const tabLabels = ["WhatsApp", "Visibilidad", "Configuración", "Integraciones"];

  const whatsappPlaceholders = [
    { code: "{products_summary_with_quantity}", desc: "para insertar todos los productos en el pedido con sus respectivas cantidades" },
    { code: "{product_title}", desc: "para insertar el título del producto" },
    { code: "{product_quantity}", desc: "para insertar la cantidad del producto" },
    { code: "{order_id}", desc: "para insertar el ID del pedido" },
    { code: "{order_number}", desc: "para insertar el número o el nombre del pedido" },
    { code: "{order_total}", desc: "para insertar el total del pedido" },
    { code: "{first_name}", desc: "para insertar el nombre" },
    { code: "{last_name}", desc: "para insertar el apellido" },
    { code: "{phone}", desc: "para insertar el número de teléfono" },
    { code: "{email}", desc: "para insertar la dirección de correo electrónico" },
    { code: "{address}", desc: "para insertar la dirección" },
    { code: "{address2}", desc: "para insertar la dirección 2" },
    { code: "{province}", desc: "para insertar la provincia" },
    { code: "{city}", desc: "para insertar la ciudad" },
    { code: "{zip_code}", desc: "para insertar el código postal" },
    { code: "{order_note}", desc: "para insertar la nota de pedido" },
    { code: "{shipping_rate_name}", desc: "para insertar el nombre de la tarifa de envío seleccionada por el cliente" },
  ];

  return (
    <Page
      backAction={{ content: "Dashboard", url: "/app" }}
      title="Integraciones"
      primaryAction={{
        content: "Guardar cambios",
        onAction: handleSubmit,
        loading: isSubmitting,
      }}
    >
      <TitleBar title="Integraciones" />

      {showSaved && (
        <Box paddingBlockEnd="400">
          <Banner tone="success" onDismiss={() => setShowSaved(false)}>
            Cambios guardados correctamente
          </Banner>
        </Box>
      )}

      <Box paddingBlockEnd="400">
        <ButtonGroup variant="segmented">
          {tabLabels.map((label, index) => (
            <Button
              key={index}
              pressed={selectedTab === index}
              onClick={() => setSelectedTab(index)}
            >
              {label}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      <Box>
          {/* TAB: WhatsApp */}
          {selectedTab === 0 && (
            <Layout>
              <Layout.Section>
                {/* Opciones de redirección */}
                <Card>
                  <BlockStack gap="400">
                    <BlockStack gap="200">
                      <Text as="h2" variant="headingMd">Redirección después del pedido</Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        Elige a dónde redirigir a tus clientes después de completar un pedido.
                      </Text>
                    </BlockStack>
                    <BlockStack gap="300">
                      <RadioButton
                        label="Redirige a tus clientes a la página de agradecimiento predeterminada de Shopify"
                        id="redirect-shopify"
                        name="redirectType"
                        checked={formState.redirectType === "shopify"}
                        onChange={() => handleChange("redirectType")("shopify")}
                      />
                      <RadioButton
                        label="Redirige a tus clientes a una página personalizada o enlace"
                        id="redirect-custom"
                        name="redirectType"
                        checked={formState.redirectType === "custom"}
                        onChange={() => handleChange("redirectType")("custom")}
                      />
                      {formState.redirectType === "custom" && (
                        <Box paddingInlineStart="600">
                          <TextField
                            label="URL de redirección personalizada"
                            value={formState.customRedirectUrl}
                            onChange={handleChange("customRedirectUrl")}
                            placeholder="https://mitienda.com/gracias"
                            autoComplete="off"
                          />
                        </Box>
                      )}
                      <RadioButton
                        label="Redirigir a los clientes a un chat de WhatsApp contigo"
                        id="redirect-whatsapp"
                        name="redirectType"
                        checked={formState.redirectType === "whatsapp"}
                        onChange={() => handleChange("redirectType")("whatsapp")}
                      />
                    </BlockStack>
                  </BlockStack>
                </Card>

                {/* Configuración de WhatsApp */}
                {formState.redirectType === "whatsapp" && (
                  <Box paddingBlockStart="400">
                    <Card>
                      <BlockStack gap="400">
                        <Text as="h2" variant="headingMd">Configuración de WhatsApp</Text>
                        <FormLayout>
                          <TextField
                            label="Tu número de teléfono de WhatsApp"
                            value={formState.whatsappNumber}
                            onChange={handleChange("whatsappNumber")}
                            placeholder="15551234567"
                            autoComplete="off"
                            helpText="Incluye el código de tu país. Ejemplo: 15551234567 (USA), 521234567890 (México)"
                          />
                          <TextField
                            label="Mensaje de WhatsApp precargado"
                            value={formState.messageTemplate}
                            onChange={handleChange("messageTemplate")}
                            multiline={12}
                            autoComplete="off"
                          />
                        </FormLayout>
                      </BlockStack>
                    </Card>
                  </Box>
                )}

                {/* Códigos disponibles */}
                {formState.redirectType === "whatsapp" && (
                  <Box paddingBlockStart="400">
                    <Card>
                      <BlockStack gap="400">
                        <Text as="h2" variant="headingMd">Códigos disponibles</Text>
                        <Text as="p" variant="bodySm" tone="subdued">
                          Usa estos códigos en tu mensaje de WhatsApp para insertar información del pedido automáticamente:
                        </Text>
                        <BlockStack gap="100">
                          {whatsappPlaceholders.map((placeholder, index) => (
                            <InlineStack key={index} gap="200" wrap={false}>
                              <Box minWidth="280px">
                                <Text as="span" variant="bodySm" fontWeight="semibold">
                                  <code style={{ backgroundColor: "#f4f4f4", padding: "2px 6px", borderRadius: "4px" }}>
                                    {placeholder.code}
                                  </code>
                                </Text>
                              </Box>
                              <Text as="span" variant="bodySm" tone="subdued">
                                {placeholder.desc}
                              </Text>
                            </InlineStack>
                          ))}
                        </BlockStack>
                      </BlockStack>
                    </Card>
                  </Box>
                )}
              </Layout.Section>

              {/* Vista previa de WhatsApp */}
              {formState.redirectType === "whatsapp" && (
                <Layout.Section variant="oneThird">
                  <Card>
                    <BlockStack gap="400">
                      <InlineStack align="space-between">
                        <Text as="h2" variant="headingSm">Vista previa</Text>
                        <Badge tone="success">En vivo</Badge>
                      </InlineStack>
                      <WhatsAppPreview
                        template={formState.messageTemplate}
                        shopName={shop?.shopDomain || "Mi Tienda"}
                      />
                    </BlockStack>
                  </Card>
                </Layout.Section>
              )}
            </Layout>
          )}

          {/* TAB: Visibilidad */}
          {selectedTab === 1 && (
            <Layout>
              <Layout.Section>
                {/* Estado del formulario */}
                <Card>
                  <BlockStack gap="400">
                    <BlockStack gap="200">
                      <Text as="h2" variant="headingMd">Activa o desactiva tu formulario</Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        Puedes optar por desactivar tu formulario o activarlo sólo en las páginas de productos, sólo en la página del carrito o en ambos.
                      </Text>
                    </BlockStack>
                    <BlockStack gap="300">
                      <Checkbox
                        label="Formulario COD habilitado"
                        helpText="Activa o desactiva completamente el formulario en tu tienda."
                        checked={formState.formEnabled}
                        onChange={handleChange("formEnabled")}
                      />
                      {formState.formEnabled && (
                        <>
                          <Checkbox
                            label="Mostrar en páginas de producto"
                            checked={formState.enableOnProductPages}
                            onChange={handleChange("enableOnProductPages")}
                          />
                          <Checkbox
                            label="Mostrar en página del carrito"
                            checked={formState.enableOnCartPage}
                            onChange={handleChange("enableOnCartPage")}
                          />
                        </>
                      )}
                    </BlockStack>
                  </BlockStack>
                </Card>

                {/* Configuración página del carrito */}
                {formState.formEnabled && formState.enableOnCartPage && (
                  <Box paddingBlockStart="400">
                    <Card>
                      <BlockStack gap="400">
                        <Text as="h2" variant="headingMd">Configuración de la página del carrito</Text>
                        <BlockStack gap="300">
                          <Checkbox
                            label="Ocultar el botón Comprar Ahora en el carrito"
                            helpText="Oculta el botón de compra rápida en la página del carrito."
                            checked={formState.hideCartBuyNowButton}
                            onChange={handleChange("hideCartBuyNowButton")}
                          />
                        </BlockStack>
                      </BlockStack>
                    </Card>
                  </Box>
                )}

                {/* Configuración páginas de producto */}
                {formState.formEnabled && formState.enableOnProductPages && (
                  <Box paddingBlockStart="400">
                    <Card>
                      <BlockStack gap="400">
                        <Text as="h2" variant="headingMd">Configuración de las páginas del producto</Text>
                        <BlockStack gap="300">
                          <Select
                            label="Cuando se clica en el botón en las páginas del producto:"
                            options={[
                              { label: "Comprar producto actual", value: "current" },
                              { label: "Comprar producto actual + carrito", value: "current_plus_cart" },
                            ]}
                            value={formState.productButtonAction}
                            onChange={handleChange("productButtonAction")}
                          />
                          <Divider />
                          <Checkbox
                            label="Ocultar el botón Agregar al Carrito en las páginas del producto"
                            helpText="Oculta el botón 'Agregar al carrito' para forzar el uso del formulario COD."
                            checked={formState.hideAddToCartButton}
                            onChange={handleChange("hideAddToCartButton")}
                          />
                          <Checkbox
                            label="Ocultar el botón Comprar Ahora en las páginas del producto"
                            helpText="Oculta el botón de compra rápida en las páginas de producto."
                            checked={formState.hideProductBuyNowButton}
                            onChange={handleChange("hideProductBuyNowButton")}
                          />
                        </BlockStack>
                      </BlockStack>
                    </Card>
                  </Box>
                )}

                {/* Configuración otras páginas */}
                {formState.formEnabled && (
                  <Box paddingBlockStart="400">
                    <Card>
                      <BlockStack gap="400">
                        <Text as="h2" variant="headingMd">Configuración de otras páginas</Text>
                        <BlockStack gap="300">
                          <Checkbox
                            label="Deshabilitar Curetfy en la página de inicio"
                            helpText="No mostrar el formulario COD en la página principal de tu tienda."
                            checked={formState.disableOnHomePage}
                            onChange={handleChange("disableOnHomePage")}
                          />
                          <Checkbox
                            label="Deshabilitar Curetfy en las páginas de colecciones"
                            helpText="No mostrar el formulario COD en las páginas de colecciones."
                            checked={formState.disableOnCollectionPages}
                            onChange={handleChange("disableOnCollectionPages")}
                          />
                        </BlockStack>
                      </BlockStack>
                    </Card>
                  </Box>
                )}

                {/* Límites */}
                {formState.formEnabled && (
                  <Box paddingBlockStart="400">
                    <Card>
                      <BlockStack gap="400">
                        <BlockStack gap="200">
                          <Text as="h2" variant="headingMd">Limita el formulario a productos, colecciones, países y totales</Text>
                          <Text as="p" variant="bodySm" tone="subdued">
                            Aquí puedes elegir mostrar tu formulario sólo para clientes en países específicos o para productos y colecciones específicas. También puedes limitar el formulario COD según el total del pedido.
                          </Text>
                        </BlockStack>
                        <BlockStack gap="300">
                          <Checkbox
                            label="Habilita el formulario sólo para productos y colecciones específicas"
                            helpText="El formulario solo aparecerá en los productos y colecciones que selecciones."
                            checked={formState.limitToSpecificProducts || formState.limitToSpecificCollections}
                            onChange={(checked) => {
                              handleChange("limitToSpecificProducts")(checked);
                              handleChange("limitToSpecificCollections")(checked);
                            }}
                          />
                          <Checkbox
                            label="Deshabilita tu formulario para uno o más productos y colecciones"
                            helpText="Excluye productos o colecciones específicas donde no quieres mostrar el formulario."
                            checked={formState.excludeProducts || formState.excludeCollections}
                            onChange={(checked) => {
                              handleChange("excludeProducts")(checked);
                              handleChange("excludeCollections")(checked);
                            }}
                          />
                          <Checkbox
                            label="Habilitar el formulario sólo para países específicos"
                            helpText="El formulario solo estará disponible para visitantes de los países que configures."
                            checked={formState.limitToCountries}
                            onChange={handleChange("limitToCountries")}
                          />
                          <Divider />
                          <BlockStack gap="200">
                            <Text as="p" variant="bodySm">
                              Tu formulario sólo estará activo si el total del pedido está entre:
                            </Text>
                            <InlineStack gap="400">
                              <div style={{ flex: 1 }}>
                                <TextField
                                  label="Mínimo"
                                  value={formState.orderMinimum}
                                  onChange={handleChange("orderMinimum")}
                                  type="number"
                                  placeholder="0.00"
                                  prefix="$"
                                  autoComplete="off"
                                />
                              </div>
                              <div style={{ flex: 1 }}>
                                <TextField
                                  label="Máximo"
                                  value={formState.orderMaximum}
                                  onChange={handleChange("orderMaximum")}
                                  type="number"
                                  placeholder="Sin límite"
                                  prefix="$"
                                  autoComplete="off"
                                  helpText="Deja vacío para sin límite"
                                />
                              </div>
                            </InlineStack>
                          </BlockStack>
                        </BlockStack>
                      </BlockStack>
                    </Card>
                  </Box>
                )}
              </Layout.Section>
            </Layout>
          )}

          {/* TAB: Configuración */}
          {selectedTab === 2 && (
            <Layout>
              <Layout.Section>
                {/* Opciones de pedido */}
                <Card>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">Opciones de pedido</Text>
                    <BlockStack gap="300">
                      <Checkbox
                        label="Crea pedidos con el método de pago Cash on Delivery (COD)"
                        helpText="Los pedidos se crearán con el método de pago 'Pago contra entrega'."
                        checked={formState.useCodPaymentMethod}
                        onChange={handleChange("useCodPaymentMethod")}
                      />
                      <Checkbox
                        label="Guardar los pedidos como pedidos preliminares"
                        helpText="Los pedidos se guardarán como borradores (draft orders) en lugar de pedidos finales."
                        checked={formState.createDraftOrder}
                        onChange={handleChange("createDraftOrder")}
                      />
                      <Checkbox
                        label="Guarde los parámetros UTM en la sección de detalles adicionales del pedido"
                        helpText="Los parámetros utm_source, utm_medium, utm_campaign se guardarán en las notas del pedido."
                        checked={formState.saveUtmParams}
                        onChange={handleChange("saveUtmParams")}
                      />
                      <Checkbox
                        label="Agregar la etiqueta curetfy_cod_form a los pedidos del formulario COD"
                        helpText="Se añadirá automáticamente la etiqueta 'curetfy_cod_form' a todos los pedidos creados."
                        checked={formState.addCodFormTag}
                        onChange={handleChange("addCodFormTag")}
                      />
                    </BlockStack>
                  </BlockStack>
                </Card>

                {/* Opciones del formulario */}
                <Box paddingBlockStart="400">
                  <Card>
                    <BlockStack gap="400">
                      <Text as="h2" variant="headingMd">Opciones del formulario</Text>
                      <BlockStack gap="300">
                        <Checkbox
                          label="Desactiva tus descuentos automáticos de Shopify en el formulario COD"
                          helpText="Los descuentos automáticos de tu tienda no se aplicarán en los pedidos del formulario COD."
                          checked={formState.disableAutoDiscounts}
                          onChange={handleChange("disableAutoDiscounts")}
                        />
                        <Checkbox
                          label="Deshabilitar autocompletar en el formulario COD"
                          helpText="Los campos del formulario no mostrarán sugerencias de autocompletado del navegador."
                          checked={formState.disableAutocomplete}
                          onChange={handleChange("disableAutocomplete")}
                        />
                        <Checkbox
                          label="Eliminar el 0 al principio de los números de teléfono en el pedido final en Shopify"
                          helpText="Si el cliente ingresa '0809...', se guardará como '809...' en Shopify."
                          checked={formState.removeLeadingZeroPhone}
                          onChange={handleChange("removeLeadingZeroPhone")}
                        />
                        <Checkbox
                          label="Redirigir automáticamente a WhatsApp"
                          helpText="Al enviar el formulario, el cliente será redirigido a WhatsApp automáticamente."
                          checked={formState.autoRedirectWhatsApp}
                          onChange={handleChange("autoRedirectWhatsApp")}
                        />
                        {formState.autoRedirectWhatsApp && (
                          <TextField
                            label="Tiempo de espera antes de redirigir (ms)"
                            value={formState.redirectDelay}
                            onChange={handleChange("redirectDelay")}
                            type="number"
                            helpText="Milisegundos a esperar antes de redirigir (2000 = 2 segundos)"
                            autoComplete="off"
                          />
                        )}
                      </BlockStack>
                    </BlockStack>
                  </Card>
                </Box>

                {/* Productos */}
                <Box paddingBlockStart="400">
                  <Card>
                    <BlockStack gap="400">
                      <Text as="h2" variant="headingMd">Productos habilitados</Text>
                      <BlockStack gap="300">
                        <Checkbox
                          label="Habilitar en todos los productos"
                          helpText="Si está desactivado, deberás seleccionar productos específicos donde mostrar el formulario."
                          checked={formState.enableAllProducts}
                          onChange={handleChange("enableAllProducts")}
                        />
                      </BlockStack>
                    </BlockStack>
                  </Card>
                </Box>
              </Layout.Section>
            </Layout>
          )}

          {/* TAB: Integraciones */}
          {selectedTab === 3 && (
            <Layout>
              <Layout.Section>
                {/* Facebook Pixel */}
                <Card>
                  <BlockStack gap="400">
                    <InlineStack align="space-between" blockAlign="center">
                      <BlockStack gap="100">
                        <Text as="h2" variant="headingMd">Facebook Pixel</Text>
                        <Text as="p" variant="bodySm" tone="subdued">
                          Rastrea conversiones y optimiza tus anuncios de Facebook
                        </Text>
                      </BlockStack>
                      <Badge tone={formState.enablePixel ? "success" : "info"}>
                        {formState.enablePixel ? "Activo" : "Inactivo"}
                      </Badge>
                    </InlineStack>
                    <FormLayout>
                      <Checkbox
                        label="Habilitar Facebook Pixel"
                        helpText="Envía eventos de conversión a Facebook Ads cuando se complete un pedido."
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
                          helpText="Encuentra tu Pixel ID en Facebook Events Manager"
                        />
                      )}
                    </FormLayout>
                  </BlockStack>
                </Card>

                {/* Analytics */}
                <Box paddingBlockStart="400">
                  <Card>
                    <BlockStack gap="400">
                      <InlineStack align="space-between" blockAlign="center">
                        <BlockStack gap="100">
                          <Text as="h2" variant="headingMd">Analytics interno</Text>
                          <Text as="p" variant="bodySm" tone="subdued">
                            Estadísticas de uso del formulario en tu dashboard
                          </Text>
                        </BlockStack>
                        <Badge tone={formState.enableAnalytics ? "success" : "info"}>
                          {formState.enableAnalytics ? "Activo" : "Inactivo"}
                        </Badge>
                      </InlineStack>
                      <FormLayout>
                        <Checkbox
                          label="Habilitar analytics interno"
                          helpText="Registra aberturas del formulario, pedidos completados y tasas de conversión."
                          checked={formState.enableAnalytics}
                          onChange={handleChange("enableAnalytics")}
                        />
                      </FormLayout>
                    </BlockStack>
                  </Card>
                </Box>

                {/* Coming Soon */}
                <Box paddingBlockStart="400">
                  <Card>
                    <BlockStack gap="300">
                      <Text as="h2" variant="headingMd">Próximamente</Text>
                      <BlockStack gap="200">
                        <InlineStack gap="200" blockAlign="center">
                          <Badge tone="attention">Próximo</Badge>
                          <Text as="span" variant="bodySm">Google Sheets - Exporta pedidos automáticamente</Text>
                        </InlineStack>
                        <InlineStack gap="200" blockAlign="center">
                          <Badge tone="attention">Próximo</Badge>
                          <Text as="span" variant="bodySm">Google Analytics 4 - Tracking avanzado</Text>
                        </InlineStack>
                        <InlineStack gap="200" blockAlign="center">
                          <Badge tone="attention">Próximo</Badge>
                          <Text as="span" variant="bodySm">TikTok Pixel - Conversiones de TikTok Ads</Text>
                        </InlineStack>
                        <InlineStack gap="200" blockAlign="center">
                          <Badge tone="attention">Próximo</Badge>
                          <Text as="span" variant="bodySm">Zapier / Make - Automatizaciones</Text>
                        </InlineStack>
                      </BlockStack>
                    </BlockStack>
                  </Card>
                </Box>
              </Layout.Section>
            </Layout>
          )}
      </Box>
    </Page>
  );
}
