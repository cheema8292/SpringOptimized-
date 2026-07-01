if (!customElements.get('mega-menu')) {
  class HeaderMegaMenu extends HTMLElement {
    constructor() {
      super();
      this.openMenuStyle = this.dataset.openMenu;
      // Bind methods once
      this.onMouseEnter = this.onMouseEnter.bind(this);
      this.onMouseLeave = this.onMouseLeave.bind(this);
      this.toggleLink = this.toggleLink.bind(this);
      this.handleClickOutside = this.handleClickOutside.bind(this);
      this.handleEscape = this.handleEscape.bind(this);

    }

    connectedCallback() {
      this.navLinks = this.querySelectorAll('[nav-links]');
      this.childNavLinks = this.querySelectorAll('[nav-child-links]');
    
      this.dropDownMenuPositions();
      window.addEventListener('resize', this.dropDownMenuPositions.bind(this));

      if (this.openMenuStyle === 'click') {
        this.setupClickMenus();
        document.addEventListener('click', this.handleClickOutside);
        document.addEventListener('keydown', this.handleEscape);
      } else {
        this.setupHoverMenus();
      } 
    
        theme?.onMobileSizeChange?.((isMobile) => {
        if (!Shopify.designMode) return;
          if (!isMobile) {
            this.navLinks.forEach((el) => {
              if (el.__blockHandlersAttached) return; // prevent duplicates

              const onSelect = () => {
                const li = el.closest('li');
                const is_open = li.classList.contains('open');
                if (is_open) return;
                this.toggleLink(el, this.navLinks);
              };

              const onDeselect = () => {
                const li = el.closest('li');
                const is_open = li.classList.contains('open');
                if (is_open) {
                  this.toggleLink(el, this.navLinks);
                }
              };

              el.addEventListener('shopify:block:select', onSelect);
              el.addEventListener('shopify:block:deselect', onDeselect);

              el.__blockSelectHandler = onSelect;
              el.__blockDeselectHandler = onDeselect;
              el.__blockHandlersAttached = true;
            });
          } else {
            this.navLinks.forEach((el) => {
              if (el.__blockHandlersAttached) {
                el.removeEventListener('shopify:block:select', el.__blockSelectHandler);
                el.removeEventListener('shopify:block:deselect', el.__blockDeselectHandler);

                delete el.__blockSelectHandler;
                delete el.__blockDeselectHandler;
                delete el.__blockHandlersAttached;
              }
            });
          }
      });
    }
    handleEscape(event) {
        if (event.key === 'Escape') {
          this.closeAllMenus();
        }
      }

    setupHoverMenus() {
      [...this.navLinks, ...this.childNavLinks].forEach(link => {
        const li = link.closest('li');
        if (!li) return;

        const handleEnter = () => {
          li.classList.add('open');
        document.body.classList.add('has-header-overlay')
          this.onMouseEnter();
        };
        const handleLeave = () => {
          li.classList.remove('open');
        document.body.classList.remove('has-header-overlay')
          this.onMouseLeave();
        };

        li.addEventListener('mouseenter', handleEnter);
        li.addEventListener('mouseleave', handleLeave);

        li.addEventListener('focusin', handleEnter);
        li.addEventListener('focusout', handleLeave);

        // Save for cleanup
        link._hoverHandlers = { handleEnter, handleLeave };
      });
    }

    setupClickMenus() {
      const handleActivate = (e, link, linksGroup) => {
        e.preventDefault();
        this.toggleLink(link, linksGroup);
      };
      this.navLinks.forEach(link => {
        link.addEventListener('click', e => {
          e.preventDefault();
          this.toggleLink(link, this.navLinks);
        });
        link.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleActivate(e, link, this.navLinks);
          }
        });
      });

      this.childNavLinks.forEach(link => {
        link.addEventListener('click', e => {
          e.preventDefault();
          this.toggleLink(link, this.childNavLinks);
        });
        link.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleActivate(e, link, this.childNavLinks);
          }
        });
      });
    }

    toggleLink(clickedLink, allLinks) {
      const parentLi = clickedLink.closest('li');
      const isOpen = parentLi?.classList.contains('open');
      
      allLinks.forEach(link => {
        const li = link.closest('li');
        if (li) li.classList.remove('open');
      });

      if (parentLi && !isOpen) {
        parentLi.classList.add('open');
        document.body.classList.add('has-header-overlay')
        this.onMouseEnter();
      } else {
        this.onMouseLeave();
        document.body.classList.remove('has-header-overlay')

      }
    }

    handleClickOutside(event) {
        if (!this.contains(event.target)) {
          this.closeAllMenus();
        }
        }
    closeAllMenus() {
      const openItems = this.querySelectorAll('li.open');
      openItems.forEach(li => li.classList.remove('open'));
      document.body.classList.remove('has-header-overlay');
      this.onMouseLeave();
    }

    onMouseEnter() {
      document.body.classList.add('has-dropdown-menu');
    }

    onMouseLeave() {
      document.body.classList.remove('has-dropdown-menu');
    }

    dropDownMenuPositions() {
      const windowSize = window.innerWidth;

      [...this.navLinks].forEach(el => {
        const li = el.closest('li');
          if(li){
            li.classList.remove('menu-position-left');
          }
      });

      [...this.navLinks].forEach(menus => {
        const li = menus.closest('li');
        const rect = li.getBoundingClientRect();
        let currentPosition = rect.left + rect.width;

        const grandChildList = li.querySelector(".nav-dropdown");
        const masonrygrandChildList = li.querySelector(".masonry-wrapper");
        
        if (grandChildList) {
          currentPosition += grandChildList.getBoundingClientRect().width + 200;
        }
        if (masonrygrandChildList) {
          currentPosition += masonrygrandChildList.getBoundingClientRect().width;
        }
        
        if (currentPosition >= windowSize) {
          li.classList.add("menu-position-left");
        }
      });
    }

    disconnectedCallback() {
      if (this.openMenuStyle === 'hover') {
        [...this.navLinks, ...this.childNavLinks].forEach(link => {
          const li = link.closest('li');
          const handlers = link._hoverHandlers;
          if (li && handlers) {
            li.removeEventListener('mouseenter', handlers.handleEnter);
            li.removeEventListener('mouseleave', handlers.handleLeave);
          }
          delete link._hoverHandlers;
        });
      }

      if (this.openMenuStyle === 'click') {
        document.removeEventListener('click', this.handleClickOutside);
      }
    }
  }
  customElements.define('mega-menu', HeaderMegaMenu);
}