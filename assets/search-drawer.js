
class SearchDrawerWrapper extends HTMLElement {
  constructor() {
    super();
    this.searchDrawer = null;
    this.isOpen = false;

    this.section = this.closest('.shopify-section');
    this.template = this.querySelector('template[data-type="search-drawer-terms"]');

    this.onClickHandler = this.onClickHandler.bind(this);
    this.onCloseClickHandler = this.onCloseClickHandler.bind(this);
    this.handleDocumentEvents = this.handleDocumentEvents.bind(this);
  }

  connectedCallback() {
    this.loadTemplate();

    // Design mode listeners
    if (Shopify.designMode && this.section) {
      this.section.addEventListener('shopify:section:select', () => this.open());
      this.section.addEventListener('shopify:section:deselect', () => this.close());
      this.section.addEventListener('shopify:section:unload', () => this.close());
      this.section.addEventListener('shopify:section:load', () => this.open());
    }

    // Triggers
    this.searchTrigger = document.querySelector('[data-header-search-trigger]');
    this.searchClose = this.querySelector('[drawer-close]');

    if (this.searchTrigger) {
      this.searchTrigger.addEventListener('click', this.onClickHandler);
      this.searchTrigger.addEventListener('keydown', this.onClickHandler);
    }

    if (this.searchClose) {
      this.searchClose.addEventListener('click', this.onCloseClickHandler);
      this.searchClose.addEventListener('keydown', this.onCloseClickHandler);
    }

    document.addEventListener('click', this.handleDocumentEvents);
    document.addEventListener('keydown', this.handleDocumentEvents);
  }

  disconnectedCallback() {
    if (this.searchTrigger) {
      this.searchTrigger.removeEventListener('click', this.onClickHandler);
      this.searchTrigger.removeEventListener('keydown', this.onClickHandler);
    }

    if (this.searchClose) {
      this.searchClose.removeEventListener('click', this.onCloseClickHandler);
      this.searchClose.removeEventListener('keydown', this.onCloseClickHandler);
    }

    document.removeEventListener('click', this.handleDocumentEvents);
    document.removeEventListener('keydown', this.handleDocumentEvents);
  }

  loadTemplate() {
    if (!this.querySelector('[is="search-drawer"]') && this.template) {
      const fragment = this.template.content.cloneNode(true);
      this.appendChild(fragment);
    }
    this.searchDrawer = this.querySelector('[is="search-drawer"]');
  }

  // Helper: check if event is valid trigger
  isValidTrigger(event) {
    return event.type === 'click' || event.key === 'Enter' || event.key === ' ';
  }

  onClickHandler(event) {
    if (!this.isValidTrigger(event)) return;
    event.preventDefault();
    event.stopPropagation();
    this.open();
  }

  onCloseClickHandler(event) {
    if (!this.isValidTrigger(event)) return;
    this.close();
  }

  open() {
    if (!this.searchDrawer) return;

    this.isOpen = true;
    this.searchDrawer.classList.add('drawer-open');
    this.searchDrawer.setAttribute('drawer-open', '');
    document.body.classList.add('overflow-hidden');

    const input = this.searchDrawer.querySelector('predictive-search-drawer input[type="search"]');
    if (input) {
      setTimeout(() => trapFocus(this.searchDrawer, input), 500);
    }
  }

  close() {
    if (!this.isOpen || !this.searchDrawer) return;

    this.isOpen = false;
    this.searchDrawer.classList.remove('drawer-open');
    this.searchDrawer.removeAttribute('drawer-open', '');
    document.body.classList.remove('overflow-hidden');
    const searchBtn = document.querySelector('[data-header-search-trigger]');
    if (searchBtn) {
      setTimeout(() => searchBtn.focus(), 300);
    }
    // removeTrapFocus(this.searchDrawer); // if you need to clean up
  }

  handleDocumentEvents(event) {
    if (!this.isOpen || !this.searchDrawer) return;

    const backdrop = this.searchDrawer.querySelector('[drawer-backdrop]');
    if (event.type === 'click' && event.target === backdrop) {
      this.close();
    }
    if (event.type === 'keydown' && event.key === 'Escape') {
      this.close();
    }
  }
}

customElements.define('search-drawer-wrapper', SearchDrawerWrapper);
