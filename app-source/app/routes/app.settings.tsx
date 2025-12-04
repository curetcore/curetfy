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
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const shop = await prisma.shop.findUnique({
    where: { shopDomain: session.shop },
  });

  return json({ shop });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const whatsappNumber = formData.get("whatsappNumber") as string;
  const messageTemplate = formData.get("messageTemplate") as string;
  const buttonText = formData.get("buttonText") as string;
  const buttonColor = formData.get("buttonColor") as string;
  const formTitle = formData.get("formTitle") as string;
  const defaultCountry = formData.get("defaultCountry") as string;

  await prisma.shop.upsert({
    where: { shopDomain: session.shop },
    update: {
      whatsappNumber,
      messageTemplate,
      buttonText,
      buttonColor,
      formTitle,
      defaultCountry,
    },
    create: {
      shopDomain: session.shop,
      whatsappNumber,
      messageTemplate,
      buttonText,
      buttonColor,
      formTitle,
      defaultCountry,
    },
  });

  return json({ success: true });
};

export default function Settings() {
  const { shop } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [formState, setFormState] = useState({
    whatsappNumber: shop?.whatsappNumber || "",
    messageTemplate: shop?.messageTemplate || "🛒 *Nuevo Pedido #{{orderNumber}}*\n\n*Producto:* {{product}}\n*Cantidad:* {{quantity}}\n*Total:* {{total}}\n\n*Cliente:* {{name}}\n*Teléfono:* {{phone}}\n*Dirección:* {{address}}\n*Provincia:* {{province}}",
    buttonText: shop?.buttonText || "Comprar por WhatsApp",
    buttonColor: shop?.buttonColor || "#25D366",
    formTitle: shop?.formTitle || "Completa tu pedido",
    defaultCountry: shop?.defaultCountry || "DO",
  });

  const handleChange = useCallback((field: string) => (value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = () => {
    submit(formState, { method: "POST" });
  };

  const countryOptions = [
    { label: "República Dominicana", value: "DO" },
    { label: "Colombia", value: "CO" },
    { label: "México", value: "MX" },
    { label: "Perú", value: "PE" },
    { label: "Chile", value: "CL" },
    { label: "Argentina", value: "AR" },
  ];

  return (
    <Page
      backAction={{ content: "Dashboard", url: "/app" }}
      title="Configuración"
    >
      <TitleBar title="Configuración" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* WhatsApp Settings */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">WhatsApp</Text>
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
                    label="Mensaje Template"
                    value={formState.messageTemplate}
                    onChange={handleChange("messageTemplate")}
                    multiline={6}
                    helpText="Variables disponibles: {{orderNumber}}, {{product}}, {{quantity}}, {{total}}, {{name}}, {{phone}}, {{address}}, {{province}}"
                  />
                </FormLayout>
              </BlockStack>
            </Card>

            {/* Form Customization */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Personalización del Formulario</Text>
                <FormLayout>
                  <TextField
                    label="Texto del Botón"
                    value={formState.buttonText}
                    onChange={handleChange("buttonText")}
                    placeholder="Comprar por WhatsApp"
                  />
                  <TextField
                    label="Color del Botón"
                    value={formState.buttonColor}
                    onChange={handleChange("buttonColor")}
                    placeholder="#25D366"
                    helpText="Código de color hexadecimal"
                  />
                  <TextField
                    label="Título del Formulario"
                    value={formState.formTitle}
                    onChange={handleChange("formTitle")}
                    placeholder="Completa tu pedido"
                  />
                  <Select
                    label="País por Defecto"
                    options={countryOptions}
                    value={formState.defaultCountry}
                    onChange={handleChange("defaultCountry")}
                  />
                </FormLayout>
              </BlockStack>
            </Card>

            {/* Save Button */}
            <InlineStack align="end">
              <Button
                variant="primary"
                onClick={handleSubmit}
                loading={isSubmitting}
              >
                Guardar cambios
              </Button>
            </InlineStack>
          </BlockStack>
        </Layout.Section>

        {/* Preview */}
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Vista Previa</Text>
              <div
                style={{
                  padding: "16px",
                  background: "#f6f6f7",
                  borderRadius: "8px",
                }}
              >
                <button
                  style={{
                    width: "100%",
                    padding: "14px 28px",
                    backgroundColor: formState.buttonColor,
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {formState.buttonText}
                </button>
              </div>
              <Text as="p" variant="bodySm" tone="subdued">
                Así se verá el botón en tu tienda
              </Text>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">Cómo activar</Text>
              <Text as="p" variant="bodySm">
                1. Ve al editor de temas de tu tienda
              </Text>
              <Text as="p" variant="bodySm">
                2. Selecciona una página de producto
              </Text>
              <Text as="p" variant="bodySm">
                3. Agrega el bloque "COD Buy Button"
              </Text>
              <Text as="p" variant="bodySm">
                4. Personaliza y guarda
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function InlineStack({ children, align }: { children: React.ReactNode; align?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: align === "end" ? "flex-end" : "flex-start", gap: "8px" }}>
      {children}
    </div>
  );
}
