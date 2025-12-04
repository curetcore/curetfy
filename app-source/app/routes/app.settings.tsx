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
    'buttonText', 'buttonColor', 'buttonTextColor'
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
    'enableAllProducts', 'autoRedirectWhatsApp', 'enableAnalytics', 'enablePixel'
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
  });

  const handleChange = useCallback((field: string) => (value: string | boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = () => {
    const data = new FormData();
    Object.entries(formState).forEach(([key, value]) => {
      data.append(key, String(value));
    });
    submit(data, { method: "POST" });
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const tabs = [
    { id: "whatsapp", content: "WhatsApp", accessibilityLabel: "WhatsApp" },
    { id: "form", content: "Formulario", accessibilityLabel: "Formulario" },
    { id: "fields", content: "Campos", accessibilityLabel: "Campos" },
    { id: "modal", content: "Modal", accessibilityLabel: "Modal" },
    { id: "orders", content: "Pedidos", accessibilityLabel: "Pedidos" },
    { id: "advanced", content: "Avanzado", accessibilityLabel: "Avanzado" },
  ];

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
                            autoComplete="off"
                          />
                          <TextField
                            label="Color del encabezado"
                            value={formState.modalHeaderColor}
                            onChange={handleChange("modalHeaderColor")}
                            autoComplete="off"
                          />
                        </FormLayout.Group>
                        <TextField
                          label="Color de acento"
                          value={formState.modalAccentColor}
                          onChange={handleChange("modalAccentColor")}
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
            </Layout>
          )}

          {/* TAB: Order Configuration */}
          {selectedTab === 4 && (
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
          {selectedTab === 5 && (
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
