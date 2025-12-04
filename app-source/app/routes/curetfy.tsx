import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { useState } from "react";

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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl bg-slate-50 p-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
      >
        <h4 className="text-lg/7 font-bold text-slate-900">{question}</h4>
        <span className={`ml-4 shrink-0 text-2xl text-violet-600 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}>
          +
        </span>
      </button>
      {isOpen && (
        <p className="mt-4 text-base/7 text-slate-600">{answer}</p>
      )}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-dvh font-sans text-slate-900">
      {/* Navigation */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <span className="bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-2xl font-extrabold text-transparent">
            Curetfy
          </span>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm/6 font-medium text-slate-600 transition-colors hover:text-violet-600">Funciones</a>
            <a href="#how-it-works" className="text-sm/6 font-medium text-slate-600 transition-colors hover:text-violet-600">Como funciona</a>
            <a href="#pricing" className="text-sm/6 font-medium text-slate-600 transition-colors hover:text-violet-600">Precios</a>
            <a href="#faq" className="text-sm/6 font-medium text-slate-600 transition-colors hover:text-violet-600">FAQ</a>
          </div>
          <a
            href="https://apps.shopify.com/curetfy-cod-form"
            className="rounded-lg bg-linear-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/25"
          >
            Instalar Gratis
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-linear-to-b from-slate-50 to-white pb-24 pt-32 lg:pb-32 lg:pt-40">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <span className="inline-block rounded-full bg-violet-100 px-4 py-1.5 text-sm/6 font-semibold text-violet-700">
                App #1 de COD para Shopify
              </span>
              <h1 className="mt-6 text-4xl/tight font-extrabold tracking-tight text-slate-900 sm:text-5xl/tight lg:text-6xl/tight">
                Vende mas con{' '}
                <span className="bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Pago Contra Entrega
                </span>
              </h1>
              <p className="mt-6 text-lg/8 text-slate-600">
                Formularios optimizados para WhatsApp que convierten visitantes en clientes.
                Perfecto para dropshipping y e-commerce en Latinoamerica.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="https://apps.shopify.com/curetfy-cod-form"
                  className="rounded-xl bg-linear-to-r from-violet-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/30"
                >
                  Comenzar Gratis
                </a>
                <a
                  href="#how-it-works"
                  className="rounded-xl border-2 border-violet-600 px-8 py-4 text-lg font-semibold text-violet-600 transition-all hover:-translate-y-0.5 hover:bg-violet-50"
                >
                  Ver Demo
                </a>
              </div>
            </div>

            {/* Hero Mockup */}
            <div className="relative">
              <div className="rounded-2xl bg-linear-to-br from-violet-600 to-purple-700 p-8 shadow-2xl shadow-violet-500/30 lg:p-10">
                <div className="rounded-xl bg-white p-6 shadow-lg">
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 h-3 w-20 rounded-sm bg-slate-200"></div>
                      <div className="h-11 rounded-lg bg-slate-100"></div>
                    </div>
                    <div>
                      <div className="mb-2 h-3 w-24 rounded-sm bg-slate-200"></div>
                      <div className="h-11 rounded-lg bg-slate-100"></div>
                    </div>
                    <div>
                      <div className="mb-2 h-3 w-16 rounded-sm bg-slate-200"></div>
                      <div className="h-11 rounded-lg bg-slate-100"></div>
                    </div>
                    <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-green-500 to-emerald-600 py-4 text-base font-semibold text-white">
                      <WhatsAppIcon className="size-5" />
                      Pedir por WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-5xl font-extrabold text-transparent">
                500+
              </div>
              <div className="mt-2 text-base/7 text-slate-600">Tiendas Activas</div>
            </div>
            <div className="text-center">
              <div className="bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-5xl font-extrabold text-transparent">
                50K+
              </div>
              <div className="mt-2 text-base/7 text-slate-600">Pedidos Procesados</div>
            </div>
            <div className="text-center">
              <div className="bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-5xl font-extrabold text-transparent">
                35%
              </div>
              <div className="mt-2 text-base/7 text-slate-600">Aumento en Conversiones</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Todo lo que necesitas para{' '}
              <span className="bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                vender mas
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg/8 text-slate-600">
              Funciones disenadas especificamente para el mercado latinoamericano
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <WhatsAppIcon className="size-7 text-green-500" />,
                iconBg: 'bg-green-100',
                title: 'Integracion WhatsApp',
                description: 'Recibe pedidos directamente en WhatsApp con todos los detalles del cliente y productos.',
              },
              {
                icon: <svg className="size-7 text-violet-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>,
                iconBg: 'bg-violet-100',
                title: 'Constructor de Formularios',
                description: 'Arrastra y suelta campos para crear el formulario perfecto. Nombre, telefono, direccion y mas.',
              },
              {
                icon: <svg className="size-7 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>,
                iconBg: 'bg-pink-100',
                title: 'Zonas de Envio',
                description: 'Configura costos de envio por ciudad, provincia o pais. Ofrece envio gratis automaticamente.',
              },
              {
                icon: <svg className="size-7 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/></svg>,
                iconBg: 'bg-amber-100',
                title: 'Cupones de Descuento',
                description: 'Valida automaticamente los cupones de Shopify. Tus clientes aplican descuentos al momento.',
              },
              {
                icon: <svg className="size-7 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>,
                iconBg: 'bg-emerald-100',
                title: 'Analiticas Completas',
                description: 'Ve pedidos por dia, productos mas vendidos, ciudades top y el rendimiento del formulario.',
              },
              {
                icon: <svg className="size-7 text-purple-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>,
                iconBg: 'bg-purple-100',
                title: 'Totalmente Personalizable',
                description: 'Cambia colores, textos, iconos y animaciones. El boton se adapta perfectamente a tu marca.',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50"
              >
                <div className={`inline-flex size-14 items-center justify-center rounded-xl ${feature.iconBg}`}>
                  {feature.icon}
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-base/7 text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="bg-linear-to-b from-white to-slate-50 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Como{' '}
              <span className="bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                funciona
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg/8 text-slate-600">
              Comienza a recibir pedidos COD en menos de 5 minutos
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: '1', title: 'Instala la App', desc: 'Instalacion con un clic desde la App Store de Shopify.' },
              { step: '2', title: 'Configura WhatsApp', desc: 'Agrega tu numero de WhatsApp donde quieres recibir pedidos.' },
              { step: '3', title: 'Agrega el Boton', desc: 'Arrastra el bloque COD a tu pagina de producto.' },
              { step: '4', title: 'Recibe Pedidos', desc: 'Los clientes completan el formulario y tu recibes el pedido.' },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-linear-to-br from-violet-600 to-purple-600 text-2xl font-extrabold text-white shadow-lg shadow-violet-500/25">
                  {item.step}
                </div>
                <h4 className="mt-5 text-lg font-bold text-slate-900">{item.title}</h4>
                <p className="mt-2 text-base/7 text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-slate-900 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Precios simples y transparentes
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg/8 text-slate-400">
              Sin costos ocultos. Cancela cuando quieras.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {/* Starter */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-8 lg:p-10">
              <h3 className="text-2xl font-bold text-white">Starter</h3>
              <p className="mt-1 text-base/7 text-slate-400">Para tiendas nuevas</p>
              <div className="mt-6">
                <span className="text-5xl font-extrabold text-white">$0</span>
                <span className="text-lg text-slate-400">/mes</span>
              </div>
              <ul className="mt-8 space-y-4">
                {['50 pedidos/mes', 'Integracion WhatsApp', 'Formulario basico', 'Soporte por email'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-base/7 text-slate-300">
                    <CheckIcon className="size-5 shrink-0 text-green-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="https://apps.shopify.com/curetfy-cod-form"
                className="mt-8 block w-full rounded-xl border-2 border-violet-500 py-4 text-center text-base font-semibold text-violet-400 transition-all hover:bg-violet-500/10"
              >
                Comenzar Gratis
              </a>
            </div>

            {/* Pro - Featured */}
            <div className="relative scale-105 rounded-2xl bg-linear-to-br from-violet-600 to-purple-600 p-8 shadow-2xl shadow-violet-500/30 lg:p-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 text-sm font-bold text-slate-900">
                Mas popular
              </div>
              <h3 className="text-2xl font-bold text-white">Pro</h3>
              <p className="mt-1 text-base/7 text-violet-200">Para tiendas en crecimiento</p>
              <div className="mt-6">
                <span className="text-5xl font-extrabold text-white">$19</span>
                <span className="text-lg text-violet-200">/mes</span>
              </div>
              <ul className="mt-8 space-y-4">
                {['Pedidos ilimitados', 'Constructor de formularios', 'Zonas de envio', 'Cupones de descuento', 'Analiticas completas', 'Soporte prioritario'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-base/7 text-white">
                    <CheckIcon className="size-5 shrink-0 text-green-300" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="https://apps.shopify.com/curetfy-cod-form"
                className="mt-8 block w-full rounded-xl bg-white py-4 text-center text-base font-semibold text-violet-600 transition-all hover:bg-violet-50"
              >
                Prueba 14 dias gratis
              </a>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-8 lg:p-10">
              <h3 className="text-2xl font-bold text-white">Enterprise</h3>
              <p className="mt-1 text-base/7 text-slate-400">Para grandes volumenes</p>
              <div className="mt-6">
                <span className="text-5xl font-extrabold text-white">$49</span>
                <span className="text-lg text-slate-400">/mes</span>
              </div>
              <ul className="mt-8 space-y-4">
                {['Todo en Pro', 'Multiples numeros WhatsApp', 'API access', 'Webhooks personalizados', 'Soporte dedicado', 'Onboarding personalizado'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-base/7 text-slate-300">
                    <CheckIcon className="size-5 shrink-0 text-green-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:ventas@curetcore.com"
                className="mt-8 block w-full rounded-xl border-2 border-violet-500 py-4 text-center text-base font-semibold text-violet-400 transition-all hover:bg-violet-500/10"
              >
                Contactar Ventas
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-linear-to-b from-slate-50 to-white py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Lo que dicen nuestros{' '}
              <span className="bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                clientes
              </span>
            </h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                text: '"Desde que instalamos Curetfy, nuestras conversiones aumentaron un 40%. Los clientes prefieren pagar contra entrega y el proceso es super facil."',
                name: 'Maria Castillo',
                role: 'Tienda de Ropa - Colombia',
                initials: 'MC',
              },
              {
                text: '"La integracion con WhatsApp es perfecta. Recibo el pedido con todos los datos y puedo confirmar inmediatamente con el cliente."',
                name: 'Juan Rodriguez',
                role: 'Dropshipping - Mexico',
                initials: 'JR',
              },
              {
                text: '"Probamos varias apps de COD y esta es la mejor. El constructor de formularios y las zonas de envio son exactamente lo que necesitabamos."',
                name: 'Laura Perez',
                role: 'Cosmeticos - Peru',
                initials: 'LP',
              },
            ].map((testimonial, idx) => (
              <div key={idx} className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
                <p className="text-lg/8 italic text-slate-700">{testimonial.text}</p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-full bg-linear-to-br from-violet-600 to-purple-600 text-lg font-bold text-white">
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm/6 text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Preguntas{' '}
              <span className="bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                frecuentes
              </span>
            </h2>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-4 md:grid-cols-2">
            <FAQItem
              question="Funciona con mi tema de Shopify?"
              answer="Si, Curetfy funciona con todos los temas de Shopify 2.0 (la mayoria de temas modernos). Se instala como un bloque que puedes agregar a cualquier pagina."
            />
            <FAQItem
              question="Necesito saber programar?"
              answer="No, todo se configura visualmente desde el panel de la app y el editor de tema de Shopify. No se requiere codigo."
            />
            <FAQItem
              question="Como recibo los pedidos?"
              answer="Los pedidos llegan directamente a tu WhatsApp con todos los detalles: nombre, telefono, direccion, productos y total. Tambien puedes verlos en el panel de la app."
            />
            <FAQItem
              question="Puedo probar antes de pagar?"
              answer="Si, ofrecemos un plan gratuito con 50 pedidos al mes y una prueba de 14 dias del plan Pro sin compromiso."
            />
            <FAQItem
              question="Los pedidos se crean en Shopify?"
              answer="Si, puedes activar la opcion para crear borradores de pedido automaticamente en Shopify. Asi tienes todo centralizado."
            />
            <FAQItem
              question="Que pasa si cancelo?"
              answer="Puedes cancelar en cualquier momento sin penalizacion. Tus datos se mantienen por 48 horas y luego se eliminan permanentemente."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-linear-to-b from-white to-slate-50 py-24 lg:py-32">
        <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Listo para aumentar tus ventas?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg/8 text-slate-600">
            Unete a cientos de tiendas que ya usan Curetfy para procesar pedidos COD de forma eficiente.
          </p>
          <a
            href="https://apps.shopify.com/curetfy-cod-form"
            className="mt-8 inline-block rounded-xl bg-linear-to-r from-violet-600 to-purple-600 px-10 py-5 text-lg font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/30"
          >
            Instalar Gratis en Shopify
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-12 md:grid-cols-4">
            <div className="md:col-span-1">
              <span className="bg-linear-to-r from-violet-400 to-purple-400 bg-clip-text text-2xl font-extrabold text-transparent">
                Curetfy
              </span>
              <p className="mt-4 text-base/7 text-slate-400">
                La mejor solucion de Pago Contra Entrega para Shopify. Disenada para el mercado latinoamericano.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">Producto</h4>
              <ul className="mt-4 space-y-3">
                <li><a href="#features" className="text-base/7 text-slate-400 transition-colors hover:text-white">Funciones</a></li>
                <li><a href="#pricing" className="text-base/7 text-slate-400 transition-colors hover:text-white">Precios</a></li>
                <li><a href="#faq" className="text-base/7 text-slate-400 transition-colors hover:text-white">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">Recursos</h4>
              <ul className="mt-4 space-y-3">
                <li><a href="mailto:soporte@curetcore.com" className="text-base/7 text-slate-400 transition-colors hover:text-white">Soporte</a></li>
                <li><a href="https://wa.me/573001234567" className="text-base/7 text-slate-400 transition-colors hover:text-white">WhatsApp</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">Legal</h4>
              <ul className="mt-4 space-y-3">
                <li><Link to="/privacy" className="text-base/7 text-slate-400 transition-colors hover:text-white">Privacidad</Link></li>
                <li><Link to="/terms" className="text-base/7 text-slate-400 transition-colors hover:text-white">Terminos</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 md:flex-row">
            <p className="text-sm/6 text-slate-500">
              2024 CURET / Curetcore. Todos los derechos reservados.
            </p>
            <div className="flex gap-4">
              <a href="https://instagram.com/curetcore" className="text-slate-400 transition-colors hover:text-white">
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://twitter.com/curetcore" className="text-slate-400 transition-colors hover:text-white">
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
