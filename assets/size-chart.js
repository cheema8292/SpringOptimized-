
  
  if (!customElements.get('size-chart')) {
    class Sizechart extends HTMLElement {
      constructor() {
        super();
        this.btn = this.querySelector('[size-chart-btn]');
        this.content = this.querySelector('[data-size-chart-content]');
        this.template = this.content.querySelector('template');
        this.section_id = this.dataset.sectionId;
        if (!this.template) return;
      }
      connectedCallback() {
        if (this.btn) {
          this.btn.addEventListener('click', this.handleOpenPopup.bind(this));
        }
      }
      handleOpenPopup() {
        const sizeChartContent = this.template.content.firstElementChild.cloneNode(true);
        document.body.appendChild(sizeChartContent);
        this.popup = document.querySelector(`#size-chart-${this.section_id}`);
        if (!this.popup) return;
        this.popup.classList.add('show');
        document.body.classList.add('overflow-hidden');
        setTimeout(() => {
          trapFocus(this.popup);
        }, 500);
        this.getPopUpSizechart = document.querySelector('size-chart-pop-up');
        if (!this.getPopUpSizechart) return;
        this.closeBtnSizeChart = this.getPopUpSizechart.querySelector('[data-popup-close]');
        this.closeOverlayClick = this.getPopUpSizechart.querySelector('[data-popup-close-overlay]');
        this.closeBtnSizeChart.addEventListener('click', () => {
          this.handleClosePopup();
        });
        this.closeOverlayClick.addEventListener('click', () => {
          this.handleClosePopup();
        });
        document.addEventListener('keydown', (event) => {
          if (event.key === 'Escape' && this.popup.classList.contains('show')) {
            this.handleClosePopup();
          }
        });
      }
      handleClosePopup() {
        this.popup = document.querySelector(`#size-chart-${this.section_id}`);
        if (!this.popup) return;
        this.popup.classList.remove('show');
        document.body.classList.remove('overflow-hidden');
        this.popup.remove();
        setTimeout(() => {
          if(this.btn){
            removeTrapFocus(this.btn);
          }
        }, 300);
      }
    }
    customElements.define('size-chart', Sizechart);
  }