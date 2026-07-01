if (!customElements.get('mobile-menu')) {
  class MobileMenu extends HTMLElement {
    constructor() {
      super();

      // Store Locator Button Logic
      this.storeLocatorBtn = this.querySelector('[announcement-store-locator]');
      if (this.storeLocatorBtn) {
        this.storeLocatorBtn.addEventListener('click', () => {
          const store_locator = document.querySelector('store-locator-drawer');
          if (store_locator) {
            store_locator.setAttribute('drawer-open', '');
            setTimeout(() => {
              store_locator.classList.add('drawer-open');
            }, 500);
          }
        });
      }

      // Accordion open/close on focus
      this.detailsElements = this.querySelectorAll('details');

      this.detailsElements.forEach((details) => {
        // Open when focused
         details.addEventListener('click', (e) => {
          if (e.target.tagName === 'A' || e.target.closest('a')) return;
          e.preventDefault()
           if (details.getAttribute('open')) {
              details.removeAttribute('open');
              return;
            }
           this.detailsElements.forEach((removeAttribute)=>{
            removeAttribute.removeAttribute('open');
           })
          details.setAttribute('open', '');
        });
        // details.addEventListener('focusin', () => {
        //   details.setAttribute('open', '');
        // });

        // Close when focus leaves (not when clicking inside)
        // details.addEventListener('focusout', (event) => {
        //   // Use setTimeout so it triggers after focus actually leaves the element
        //   setTimeout(() => {
        //     if (!details.contains(document.activeElement)) {
        //       details.removeAttribute('open');
        //     }
        //   }, 0);
        // });
      });
    }
  }

  customElements.define('mobile-menu', MobileMenu);
}
