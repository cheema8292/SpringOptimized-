if (!customElements.get("overlap-content")) {
  class OverlapContent extends HTMLElement {
    connectedCallback() {
      this.update();
      this.throttledUpdate = OverlapContent.throttle(
        this.update.bind(this),
        100
      );
      this.resizeObserver = new ResizeObserver(this.throttledUpdate);
      this.resizeObserver.observe(document.querySelector("#MainContent"));
      if (Shopify.designMode) {
        this.addeventListener("shopify:section:load", this.update.bind(this));
        this.addeventListener("shopify:section:unload", this.update.bind(this));
        this.addeventListener("shopify:section:reorder", this.update.bind(this));
      }
    }

    disconnectedCallback() {
      this.resizeObserver.disconnect();
      if (Shopify.designMode) {
        this.removeEventListener("shopify:section:load", this.update.bind(this));
        this.removeEventListener("shopify:section:unload", this.update.bind(this));
        this.removeEventListener("shopify:section:reorder", this.update.bind(this));
      }
    }

    update() {
      // Set height, padding, overlapping based on neighbouring sections
      const outerSection = this.closest(".shopify-section");

      // Check if next section has trust-icons-section class
      const nextSection = outerSection.nextElementSibling;
      if ((!nextSection || !nextSection.classList.contains("trust-icons-section"))) {
        return; // Exit early if neither next nor previous section has the required class
      }


      let overlapBottomHeight = 0;
      let section = outerSection;
      for (let i = 0; i < this.dataset.countBelow; i++) {
        if (section.nextElementSibling) {
          section = section.nextElementSibling;
          overlapBottomHeight += section.getBoundingClientRect().height;
          section.querySelector("[data-position]").classList.add("pos-relative");
        }
      }
      this.style.setProperty("--overlap-content-bottom", `${overlapBottomHeight}px`);
    }

    static throttle(func, limit) {
      let lastCall = 0;
      let timeout;
      return function (...args) {
        const now = Date.now();
        clearTimeout(timeout);
        if (now - lastCall >= limit) {
          lastCall = now;
          func(...args);
        } else {
          timeout = setTimeout(() => func(...args), limit - (now - lastCall));
        }
      };
    }
  }
  customElements.define("overlap-content", OverlapContent);
}