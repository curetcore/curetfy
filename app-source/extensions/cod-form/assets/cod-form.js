/**
 * Curetfy COD Form
 * Professional WhatsApp Order System
 * @version 4.0.0 - Full Featured
 */
(function() {
  'use strict';

  const API_BASE = 'https://app.curetcore.com';

  // Config cache
  let shopConfig = null;
  let shopProvinces = null;
  let shopCountries = null;
  let currentModal = null;

  // Current order state
  let orderState = {
    subtotal: 0,
    shipping: 0,
    shippingMethod: null,
    codFee: 0,
    total: 0,
    quantity: 1,
    currency: 'DOP'
  };

  // Get UTM parameters from URL
  function getUTMParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      utmSource: params.get('utm_source') || null,
      utmMedium: params.get('utm_medium') || null,
      utmCampaign: params.get('utm_campaign') || null,
      utmTerm: params.get('utm_term') || null,
      utmContent: params.get('utm_content') || null,
    };
  }

  // Track form open
  async function trackFormOpen(shop, productId, productTitle) {
    try {
      const utm = getUTMParams();
      await fetch(`${API_BASE}/api/track-open`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop,
          productId,
          productTitle,
          ...utm,
          pageUrl: window.location.href,
        }),
      });
    } catch (err) {
      console.warn('Curetfy: Failed to track form open', err);
    }
  }

  // Default config (fallback)
  const DEFAULT_CONFIG = {
    whatsappNumber: "",
    messageTemplate: "",
    labels: {
      name: "Nombre completo",
      phone: "Teléfono / WhatsApp",
      email: "Email (opcional)",
      address: "Dirección de entrega",
      city: "Ciudad",
      province: "Provincia / Estado",
      postalCode: "Código postal",
      notes: "Notas del pedido",
      quantity: "Cantidad"
    },
    placeholders: {
      name: "Juan Pérez",
      phone: "809-555-1234",
      email: "juan@email.com",
      address: "Calle, número, sector...",
      city: "Santo Domingo",
      notes: "Instrucciones especiales...",
      postalCode: "10101"
    },
    fields: {
      showEmail: false,
      showCity: true,
      showProvince: true,
      showPostalCode: false,
      showNotes: true,
      showQuantity: true
    },
    required: {
      email: false,
      city: false,
      province: true,
      postalCode: false,
      notes: false
    },
    modal: {
      title: "Completa tu pedido",
      subtitle: "Ingresa tus datos para recibir tu pedido",
      submitText: "Enviar pedido por WhatsApp",
      submitColor: "#25D366",
      headerColor: "#000000",
      headerTextColor: "#ffffff",
      accentColor: "#25D366",
      showProductImage: true,
      showProductPrice: true
    },
    messages: {
      successTitle: "¡Pedido enviado!",
      successMessage: "Te redirigiremos a WhatsApp para confirmar tu pedido.",
      errorTitle: "Error",
      errorMessage: "Hubo un problema al procesar tu pedido. Intenta de nuevo."
    },
    defaultCountry: "DO",
    autoRedirectWhatsApp: true,
    redirectDelay: 2000,
    // Modal options
    hideCloseButton: false,
    hideFieldLabels: false,
    enableRTL: false,
    fullscreenMobile: true,
    // Shipping
    enableShipping: false,
    customShippingRates: [],
    freeShippingEnabled: false,
    freeShippingThreshold: "2000",
    freeShippingLabel: "Envío gratis",
    enablePickup: false,
    pickupName: "Recoger en tienda",
    pickupAddress: "",
    // COD Fee
    enableCodFee: false,
    codFeeType: "fixed",
    codFeeAmount: "0",
    codFeeLabel: "Cargo por pago contra entrega",
    // Order Limits
    enableMinOrder: false,
    minOrderAmount: "0",
    minOrderMessage: "El monto mínimo de compra es {monto}",
    enableMaxOrder: false,
    maxOrderAmount: "0",
    maxOrderMessage: "El monto máximo de compra es {monto}",
    // Terms
    enableTerms: false,
    termsText: "Acepto los términos y condiciones",
    termsUrl: "",
    termsRequired: true,
    // Blocked Provinces
    enableBlockedProvinces: false,
    blockedProvinces: [],
    blockedProvinceMessage: "Lo sentimos, no realizamos envíos a esta provincia",
    // Custom Fields
    customFields: [],
    fieldOrder: ["name", "phone", "email", "address", "city", "province", "postalCode", "notes"]
  };

  // Static texts
  const TEXTS = {
    selectProvince: "Seleccionar provincia",
    selectCity: "Seleccionar ciudad",
    selectShipping: "Seleccionar envío",
    subtotal: "Subtotal",
    shipping: "Envío",
    codFee: "Cargo COD",
    total: "Total a pagar",
    close: "Cerrar",
    openWhatsapp: "Abrir WhatsApp",
    errorRequired: "Este campo es requerido",
    errorPhone: "Teléfono inválido",
    errorEmail: "Email inválido",
    errorTerms: "Debes aceptar los términos",
    loading: "Procesando...",
    items: "productos",
    item: "producto",
    free: "Gratis",
    freeShippingProgress: "Te faltan {amount} para envío gratis",
    freeShippingAchieved: "¡Tienes envío gratis!",
    deliveryTime: "Entrega: {days}"
  };

  // Initialize
  async function init() {
    const containers = document.querySelectorAll('.curetfy-cod-container');
    if (!containers.length) return;

    const shopDomain = containers[0]?.dataset?.shop;
    if (!shopDomain) return;

    if (!shopConfig) {
      await fetchConfig(shopDomain);
    }

    // Inject custom CSS if provided
    if (shopConfig?.customCss) {
      injectCustomCSS(shopConfig.customCss);
    }

    containers.forEach(container => {
      const btn = container.querySelector('.curetfy-cod-button');
      if (btn && !btn.dataset.curetfyInit) {
        btn.dataset.curetfyInit = 'true';
        btn.addEventListener('click', () => handleButtonClick(container));
      }
    });

    document.addEventListener('click', handleGlobalClick);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && currentModal) closeModal();
    });
  }

  // Inject custom CSS
  function injectCustomCSS(css) {
    if (!css) return;
    const existing = document.getElementById('curetfy-custom-css');
    if (existing) existing.remove();

    const style = document.createElement('style');
    style.id = 'curetfy-custom-css';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Fetch shop config from API
  async function fetchConfig(shopDomain) {
    try {
      const res = await fetch(`${API_BASE}/api/config?shop=${shopDomain}`);
      const data = await res.json();

      if (data.config) {
        shopConfig = { ...DEFAULT_CONFIG, ...data.config };
        shopProvinces = data.provinces || {};
        shopCountries = data.countries || {};
      } else {
        shopConfig = DEFAULT_CONFIG;
      }
    } catch (err) {
      console.warn('Curetfy: Failed to fetch config, using defaults', err);
      shopConfig = DEFAULT_CONFIG;
    }
  }

  // Handle button click
  async function handleButtonClick(container) {
    const data = container.dataset;
    const mode = data.mode || 'product';

    if (mode === 'cart') {
      try {
        const cart = await fetchCart();
        if (cart.items?.length > 0) {
          openCartModal(cart, data);
        } else {
          openProductModal(data);
        }
      } catch (err) {
        console.error('Cart fetch error:', err);
        openProductModal(data);
      }
    } else {
      openProductModal(data);
    }
  }

  // Fetch cart
  async function fetchCart() {
    const res = await fetch('/cart.js');
    return res.json();
  }

  // Open modal for single product
  function openProductModal(data) {
    const items = [{
      id: data.productId,
      title: data.productTitle,
      price: parseFloat(data.productPrice) || 0,
      priceFormatted: data.productPriceFormatted,
      image: data.productImage,
      variantId: data.variantId,
      quantity: 1
    }];
    openModal(items, data);
  }

  // Open modal for cart
  function openCartModal(cart, data) {
    const items = cart.items.map(item => ({
      id: item.product_id,
      title: item.product_title,
      price: item.price / 100,
      priceFormatted: formatCurrency(item.price / 100, cart.currency),
      image: item.image,
      variantId: item.variant_id,
      variantTitle: item.variant_title !== 'Default Title' ? item.variant_title : null,
      quantity: item.quantity
    }));
    openModal(items, { ...data, currency: cart.currency, totalPrice: cart.total_price / 100 });
  }

  // Open modal
  function openModal(items, data) {
    const isMultiple = items.length > 1;
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const currency = data.currency || 'DOP';
    const cfg = shopConfig || DEFAULT_CONFIG;

    // Initialize order state
    orderState = {
      subtotal,
      shipping: 0,
      shippingMethod: null,
      codFee: 0,
      total: subtotal,
      quantity: isMultiple ? null : 1,
      currency
    };

    // Track form open
    trackFormOpen(data.shop, items[0]?.id, items[0]?.title);

    const modal = createModal(items, {
      shop: data.shop,
      currency,
      subtotal,
      isMultiple,
      config: cfg
    });

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    currentModal = modal;

    // Calculate initial totals
    recalculateTotals(modal, cfg);

    // Focus first input
    requestAnimationFrame(() => {
      const firstInput = modal.querySelector('input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"])');
      if (firstInput) firstInput.focus();
    });
  }

  // Close modal
  function closeModal() {
    if (currentModal) {
      currentModal.classList.add('curetfy-closing');
      setTimeout(() => {
        if (currentModal) {
          currentModal.remove();
          currentModal = null;
          document.body.style.overflow = '';
        }
      }, 150);
    }
  }

  // Create modal
  function createModal(items, options) {
    const { shop, currency, subtotal, isMultiple, config } = options;
    const cfg = config;

    const overlay = document.createElement('div');
    overlay.className = 'curetfy-modal-overlay';

    // Add RTL class if enabled
    if (cfg.enableRTL) {
      overlay.classList.add('curetfy-rtl');
    }

    // Add fullscreen mobile class
    if (cfg.fullscreenMobile) {
      overlay.classList.add('curetfy-fullscreen-mobile');
    }

    // Items HTML
    const itemsHTML = isMultiple ? createCartItemsHTML(items, currency, cfg) : createSingleItemHTML(items[0], cfg);

    // Custom HTML Top
    const customHtmlTop = cfg.customHtmlTop ? `<div class="curetfy-custom-html-top">${cfg.customHtmlTop}</div>` : '';

    // Custom HTML Bottom
    const customHtmlBottom = cfg.customHtmlBottom ? `<div class="curetfy-custom-html-bottom">${cfg.customHtmlBottom}</div>` : '';

    // Custom Image
    const customImageHTML = buildCustomImageHTML(cfg);

    // Build form fields
    const formFields = buildFormFields(cfg, isMultiple);

    // Shipping section
    const shippingHTML = buildShippingSection(cfg, subtotal, currency);

    // Terms section
    const termsHTML = buildTermsSection(cfg);

    // Order summary
    const summaryHTML = buildOrderSummary(cfg, currency);

    // Close button
    const closeButtonHTML = cfg.hideCloseButton ? '' : `
      <button type="button" class="curetfy-modal-close" aria-label="${TEXTS.close}">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    `;

    overlay.innerHTML = `
      <div class="curetfy-modal">
        <div class="curetfy-modal-header" style="background-color: ${cfg.modal?.headerColor || '#000'}; color: ${cfg.modal?.headerTextColor || '#fff'}">
          <div class="curetfy-modal-header-text">
            <h2 class="curetfy-modal-title">${cfg.modal?.title || DEFAULT_CONFIG.modal.title}</h2>
            ${cfg.modal?.subtitle ? `<p class="curetfy-modal-subtitle">${cfg.modal.subtitle}</p>` : ''}
          </div>
          ${closeButtonHTML}
        </div>

        <div class="curetfy-modal-content">
          ${customHtmlTop}
          ${cfg.customImagePosition === 'top' ? customImageHTML : ''}
          ${itemsHTML}
          ${cfg.customImagePosition === 'after_product' ? customImageHTML : ''}

          <form class="curetfy-form" id="curetfy-form" novalidate>
            ${formFields}
            ${shippingHTML}
            ${termsHTML}
            ${summaryHTML}
            ${cfg.customImagePosition === 'bottom' ? customImageHTML : ''}
            ${customHtmlBottom}

            <button type="submit" class="curetfy-submit-btn" style="background-color: ${cfg.modal?.submitColor || '#25D366'}">
              <span class="curetfy-submit-text">${cfg.modal?.submitText || DEFAULT_CONFIG.modal.submitText}</span>
              <span class="curetfy-submit-loading" style="display:none;">
                <svg class="curetfy-spinner" viewBox="0 0 24 24" width="18" height="18">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2.5" fill="none" stroke-dasharray="31.4 31.4" stroke-linecap="round"/>
                </svg>
                ${TEXTS.loading}
              </span>
            </button>

            <div class="curetfy-form-error" style="display:none;"></div>
          </form>
        </div>

        <div class="curetfy-success" style="display:none;">
          <svg class="curetfy-success-icon" viewBox="0 0 64 64" width="64" height="64">
            <circle cx="32" cy="32" r="30" fill="${cfg.modal?.accentColor || '#25D366'}"/>
            <path d="M20 32l8 8 16-16" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h3>${cfg.messages?.successTitle || DEFAULT_CONFIG.messages.successTitle}</h3>
          <p>${cfg.messages?.successMessage || DEFAULT_CONFIG.messages.successMessage}</p>
          <a href="#" class="curetfy-whatsapp-link" target="_blank" rel="noopener" style="background-color: ${cfg.modal?.submitColor || '#25D366'}">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            ${TEXTS.openWhatsapp}
          </a>
        </div>
      </div>
    `;

    // Store data
    overlay.dataset.shop = shop;
    overlay.dataset.currency = currency;
    overlay.dataset.items = JSON.stringify(items);
    overlay.dataset.subtotal = subtotal;
    overlay.dataset.isMultiple = isMultiple;
    overlay.dataset.config = JSON.stringify(cfg);

    setupModalEvents(overlay, items, currency, isMultiple, cfg);

    return overlay;
  }

  // Build custom image HTML
  function buildCustomImageHTML(cfg) {
    if (!cfg.customImageUrl || cfg.customImagePosition === 'none') return '';
    return `
      <div class="curetfy-custom-image">
        <img src="${cfg.customImageUrl}" alt="" loading="lazy">
      </div>
    `;
  }

  // Build form fields HTML based on config and field order
  function buildFormFields(cfg, isMultiple) {
    const labels = cfg.labels || DEFAULT_CONFIG.labels;
    const placeholders = cfg.placeholders || DEFAULT_CONFIG.placeholders;
    const fields = cfg.fields || DEFAULT_CONFIG.fields;
    const required = cfg.required || DEFAULT_CONFIG.required;
    const hideLabels = cfg.hideFieldLabels || false;
    const fieldOrder = cfg.fieldOrder || DEFAULT_CONFIG.fieldOrder;
    const customFields = cfg.customFields || [];

    let html = '';

    // Build fields according to order
    const fieldBuilders = {
      name: () => buildTextField('name', labels.name, placeholders.name, true, hideLabels),
      phone: () => buildTextField('phone', labels.phone, placeholders.phone, true, hideLabels, 'tel'),
      email: () => fields.showEmail ? buildTextField('email', labels.email, placeholders.email, required.email, hideLabels, 'email') : '',
      address: () => buildTextArea('address', labels.address, placeholders.address, true, hideLabels),
      city: () => fields.showCity ? buildTextField('city', labels.city, placeholders.city, required.city, hideLabels) : '',
      province: () => fields.showProvince ? buildProvinceSelect(cfg, labels.province, required.province, hideLabels) : '',
      postalCode: () => fields.showPostalCode ? buildTextField('postal', labels.postalCode, placeholders.postalCode, required.postalCode, hideLabels) : '',
      notes: () => fields.showNotes ? buildTextArea('notes', labels.notes, placeholders.notes, required.notes, hideLabels) : '',
      quantity: () => !isMultiple && fields.showQuantity ? buildQuantityField(labels.quantity, hideLabels) : ''
    };

    // Add fields in order
    fieldOrder.forEach(fieldName => {
      if (fieldBuilders[fieldName]) {
        html += fieldBuilders[fieldName]();
      }
    });

    // Add custom fields
    customFields.forEach(field => {
      html += buildCustomField(field, hideLabels);
    });

    return html;
  }

  // Build text field
  function buildTextField(id, label, placeholder, isRequired, hideLabel, type = 'text') {
    return `
      <div class="curetfy-form-group">
        ${!hideLabel ? `<label for="curetfy-${id}">${label}${isRequired ? ' *' : ''}</label>` : ''}
        <input type="${type}" id="curetfy-${id}" name="${id}" ${isRequired ? 'required' : ''}
               autocomplete="${getAutocomplete(id)}" placeholder="${hideLabel ? label : placeholder}">
        <span class="curetfy-error"></span>
      </div>
    `;
  }

  // Build textarea
  function buildTextArea(id, label, placeholder, isRequired, hideLabel) {
    return `
      <div class="curetfy-form-group">
        ${!hideLabel ? `<label for="curetfy-${id}">${label}${isRequired ? ' *' : ''}</label>` : ''}
        <textarea id="curetfy-${id}" name="${id}" ${isRequired ? 'required' : ''}
                  autocomplete="${getAutocomplete(id)}" placeholder="${hideLabel ? label : placeholder}" rows="2"></textarea>
        <span class="curetfy-error"></span>
      </div>
    `;
  }

  // Build province select
  function buildProvinceSelect(cfg, label, isRequired, hideLabel) {
    const provinces = shopProvinces?.[cfg.defaultCountry || 'DO'] || [];
    const blockedProvs = cfg.enableBlockedProvinces ? (cfg.blockedProvinces || []) : [];

    const options = provinces
      .filter(p => !blockedProvs.includes(p.value))
      .map(p => `<option value="${p.value}">${p.label}</option>`)
      .join('');

    return `
      <div class="curetfy-form-group">
        ${!hideLabel ? `<label for="curetfy-province">${label}${isRequired ? ' *' : ''}</label>` : ''}
        <select id="curetfy-province" name="province" ${isRequired ? 'required' : ''}>
          <option value="">${hideLabel ? label : TEXTS.selectProvince}</option>
          ${options}
        </select>
        <span class="curetfy-error"></span>
      </div>
    `;
  }

  // Build quantity field
  function buildQuantityField(label, hideLabel) {
    return `
      <div class="curetfy-form-group curetfy-quantity-group">
        ${!hideLabel ? `<label>${label}</label>` : ''}
        <div class="curetfy-quantity-wrap">
          <button type="button" class="curetfy-qty-btn" data-action="decrease">−</button>
          <input type="number" id="curetfy-quantity" name="quantity" min="1" max="99" value="1" readonly>
          <button type="button" class="curetfy-qty-btn" data-action="increase">+</button>
        </div>
      </div>
    `;
  }

  // Build custom field
  function buildCustomField(field, hideLabel) {
    const id = `curetfy-custom-${field.id}`;
    const reqAttr = field.required ? 'required' : '';
    const labelHTML = !hideLabel ? `<label for="${id}">${field.label}${field.required ? ' *' : ''}</label>` : '';

    switch (field.type) {
      case 'text':
        return `
          <div class="curetfy-form-group">
            ${labelHTML}
            <input type="text" id="${id}" name="custom_${field.id}" ${reqAttr} placeholder="${field.placeholder || ''}">
            <span class="curetfy-error"></span>
          </div>
        `;
      case 'textarea':
        return `
          <div class="curetfy-form-group">
            ${labelHTML}
            <textarea id="${id}" name="custom_${field.id}" ${reqAttr} placeholder="${field.placeholder || ''}" rows="2"></textarea>
            <span class="curetfy-error"></span>
          </div>
        `;
      case 'select':
        const opts = (field.options || []).map(o => `<option value="${o}">${o}</option>`).join('');
        return `
          <div class="curetfy-form-group">
            ${labelHTML}
            <select id="${id}" name="custom_${field.id}" ${reqAttr}>
              <option value="">Seleccionar...</option>
              ${opts}
            </select>
            <span class="curetfy-error"></span>
          </div>
        `;
      case 'radio':
        const radios = (field.options || []).map((o, i) => `
          <label class="curetfy-radio-label">
            <input type="radio" name="custom_${field.id}" value="${o}" ${i === 0 && field.required ? 'required' : ''}>
            <span>${o}</span>
          </label>
        `).join('');
        return `
          <div class="curetfy-form-group curetfy-radio-group">
            ${labelHTML}
            <div class="curetfy-radio-options">${radios}</div>
            <span class="curetfy-error"></span>
          </div>
        `;
      case 'checkbox':
        return `
          <div class="curetfy-form-group curetfy-checkbox-group">
            <label class="curetfy-checkbox-label">
              <input type="checkbox" id="${id}" name="custom_${field.id}" ${reqAttr}>
              <span>${field.label}</span>
            </label>
            <span class="curetfy-error"></span>
          </div>
        `;
      case 'date':
        return `
          <div class="curetfy-form-group">
            ${labelHTML}
            <input type="date" id="${id}" name="custom_${field.id}" ${reqAttr}>
            <span class="curetfy-error"></span>
          </div>
        `;
      case 'number':
        return `
          <div class="curetfy-form-group">
            ${labelHTML}
            <input type="number" id="${id}" name="custom_${field.id}" ${reqAttr} placeholder="${field.placeholder || ''}">
            <span class="curetfy-error"></span>
          </div>
        `;
      case 'heading':
        return `<h3 class="curetfy-form-heading">${field.label}</h3>`;
      case 'image':
        return field.imageUrl ? `<div class="curetfy-form-image"><img src="${field.imageUrl}" alt="${field.label || ''}" loading="lazy"></div>` : '';
      case 'link_button':
        return field.url ? `
          <a href="${field.url}" target="_blank" rel="noopener" class="curetfy-form-link-button">${field.label}</a>
        ` : '';
      default:
        return '';
    }
  }

  // Get autocomplete attribute
  function getAutocomplete(field) {
    const map = {
      name: 'name',
      phone: 'tel',
      email: 'email',
      address: 'street-address',
      city: 'address-level2',
      postal: 'postal-code'
    };
    return map[field] || 'off';
  }

  // Build shipping section
  function buildShippingSection(cfg, subtotal, currency) {
    if (!cfg.enableShipping && !cfg.enablePickup) return '';

    const threshold = parseFloat(cfg.freeShippingThreshold) || 0;
    const qualifiesForFree = cfg.freeShippingEnabled && subtotal >= threshold;
    const amountToFree = threshold - subtotal;
    const progress = Math.min(100, (subtotal / threshold) * 100);

    let html = '<div class="curetfy-shipping-section">';
    html += '<h3 class="curetfy-section-title">Método de envío</h3>';

    // Free shipping progress bar
    if (cfg.freeShippingEnabled && !qualifiesForFree && threshold > 0) {
      html += `
        <div class="curetfy-free-shipping-bar">
          <p class="curetfy-free-shipping-text">${TEXTS.freeShippingProgress.replace('{amount}', formatCurrency(amountToFree, currency))}</p>
          <div class="curetfy-progress-track">
            <div class="curetfy-progress-fill" style="width: ${progress}%; background: ${cfg.modal?.accentColor || '#25D366'}"></div>
          </div>
        </div>
      `;
    } else if (cfg.freeShippingEnabled && qualifiesForFree) {
      html += `
        <div class="curetfy-free-shipping-achieved">
          <span>🎉</span> ${TEXTS.freeShippingAchieved}
        </div>
      `;
    }

    // Shipping options container
    html += '<div class="curetfy-shipping-options">';

    // Store Pickup option
    if (cfg.enablePickup) {
      html += `
        <label class="curetfy-shipping-option">
          <input type="radio" name="shipping_method" value="pickup" data-price="0">
          <div class="curetfy-shipping-option-content">
            <div class="curetfy-shipping-option-info">
              <span class="curetfy-shipping-name">${cfg.pickupName || 'Recoger en tienda'}</span>
              ${cfg.pickupAddress ? `<span class="curetfy-shipping-details">${cfg.pickupAddress}</span>` : ''}
            </div>
            <span class="curetfy-shipping-price">${TEXTS.free}</span>
          </div>
        </label>
      `;
    }

    // Free shipping option (when qualified)
    if (cfg.freeShippingEnabled && qualifiesForFree) {
      html += `
        <label class="curetfy-shipping-option curetfy-shipping-free">
          <input type="radio" name="shipping_method" value="free_shipping" data-price="0" checked>
          <div class="curetfy-shipping-option-content">
            <div class="curetfy-shipping-option-info">
              <span class="curetfy-shipping-name">${cfg.freeShippingLabel || 'Envío gratis'}</span>
            </div>
            <span class="curetfy-shipping-price curetfy-price-free">${TEXTS.free}</span>
          </div>
        </label>
      `;
    }

    // Custom shipping rates
    const rates = cfg.customShippingRates || [];
    rates.forEach((rate, index) => {
      const price = parseFloat(rate.price) || 0;
      const isFree = price === 0;
      const isFirst = index === 0 && !cfg.enablePickup && !(cfg.freeShippingEnabled && qualifiesForFree);

      html += `
        <label class="curetfy-shipping-option">
          <input type="radio" name="shipping_method" value="rate_${index}" data-price="${price}" ${isFirst ? 'checked' : ''}>
          <div class="curetfy-shipping-option-content">
            <div class="curetfy-shipping-option-info">
              <span class="curetfy-shipping-name">${rate.name || 'Envío estándar'}</span>
              ${rate.deliveryDays ? `<span class="curetfy-shipping-details">${TEXTS.deliveryTime.replace('{days}', rate.deliveryDays)}</span>` : ''}
            </div>
            <span class="curetfy-shipping-price ${isFree ? 'curetfy-price-free' : ''}">${isFree ? TEXTS.free : formatCurrency(price, currency)}</span>
          </div>
        </label>
      `;
    });

    html += '</div></div>';
    return html;
  }

  // Build terms section
  function buildTermsSection(cfg) {
    if (!cfg.enableTerms) return '';

    const termsLink = cfg.termsUrl
      ? `<a href="${cfg.termsUrl}" target="_blank" rel="noopener">${cfg.termsText}</a>`
      : cfg.termsText;

    return `
      <div class="curetfy-terms-section">
        <label class="curetfy-checkbox-label curetfy-terms-label">
          <input type="checkbox" id="curetfy-terms" name="terms" ${cfg.termsRequired ? 'required' : ''}>
          <span>${termsLink}</span>
        </label>
        <span class="curetfy-error" id="curetfy-terms-error"></span>
      </div>
    `;
  }

  // Build order summary
  function buildOrderSummary(cfg, currency) {
    let html = '<div class="curetfy-order-summary">';

    // Subtotal
    html += `
      <div class="curetfy-summary-row">
        <span>${TEXTS.subtotal}</span>
        <span class="curetfy-subtotal-amount">${formatCurrency(0, currency)}</span>
      </div>
    `;

    // Shipping (if enabled)
    if (cfg.enableShipping || cfg.enablePickup) {
      html += `
        <div class="curetfy-summary-row curetfy-shipping-row">
          <span>${TEXTS.shipping}</span>
          <span class="curetfy-shipping-amount">${formatCurrency(0, currency)}</span>
        </div>
      `;
    }

    // COD Fee (if enabled)
    if (cfg.enableCodFee) {
      html += `
        <div class="curetfy-summary-row curetfy-cod-fee-row">
          <span>${cfg.codFeeLabel || TEXTS.codFee}</span>
          <span class="curetfy-cod-fee-amount">${formatCurrency(0, currency)}</span>
        </div>
      `;
    }

    // Total
    html += `
      <div class="curetfy-summary-row curetfy-total-row">
        <span>${TEXTS.total}</span>
        <span class="curetfy-total-amount">${formatCurrency(0, currency)}</span>
      </div>
    `;

    html += '</div>';
    return html;
  }

  // Create single item HTML
  function createSingleItemHTML(item, cfg) {
    const showImage = cfg.modal?.showProductImage !== false;
    const showPrice = cfg.modal?.showProductPrice !== false;

    return `
      <div class="curetfy-product-summary">
        ${showImage ? `<img class="curetfy-product-image" src="${item.image || ''}" alt="${item.title}" loading="lazy">` : ''}
        <div class="curetfy-product-info">
          <p class="curetfy-product-title">${item.title}</p>
          ${showPrice ? `<p class="curetfy-product-price">${item.priceFormatted}</p>` : ''}
        </div>
      </div>
    `;
  }

  // Create cart items HTML
  function createCartItemsHTML(items, currency, cfg) {
    const showImage = cfg.modal?.showProductImage !== false;
    const showPrice = cfg.modal?.showProductPrice !== false;
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const label = count === 1 ? TEXTS.item : TEXTS.items;

    return `
      <div class="curetfy-cart-items">
        <p class="curetfy-cart-count">${count} ${label}</p>
        ${items.map(item => `
          <div class="curetfy-cart-item">
            ${showImage ? `<img class="curetfy-cart-item-image" src="${item.image || ''}" alt="${item.title}" loading="lazy">` : ''}
            <div class="curetfy-cart-item-info">
              <p class="curetfy-cart-item-title">${item.title}</p>
              ${showPrice ? `<p class="curetfy-cart-item-details">${item.variantTitle ? `${item.variantTitle} · ` : ''}${item.quantity}x ${item.priceFormatted}</p>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Setup modal events
  function setupModalEvents(modal, items, currency, isMultiple, cfg) {
    // Quantity controls
    if (!isMultiple && cfg.fields?.showQuantity !== false) {
      const qtyInput = modal.querySelector('#curetfy-quantity');
      if (qtyInput) {
        modal.querySelectorAll('.curetfy-qty-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const current = parseInt(qtyInput.value) || 1;
            if (btn.dataset.action === 'increase' && current < 99) {
              qtyInput.value = current + 1;
              orderState.quantity = current + 1;
            } else if (btn.dataset.action === 'decrease' && current > 1) {
              qtyInput.value = current - 1;
              orderState.quantity = current - 1;
            }
            recalculateTotals(modal, cfg);
          });
        });
      }
    }

    // Shipping method selection
    modal.querySelectorAll('input[name="shipping_method"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const price = parseFloat(radio.dataset.price) || 0;
        orderState.shipping = price;
        orderState.shippingMethod = radio.value;
        recalculateTotals(modal, cfg);
      });

      // Set initial selection
      if (radio.checked) {
        orderState.shipping = parseFloat(radio.dataset.price) || 0;
        orderState.shippingMethod = radio.value;
      }
    });

    // Province change - check blocked
    const provinceSelect = modal.querySelector('#curetfy-province');
    if (provinceSelect && cfg.enableBlockedProvinces) {
      provinceSelect.addEventListener('change', () => {
        validateProvince(modal, cfg);
      });
    }

    // Form submit
    const form = modal.querySelector('#curetfy-form');
    if (form) {
      form.addEventListener('submit', e => handleSubmit(e, modal));
    }
  }

  // Recalculate totals
  function recalculateTotals(modal, cfg) {
    const items = JSON.parse(modal.dataset.items || '[]');
    const currency = modal.dataset.currency || 'DOP';
    const isMultiple = modal.dataset.isMultiple === 'true';

    // Calculate subtotal
    let subtotal;
    if (isMultiple) {
      subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    } else {
      const qty = orderState.quantity || 1;
      subtotal = items[0].price * qty;
    }
    orderState.subtotal = subtotal;

    // Calculate COD fee
    let codFee = 0;
    if (cfg.enableCodFee) {
      const amount = parseFloat(cfg.codFeeAmount) || 0;
      if (cfg.codFeeType === 'percentage') {
        codFee = subtotal * (amount / 100);
      } else {
        codFee = amount;
      }
    }
    orderState.codFee = codFee;

    // Calculate total
    orderState.total = subtotal + orderState.shipping + codFee;

    // Update UI
    const subtotalEl = modal.querySelector('.curetfy-subtotal-amount');
    const shippingEl = modal.querySelector('.curetfy-shipping-amount');
    const codFeeEl = modal.querySelector('.curetfy-cod-fee-amount');
    const totalEl = modal.querySelector('.curetfy-total-amount');

    if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal, currency);
    if (shippingEl) shippingEl.textContent = orderState.shipping === 0 ? TEXTS.free : formatCurrency(orderState.shipping, currency);
    if (codFeeEl) codFeeEl.textContent = formatCurrency(codFee, currency);
    if (totalEl) totalEl.textContent = formatCurrency(orderState.total, currency);

    // Update free shipping progress if needed
    updateFreeShippingProgress(modal, cfg, subtotal, currency);
  }

  // Update free shipping progress
  function updateFreeShippingProgress(modal, cfg, subtotal, currency) {
    if (!cfg.freeShippingEnabled) return;

    const threshold = parseFloat(cfg.freeShippingThreshold) || 0;
    const qualifies = subtotal >= threshold;
    const amountToFree = threshold - subtotal;
    const progress = Math.min(100, (subtotal / threshold) * 100);

    const progressBar = modal.querySelector('.curetfy-free-shipping-bar');
    const achieved = modal.querySelector('.curetfy-free-shipping-achieved');
    const freeOption = modal.querySelector('input[value="free_shipping"]');

    if (qualifies) {
      if (progressBar) progressBar.style.display = 'none';
      if (achieved) achieved.style.display = 'flex';
      if (freeOption) {
        freeOption.closest('.curetfy-shipping-option').style.display = 'flex';
        freeOption.checked = true;
        orderState.shipping = 0;
        orderState.shippingMethod = 'free_shipping';
      }
    } else {
      if (progressBar) {
        progressBar.style.display = 'block';
        const text = progressBar.querySelector('.curetfy-free-shipping-text');
        const fill = progressBar.querySelector('.curetfy-progress-fill');
        if (text) text.textContent = TEXTS.freeShippingProgress.replace('{amount}', formatCurrency(amountToFree, currency));
        if (fill) fill.style.width = `${progress}%`;
      }
      if (achieved) achieved.style.display = 'none';
      if (freeOption) {
        freeOption.closest('.curetfy-shipping-option').style.display = 'none';
        if (freeOption.checked) {
          // Select first available option
          const firstOption = modal.querySelector('input[name="shipping_method"]:not([value="free_shipping"])');
          if (firstOption) {
            firstOption.checked = true;
            orderState.shipping = parseFloat(firstOption.dataset.price) || 0;
            orderState.shippingMethod = firstOption.value;
          }
        }
      }
    }
  }

  // Validate province (blocked check)
  function validateProvince(modal, cfg) {
    const provinceSelect = modal.querySelector('#curetfy-province');
    if (!provinceSelect || !cfg.enableBlockedProvinces) return true;

    const selectedProvince = provinceSelect.value;
    const blockedProvs = cfg.blockedProvinces || [];

    if (blockedProvs.includes(selectedProvince)) {
      showFieldError(provinceSelect, cfg.blockedProvinceMessage || DEFAULT_CONFIG.blockedProvinceMessage);
      return false;
    }

    clearFieldError(provinceSelect);
    return true;
  }

  // Format currency
  function formatCurrency(amount, currency) {
    try {
      return new Intl.NumberFormat('es-DO', { style: 'currency', currency }).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  }

  // Handle form submit
  async function handleSubmit(e, modal) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('.curetfy-submit-btn');
    const submitText = submitBtn.querySelector('.curetfy-submit-text');
    const submitLoading = submitBtn.querySelector('.curetfy-submit-loading');
    const formError = form.querySelector('.curetfy-form-error');
    const cfg = JSON.parse(modal.dataset.config || '{}');
    const currency = modal.dataset.currency || 'DOP';

    // Clear errors
    form.querySelectorAll('.curetfy-error').forEach(el => el.textContent = '');
    form.querySelectorAll('.curetfy-form-group--error').forEach(el => el.classList.remove('curetfy-form-group--error'));
    if (formError) formError.style.display = 'none';

    // Validate required fields
    let valid = true;
    const requiredFields = ['name', 'phone', 'address'];

    // Add conditional required fields
    if (cfg.required?.email && cfg.fields?.showEmail) requiredFields.push('email');
    if (cfg.required?.city && cfg.fields?.showCity) requiredFields.push('city');
    if (cfg.required?.province && cfg.fields?.showProvince) requiredFields.push('province');
    if (cfg.required?.postalCode && cfg.fields?.showPostalCode) requiredFields.push('postal');
    if (cfg.required?.notes && cfg.fields?.showNotes) requiredFields.push('notes');

    requiredFields.forEach(fieldId => {
      const input = form.querySelector(`#curetfy-${fieldId}`);
      if (input && !input.value.trim()) {
        showFieldError(input, TEXTS.errorRequired);
        valid = false;
      }
    });

    // Validate phone
    const phone = form.querySelector('#curetfy-phone');
    if (phone && !isValidPhone(phone.value)) {
      showFieldError(phone, TEXTS.errorPhone);
      valid = false;
    }

    // Validate email if shown
    const email = form.querySelector('#curetfy-email');
    if (email && email.value && !isValidEmail(email.value)) {
      showFieldError(email, TEXTS.errorEmail);
      valid = false;
    }

    // Validate province (blocked check)
    if (cfg.enableBlockedProvinces && !validateProvince(modal, cfg)) {
      valid = false;
    }

    // Validate terms
    if (cfg.enableTerms && cfg.termsRequired) {
      const terms = form.querySelector('#curetfy-terms');
      if (terms && !terms.checked) {
        const termsError = form.querySelector('#curetfy-terms-error');
        if (termsError) termsError.textContent = TEXTS.errorTerms;
        valid = false;
      }
    }

    // Validate custom required fields
    const customFields = cfg.customFields || [];
    customFields.forEach(field => {
      if (field.required) {
        const input = form.querySelector(`[name="custom_${field.id}"]`);
        if (input && !input.value && input.type !== 'checkbox') {
          showFieldError(input, TEXTS.errorRequired);
          valid = false;
        }
        if (input && input.type === 'checkbox' && !input.checked) {
          showFieldError(input, TEXTS.errorRequired);
          valid = false;
        }
      }
    });

    // Validate order limits
    if (cfg.enableMinOrder) {
      const minAmount = parseFloat(cfg.minOrderAmount) || 0;
      if (orderState.subtotal < minAmount) {
        const msg = (cfg.minOrderMessage || DEFAULT_CONFIG.minOrderMessage).replace('{monto}', formatCurrency(minAmount, currency));
        showFormError(formError, msg);
        valid = false;
      }
    }

    if (cfg.enableMaxOrder) {
      const maxAmount = parseFloat(cfg.maxOrderAmount) || 0;
      if (maxAmount > 0 && orderState.subtotal > maxAmount) {
        const msg = (cfg.maxOrderMessage || DEFAULT_CONFIG.maxOrderMessage).replace('{monto}', formatCurrency(maxAmount, currency));
        showFormError(formError, msg);
        valid = false;
      }
    }

    // Validate shipping selection
    if ((cfg.enableShipping || cfg.enablePickup) && !orderState.shippingMethod) {
      showFormError(formError, TEXTS.selectShipping);
      valid = false;
    }

    if (!valid) return;

    // Submit
    submitBtn.disabled = true;
    submitText.style.display = 'none';
    submitLoading.style.display = 'inline-flex';

    const items = JSON.parse(modal.dataset.items || '[]');
    const isMultiple = modal.dataset.isMultiple === 'true';
    const quantity = isMultiple ? null : orderState.quantity || 1;

    // Get UTM params
    const utm = getUTMParams();

    // Collect custom field values
    const customFieldValues = {};
    customFields.forEach(field => {
      const input = form.querySelector(`[name="custom_${field.id}"]`);
      if (input) {
        customFieldValues[field.id] = input.type === 'checkbox' ? input.checked : input.value;
      }
    });

    const payload = {
      shop: modal.dataset.shop,
      items: items.map(item => ({
        productId: item.id,
        productTitle: item.title,
        variantId: item.variantId,
        quantity: isMultiple ? item.quantity : quantity,
        price: item.price,
        image: item.image
      })),
      currency,
      subtotal: orderState.subtotal,
      shipping: orderState.shipping,
      shippingMethod: orderState.shippingMethod,
      codFee: orderState.codFee,
      total: orderState.total,
      customer: {
        name: form.querySelector('#curetfy-name')?.value.trim() || '',
        phone: form.querySelector('#curetfy-phone')?.value.trim() || '',
        email: form.querySelector('#curetfy-email')?.value.trim() || '',
        address: form.querySelector('#curetfy-address')?.value.trim() || '',
        city: form.querySelector('#curetfy-city')?.value.trim() || '',
        province: form.querySelector('#curetfy-province')?.value || '',
        postalCode: form.querySelector('#curetfy-postal')?.value.trim() || '',
        notes: form.querySelector('#curetfy-notes')?.value.trim() || '',
        country: cfg.defaultCountry || 'DO'
      },
      customFields: customFieldValues,
      // UTM tracking
      utmSource: utm.utmSource,
      utmMedium: utm.utmMedium,
      utmCampaign: utm.utmCampaign,
      utmTerm: utm.utmTerm,
      utmContent: utm.utmContent
    };

    try {
      const res = await fetch(`${API_BASE}/api/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (result.success && result.data?.whatsappLink) {
        // Hide form, show success
        modal.querySelector('.curetfy-modal-content').style.display = 'none';
        const success = modal.querySelector('.curetfy-success');
        const waLink = success.querySelector('.curetfy-whatsapp-link');
        waLink.href = result.data.whatsappLink;
        success.style.display = 'block';

        // Fire Facebook Pixel event if enabled
        if (cfg.enablePixel && cfg.pixelId && window.fbq) {
          window.fbq('track', 'Purchase', {
            value: orderState.total,
            currency: currency
          });
        }

        // Auto redirect to WhatsApp
        if (cfg.autoRedirectWhatsApp !== false) {
          setTimeout(() => {
            window.open(result.data.whatsappLink, '_blank');
          }, cfg.redirectDelay || 2000);
        }
      } else {
        showFormError(formError, cfg.messages?.errorMessage || result.error || DEFAULT_CONFIG.messages.errorMessage);
        resetSubmitButton();
      }
    } catch (err) {
      console.error('Curetfy error:', err);
      showFormError(formError, cfg.messages?.errorMessage || DEFAULT_CONFIG.messages.errorMessage);
      resetSubmitButton();
    }

    function resetSubmitButton() {
      submitBtn.disabled = false;
      submitText.style.display = 'inline';
      submitLoading.style.display = 'none';
    }
  }

  // Show field error
  function showFieldError(input, message) {
    const group = input.closest('.curetfy-form-group') || input.closest('.curetfy-terms-section');
    if (group) {
      group.classList.add('curetfy-form-group--error');
      const errorEl = group.querySelector('.curetfy-error');
      if (errorEl) errorEl.textContent = message;
    }
  }

  // Clear field error
  function clearFieldError(input) {
    const group = input.closest('.curetfy-form-group');
    if (group) {
      group.classList.remove('curetfy-form-group--error');
      const errorEl = group.querySelector('.curetfy-error');
      if (errorEl) errorEl.textContent = '';
    }
  }

  // Show form error
  function showFormError(errorEl, message) {
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
  }

  // Validate phone
  function isValidPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  }

  // Validate email
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Handle global clicks
  function handleGlobalClick(e) {
    if (e.target.closest('.curetfy-modal-close')) {
      closeModal();
    } else if (e.target.classList.contains('curetfy-modal-overlay')) {
      closeModal();
    }
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-init on dynamic content
  const observer = new MutationObserver(() => init());
  observer.observe(document.body, { childList: true, subtree: true });
})();
