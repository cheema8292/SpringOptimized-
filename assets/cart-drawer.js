class CartDrawer extends HTMLElement {
  constructor() {
    super();

    this.querySelector('[drawer-close]').addEventListener('click', this.close.bind(this));
    this.section = this.closest('.shopify-section');
    this.overlay = this.querySelector('[drawer-close]');
    this.sectionId = this.dataset.sectionId;

    this.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());

    // if (Shopify.designMode) {
    //   this.section.addEventListener('shopify:section:select', () => this.openModal());
    //   this.section.addEventListener('shopify:section:deselect', () => this.close());
    //   this.section.addEventListener('shopify:section:unload', () => this.close());
    //   this.section.addEventListener('shopify:section:load', () => this.openModal());
    // }

    this.overlay.addEventListener('click', (e) => {
      this.close();
    })
    //this.setHeaderCartIconAccessibility();
  }
  connectedCallback() {
    this.cartTrigger = document.querySelector('[data-header-cart-trigger]');
    if (this.cartTrigger) {
      this.cartTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        window.setLastFocusedElement(this.cartTrigger);
        this.openModal();
      })
    }
  }
  openModal() {
    this.classList.add('drawer-open');
    this.setAttribute('drawer-open', '');
    document.body.classList.add('overflow-hidden');
    setTimeout(() => {
      trapFocus(this);
    }, 500);
  }
  /*
  setHeaderCartIconAccessibility() {
    const cartLink = document.querySelector('#cart-icon-bubble');
    if (!cartLink) return;
    cartLink.setAttribute('role', 'button');
    cartLink.setAttribute('aria-haspopup', 'dialog');
    cartLink.addEventListener('click', (event) => {
      event.preventDefault();
      this.open(cartLink);
    });
    cartLink.addEventListener('keydown', (event) => {
      if (event.code.toUpperCase() === 'SPACE') {
        event.preventDefault();
        this.open(cartLink);
      }
    });
  }
  */
  open(triggeredBy) {
    if (triggeredBy) this.setActiveElement(triggeredBy);
    this.cart_drawer = document.querySelector('cart-drawer');
    this.quick_view = document.querySelector('drawer-section-view');
    if (this.cart_drawer) {
      this.updateCount();
      // const dataItemCountDrawer = this.cart_drawer.querySelector('[cart-count-drawer]');
      // if(dataItemCountDrawer){
      //     const headerCartBag = document.getElementById('main-cart-count-header-right');
      //     const getCount = parseInt(dataItemCountDrawer.innerHTML);
      //     if(headerCartBag){
      //       headerCartBag.innerText = dataItemCountDrawer.innerHTML;
      //       if(getCount == 0){
      //         headerCartBag.classList.add('hidden');
      //       }else{
      //         headerCartBag.classList.remove('hidden');
      //       }
      //     }
      // }
      setTimeout(() => {
        if (this.quick_view) {
          this.quick_view.classList.remove('drawer-open');
          setTimeout(() => {
            this.quick_view.removeAttribute('drawer-open');
          }, 300);
        }
        this.cart_drawer.classList.add('drawer-open');
        this.cart_drawer.setAttribute('drawer-open', '');
        document.body.classList.add('overflow-hidden');
      }, 200);
    }
    this.addEventListener(
      'transitionend',
      () => {
        const containerToTrapFocusOn = this.cart_drawer;
        const focusElement = this.cart_drawer.querySelector('[drawer-close]');
        trapFocus(containerToTrapFocusOn, focusElement);
      },
      { once: true }
    );
  }
  updateCount() {
    const dataItemCountDrawer = this.querySelector('[cart-count-drawer]');
    if (dataItemCountDrawer) {
      const headerCartBag = document.getElementById('main-cart-count-header-right');
      const getCount = parseInt(dataItemCountDrawer.innerHTML);
      if (headerCartBag) {
        headerCartBag.innerText = dataItemCountDrawer.innerHTML;
        if (getCount == 0) {
          headerCartBag.classList.add('hidden');
        } else {
          headerCartBag.classList.remove('hidden');
        }
      }
    }
  }
  close() {
    this.classList.remove('drawer-open');
    setTimeout(() => {
      this.removeAttribute('drawer-open');
      this.closeAllOtherCartContent();
      if(window.lastFocusedElement != null){
        window.returnFocusToLastElement();
      }else{
        if(this.cartTrigger){
        removeTrapFocus(this.cartTrigger);
        }
      }   
    }, 300);
    document.body.classList.remove('overflow-hidden');
  }
  closeAllOtherCartContent(){
    const drawerRecomdedContent = document.querySelector('cart-drawer-product-recommendations-content');
    if(drawerRecomdedContent && drawerRecomdedContent.classList.contains('active')){
      drawerRecomdedContent.classList.remove('active');
    }
    const allCartDialog = this.querySelectorAll('.cart-dialog');
    if(allCartDialog){
      allCartDialog.forEach((dialog) => {
        dialog.classList.remove('active');
      });
    }
  }
  setSummaryAccessibility(cartDrawerNote) {
    cartDrawerNote.setAttribute('role', 'button');
    cartDrawerNote.setAttribute('aria-expanded', 'false');
    if (cartDrawerNote.nextElementSibling.getAttribute('id')) {
      cartDrawerNote.setAttribute('aria-controls', cartDrawerNote.nextElementSibling.id);
    }
    cartDrawerNote.addEventListener('click', (event) => {
      event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
    });
    cartDrawerNote.parentElement.addEventListener('keyup', onKeyUpEscape);
  }
  renderContents(parsedState, cartnotification) {
    this.querySelector('.drawer-inner').classList.contains('is-empty') &&
      this.querySelector('.drawer-inner').classList.remove('is-empty');

    this.productId = parsedState.id;
    this.getSectionsToRender().forEach((section) => {

      const sectionElement = section.selector
        ? document.querySelector(section.selector)
        : document.getElementById(section.id);

      if (!sectionElement) return;
      sectionElement.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.id], section.selector);
    });
    this.updateCount();
    setTimeout(() => {
      this.querySelector('[drawer-close]').addEventListener('click', this.close.bind(this));
      this.querySelector('[drawer-close-btn]').addEventListener('click', this.close.bind(this));
      if (!cartnotification) {
        this.open();
      }
    });
  }
  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }
  getSectionsToRender() {
    return [
      {
        id: 'cart-drawer',
        selector: '#CartDrawer',
      }
    ];
  }
  getSectionDOM(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector);
  }
  setActiveElement(element) {
    this.activeElement = element;
  }
}
customElements.define('cart-drawer', CartDrawer);

class CartDrawerItems extends CartItems {
  getSectionsToRender() {
    return [
      {
        id: 'CartDrawer', 
        section: 'cart-drawer',
        selector: '[drawer-body-inner]',
      },
      {
        id: 'CartDrawer', 
        section: 'cart-drawer',
        selector: '[cart-count-drawer]',
      },
      {  
        id: 'main-cart-shipping',
        section: document.getElementById('main-cart-shipping')?.dataset.id,
        selector: '[data-cart-shippingbar]',
      }
    ];
  }
}
customElements.define('cart-drawer-items', CartDrawerItems);

class cartDrawerBtnClose extends HTMLElement {
  constructor() {
    super();
    this.querySelector('button').addEventListener('click', this.close.bind(this));
  }
  close() {
    this.cart_drawer = document.querySelector('cart-drawer');
    this.cart_drawer.close();
    // this.cart_drawer.classList.remove('drawer-open');
    // setTimeout(() => {
    //   this.cart_drawer.removeAttribute('drawer-open');
    // }, 300);
    // document.body.classList.remove('overflow-hidden');
  }
}
customElements.define('drawer-close-button', cartDrawerBtnClose);

if (!customElements.get('cart-drawer-product-recommendations')) {
  class ProductRecommendationsCart extends HTMLElement {
    constructor() {
      super();
      this.productId = this.getAttribute('product-recommendations-id');
    }
    connectedCallback() {
      fetch(this.dataset.url)
        .then((response) => response.text())
        .then((responseText) => {
          const html = document.createElement('div');
          html.innerHTML = responseText;
          const escapedProductId = CSS.escape(parseInt(this.productId));
          const recommendations = html.querySelector(`[product-recommendations-id=${escapedProductId}]`);
          const recomendedItemsLength = html.querySelectorAll('[recommendation-drawer-item]');
          if (recommendations && recommendations.innerHTML.trim().length) {
            this.innerHTML = recommendations.innerHTML;
          }
          if (recomendedItemsLength.length > 0) {
            this.classList.remove('hidden');
          }
        })
        .catch((error) => {
          console.error('Error fetching recommendations:', error);
        });
    }
  }
  customElements.define('cart-drawer-product-recommendations', ProductRecommendationsCart);
}

class CartDrawerModalTrigger extends HTMLButtonElement {
  constructor() {
    super();
    this.parentElementWrapper = this.closest('[data-parent-wrapper]');
    this.dialog = this.parentElementWrapper.querySelector('.cart-dialog');
    this.dialogInner = this.dialog.querySelector('.cart-dialog-inner');
    if (this.parentElementWrapper) {
      this.addEventListener("click", this.open.bind(this));
      const closeBtn = this.parentElementWrapper.querySelector('[cart-dialog-close]');
      if (closeBtn) {
        closeBtn.addEventListener("click", this.close.bind(this));
      }
    }
    if (this.dialogInner) {
      this.dialogInner.addEventListener("focusout", this.handleFocusOut.bind(this));
    }
  }
  open() {
    this.parentElementWrapper.querySelector('.cart-dialog').classList.add('active');
  }
  close() {
    this.parentElementWrapper.querySelector('.cart-dialog').classList.remove('active');
  }
  handleFocusOut(event) { // new changes 10 nov
    requestAnimationFrame(() => {
      if (!this.dialogInner.contains(document.activeElement)) {
        this.close();
      }
    });
  }

}
customElements.define("cart-drawer-model-trigger", CartDrawerModalTrigger, { extends: "button", });

class cartOrderNoteSave extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', this.saveOrderNote.bind(this));
    this.addEventListener('keydown', this.onKeyDown.bind(this));
    this.setAttribute('tabindex', '0');
  }

  onKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.saveOrderNote();
    }
  }

  saveOrderNote() {
    const orderNoteText = document.querySelector('cart-notes-extra');
    const textAreaValue = orderNoteText.querySelector('textarea');
    const drawerClose = this.closest('[data-parent-wrapper]');
    const body = JSON.stringify({ note: textAreaValue.value });

    fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body } })
      .then((response) => response.text())
      .then((state) => {
        const parsedState = JSON.parse(state);
        if (parsedState.errors) return;
        console.log('Order note updated successfully');
      })
      .catch(() => {
        console.log('Error updating order note');
      })
      .finally(() => {
        if (drawerClose) {
          drawerClose.querySelector('.cart-dialog').classList.remove('active');
        }
      });
  }
}

customElements.define('cart-note-save', cartOrderNoteSave);
 

class cartRecomendationToggle extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', this.openProductRecomdentation.bind(this));
  }
  openProductRecomdentation() {
    const drawerRecomdedContent = document.querySelector('cart-drawer-product-recommendations-content');
    drawerRecomdedContent.classList.add('active');
    console.log('working');
    setTimeout(()=>{
      console.log('working focuse');
      trapFocus(drawerRecomdedContent);
    }, 500);
  }
}
customElements.define('recommendation-arrow', cartRecomendationToggle);

class cartRecomendationBack extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', this.backProductRecomdentation.bind(this));
  }
  backProductRecomdentation() {
    const drawerRecomdedContentTrigger = document.querySelector('recommendation-arrow');
    const drawerRecomdedContentTriggerButton = drawerRecomdedContentTrigger.querySelector('button');
    const cartDrawer = document.querySelector('cart-drawer');
    const drawerRecomdedContent = document.querySelector('cart-drawer-product-recommendations-content');
    drawerRecomdedContent.classList.remove('active');
    console.log(cartDrawer);
    console.log(drawerRecomdedContentTrigger);
    setTimeout(()=>{
      // removeTrapFocus(drawerRecomdedContentTriggerButton);
      trapFocus(cartDrawer, drawerRecomdedContentTriggerButton);
    }, 500);
  }
}
customElements.define('drawer-back-button', cartRecomendationBack);