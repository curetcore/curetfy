/**
 * Curetfy COD Form
 * Professional WhatsApp Order System
 * @version 2.0.0
 */
(function() {
  'use strict';

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
      { code: 'MC', name: 'Monte Cristi' },
      { code: 'ES', name: 'Espaillat' },
      { code: 'IN', name: 'Independencia' },
      { code: 'AL', name: 'La Altagracia' },
      { code: 'SM', name: 'Samaná' },
      { code: 'VA', name: 'Valverde' },
      { code: 'MT', name: 'Monte Plata' },
      { code: 'HM', name: 'Hato Mayor' },
      { code: 'SR', name: 'Sánchez Ramírez' },
      { code: 'PR', name: 'Peravia' },
      { code: 'MN', name: 'Monseñor Nouel' },
      { code: 'DA', name: 'Dajabón' },
      { code: 'EP', name: 'Elías Piña' },
      { code: 'SY', name: 'Santiago Rodríguez' },
      { code: 'PN', name: 'Pedernales' },
      { code: 'BR', name: 'Baoruco' },
      { code: 'MR', name: 'María Trinidad Sánchez' },
      { code: 'HE', name: 'Hermanas Mirabal' },
      { code: 'SJ', name: 'San José de Ocoa' }
    ]
  };

  const TEXTS = {
    es: {
      formTitle: 'Completa tu pedido',
      name: 'Nombre completo',
      namePlaceholder: 'Tu nombre',
      phone: 'Teléfono / WhatsApp',
      phonePlaceholder: '+1 809 555 1234',
      address: 'Dirección de entrega',
      addressPlaceholder: 'Calle, número, sector...',
      province: 'Provincia',
      selectProvince: 'Seleccionar',
      quantity: 'Cantidad',
      total: 'Total a pagar',
      submit: 'Confirmar pedido',
      close: 'Cerrar',
      successTitle: '¡Pedido registrado!',
      successMessage: 'Haz clic para enviar tu pedido por WhatsApp',
      openWhatsapp: 'Enviar por WhatsApp',
      errorRequired: 'Campo requerido',
      errorPhone: 'Teléfono inválido',
      errorGeneric: 'Error al procesar. Intenta de nuevo.',
      loading: 'Procesando...',
      items: 'productos',
      item: 'producto'
    },
    en: {
      formTitle: 'Complete your order',
      name: 'Full name',
      namePlaceholder: 'Your name',
      phone: 'Phone / WhatsApp',
      phonePlaceholder: '+1 809 555 1234',
      address: 'Delivery address',
      addressPlaceholder: 'Street, number, area...',
      province: 'Province',
      selectProvince: 'Select',
      quantity: 'Quantity',
      total: 'Total',
      submit: 'Confirm order',
      close: 'Close',
      successTitle: 'Order registered!',
      successMessage: 'Click to send your order via WhatsApp',
      openWhatsapp: 'Send via WhatsApp',
      errorRequired: 'Required field',
      errorPhone: 'Invalid phone',
      errorGeneric: 'Processing error. Try again.',
      loading: 'Processing...',
      items: 'items',
      item: 'item'
    }
  };

  let currentModal = null;
  let texts = TEXTS.es;

  // Initialize
  function init() {
    document.querySelectorAll('.curetfy-cod-container').forEach(container => {
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

  // Handle button click - check mode (product or cart)
  async function handleButtonClick(container) {
    const data = container.dataset;
    const mode = data.mode || 'product';
    const locale = data.locale?.startsWith('es') ? 'es' : 'en';
    texts = TEXTS[locale] || TEXTS.es;

    if (mode === 'cart') {
      // Fetch cart items
      try {
        const cart = await fetchCart();
        if (cart.items && cart.items.length > 0) {
          openCartModal(cart, data);
        } else {
          // Cart empty, use product data
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

  // Fetch Shopify cart
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

  // Open modal for cart items
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

    openModal(items, {
      ...data,
      currency: cart.currency,
      totalPrice: cart.total_price / 100
    });
  }

  // Open modal
  function openModal(items, data) {
    const isMultiple = items.length > 1;
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const currency = data.currency || 'DOP';

    const modal = createModal(items, {
      shop: data.shop,
      currency,
      totalPrice,
      isMultiple
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

  // Create modal HTML
  function createModal(items, options) {
    const { shop, currency, totalPrice, isMultiple } = options;

    const overlay = document.createElement('div');
    overlay.className = 'curetfy-modal-overlay';

    const itemsHTML = isMultiple
      ? createCartItemsHTML(items, currency)
      : createSingleItemHTML(items[0]);

    const quantitySection = !isMultiple ? `
      <div class="curetfy-form-group curetfy-form-half">
        <label for="curetfy-quantity">${texts.quantity}</label>
        <div class="curetfy-quantity-wrap">
          <button type="button" class="curetfy-qty-btn" data-action="decrease">−</button>
          <input type="number" id="curetfy-quantity" name="quantity" min="1" max="99" value="1" readonly>
          <button type="button" class="curetfy-qty-btn" data-action="increase">+</button>
        </div>
      </div>
    ` : '';

    overlay.innerHTML = `
      <div class="curetfy-modal">
        <div class="curetfy-modal-header">
          <h2 class="curetfy-modal-title">${texts.formTitle}</h2>
          <button type="button" class="curetfy-modal-close" aria-label="${texts.close}">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div class="curetfy-modal-content">
          ${itemsHTML}

          <form class="curetfy-form" id="curetfy-form">
            <div class="curetfy-form-group">
              <label for="curetfy-name">${texts.name}</label>
              <input type="text" id="curetfy-name" name="name" required autocomplete="name" placeholder="${texts.namePlaceholder}">
              <span class="curetfy-error"></span>
            </div>

            <div class="curetfy-form-group">
              <label for="curetfy-phone">${texts.phone}</label>
              <input type="tel" id="curetfy-phone" name="phone" required autocomplete="tel" placeholder="${texts.phonePlaceholder}">
              <span class="curetfy-error"></span>
            </div>

            <div class="curetfy-form-group">
              <label for="curetfy-address">${texts.address}</label>
              <textarea id="curetfy-address" name="address" required autocomplete="street-address" placeholder="${texts.addressPlaceholder}" rows="2"></textarea>
              <span class="curetfy-error"></span>
            </div>

            <div class="curetfy-form-row">
              <div class="curetfy-form-group ${isMultiple ? '' : 'curetfy-form-half'}">
                <label for="curetfy-province">${texts.province}</label>
                <select id="curetfy-province" name="province" required>
                  <option value="">${texts.selectProvince}</option>
                  ${(PROVINCES.DO || []).map(p => `<option value="${p.name}">${p.name}</option>`).join('')}
                </select>
                <span class="curetfy-error"></span>
              </div>
              ${quantitySection}
            </div>

            <div class="curetfy-total-row">
              <span>${texts.total}</span>
              <span class="curetfy-total-amount">${formatCurrency(totalPrice, currency)}</span>
            </div>

            <button type="submit" class="curetfy-submit-btn">
              <span class="curetfy-submit-text">${texts.submit}</span>
              <span class="curetfy-submit-loading" style="display:none;">
                <svg class="curetfy-spinner" viewBox="0 0 24 24" width="18" height="18">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2.5" fill="none" stroke-dasharray="31.4 31.4" stroke-linecap="round"/>
                </svg>
                ${texts.loading}
              </span>
            </button>
          </form>
        </div>

        <div class="curetfy-success" style="display:none;">
          <svg class="curetfy-success-icon" viewBox="0 0 64 64" width="64" height="64">
            <circle cx="32" cy="32" r="30" fill="#25D366"/>
            <path d="M20 32l8 8 16-16" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h3>${texts.successTitle}</h3>
          <p>${texts.successMessage}</p>
          <a href="#" class="curetfy-whatsapp-link" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            ${texts.openWhatsapp}
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

    // Setup event listeners
    setupModalEvents(overlay, items, currency);

    return overlay;
  }

  // Create single item HTML
  function createSingleItemHTML(item) {
    return `
      <div class="curetfy-product-summary">
        <img class="curetfy-product-image" src="${item.image || ''}" alt="${item.title}" loading="lazy">
        <div class="curetfy-product-info">
          <p class="curetfy-product-title">${item.title}</p>
          <p class="curetfy-product-price">${item.priceFormatted}</p>
        </div>
      </div>
    `;
  }

  // Create cart items HTML
  function createCartItemsHTML(items, currency) {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const label = count === 1 ? texts.item : texts.items;

    return `
      <div class="curetfy-cart-items">
        ${items.map(item => `
          <div class="curetfy-cart-item">
            <img class="curetfy-cart-item-image" src="${item.image || ''}" alt="${item.title}" loading="lazy">
            <div class="curetfy-cart-item-info">
              <p class="curetfy-cart-item-title">${item.title}</p>
              <p class="curetfy-cart-item-details">
                ${item.variantTitle ? `${item.variantTitle} · ` : ''}${item.quantity}x ${item.priceFormatted}
              </p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Setup modal events
  function setupModalEvents(modal, items, currency) {
    const isMultiple = items.length > 1;

    // Quantity controls (only for single product)
    if (!isMultiple) {
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
    if (totalEl) {
      totalEl.textContent = formatCurrency(total, currency);
    }
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

    // Clear errors
    form.querySelectorAll('.curetfy-error').forEach(el => el.textContent = '');
    form.querySelectorAll('.curetfy-form-group--error').forEach(el => el.classList.remove('curetfy-form-group--error'));

    // Validate
    let valid = true;
    const name = form.querySelector('#curetfy-name');
    const phone = form.querySelector('#curetfy-phone');
    const address = form.querySelector('#curetfy-address');
    const province = form.querySelector('#curetfy-province');

    if (!name.value.trim()) {
      showFieldError(name, texts.errorRequired);
      valid = false;
    }
    if (!phone.value.trim() || !isValidPhone(phone.value)) {
      showFieldError(phone, texts.errorPhone);
      valid = false;
    }
    if (!address.value.trim()) {
      showFieldError(address, texts.errorRequired);
      valid = false;
    }
    if (!province.value) {
      showFieldError(province, texts.errorRequired);
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

    const payload = {
      shop: modal.dataset.shop,
      items: items.map(item => ({
        productId: item.id,
        productTitle: item.title,
        variantId: item.variantId,
        quantity: isMultiple ? item.quantity : quantity,
        price: item.price
      })),
      currency: modal.dataset.currency,
      total: parseFloat(modal.dataset.totalPrice),
      customer: {
        name: name.value.trim(),
        phone: phone.value.trim(),
        address: address.value.trim(),
        province: province.value,
        country: 'DO'
      }
    };

    try {
      const res = await fetch(`${API_BASE}/api/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (result.success) {
        // Hide form, show success
        modal.querySelector('.curetfy-modal-content').style.display = 'none';
        const success = modal.querySelector('.curetfy-success');
        const waLink = success.querySelector('.curetfy-whatsapp-link');
        waLink.href = result.data.whatsappLink;
        success.style.display = 'block';

        // Auto open WhatsApp after brief delay
        setTimeout(() => window.open(result.data.whatsappLink, '_blank'), 600);
      } else {
        showError(result.error || texts.errorGeneric);
        resetSubmitButton();
      }
    } catch (err) {
      console.error('Curetfy error:', err);
      showError(texts.errorGeneric);
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

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-init on dynamic content (for SPAs)
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        init();
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
