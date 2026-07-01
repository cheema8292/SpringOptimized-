if (!customElements.get('mega-menu-collection')) {
  class MegaMenuCollection extends HTMLElement {
    constructor() {
      super();
      this.tabMenu = Array.from(this.querySelectorAll('[tab-menu]'));
      this.tabContent = Array.from(this.querySelectorAll('[tab-content]'));
        this._onTabClick = this._onTabClick.bind(this);
        this.swiperIntiate();
    }

    connectedCallback() {
      if (!this.tabMenu.length) return;
      this.tabMenu.forEach((tab, index) => {
        tab.addEventListener('click', (e) =>{
          e.preventDefault();
          this._onTabClick(index)} );
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
      swiperIntiate() {
      this.tabContent.forEach((swiper) => {
        const swiperProperty = swiper.dataset.swiper;
          if (!swiperProperty) return;
        const properties = JSON.parse(swiperProperty);
          if(swiper.classList.contains('swiper')){
              theme.SwiperSliderInit(swiper,properties );
          }
      });
    
    } 
  }
  customElements.define('mega-menu-collection', MegaMenuCollection);
}