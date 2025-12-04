import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Curetcore - Apps para E-commerce" },
    { name: "description", content: "Suite de aplicaciones para Shopify y e-commerce. Soluciones de pago contra entrega, formularios, automatizacion y mas." },
    { property: "og:title", content: "Curetcore - Apps para E-commerce" },
    { property: "og:description", content: "Suite de aplicaciones para Shopify y e-commerce." },
  ];
};

// Apps data - add more apps here as you create them
const apps = [
  {
    id: "curetfy",
    name: "Curetfy COD Form",
    tagline: "Pago Contra Entrega para Shopify",
    description: "Formularios optimizados para WhatsApp que convierten visitantes en clientes. Perfecto para dropshipping y e-commerce en Latinoamerica.",
    icon: (
      <svg className="size-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
      </svg>
    ),
    gradient: "from-violet-600 to-purple-600",
    shadowColor: "shadow-violet-500/25",
    features: ["WhatsApp", "Formularios", "Envios", "Analiticas"],
    status: "live",
    url: "/curetfy",
  },
  // Future apps will be added here
  // {
  //   id: "curetfy-reviews",
  //   name: "Curetfy Reviews",
  //   tagline: "Resenas con fotos para Shopify",
  //   description: "Sistema de resenas con fotos y videos. Importa desde AliExpress. Aumenta la confianza de tus clientes.",
  //   icon: <StarIcon />,
  //   gradient: "from-amber-500 to-orange-600",
  //   shadowColor: "shadow-amber-500/25",
  //   features: ["Fotos", "Videos", "Import", "Widgets"],
  //   status: "coming",
  //   url: "/reviews",
  // },
];

function AppCard({ app }: { app: typeof apps[0] }) {
  const isLive = app.status === "live";

  return (
    <div className="group relative">
      <div className={`absolute -inset-px rounded-2xl bg-linear-to-r ${app.gradient} opacity-0 blur transition-opacity duration-300 group-hover:opacity-75`} />
      <div className="relative flex h-full flex-col rounded-2xl bg-white p-8 ring-1 ring-slate-200 transition-shadow hover:ring-slate-300">
        {/* Icon */}
        <div className={`inline-flex size-14 items-center justify-center rounded-xl bg-linear-to-br ${app.gradient} shadow-lg ${app.shadowColor}`}>
          {app.icon}
        </div>

        {/* Status badge */}
        {!isLive && (
          <span className="absolute right-6 top-6 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            Proximamente
          </span>
        )}

        {/* Content */}
        <h3 className="mt-6 text-xl font-bold text-slate-900">{app.name}</h3>
        <p className="mt-1 text-sm font-medium text-slate-500">{app.tagline}</p>
        <p className="mt-4 text-base/7 text-slate-600">{app.description}</p>

        {/* Features */}
        <div className="mt-6 flex flex-wrap gap-2">
          {app.features.map((feature) => (
            <span
              key={feature}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          {isLive ? (
            <Link
              to={app.url}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r ${app.gradient} px-6 py-3 text-base font-semibold text-white shadow-lg ${app.shadowColor} transition-all hover:-translate-y-0.5 hover:shadow-xl`}
            >
              Ver App
              <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          ) : (
            <button
              disabled
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-6 py-3 text-base font-semibold text-slate-400"
            >
              Proximamente
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-white font-sans">
      {/* Navigation */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <Link to="/home" className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-linear-to-br from-violet-600 to-purple-600">
              <svg className="size-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-900">Curetcore</span>
          </Link>
          <div className="flex items-center gap-6">
            <a href="mailto:soporte@curetcore.com" className="text-sm/6 font-medium text-slate-600 transition-colors hover:text-violet-600">
              Soporte
            </a>
            <a
              href="https://apps.shopify.com/partners/curetcore"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              App Store
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-linear-to-b from-slate-50 to-white pb-16 pt-32 lg:pb-24 lg:pt-40">
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
          <div className="mx-auto max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-1.5 text-sm/6 font-semibold text-violet-700">
              <span className="size-1.5 rounded-full bg-violet-600" />
              Hecho para Latinoamerica
            </span>
            <h1 className="mt-6 text-4xl/tight font-extrabold tracking-tight text-slate-900 sm:text-5xl/tight lg:text-6xl/tight">
              Apps que impulsan tu{' '}
              <span className="bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                e-commerce
              </span>
            </h1>
            <p className="mt-6 text-lg/8 text-slate-600">
              Suite de aplicaciones para Shopify disenadas especificamente para el mercado latinoamericano.
              Pago contra entrega, formularios, automatizacion y mas.
            </p>
          </div>
        </div>
      </section>

      {/* Apps Grid */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Nuestras Apps</h2>
            <p className="mt-2 text-base/7 text-slate-600">
              Soluciones probadas que ayudan a miles de tiendas a vender mas
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}

            {/* Placeholder for future apps */}
            <div className="flex items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-8">
              <div className="text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-slate-100">
                  <svg className="size-7 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <p className="mt-4 text-sm font-medium text-slate-500">Mas apps proximamente</p>
                <p className="mt-1 text-xs text-slate-400">Estamos trabajando en nuevas soluciones</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-slate-100 bg-slate-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Por que Curetcore?</h2>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: (
                  <svg className="size-6 text-violet-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                ),
                title: "Confiable",
                desc: "Apps probadas por cientos de tiendas",
              },
              {
                icon: (
                  <svg className="size-6 text-violet-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                ),
                title: "Latinoamerica",
                desc: "Disenado para el mercado local",
              },
              {
                icon: (
                  <svg className="size-6 text-violet-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                  </svg>
                ),
                title: "Facil de usar",
                desc: "Sin codigo, todo visual",
              },
              {
                icon: (
                  <svg className="size-6 text-violet-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                  </svg>
                ),
                title: "Soporte",
                desc: "Ayuda en espanol cuando la necesites",
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-violet-100">
                  {item.icon}
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm/6 text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-600 to-purple-600">
                <svg className="size-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                </svg>
              </div>
              <span className="text-base font-semibold text-slate-900">Curetcore</span>
            </div>

            <div className="flex items-center gap-6 text-sm/6 text-slate-500">
              <Link to="/privacy" className="hover:text-slate-900">Privacidad</Link>
              <Link to="/terms" className="hover:text-slate-900">Terminos</Link>
              <a href="mailto:soporte@curetcore.com" className="hover:text-slate-900">Soporte</a>
            </div>

            <p className="text-sm/6 text-slate-500">
              2024 Curetcore. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
