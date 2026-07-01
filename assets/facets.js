class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);
    this.applyButtonClick = this.applyButtonClick.bind(this);
    this.mobileModalbuttons = this.querySelectorAll("[drawer-close-btn], [data-apply-filters], .drawer-backdrop")
    this.openFilterDefault = this.dataset.open;
    this.filterStyle = this.dataset.type;
    this.datatogglefilter = document.body.querySelector('[data-toggle-filter]')
    this.form = this.querySelector('form');
    this.debouncedOnSubmit = this.debounce((event) => this.onSubmitHandler(event), 500);

    this.setupEventListeners();

    theme.onMobileSizeChange((isMobile) => this.handleMobileChange(isMobile));
    if (this.filterStyle === "horizontal") { 
      this.setupHorizontalFilters();
    }
  }
  connectedCallback(){
    if (this.filterStyle == "vertical") {
      this.addEventListener('keydown',this.onKeyUpEscape)
    }
    
  } 
   disconnectedCallback() {
    if (this.filterStyle == "vertical") {
      this.removeEventListener('keydown', this.onKeyUpEscape);
    }
  
  }
  onKeyUpEscape(event){
      if (event.type === 'keydown' && event.key === 'Escape') {
      if (this.classList.contains("expanded")) { 
      this.classList.remove('expanded');
      if(window.lastFocusedElement != null){
        window.returnFocusToLastElement();
      }
      document.body.classList.remove('overflow-hidden');
    }
    }
  }
  setupEventListeners() {
    if (this.form) {
      this.form.addEventListener('input', this.debouncedOnSubmit);

      this.form.addEventListener('keydown', (event) => {
        const target = event.target;

        if (
          target.tagName === 'INPUT' &&
          target.type === 'checkbox' &&
          (event.key === 'Enter' || event.key === ' ')
        ) {
          event.preventDefault();
          target.checked = !target.checked;
          this.debouncedOnSubmit(event);
        }
        if (
          target.tagName === 'LABEL' &&
          (event.key === 'Enter' || event.key === ' ')
        ) {
          event.preventDefault();

          const inputId = target.getAttribute('for');
          const hiddenCheckbox = document.getElementById(inputId);

          if (hiddenCheckbox) {
            hiddenCheckbox.checked = !hiddenCheckbox.checked;
            this.debouncedOnSubmit(event);
          }
        }
      });
    }

   
    if (this.filterStyle === "vertical") {
      if (this.mobileModalbuttons) {
        this.mobileModalbuttons.forEach((btn) => {
          btn.addEventListener('click', this.applyButtonClick.bind(this))
        })
      }
    }

    const filterContainer = this;

    filterContainer.addEventListener('click', (event) => {
      const toggleButton = event.target.closest('[data-show-less-more-wrapper]');
      if (!toggleButton) return;

      const filterGroup = toggleButton.closest('[data-js-filter]');
      if (!filterGroup) return;

      const moreLabel = toggleButton.dataset.moreText;
      const lessLabel = toggleButton.dataset.lessText;
      const isExpanded = toggleButton.classList.contains('active');
      const filterItems = filterGroup.querySelectorAll('[data-show-less-more-li]');

      if (!isExpanded) {
        toggleButton.classList.add('active');
        toggleButton.innerHTML = lessLabel;

        filterItems.forEach(item => {
          item.classList.remove('js-hidden');
          item.classList.add('js-visible');
        });
      } else {
        toggleButton.classList.remove('active');
        toggleButton.innerHTML = moreLabel;

        filterItems.forEach(item => {
          item.classList.remove('js-visible');
          item.classList.add('js-hidden');
        });
      }
    });

  }
  applyButtonClick(e) {
    e.preventDefault();
    if (this.classList.contains("expanded")) {
      this.classList.remove('expanded');
      if(window.lastFocusedElement != null){
        window.returnFocusToLastElement();
      }
      document.body.classList.remove('overflow-hidden');
    }
  }
  debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }
  handleMobileChange(isMobile) {
    if (isMobile) {
      if (this.filterStyle === "horizontal") {
        this.classList.remove('open');
      } else if (this.filterStyle === "vertical" && this.classList.contains("expanded")) {
        this.classList.remove('expanded');
        document.body.classList.remove('overflow-hidden');
      }
    } else {
      if (this.filterStyle === "vertical") {
        this.classList.remove('expanded');
        document.body.classList.remove('overflow-hidden');
      } else if (this.filterStyle === "horizontal") {
        const horizontalDrawerBtn = document.querySelector('horizontal-facets-drawer');
        if (horizontalDrawerBtn && this.dataToggleFilter) {
          this.dataToggleFilter.innerText = this.classList.contains('open') ? "Hide Filters" : "Show Filters";
        }
      }
    }
  }
  setupHorizontalFilters() {
    const filterBtns = this.querySelectorAll('[filter-toggle]');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (event) => {
        if (event.target.closest('.horizontal-filters-content')) return;
        const isOpen = btn.classList.contains('open');
        filterBtns.forEach(el => el.classList.remove('open'));
        if (!isOpen) {
          btn.classList.add('open');
        }
      });
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest("div[filter-toggle]")) {
        filterBtns.forEach(el => el.classList.remove('open'));
      }
    });
  }
  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state ? event.state.searchParams : FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      FacetFiltersForm.renderPage(searchParams, null, false);
    };
    window.addEventListener('popstate', onHistoryChange);
  }

  static toggleActiveFacets(disable = true) {
    document.querySelectorAll('.js-facet-remove').forEach((element) => {
      element.classList.toggle('disabled', disable);
    });
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    FacetFiltersForm.searchParamsPrev = searchParams;
    const sections = FacetFiltersForm.getSections();
    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = (element) => element.url === url;
      FacetFiltersForm.filterData.some(filterDataUrl)
        ? FacetFiltersForm.renderSectionFromCache(filterDataUrl, event)
        : FacetFiltersForm.renderSectionFromFetch(url, event);
    });

    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  static renderSectionFromFetch(url, event) {
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = responseText;
        FacetFiltersForm.filterData = [...FacetFiltersForm.filterData, { html, url }];
        FacetFiltersForm.renderFilters(html, event);
        FacetFiltersForm.renderProductGridContainer(html);
        FacetFiltersForm.renderProductCount(html);
        if (typeof initializeScrollAnimationTrigger === 'function') initializeScrollAnimationTrigger(html.innerHTML);
      });
  }

  static renderSectionFromCache(filterDataUrl, event) {
    const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
    FacetFiltersForm.renderFilters(html, event);
    FacetFiltersForm.renderProductGridContainer(html);
    FacetFiltersForm.renderProductCount(html);
    if (typeof initializeScrollAnimationTrigger === 'function') initializeScrollAnimationTrigger(html.innerHTML);
  }

  static renderProductGridContainer(html) {
    document.querySelector('[data-section_id]').innerHTML = new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector('[data-section_id]').innerHTML;
    document.querySelector('[data-section_id]')
      .querySelectorAll('.scroll-trigger')
      .forEach((element) => {
        element.classList.add('scroll-trigger--cancel');
      });
    const intialLoadProduct = new onloadProductCompareContentUpdate();
    intialLoadProduct.onloadCheckboxManage();
  }

  static renderProductCount(html) {
    const count = new DOMParser().parseFromString(html, 'text/html').querySelector('[total-product-count]')?.innerText;
    if (!count) return;
    const container = document.querySelector('[total-product-count]');
    container.innerText = count;

  }

  static renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
    const facetDetailsElementsFromFetch = parsedHTML.querySelectorAll(
      '#FacetFiltersForm [data-js-filter], #FacetFiltersFormMobile [data-js-filter]'
    );
    const facetDetailsElementsFromDom = document.querySelectorAll(
      '#FacetFiltersForm [data-js-filter], #FacetFiltersFormMobile [data-js-filter]'
    );
    Array.from(facetDetailsElementsFromDom).forEach((currentElement) => {
      if (!Array.from(facetDetailsElementsFromFetch).some(({ id }) => currentElement.id === id)) {
        currentElement.remove();
      }
    });
    const matchesId = (element) => {
      const jsFilter = event ? event.target.closest('[data-js-filter]') : undefined;
      return jsFilter ? element.id === jsFilter.id : false;
    };

    const facetsToRender = Array.from(facetDetailsElementsFromFetch).filter((element) => !matchesId(element));
    const countsToRender = Array.from(facetDetailsElementsFromFetch).find(matchesId);
    facetsToRender.forEach((elementToRender, index) => {
      const currentElement = document.getElementById(elementToRender.id);
      // Element already rendered in the DOM so just update the innerHTML
      if (currentElement) {
        document.getElementById(elementToRender.id).innerHTML = elementToRender.innerHTML;
      } else {
        if (index > 0) {
          const { className: previousElementClassName, id: previousElementId } = facetsToRender[index - 1];
          // Same facet type (eg horizontal/vertical or drawer/mobile)
          if (elementToRender.className === previousElementClassName) {
            document.getElementById(previousElementId).after(elementToRender);
            return;
          }
        }

        if (elementToRender.parentElement) {
          document.querySelector(`#${elementToRender.parentElement.id} [data-js-filter]`).before(elementToRender);
        }
      }
    });

    FacetFiltersForm.renderActiveFacets(parsedHTML);
    FacetFiltersForm.renderAdditionalElements(parsedHTML);

    if (countsToRender) FacetFiltersForm.renderCounts(countsToRender, event.target.closest('[data-js-filter]'));
  }

  static renderActiveFacets(html) {
    const activeFacetElementSelectors = ['[active-facets-desktop]', '[active-facets-mobile]'];
    const activeFilterCount = ['[filter-active-count]'];
    activeFacetElementSelectors.forEach((selector) => {
      const activeFacetsElement = html.querySelector(selector);
      if (!activeFacetsElement) return;
      document.querySelector(selector).innerHTML = activeFacetsElement.innerHTML;
    });
    activeFilterCount.forEach((selector) => {
      const activeFacetsElement = html.querySelector(selector);
      if (!activeFacetsElement) return;
      document.querySelectorAll(selector).forEach((el) => {
        el.innerHTML = activeFacetsElement.innerHTML;
      });
      // document.querySelector(selector).innerHTML = activeFacetsElement.innerHTML;
    });

    FacetFiltersForm.toggleActiveFacets(false);
  }

  static renderAdditionalElements(html) {
    const mobileElementSelectors = ['.mobile-facets__open', '.mobile-facets__count', '.sorting'];
    const active_filter_count = ['[facet-drawer-btn]']
    const clear_all_btn = ['[facets-clear-all]']
    const search_count_text = ['[search-count-text]']

    active_filter_count.forEach((selector) => {
      if (!html.querySelector(selector)) return;
      document.querySelector(selector).innerHTML = html.querySelector(selector).innerHTML;
    });
    clear_all_btn.forEach((selector) => {
      if (!html.querySelector(selector)) return;
      document.querySelector(selector).innerHTML = html.querySelector(selector).innerHTML;
    });
    mobileElementSelectors.forEach((selector) => {
      if (!html.querySelector(selector)) return;
      document.querySelector(selector).innerHTML = html.querySelector(selector).innerHTML;
    });
    search_count_text.forEach((selector) => {
      if (!html.querySelector(selector)) return;
      document.querySelector(selector).innerHTML = html.querySelector(selector).innerHTML;
    });


  }

  static renderCounts(source, target) {
    const targetSelectors = ['[filter-btn]', '[remove-filter]']
    targetSelectors.forEach((selector) => {
      const targetElement = target.querySelector(selector)
      const sourceElement = source.querySelector(selector);
      if (sourceElement && targetElement) {
        targetElement.innerHTML = sourceElement.innerHTML
      }
    })
  }

  static updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  static getSections() {
    return [
      {
        section: document.querySelector('[data-section_id]').dataset.section_id
      },
    ];
  }

  createSearchParams(form) {
    const formData = new FormData(form);
    return new URLSearchParams(formData).toString();
  }

  onSubmitForm(searchParams, event) {
    FacetFiltersForm.renderPage(searchParams, event);
  }

  onSubmitHandler(event) {
    event.preventDefault()
    const sortFilterForms = document.querySelectorAll('facet-filters-form form');
    const forms = [];
    const isMobile = event.target.closest('form').id === 'FacetFiltersFormMobile';
    sortFilterForms.forEach((form) => {
      if (!isMobile) {
        if (form.id === 'FacetSortForm' || form.id === 'FacetFiltersForm' || form.id === 'FacetSortDrawerForm') {
          const noJsElements = document.querySelectorAll('.no-js-list');
          noJsElements.forEach((el) => el.remove());
          forms.push(this.createSearchParams(form));
        }
      } else if (form.id === 'FacetFiltersFormMobile') {
        forms.push(this.createSearchParams(form));
      }
    });
    this.onSubmitForm(forms.join('&'), event);

  }

  onActiveFilterClick(event) {
    event.preventDefault();
    FacetFiltersForm.toggleActiveFacets();
    const url =
      event.currentTarget.href.indexOf('?') == -1
        ? ''
        : event.currentTarget.href.slice(event.currentTarget.href.indexOf('?') + 1);
    FacetFiltersForm.renderPage(url);
  }
}

FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);
customElements.define('facet-filters-form', FacetFiltersForm);
FacetFiltersForm.setListeners();


class FacetRemove extends HTMLElement {
  constructor() {
    super();
    const facetLink = this.querySelector('a');
    facetLink.setAttribute('role', 'button');
    facetLink.addEventListener('click', this.closeFilter.bind(this));
    facetLink.addEventListener('keyup', (event) => {
      event.preventDefault();
      if (event.code.toUpperCase() === 'SPACE') this.closeFilter(event);
    });
  }

  closeFilter(event) {
    event.preventDefault();
    const form = this.closest('facet-filters-form') || document.querySelector('facet-filters-form');
    form.onActiveFilterClick(event);
  }
}

customElements.define('facet-remove', FacetRemove);

class HorizontalFacetsDrawer extends HTMLElement {
  constructor() {
    super();
    this.parentWrapper = this.closest('[filter-top-bar]');
    this.filter = document.querySelectorAll('facet-filters-form');

    this.setupDrawerToggle();
    if (this.parentWrapper) {
      this.setupHeight();
      window.addEventListener('resize', () => this.setupHeight());
    }
  }

  setupHeight() {
    const height = this.parentWrapper.offsetHeight;
    document.body.style.setProperty('--filterTopbarHeight', `${height}px`);
  }

  toggleFilters() {
    if (!this.filter) return;
    this.filter.forEach((el) => {
      let filterType = el.dataset.type;
      if (filterType == "horizontal") {
        el.classList.toggle('open');
        const toggleBtn = this.querySelector('[data-toggle-filter]');
        toggleBtn.innerText = el.classList.contains('open')
          ? "Hide Filters"
          : "Show Filters";
      }
    });
  }

  setupDrawerToggle() {
    // Click support
    this.addEventListener('click', () => this.toggleFilters());

    // Keyboard support (Enter or Space)
    this.addEventListener('keydown', (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault(); // prevent page scroll on space
        this.toggleFilters();
      }
    });

    // Make sure it's focusable if not naturally (e.g., <div>)
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '0');
    }

    // Add aria role for accessibility
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'button');
    }
  }
}

customElements.define('horizontal-facets-drawer', HorizontalFacetsDrawer);


class FacetsDrawer extends HTMLElement {
  constructor() {
    super();
    this.filter = document.querySelectorAll('facet-filters-form');
    this.datatogglefilter = document.body.querySelector('[data-toggle-filter]')

    // Make component focusable with Tab
    this.setAttribute('tabindex', '0');

    this.setupDrawerToggle();
  }

  toggleDrawer(focusable) {
    if (!this.filter) return;
    this.filter.forEach((el) => {
      let filterType = el.dataset.type;
      if (filterType == "vertical") {
        el.classList.toggle('expanded');
        if (el.classList.contains('expanded')) {
          document.body.classList.add('overflow-hidden');
          if (focusable) {
            setTimeout(() => {
              trapFocus(el);
            }, 500);
          }
        } else {
          if(window.lastFocusedElement != null){
            window.returnFocusToLastElement();
          }
          document.body.classList.remove('overflow-hidden');
        }
      }
    });
  }

  setupDrawerToggle() {
    // Mouse click
    this.addEventListener('click', () =>{ 
      window.setLastFocusedElement(this);
      this.toggleDrawer();
    });

    // Keyboard (Enter / Space)
    this.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); // Prevent scrolling when pressing space
        window.setLastFocusedElement(this);
        const focusable = true;
        this.toggleDrawer(focusable);
      }
    });
  }
}

customElements.define('facets-drawer', FacetsDrawer);


class PriceRangeFilters extends HTMLElement {
  constructor() {
    super();
    this.rangeBars = this.querySelectorAll('input[type=range]');
    this.numberFields = this.querySelectorAll('input[type=number]');
    this.progress = this.querySelector('[data-filter-progress]');

    this.thumbsGap = 1;

    this.rangeBars.forEach((rangeBar) => {
      rangeBar.addEventListener('input', this.rangeBarHandle.bind(this));
    });

    this.numberFields.forEach((numberField) => {
      numberField.addEventListener('input', this.numberFieldHandle.bind(this));
    });
  }

  rangeBarHandle(event) {
    this.rangeBars.forEach((el) => {
      let minVal = parseInt(this.rangeBars[0].value),
        maxVal = parseInt(this.rangeBars[1].value);

      if (maxVal - minVal < this.thumbsGap) {
        if (el.target.className === 'input-min') {
          this.rangeBars[0].value = maxVal - this.thumbsGap;
        } else {
          this.rangeBars[1].value = minVal + this.thumbsGap;
        }
      } else {
        this.numberFields[0].value = minVal;
        this.numberFields[1].value = maxVal;
        let minRangeVal = (minVal / this.rangeBars[0].max) * 100
        let maxRangeVal = (maxVal / this.rangeBars[1].max) * 100
        this.progress.style.setProperty("--rangeMin", `${minRangeVal}%`)
        this.progress.style.setProperty("--rangeMax", `${maxRangeVal}%`)
      }
    });
  }

  numberFieldHandle(event) {
    this.numberFields.forEach((el) => {
      let minPrice = parseFloat(this.numberFields[0].value),
        maxPrice = parseFloat(this.numberFields[1].value);

      if (maxPrice - minPrice >= this.thumbsGap && maxPrice <= this.rangeBars[1].max) {
        if (e.target.className === 'input-min') {
          this.rangeBars[0].value = minPrice;
          let minRangeVal = (minPrice / this.rangeBars[0].max) * 100
          this.progress.style.setProperty("--rangeMin", `${minRangeVal}%`)
        } else {
          this.rangeBars[1].value = maxPrice;
          let maxRangeVal = 100 - (maxPrice / this.rangeBars[1].max) * 100
          this.progress.style.setProperty("--rangeMax", `${maxRangeVal}%`)
        }
      }
    });
  }
}
customElements.define('price-range', PriceRangeFilters);


class LoadMore extends HTMLElement {
  constructor() {
    super();
    this.onClickHandler = this.onClick.bind(this);
  }

  connectedCallback() {
    const button = this.querySelector('a');
    if (button) {
      button.addEventListener('click', this.onClickHandler);
    }

    if (this.getAttribute('data-mode') === 'infinite') {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          this.fetchData();
        }
      });
      observer.observe(this);
    }
  }

  disconnectedCallback() {
    const button = this.querySelector('a');
    if (button) {
      button.removeEventListener('click', this.onClickHandler);
    }
  }

  onClick(event) {
    event.preventDefault();
    if (this.hasAttribute('aria-busy')) return;
    this.fetchData();
  }

  fetchData() {
    this.enableLoading();

    const button = this.querySelector('a');
    if (!button) return;
    const url = button.getAttribute('href');

    if (!url) {
      console.warn('No URL found for load more button');
      this.disableLoading();
      return;
    }

    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const parser = new DOMParser();
        const responseDoc = parser.parseFromString(responseText, 'text/html');
        const newProducts = responseDoc.querySelector('[product-listing-wrapper]');
        const currentProducts = document.querySelector('[product-listing-wrapper]');

        if (newProducts && currentProducts) {
          currentProducts.innerHTML += newProducts.innerHTML;

          const newButton = responseDoc.querySelector('load-more a');
          if (newButton) {
            button.setAttribute('href', newButton.getAttribute('href'));
          } else {
            this.remove();
          }
        }
        const intialLoadProduct = new onloadProductCompareContentUpdate();
        intialLoadProduct.onloadCheckboxManage();
        this.disableLoading();
        if (typeof ScrollTrigger !== 'undefined' && window.innerWidth >= 768) {
          ScrollTrigger.refresh();
        }
      })
      .catch((error) => {
        console.error('Error fetching load more content:', error);
        this.disableLoading();
      });
  }

  enableLoading() {
    this.querySelector('a').classList.add('hidden');
    this.querySelector('[data-infinite-scroll]').classList.remove('hidden');
    this.setAttribute('aria-busy', 'true');
    this.classList.add('pointer-events-none');
  }

  disableLoading() {
    this.querySelector('a').classList.remove('hidden');
    this.querySelector('[data-infinite-scroll]').classList.add('hidden');
    this.removeAttribute('aria-busy');
    this.classList.remove('pointer-events-none');
  }
}

customElements.define('load-more', LoadMore);
