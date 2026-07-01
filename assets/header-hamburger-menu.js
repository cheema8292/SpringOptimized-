if (!customElements.get('hamburger-wrapper')) {
  class HamburgerWrapper extends HTMLElement {
    constructor() {
      super();

      this.menuLists = this.querySelectorAll('[hamburger-submenu-menu-list]');
      this.subMenus = this.querySelectorAll('[submenu-link]');
      this.openMenuStyle = this.dataset.openMenu;
      this.attachNavLinkListeners(this.openMenuStyle);
    }

    connectedCallback() {
      requestAnimationFrame(() => this.setHeights());
    }
  
    attachNavLinkListeners(type) {
      const navLinks = this.querySelectorAll('[nav-links]');
      const childNavLinks = this.querySelectorAll('[nav-child-links]');

      // const eventType = type === 'hover' ? 'mouseenter' : 'click';
      // const childEventType = type === 'hover' ? 'mouseleave' : 'click';
      const eventType = 'click';
      const childEventType = 'click';

      navLinks.forEach(link =>{
        link.addEventListener(eventType, () => this.toggleActiveLink(link, navLinks));
          link.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
              this.toggleActiveLink(link, navLinks);
                setTimeout(() => {
                  trapFocus(this,link);
                }, 500);
            }
          });
        
      }); 
      
      childNavLinks.forEach(link =>{ 
        link.addEventListener(childEventType, () => this.toggleActiveLink(link, childNavLinks))
          link.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
              this.toggleActiveLink(link, childNavLinks)
            }
          });
      });
    }

    toggleActiveLink(activeLink, linkGroup) {
      linkGroup.forEach(link => link.classList.remove('open'));
      activeLink.classList.add('open');
    }

    setHeights() {
      this.menuLists.forEach(ul => {
        const height = ul.offsetHeight;
        const li = ul.closest('li');
        if (li) li.style.setProperty('--menuHeight', `${height}px`);
      });

      this.subMenus.forEach(el => {
        const height = el.offsetHeight;
        const li = el.closest('li');
        if (li) li.style.setProperty('--subMenuTitleHeight', `${height}px`);
      });
    }
  }
  customElements.define('hamburger-wrapper', HamburgerWrapper);
}