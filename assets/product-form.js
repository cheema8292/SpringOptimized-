if (!customElements.get('product-form')) {
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
      constructor() {
        super();
        this.form = this.querySelector('form');
        this.section = this.closest('.shopify-section');
        this.sectionId = this.dataset.sectionId
        this.productId = this.dataset.productId
        this.bundleForm = false;
        this.bundleSection = null;
        if (this.form.hasAttribute('bundle-product-form')) {
          this.bundleForm = true;
          this.bundleSection = this.closest('bundle-products-card');
        }
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        this.cartNotification = document.querySelector('cart-notification');
        this.cart = document.querySelector('cart-drawer');
        if (!this.bundleForm) { 
          this.variantIdInput.disabled = false;
          this.submitButton = this.querySelector('[type="submit"]');
          this.submitButtonText = this.submitButton.querySelector('span');
          if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');
          this.hideErrors = this.dataset.hideErrors === 'true';

          // Find the sticky add to cart button that's associated with this form
          this.stickyButton = document.querySelector(`#Sticky-ProductSubmitButton-${this.sectionId}-${this.productId}`);
          // console.log('this.stickyButtonthis.stickyButton', this.stickyButton, this.dataset.sectionId, this.dataset.productId);
          if (this.stickyButton) {
            this.stickyButtonText = this.stickyButton.querySelector('span');
            if (document.querySelector('cart-drawer')) this.stickyButton.setAttribute('aria-haspopup', 'dialog');
          }
        }
      }
      connectedCallbackOLDD() {
        if (this.bundleForm) return;
        let attempts = 0;
        const tryResolve = () => {
          this.stickyButton = document.querySelector(`button[form="${this.form.id}"]`);
          if (this.stickyButton) {
            this.stickyButtonText = this.stickyButton.querySelector('span');
            if (document.querySelector('cart-drawer')) this.stickyButton.setAttribute('aria-haspopup', 'dialog');
            return;
          }
          attempts++;
          if (attempts < 10) requestAnimationFrame(tryResolve);
        };
        requestAnimationFrame(tryResolve);
        // console.log('this.stickyButton', this.stickyButton);
      }
      onSubmitHandler(evt) {
        evt.preventDefault();
        
        window.setLastFocusedElement(this.submitButton);

        if (!this.bundleForm) {
          if (this.submitButton.getAttribute('aria-disabled') === 'true') return;
          // Also check sticky button if it exists
          if (this.stickyButton && this.stickyButton.getAttribute('aria-disabled') === 'true') return;
        }
        this.handleErrorMessage();
        this.cart_drawer = this.closest('drawer-section-view');
        if (!this.bundleForm) {
          this.submitButton.setAttribute('aria-disabled', true);
          this.submitButton.classList.add('loading');
          this.querySelector('.loading-spinner-dots').classList.remove('hidden');

          // Also update sticky button if it exists
          if (this.stickyButton) {
            this.stickyButton.setAttribute('aria-disabled', true);
            this.stickyButton.classList.add('loading');
            const stickySpinner = this.stickyButton.querySelector('.loading-spinner-dots');
            if (stickySpinner) stickySpinner.classList.remove('hidden');
          }
        }
        const config = theme.utils.fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        delete config.headers['Content-Type'];
        const formData = new FormData(this.form);
        const payloadJson = {};
        for (let [key, value] of formData.entries()) {
          if (key != 'id' && key != 'quantity') {
            payloadJson[key] = value;
          }
        }

        // if (this.cartNotification) {
        //   formData.append('sections',this.cartNotification.getSectionsToRender().map((section) => section.id));
        //   formData.append('sections_url', window.location.pathname);
        //   // this.cartNotification.setActiveElement(document.activeElement);
        //   payloadJson.sections = this.cartNotification.getSectionsToRender().map((section) => section.id).join(',');
        //   payloadJson.sections_url = window.location.pathname;
        // }

        // if (this.cart) {
        //   formData.append('sections',this.cart.getSectionsToRender().map((section) => section.id));
        //   formData.append('sections_url', window.location.pathname);
        //   this.cart.setActiveElement(document.activeElement);
        //   payloadJson.sections = this.cart.getSectionsToRender().map((section) => section.id).join(',');
        //   payloadJson.sections_url = window.location.pathname;
        // }

        const allSections = [];

        if (this.cartNotification) {
          allSections.push(...this.cartNotification.getSectionsToRender().map(section => section.id));
        }

        if (this.cart) {
          allSections.push(...this.cart.getSectionsToRender().map(section => section.id));
        }

        // Deduplicate
        const uniqueSections = [...new Set(allSections)];

        if (uniqueSections.length > 0) {
          const sectionsString = uniqueSections.join(',');
          formData.set('sections', sectionsString); // use set instead of append
          formData.set('sections_url', window.location.pathname);

          payloadJson.sections = sectionsString;
          payloadJson.sections_url = window.location.pathname;
        }


        const items = [];
        const complementoryProducts = document.querySelector('complementary-product');
        if (complementoryProducts) {
          const values_checked = Array.from(complementoryProducts.querySelectorAll('input[name="complementory_product"]:checked')).map(cb => cb.value);
          if (values_checked && values_checked.length > 0 && !this.cart_drawer) {
            const mainProductVariant = this.querySelector('input[name="id"]').value;
            const idInputQuantity = `Quantity-${this.querySelector('input[name="section-id"]').value}`;
            const quantityMain = document.getElementById(idInputQuantity).value;
            items.push({ id: mainProductVariant, quantity: quantityMain });
            values_checked.forEach((val) => {
              const variantId = parseInt(val);
              const quantity = parseInt(1);
              items.push({ id: variantId, quantity: quantity });
            })
            payloadJson.items = items;
            config.headers['Content-Type'] = 'application/json';
            config.body = JSON.stringify(payloadJson);
          } else {
            config.body = formData;
          }
        } else {
          config.body = formData;
        }
        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              publish(PUB_SUB_EVENTS.cartError, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                errors: response.errors || response.description,
                message: response.message,
              });
              this.handleErrorMessage(response.description);
              const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
              if (!soldOutMessage) return;
              this.submitButton.setAttribute('aria-disabled', true);
              this.submitButtonText.classList.add('hidden');
              soldOutMessage.classList.remove('hidden');

              // Also update sticky button if it exists
              if (this.stickyButton) {
                this.stickyButton.setAttribute('aria-disabled', true);
                const stickySoldOutMessage = this.stickyButton.querySelector('.sold-out-message');
                if (stickySoldOutMessage) {
                  this.stickyButtonText.classList.add('hidden');
                  stickySoldOutMessage.classList.remove('hidden');
                }
              }

              this.error = true;
              return;
            } else if (!this.cart) {
              window.location = window.routes.cart_url;
              return;
            }
            const startMarker = CartPerformance.createStartingMarker('add:wait-for-subscribers');
            if (!this.error)
              publish(PUB_SUB_EVENTS.cartUpdate, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                cartData: response,
              }).then(() => {
                CartPerformance.measureFromMarker('add:wait-for-subscribers', startMarker);
              });

            this.error = false;
            const quickAddModal = this.closest('drawer-section-view');
            if (quickAddModal) {
              quickAddModal.classList.remove('drawer-open');
              setTimeout(() => {
                quickAddModal.removeAttribute('drawer-open');
              }, 300);
              document.body.classList.remove('overflow-hidden');

              setTimeout(() => {
                CartPerformance.measure("add:paint-updated-sections", () => {
                  if (this.cartNotification) {
                    this.cart.renderContents(response, true);
                    this.cartNotification.renderContents(response);
                  } else {
                    this.cart.renderContents(response);
                  }
                });
              }, 500);
              // quickAddModal.hide(true);
            } else {
              CartPerformance.measure("add:paint-updated-sections", () => {
                if (this.cartNotification) {
                  this.cart.renderContents(response, true);
                  this.cartNotification.renderContents(response);
                } else {
                  this.cart.renderContents(response);
                }
              });
            }
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
            if (!this.bundleForm) {
              this.submitButton.classList.remove('loading');
              if (!this.error) this.submitButton.removeAttribute('aria-disabled');
              this.querySelector('.loading-spinner-dots').classList.add('hidden');

              // Also update sticky button if it exists
              if (this.stickyButton) {
                this.stickyButton.classList.remove('loading');
                if (!this.error) this.stickyButton.removeAttribute('aria-disabled');
                const stickySpinner = this.stickyButton.querySelector('.loading-spinner-dots');
                if (stickySpinner) stickySpinner.classList.add('hidden');
              }
            }
            if (this.bundleForm && this.bundleSection != null) {
              this.clearAllButton = this.bundleSection.querySelector('[remove-all-bundle-product]');
              setTimeout(() => {
                this.clearAllButton.dispatchEvent(new Event('click', { bubbles: true }));
              }, 150);
            }
            CartPerformance.measureFromEvent("add:user-action", evt);
          });

      }
      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;
        this.errorMessageWrapper =
          this.errorMessageWrapper || this.section?.querySelector('.product-form__error-message-wrapper');
        if (!this.errorMessageWrapper) return;
        this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

        this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage; 
        }
      }

      toggleSubmitButton(disable = true, text) {
        if (disable) {
          this.submitButton.setAttribute('disabled', 'disabled');
          if (text) this.submitButtonText.textContent = text;

          // Also update sticky button if it exists 
          if (this.stickyButton) {
            this.stickyButton.setAttribute('disabled', 'disabled');
            if (text && this.stickyButtonText) this.stickyButtonText.textContent = text;
          }
        } else {
          this.submitButton.removeAttribute('disabled');
          this.submitButtonText.textContent = window.variantStrings.addToCart;

          // Also update sticky button if it exists
          if (this.stickyButton) {
            this.stickyButton.removeAttribute('disabled');
            if (this.stickyButtonText) this.stickyButtonText.textContent = window.variantStrings.addToCart;
          }
        }
      }

      get variantIdInput() {
        return this.form.querySelector('[name=id]');
      }
    }
  );
}

// StickyATC Custom Element Class
if (!customElements.get('sticky-atc')) {
  customElements.define(
    'sticky-atc',
    class StickyATC extends HTMLElement {
      constructor() {
        super();
        this.interlinkElements = this.querySelectorAll('[data-interlink-to]');
        this.closeButton = this.querySelector('[data-close-btn]');
        this.targetSection = null;
        this.observer = null;
        this.footerVisible = false;
        this.sectionVisible = true;
        this.isActive = false;
        this.isClosed = false;
      }

      connectedCallback() {
        this.initSmoothScroll();
        this.initIntersectionObserver();
        this.initCloseButton();
      }

      disconnectedCallback() {
        if (this.observer) {
          this.observer.disconnect();
        }
        if (this.scrollHandler) {
          window.removeEventListener('scroll', this.scrollHandler);
        }
      }

      initSmoothScroll() {
        this.interlinkElements.forEach(element => {
          element.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = element.getAttribute('data-interlink-to');
            this.scrollToSection(sectionId);
          });
        });
      }

      scrollToSection(sectionId) {
        const targetElement = document.getElementById(sectionId);
        if (targetElement) {
          const headerHeight = this.getHeaderHeight();
          const targetPosition = targetElement.offsetTop - headerHeight - 20; // 20px offset for better visibility

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }

      getHeaderHeight() {
        const header = document.querySelector('.section-header');
        return header ? header.offsetHeight : 0;
      }

      initIntersectionObserver() {
        // Find the closest product section to observe
        // this.targetSection = this.closest('.shopify-section') || this.closest('[data-section-type]');
        this.targetSection = this.closest('.shopify-section').querySelector('product-form') || this.closest('.shopify-section');

        if (!this.targetSection) {
          console.warn('StickyATC: Could not find target section to observe');
          return;
        }
        const footer = document.querySelector('footer');

        // Track scroll direction and whether we've crossed the product form
        this.hasScrolledPast = false;
        this.lastScrollY = window.scrollY;

        this.observer = new IntersectionObserver(
          (entries) => {
            entries.forEach(entry => {
              if (entry.target === this.targetSection) {
                this.sectionVisible = entry.intersectionRatio > 0;
                // If section is not visible and we've scrolled down past it, show sticky
                if (!this.sectionVisible && this.hasScrolledPast) {
                  this.sectionVisible = false; // Keep as not visible
                }
              } else if (footer && entry.target === footer) {
                this.footerVisible = entry.isIntersecting;
              }
            });
            this.updateStickyState();
          },
          {
            root: null, // Use viewport as root
            rootMargin: '0px',
            threshold: [0, 1] // Track in/out of view
          }
        );

        // Add scroll listener to track when we've scrolled past the product form
        this.scrollHandler = () => {
          const currentScrollY = window.scrollY;
          const scrollDirection = currentScrollY > this.lastScrollY ? 'down' : 'up';

          // Check if we've scrolled past the product form (downward)
          if (scrollDirection === 'down' && !this.sectionVisible) {
            this.hasScrolledPast = true;
          } else if (scrollDirection === 'up' && this.sectionVisible) {
            // Reset when scrolling back up and section becomes visible
            this.hasScrolledPast = false;
          }

          this.lastScrollY = currentScrollY;
          this.updateStickyState();
        };

        window.addEventListener('scroll', this.scrollHandler, { passive: true });

        this.observer.observe(this.targetSection);
        if (footer) this.observer.observe(footer);
      }

      initCloseButton() {
        if (this.closeButton) {
          this.closeButton.addEventListener('click', () => {
            const host = this.closest('[data-sticky-atc]');
            if (host) {
              host.classList.remove('active');
              this.isClosed = true;
              this.isActive = false;
              setTimeout(() => {
                host.classList.add('hidden');
              }, 300);
            }
          });
        }
      }

      updateStickyState() {
        const host = this.closest('[data-sticky-atc]');
        if (!host) return;

        // Don't show sticky ATC if it has been closed by user
        if (this.isClosed) return;
        // Show sticky ATC only when we've scrolled past the product form AND it's not visible AND footer is not visible
        const shouldBeActive = this.hasScrolledPast && !this.sectionVisible && !this.footerVisible;
        if (shouldBeActive && !this.isActive) {
          host.classList.add('active');
          this.isActive = true;
        } else if (!shouldBeActive && this.isActive) {
          host.classList.remove('active');
          this.isActive = false;
        }
      }
    }
  );
}