/**
 * Curetfy COD Form
 * Professional WhatsApp Order System
 * @version 3.0.0
 */
(function() {
  'use strict';

  const API_BASE = 'https://app.curetcore.com';

  // Config cache
  let shopConfig = null;
  let shopProvinces = null;
  let shopCountries = null;
  let currentModal = null;

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
      // Silently fail - analytics shouldn't block user experience
      console.warn('Curetfy: Failed to track form open', err);
    }
  }

  // Default config (fallback)
  const DEFAULT_CONFIG = {
    whatsappNumber: "",
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
      name: "Ej: Juan Pérez",
      phone: "Ej: 809-555-1234",
      email: "Ej: juan@email.com",
      address: "Calle, número, sector...",
      city: "Ej: Santo Domingo",
      notes: "Instrucciones especiales...",
      postalCode: "Ej: 10101"
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
    redirectDelay: 2000
  };

  // Static texts
  const TEXTS = {
    selectProvince: "Seleccionar provincia",
    selectCity: "Seleccionar ciudad",
    total: "Total a pagar",
    close: "Cerrar",
    openWhatsapp: "Abrir WhatsApp",
    errorRequired: "Este campo es requerido",
    errorPhone: "Teléfono inválido",
    loading: "Procesando...",
    items: "productos",
    item: "producto"
  };

  // Initialize
  async function init() {
    const containers = document.querySelectorAll('.curetfy-cod-container');
    if (!containers.length) return;

    // Get shop domain from first container
    const shopDomain = containers[0]?.dataset?.shop;
    if (!shopDomain) return;

    // Fetch config if not cached
    if (!shopConfig) {
      await fetchConfig(shopDomain);
    }

    // Setup buttons
    containers.forEach(container => {
      const btn = container.querySelector('.curetfy-cod-button');
      if (btn && !btn.dataset.curetfyInit) {
        btn.dataset.curetfyInit = 'true';
        btn.addEventListener('click', () => handleButtonClick(container));
      }
    });

    // Global handlers
    document.addEventListener('click', handleGlobalClick);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && currentModal) closeModal();
    });
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
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const currency = data.currency || 'DOP';
    const cfg = shopConfig || DEFAULT_CONFIG;

    // Track form open (async, non-blocking)
    trackFormOpen(data.shop, items[0]?.id, items[0]?.title);

    const modal = createModal(items, {
      shop: data.shop,
      currency,
      totalPrice,
      isMultiple,
      config: cfg
    });

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    currentModal = modal;

    // Focus first input
    requestAnimationFrame(() => {
      const firstInput = modal.querySelector('#curetfy-name');
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
    const { shop, currency, totalPrice, isMultiple, config } = options;
    const cfg = config;

    const overlay = document.createElement('div');
    overlay.className = 'curetfy-modal-overlay';

    // Items HTML
    const itemsHTML = isMultiple ? createCartItemsHTML(items, currency, cfg) : createSingleItemHTML(items[0], cfg);

    // Build form fields
    const formFields = buildFormFields(cfg, isMultiple);

    overlay.innerHTML = `
      <div class="curetfy-modal">
        <div class="curetfy-modal-header" style="background-color: ${cfg.modal?.headerColor || '#000'}">
          <div class="curetfy-modal-header-text">
            <h2 class="curetfy-modal-title">${cfg.modal?.title || DEFAULT_CONFIG.modal.title}</h2>
            ${cfg.modal?.subtitle ? `<p class="curetfy-modal-subtitle">${cfg.modal.subtitle}</p>` : ''}
          </div>
          <button type="button" class="curetfy-modal-close" aria-label="${TEXTS.close}">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div class="curetfy-modal-content">
          ${itemsHTML}

          <form class="curetfy-form" id="curetfy-form">
            ${formFields}

            <div class="curetfy-total-row">
              <span>${TEXTS.total}</span>
              <span class="curetfy-total-amount">${formatCurrency(totalPrice, currency)}</span>
            </div>

            <button type="submit" class="curetfy-submit-btn" style="background-color: ${cfg.modal?.submitColor || '#25D366'}">
              <span class="curetfy-submit-text">${cfg.modal?.submitText || DEFAULT_CONFIG.modal.submitText}</span>
              <span class="curetfy-submit-loading" style="display:none;">
                <svg class="curetfy-spinner" viewBox="0 0 24 24" width="18" height="18">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2.5" fill="none" stroke-dasharray="31.4 31.4" stroke-linecap="round"/>
                </svg>
                ${TEXTS.loading}
              </span>
            </button>
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
    overlay.dataset.totalPrice = totalPrice;
    overlay.dataset.isMultiple = isMultiple;
    overlay.dataset.config = JSON.stringify(cfg);

    setupModalEvents(overlay, items, currency, isMultiple, cfg);

    return overlay;
  }

  // Build form fields HTML based on config
  function buildFormFields(cfg, isMultiple) {
    const labels = cfg.labels || DEFAULT_CONFIG.labels;
    const placeholders = cfg.placeholders || DEFAULT_CONFIG.placeholders;
    const fields = cfg.fields || DEFAULT_CONFIG.fields;
    const required = cfg.required || DEFAULT_CONFIG.required;

    let html = '';

    // Name (always visible, always required)
    html += `
      <div class="curetfy-form-group">
        <label for="curetfy-name">${labels.name}</label>
        <input type="text" id="curetfy-name" name="name" required autocomplete="name" placeholder="${placeholders.name}">
        <span class="curetfy-error"></span>
      </div>
    `;

    // Phone (always visible, always required)
    html += `
      <div class="curetfy-form-group">
        <label for="curetfy-phone">${labels.phone}</label>
        <input type="tel" id="curetfy-phone" name="phone" required autocomplete="tel" placeholder="${placeholders.phone}">
        <span class="curetfy-error"></span>
      </div>
    `;

    // Email (conditional)
    if (fields.showEmail) {
      html += `
        <div class="curetfy-form-group">
          <label for="curetfy-email">${labels.email}</label>
          <input type="email" id="curetfy-email" name="email" ${required.email ? 'required' : ''} autocomplete="email" placeholder="${placeholders.email}">
          <span class="curetfy-error"></span>
        </div>
      `;
    }

    // Address (always visible, always required)
    html += `
      <div class="curetfy-form-group">
        <label for="curetfy-address">${labels.address}</label>
        <textarea id="curetfy-address" name="address" required autocomplete="street-address" placeholder="${placeholders.address}" rows="2"></textarea>
        <span class="curetfy-error"></span>
      </div>
    `;

    // City (conditional)
    if (fields.showCity) {
      html += `
        <div class="curetfy-form-group">
          <label for="curetfy-city">${labels.city}</label>
          <input type="text" id="curetfy-city" name="city" ${required.city ? 'required' : ''} autocomplete="address-level2" placeholder="${placeholders.city}">
          <span class="curetfy-error"></span>
        </div>
      `;
    }

    // Province row (with quantity if single product)
    const provinceClass = !isMultiple && fields.showQuantity ? 'curetfy-form-half' : '';
    const hasProvince = fields.showProvince;
    const hasQuantity = !isMultiple && fields.showQuantity;

    if (hasProvince || hasQuantity) {
      html += '<div class="curetfy-form-row">';

      if (hasProvince) {
        const provinces = shopProvinces?.[cfg.defaultCountry || 'DO'] || [];
        html += `
          <div class="curetfy-form-group ${provinceClass}">
            <label for="curetfy-province">${labels.province}</label>
            <select id="curetfy-province" name="province" ${required.province ? 'required' : ''}>
              <option value="">${TEXTS.selectProvince}</option>
              ${provinces.map(p => `<option value="${p.value}">${p.label}</option>`).join('')}
            </select>
            <span class="curetfy-error"></span>
          </div>
        `;
      }

      if (hasQuantity) {
        html += `
          <div class="curetfy-form-group curetfy-form-half">
            <label for="curetfy-quantity">${labels.quantity}</label>
            <div class="curetfy-quantity-wrap">
              <button type="button" class="curetfy-qty-btn" data-action="decrease">−</button>
              <input type="number" id="curetfy-quantity" name="quantity" min="1" max="99" value="1" readonly>
              <button type="button" class="curetfy-qty-btn" data-action="increase">+</button>
            </div>
          </div>
        `;
      }

      html += '</div>';
    }

    // Postal code (conditional)
    if (fields.showPostalCode) {
      html += `
        <div class="curetfy-form-group">
          <label for="curetfy-postal">${labels.postalCode}</label>
          <input type="text" id="curetfy-postal" name="postalCode" ${required.postalCode ? 'required' : ''} autocomplete="postal-code" placeholder="${placeholders.postalCode}">
          <span class="curetfy-error"></span>
        </div>
      `;
    }

    // Notes (conditional)
    if (fields.showNotes) {
      html += `
        <div class="curetfy-form-group">
          <label for="curetfy-notes">${labels.notes}</label>
          <textarea id="curetfy-notes" name="notes" ${required.notes ? 'required' : ''} placeholder="${placeholders.notes}" rows="2"></textarea>
          <span class="curetfy-error"></span>
        </div>
      `;
    }

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
            } else if (btn.dataset.action === 'decrease' && current > 1) {
              qtyInput.value = current - 1;
            }
            updateTotal(modal, items[0].price, currency);
          });
        });
      }
    }

    // Form submit
    const form = modal.querySelector('#curetfy-form');
    if (form) {
      form.addEventListener('submit', e => handleSubmit(e, modal));
    }
  }

  // Update total
  function updateTotal(modal, unitPrice, currency) {
    const quantity = parseInt(modal.querySelector('#curetfy-quantity')?.value) || 1;
    const total = unitPrice * quantity;
    const totalEl = modal.querySelector('.curetfy-total-amount');
    if (totalEl) totalEl.textContent = formatCurrency(total, currency);
    modal.dataset.totalPrice = total;
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
    const cfg = JSON.parse(modal.dataset.config || '{}');

    // Clear errors
    form.querySelectorAll('.curetfy-error').forEach(el => el.textContent = '');
    form.querySelectorAll('.curetfy-form-group--error').forEach(el => el.classList.remove('curetfy-form-group--error'));

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

    if (!valid) return;

    // Submit
    submitBtn.disabled = true;
    submitText.style.display = 'none';
    submitLoading.style.display = 'inline-flex';

    const items = JSON.parse(modal.dataset.items || '[]');
    const isMultiple = modal.dataset.isMultiple === 'true';
    const quantity = isMultiple ? null : parseInt(form.querySelector('#curetfy-quantity')?.value) || 1;

    // Get UTM params for order tracking
    const utm = getUTMParams();

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
      currency: modal.dataset.currency,
      total: parseFloat(modal.dataset.totalPrice),
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

        // Auto redirect to WhatsApp
        if (cfg.autoRedirectWhatsApp !== false) {
          setTimeout(() => {
            window.open(result.data.whatsappLink, '_blank');
          }, cfg.redirectDelay || 2000);
        }
      } else {
        showError(cfg.messages?.errorMessage || result.error || DEFAULT_CONFIG.messages.errorMessage);
        resetSubmitButton();
      }
    } catch (err) {
      console.error('Curetfy error:', err);
      showError(cfg.messages?.errorMessage || DEFAULT_CONFIG.messages.errorMessage);
      resetSubmitButton();
    }

    function resetSubmitButton() {
      submitBtn.disabled = false;
      submitText.style.display = 'inline';
      submitLoading.style.display = 'none';
    }

    function showError(msg) {
      alert(msg);
    }
  }

  // Show field error
  function showFieldError(input, message) {
    const group = input.closest('.curetfy-form-group');
    if (group) {
      group.classList.add('curetfy-form-group--error');
      const errorEl = group.querySelector('.curetfy-error');
      if (errorEl) errorEl.textContent = message;
    }
  }

  // Validate phone
  function isValidPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
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
