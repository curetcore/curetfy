import { useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Banner,
  EmptyState,
  InlineStack,
  Badge,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // TODO: Load analytics data from database
  return json({
    shopDomain: session.shop,
    analytics: null
  });
};

export default function Analytics() {
  const { shopDomain } = useLoaderData<typeof loader>();

  return (
    <Page
      backAction={{ content: "Dashboard", url: "/app" }}
      title="Analytics"
      subtitle="Estadísticas de tu formulario COD"
    >
      <TitleBar title="Analytics" />

      <Layout>
        <Layout.Section>
          <Banner tone="info">
            <p>La página de analytics está en desarrollo. Pronto podrás ver estadísticas detalladas de tus pedidos.</p>
          </Banner>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <EmptyState
              heading="Analytics próximamente"
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <p>
                Aquí podrás ver métricas como:
              </p>
              <BlockStack gap="200">
                <Text as="p" variant="bodySm">• Total de pedidos por día/semana/mes</Text>
                <Text as="p" variant="bodySm">• Tasa de conversión del formulario</Text>
                <Text as="p" variant="bodySm">• Productos más vendidos</Text>
                <Text as="p" variant="bodySm">• Provincias con más pedidos</Text>
                <Text as="p" variant="bodySm">• Valor promedio de orden</Text>
                <Text as="p" variant="bodySm">• Mensajes de WhatsApp enviados</Text>
              </BlockStack>
            </EmptyState>
          </Card>
        </Layout.Section>

        {/* Placeholder cards for future analytics */}
        <Layout.Section variant="oneHalf">
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">Pedidos este mes</Text>
                <Badge tone="success">Próximamente</Badge>
              </InlineStack>
              <div style={{
                height: "200px",
                background: "#f6f6f7",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b7177"
              }}>
                Gráfico de pedidos
              </div>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneHalf">
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">Ingresos</Text>
                <Badge tone="success">Próximamente</Badge>
              </InlineStack>
              <div style={{
                height: "200px",
                background: "#f6f6f7",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b7177"
              }}>
                Gráfico de ingresos
              </div>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">Tasa de conversión</Text>
              <div style={{
                height: "100px",
                background: "#f6f6f7",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                fontWeight: 600,
                color: "#6b7177"
              }}>
                --%
              </div>
              <Text as="p" variant="bodySm" tone="subdued">Visitantes que completan el formulario</Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">Valor promedio</Text>
              <div style={{
                height: "100px",
                background: "#f6f6f7",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                fontWeight: 600,
                color: "#6b7177"
              }}>
                $--
              </div>
              <Text as="p" variant="bodySm" tone="subdued">Promedio por pedido</Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">WhatsApp enviados</Text>
              <div style={{
                height: "100px",
                background: "#f6f6f7",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                fontWeight: 600,
                color: "#6b7177"
              }}>
                --
              </div>
              <Text as="p" variant="bodySm" tone="subdued">Mensajes este mes</Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
