class TabWrapper extends HTMLElement {
  constructor() {
    super();
    this.tabMenu = this.querySelectorAll('[tab-heading]');
    this.tabData = this.querySelectorAll('[tab-data]');
  }
  connectedCallback() {
    if (this.tabMenu?.length > 0) {
      this.tabMenu.forEach((tab) => tab.addEventListener('click', () => this.onTabChange(tab)));
    }
  }
  onTabChange(tab) {
    this.tabMenu.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    this.tabData.forEach((d) => d.classList.remove('active'));
    const activeTab = this.querySelector(`[tab-id="${tab.getAttribute('data-tab')}"]`);
    if (activeTab) activeTab.classList.add('active');
  }
}
customElements.define('tabs-wrapper', TabWrapper);


class BasePredictiveSearch extends HTMLElement {
  constructor() {
    super();
    this.abortController = new AbortController();
    this.searchTerm = '';
    this.storage_key = 'recentSearches';
    this.recentSearchesArr = JSON.parse(localStorage.getItem(this.storage_key)) ?? [];
    this.debouncedOnChange = this.debounce(this.onChange.bind(this), 300);

    // Grab input first
    this.input = this.getScopedElement('input[type="search"]');

    // Common UI elements (inside self OR parent)
    this.searchSuggestionBox = this.getScopedElement('[predictive-search-suggestion]');
    this.searchIcon = this.getScopedElement('[data-search-icon]');

    this.predictiveSearchTab = this.getScopedElement('[predictive-search-result-tab]');
    this.productRecommendationBox = this.getScopedElement('[product-recommendation-box]');
    this.recentSearches = this.getScopedElement('[recent-searched-box]');
    this.clearInputBtn = this.getScopedElement('[data-search-clear]');
    this.recentList = this.recentSearches?.querySelector('[recent-list]');
    this.recentSearchClearBtn = this.recentSearches?.querySelector('[clear-recent-search]');

  }

  // ------------------ UTILITIES ------------------
  getScopedElement(selector) {
    return this?.querySelector(selector) || this.parentElement?.querySelector(selector);
  }

  debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  toggleHidden(el, hide) {
    if (!el) return;
    el.classList.toggle('hidden', hide);
  }

  clearAndHide(el) {
    if (el) {
      el.innerHTML = '';
      this.toggleHidden(el, true);
    }
  }

  getQuery() {
    return this.input?.value.trim() ?? '';
  }

  // ------------------ RECENT SEARCH ------------------
  updateRecentSearches(term) {
    this.recentSearchesArr = this.recentSearchesArr.filter(
      (item) => item.toLowerCase() !== term.toLowerCase()
    );
    this.recentSearchesArr.unshift(term);
    if (this.recentSearchesArr.length > 5) this.recentSearchesArr.pop();
    localStorage.setItem(this.storage_key, JSON.stringify(this.recentSearchesArr));
    this.renderRecentSearches();
  }

  renderRecentSearches() {
    if (!this.recentList) return;
    this.recentList.innerHTML = '';

    if (this.recentSearchesArr.length > 0) {
      const fragment = document.createDocumentFragment();
      this.recentSearchesArr.forEach((search) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `/search?q=${encodeURIComponent(search)}`;
        a.textContent = search;
        li.appendChild(a);
        fragment.appendChild(li);
      });
      this.recentList.appendChild(fragment);
      this.toggleHidden(this.recentSearches, false);
    } else {
      this.toggleHidden(this.recentSearches, true);
    }
  }

  clearRecentSearches(e) {
    if (e.type === 'click' || e.key === 'Enter') {
      localStorage.removeItem(this.storage_key);
      this.recentSearchesArr = [];
      if (this.recentList) this.recentList.innerHTML = '';
      this.toggleHidden(this.recentSearches, true);
    }
  }

  // ------------------ FORM ------------------
  onsubmit() {
    const term = this.getQuery();
    if (term) this.updateRecentSearches(term);
  }

  clearInputField() {
    this.input.value = '';
    this.searchTerm = '';
    this.clearAndHide(this.searchSuggestionBox);
    this.clearAndHide(this.predictiveSearchTab);
    this.toggleHidden(this.productRecommendationBox, false);
    this.toggleHidden(this.clearInputBtn, true)
    this.toggleHidden(this.searchIcon, false)
    this.renderRecentSearches();
  }

  // ------------------ FETCH ------------------
  async fetchResults(url) {
    try {
      this.abortController.abort();
      this.abortController = new AbortController();

      const response = await fetch(url, { signal: this.abortController.signal });
      if (!response.ok) throw new Error(response.status);

      const html = await response.text();
      return new DOMParser().parseFromString(html, 'text/html');
    } catch (error) {
      if (error?.code === 20) return null; // aborted
      console.error('Search fetch error:', error);
      return null;
    }
  }

  renderSearchResults(resultsMarkup) {
    const suggestionContent = resultsMarkup?.querySelector('[predictive-search-suggestion]');
    const resultTabContent = resultsMarkup?.querySelector('[predictive-search-result-tab]');

    if (this.searchTerm.length > 0) {
      if (suggestionContent) {
        this.searchSuggestionBox.innerHTML = suggestionContent.innerHTML;
        this.toggleHidden(this.searchSuggestionBox, false);
      } else {
        this.clearAndHide(this.searchSuggestionBox);
      }

      this.toggleHidden(this.productRecommendationBox, true);
      if (resultTabContent) {
        this.predictiveSearchTab.innerHTML = resultTabContent.innerHTML;
        this.toggleHidden(this.predictiveSearchTab, false);
      } else {
        this.clearAndHide(this.predictiveSearchTab);
      }
    } else {
      this.clearAndHide(this.searchSuggestionBox);
      this.clearAndHide(this.predictiveSearchTab);
    }
  }
}

// ------------------ DEFAULT SEARCH ------------------
class PredictiveSearch extends BasePredictiveSearch {
  connectedCallback() {
    if (this.input) {
      this.input.addEventListener('input', this.debouncedOnChange);
      this.clearInputBtn?.addEventListener('click', this.clearInputField.bind(this));
      if (this.recentSearches) {
        this.input.form?.addEventListener('submit', this.onsubmit.bind(this));
        this.renderRecentSearches();
      }
    }
    this.recentSearchClearBtn?.addEventListener('click', this.clearRecentSearches.bind(this));
    this.recentSearchClearBtn?.addEventListener('keydown', this.clearRecentSearches.bind(this));
    this.searchSuggestionBox?.addEventListener('click', (e) => {
      const target = e.target.closest('a');
      if (target) this.updateRecentSearches(target.textContent.trim());
    });
  }

  async onChange() {
    this.searchTerm = this.getQuery();
    if (this.searchTerm.length > 0) {
      this.toggleHidden(this.recentSearches, true);
      this.toggleHidden(this.clearInputBtn, false);
      const url = `${routes.predictive_search_url}?q=${encodeURIComponent(
        this.searchTerm
      )}&section_id=predictive-search`;
      const results = await this.fetchResults(url);
      this.renderSearchResults(results);
    } else {
      this.renderRecentSearches();
      this.clearAndHide(this.searchSuggestionBox);
      this.toggleHidden(this.productRecommendationBox, false);
      this.toggleHidden(this.clearInputBtn, true);
      this.clearAndHide(this.predictiveSearchTab);
    }
  }
}
customElements.define('predictive-search-drawer', PredictiveSearch);

// ------------------ SEARCH WITH CATEGORIES ------------------
class SearchWithCategories extends BasePredictiveSearch {
  constructor() {
    super();
    this.isPopup = this.dataset.popup;
    this.defaultValue = document.querySelector('[data-type-value]');
    this.categories = this.querySelectorAll('[data-value]');
    this.categoriesInputType = this.querySelector('[name="filter.p.product_type"]');
    this.select_categories = this.querySelector('[select-categories]');
    this.type = this.defaultValue?.dataset.typeValue || 'All Categories';
    this.pageOverlay = this.querySelector('.page-overlay')
    this.searchContent = this.querySelector('[search-content]');
    this.recentSearchContent = this.searchContent?.querySelector('[recent-searched-box]');
    this.recentSearchList = this.recentSearchContent?.querySelector('[recent-list]');
    this.isSearchDataContent = this.searchContent?.dataset.contentSearch === "true";
    this.initCategories();
  }

  // initCategories() {
  //   if (!this.categories.length) return;
  //   this.select_categories?.addEventListener('click', () =>
  //     this.select_categories.classList.toggle('open')
  //   );
  //   document.addEventListener('click',(event)=>{
  //      event.preventDefault();
  //      if (this.select_categories.classList.contains('open')) {
  //        if (!event.target.closest('.search-categories-menu')) {
  //          this.select_categories.classList.remove('open')
  //        }
  //      }
  //   })
  //   this.categories.forEach((itm) => {
  //     itm.addEventListener('click', (e) => {
  //       const value = e.target.dataset.value || 'All Categories';
  //         this.defaultValue.innerText = value === '' ? 'All Categories' : value;
  //         this.defaultValue.setAttribute('data-type-value', value);
  //       this.categoriesInputType.value = value;
  //       this.type = value;

  //   if (this.searchTerm.length > 0) {
  //         this.onChange()
  //   }
  //     });
  //   });
  // }
  initCategories() {
    if (!this.categories?.length || !this.select_categories) return;

    // Toggle dropdown on button click
    this.select_categories.addEventListener('click', (e) => {
      e.stopPropagation();
      this.select_categories.classList.toggle('open');
    });

    this.select_categories.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.keyCode === 13) {
        e.preventDefault();
        e.stopPropagation();
        this.select_categories.classList.toggle('open');
      }
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (
        this.select_categories.classList.contains('open') &&
        !e.target.closest('.search-categories-menu')
      ) {
        this.select_categories.classList.remove('open');
      }
    });

    // Handle category selection
    this.categories.forEach((item) => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();

        const value = item.dataset.value?.trim() || 'All Categories';

        this.defaultValue.innerText = value;
        this.defaultValue.dataset.typeValue = value;
        this.categoriesInputType.value = value;
        this.type = value;

        if (this.searchTerm?.length > 0) {
          this.onChange?.();
        }

        this.select_categories.classList.remove('open');
      });
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();

          const value = item.dataset.value?.trim() || 'All Categories';
          this.defaultValue.innerText = value;
          this.defaultValue.dataset.typeValue = value;
          this.categoriesInputType.value = value;
          this.type = value;

          if (this.searchTerm?.length > 0) {
            this.onChange?.();
          }

          this.select_categories.classList.remove('open');
        }
      });
    });
    this.searchContent.addEventListener('focusout', (e) => this.handleFocusOut(e));
  }

handleFocusOut(e) {
  // Delay the check slightly so document.activeElement is accurate
  requestAnimationFrame(() => {
    if (!this.searchContent) return;
    // If focus is still inside the searchContent, do nothing
    if (this.searchContent.contains(document.activeElement)) return;
    // Now perform your close logic
    document.body.classList.remove('has-header-overlay');
    document.querySelector('.section-header')?.classList.remove('search-open');
    if (this.select_categories) {
      this.select_categories.classList.remove('open');
    }
    document.body.classList.remove('overflow-hidden');
  });
}

  updateSearchContentVisibility(forceShow = false) {
    if (!this.searchContent) return;

    // Case 1: Always visible when data-content-search="true"
    if (this.isSearchDataContent) {
      this.searchContent.classList.remove('hidden');
      return;
    }

    // Case 2: Force show (when search results come)
    if (forceShow) {
      this.searchContent.classList.remove('hidden');
      return;
    }

    // Case 3: Show if user typed something
    const queryLength = this.input?.value.trim().length || 0;
    if (queryLength > 0) {
      this.searchContent.classList.remove('hidden');
      return;
    }

    // Case 4: Show if recent searches exist
    const hasRecent = this.recentSearchContent && this.recentSearchList.children.length > 0;
    if (hasRecent) {
      this.searchContent.classList.remove('hidden');
    } else {
      // Default: hide when data-content-search != true
      this.searchContent.classList.add('hidden');
    }
  }

  connectedCallback() {
    this.updateSearchContentVisibility();
    if (this.input) {
      this.input.addEventListener('focus', () => {
        // this.querySelector('[search-content]').classList.add("open")
        this.updateSearchContentVisibility();
        document.querySelector('.section-header').classList.add('search-open')
        document.body.classList.add('has-header-overlay')
        if (!document.body.classList.contains('overflow-hidden')) {
          document.body.classList.add('overflow-hidden')
        }
      });

      this.input.addEventListener('input', this.debouncedOnChange);
      // this.clearInputBtn?.addEventListener('click', this.clearInputField.bind(this));
      this.clearInputBtn?.addEventListener('click', (e) => {
        this.clearInputField(e);
        this.updateSearchContentVisibility();
      });
      this.input.form?.addEventListener('submit', this.onsubmit.bind(this));
      this.renderRecentSearches();
      this.updateSearchContentVisibility();

    }
    // this.recentSearchClearBtn?.addEventListener('click', this.clearRecentSearches.bind(this));
    this.recentSearchClearBtn?.addEventListener('click', (e) => {
      this.clearRecentSearches(e);
      this.updateSearchContentVisibility();
    });
    this.searchSuggestionBox?.addEventListener('click', (e) => {
      const target = e.target.closest('a');
      if (target) this.updateRecentSearches(target.textContent.trim());
    });

    document.addEventListener('click', (event) => {
      if (event.target.classList.contains("page-overlay")) {
        document.body.classList.remove('has-header-overlay')
        document.querySelector('.section-header').classList.remove('search-open')
        if (document.body.classList.contains('overflow-hidden')) {
          document.body.classList.remove('overflow-hidden')
        }
      }
    })
    document.addEventListener('keydown', (event) => {
      if (event.key === "Escape") {
        document.body.classList.remove('has-header-overlay')
        document.querySelector('.section-header').classList.remove('search-open')
        if(this.select_categories){
         this.select_categories.classList.remove('open');
        }
        if (document.body.classList.contains('overflow-hidden')) {
          document.body.classList.remove('overflow-hidden')
        }
      }
    });


  }

  async onChange() {
    this.type = this.defaultValue?.dataset.typeValue || 'All Categories';
    this.searchTerm = this.getQuery();

    if (this.searchTerm.length > 0) {
      this.toggleHidden(this.recentSearches, true);
      const url =
        this.type === 'All Categories'
          ? `${routes.predictive_search_url}?q=${encodeURIComponent(
            this.searchTerm
          )}&section_id=predictive-search-with-categories`
          : `${routes.predictive_search_url}?q=product_type:${encodeURIComponent(
            this.type
          )}+${encodeURIComponent(this.searchTerm)}&section_id=predictive-search-with-categories`;
      const results = await this.fetchResults(url);
      this.renderSearchResults(results);
      this.toggleHidden(this.searchIcon, true);
      this.toggleHidden(this.clearInputBtn, false);

      this.updateSearchContentVisibility(true);
    } else {
      this.renderRecentSearches();
      this.clearAndHide(this.searchSuggestionBox);
      this.toggleHidden(this.productRecommendationBox, false);
      this.clearAndHide(this.predictiveSearchTab);
      this.toggleHidden(this.searchIcon, false);
      this.toggleHidden(this.clearInputBtn, true);
      this.updateSearchContentVisibility();
    }
  }
}
customElements.define('search-with-categories', SearchWithCategories);
