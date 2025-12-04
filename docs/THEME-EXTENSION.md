# Theme App Extension

> Especificación técnica del formulario COD para storefront

## Estructura

```
extensions/cod-form/
├── blocks/
│   └── cod-button.liquid         # Bloque principal
├── assets/
│   ├── cod-form.js               # Lógica del formulario
│   └── cod-form.css              # Estilos
├── locales/
│   ├── en.default.json           # Inglés (default)
│   └── es.json                   # Español
├── snippets/                      # (opcional) Snippets reutilizables
└── shopify.extension.toml         # Configuración
```

---

## Configuración (shopify.extension.toml)

```toml
api_version = "2024-10"

[[extensions]]
type = "theme"
name = "Curetfy COD Form"
handle = "curetfy-cod-form"

  [[extensions.blocks]]
  type = "product"
  name = "COD Buy Button"
  template = "cod-button"

  [[extensions.blocks]]
  type = "page"
  name = "COD Form Standalone"
  template = "cod-button"
```

---

## Bloque Principal (cod-button.liquid)

```liquid
{% comment %}
  Curetfy COD Form - Buy Button Block
  Versión: 1.0.0
{% endcomment %}

{% liquid
  assign button_id = 'curetfy-btn-' | append: block.id
  assign modal_id = 'curetfy-modal-' | append: block.id
  assign form_id = 'curetfy-form-' | append: block.id

  if product
    assign current_variant = product.selected_or_first_available_variant
    assign product_price = current_variant.price | money
    assign product_image = product.featured_image | image_url: width: 200
  endif
%}

<style>
  .curetfy-cod-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background-color: {{ block.settings.button_color }};
    color: {{ block.settings.button_text_color }};
    border: none;
    border-radius: {{ block.settings.button_radius }}px;
    padding: {{ block.settings.button_padding }}px {{ block.settings.button_padding | times: 2 }}px;
    font-size: {{ block.settings.button_font_size }}px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.1s;
    {% if block.settings.button_full_width %}
      width: 100%;
    {% endif %}
  }

  .curetfy-cod-button:hover {
    opacity: 0.9;
  }

  .curetfy-cod-button:active {
    transform: scale(0.98);
  }

  .curetfy-cod-button svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }
</style>

<div
  id="curetfy-container-{{ block.id }}"
  class="curetfy-cod-container"
  data-block-id="{{ block.id }}"
  data-shop="{{ shop.permanent_domain }}"
  data-product-id="{{ product.id }}"
  data-product-title="{{ product.title | escape }}"
  data-product-price="{{ current_variant.price | divided_by: 100.0 }}"
  data-product-price-formatted="{{ product_price }}"
  data-product-image="{{ product_image }}"
  data-variant-id="{{ current_variant.id }}"
  data-currency="{{ shop.currency }}"
  data-locale="{{ request.locale.iso_code }}"
>
  <!-- Botón Principal -->
  <button
    type="button"
    id="{{ button_id }}"
    class="curetfy-cod-button"
    aria-label="{{ block.settings.button_text }}"
    aria-haspopup="dialog"
  >
    {% if block.settings.show_whatsapp_icon %}
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    {% endif %}
    {{ block.settings.button_text }}
  </button>
</div>

<!-- Modal Template (se clona con JS) -->
<template id="curetfy-modal-template">
  <div class="curetfy-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="curetfy-modal-title">
    <div class="curetfy-modal">
      <!-- Header -->
      <div class="curetfy-modal-header">
        <h2 id="curetfy-modal-title" class="curetfy-modal-title">{{ block.settings.form_title }}</h2>
        <button type="button" class="curetfy-modal-close" aria-label="{{ 'form.close' | t }}">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- Product Summary -->
      <div class="curetfy-product-summary">
        <img class="curetfy-product-image" src="" alt="" loading="lazy">
        <div class="curetfy-product-info">
          <p class="curetfy-product-title"></p>
          <p class="curetfy-product-price"></p>
        </div>
      </div>

      <!-- Form -->
      <form class="curetfy-form" novalidate>
        <div class="curetfy-form-group">
          <label for="curetfy-name">{{ 'form.name' | t }}</label>
          <input
            type="text"
            id="curetfy-name"
            name="name"
            required
            autocomplete="name"
            placeholder="{{ 'form.name_placeholder' | t }}"
          >
          <span class="curetfy-error-message"></span>
        </div>

        <div class="curetfy-form-group">
          <label for="curetfy-phone">{{ 'form.phone' | t }}</label>
          <input
            type="tel"
            id="curetfy-phone"
            name="phone"
            required
            autocomplete="tel"
            placeholder="{{ 'form.phone_placeholder' | t }}"
          >
          <span class="curetfy-error-message"></span>
        </div>

        <div class="curetfy-form-group">
          <label for="curetfy-address">{{ 'form.address' | t }}</label>
          <textarea
            id="curetfy-address"
            name="address"
            required
            autocomplete="street-address"
            placeholder="{{ 'form.address_placeholder' | t }}"
            rows="2"
          ></textarea>
          <span class="curetfy-error-message"></span>
        </div>

        <div class="curetfy-form-row">
          <div class="curetfy-form-group curetfy-form-group--half">
            <label for="curetfy-province">{{ 'form.province' | t }}</label>
            <select id="curetfy-province" name="province" required>
              <option value="">{{ 'form.select_province' | t }}</option>
            </select>
            <span class="curetfy-error-message"></span>
          </div>

          <div class="curetfy-form-group curetfy-form-group--half">
            <label for="curetfy-quantity">{{ 'form.quantity' | t }}</label>
            <div class="curetfy-quantity-wrapper">
              <button type="button" class="curetfy-quantity-btn" data-action="decrease">-</button>
              <input
                type="number"
                id="curetfy-quantity"
                name="quantity"
                min="1"
                max="99"
                value="1"
                readonly
              >
              <button type="button" class="curetfy-quantity-btn" data-action="increase">+</button>
            </div>
          </div>
        </div>

        <!-- Quantity Offers (populated by JS) -->
        <div class="curetfy-quantity-offers" style="display: none;"></div>

        <!-- Upsells (populated by JS) -->
        <div class="curetfy-upsells" style="display: none;"></div>

        <!-- Total -->
        <div class="curetfy-total">
          <span>{{ 'form.total' | t }}:</span>
          <span class="curetfy-total-amount"></span>
        </div>

        <!-- Submit -->
        <button type="submit" class="curetfy-submit-button" style="background-color: {{ block.settings.button_color }};">
          <span class="curetfy-submit-text">{{ 'form.submit' | t }}</span>
          <span class="curetfy-submit-loading" style="display: none;">
            <svg class="curetfy-spinner" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.4 31.4"/>
            </svg>
          </span>
        </button>
      </form>

      <!-- Success Message (hidden by default) -->
      <div class="curetfy-success" style="display: none;">
        <svg class="curetfy-success-icon" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <h3>{{ 'form.success_title' | t }}</h3>
        <p>{{ 'form.success_message' | t }}</p>
        <a href="#" class="curetfy-whatsapp-link" target="_blank" rel="noopener">
          {{ 'form.open_whatsapp' | t }}
        </a>
      </div>
    </div>
  </div>
</template>

<!-- Load JS -->
<script src="{{ 'cod-form.js' | asset_url }}" defer></script>

{% schema %}
{
  "name": "COD Buy Button",
  "target": "section",
  "class": "curetfy-block",
  "settings": [
    {
      "type": "header",
      "content": "Button Settings"
    },
    {
      "type": "text",
      "id": "button_text",
      "label": "Button Text",
      "default": "Comprar por WhatsApp"
    },
    {
      "type": "color",
      "id": "button_color",
      "label": "Button Color",
      "default": "#25D366"
    },
    {
      "type": "color",
      "id": "button_text_color",
      "label": "Text Color",
      "default": "#FFFFFF"
    },
    {
      "type": "range",
      "id": "button_radius",
      "label": "Border Radius",
      "min": 0,
      "max": 30,
      "step": 2,
      "default": 8,
      "unit": "px"
    },
    {
      "type": "range",
      "id": "button_padding",
      "label": "Padding",
      "min": 8,
      "max": 24,
      "step": 2,
      "default": 14,
      "unit": "px"
    },
    {
      "type": "range",
      "id": "button_font_size",
      "label": "Font Size",
      "min": 12,
      "max": 24,
      "step": 1,
      "default": 16,
      "unit": "px"
    },
    {
      "type": "checkbox",
      "id": "button_full_width",
      "label": "Full Width",
      "default": true
    },
    {
      "type": "checkbox",
      "id": "show_whatsapp_icon",
      "label": "Show WhatsApp Icon",
      "default": true
    },
    {
      "type": "header",
      "content": "Form Settings"
    },
    {
      "type": "text",
      "id": "form_title",
      "label": "Form Title",
      "default": "Completa tu pedido"
    }
  ],
  "presets": [
    {
      "name": "COD Buy Button"
    }
  ]
}
{% endschema %}
```

---

## JavaScript (cod-form.js)

```javascript
/**
 * Curetfy COD Form
 * @version 1.0.0
 */

(function() {
  'use strict';

  // Configuration
  const API_BASE = 'https://app.curetcore.com';
  const PROVINCES = {
    DO: [
      { code: 'DN', name: 'Distrito Nacional' },
      { code: 'SD', name: 'Santo Domingo' },
      { code: 'SC', name: 'Santiago' },
      { code: 'LP', name: 'La Vega' },
      { code: 'PP', name: 'Puerto Plata' },
      { code: 'SJ', name: 'San Juan' },
      { code: 'DU', name: 'Duarte' },
      { code: 'SP', name: 'San Pedro de Macorís' },
      { code: 'RO', name: 'La Romana' },
      { code: 'SE', name: 'San Cristóbal' },
      { code: 'AZ', name: 'Azua' },
      { code: 'BH', name: 'Barahona' },
      { code: 'DA', name: 'Dajabón' },
      { code: 'ES', name: 'Espaillat' },
      { code: 'HM', name: 'Hato Mayor' },
      { code: 'IN', name: 'Independencia' },
      { code: 'AL', name: 'La Altagracia' },
      { code: 'EP', name: 'Elías Piña' },
      { code: 'MC', name: 'Monte Cristi' },
      { code: 'MP', name: 'Monseñor Nouel' },
      { code: 'MT', name: 'Monte Plata' },
      { code: 'PN', name: 'Pedernales' },
      { code: 'PR', name: 'Peravia' },
      { code: 'SA', name: 'Samaná' },
      { code: 'SR', name: 'Sánchez Ramírez' },
      { code: 'SM', name: 'San José de Ocoa' },
      { code: 'CR', name: 'Santiago Rodríguez' },
      { code: 'VA', name: 'Valverde' },
      { code: 'SY', name: 'Hermanas Mirabal' },
    ],
    CO: [
      { code: 'BOG', name: 'Bogotá D.C.' },
      { code: 'ANT', name: 'Antioquia' },
      { code: 'VAC', name: 'Valle del Cauca' },
      { code: 'ATL', name: 'Atlántico' },
      { code: 'SAN', name: 'Santander' },
      // ... more
    ],
    MX: [
      { code: 'CMX', name: 'Ciudad de México' },
      { code: 'JAL', name: 'Jalisco' },
      { code: 'NLE', name: 'Nuevo León' },
      // ... more
    ],
  };

  // State
  let config = null;
  let currentModal = null;

  // Initialize
  function init() {
    document.querySelectorAll('.curetfy-cod-container').forEach(setupContainer);
    document.addEventListener('click', handleGlobalClick);
    document.addEventListener('keydown', handleKeydown);
  }

  function setupContainer(container) {
    const button = container.querySelector('.curetfy-cod-button');
    if (button) {
      button.addEventListener('click', () => openModal(container));
    }
  }

  // Fetch configuration
  async function fetchConfig(shop) {
    if (config) return config;

    try {
      const response = await fetch(`${API_BASE}/api/config/${shop}`);
      const data = await response.json();
      if (data.success) {
        config = data.config;
        return config;
      }
    } catch (error) {
      console.error('Curetfy: Failed to fetch config', error);
    }
    return null;
  }

  // Open modal
  async function openModal(container) {
    const data = container.dataset;
    const shop = data.shop;

    // Fetch config first
    await fetchConfig(shop);

    // Clone modal template
    const template = document.getElementById('curetfy-modal-template');
    const modal = template.content.cloneNode(true).firstElementChild;

    // Populate product info
    const productImage = modal.querySelector('.curetfy-product-image');
    const productTitle = modal.querySelector('.curetfy-product-title');
    const productPrice = modal.querySelector('.curetfy-product-price');

    productImage.src = data.productImage;
    productImage.alt = data.productTitle;
    productTitle.textContent = data.productTitle;
    productPrice.textContent = data.productPriceFormatted;

    // Store data on modal
    modal.dataset.shop = shop;
    modal.dataset.productId = data.productId;
    modal.dataset.productTitle = data.productTitle;
    modal.dataset.productPrice = data.productPrice;
    modal.dataset.variantId = data.variantId;
    modal.dataset.currency = data.currency;

    // Populate provinces
    const provinceSelect = modal.querySelector('#curetfy-province');
    const country = 'DO'; // Default, could be dynamic
    populateProvinces(provinceSelect, country);

    // Setup quantity controls
    setupQuantityControls(modal);

    // Setup form submission
    const form = modal.querySelector('.curetfy-form');
    form.addEventListener('submit', handleSubmit);

    // Update total
    updateTotal(modal);

    // Show modal
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    currentModal = modal;

    // Focus first input
    setTimeout(() => {
      modal.querySelector('#curetfy-name').focus();
    }, 100);

    // Track event
    trackEvent('form_opened', { productId: data.productId });
  }

  function closeModal() {
    if (currentModal) {
      currentModal.remove();
      currentModal = null;
      document.body.style.overflow = '';
    }
  }

  // Populate province dropdown
  function populateProvinces(select, country) {
    const provinces = PROVINCES[country] || [];
    provinces.forEach(province => {
      const option = document.createElement('option');
      option.value = province.name;
      option.textContent = province.name;
      select.appendChild(option);
    });
  }

  // Quantity controls
  function setupQuantityControls(modal) {
    const input = modal.querySelector('#curetfy-quantity');
    const decreaseBtn = modal.querySelector('[data-action="decrease"]');
    const increaseBtn = modal.querySelector('[data-action="increase"]');

    decreaseBtn.addEventListener('click', () => {
      const current = parseInt(input.value) || 1;
      if (current > 1) {
        input.value = current - 1;
        updateTotal(modal);
      }
    });

    increaseBtn.addEventListener('click', () => {
      const current = parseInt(input.value) || 1;
      if (current < 99) {
        input.value = current + 1;
        updateTotal(modal);
      }
    });
  }

  // Update total price
  function updateTotal(modal) {
    const price = parseFloat(modal.dataset.productPrice) || 0;
    const quantity = parseInt(modal.querySelector('#curetfy-quantity').value) || 1;
    const currency = modal.dataset.currency || 'DOP';

    const total = price * quantity;
    const formatted = formatCurrency(total, currency);

    modal.querySelector('.curetfy-total-amount').textContent = formatted;
  }

  // Format currency
  function formatCurrency(amount, currency) {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  // Form submission
  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const modal = form.closest('.curetfy-modal-overlay');
    const submitBtn = form.querySelector('.curetfy-submit-button');
    const submitText = submitBtn.querySelector('.curetfy-submit-text');
    const submitLoading = submitBtn.querySelector('.curetfy-submit-loading');

    // Validate
    if (!validateForm(form)) {
      return;
    }

    // Show loading
    submitBtn.disabled = true;
    submitText.style.display = 'none';
    submitLoading.style.display = 'block';

    // Collect data
    const formData = new FormData(form);
    const data = {
      shop: modal.dataset.shop,
      productId: modal.dataset.productId,
      productTitle: modal.dataset.productTitle,
      variantId: modal.dataset.variantId,
      quantity: parseInt(formData.get('quantity')) || 1,
      price: modal.dataset.productPrice,
      currency: modal.dataset.currency,
      customer: {
        name: formData.get('name').trim(),
        phone: formData.get('phone').trim(),
        address: formData.get('address').trim(),
        province: formData.get('province'),
        country: 'DO',
      },
    };

    try {
      const response = await fetch(`${API_BASE}/api/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        // Show success
        form.style.display = 'none';
        const success = modal.querySelector('.curetfy-success');
        const whatsappLink = success.querySelector('.curetfy-whatsapp-link');
        whatsappLink.href = result.data.whatsappLink;
        success.style.display = 'block';

        // Track event
        trackEvent('form_submitted', { orderId: result.data.orderId });

        // Auto-redirect to WhatsApp after 1s
        setTimeout(() => {
          window.open(result.data.whatsappLink, '_blank');
        }, 1000);

      } else {
        showError(form, result.error || 'Error al crear el pedido');
        submitBtn.disabled = false;
        submitText.style.display = 'block';
        submitLoading.style.display = 'none';
      }

    } catch (error) {
      console.error('Curetfy: Submit error', error);
      showError(form, 'Error de conexión. Intenta de nuevo.');
      submitBtn.disabled = false;
      submitText.style.display = 'block';
      submitLoading.style.display = 'none';
    }
  }

  // Validation
  function validateForm(form) {
    let valid = true;

    // Clear previous errors
    form.querySelectorAll('.curetfy-error-message').forEach(el => {
      el.textContent = '';
    });
    form.querySelectorAll('.curetfy-form-group--error').forEach(el => {
      el.classList.remove('curetfy-form-group--error');
    });

    // Name
    const name = form.querySelector('#curetfy-name');
    if (!name.value.trim()) {
      showFieldError(name, 'El nombre es requerido');
      valid = false;
    }

    // Phone
    const phone = form.querySelector('#curetfy-phone');
    const phoneValue = phone.value.trim();
    if (!phoneValue) {
      showFieldError(phone, 'El teléfono es requerido');
      valid = false;
    } else if (!isValidPhone(phoneValue)) {
      showFieldError(phone, 'Teléfono inválido');
      valid = false;
    }

    // Address
    const address = form.querySelector('#curetfy-address');
    if (!address.value.trim()) {
      showFieldError(address, 'La dirección es requerida');
      valid = false;
    }

    // Province
    const province = form.querySelector('#curetfy-province');
    if (!province.value) {
      showFieldError(province, 'Selecciona una provincia');
      valid = false;
    }

    return valid;
  }

  function showFieldError(input, message) {
    const group = input.closest('.curetfy-form-group');
    group.classList.add('curetfy-form-group--error');
    const errorEl = group.querySelector('.curetfy-error-message');
    if (errorEl) {
      errorEl.textContent = message;
    }
  }

  function showError(form, message) {
    // Could show a banner or alert
    alert(message);
  }

  function isValidPhone(phone) {
    // Basic validation for Dominican/LATAM phones
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  }

  // Event handlers
  function handleGlobalClick(event) {
    // Close button
    if (event.target.closest('.curetfy-modal-close')) {
      closeModal();
      return;
    }

    // Click outside modal
    if (event.target.classList.contains('curetfy-modal-overlay')) {
      closeModal();
      return;
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Escape' && currentModal) {
      closeModal();
    }
  }

  // Analytics
  function trackEvent(event, data = {}) {
    if (config?.shop) {
      fetch(`${API_BASE}/api/track-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop: config.shop,
          event,
          data,
          timestamp: Date.now(),
        }),
      }).catch(() => {}); // Silent fail
    }
  }

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

---

## CSS (cod-form.css)

```css
/**
 * Curetfy COD Form Styles
 * @version 1.0.0
 */

/* Modal Overlay */
.curetfy-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 999999;
  animation: curetfy-fade-in 0.2s ease;
}

@keyframes curetfy-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Modal */
.curetfy-modal {
  background: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: curetfy-slide-up 0.3s ease;
}

@keyframes curetfy-slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header */
.curetfy-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e5e5;
}

.curetfy-modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111;
}

.curetfy-modal-close {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #666;
  border-radius: 50%;
  transition: background 0.2s;
}

.curetfy-modal-close:hover {
  background: #f5f5f5;
}

/* Product Summary */
.curetfy-product-summary {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background: #f9f9f9;
  border-bottom: 1px solid #e5e5e5;
}

.curetfy-product-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
}

.curetfy-product-info {
  flex: 1;
  min-width: 0;
}

.curetfy-product-title {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 500;
  color: #111;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.curetfy-product-price {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #25D366;
}

/* Form */
.curetfy-form {
  padding: 20px;
}

.curetfy-form-group {
  margin-bottom: 16px;
}

.curetfy-form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.curetfy-form-group input,
.curetfy-form-group select,
.curetfy-form-group textarea {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  transition: border-color 0.2s, box-shadow 0.2s;
  -webkit-appearance: none;
}

.curetfy-form-group input:focus,
.curetfy-form-group select:focus,
.curetfy-form-group textarea:focus {
  outline: none;
  border-color: #25D366;
  box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.1);
}

.curetfy-form-group textarea {
  resize: vertical;
  min-height: 60px;
}

.curetfy-form-group select {
  background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 8L1 3h10z'/%3E%3C/svg%3E") no-repeat right 12px center;
  padding-right: 36px;
}

/* Error state */
.curetfy-form-group--error input,
.curetfy-form-group--error select,
.curetfy-form-group--error textarea {
  border-color: #dc3545;
}

.curetfy-error-message {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #dc3545;
}

/* Form row */
.curetfy-form-row {
  display: flex;
  gap: 12px;
}

.curetfy-form-group--half {
  flex: 1;
}

/* Quantity controls */
.curetfy-quantity-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.curetfy-quantity-btn {
  width: 40px;
  height: 44px;
  background: #f5f5f5;
  border: none;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.2s;
}

.curetfy-quantity-btn:hover {
  background: #e5e5e5;
}

.curetfy-quantity-wrapper input {
  flex: 1;
  text-align: center;
  border: none;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
  border-radius: 0;
  -moz-appearance: textfield;
}

.curetfy-quantity-wrapper input::-webkit-inner-spin-button,
.curetfy-quantity-wrapper input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Total */
.curetfy-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  margin-bottom: 16px;
  border-top: 1px solid #e5e5e5;
  font-size: 18px;
  font-weight: 600;
}

.curetfy-total-amount {
  color: #25D366;
}

/* Submit button */
.curetfy-submit-button {
  width: 100%;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.curetfy-submit-button:hover:not(:disabled) {
  opacity: 0.9;
}

.curetfy-submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Spinner */
.curetfy-spinner {
  width: 20px;
  height: 20px;
  animation: curetfy-spin 1s linear infinite;
}

@keyframes curetfy-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Success */
.curetfy-success {
  padding: 40px 20px;
  text-align: center;
}

.curetfy-success-icon {
  width: 64px;
  height: 64px;
  color: #25D366;
  margin-bottom: 16px;
}

.curetfy-success h3 {
  margin: 0 0 8px;
  font-size: 20px;
  color: #111;
}

.curetfy-success p {
  margin: 0 0 20px;
  color: #666;
}

.curetfy-whatsapp-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #25D366;
  color: #fff;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: opacity 0.2s;
}

.curetfy-whatsapp-link:hover {
  opacity: 0.9;
}

/* Responsive */
@media (max-width: 480px) {
  .curetfy-modal {
    max-height: 100vh;
    border-radius: 0;
  }

  .curetfy-form-row {
    flex-direction: column;
    gap: 16px;
  }
}
```

---

## Locales

### en.default.json

```json
{
  "form": {
    "name": "Full Name",
    "name_placeholder": "Enter your name",
    "phone": "Phone Number",
    "phone_placeholder": "+1 809 555 1234",
    "address": "Delivery Address",
    "address_placeholder": "Street, number, sector...",
    "province": "Province",
    "select_province": "Select province",
    "quantity": "Quantity",
    "total": "Total",
    "submit": "Confirm Order",
    "close": "Close",
    "success_title": "Order Created!",
    "success_message": "Your order has been registered. Click below to send via WhatsApp.",
    "open_whatsapp": "Open WhatsApp"
  }
}
```

### es.json

```json
{
  "form": {
    "name": "Nombre Completo",
    "name_placeholder": "Ingresa tu nombre",
    "phone": "Teléfono",
    "phone_placeholder": "+1 809 555 1234",
    "address": "Dirección de Entrega",
    "address_placeholder": "Calle, número, sector...",
    "province": "Provincia",
    "select_province": "Selecciona provincia",
    "quantity": "Cantidad",
    "total": "Total",
    "submit": "Confirmar Pedido",
    "close": "Cerrar",
    "success_title": "¡Pedido Creado!",
    "success_message": "Tu pedido ha sido registrado. Haz clic abajo para enviar por WhatsApp.",
    "open_whatsapp": "Abrir WhatsApp"
  }
}
```

---

## Performance Guidelines

### Tamaño de Assets

| Asset | Target | Actual |
|-------|--------|--------|
| cod-form.js | < 10KB | ~8KB minified |
| cod-form.css | < 5KB | ~4KB minified |
| Total | < 15KB | ~12KB |

### Optimizaciones

1. **No frameworks** - Vanilla JS puro
2. **CSS inline crítico** - Estilos del botón en el bloque
3. **Lazy load modal** - CSS del modal carga al abrir
4. **Event delegation** - Un solo listener global
5. **Template cloning** - Usar `<template>` para el modal

### Lighthouse Score Impact

El objetivo es mantener el impacto en Lighthouse score por debajo de 10 puntos:

- **LCP**: No afectado (botón es pequeño)
- **CLS**: 0 (elementos tienen dimensiones fijas)
- **FID/INP**: < 100ms (event handlers livianos)
