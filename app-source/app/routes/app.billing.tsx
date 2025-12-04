import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Badge,
  List,
  Divider,
  Box,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    orders: 60,
    features: [
      "60 órdenes/mes",
      "1 número WhatsApp",
      "Formulario básico",
      "Soporte por email",
    ],
  },
  PRO: {
    name: "Pro",
    price: 7.99,
    orders: 500,
    features: [
      "500 órdenes/mes",
      "1 número WhatsApp",
      "Personalización completa",
      "Analytics básico",
      "Soporte prioritario",
    ],
  },
  BUSINESS: {
    name: "Business",
    price: 19.99,
    orders: 2000,
    features: [
      "2,000 órdenes/mes",
      "Múltiples números WhatsApp",
      "Google Sheets export",
      "Facebook Pixel",
      "Analytics avanzado",
    ],
  },
  UNLIMITED: {
    name: "Unlimited",
    price: 49.99,
    orders: Infinity,
    features: [
      "Órdenes ilimitadas",
      "Todo en Business",
      "A/B Testing",
      "API access",
      "Soporte dedicado",
    ],
  },
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const shop = await prisma.shop.findUnique({
    where: { shopDomain: session.shop },
  });

  return json({
    currentPlan: shop?.plan || "FREE",
    plans: PLANS,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, billing } = await authenticate.admin(request);
  const formData = await request.formData();
  const plan = formData.get("plan") as keyof typeof PLANS;

  if (!plan || !PLANS[plan]) {
    return json({ error: "Invalid plan" }, { status: 400 });
  }

  const planConfig = PLANS[plan];

  // Free plan - just update
  if (planConfig.price === 0) {
    await prisma.shop.update({
      where: { shopDomain: session.shop },
      data: { plan: "FREE" },
    });
    return json({ success: true });
  }

  // Paid plan - redirect to Shopify billing
  const response = await billing.request({
    plan: {
      name: `Curetfy ${planConfig.name}`,
      amount: planConfig.price,
      currencyCode: "USD",
      interval: "EVERY_30_DAYS",
    },
    isTest: process.env.NODE_ENV !== "production",
    returnUrl: `https://${session.shop}/admin/apps/curetfy-cod-form/app/billing/confirm?plan=${plan}`,
  });

  return response;
};

export default function Billing() {
  const { currentPlan, plans } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const handleSelectPlan = (plan: string) => {
    submit({ plan }, { method: "POST" });
  };

  return (
    <Page backAction={{ content: "Dashboard", url: "/app" }} title="Planes">
      <TitleBar title="Planes y Facturación" />
      <Layout>
        {Object.entries(plans).map(([key, plan]) => (
          <Layout.Section key={key} variant="oneQuarter">
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">{plan.name}</Text>
                  {currentPlan === key && (
                    <Badge tone="success">Actual</Badge>
                  )}
                </InlineStack>

                <BlockStack gap="100">
                  <InlineStack gap="100" blockAlign="baseline">
                    <Text as="p" variant="heading2xl" fontWeight="bold">
                      ${plan.price}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">/mes</Text>
                  </InlineStack>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {plan.orders === Infinity ? "Órdenes ilimitadas" : `${plan.orders} órdenes/mes`}
                  </Text>
                </BlockStack>

                <Divider />

                <List type="bullet">
                  {plan.features.map((feature, i) => (
                    <List.Item key={i}>{feature}</List.Item>
                  ))}
                </List>

                <Box paddingBlockStart="200">
                  {currentPlan === key ? (
                    <Button disabled fullWidth>Plan Actual</Button>
                  ) : (
                    <Button
                      variant={key === "PRO" ? "primary" : "secondary"}
                      fullWidth
                      onClick={() => handleSelectPlan(key)}
                    >
                      {plan.price === 0 ? "Cambiar a Free" : `Upgrade a ${plan.name}`}
                    </Button>
                  )}
                </Box>
              </BlockStack>
            </Card>
          </Layout.Section>
        ))}
      </Layout>
    </Page>
  );
}
