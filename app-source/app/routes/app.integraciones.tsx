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
  Checkbox,
  Box,
  InlineStack,
  Badge,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const shop = await prisma.shop.findUnique({
    where: { shopDomain: session.shop },
    select: {
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
    'autoRedirectWhatsApp',
    'enableAnalytics',
    'enablePixel',
    'enableAllProducts',
  ];

  booleanFields.forEach(field => {
    const value = formData.get(field);
    updateData[field] = value === 'true' || value === 'on';
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

  const [formState, setFormState] = useState({
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

          {/* WhatsApp Redirect */}
          <Box paddingBlockStart="400">
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
                  {formState.autoRedirectWhatsApp && (
                    <TextField
                      label="Tiempo de espera (ms)"
                      value={formState.redirectDelay}
                      onChange={handleChange("redirectDelay")}
                      type="number"
                      helpText="Milisegundos a esperar antes de redirigir (2000 = 2 segundos)"
                      autoComplete="off"
                    />
                  )}
                </FormLayout>
              </BlockStack>
            </Card>
          </Box>

          {/* Products */}
          <Box paddingBlockStart="400">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Productos habilitados</Text>
                <FormLayout>
                  <Checkbox
                    label="Habilitar en todos los productos"
                    helpText="Si está desactivado, deberás seleccionar productos específicos donde mostrar el formulario."
                    checked={formState.enableAllProducts}
                    onChange={handleChange("enableAllProducts")}
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
    </Page>
  );
}
