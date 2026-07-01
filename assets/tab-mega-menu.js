if (!customElements.get('tab-mega-menu')) {
  class MegaMenuTab extends HTMLElement {
    constructor() {
      super();
      this.tabMenu = Array.from(this.querySelectorAll('[tab-menu]'));
      this.tabContent = Array.from(this.querySelectorAll('[tab-content]'));
      this._onTabClick = this._onTabClick.bind(this);
    }

    connectedCallback() {
      if (!this.tabMenu.length) return;
      this.tabMenu.forEach((tab, index) => {
        tab.addEventListener('click', (e) => {
          e.preventDefault();
          this._onTabClick(index);
        });
      });
    }

    _onTabClick(activeIndex) {
      this.tabMenu.forEach((tab, idx) => {
        tab.classList.toggle('active', idx === activeIndex);
      });
      this.tabContent.forEach((content, idx) => {
        content.classList.toggle('active', idx === activeIndex);
      });
    }
  }
  customElements.define('tab-mega-menu', MegaMenuTab);
}
