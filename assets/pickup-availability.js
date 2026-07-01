if (!customElements.get('pickup-availability')) {
  customElements.define(
    'pickup-availability',
    class PickupAvailability extends HTMLElement {
      constructor() {
        super();
        if (!this.hasAttribute('available')) return;

        this.errorHtml = this.querySelector('template').content.firstElementChild.cloneNode(true);
        this.onClickRefreshList = this.onClickRefreshList.bind(this);
        this.fetchAvailability(this.dataset.variantId);
      }

      fetchAvailability(variantId) {
        if (!variantId) return;

        let rootUrl = this.dataset.rootUrl;
        if (!rootUrl.endsWith('/')) {
          rootUrl = rootUrl + '/';
        }
        const variantSectionUrl = `${rootUrl}variants/${variantId}/?section_id=pickup-availability`;

        fetch(variantSectionUrl)
          .then((response) => response.text())
          .then((text) => {
            const sectionInnerHTML = new DOMParser()
              .parseFromString(text, 'text/html')
              .querySelector('.shopify-section');
            this.renderPreview(sectionInnerHTML);
          })
          .catch((e) => {
            const button = this.querySelector('button');
            if (button) button.removeEventListener('click', this.onClickRefreshList);
            this.renderError();
          });
      }

      onClickRefreshList() {
        this.fetchAvailability(this.dataset.variantId);
      }

      update(variant) {
        if (variant?.available) {
          // Update the data-variant-id attribute
          this.dataset.variantId = variant.id;
          this.fetchAvailability(variant.id);
        } else {
          this.removeAttribute('available');
          this.innerHTML = '';
          this.drawerTemplate = null;
        }
      }

      showDrawer(button) {
        // Remove any existing drawer from body
        const existingDrawer = document.querySelector('pickup-availability-drawer');
        if (existingDrawer) existingDrawer.remove();

        if (!this.drawerTemplate) return;

        // Create drawer from template and append to body
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.drawerTemplate;
        const drawer = tempDiv.firstElementChild;

        if (drawer) {
          document.body.appendChild(drawer);
          setTimeout(() => {
            drawer.show(button);
          }, 200);
        }
      }

      renderError() {
        this.innerHTML = '';
        this.appendChild(this.errorHtml);

        this.querySelector('button').addEventListener('click', this.onClickRefreshList);
      }

      renderPreview(sectionInnerHTML) {
        if (!sectionInnerHTML.querySelector('pickup-availability-preview')) {
          this.innerHTML = '';
          this.removeAttribute('available');
          return;
        }

        // Only render the preview, store drawer template for later use
        this.innerHTML = sectionInnerHTML.querySelector('pickup-availability-preview').outerHTML;
        this.setAttribute('available', '');

        // Store the drawer template in a data attribute for later extraction
        const drawerTemplate = sectionInnerHTML.querySelector('pickup-availability-drawer');
        if (drawerTemplate) {
          this.drawerTemplate = drawerTemplate.outerHTML;
        }

        const button = this.querySelector('button');
        if (button)
          button.addEventListener('click', (evt) => {
            this.showDrawer(evt.target);
          });
      }
    }
  );
}

if (!customElements.get('pickup-availability-drawer')) {
  customElements.define(
    'pickup-availability-drawer',
    class PickupAvailabilityDrawer extends HTMLElement {
      constructor() {
        super();
        this.focusElement = null;
        this.onBodyClick = this.handleBodyClick.bind(this);

        this.querySelector('button').addEventListener('click', () => {
          this.hide();
        });

        this.querySelector('[drawer-close]').addEventListener('click', () => {
          this.hide();
        });

        this.addEventListener('keyup', (event) => {
          if (event.code.toUpperCase() === 'ESCAPE') this.hide();
        });
      }

      handleBodyClick(evt) {
        const target = evt.target;
        if (
          target != this &&
          !target.closest('pickup-availability-drawer') &&
          !target.classList.contains('pickup-availability-button')
        ) {
          this.hide();
        }
      }

      hide() {
        // this.removeAttribute('open');
        this.classList.remove('drawer-open');
        setTimeout(() => {
          this.removeAttribute('drawer-open');
        }, 300);
        document.body.removeEventListener('click', this.onBodyClick);
        document.body.classList.remove('overflow-hidden');
        setTimeout(() => {
        removeTrapFocus(this.focusElement);
          setTimeout(() => {
            this.remove();
          }, 200);
        }, 300);
        // Remove drawer from DOM when hiding
      
      }

      show(focusElement) {
        this.focusElement = focusElement;
        this.setAttribute('drawer-open', '');
        setTimeout(() => {
          this.classList.add('drawer-open');
          setTimeout(() => {
            trapFocus(this);
          }, 200);
        }, 500);

        document.body.addEventListener('click', this.onBodyClick);
        document.body.classList.add('overflow-hidden');
      }
    }
  );
}
