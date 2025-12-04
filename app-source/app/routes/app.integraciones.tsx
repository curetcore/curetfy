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
  Tabs,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const shop = await prisma.shop.findUnique({
    where: { shopDomain: session.shop },
    select: {
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

  // Number fields
  const redirectDelay = formData.get('redirectDelay');
  if (redirectDelay) {
    updateData.redirectDelay = parseInt(redirectDelay as string, 10) || 2000;
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

  const tabs = [
    { id: "config", content: "Configuración", accessibilityLabel: "Configuración" },
    { id: "integrations", content: "Integraciones", accessibilityLabel: "Integraciones" },
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

      <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
        <Box paddingBlockStart="400">
          {/* TAB: Configuración */}
          {selectedTab === 0 && (
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
          {selectedTab === 1 && (
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
      </Tabs>
    </Page>
  );
}
