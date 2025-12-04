import type { LoaderFunctionArgs } from "@remix-run/node";
import { Page, Layout, Card, Text, BlockStack, InlineStack, Icon, Collapsible, Button, Link, Box, Divider } from "@shopify/polaris";
import { QuestionCircleIcon, ChatIcon, SettingsIcon, OrderIcon, CodeIcon, CheckCircleIcon } from "@shopify/polaris-icons";
import { useState } from "react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

interface FAQItemProps {
  question: string;
  answer: React.ReactNode;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <Box paddingBlockEnd="400">
      <Button
        variant="plain"
        textAlign="left"
        fullWidth
        onClick={() => setOpen(!open)}
        icon={QuestionCircleIcon}
      >
        {question}
      </Button>
      <Collapsible open={open} id={question}>
        <Box paddingBlockStart="200" paddingInlineStart="800">
          <Text as="p" variant="bodyMd" tone="subdued">
            {answer}
          </Text>
        </Box>
      </Collapsible>
    </Box>
  );
}

export default function HelpPage() {
  return (
    <Page title="Centro de Ayuda" subtitle="Guias, tutoriales y preguntas frecuentes">
      <Layout>
        {/* Quick Start Guide */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack gap="200" align="start">
                <Icon source={CheckCircleIcon} tone="success" />
                <Text as="h2" variant="headingMd">Guia de Inicio Rapido</Text>
              </InlineStack>

              <BlockStack gap="300">
                <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd" fontWeight="semibold">1. Configura tu numero de WhatsApp</Text>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Ve a Configuracion y agrega tu numero de WhatsApp con codigo de pais (ej: 57 para Colombia, 52 para Mexico).
                    </Text>
                  </BlockStack>
                </Box>

                <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd" fontWeight="semibold">2. Agrega el boton COD a tus productos</Text>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      En el editor de tema de Shopify, agrega el bloque "Curetfy COD Button" a tu plantilla de producto.
                    </Text>
                  </BlockStack>
                </Box>

                <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd" fontWeight="semibold">3. Personaliza el formulario</Text>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Usa el Constructor de Formularios para agregar los campos que necesitas: nombre, telefono, direccion, ciudad, etc.
                    </Text>
                  </BlockStack>
                </Box>

                <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd" fontWeight="semibold">4. Recibe pedidos por WhatsApp</Text>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Cuando un cliente complete el formulario, recibiras un mensaje de WhatsApp con todos los detalles del pedido.
                    </Text>
                  </BlockStack>
                </Box>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* FAQ Section */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack gap="200" align="start">
                <Icon source={QuestionCircleIcon} tone="info" />
                <Text as="h2" variant="headingMd">Preguntas Frecuentes</Text>
              </InlineStack>

              <Divider />

              <FAQItem
                question="Como agrego el boton COD a mi tienda?"
                answer={
                  <>
                    Ve a tu panel de Shopify, luego a Tienda Online, Personalizar tema. En el editor, navega a una pagina de producto y busca "Agregar bloque". Selecciona "Curetfy COD Button" de la lista de bloques disponibles.
                  </>
                }
              />

              <FAQItem
                question="Puedo personalizar los colores del boton?"
                answer={
                  <>
                    Si, el boton es completamente personalizable desde el editor de tema. Puedes cambiar colores de fondo, texto, bordes, agregar iconos, animaciones y mas. Todas las opciones estan en la seccion del bloque en el editor de tema.
                  </>
                }
              />

              <FAQItem
                question="Como funciona la integracion con WhatsApp?"
                answer={
                  <>
                    Cuando un cliente completa el formulario, se genera automaticamente un mensaje de WhatsApp con todos los detalles del pedido. El cliente es redirigido a WhatsApp Web o la app de WhatsApp donde puede enviar el mensaje a tu numero configurado.
                  </>
                }
              />

              <FAQItem
                question="Puedo crear pedidos en Shopify automaticamente?"
                answer={
                  <>
                    Si, puedes habilitar la opcion "Crear borrador de pedido" en la Configuracion. Esto creara un Draft Order en tu panel de Shopify cada vez que un cliente complete el formulario. Luego puedes convertirlo en un pedido real.
                  </>
                }
              />

              <FAQItem
                question="Que campos puedo agregar al formulario?"
                answer={
                  <>
                    El Constructor de Formularios te permite agregar: Nombre completo, Telefono/WhatsApp, Email, Direccion, Ciudad, Provincia/Estado, Codigo Postal, Notas del pedido, y campos personalizados. Puedes arrastrar y soltar para ordenarlos.
                  </>
                }
              />

              <FAQItem
                question="Como configuro los costos de envio?"
                answer={
                  <>
                    En la seccion de Envios puedes configurar zonas de envio con costos fijos o variables. Tambien puedes ofrecer envio gratis a partir de cierto monto. Las zonas pueden basarse en ciudad, provincia o pais.
                  </>
                }
              />

              <FAQItem
                question="Puedo usar cupones de descuento?"
                answer={
                  <>
                    Si, en la Configuracion puedes habilitar el campo de cupon. Los cupones que crees en Shopify se validaran automaticamente y se aplicara el descuento correspondiente al pedido.
                  </>
                }
              />

              <FAQItem
                question="Donde veo las estadisticas de mis pedidos?"
                answer={
                  <>
                    En la seccion de Analiticas puedes ver: pedidos por dia/semana/mes, productos mas vendidos, ciudades con mas pedidos, y el rendimiento general de tu formulario COD.
                  </>
                }
              />

              <FAQItem
                question="Funciona con todos los temas de Shopify?"
                answer={
                  <>
                    Curetfy COD Form funciona con todos los temas que soporten App Blocks (Online Store 2.0). La mayoria de los temas modernos de Shopify son compatibles. Si tienes un tema antiguo, contactanos para ayudarte.
                  </>
                }
              />

              <FAQItem
                question="Como cancelo mi suscripcion?"
                answer={
                  <>
                    Puedes desinstalar la app desde tu panel de Shopify en cualquier momento. Ve a Configuracion, Apps, encuentra Curetfy COD Form y haz clic en Desinstalar. No se cobraran mas cargos despues de la desinstalacion.
                  </>
                }
              />
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Technical Help */}
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <InlineStack gap="200" align="start">
                <Icon source={CodeIcon} tone="magic" />
                <Text as="h2" variant="headingMd">Para Desarrolladores</Text>
              </InlineStack>

              <BlockStack gap="200">
                <Text as="p" variant="bodyMd">
                  Si necesitas personalizar el formulario mas alla de las opciones disponibles, puedes usar CSS personalizado en tu tema.
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Las clases CSS principales son:
                </Text>
                <Box padding="200" background="bg-surface-secondary" borderRadius="100">
                  <Text as="p" variant="bodyMd" fontWeight="medium">
                    .curetfy-cod-button<br />
                    .curetfy-cod-modal<br />
                    .curetfy-cod-form<br />
                    .curetfy-form-field
                  </Text>
                </Box>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <InlineStack gap="200" align="start">
                <Icon source={ChatIcon} tone="success" />
                <Text as="h2" variant="headingMd">Soporte</Text>
              </InlineStack>

              <BlockStack gap="300">
                <Text as="p" variant="bodyMd">
                  Necesitas ayuda adicional? Nuestro equipo esta aqui para ayudarte.
                </Text>

                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd">
                    <strong>Email:</strong>{" "}
                    <Link url="mailto:soporte@curetcore.com" external>
                      soporte@curetcore.com
                    </Link>
                  </Text>
                  <Text as="p" variant="bodyMd">
                    <strong>WhatsApp:</strong>{" "}
                    <Link url="https://wa.me/573001234567" external>
                      +57 300 123 4567
                    </Link>
                  </Text>
                </BlockStack>

                <Text as="p" variant="bodyMd" tone="subdued">
                  Tiempo de respuesta: 24-48 horas habiles
                </Text>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <InlineStack gap="200" align="start">
                <Icon source={SettingsIcon} />
                <Text as="h2" variant="headingMd">Enlaces Utiles</Text>
              </InlineStack>

              <BlockStack gap="200">
                <Link url="/privacy" external>
                  Politica de Privacidad
                </Link>
                <Link url="/terms" external>
                  Terminos de Servicio
                </Link>
                <Link url="https://help.shopify.com/es/manual/online-store/themes/theme-structure/extend/apps" external>
                  Documentacion de Shopify sobre Apps
                </Link>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
