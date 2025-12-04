import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Privacy Policy - Curetfy COD Form" },
    { name: "description", content: "Privacy Policy for Curetfy COD Form Shopify App" },
  ];
};

export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui, -apple-system, sans-serif", lineHeight: 1.6, color: "#333" }}>
      <h1 style={{ borderBottom: "2px solid #000", paddingBottom: "10px" }}>Privacy Policy</h1>
      <p style={{ color: "#666" }}>Last updated: December 4, 2024</p>

      <h2>1. Introduction</h2>
      <p>
        Curetfy COD Form ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Shopify application.
      </p>

      <h2>2. Information We Collect</h2>

      <h3>2.1 Store Information</h3>
      <p>When you install our app, we collect:</p>
      <ul>
        <li>Store domain name</li>
        <li>Store owner email (for support purposes)</li>
        <li>Access tokens provided by Shopify for API access</li>
      </ul>

      <h3>2.2 Customer Information</h3>
      <p>When customers submit orders through our form, we collect:</p>
      <ul>
        <li>Full name</li>
        <li>Phone number / WhatsApp</li>
        <li>Email address (if provided)</li>
        <li>Delivery address</li>
        <li>City and province/state</li>
        <li>Order notes (if provided)</li>
      </ul>

      <h3>2.3 Order Information</h3>
      <ul>
        <li>Product details (title, variant, quantity, price)</li>
        <li>Order totals and discounts</li>
        <li>UTM tracking parameters (if present)</li>
        <li>Timestamp of order creation</li>
      </ul>

      <h3>2.4 Technical Information</h3>
      <ul>
        <li>IP address (for fraud prevention)</li>
        <li>Browser user agent</li>
        <li>Page URL where form was submitted</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <p>We use the collected information to:</p>
      <ul>
        <li>Process and fulfill COD orders</li>
        <li>Send order details to WhatsApp</li>
        <li>Create draft orders in Shopify (if enabled)</li>
        <li>Provide analytics and reporting to store owners</li>
        <li>Improve our services and user experience</li>
        <li>Communicate with merchants about their account</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>4. Data Sharing</h2>
      <p>We do NOT sell your personal information. We may share data with:</p>
      <ul>
        <li><strong>Shopify:</strong> To create orders and access store data via their API</li>
        <li><strong>WhatsApp:</strong> Order details are sent via WhatsApp Web URL (no API storage)</li>
        <li><strong>Store Owners:</strong> Customer order data is visible to the merchant</li>
        <li><strong>Legal Requirements:</strong> When required by law or legal process</li>
      </ul>

      <h2>5. Data Retention</h2>
      <ul>
        <li>Order data is retained for as long as the merchant's account is active</li>
        <li>When you uninstall our app, we retain data for 48 hours per Shopify requirements</li>
        <li>After 48 hours post-uninstall, all shop data is permanently deleted</li>
        <li>Customer data deletion requests are processed within 30 days</li>
      </ul>

      <h2>6. Data Security</h2>
      <p>We implement industry-standard security measures:</p>
      <ul>
        <li>All data transmission uses TLS/SSL encryption</li>
        <li>Database access is restricted and monitored</li>
        <li>Access tokens are stored securely</li>
        <li>Regular security audits and updates</li>
      </ul>

      <h2>7. Your Rights (GDPR & CCPA)</h2>
      <p>You have the right to:</p>
      <ul>
        <li><strong>Access:</strong> Request a copy of your personal data</li>
        <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
        <li><strong>Erasure:</strong> Request deletion of your data</li>
        <li><strong>Portability:</strong> Request your data in a portable format</li>
        <li><strong>Objection:</strong> Object to certain processing of your data</li>
      </ul>
      <p>To exercise these rights, contact us at: <a href="mailto:privacy@curetcore.com">privacy@curetcore.com</a></p>

      <h2>8. Cookies and Tracking</h2>
      <p>Our app does not use third-party cookies. We may use:</p>
      <ul>
        <li>Session tokens for authentication (required by Shopify)</li>
        <li>Local storage for form state (cleared after submission)</li>
        <li>UTM parameters from URL for attribution tracking</li>
      </ul>

      <h2>9. Third-Party Services</h2>
      <p>Our app integrates with:</p>
      <ul>
        <li><strong>Shopify:</strong> E-commerce platform - <a href="https://www.shopify.com/legal/privacy" target="_blank" rel="noopener">Privacy Policy</a></li>
        <li><strong>WhatsApp:</strong> Messaging service - <a href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" rel="noopener">Privacy Policy</a></li>
        <li><strong>Facebook Pixel:</strong> (Optional) Analytics - <a href="https://www.facebook.com/privacy/policy" target="_blank" rel="noopener">Privacy Policy</a></li>
      </ul>

      <h2>10. Children's Privacy</h2>
      <p>
        Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children.
      </p>

      <h2>11. International Data Transfers</h2>
      <p>
        Your data may be processed in servers located outside your country. We ensure appropriate safeguards are in place for international transfers.
      </p>

      <h2>12. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify merchants of significant changes via email or in-app notification.
      </p>

      <h2>13. Contact Us</h2>
      <p>For privacy-related inquiries:</p>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:privacy@curetcore.com">privacy@curetcore.com</a></li>
        <li><strong>Support:</strong> <a href="mailto:soporte@curetcore.com">soporte@curetcore.com</a></li>
        <li><strong>Company:</strong> CURET / Curetcore</li>
      </ul>

      <div style={{ marginTop: "40px", padding: "20px", background: "#f5f5f5", borderRadius: "8px" }}>
        <p style={{ margin: 0 }}>
          <strong>Curetfy COD Form</strong> is developed by CURET / Curetcore<br />
          This app is designed for Shopify merchants in Latin America and worldwide.
        </p>
      </div>
    </div>
  );
}
