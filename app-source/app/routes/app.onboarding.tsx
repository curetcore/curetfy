/**
 * Onboarding Route
 *
 * Built for Shopify Partner Terms Compliance:
 * - Marketing consent checkbox for merchant emails
 * - Initial setup wizard
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Checkbox,
  TextField,
  Banner,
  Box,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { useState, useCallback } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const shop = await prisma.shop.findUnique({
    where: { shopDomain: session.shop },
    select: {
      onboardingComplete: true,
      whatsappNumber: true,
      marketingConsent: true,
    },
  });

  // If onboarding is complete, redirect to dashboard
  if (shop?.onboardingComplete) {
    return redirect("/app");
  }

  return json({
    shopDomain: session.shop,
    whatsappNumber: shop?.whatsappNumber || "",
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const whatsappNumber = formData.get("whatsappNumber") as string;
  const marketingConsent = formData.get("marketingConsent") === "true";

  if (!whatsappNumber) {
    return json({ error: "WhatsApp number is required" }, { status: 400 });
  }

  // Update shop with onboarding data
  await prisma.shop.upsert({
    where: { shopDomain: session.shop },
    create: {
      shopDomain: session.shop,
      whatsappNumber,
      marketingConsent,
      marketingConsentAt: marketingConsent ? new Date() : null,
      onboardingComplete: true,
    },
    update: {
      whatsappNumber,
      marketingConsent,
      marketingConsentAt: marketingConsent ? new Date() : null,
      onboardingComplete: true,
    },
  });

  return redirect("/app?welcome=true");
};

export default function Onboarding() {
  const { shopDomain, whatsappNumber: initialWhatsapp } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [whatsappNumber, setWhatsappNumber] = useState(initialWhatsapp);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(() => {
    if (!whatsappNumber.trim()) {
      setError("Por favor ingresa tu número de WhatsApp");
      return;
    }
    setError(null);
    submit(
      {
        whatsappNumber,
        marketingConsent: marketingConsent.toString(),
      },
      { method: "POST" }
    );
  }, [whatsappNumber, marketingConsent, submit]);

  return (
    <Page>
      <TitleBar title="Bienvenido a Curetfy" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              <BlockStack gap="200">
                <Text as="h1" variant="headingXl">
                  Bienvenido a Curetfy COD Form
                </Text>
                <Text as="p" variant="bodyLg" tone="subdued">
                  Configura tu formulario de pago contra entrega en solo unos pasos
                </Text>
              </BlockStack>

              <Divider />

              {error && (
                <Banner tone="critical" onDismiss={() => setError(null)}>
                  {error}
                </Banner>
              )}

              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Paso 1: Configura tu WhatsApp
                </Text>
                <TextField
                  label="Número de WhatsApp"
                  type="tel"
                  value={whatsappNumber}
                  onChange={setWhatsappNumber}
                  placeholder="+1 555 123 4567"
                  helpText="Este es el número donde recibirás los pedidos de tus clientes"
                  autoComplete="tel"
                />
              </BlockStack>

              <Divider />

              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Comunicaciones
                </Text>
                <Box
                  padding="400"
                  background="bg-surface-secondary"
                  borderRadius="200"
                >
                  <Checkbox
                    label="Acepto recibir correos de Curetfy"
                    helpText="Recibirás actualizaciones del producto, tips de uso y ofertas exclusivas. Puedes cancelar en cualquier momento."
                    checked={marketingConsent}
                    onChange={setMarketingConsent}
                  />
                </Box>
                <Text as="p" variant="bodySm" tone="subdued">
                  Al continuar, aceptas nuestros{" "}
                  <a href="/terms" target="_blank" rel="noopener noreferrer">
                    Términos de Servicio
                  </a>{" "}
                  y{" "}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer">
                    Política de Privacidad
                  </a>
                  .
                </Text>
              </BlockStack>

              <Divider />

              <InlineStack align="end">
                <Button
                  variant="primary"
                  size="large"
                  onClick={handleSubmit}
                  loading={isSubmitting}
                >
                  Comenzar a usar Curetfy
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <Text as="h3" variant="headingSm">
                Lo que puedes hacer con Curetfy:
              </Text>
              <BlockStack gap="200">
                <InlineStack gap="200" blockAlign="start">
                  <Text as="span" variant="bodyMd">1.</Text>
                  <Text as="p" variant="bodyMd">
                    Recibir pedidos COD directamente en WhatsApp
                  </Text>
                </InlineStack>
                <InlineStack gap="200" blockAlign="start">
                  <Text as="span" variant="bodyMd">2.</Text>
                  <Text as="p" variant="bodyMd">
                    Crear órdenes automáticamente en Shopify
                  </Text>
                </InlineStack>
                <InlineStack gap="200" blockAlign="start">
                  <Text as="span" variant="bodyMd">3.</Text>
                  <Text as="p" variant="bodyMd">
                    Personalizar tu formulario completamente
                  </Text>
                </InlineStack>
                <InlineStack gap="200" blockAlign="start">
                  <Text as="span" variant="bodyMd">4.</Text>
                  <Text as="p" variant="bodyMd">
                    Ver analíticas de conversión y UTM
                  </Text>
                </InlineStack>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
