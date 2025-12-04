import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

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

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: "#1a1a2e", lineHeight: 1.6 }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px 32px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 18px;
          text-decoration: none;
          display: inline-block;
          transition: transform 0.2s, box-shadow 0.2s;
          border: none;
          cursor: pointer;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 40px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
          background: white;
          color: #667eea;
          padding: 16px 32px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 18px;
          text-decoration: none;
          display: inline-block;
          transition: transform 0.2s, box-shadow 0.2s;
          border: 2px solid #667eea;
        }

        .btn-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 40px rgba(102, 126, 234, 0.2);
        }

        .card {
          background: white;
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
        }

        .feature-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          margin-bottom: 20px;
        }

        .section {
          padding: 100px 20px;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          z-index: 1000;
          padding: 16px 20px;
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
        }

        .nav-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-links {
          display: flex;
          gap: 32px;
          list-style: none;
        }

        .nav-links a {
          color: #1a1a2e;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }

        .nav-links a:hover {
          color: #667eea;
        }

        .logo {
          font-size: 24px;
          font-weight: 800;
        }

        .hero {
          padding-top: 140px;
          padding-bottom: 100px;
          background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
        }

        .hero-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .hero-badge {
          display: inline-block;
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          padding: 8px 16px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 24px;
        }

        .hero h1 {
          font-size: 56px;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 24px;
        }

        .hero p {
          font-size: 20px;
          color: #666;
          margin-bottom: 32px;
        }

        .hero-buttons {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .hero-image {
          position: relative;
        }

        .hero-mockup {
          width: 100%;
          max-width: 500px;
          border-radius: 20px;
          box-shadow: 0 40px 100px rgba(102, 126, 234, 0.3);
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin-top: 60px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 48px;
          font-weight: 800;
        }

        .stat-label {
          color: #666;
          font-size: 16px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }

        .feature-title {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .feature-desc {
          color: #666;
          font-size: 16px;
        }

        .how-it-works {
          background: linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%);
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
          margin-top: 60px;
        }

        .step {
          text-align: center;
          position: relative;
        }

        .step-number {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 800;
          color: white;
          margin: 0 auto 20px;
        }

        .step h4 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .step p {
          color: #666;
          font-size: 15px;
        }

        .pricing {
          background: #1a1a2e;
          color: white;
        }

        .pricing h2, .pricing p {
          color: white;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin-top: 60px;
        }

        .pricing-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 40px;
          text-align: center;
        }

        .pricing-card.featured {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          transform: scale(1.05);
        }

        .pricing-name {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .pricing-price {
          font-size: 56px;
          font-weight: 800;
          margin: 20px 0;
        }

        .pricing-price span {
          font-size: 18px;
          font-weight: 500;
          opacity: 0.8;
        }

        .pricing-features {
          list-style: none;
          margin: 30px 0;
          text-align: left;
        }

        .pricing-features li {
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pricing-features li:last-child {
          border-bottom: none;
        }

        .check-icon {
          color: #4ade80;
          font-size: 18px;
        }

        .testimonials {
          background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin-top: 60px;
        }

        .testimonial-card {
          background: white;
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.08);
        }

        .testimonial-text {
          font-size: 18px;
          font-style: italic;
          margin-bottom: 24px;
          color: #333;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .testimonial-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 20px;
        }

        .testimonial-name {
          font-weight: 700;
        }

        .testimonial-role {
          color: #666;
          font-size: 14px;
        }

        .faq {
          background: white;
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-top: 60px;
        }

        .faq-item {
          background: #f8f9ff;
          border-radius: 16px;
          padding: 24px;
        }

        .faq-question {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 12px;
          color: #1a1a2e;
        }

        .faq-answer {
          color: #666;
          font-size: 16px;
        }

        .cta {
          text-align: center;
          padding: 120px 20px;
        }

        .cta h2 {
          font-size: 48px;
          font-weight: 800;
          margin-bottom: 24px;
        }

        .cta p {
          font-size: 20px;
          color: #666;
          margin-bottom: 40px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .footer {
          background: #1a1a2e;
          color: white;
          padding: 60px 20px 30px;
        }

        .footer-content {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 60px;
          margin-bottom: 40px;
        }

        .footer-brand h3 {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 16px;
        }

        .footer-brand p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 16px;
        }

        .footer-links h4 {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 20px;
          color: white;
        }

        .footer-links ul {
          list-style: none;
        }

        .footer-links li {
          margin-bottom: 12px;
        }

        .footer-links a {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          transition: color 0.2s;
        }

        .footer-links a:hover {
          color: white;
        }

        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: rgba(255, 255, 255, 0.5);
          font-size: 14px;
        }

        .social-links {
          display: flex;
          gap: 16px;
        }

        .social-links a {
          color: rgba(255, 255, 255, 0.7);
          font-size: 20px;
          transition: color 0.2s;
        }

        .social-links a:hover {
          color: white;
        }

        @media (max-width: 968px) {
          .hero-content, .features-grid, .pricing-grid, .testimonials-grid, .faq-grid, .footer-content {
            grid-template-columns: 1fr;
          }

          .steps {
            grid-template-columns: repeat(2, 1fr);
          }

          .hero h1 {
            font-size: 40px;
          }

          .stats {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .nav-links {
            display: none;
          }

          .pricing-card.featured {
            transform: none;
          }
        }

        @media (max-width: 480px) {
          .steps {
            grid-template-columns: 1fr;
          }

          .hero h1 {
            font-size: 32px;
          }

          .cta h2 {
            font-size: 32px;
          }
        }
      `}} />

      {/* Navigation */}
      <nav className="nav">
        <div className="nav-content">
          <div className="logo">
            <span className="gradient-text">Curetfy</span>
          </div>
          <ul className="nav-links">
            <li><a href="#features">Funciones</a></li>
            <li><a href="#how-it-works">Como funciona</a></li>
            <li><a href="#pricing">Precios</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
          <a href="https://apps.shopify.com/curetfy-cod-form" className="btn-primary" style={{ padding: "12px 24px", fontSize: "16px" }}>
            Instalar Gratis
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero section">
        <div className="container">
          <div className="hero-content">
            <div>
              <span className="hero-badge">App #1 de COD para Shopify</span>
              <h1>
                Vende mas con <span className="gradient-text">Pago Contra Entrega</span>
              </h1>
              <p>
                Formularios optimizados para WhatsApp que convierten visitantes en clientes.
                Perfecto para dropshipping y e-commerce en Latinoamerica.
              </p>
              <div className="hero-buttons">
                <a href="https://apps.shopify.com/curetfy-cod-form" className="btn-primary">
                  Comenzar Gratis
                </a>
                <a href="#how-it-works" className="btn-secondary">
                  Ver Demo
                </a>
              </div>
            </div>
            <div className="hero-image">
              <div style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "20px",
                padding: "40px",
                boxShadow: "0 40px 100px rgba(102, 126, 234, 0.3)"
              }}>
                <div style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.1)"
                }}>
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ background: "#f3f4f6", height: "12px", borderRadius: "6px", marginBottom: "8px" }}></div>
                    <div style={{ background: "#f3f4f6", height: "40px", borderRadius: "8px" }}></div>
                  </div>
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ background: "#f3f4f6", height: "12px", borderRadius: "6px", marginBottom: "8px" }}></div>
                    <div style={{ background: "#f3f4f6", height: "40px", borderRadius: "8px" }}></div>
                  </div>
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ background: "#f3f4f6", height: "12px", borderRadius: "6px", marginBottom: "8px" }}></div>
                    <div style={{ background: "#f3f4f6", height: "40px", borderRadius: "8px" }}></div>
                  </div>
                  <button style={{
                    width: "100%",
                    background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                    color: "white",
                    border: "none",
                    padding: "16px",
                    borderRadius: "10px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Pedir por WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="stats">
            <div className="stat-item">
              <div className="stat-number gradient-text">500+</div>
              <div className="stat-label">Tiendas Activas</div>
            </div>
            <div className="stat-item">
              <div className="stat-number gradient-text">50K+</div>
              <div className="stat-label">Pedidos Procesados</div>
            </div>
            <div className="stat-item">
              <div className="stat-number gradient-text">35%</div>
              <div className="stat-label">Aumento en Conversiones</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section" style={{ background: "white" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ fontSize: "42px", fontWeight: "800", marginBottom: "16px" }}>
              Todo lo que necesitas para <span className="gradient-text">vender mas</span>
            </h2>
            <p style={{ fontSize: "20px", color: "#666", maxWidth: "600px", margin: "0 auto" }}>
              Funciones disenadas especificamente para el mercado latinoamericano
            </p>
          </div>

          <div className="features-grid">
            <div className="card">
              <div className="feature-icon" style={{ background: "rgba(37, 211, 102, 0.1)" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <h3 className="feature-title">Integracion WhatsApp</h3>
              <p className="feature-desc">
                Recibe pedidos directamente en WhatsApp con todos los detalles del cliente y productos. Sin complicaciones.
              </p>
            </div>

            <div className="card">
              <div className="feature-icon" style={{ background: "rgba(102, 126, 234, 0.1)" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#667eea">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              <h3 className="feature-title">Constructor de Formularios</h3>
              <p className="feature-desc">
                Arrastra y suelta campos para crear el formulario perfecto. Nombre, telefono, direccion, ciudad y mas.
              </p>
            </div>

            <div className="card">
              <div className="feature-icon" style={{ background: "rgba(236, 72, 153, 0.1)" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#ec4899">
                  <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                </svg>
              </div>
              <h3 className="feature-title">Zonas de Envio</h3>
              <p className="feature-desc">
                Configura costos de envio por ciudad, provincia o pais. Ofrece envio gratis a partir de cierto monto.
              </p>
            </div>

            <div className="card">
              <div className="feature-icon" style={{ background: "rgba(245, 158, 11, 0.1)" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#f59e0b">
                  <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
                </svg>
              </div>
              <h3 className="feature-title">Cupones de Descuento</h3>
              <p className="feature-desc">
                Valida automaticamente los cupones de Shopify. Tus clientes pueden aplicar descuentos al momento.
              </p>
            </div>

            <div className="card">
              <div className="feature-icon" style={{ background: "rgba(16, 185, 129, 0.1)" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#10b981">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              </div>
              <h3 className="feature-title">Analiticas Completas</h3>
              <p className="feature-desc">
                Ve pedidos por dia, productos mas vendidos, ciudades top y el rendimiento de tu formulario COD.
              </p>
            </div>

            <div className="card">
              <div className="feature-icon" style={{ background: "rgba(139, 92, 246, 0.1)" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#8b5cf6">
                  <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                </svg>
              </div>
              <h3 className="feature-title">Totalmente Personalizable</h3>
              <p className="feature-desc">
                Cambia colores, textos, iconos y animaciones. El boton se adapta perfectamente a tu marca.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="section how-it-works">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ fontSize: "42px", fontWeight: "800", marginBottom: "16px" }}>
              Como <span className="gradient-text">funciona</span>
            </h2>
            <p style={{ fontSize: "20px", color: "#666", maxWidth: "600px", margin: "0 auto" }}>
              Comienza a recibir pedidos COD en menos de 5 minutos
            </p>
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-number gradient-bg">1</div>
              <h4>Instala la App</h4>
              <p>Instalacion con un clic desde la App Store de Shopify. Sin codigo necesario.</p>
            </div>

            <div className="step">
              <div className="step-number gradient-bg">2</div>
              <h4>Configura WhatsApp</h4>
              <p>Agrega tu numero de WhatsApp donde quieres recibir los pedidos.</p>
            </div>

            <div className="step">
              <div className="step-number gradient-bg">3</div>
              <h4>Agrega el Boton</h4>
              <p>Arrastra el bloque COD a tu pagina de producto en el editor de tema.</p>
            </div>

            <div className="step">
              <div className="step-number gradient-bg">4</div>
              <h4>Recibe Pedidos</h4>
              <p>Los clientes completan el formulario y tu recibes el pedido por WhatsApp.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section pricing">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ fontSize: "42px", fontWeight: "800", marginBottom: "16px" }}>
              Precios simples y transparentes
            </h2>
            <p style={{ fontSize: "20px", opacity: 0.8, maxWidth: "600px", margin: "0 auto" }}>
              Sin costos ocultos. Cancela cuando quieras.
            </p>
          </div>

          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-name">Starter</div>
              <p style={{ opacity: 0.7 }}>Para tiendas nuevas</p>
              <div className="pricing-price">$0<span>/mes</span></div>
              <ul className="pricing-features">
                <li><span className="check-icon">&#10003;</span> 50 pedidos/mes</li>
                <li><span className="check-icon">&#10003;</span> Integracion WhatsApp</li>
                <li><span className="check-icon">&#10003;</span> Formulario basico</li>
                <li><span className="check-icon">&#10003;</span> Soporte por email</li>
              </ul>
              <a href="https://apps.shopify.com/curetfy-cod-form" className="btn-secondary" style={{ width: "100%", textAlign: "center" }}>
                Comenzar Gratis
              </a>
            </div>

            <div className="pricing-card featured">
              <div className="pricing-name">Pro</div>
              <p style={{ opacity: 0.9 }}>Mas popular</p>
              <div className="pricing-price">$19<span>/mes</span></div>
              <ul className="pricing-features">
                <li><span className="check-icon">&#10003;</span> Pedidos ilimitados</li>
                <li><span className="check-icon">&#10003;</span> Constructor de formularios</li>
                <li><span className="check-icon">&#10003;</span> Zonas de envio</li>
                <li><span className="check-icon">&#10003;</span> Cupones de descuento</li>
                <li><span className="check-icon">&#10003;</span> Analiticas completas</li>
                <li><span className="check-icon">&#10003;</span> Soporte prioritario</li>
              </ul>
              <a href="https://apps.shopify.com/curetfy-cod-form" className="btn-primary" style={{ width: "100%", textAlign: "center", background: "white", color: "#667eea" }}>
                Prueba 14 dias gratis
              </a>
            </div>

            <div className="pricing-card">
              <div className="pricing-name">Enterprise</div>
              <p style={{ opacity: 0.7 }}>Para grandes volumenes</p>
              <div className="pricing-price">$49<span>/mes</span></div>
              <ul className="pricing-features">
                <li><span className="check-icon">&#10003;</span> Todo en Pro</li>
                <li><span className="check-icon">&#10003;</span> Multiples numeros WhatsApp</li>
                <li><span className="check-icon">&#10003;</span> API access</li>
                <li><span className="check-icon">&#10003;</span> Webhooks personalizados</li>
                <li><span className="check-icon">&#10003;</span> Soporte dedicado</li>
                <li><span className="check-icon">&#10003;</span> Onboarding personalizado</li>
              </ul>
              <a href="mailto:ventas@curetcore.com" className="btn-secondary" style={{ width: "100%", textAlign: "center" }}>
                Contactar Ventas
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section testimonials">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ fontSize: "42px", fontWeight: "800", marginBottom: "16px" }}>
              Lo que dicen nuestros <span className="gradient-text">clientes</span>
            </h2>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p className="testimonial-text">
                "Desde que instalamos Curetfy, nuestras conversiones aumentaron un 40%. Los clientes prefieren pagar contra entrega y el proceso es super facil."
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">MC</div>
                <div>
                  <div className="testimonial-name">Maria Castillo</div>
                  <div className="testimonial-role">Tienda de Ropa - Colombia</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <p className="testimonial-text">
                "La integracion con WhatsApp es perfecta. Recibo el pedido con todos los datos y puedo confirmar inmediatamente con el cliente."
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">JR</div>
                <div>
                  <div className="testimonial-name">Juan Rodriguez</div>
                  <div className="testimonial-role">Dropshipping - Mexico</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <p className="testimonial-text">
                "Probamos varias apps de COD y esta es la mejor. El constructor de formularios y las zonas de envio son exactamente lo que necesitabamos."
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">LP</div>
                <div>
                  <div className="testimonial-name">Laura Perez</div>
                  <div className="testimonial-role">Cosmeticos - Peru</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section faq">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ fontSize: "42px", fontWeight: "800", marginBottom: "16px" }}>
              Preguntas <span className="gradient-text">frecuentes</span>
            </h2>
          </div>

          <div className="faq-grid">
            <div className="faq-item">
              <h4 className="faq-question">Funciona con mi tema de Shopify?</h4>
              <p className="faq-answer">
                Si, Curetfy funciona con todos los temas de Shopify 2.0 (la mayoria de temas modernos). Se instala como un bloque que puedes agregar a cualquier pagina.
              </p>
            </div>

            <div className="faq-item">
              <h4 className="faq-question">Necesito saber programar?</h4>
              <p className="faq-answer">
                No, todo se configura visualmente desde el panel de la app y el editor de tema de Shopify. No se requiere codigo.
              </p>
            </div>

            <div className="faq-item">
              <h4 className="faq-question">Como recibo los pedidos?</h4>
              <p className="faq-answer">
                Los pedidos llegan directamente a tu WhatsApp con todos los detalles: nombre, telefono, direccion, productos y total. Tambien puedes verlos en el panel de la app.
              </p>
            </div>

            <div className="faq-item">
              <h4 className="faq-question">Puedo probar antes de pagar?</h4>
              <p className="faq-answer">
                Si, ofrecemos un plan gratuito con 50 pedidos al mes y una prueba de 14 dias del plan Pro sin compromiso.
              </p>
            </div>

            <div className="faq-item">
              <h4 className="faq-question">Los pedidos se crean en Shopify?</h4>
              <p className="faq-answer">
                Si, puedes activar la opcion para crear borradores de pedido automaticamente en Shopify. Asi tienes todo centralizado.
              </p>
            </div>

            <div className="faq-item">
              <h4 className="faq-question">Que pasa si cancelo?</h4>
              <p className="faq-answer">
                Puedes cancelar en cualquier momento sin penalizacion. Tus datos se mantienen por 48 horas y luego se eliminan permanentemente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta" style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%)" }}>
        <div className="container">
          <h2>Listo para aumentar tus ventas?</h2>
          <p>
            Unete a cientos de tiendas que ya usan Curetfy para procesar pedidos COD de forma eficiente.
          </p>
          <a href="https://apps.shopify.com/curetfy-cod-form" className="btn-primary">
            Instalar Gratis en Shopify
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3><span style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Curetfy</span></h3>
              <p>
                La mejor solucion de Pago Contra Entrega para Shopify. Disenada para el mercado latinoamericano.
              </p>
            </div>

            <div className="footer-links">
              <h4>Producto</h4>
              <ul>
                <li><a href="#features">Funciones</a></li>
                <li><a href="#pricing">Precios</a></li>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="https://apps.shopify.com/curetfy-cod-form">App Store</a></li>
              </ul>
            </div>

            <div className="footer-links">
              <h4>Recursos</h4>
              <ul>
                <li><a href="/app/help">Centro de Ayuda</a></li>
                <li><a href="mailto:soporte@curetcore.com">Soporte</a></li>
                <li><a href="https://wa.me/573001234567">WhatsApp</a></li>
              </ul>
            </div>

            <div className="footer-links">
              <h4>Legal</h4>
              <ul>
                <li><Link to="/privacy">Privacidad</Link></li>
                <li><Link to="/terms">Terminos</Link></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div>2024 CURET / Curetcore. Todos los derechos reservados.</div>
            <div className="social-links">
              <a href="https://instagram.com/curetcore" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://twitter.com/curetcore" aria-label="Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
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
