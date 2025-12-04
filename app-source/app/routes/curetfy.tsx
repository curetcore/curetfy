import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  CheckIcon,
  ChatBubbleLeftRightIcon,
  CursorArrowRaysIcon,
  TruckIcon,
  ChartBarIcon,
  CreditCardIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Curetfy COD Form - Formularios de Pago Contra Entrega para Shopify" },
    { name: "description", content: "Aumenta tus ventas con formularios de pago contra entrega (COD) optimizados para WhatsApp. La mejor app de Cash on Delivery para Shopify en Latinoamerica." },
    { name: "keywords", content: "COD, pago contra entrega, shopify, whatsapp, formulario, ecommerce, latinoamerica, dropshipping" },
    { property: "og:title", content: "Curetfy COD Form - Formularios COD para Shopify" },
    { property: "og:description", content: "Aumenta tus ventas con formularios de pago contra entrega optimizados para WhatsApp." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
};

const navigation = [
  { name: "Funciones", href: "#features" },
  { name: "Precios", href: "#pricing" },
  { name: "Testimonios", href: "#testimonials" },
  { name: "FAQ", href: "#faq" },
];

const features = [
  {
    name: "Integracion WhatsApp",
    description: "Recibe pedidos directamente en WhatsApp con todos los detalles del cliente, productos y totales. Sin intermediarios.",
    icon: ChatBubbleLeftRightIcon,
  },
  {
    name: "Constructor Drag & Drop",
    description: "Crea formularios personalizados arrastrando campos. Nombre, telefono, direccion, ciudad y campos custom.",
    icon: CursorArrowRaysIcon,
  },
  {
    name: "Zonas de Envio",
    description: "Configura costos de envio por ciudad, provincia o pais. Ofrece envio gratis a partir de cierto monto automaticamente.",
    icon: TruckIcon,
  },
  {
    name: "Analiticas en Tiempo Real",
    description: "Dashboard con pedidos por dia, productos top, ciudades con mas ventas y metricas de conversion.",
    icon: ChartBarIcon,
  },
  {
    name: "Cupones de Descuento",
    description: "Valida automaticamente los cupones de Shopify. Tus clientes pueden aplicar descuentos al momento.",
    icon: CreditCardIcon,
  },
  {
    name: "Draft Orders en Shopify",
    description: "Crea borradores de pedido automaticamente en tu panel de Shopify. Todo centralizado en un solo lugar.",
    icon: BoltIcon,
  },
];

const tiers = [
  {
    name: "Gratis",
    id: "tier-free",
    href: "https://apps.shopify.com/curetfy-cod-form",
    priceMonthly: "$0",
    description: "Perfecto para tiendas que estan comenzando con COD.",
    features: [
      "100 pedidos por mes",
      "Integracion WhatsApp",
      "Formulario basico",
      "1 zona de envio",
      "Soporte por email",
    ],
    featured: false,
  },
  {
    name: "Pro",
    id: "tier-pro",
    href: "https://apps.shopify.com/curetfy-cod-form",
    priceMonthly: "$9",
    description: "Para tiendas en crecimiento que necesitan todas las funciones.",
    features: [
      "Pedidos ilimitados",
      "Constructor de formularios",
      "Zonas de envio ilimitadas",
      "Cupones de descuento",
      "Analiticas completas",
      "Draft orders en Shopify",
      "Soporte prioritario",
      "Sin marca de agua",
    ],
    featured: true,
  },
];

const stats = [
  { id: 1, name: "Tiendas activas", value: "500+" },
  { id: 2, name: "Pedidos procesados", value: "50K+" },
  { id: 3, name: "Aumento en conversiones", value: "35%" },
];

const testimonials = [
  [
    {
      body: "Desde que instalamos Curetfy, nuestras conversiones aumentaron un 40%. Los clientes prefieren pagar contra entrega y el proceso es super facil.",
      author: {
        name: "Maria Castillo",
        handle: "mariacastillo",
        location: "Tienda de Ropa - Colombia",
      },
    },
    {
      body: "La integracion con WhatsApp es perfecta. Recibo el pedido con todos los datos y puedo confirmar inmediatamente con el cliente.",
      author: {
        name: "Juan Rodriguez",
        handle: "juanrodriguez",
        location: "Dropshipping - Mexico",
      },
    },
  ],
  [
    {
      body: "Probamos varias apps de COD y esta es la mejor. El constructor de formularios y las zonas de envio son exactamente lo que necesitabamos.",
      author: {
        name: "Laura Perez",
        handle: "lauraperez",
        location: "Cosmeticos - Peru",
      },
    },
    {
      body: "El soporte es increible. Me ayudaron a configurar todo en menos de 10 minutos. Muy recomendado para tiendas en Latinoamerica.",
      author: {
        name: "Carlos Mendez",
        handle: "carlosmendez",
        location: "Electronica - Ecuador",
      },
    },
  ],
];

const faqs = [
  {
    question: "Funciona con mi tema de Shopify?",
    answer: "Si, Curetfy funciona con todos los temas de Shopify 2.0 (la mayoria de temas modernos). Se instala como un bloque que puedes agregar a cualquier pagina de producto.",
  },
  {
    question: "Necesito saber programar?",
    answer: "No, todo se configura visualmente desde el panel de la app y el editor de tema de Shopify. No se requiere ningun codigo.",
  },
  {
    question: "Como recibo los pedidos?",
    answer: "Los pedidos llegan directamente a tu WhatsApp con todos los detalles: nombre, telefono, direccion, productos y total. Tambien puedes verlos en el panel de la app y crear draft orders en Shopify.",
  },
  {
    question: "Puedo probar antes de pagar?",
    answer: "Si, el plan gratuito incluye 100 pedidos por mes. Puedes probar todas las funciones basicas sin pagar nada.",
  },
  {
    question: "Que pasa si cancelo?",
    answer: "Puedes cancelar en cualquier momento sin penalizacion. Tus datos se mantienen por 48 horas y luego se eliminan permanentemente.",
  },
  {
    question: "Tienen soporte en espanol?",
    answer: "Si, todo nuestro soporte es en espanol. Respondemos en menos de 24 horas por email o WhatsApp.",
  },
];

const footerNavigation = {
  main: [
    { name: "Funciones", href: "#features" },
    { name: "Precios", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
    { name: "Soporte", href: "mailto:soporte@curetcore.com" },
  ],
  legal: [
    { name: "Privacidad", href: "/privacy" },
    { name: "Terminos", href: "/terms" },
  ],
  social: [
    {
      name: "Instagram",
      href: "https://instagram.com/curetcore",
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      name: "X",
      href: "https://twitter.com/curetcore",
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
        </svg>
      ),
    },
    {
      name: "WhatsApp",
      href: "https://wa.me/573001234567",
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
  ],
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function CuretfyLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-gray-900">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <Link to="/home" className="-m-1.5 flex items-center gap-2 p-1.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500">
                <svg className="size-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">Curetfy</span>
            </Link>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-200"
            >
              <span className="sr-only">Abrir menu</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <a key={item.name} href={item.href} className="text-sm/6 font-semibold text-white">
                {item.name}
              </a>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <a
              href="https://apps.shopify.com/curetfy-cod-form"
              className="rounded-md bg-indigo-500 px-3.5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400"
            >
              Instalar Gratis
            </a>
          </div>
        </nav>
        <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gray-900 p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-100/10">
            <div className="flex items-center justify-between">
              <Link to="/home" className="-m-1.5 flex items-center gap-2 p-1.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500">
                  <svg className="size-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-white">Curetfy</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-200"
              >
                <span className="sr-only">Cerrar menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-white/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-white/5"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="py-6">
                  <a
                    href="https://apps.shopify.com/curetfy-cod-form"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-white hover:bg-white/5"
                  >
                    Instalar Gratis
                  </a>
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </header>

      {/* Hero */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          />
        </div>
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm/6 text-gray-400 ring-1 ring-white/10 hover:ring-white/20">
              App #1 de COD para Shopify en LATAM{" "}
              <a href="#features" className="font-semibold text-indigo-400">
                <span aria-hidden="true" className="absolute inset-0" />
                Ver funciones <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-balance text-5xl font-semibold tracking-tight text-white sm:text-7xl">
              Vende mas con Pago Contra Entrega
            </h1>
            <p className="mt-8 text-pretty text-lg font-medium text-gray-400 sm:text-xl/8">
              Formularios optimizados para WhatsApp que convierten visitantes en clientes.
              Perfecto para dropshipping y e-commerce en Latinoamerica.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="https://apps.shopify.com/curetfy-cod-form"
                className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Comenzar Gratis
              </a>
              <a href="#pricing" className="text-sm/6 font-semibold text-white">
                Ver precios <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.id} className="mx-auto flex max-w-xs flex-col gap-y-4">
                <dt className="text-base/7 text-gray-400">{stat.name}</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Features */}
      <div id="features" className="bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base/7 font-semibold text-indigo-400">Todo incluido</h2>
            <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-balance">
              Todo lo que necesitas para vender con COD
            </p>
            <p className="mt-6 text-lg/8 text-gray-300">
              Funciones disenadas especificamente para el mercado latinoamericano. Sin complicaciones, sin codigo.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base/7 font-semibold text-white">
                    <feature.icon aria-hidden="true" className="size-5 flex-none text-indigo-400" />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base/7 text-gray-400">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" className="relative isolate bg-gray-900 px-6 py-24 sm:py-32 lg:px-8">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="mx-auto aspect-[1155/678] w-[72.1875rem] bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-20"
          />
        </div>
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base/7 font-semibold text-indigo-400">Precios</h2>
          <p className="mt-2 text-balance text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            Simple y transparente
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-center text-lg font-medium text-gray-400 sm:text-xl/8">
          Sin costos ocultos. Cancela cuando quieras. Comienza gratis hoy.
        </p>
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">
          {tiers.map((tier, tierIdx) => (
            <div
              key={tier.id}
              className={classNames(
                tier.featured ? "relative bg-gray-800" : "bg-white/5 sm:mx-8 lg:mx-0",
                tier.featured
                  ? ""
                  : tierIdx === 0
                    ? "rounded-t-3xl sm:rounded-b-none lg:rounded-bl-3xl lg:rounded-tr-none"
                    : "sm:rounded-t-none lg:rounded-bl-none lg:rounded-tr-3xl",
                "rounded-3xl p-8 ring-1 ring-white/10 sm:p-10"
              )}
            >
              <h3
                id={tier.id}
                className="text-base/7 font-semibold text-indigo-400"
              >
                {tier.name}
              </h3>
              <p className="mt-4 flex items-baseline gap-x-2">
                <span className="text-5xl font-semibold tracking-tight text-white">
                  {tier.priceMonthly}
                </span>
                <span className="text-base text-gray-400">/mes</span>
              </p>
              <p className="mt-6 text-base/7 text-gray-300">
                {tier.description}
              </p>
              <ul role="list" className="mt-8 space-y-3 text-sm/6 text-gray-300 sm:mt-10">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon
                      aria-hidden="true"
                      className="h-6 w-5 flex-none text-indigo-400"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href={tier.href}
                aria-describedby={tier.id}
                className={classNames(
                  tier.featured
                    ? "bg-indigo-500 text-white hover:bg-indigo-400 focus-visible:outline-indigo-500"
                    : "bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white",
                  "mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10"
                )}
              >
                {tier.featured ? "Comenzar Ahora" : "Probar Gratis"}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div id="testimonials" className="relative isolate bg-gray-900 py-24 sm:py-32">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 transform-gpu overflow-hidden opacity-30 blur-3xl"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="ml-[max(50%,38rem)] aspect-[1313/771] w-[82.0625rem] bg-linear-to-tr from-[#ff80b5] to-[#9089fc]"
          />
        </div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base/7 font-semibold text-indigo-400">Testimonios</h2>
            <p className="mt-2 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Lo que dicen nuestros clientes
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            {testimonials.map((column, columnIdx) => (
              <div key={columnIdx} className="space-y-8">
                {column.map((testimonial) => (
                  <figure
                    key={testimonial.author.handle}
                    className="rounded-2xl bg-gray-800/50 p-6 ring-1 ring-white/10"
                  >
                    <blockquote className="text-white">
                      <p>{`"${testimonial.body}"`}</p>
                    </blockquote>
                    <figcaption className="mt-6 flex items-center gap-x-4">
                      <div className="flex size-10 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white">
                        {testimonial.author.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{testimonial.author.name}</div>
                        <div className="text-gray-400">{testimonial.author.location}</div>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div id="faq" className="bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base/7 font-semibold text-indigo-400">FAQ</h2>
            <p className="mt-2 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Preguntas frecuentes
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-3xl">
            <dl className="space-y-8">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-2xl bg-gray-800/50 p-6 ring-1 ring-white/10">
                  <dt className="text-base/7 font-semibold text-white">{faq.question}</dt>
                  <dd className="mt-2 text-base/7 text-gray-400">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Listo para aumentar tus ventas?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg/8 text-gray-300">
              Unete a cientos de tiendas que ya usan Curetfy para procesar pedidos COD de forma eficiente.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="https://apps.shopify.com/curetfy-cod-form"
                className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Instalar Gratis en Shopify
              </a>
              <a href="mailto:soporte@curetcore.com" className="text-sm/6 font-semibold text-white">
                Contactar Soporte <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
          <nav aria-label="Footer" className="-mb-6 flex flex-wrap justify-center gap-x-12 gap-y-3 text-sm/6">
            {footerNavigation.main.map((item) => (
              <a key={item.name} href={item.href} className="text-gray-400 hover:text-white">
                {item.name}
              </a>
            ))}
            {footerNavigation.legal.map((item) => (
              <Link key={item.name} to={item.href} className="text-gray-400 hover:text-white">
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="mt-16 flex justify-center gap-x-10">
            {footerNavigation.social.map((item) => (
              <a key={item.name} href={item.href} className="text-gray-400 hover:text-white">
                <span className="sr-only">{item.name}</span>
                <item.icon aria-hidden="true" className="size-6" />
              </a>
            ))}
          </div>
          <p className="mt-10 text-center text-sm/6 text-gray-400">
            &copy; 2024 Curetcore. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
