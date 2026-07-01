class CartRemoveButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', (event) => {
      event.preventDefault();
      const cartItems = this.closest('cart-items') || this.closest('cart-drawer-items');
      cartItems.updateQuantity(this.dataset.index, 0, event);
      const itemElementData = document.getElementById(`cart-item-${this.dataset.index}`) || document.getElementById(`main-item-${this.dataset.index}`);
      if (itemElementData) {
        itemElementData.classList.add('cart-item-remove');
        const dotsContainer = itemElementData.querySelector('.dots-container')
        if (dotsContainer) {
          dotsContainer.classList.remove('hidden');
        }
      }
    });
  }
}
customElements.define('cart-remove-button', CartRemoveButton);

class CartItems extends HTMLElement {
  constructor() {
    super();
    this.lineItemStatusElement =
      document.getElementById('shopping-cart-line-item-status') || document.getElementById('CartDrawer-LineItemStatus');
    const debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, ON_CHANGE_DEBOUNCE_TIMER);
    this.addEventListener('change', debouncedOnChange.bind(this));
  }

  cartUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => {
      if (event.source === 'cart-items') {
        return;
      }
      return this.onCartUpdate();
    });
  }

  disconnectedCallback() {
    if (this.cartUpdateUnsubscriber) {
      this.cartUpdateUnsubscriber();
    }
  }

  resetQuantityInput(id) {
    const input = this.querySelector(`#Quantity-${id}`);
    if (input) input.value = input.getAttribute('value');
    this.isEnterPressed = false;
  }

  setValidity(event, index, message) {
    event.target.setCustomValidity(message);
    event.target.reportValidity();
    this.resetQuantityInput(index);
    event.target.select();
  }

  validateQuantity(event) {
    if (!event.target) return;
    const inputValue = parseInt(event.target.value);
    if (isNaN(inputValue)) return;
    const index = event.target.dataset.index;
    let message = '';


    if (inputValue < event.target.dataset.min) {
      message = window.quickOrderListStrings.min_error.replace('[min]', event.target.dataset.min);
    } else if (inputValue > parseInt(event.target.max)) {
      message = window.quickOrderListStrings.max_error.replace('[max]', event.target.max);
    } else if (inputValue % parseInt(event.target.step) !== 0) {
      message = window.quickOrderListStrings.step_error.replace('[step]', event.target.step);
    }

    if (message) {
      this.setValidity(event, index, message);
    } else {
      event.target.setCustomValidity('');
      event.target.reportValidity();
      this.updateQuantity(
        index,
        inputValue,
        event,
        document.activeElement.getAttribute('name'),
        event.target.dataset.quantityVariantId
      );
    }
  }

  onChange(event) {
    this.validateQuantity(event);
  }
  onCartUpdate() {
    if (this.tagName === 'CART-DRAWER-ITEMS') {
      const cartDrawer = document.querySelector('cart-drawer');
      if (cartDrawer) {
        this.sectionDrawerId = cartDrawer.getAttribute('data-section-id');
        return fetch(`${window.location.pathname}?section_id=cart-drawer`)
          .then((response) => response.text())
          .then((responseText) => {
            const html = new DOMParser().parseFromString(responseText, 'text/html');
            const selectors = ['.cart-drawer-inner'];
            for (const selector of selectors) {
              const targetElement = document.querySelector(selector);
              const sourceElement = html.querySelector(selector);
              if (targetElement && sourceElement) {
                targetElement.replaceWith(sourceElement);
              }
            }
            setTimeout(() => {
              trapFocus(cartDrawer);
            }, 500);
          })
          .catch((e) => {
            console.error(e);
          });
      }
    } else {
      return fetch(`${routes.cart_url}?section_id=${this.dataset.sectionId}`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, 'text/html');
          const sourceQty = html.querySelector('cart-items');
          this.innerHTML = sourceQty.innerHTML;
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }
  getSectionsToRender() {
  const sections = [
    {
      id: 'main-cart-items',
      el: document.getElementById('main-cart-items'),
      selector: '[main-cart-items-content]',
    },
    // {
    //   id: 'main-cart',
    //   el: document.getElementById('main-cart'),
    //   selector: '[main-cart-wrapper]',
    // },
    {
      id: 'main-cart-footer',
      el: document.getElementById('main-cart-footer'),
      selector: '[main-cart-summary-box]',
    },
    { 
      id: 'main-cart-count',
      el: document.getElementById('main-cart-count'),
      selector: '[main-cart-count]',
    },
    // {
    //   id: 'main-cart-recommendation',
    //   el: document.getElementById('main-cart-recommendation'),
    //   selector: '[recommendations-content]',
    // },
    {
      id: 'main-cart-shipping',
      el: document.getElementById('main-cart-shipping'),
      selector: '[data-cart-shippingbar]',
    },
  ];

  // Return only those sections where element and dataset.id exist
  return sections
    .filter(item => item.el && item.el.dataset.id)
    .map(item => ({
      id: item.id,
      section: item.el.dataset.id,
      selector: item.selector,
    }));
}

  updateQuantity(line, quantity, event, name, variantId) {
    const eventTarget = event.currentTarget instanceof CartRemoveButton ? 'clear' : 'change';
    if (eventTarget == "change") {
      this.enableLoading(line); 
    }
    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    });
    fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);
        CartPerformance.measure(`${eventTarget}:paint-updated-sections"`, () => {
          const quantityElement =
            document.getElementById(`Quantity-${line}`) || document.getElementById(`Drawer-quantity-${line}`);
          const items = document.querySelectorAll('.cart-item');
          if (parsedState.errors) {
            quantityElement.value = quantityElement.getAttribute('value');
            this.updateLiveRegions(line, parsedState.errors);
            return;
          }
          this.classList.toggle('is-empty', parsedState.item_count === 0);
          const cartDrawerWrapper = document.querySelector('cart-drawer');
          const cartFooter = document.getElementById('main-cart-footer');
          const headerCartBag = document.getElementById('main-cart-count-header-right');
          if (headerCartBag) { 
            headerCartBag.innerText = parsedState.item_count;
            if (parsedState.item_count == 0) {
              headerCartBag.classList.add('hidden');
            } else {
              headerCartBag.classList.remove('hidden');
            }
          }
          if (cartFooter) cartFooter.classList.toggle('is-empty', parsedState.item_count === 0);
          if (cartDrawerWrapper) cartDrawerWrapper.classList.toggle('is-empty', parsedState.item_count === 0);
          this.getSectionsToRender().forEach((section) => {
            const elementToReplace = document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
            if (section.id === "main-cart-shipping") {
              const parser = new DOMParser();
              const parsedHTML = parser.parseFromString(parsedState.sections[section.section], 'text/html');
              const shippingBarNew = parsedHTML.querySelector(section.selector);
              const shippingBarOld = elementToReplace;
              if (shippingBarOld && shippingBarNew) {
                shippingBarOld.replaceWith(shippingBarNew);
                const progressPercentage = shippingBarNew.dataset.barwidth; 
                if (progressPercentage) {
                  const progressBar = document.querySelector('.shipping-eligibility-progressbar');
                  if (progressBar) {
                    progressBar.style.setProperty('--eligibilityProgress', progressPercentage);
                  }
                }
              }
              return;
            }
            elementToReplace.innerHTML = this.getSectionInnerHTML(
              parsedState.sections[section.section],
              section.selector
            );
          });
          const updatedValue = parsedState.items[line - 1] ? parsedState.items[line - 1].quantity : undefined;
          let message = '';
          if (items.length === parsedState.items.length && updatedValue !== parseInt(quantityElement.value)) {
            if (typeof updatedValue === 'undefined') {
              message = window.cartStrings.error;
            } else {
              message = window.cartStrings.quantityError.replace('[quantity]', updatedValue);
            }
          }
          this.updateLiveRegions(line, message);
          const lineItem =
            document.getElementById(`CartItem-${line}`) || document.getElementById(`CartDrawer-Item-${line}`);
          if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
            cartDrawerWrapper
              ? trapFocus(cartDrawerWrapper, lineItem.querySelector(`[name="${name}"]`))
              : lineItem.querySelector(`[name="${name}"]`).focus();
          } else if (parsedState.item_count === 0 && cartDrawerWrapper) {
            trapFocus(cartDrawerWrapper.querySelector('.drawer__inner-empty'), cartDrawerWrapper.querySelector('a'));
          } else if (document.querySelector('.cart-item') && cartDrawerWrapper) {
            trapFocus(cartDrawerWrapper, document.querySelector('.cart-item__name'));
          }
        });
        CartPerformance.measureFromEvent(`${eventTarget}:user-action`, event);
        publish(PUB_SUB_EVENTS.cartUpdate, { source: 'cart-items', cartData: parsedState, variantId: variantId });
      })
      .catch(() => {
        this.querySelectorAll('.loading__spinner').forEach((overlay) => overlay.classList.add('hidden'));
    if (eventTarget == "change") {
        this.disableLoading(line);
    }
      })
      .finally(() => {
    if (eventTarget == "change") {
        this.disableLoading(line);
    }
      });
  }

  updateLiveRegions(line, message) {
    const lineItemError =
      document.getElementById(`Line-item-error-${line}`) || document.getElementById(`CartDrawer-LineItemError-${line}`);
    if (lineItemError) lineItemError.querySelector('.cart-item-error-text').textContent = message;
    if (message) {
      lineItemError.removeAttribute('hidden');
    }
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }

  enableLoading(line) {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.add('cart-items-disabled');
     const cartLine =  document.getElementById(`cart-item-${line}`) ||  document.getElementById(`main-item-${line}`)
          const loader = cartLine.querySelector('.cart-update-loader')
          if(loader){
            loader?.removeAttribute("hidden");
          }
  }

  disableLoading(line) {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    mainCartItems?.classList?.remove('cart-items-disabled');
    const cartLine =  document.getElementById(`cart-item-${line}`) ||  document.getElementById(`main-item-${line}`)
          const loader = cartLine.querySelector('.cart-update-loader')
          if(loader){
            loader?.setAttribute("hidden","");
          }
  }
}

customElements.define('cart-items', CartItems);

if (!customElements.get('cart-note')) {
  customElements.define(
    'cart-note',
    class CartNote extends HTMLElement {
      constructor() {
        super();

        this.addEventListener(
          'input',
          debounce((event) => {
            const body = JSON.stringify({ note: event.target.value });
            fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body } })
              .then(() => CartPerformance.measureFromEvent('note-update:user-action', event));
          }, ON_CHANGE_DEBOUNCE_TIMER)
        );
      }
    }
  );
}

class CartDiscount extends HTMLFormElement {
  constructor() {
    super();
    this.addEventListener('submit', this.handleFormSubmit.bind(this));
    this.source = this.dataset.source;
  }

  connectedCallback() {
    if (this.source == 'cart') {
      this.mainCart = document.querySelector('cart-items');
    } else {
      this.cart = document.querySelector('cart-drawer');
    }

  }
  get cartDiscountsEl() {
    return this.querySelector('.applied-cart-discounts');
  }
  get couponEl() {
    return this._couponEl ||= this.querySelector('input[name="discount"]');
  }

  get messageEl() {
    return this._messageEl ||= this.querySelector('[form-error]');
  }
  getDiscounts() {
    const discounts = [];

    if (this.cartDiscountsEl) {
      const items = this.cartDiscountsEl.querySelectorAll('.discount');
      items &&
        items.forEach((item) => {
          discounts.push(item.dataset.discountCode);
        });
    }

    return discounts;
  }

  async handleFormSubmit(event) {
    event.preventDefault();
    this.displayMessage();

    const discountCode = this.couponEl?.value?.trim();
    if (!discountCode) {
      this.displayMessage('error', 'Please enter a discount code.');
      return;
    }

    const discounts = this.getDiscounts();
    if (discounts.includes(discountCode)) {
      this.displayMessage('error', 'Discount code already applied.');
      return;
    }

    discounts.push(discountCode);

    try {
      const response = await this.applyDiscount(discounts);

      if (response.status) {
        this.displayMessage('error', response.errors?.join(', ') || 'Something went wrong.');
        return;
      }

      const invalid = response.discount_codes.find(d => d.code === discountCode && !d.applicable);
      if (invalid) {
        this.couponEl.value = '';
        this.displayMessage('error', 'The discount code cannot be applied to your cart.');
        return;
      }

      if (this.cart) {
        this.cart.renderContents(response);
      }
      if (this.mainCart) {
        this.updateMainCart(response);
      }
      // this.displayMessage('success', 'Discount applied successfully!');

    } catch (error) {
      console.error('Error updating discount:', error);
      this.displayMessage('error', 'There was a problem applying your discount. Please try again.');
    }
  }

  async applyDiscount(discounts) {
    const config = theme.utils.fetchConfig('javascript');
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    delete config.headers['Content-Type'];

    const formData = new FormData();

    formData.append('discount', discounts.join(','));
    if (this.cart) {
      formData.append('sections', this.cart.getSectionsToRender().map(s => s.id));
      formData.append('sections_url', window.location.pathname);
    }
    if (this.mainCart) {
      formData.append('sections', this.mainCart.getSectionsToRender().map((section) => section.section));
      formData.append('sections_url', window.location.pathname);
    }
    config.body = formData;
    const res = await fetch(routes.cart_update_url, config);
    return res.json();
  }

  updateMainCart(parsedState) {
    this.mainCart.getSectionsToRender().forEach((section) => {
      const elementToReplace = document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
      elementToReplace.innerHTML = this.mainCart.getSectionInnerHTML(
        parsedState.sections[section.section],
        section.selector
      );
    });
  }
  displayMessage(type, message) {
    if (!this.messageEl) {
      if (message) alert(message);
      return;
    }
    if (message) {
      this.messageEl.classList.remove('hidden');
      this.messageEl.textContent = message
      // const errorEl = this.messageEl.querySelector('.error');
      // if (errorEl) errorEl.textContent = message;

      this.messageEl.dataset.type = type;
    } else {
      this.messageEl.classList.add('hidden');
    }
  }
}

customElements.define('cart-discount', CartDiscount, { extends: 'form' });