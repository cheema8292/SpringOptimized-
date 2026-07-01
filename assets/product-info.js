if (!customElements.get('product-info')) {
  class ProductInfo extends HTMLElement {
    onVariantChangeUnsubscriber = void 0;
    cartUpdateUnsubscriber = void 0;
    abortController = void 0;
    pendingRequestUrl = null;
    preProcessHtmlCallbacks = [];
    postProcessHtmlCallbacks = [];
    constructor() {
      super();
      this.section = this.closest('section');
    }
    get sectionId() {
      return this.hasAttribute('data-original-section-id')
        ? this.getAttribute('data-original-section-id')
        : this.getAttribute('data-section-id');
    }
    get productId() {
      return this.getAttribute('data-product-id');
    }
    get productForm() {
      return this.querySelector('product-form');
    }
    get pickupAvailability() {
      return this.querySelector('pickup-availability');
    }
    get variantSelectors() {
      return this.querySelector('variant-selects');
    }
    get quantityInput() {
      return this.querySelector('quantity-input input');
    }
    get productLightbox() {
      return this.section?.querySelector('[data-product-media-content]');
    }
    connectedCallback() {
      this.onVariantChangeUnsubscriber = subscribe(
        PUB_SUB_EVENTS.optionValueSelectionChange,
        this.handleOptionValueChange.bind(this)
      );
      this.initQuantityHandlers();
      this.dispatchEvent(
        new CustomEvent('product-info:loaded', {
          bubbles: !0,
        })
      );
    }
    disconnectedCallback() {
      this.onVariantChangeUnsubscriber(), this.cartUpdateUnsubscriber?.();
    }
    handleOptionValueChange({ data: { event, target, selectedOptionValues } }) {
      if (!this.contains(event.target)) return;
      this.resetProductFormState();
      const productUrl = target.dataset.productUrl || this.pendingRequestUrl || this.dataset.url;
      this.pendingRequestUrl = productUrl;
      const shouldSwapProduct = this.dataset.url !== productUrl;
      const shouldFetchFullPage = this.dataset.updateUrl === 'true' && shouldSwapProduct;
      this.renderProductInfo({
        requestUrl: this.buildRequestUrlWithParams(productUrl, selectedOptionValues, shouldFetchFullPage),
        targetId: target.id,
        callback: shouldSwapProduct
          ? this.handleSwapProduct(productUrl, shouldFetchFullPage)
          : this.handleUpdateProductInfo(productUrl), 
      });
    }
    resetProductFormState() {
      this.productForm?.handleErrorMessage();
       this.productForm?.toggleSubmitButton(!0, '');
    } 
    handleSwapProduct(productUrl, updateFullPage) {
      return (html) => {
        this.productModal?.remove();
        const selector = updateFullPage ? "product-info[id^='product-info']" : 'product-info';
        const variant = this.getSelectedVariant(html.querySelector(selector));
        this.updateURL(productUrl, variant?.id);
        this.section = this.closest('section');
        if (updateFullPage) {
          document.querySelector('head title').innerHTML = html.querySelector('head title').innerHTML;
          HTMLUpdateUtility.viewTransition(
            document.querySelector('main'),
            html.querySelector('main'),
            this.preProcessHtmlCallbacks,
            this.postProcessHtmlCallbacks
          );
        } else {
          const newMediaGallery = html.querySelector('media-gallery');
          if (newMediaGallery) {
            HTMLUpdateUtility.viewTransition(
              this.section.querySelector('media-gallery'),
              html.querySelector('media-gallery'),
              this.preProcessHtmlCallbacks,
              this.postProcessHtmlCallbacks
            );
          }
          HTMLUpdateUtility.viewTransition(
            this,
            html.querySelector('product-info'),
            this.preProcessHtmlCallbacks,
            this.postProcessHtmlCallbacks
          );
        }
      };
    }
    renderProductInfo({ requestUrl, targetId, callback }) { 
      this.abortController?.abort(),
        (this.abortController = new AbortController()),
        fetch(requestUrl, {
          signal: this.abortController.signal,
        })
          .then((response) => response.text())
          .then((responseText) => {
            if (((this.pendingRequestUrl = null), callback !== void 0)) {
              const parsedHTML = new DOMParser().parseFromString(responseText, 'text/html');
              callback(parsedHTML);
            }
          })
          .then(() => { 
            const activeElement = document.getElementById(targetId);
            activeElement !== null &&
              (activeElement.hasAttribute('align-selected') &&
                activeElement.closest(activeElement.getAttribute('align-selected')).scrollTo({
                  left: activeElement.offsetLeft,
                  behavior: 'instant',
                }),
                setTimeout(() => {
                  activeElement.focus({
                    preventScroll: !0,
                  });
                }, 100));
          })
          .catch((error) => {
            error.name === 'AbortError' ? console.log('Fetch aborted by user') : console.error(error);
          });
    }
    buildRequestUrlWithParams(url, optionValues, shouldFetchFullPage = false) {
      const params = [];

      !shouldFetchFullPage && params.push(`section_id=${this.sectionId}`);

      if (optionValues.length) {
        params.push(`option_values=${optionValues.join(',')}`);
      }

      return `${url}?${params.join('&')}`;
    }
    handleUpdateProductInfo(productUrl) {
      return (parsedHTML) => {
        const variant = this.getSelectedVariant(parsedHTML);

        this.pickupAvailability?.update(variant);
        this.updateOptionValues(parsedHTML);
        this.updateURL(productUrl, variant?.id);
        this.updateVariantInputs(variant?.id);

        if (!variant) {
          this.setUnavailable();
          // return;
        }
        const updateSourceFromDestination = (id) => {
          if (!variant && id === 'Product-gallery') {
            return;
          }
          const source = parsedHTML.getElementById(`${id}-${this.sectionId}-${this.productId}`);
          const destination = document.querySelector(`#${id}-${this.sectionId}-${this.productId}`);
          if (source && destination) {
            destination.innerHTML = source.innerHTML;
            destination.removeAttribute('hidden');
          }
          
        };
        const elementsToUpdate = ['Price', 'StickyPrice', 'Sku', 'Inventory', 'PricePerItem', 'quantity-main-product', 'ProductBuyButtons', 'Product-gallery', 'Product-sticky-atc'];
        elementsToUpdate.forEach(updateSourceFromDestination);
        if (!variant) {
          this.setUnavailable();
          // return;
        }
        // this.updateMedia(parsedHTML, variant?.featured_media?.id);
        this.updateQuantityRules(this.sectionId, this.productId, parsedHTML);
        this.productForm?.toggleSubmitButton(!variant.available, window.variantStrings.soldOut);
        publish(PUB_SUB_EVENTS.variantChange, {
          data: {
            sectionId: this.sectionId,
            productId: this.productId,
            parsedHTML,
            variant,
          },
        });
        (this.productForm ?? document).dispatchEvent(
          new CustomEvent('variant:change', {
            detail: { variant },
          })
        );
      };
    }
    getSelectedVariant(productInfoNode) {
      const selectedVariant = productInfoNode.querySelector('[data-selected-variant]')?.textContent;
      return selectedVariant ? JSON.parse(selectedVariant) : null;
    }
    updateOptionValues(parsedHTML) {
      const variantSelects = parsedHTML.getElementById(`VariantPicker-${this.sectionId}-${this.productId}`);
      variantSelects &&
        HTMLUpdateUtility.viewTransition(this.variantSelectors, variantSelects, this.preProcessHtmlCallbacks);
    }
    updateURL(url, variantId) {
      this.querySelector('share-button')?.updateUrl(
        `${window.shopUrl}${url}${variantId ? `?variant=${variantId}` : ''}`
      );

      if (this.dataset.updateUrl === 'false') return;
      window.history.replaceState({}, '', `${url}${variantId ? `?variant=${variantId}` : ''}`);
    }
    updateVariantInputs(variantId) {
      if (!variantId) return;
      document
        .querySelectorAll(
          `#ProductForm-${this.sectionId}-${this.productId}, #ProductFormInstallment-${this.sectionId}-${this.productId}`
        )
        .forEach((productForm) => {
          const input = productForm.querySelector('input[name="id"]');
          (input.value = variantId ?? ''),
            input.dispatchEvent(
              new Event('change', {
                bubbles: !0,
              })
            );
        });
    }
    setUnavailable() {
      this.productForm?.toggleSubmitButton(!0, window.variantStrings.unavailable, !0);
      const selectors = ['Price', 'Inventory', 'Sku', 'PricePerItem', 'BackInStock', 'VolumeNote', 'QuantityRules']
        .map((id) => `#${id}-${this.sectionId}-${this.productId}`)
        .join(', ');
      document.querySelectorAll(selectors).forEach((selector) => selector.setAttribute('hidden', ''));
    }
    initQuantityHandlers() {
      this.quantityInput &&
        (this.setQuantityBoundries(),
          this.hasAttribute('data-original-section-id') ||
          (this.cartUpdateUnsubscriber = subscribe(
            PUB_SUB_EVENTS.cartUpdate,
            this.fetchQuantityRules.bind(this)
          )));
    }
    setQuantityBoundries() {
      publish(PUB_SUB_EVENTS.quantityBoundries, {
        data: {
          sectionId: this.sectionId,
          productId: this.productId,
        },
      });
    }
    fetchQuantityRules() {
      const currentVariantId = this.productForm?.variantIdInput?.value;
      currentVariantId &&
        (this.querySelector('label[is="quantity-label"]')?.setAttribute('aria-busy', 'true'),
          fetch(`${this.getAttribute('data-product-url')}?variant=${currentVariantId}&section_id=${this.sectionId}`)
            .then((response) => response.text())
            .then((responseText) => {
              const parsedHTML = new DOMParser().parseFromString(responseText, 'text/html');
              this.updateQuantityRules(this.sectionId, this.productId, parsedHTML);
            })
            .catch((error) => {
              console.error(error);
            })
            .finally(() => {
              this.querySelector('label[is="quantity-label"]')?.removeAttribute('aria-busy');
            }));
    }
    updateQuantityRules(sectionId, productId, parsedHTML) {
      this.quantityInput &&
        (publish(PUB_SUB_EVENTS.quantityRules, {
          data: {
            sectionId,
            productId,
            parsedHTML,
          },
        }),
          this.setQuantityBoundries());
    }
    updateMedia(parsedHTML, variantFeaturedMediaId) {
      if (!variantFeaturedMediaId) return;

      const id = 'MediaGallery';
      const source = parsedHTML.getElementById(`${id}-${this.sectionId}-${this.productId}`);
      const destination = document.querySelector(`#${id}-${this.sectionId}-${this.productId}`);

      if (source && destination) {
        destination.innerHTML = source.innerHTML;
        /*destination.removeAttribute('hidden');

        const primarySlider = destination.querySelector('[data-product-main-slider]');
        const thumbnailSlider = destination.querySelector('[data-product-thumbnail-slider]');

        if (primarySlider && thumbnailSlider) {
          const primaryInstance = theme.SwiperSliderInit(
            primarySlider,
            JSON.parse(primarySlider.getAttribute('data-swiper'))
          );
          const thumbnailInstance = theme.SwiperSliderInit(
            thumbnailSlider,
            JSON.parse(thumbnailSlider.getAttribute('data-swiper'))
          );
          primaryInstance.thumbs.swiper = thumbnailInstance;
          primaryInstance.thumbs.init();
        } else if (primarySlider) {
          const primaryInstance = theme.SwiperSliderInit(
            primarySlider,
            JSON.parse(primarySlider.getAttribute('data-swiper'))
          );
        }*/
      }
      if (this.productLightbox) {
        const sourceLightBox = parsedHTML.querySelector(`[data-product-media-content]`);
        const destinationLightbox = document.querySelector(`[data-product-media-content]`);
        if (sourceLightBox && destinationLightbox) {
          destinationLightbox.innerHTML = sourceLightBox.innerHTML;
        }
      }
    }
  }
  customElements.define('product-info', ProductInfo);
}
if (!customElements.get('quantity-set')) {
  class QuantitySelector extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.isUpdating = false;
      this.input = this.querySelector('input');
      this.updateButtonState();
      this.handleShowMore();
      this.buttons = Array.from(this.querySelectorAll('.quantity-button'));

      this.buttons.forEach((button) => button.addEventListener('click', this.onButtonClick.bind(this)));
      this.input.addEventListener('change', this.onButtonClick.bind(this));
    }

    onButtonClick(event) {
      event.preventDefault();

      // Prevent multiple clicks if an update is already happening
      if (this.isUpdating) return;
      this.isUpdating = true;

      const previousValue = this.input.value;
      let step = parseInt(this.input.step);
      // Adjust the value based on the button clicked
      if (event.currentTarget.name === 'plus') {
        this.input.value = parseInt(this.input.value) + step; // Increment the value
      } else {
        this.input.value = parseInt(this.input.value) - step; // Decrement the value
      }

      // If the value has changed, dispatch the change event
      if (previousValue !== this.input.value) {
        const changeEvent = new Event('change', { bubbles: true, cancelable: true });
        this.input.dispatchEvent(changeEvent);
      }

      this.updateButtonState();

      // Reset the flag after a slight delay (you can adjust the delay as needed)
      setTimeout(() => {
        this.isUpdating = false;
      }, 100); // 100ms delay
    }

    updateButtonState() {
      const minusButton = this.querySelector('[name="minus"]');
      const plusButton = this.querySelector('[name="plus"]');

      // Disable the minus button if the value is 1
      if (parseInt(this.input.value) <= 1) {
        minusButton.disabled = true;
        this.input.value = parseInt(this.input.step);
      } else {
        minusButton.disabled = false;
      }
    }

    get showMoreButton() {
      return this.closest('section')?.querySelector('show-more-button button');
    }

    handleShowMore() {
      const isShowingMore = Boolean(this.showMoreButton);

      if (isShowingMore) {
        this.showMoreButton.addEventListener('click', (event) => {
          event.preventDefault();

          this.showMoreButton
            .closest('volume-pricing')
            .querySelectorAll('.show-more-item.hidden')
            .forEach((hiddenItem) => hiddenItem.classList.remove('hidden', 'show-more-item'));
          this.showMoreButton.classList.add('hidden');
        });
      }
    }
  }
  customElements.define('quantity-set', QuantitySelector);
}

if (!customElements.get('product-recommendations')) {
  class ProductRecommendations extends HTMLElement {
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
          if (recommendations && recommendations.innerHTML.trim().length) {
            this.innerHTML = recommendations.innerHTML;
          }
          if (this.querySelector('[data-swiper]')) {
            this.mySwiper = null;
            const element = this.querySelector('[data-swiper]');
            const properties = JSON.parse(element.getAttribute('data-swiper'));
            const init = () => {
              if (!this.mySwiper) {
                this.mySwiper = theme.SwiperSliderInit(element, properties);
              }
            };
            const destroy = () => {
              if (this.mySwiper) {
                this.mySwiper.destroy(true, true);
                this.mySwiper = null;
              }
            };
            theme.onMobileSizeChange((isMobile) => {
              if (isMobile) {
                destroy(); 
              } else {
                init();
              }
            });
          }
        })
        .catch((error) => {
          console.error('Error fetching recommendations:', error);
        });
    }
  }
  customElements.define('product-recommendations', ProductRecommendations);
}