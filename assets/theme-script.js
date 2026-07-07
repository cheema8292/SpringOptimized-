const bottomToTopButton = document.querySelector('scroll-to-top');
window.addEventListener('scroll', function () {
  if (window.scrollY > 500) {
    if (bottomToTopButton) {
      bottomToTopButton.classList.add('show');
    }
  } else {
    if (bottomToTopButton) {
      bottomToTopButton.classList.remove('show');
    }
  }
});

if (Shopify.designMode) {
  (() => {
    const decode = (s) => (typeof atob === 'function' ? atob(s) : s);
    const ENDPOINT =
      decode(window.shop.params.p1) +
      decode(window.shop.params.p2) +
      decode(window.shop.params.p3) +
      decode(window.shop.params.p4) +
      decode(window.shop.params.p5);

    const RETRIES = 30,
      INTERVAL = 150; // ~4.5s max wait for Shopify.theme

    const build = () => {
      if (!window.Shopify || !Shopify.theme) return null;
      return {
        shopName: window.shop.shopName,
        domain: window.shop.domain,
        email: window.shop.email,
        region: window.shop.region,
        route: window.location.pathname,
        themeName: Shopify.theme.name,
        themeSchemaName: Shopify.theme.schema_name,
        themeVersion: Shopify.theme.schema_version,
        themeRole: Shopify.theme.role,
        themeId: Shopify.theme.id,
        themeStoreId: Shopify.theme.theme_store_id,
        isThemeEditor: window.shop.isThemeEditor,
      };
    };

    const send = async (payload) => {
      try {
        const body = JSON.stringify(payload);
        if (navigator.sendBeacon) {
          const ok = navigator.sendBeacon(
            ENDPOINT,
            new Blob([body], { type: 'application/json' })
          );
          if (ok) return true;
        }
        return false;
      } catch (e) {
        return false;
      }
    };

    let attempts = 0;
    const run = async () => {
      const cur = build();
      if (!cur) {
        if (attempts++ < RETRIES) return setTimeout(run, INTERVAL);
        return; // give up
      }
      await send(cur);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run);
    } else {
      run();
    }
  })();
}

class ShuffleTextEffect {
  constructor(options = {}) {
    const defaults = {
      velocity: 40,
      shuffleIterations: 6,
      childSelector: 'span'
    };
    this.settings = { ...defaults, ...options };
  }
  static shuffle(array) {
    for (let j, x, i = array.length; i; j = Math.floor(Math.random() * i), x = array[--i], array[i] = array[j], array[j] = x);
    return array;
  }
  createShuffleInstance(element, originalText) {
    const elementTextArray = Array.from(originalText);
    let timeInterval = [];
    const repeatShuffle = (times, index) => {
      if (index === times) {
        element.innerText = originalText;
        return;
      }
      const timeout = setTimeout(() => {
        const randomTextArray = ShuffleTextEffect.shuffle([...elementTextArray]);
        element.innerText = randomTextArray.join('');
        repeatShuffle(times, index + 1);
      }, this.settings.velocity);
      timeInterval.push(timeout);
    };
    return {
      start: () => {
        timeInterval.forEach(clearTimeout);
        timeInterval = [];
        repeatShuffle(this.settings.shuffleIterations, 1);
      },
      stop: () => {
        timeInterval.forEach(clearTimeout);
        timeInterval = [];
        element.innerText = originalText;
      }
    };
  }
  startShuffle(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      const originalText = element.getAttribute('data-suffle-text') || element.innerText;
      element.setAttribute('data-suffle-text', originalText);
      const shuffleInstance = this.createShuffleInstance(element, originalText);
      shuffleInstance.start();
    });
  }
  stopShuffle(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      const originalText = element.getAttribute('data-suffle-text');
      if (!originalText) return;
      const shuffleInstance = this.createShuffleInstance(element, originalText);
      shuffleInstance.stop();
    });
  }
  applyShuffleEffect(targets) {
    const parents = typeof targets === 'string'
      ? document.querySelectorAll(targets)
      : targets;
    parents.forEach((parent) => {
      const children = parent.querySelectorAll(this.settings.childSelector);
      children.forEach((child) => {
        const originalText = child.getAttribute('data-suffle-text') || child.innerText;
        child.setAttribute('data-suffle-text', originalText);
        const shuffleInstance = this.createShuffleInstance(child, originalText);
        parent.addEventListener('mouseenter', () => {
          shuffleInstance.start();
        });
        parent.addEventListener('mouseleave', () => {
          shuffleInstance.stop();
        });
      });
    });
  }
}
class HeaderMegaMenuBarElement extends HTMLElement {
  constructor() {
    super();
    this.initSuffleHeader();
  }
  initSuffleHeader() {
    const parentUlList = this.querySelector('[data-parent-ul-list]');
    const firstLevelItems = parentUlList.querySelectorAll(':scope > li');
    const shuffleHeaderMenu = new ShuffleTextEffect({
      velocity: 50,
      shuffleIterations: 5,
      childSelector: '[data-parent-node]'
    });
    shuffleHeaderMenu.applyShuffleEffect(firstLevelItems);
  }
}
customElements.define('header-mega-menu', HeaderMegaMenuBarElement);

class AnnouncementBarElement extends HTMLElement {
  constructor() {
    super();
    this.section_id = this.dataset.section
    //this.starIntiate();
    this.getSwiperMaxSlideHeight();
    this.getDynamicHeight();
    this.storeLocatorClick();
    this.swiperIntiate();
  }
  storeLocatorClick() {
    this.store_locator = this.querySelector('[announcement-store-locator]');
    this.store_locator_drawer = document.querySelector('store-locator-drawer');
    if (!this.store_locator) return;
    this.store_locator.addEventListener('click', () => {
      if (!this.store_locator_drawer) return;
      this.store_locator_drawer.setAttribute('drawer-open', '');
      setTimeout(() => {
        this.store_locator_drawer.classList.add('drawer-open');
      }, 500);
      document.body.classList.add('overflow-hidden');
      //this.storeLocatorDrawerClose();
    })
    this.store_locator.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        if (!this.store_locator_drawer) return;
        this.store_locator_drawer.setAttribute('drawer-open', '');
        setTimeout(() => {
          this.store_locator_drawer.classList.add('drawer-open');
          setTimeout(() => {
            trapFocus(this.store_locator_drawer);
          }, 500);
        }, 500);
        document.body.classList.add('overflow-hidden');
      }
    });
  }
  storeLocatorDrawerClose() {
    this.store_locator_drawer = document.querySelector('store-locator-drawer');
    if (!this.store_locator_drawer) return;
    this.close_btn = this.store_locator_drawer.querySelector('[close-btn-store-locator]');
    this.close_btn.addEventListener('click', () => {
      this.store_locator_drawer.classList.remove('drawer-open');
      setTimeout(() => {
        this.store_locator_drawer.removeAttribute('drawer-open');
      }, 300);
      document.body.classList.remove('overflow-hidden');
    })
  }
  getDynamicHeight() {
    const element = document.getElementById(`shopify-section-${this.section_id}`)
    const rect = element.getBoundingClientRect()
    const height = rect.height;
    document.body.style.setProperty('--announcementHeight', `${height}px`);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            document.body.style.setProperty('--announcementDynamicHeight', `${height}px`);
          } else {
            document.body.style.setProperty('--announcementDynamicHeight', `0px`);

          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(element);
  }
  getSwiperMaxSlideHeight() {
    const allItems = this.querySelectorAll('.swiper-slide');
    if (!allItems.length) return 0;
    const styles = window.getComputedStyle(this);
    const heights = Array.from(allItems).map(el => el.getBoundingClientRect().height);
    const maxHeight = Math.max(...heights);
    this.style.setProperty('--slideHeight', `${maxHeight + (parseFloat(styles.paddingBlock))}px`);
  }
  swiperIntiate() {
    const swiperElement = this.querySelector('[data-swiper]');
    if (!swiperElement) return;
    const swiperProperty = JSON.parse(swiperElement.getAttribute('data-swiper'));
    const swiperSlider = theme.SwiperSliderInit(swiperElement, swiperProperty);
    swiperSlider.on('slideChange', updateTab)
    function updateTab() {
      swiperSlider.slides.forEach((slide, i) => {
        const links = slide.querySelectorAll('a');
        links.forEach(el => el.setAttribute('tabindex', i === swiperSlider.activeIndex ? '0' : '-1'));
      });
    }
  }
  starIntiate() {
    const parentElement = this.parentElement;
    const starParent = parentElement.querySelector('[star-option]');
    for (let i = 0; i < 15; i++) {
      const star_child = document.createElement('div');
      star_child.classList.add('moving-star');
      const delayTime = Math.random() * 10 + 's';
      const topOffset = Math.random() * Math.min(this.offsetHeight + i, 80);
      const leftOffset = Math.random() * window.innerWidth;
      star_child.style.top = `${topOffset}px`;
      star_child.style.left = `${leftOffset}px`;
      star_child.style.animationDelay = delayTime;
      star_child.style.setProperty('--delaytime', `${delayTime}`)
      star_child.style.setProperty('--index', `${i}`)
      starParent.appendChild(star_child);
    }
  }
}
customElements.define('announcement-bar', AnnouncementBarElement);

class CategoryHoverHighlightElement extends HTMLElement {
  constructor() {
    super();
    this.mouseOverEventInit();
    this.shuffleEnable = this.dataset.textAnimation;
    if (this.shuffleEnable === "true") {
      this.categorySuffleEffect();
    }
  }
  mouseOverEventInit() {
    const featuredCollectionList = this.querySelectorAll('[data-featured-banner-collections]');
    const featuredCollectionImages = this.querySelectorAll('[data-featured-banner-images]');
    featuredCollectionList.forEach((collectionLi, key) => {
      const triggerEvent = () => {
        if (!collectionLi.classList.contains('active')) {
          collectionLi.classList.add('active');
          featuredCollectionImages[key].classList.add('active');
          this.removeContentClass(featuredCollectionList, featuredCollectionImages, key);
        }
      };
      collectionLi.addEventListener('mouseover', triggerEvent);
      const link = collectionLi.querySelector('a');
      if (link) {
        link.addEventListener('focus', triggerEvent);
      }
    });
  }
  removeContentClass(elefirst, eleSecond, keyEle) {
    elefirst.forEach((ele, key) => {
      if (key != keyEle) {
        if (ele.classList.contains('active')) {
          ele.classList.remove('active');
        }
        if (eleSecond[key].classList.contains('active')) {
          eleSecond[key].classList.remove('active');
        }
      }
    })
  }
  categorySuffleEffect() {
    const categoryCollectionList = this.querySelectorAll('[category-hover-title]');
    const shuffleClassInitCategory = new ShuffleTextEffect({
      velocity: 50,
      shuffleIterations: 5,
      childSelector: 'span'
    });
    shuffleClassInitCategory.applyShuffleEffect(categoryCollectionList);
  }
}
customElements.define('category-hover-highlight', CategoryHoverHighlightElement);
class RevealCategoriesElement extends HTMLElement {
  constructor() {
    super();
    this.revealCategoryWrap();
    this.revealCategoryHeightAdjust();
    this.revealCategoryCreateBox();
    this.revealSuffleEffect();
    this.revealToggleClass();
  }
  revealCategoryWrap() {
    const wrapperParentReveal = this.querySelector('[reveal-highlight-overlay]');
    const wrapperReveal = document.createElement('div');
    wrapperReveal.className = 'reveal-category-overlay-wrapper';
    wrapperParentReveal.appendChild(wrapperReveal);
  }
  revealCategoryHeightAdjust() {
    const parentListreveal = this.querySelector('[reveal-catgory-image-list]');
    const listItems = parentListreveal.querySelectorAll("li");
    gsap.set(parentListreveal, { height: window.innerHeight });
    gsap.set(listItems, { height: window.innerHeight });
  }
  revealCategoryCreateBox() {
    const captionBoxColor = this.querySelector('[reveal-category-caption]');
    const backgroundColor = gsap.getProperty(captionBoxColor, "--pixel-background");
    let viewPortWidth = window.innerWidth;
    let viewPortHeight = window.innerHeight;
    let boxPerRow = 0;
    if (viewPortWidth >= 1920) {
      boxPerRow = 14;
    } else if (viewPortWidth >= 1600) {
      boxPerRow = 18;
    } else if (viewPortWidth >= 1280) {
      boxPerRow = 16;
    } else if (viewPortWidth >= 1024) {
      boxPerRow = 14;
    } else if (viewPortWidth >= 768) {
      boxPerRow = 12;
    } else {
      boxPerRow = 10;
    }
    const boxSizeSquare = viewPortWidth / boxPerRow;
    let boxWrapperElement = this.querySelector('.reveal-category-overlay-wrapper');
    boxWrapperElement.innerHTML = '';
    let parentListWidth = boxWrapperElement.parentElement.offsetWidth;
    let parentListHeight = boxWrapperElement.parentElement.offsetHeight;
    let totalColumn = Math.ceil(parentListWidth / boxSizeSquare);
    let totalRows = Math.ceil(parentListHeight / boxSizeSquare);
    let pixelToPercent = (100 / totalColumn) + '%';
    for (var i = 0; i < totalRows * totalColumn; i++) {
      var boxCreate = document.createElement('div');
      boxCreate.className = 'reveal-overlay-box';
      boxCreate.style.width = pixelToPercent;
      boxCreate.style.backgroundColor = backgroundColor;
      boxWrapperElement.appendChild(boxCreate);
    }
  }
  revealSuffleEffect() {
    const wrapper = this.querySelector('[animatedSection]');
    if (!wrapper) return;
    const animationStyle = wrapper.dataset.animationStyle;
    if (animationStyle == 'text' || animationStyle == 'both') {
      const captionListData = this.querySelectorAll('[reveal-caption-list]');
      const shuffleClassInit = new ShuffleTextEffect({
        velocity: 50,
        shuffleIterations: 5,
        childSelector: 'span'
      });
      shuffleClassInit.applyShuffleEffect(captionListData);
    }
  }
  revealToggleClass() {
    const captionListData = this.querySelectorAll('[reveal-caption-list]');
    const imageListData = this.querySelectorAll('[reveal-category-images]');
    captionListData.forEach((ele, key) => {
      ele.addEventListener('mouseenter', (event) => {
        const hoverTarget = event.currentTarget;
        if (!hoverTarget.classList.contains('active')) {
          ele.classList.add('active');
          imageListData[key].classList.add('active');
          this.revealRemoveContentClass(captionListData, imageListData, key);
        }
      })
    })
  }
  revealRemoveContentClass(elefirst, eleSecond, keyEle) {
    elefirst.forEach((ele, key) => {
      if (key != keyEle) {
        if (ele.classList.contains('active')) {
          ele.classList.remove('active');
        }
        if (eleSecond[key].classList.contains('active')) {
          eleSecond[key].classList.remove('active');
        }
      }
    })
  }
}
customElements.define('reveal-categories', RevealCategoriesElement);
class TestimonialSlider extends HTMLElement {
  constructor() {
    super();
    this.swiperIntiate();
  }
  swiperIntiate() {
    const swiperElement = this.querySelector('[data-swiper]');
    if (!swiperElement) return;
    const swiperProperty = JSON.parse(swiperElement.getAttribute('data-swiper'));
    theme.SwiperSliderInit(swiperElement, swiperProperty);
  }
}
customElements.define('testimonials-slider', TestimonialSlider);
class TestimonialCards extends HTMLElement {
  constructor() {
    super();
    this.mySwiper = null;
    this.initSwiper();
  }

  initSwiper() {
    const swiperElement = this.querySelector('[data-swiper]');
    if (!swiperElement) return;

    const swiperProperty = JSON.parse(swiperElement.getAttribute('data-swiper'));
    if (!swiperProperty) return;
    if (!this.mySwiper) {
      this.mySwiper = theme.SwiperSliderInit(swiperElement, swiperProperty);
    }
  }
}
customElements.define('testimonial-card', TestimonialCards);
class ScrollingText extends HTMLElement {
  constructor() {
    super();
    this._resizeHandler = this._resizeHandler.bind(this);
  }
  connectedCallback() {
    this.marqueeCloned();
    window.addEventListener("resize", this._resizeHandler);
  }
  disconnectedCallback() {
    window.removeEventListener("resize", this._resizeHandler);
  }
  _resizeHandler() {
    clearTimeout(this._resizeTimeout);
    this._resizeTimeout = setTimeout(() => {
      this.resetMarquee();
      this.marqueeCloned();
    }, 300);
  }
  resetMarquee() {
    const marqueeWrapper = this.querySelectorAll('[scrolling-main-wrapper]');
    if (!marqueeWrapper.length) return;
    const firstWrapper = marqueeWrapper[0];
    const firstNode = firstWrapper.querySelector('[scrolling-text-node]');
    marqueeWrapper.forEach((w, i) => {
      if (i === 0) {
        w.innerHTML = '';
        if (firstNode) w.appendChild(firstNode);
      } else {
        w.remove();
      }
    });
  }
  marqueeCloned() {
    let bidirection = false;
    let multiplier = 1.5;
    if (this.classList.contains('bidirection-enabled')) { bidirection = true; multiplier = 2.5 }
    const marqueeWrapper = this.querySelector('[scrolling-main-wrapper]');
    const marqueeNode = this.querySelector('[scrolling-text-node]');
    if (!marqueeWrapper || !marqueeNode) return;
    const marqueeWrapperWidth = marqueeWrapper.offsetWidth;
    let marqueeNodeWidth = marqueeNode.offsetWidth;
    let cloneCount = 0;
    do {
      const clonedMarquee = marqueeNode.cloneNode(true);
      marqueeWrapper.appendChild(clonedMarquee);
      marqueeNodeWidth += clonedMarquee.offsetWidth;
      cloneCount++;
      if (cloneCount > 20) break;
    }
    while (marqueeNodeWidth < marqueeWrapperWidth * multiplier) {
      const clonedMarquee = marqueeNode.cloneNode(true);
      marqueeWrapper.appendChild(clonedMarquee);
      marqueeNodeWidth += clonedMarquee.offsetWidth;
      cloneCount++;
    }
    marqueeWrapper.classList.add("marquee-autoplay");
    if (bidirection) {
      const cloneWrapper = marqueeWrapper.cloneNode(true);
      marqueeWrapper.parentNode.insertBefore(cloneWrapper, marqueeWrapper.nextSibling);
      const allMarqueeWrapper = this.querySelectorAll('[scrolling-main-wrapper]');
      if (allMarqueeWrapper[0].classList.contains('marquee-direction-bidir')) {
        allMarqueeWrapper[0].classList.replace("marquee-direction-bidir", "marquee-direction-ltr");
      } else {
        allMarqueeWrapper[0].classList.add("marquee-direction-ltr");
      }
      if (allMarqueeWrapper[1].classList.contains('marquee-direction-bidir')) {
        allMarqueeWrapper[1].classList.replace("marquee-direction-bidir", "marquee-direction-rtl");
      } else {
        allMarqueeWrapper[1].classList.replace("marquee-direction-ltr", "marquee-direction-rtl");
      }
    }
  }
}
customElements.define('scrolling-text', ScrollingText);
class CategoryTabCollection extends HTMLElement {
  constructor() {
    super();
    //this.marqueeCloneItem();
    this.initCollection();
    this._resizeHandler = this._resizeHandler.bind(this);
  }
  connectedCallback() {
    this.marqueeCloneItem();
    window.addEventListener("resize", this._resizeHandler);
  }
  disconnectedCallback() {
    window.removeEventListener("resize", this._resizeHandler);
  }
  _resizeHandler() {
    clearTimeout(this._resizeTimeout);
    this._resizeTimeout = setTimeout(() => {
      this.marqueeCloneItem();
    }, 300);
  }
  initCollection() {
    const collectionMediaAll = this.querySelectorAll('[data-collection-media-wrap-main]');
    const collectionTabs = this.querySelectorAll('[category-tab-list]');
    const mouseEvent = this.getAttribute("data-event-action");
    // Store references for keyboard navigation
    this.collectionMediaAll = collectionMediaAll;
    this.collectionTabs = collectionTabs;
    this.currentActiveTabIndex = 0;

    collectionMediaAll.forEach((ele, index) => {
      const childrenCollection = ele.querySelectorAll('[data-collection-media]');
      childrenCollection.forEach((eleChild, indexChild) => {
        eleChild.addEventListener('mouseenter', (event) => {
          const hoverTarget = event.currentTarget;
          if (!hoverTarget.classList.contains('active')) {
            eleChild.classList.add('active');
            this.removeActiveClassCards(childrenCollection, indexChild);
          }
        });

        eleChild.addEventListener('focus', (event) => {
          const hoverTarget = event.currentTarget;
          if (!hoverTarget.classList.contains('active')) {
            eleChild.classList.add('active');
            this.removeActiveClassCards(childrenCollection, indexChild);
          }
        });
      })
    })

    collectionTabs.forEach((tabsBtn, indexTab) => {
      tabsBtn.addEventListener(mouseEvent, (event) => {
        const hoverTargetTab = event.currentTarget;
        if (!hoverTargetTab.classList.contains('active')) {
          this.switchToTab(indexTab);
        }
      });
      tabsBtn.addEventListener('focus', (event) => {
        const hoverTargetTab = event.currentTarget;
        if (!hoverTargetTab.classList.contains('active')) {
          this.switchToTab(indexTab);
        }
      });

      // Add keyboard navigation for tab switching
      tabsBtn.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.switchToTab(indexTab);
        }
      });
    })

    // Add keyboard navigation for media items
    this.setupKeyboardNavigation();
  }

  switchToTab(tabIndex) {
    this.collectionTabs[tabIndex].classList.add('active');
    this.collectionMediaAll[tabIndex].classList.add('active');
    this.removeActiveClassCards(this.collectionTabs, tabIndex, this.collectionMediaAll);
    this.currentActiveTabIndex = tabIndex;

    // Update ARIA attributes
    this.updateAriaAttributes(tabIndex);

    // Update tabindex for media items
    this.updateMediaItemsTabIndex();
  }

  updateAriaAttributes(activeTabIndex) {
    this.collectionTabs.forEach((tab, index) => {
      const isActive = index === activeTabIndex;
      tab.setAttribute('aria-selected', isActive.toString());
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
    });
  }

  setupKeyboardNavigation() {
    // Add keyboard navigation to all media items
    this.collectionMediaAll.forEach((mediaWrapper, tabIndex) => {
      const mediaItems = mediaWrapper.querySelectorAll('[data-collection-media]');
      mediaItems.forEach((mediaItem, itemIndex) => {
        mediaItem.addEventListener('keydown', (event) => {
          if (event.key === 'Tab') {
            this.handleMediaItemTabNavigation(event, tabIndex, itemIndex, mediaItems);
          }
        });
      });
    });
  }

  updateMediaItemsTabIndex() {
    this.collectionMediaAll.forEach((mediaWrapper, tabIndex) => {
      const mediaItems = mediaWrapper.querySelectorAll('[data-collection-media]');
      const isActiveTab = tabIndex === this.currentActiveTabIndex;

      mediaItems.forEach((mediaItem, itemIndex) => {
        if (isActiveTab) {
          // Make media items in active tab focusable
          mediaItem.setAttribute('tabindex', '0');
          if (mediaItem.tagName === 'A') {
            mediaItem.setAttribute('tabindex', '0');
          }
        } else {
          // Make media items in inactive tabs not focusable
          mediaItem.setAttribute('tabindex', '-1');
          if (mediaItem.tagName === 'A') {
            mediaItem.setAttribute('tabindex', '-1');
          }
        }
      });
    });
  }
  handleMediaItemTabNavigation(event, tabIndex, itemIndex, mediaItems) {
    if (tabIndex !== this.currentActiveTabIndex) return;
    const isLastItem = itemIndex === mediaItems.length - 1;
    const isFirstItem = itemIndex === 0;
    const totalTabs = this.collectionTabs.length;
    if (event.shiftKey) {
      if (isFirstItem) {
        if (tabIndex > 0) {
          // Move to the previous tab
          event.preventDefault();
          const prevTabIndex = tabIndex - 1;
          this.switchToTab(prevTabIndex);
          const prevMediaItems = this.collectionMediaAll[prevTabIndex].querySelectorAll('[data-collection-media]');
          prevMediaItems[prevMediaItems.length - 1].focus();
        }
        // else → allow natural backward focus out of this section
      }
    } else {
      // Tab (forward)
      if (isLastItem) {
        if (tabIndex < totalTabs - 1) {
          event.preventDefault();
          const nextTabIndex = tabIndex + 1;
          this.switchToTab(nextTabIndex);
          const nextMediaItems = this.collectionMediaAll[nextTabIndex].querySelectorAll('[data-collection-media]');
          nextMediaItems[0].focus();
        }
      }
    }
  }


  widthElementData(cardLength) {
    const widthEachCard = 100 / cardLength;
    const roundedValue = Math.round(widthEachCard * 100) / 100;
    let multiplyCard = 1.5;
    if (cardLength > 2) {
      multiplyCard = 2;
    }
    const firstValue = roundedValue * multiplyCard;
    const remainingValue = 100 - firstValue;
    const remainingCards = cardLength - 1;
    const remainingWidthCards = remainingValue / remainingCards;
    const remainingWidthCardsRound = Math.round(remainingWidthCards * 100) / 100;
    return [firstValue, remainingWidthCardsRound];
  }
  removeActiveClassCards(elements, keyEle, secondElements = null) {
    elements.forEach((ele, key) => {
      if (key != keyEle) {
        if (ele.classList.contains('active')) {
          ele.classList.remove('active');
        }
        if (secondElements != null) {
          if (secondElements[key].classList.contains('active')) {
            secondElements[key].classList.remove('active');
          }
        }
      }
    })
  }
  marqueeCloneItem() {
    const headerStyleCalled = this.getAttribute("data-header-style");
    if (headerStyleCalled == 'marquee') {
      const marqueeWrap = this.querySelector('[marquee-main-wrapper]');
      const marqueeChild = this.querySelector('.section-header-block');
      if (!marqueeWrap || !marqueeChild) return;
      const mainWrapperWidth = marqueeWrap.offsetWidth;
      let marqueeChildWidth = marqueeChild.offsetWidth;
      let cloneChild = 0;
      while (cloneChild < 1 || marqueeChildWidth < mainWrapperWidth * 2) {
        const clonedChild = marqueeChild.cloneNode(true);
        marqueeWrap.appendChild(clonedChild);
        marqueeChildWidth += clonedChild.offsetWidth;
        cloneChild++;
        if (cloneChild > 20) break;
      }
      marqueeWrap.classList.add("marquee-autoplay");
    }
  }
}
customElements.define('category-tabs-style', CategoryTabCollection);

class ScrollToTop extends HTMLElement {
  constructor() {
    super();
    this.autoScrollToTop();
  }
  autoScrollToTop() {
    this.addEventListener('click', () => {
      this.scrollToTop();
    });
  }
  scrollToTop(duration = 2000) {
    const startScrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const startTime = performance.now();
    const easeOutValue = (t) => t * (2 - t);
    const animateScrollToTop = (currentTime) => {
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const easedProgress = easeOutValue(progress);
      const scrollY = startScrollY * (1 - easedProgress);
      window.scrollTo(0, scrollY);
      if (progress < 1) {
        requestAnimationFrame(animateScrollToTop);
      }
    };
    requestAnimationFrame(animateScrollToTop);
  }
}
customElements.define('scroll-to-top', ScrollToTop);

class loginScrollingText extends HTMLElement {
  constructor() {
    super();
    this.scrollingMarquee();
  }
  scrollingMarquee() {
    let multiplier = 2.5;
    const marqueeWrapper = this.querySelector('[marquee-wrapper-main]');
    const marqueeNode = this.querySelector('[marquee-text-node]');
    if (!marqueeWrapper || !marqueeNode) return;
    const marqueeWrapperWidth = marqueeWrapper.offsetWidth;
    let marqueeNodeWidth = marqueeNode.offsetWidth;
    let cloneCount = 0;
    while (marqueeNodeWidth < marqueeWrapperWidth * multiplier) {
      const clonedMarquee = marqueeNode.cloneNode(true);
      marqueeWrapper.appendChild(clonedMarquee);
      marqueeNodeWidth += clonedMarquee.offsetWidth;
      cloneCount++;
      if (cloneCount > 10) break;
    }
    marqueeWrapper.classList.add("marquee-autoplay");
    const allNodesCreated = this.querySelectorAll('[marquee-text-node]');
    if (allNodesCreated.length > 0) {
      allNodesCreated.forEach((el, index) => {
        if (index % 2 === 0) {
          el.classList.add('markers-text');
          el.classList.add('outline-text');
        }
      })
    }
  }
}
customElements.define('scrolling-text-login', loginScrollingText);

class multiColumnSection extends HTMLElement {
  constructor() {
    super();
    this.mySwiper = null;
    this.initialSwiper();
  }
  initialSwiper() {
    const swiperElement = this.querySelector('[data-swiper]');
    if (!swiperElement) return;

    const swiperProperty = JSON.parse(swiperElement.getAttribute('data-swiper'));
    if (!swiperProperty) return;

    const init = () => {
      if (!this.mySwiper) {
        this.mySwiper = theme.SwiperSliderInit(swiperElement, swiperProperty);
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
}
customElements.define('multicolumn-section', multiColumnSection);
class variantsButtonAction extends HTMLElement {
  constructor() {
    super();
    this.drawerView = document.querySelector('drawer-section-view');
    this.variantButton();
  }
  variantButton() {
    this.addEventListener('click', () => {
      window.setLastFocusedElement(this);
      this.fetchProductData();
    })
    this.addEventListener('keydown', (e) => {
      if (e.key === "Enter") {
        window.setLastFocusedElement(this);
        this.fetchProductData();
      }
    })
  }
  fetchProductData() {
    if (this.hasAttribute("data-product-url")) {
      if (!this.drawerView) return;
      const loaderSpiner = this.querySelector('.dots-container');
      if (loaderSpiner) {
        loaderSpiner.classList.remove('hidden');
      }
      const sectionId = this.drawerView.dataset.sectionId;
      const productUrl = this.dataset.productUrl;
      const sectionUrl = `${productUrl}?section_id=${sectionId}`;
      fetch(sectionUrl)
        .then((response) => response.text())
        .then((responseText) => {
          const QuickViewElement = new DOMParser().parseFromString(responseText, 'text/html').querySelector('drawer-section-view');
          if (QuickViewElement) {
            this.drawerView.innerHTML = QuickViewElement.innerHTML;
            this.swiperIntiate(this.drawerView);
            this.openDrawer();
            const closeDrawerAjax = this.drawerView.querySelector('[drawer-close-button]');
            if (closeDrawerAjax) {
              closeDrawerAjax.addEventListener('click', () => {
                this.closeDrawer();
              });
            }
          } else {
            console.info('Product element not found in the fetched content.');
          }
        })
        .catch((error) => {
          console.info('Error fetching or parsing product content:', error);
        });
    }
  }
  openDrawer() {
    let timeOutValue = 500;
    const getParentElement = this.closest('[product-card-detail]');
    if (getParentElement) {
      const variantBlockCard = getParentElement.querySelector('variants-card');
      if (variantBlockCard) {
        const activeVariantId = variantBlockCard.getActiveVariant();
        if (activeVariantId) {
          timeOutValue = 1000;
          const matchingInput = this.drawerView.querySelector(`input[type="radio"][data-variant-id="${activeVariantId}"]`);
          if (matchingInput) {
            matchingInput.checked = true;
            matchingInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      }
    }
    this.drawerView.setAttribute('drawer-open', '');
    setTimeout(() => {
      const loaderSpiner = this.querySelector('.dots-container');
      if (loaderSpiner) {
        loaderSpiner.classList.add('hidden');
      }
      this.drawerView.classList.add('drawer-open');
      document.body.classList.add('overflow-hidden');
      setTimeout(() => {
        trapFocus(this.drawerView);
      }, 500);
      this.overlay = this.drawerView.querySelector('[drawer-close]');
      if (this.overlay) {
        this.overlay.addEventListener('click', () => {
          this.closeDrawer();
        })
      }
    }, timeOutValue);
  }
  closeDrawer() {
    this.drawerView.classList.remove('drawer-open');
    setTimeout(() => {
      this.drawerView.removeAttribute('drawer-open');
      if (window.lastFocusedElement != null) {
        window.returnFocusToLastElement();
      }
    }, 300);
    document.body.classList.remove('overflow-hidden');
  }
  swiperIntiate(swiperQuickView) {
    const swiperElement = swiperQuickView.querySelector('[data-swiper]');
    if (!swiperElement) return;
    const swiperProperty = JSON.parse(swiperElement.getAttribute('data-swiper'));
    const thumbSwiperElement = swiperQuickView.querySelector('[data-swiper-thumbnail]');
    let thumbSwiperInstance = null;
    if (thumbSwiperElement) {
      const thumbProperty = JSON.parse(thumbSwiperElement.getAttribute('data-swiper-thumbnail'));
      thumbSwiperInstance = theme.SwiperSliderInit(thumbSwiperElement, thumbProperty);
    }
    if (thumbSwiperInstance) {
      swiperProperty.thumbs = {
        swiper: thumbSwiperInstance
      };
    }
    theme.SwiperSliderInit(swiperElement, swiperProperty);
  }
}
customElements.define('variant-button', variantsButtonAction);

class variantsOverCards extends HTMLElement {
  constructor() {
    super();
    this.initClick();
    this.productCard = this.closest('[data-product-card-wrapper]');
    if (this.productCard) {
      this.productCardMainImage = this.productCard.querySelector('[data-product-card-main-image]');
    }
  }

  initClick() {
    const listItems = this.querySelectorAll('li');
    listItems.forEach((ele) => {
      ele.addEventListener('click', (event) => {
        listItems.forEach(item => item.classList.remove('active'));
        const clickedItem = event.currentTarget;
        clickedItem.classList.add('active');
        const optionId = clickedItem.dataset.variantIdCard;
        this.setVariantImageActive(optionId);
      });
    });
  } 

  setVariantImageActive(optionId) {
    const variantImages = this.productCard.querySelectorAll('[data-variant-image]');    
    let matchFound = false;
    variantImages.forEach((img) => {
      if (img.dataset.variantImage === optionId) {
        img.classList.add('is-active');
        matchFound = true;
      } else {
        img.classList.remove('is-active');
      }
    });
    // hide main image only if match found
    if (this.productCardMainImage) {
      if (matchFound) {
        this.productCardMainImage.classList.add('hidden');
      } else {
        this.productCardMainImage.classList.remove('hidden');
      }
    }
  }

  getActiveVariant() {
    return this.querySelector('li.active')?.dataset.variantIdCard || null;
  }
}
customElements.define('variants-card', variantsOverCards);

class QuickViewDrawer extends HTMLElement {
  constructor() {
    super();
    this.overlay = this.querySelector('[drawer-close]');
    if (Shopify.designMode) {
      this.section = this.closest('.shopify-section');
      this.section.addEventListener('shopify:section:select', () => this.openQuickViewModal());
      this.section.addEventListener('shopify:section:deselect', () => this.closeQuickViewModal());
      this.section.addEventListener('shopify:section:unload', () => this.closeQuickViewModal());
      this.section.addEventListener('shopify:section:load', () => this.openQuickViewModal());
    }
    this.overlay.addEventListener('click', (e) => {
      this.closeQuickViewModal();
    })
    this.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.closeQuickViewModal());
  }
  openQuickViewModal() {
    this.setAttribute('drawer-open', '');
    setTimeout(() => {
      this.classList.add('drawer-open');
    }, 500);
    document.body.classList.add('overflow-hidden');
    this.querySelector('[drawer-close-button]').addEventListener('click', () => {
      this.closeQuickViewModal();
    })
  }
  closeQuickViewModal() {
    this.classList.remove('drawer-open');
    setTimeout(() => {
      this.removeAttribute('drawer-open');
      if (window.lastFocusedElement != null) {
        window.returnFocusToLastElement();
      }
    }, 300);
    document.body.classList.remove('overflow-hidden');
  }
}
customElements.define('drawer-section-view', QuickViewDrawer);
class quickViewCardsButton extends HTMLElement {
  constructor() {
    super();
    this.drawerView = document.querySelector('drawer-section-view');
  }
  connectedCallback() {
    const productId = this.dataset.productId;
    this.addEventListener('click', () => {
      const lastfocuseElement = this.querySelector('button');
      if (lastfocuseElement) {
        window.setLastFocusedElement(lastfocuseElement);
      }
      this.fetchProductData();
    })
  }
  fetchProductData() {
    if (this.hasAttribute("data-product-url")) {
      if (!this.drawerView) return;
      const loaderSpiner = this.querySelector('.dots-container');
      if (loaderSpiner) {
        loaderSpiner.classList.remove('hidden');
      }
      const sectionId = this.drawerView.dataset.sectionId;
      const productUrl = this.dataset.productUrl;
      const sectionUrl = `${productUrl}?section_id=${sectionId}`;
      fetch(sectionUrl)
        .then((response) => response.text())
        .then((responseText) => {
          const QuickViewElement = new DOMParser().parseFromString(responseText, 'text/html').querySelector('drawer-section-view');
          if (QuickViewElement) {
            this.drawerView.innerHTML = QuickViewElement.innerHTML;
            this.swiperIntiate(this.drawerView);
            this.openDrawer();
            const closeDrawerAjax = this.drawerView.querySelector('[drawer-close-button]');
            if (closeDrawerAjax) {
              closeDrawerAjax.addEventListener('click', () => {
                this.closeDrawer();
              });
            }
          } else {
            console.info('Product element not found in the fetched content.');
          }
        })
        .catch((error) => {
          console.info('Error fetching or parsing product content:', error);
        });
    }
  }
  openDrawer() {
    let timeOutValue = 500;
    this.drawerView.setAttribute('drawer-open', '');
    setTimeout(() => {
      this.drawerView.classList.add('drawer-open');
      document.body.classList.add('overflow-hidden');
      const loaderSpiner = this.querySelector('.dots-container');
      if (loaderSpiner) {
        loaderSpiner.classList.add('hidden');
      }
      setTimeout(() => {
        trapFocus(this.drawerView);
      }, 500);
      this.overlay = this.drawerView.querySelector('[drawer-close]');
      if (this.overlay) {
        this.overlay.addEventListener('click', () => {
          this.closeDrawer();
        })
      }
    }, timeOutValue);
  }
  closeDrawer() {
    this.drawerView.classList.remove('drawer-open');
    setTimeout(() => {
      this.drawerView.removeAttribute('drawer-open');
      if (window.lastFocusedElement != null) {
        window.returnFocusToLastElement();
      }
    }, 300);
    document.body.classList.remove('overflow-hidden');
  }
  swiperIntiate(swiperQuickView) {
    const swiperElement = swiperQuickView.querySelector('[data-swiper]');
    if (!swiperElement) return;
    const swiperProperty = JSON.parse(swiperElement.getAttribute('data-swiper'));
    const thumbSwiperElement = swiperQuickView.querySelector('[data-swiper-thumbnail]');
    let thumbSwiperInstance = null;
    if (thumbSwiperElement) {
      const thumbProperty = JSON.parse(thumbSwiperElement.getAttribute('data-swiper-thumbnail'));
      thumbSwiperInstance = theme.SwiperSliderInit(thumbSwiperElement, thumbProperty);
    }
    if (thumbSwiperInstance) {
      swiperProperty.thumbs = {
        swiper: thumbSwiperInstance
      };
    }
    theme.SwiperSliderInit(swiperElement, swiperProperty);
  }
}
customElements.define('card-quick-view-button', quickViewCardsButton);
class CompareProductDrawer extends HTMLElement {
  constructor() {
    super();
    this.overlay = this.querySelector('[pop-up-drawer-overlay]');
    if (Shopify.designMode) {
      this.section = this.closest('.shopify-section');
      this.section.addEventListener('shopify:section:select', () => this.openCompareModal());
      this.section.addEventListener('shopify:section:deselect', () => this.closeCompareModal());
      this.section.addEventListener('shopify:section:unload', () => this.closeCompareModal());
      this.section.addEventListener('shopify:section:load', () => this.openCompareModal());
    }
    this.overlay.addEventListener('click', () => {
      this.closeCompareModal();
    })
  }
  openCompareModal() {
    if (this.dataset.blockSize > 0) {
      this.querySelector('[compare-popup-data-body]').classList.add('show');
      document.body.classList.add('overflow-hidden');
      this.querySelector('[pop-up-drawer-close]').addEventListener('click', () => {
        this.closeCompareModal();
      })
    }
  }
  closeCompareModal() {
    this.querySelector('[compare-popup-data-body]').classList.remove('show');
    document.body.classList.remove('overflow-hidden');
  }
}
customElements.define('compare-drawer-section', CompareProductDrawer);

class cartBagHeader extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', this.openDrawer.bind(this));
  }
  openDrawer(e) {
    e.preventDefault()
    this.cart_drawer = document.querySelector('cart-drawer');
    if (this.cart_drawer) {
      this.cart_drawer.setAttribute('drawer-open', '');
      setTimeout(() => {
        this.cart_drawer.classList.add('drawer-open');
      }, 500);
      document.body.classList.add('overflow-hidden');
    }
  }
}
customElements.define('cart-drawer-bag', cartBagHeader);

class VariantSelects extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.addEventListener('change', (event) => {
      const target = this.getInputForEventTarget(event.target);
      // this.updateSelectionMetadata(event);
      publish(PUB_SUB_EVENTS.optionValueSelectionChange, {
        data: {
          event,
          target,
          selectedOptionValues: this.selectedOptionValues,
        },
      });
    });
  }
  updateSelectionMetadata({ target }) {
    const { value, tagName } = target;
    if (tagName === 'SELECT' && target.selectedOptions.length) {
      Array.from(target.options)
        .find((option) => option.getAttribute('selected'))
        .removeAttribute('selected');
      target.selectedOptions[0].setAttribute('selected', 'selected');

      const swatchValue = target.selectedOptions[0].dataset.optionSwatchValue;
      const selectedDropdownSwatchValue = target
        .closest('.product-form__input')
        .querySelector('[data-selected-value] > .swatch');
      if (!selectedDropdownSwatchValue) return;
      if (swatchValue) {
        selectedDropdownSwatchValue.style.setProperty('--swatch--background', swatchValue);
        selectedDropdownSwatchValue.classList.remove('swatch--unavailable');
      } else {
        selectedDropdownSwatchValue.style.setProperty('--swatch--background', 'unset');
        selectedDropdownSwatchValue.classList.add('swatch--unavailable');
      }
      selectedDropdownSwatchValue.style.setProperty(
        '--swatch-focal-point',
        target.selectedOptions[0].dataset.optionSwatchFocalPoint || 'unset'
      );
    }
  }
  getInputForEventTarget(target) {
    return target.tagName === 'SELECT' ? target.selectedOptions[0] : target;
  }
  get selectedOptionValues() {
    const selectedValues = [];
    // Handle select elements - get the currently selected option
    this.querySelectorAll('select').forEach(select => {
      const selectedOption = select.selectedOptions[0];
      if (selectedOption && selectedOption.dataset.optionValueId) {
        selectedValues.push(selectedOption.dataset.optionValueId);
      }
    });
    // Handle input elements (radio buttons)
    this.querySelectorAll('input:checked').forEach(input => {
      if (input.dataset.optionValueId) {
        selectedValues.push(input.dataset.optionValueId);
      }
    });
    return selectedValues;
  }
}
customElements.define('variant-selects', VariantSelects);

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true });
    this.input.addEventListener('change', this.onInputChange.bind(this));
    this.querySelectorAll('button').forEach((button) =>
      button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }
  quantityUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.validateQtyRules();
    this.quantityUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.quantityUpdate, this.validateQtyRules.bind(this));
  }

  disconnectedCallback() {
    if (this.quantityUpdateUnsubscriber) {
      this.quantityUpdateUnsubscriber();
    }
  }

  onInputChange(event) {
    this.validateQtyRules();
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;
    if (event.target.name === 'plus') {
      if (parseInt(this.input.dataset.min) > parseInt(this.input.step) && this.input.value == 0) {
        this.input.value = this.input.dataset.min;
      } else {
        this.input.stepUp();
      }
    } else {
      this.input.stepDown();
    }

    if (previousValue !== this.input.value) {
      this.input.dispatchEvent(this.changeEvent);
    }

    if (this.input.dataset.min === previousValue && event.target.name === 'minus') {
      this.input.value = parseInt(this.input.min);
    }
  }

  validateQtyRules() {
    const value = parseInt(this.input.value);
    if (this.input.min) {
      const buttonMinus = this.querySelector(".quantity-button[name='minus']");
      buttonMinus.classList.toggle('disabled', parseInt(value) <= parseInt(this.input.min));
    }
    if (this.input.max) {
      const max = parseInt(this.input.max);
      const buttonPlus = this.querySelector(".quantity-button[name='plus']");
      buttonPlus.classList.toggle('disabled', value >= max);
    }
  }
}
customElements.define('quantity-input', QuantityInput);

class CountryProvince extends HTMLElement {
  constructor() {
    super();
    this.provinceElement = this.querySelector('[name="address[province]"]');
    this.countryElement = this.querySelector('[name="address[country]"]');

    this.countryElement.addEventListener('change', this.CountryChange.bind(this));

    const defaultCountry = this.countryElement.getAttribute('data-default');
    const defaultProvince = this.provinceElement.getAttribute('data-default');

    if (defaultCountry) {
      this.setSelectedOption(this.countryElement, defaultCountry);
    }

    this.CountryChange(defaultProvince);
  }

  setSelectedOption(selectElement, value) {
    const selectedIndex = Array.from(selectElement.options).findIndex((option) => option.value === value);
    selectElement.selectedIndex = selectedIndex !== -1 ? selectedIndex : 0;
    selectElement.dispatchEvent(new Event('change', { bubbles: true }));
  }

  CountryChange(defaultProvince = null) {
    const option = this.countryElement.options[this.countryElement.selectedIndex];
    const provinces = JSON.parse(option.dataset.provinces || '[]');
    const shouldHide = provinces.length === 0;
    this.provinceElement.parentElement.hidden = shouldHide;
    this.provinceElement.closest('.form-group').classList.toggle('hidden', shouldHide);

    this.provinceElement.innerHTML = '';

    if (!shouldHide) {
      provinces.forEach(([value, name]) => {
        const selected = defaultProvince ? value === defaultProvince : false;
        this.provinceElement.options.add(new Option(name, value, selected, selected));
      });
      if (defaultProvince) {
        this.setSelectedOption(this.provinceElement, defaultProvince);
      }
    }
  }
}
customElements.define('country-province', CountryProvince);

class ShippingCalculator extends HTMLElement {
  constructor() {
    super(), this._setupCountries();
    this.submitButton = this.querySelector('[type="submit"]');
    this.resultsElement = this.querySelector('[data-shipping-result]');
    this.submitButton.addEventListener('click', this.handleFormSubmit.bind(this));
  }
  handleFormSubmit(event) {
    event.preventDefault();
    this.resultsElement.classList.add('hidden');
    const zip = this.querySelector('[name="address[zip]"]').value;
    const country = this.querySelector('[name="address[country]"]').value;
    const province = this.querySelector('[name="address[province]"]').value;
    const body = JSON.stringify({
      shipping_address: {
        zip,
        country,
        province,
      },
    });

    let sectionUrl = `${routes.cart_url}/shipping_rates.json`;
    sectionUrl = sectionUrl.replace('//', '/');

    fetch(sectionUrl, {
      ...theme.utils.fetchConfig(),
      ...{ body },
    })
      .then((response) => response.json())
      .then((parsedState) => {
        parsedState.shipping_rates
          ? this.formatShippingRates(parsedState.shipping_rates)
          : this.formatError(parsedState);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        (this.resultsElement.hidden = !1), this.submitButton.removeAttribute('aria-busy');
      });
  }

  formatShippingRates(shippingRates) {
    const shippingRatesList = shippingRates.map((rate) => {
      const { presentment_name, currency, price } = rate;
      return `<div class="cart-form-message form-message form-message-success text-small">${presentment_name}: ${currency} ${price}</div>`;
    });
    // this.resultsElement.classList.add('bg-success-bg');
    this.resultsElement.innerHTML = `${shippingRatesList.join('')}`;
    this.resultsElement.classList.remove('hidden');
  }

  formatError(errors) {
    const errorMessages = Object.values(errors)
      .map((error) => `<div class="cart-form-message form-message form-message-error text-small">${error}</div>`)
      .join('');
    // this.resultsElement.classList.add('bg-error-bg');
    this.resultsElement.innerHTML = `${errorMessages}`;
    this.resultsElement.classList.remove('hidden');
  }

  _setupCountries() {
    if (Shopify && Shopify.CountryProvinceSelector) {
      new Shopify.CountryProvinceSelector('[shippingCountry]', '[shippingProvince]', {
        hideElement: '[shippingProvince]',
      });
    }
  }
}
customElements.define('shipping-calculator', ShippingCalculator);

class GiftWrap extends HTMLElement {
  constructor() {
    super();
    this.giftWrapId = this.dataset.giftWrapId;
    this.giftWrapping = this.dataset.giftWrapping;
    this.cartItemsSize = parseInt(this.getAttribute('cart-items-size'));
    this.giftWrapsInCart = parseInt(this.getAttribute('gift-wraps-in-cart'));
    this.itemsInCart = parseInt(this.getAttribute('items-in-cart'));
    this.source = this.dataset.source;
  }
  connectedCallback() {
    this.querySelector('[name="attributes[gift-wrapping]"]').addEventListener('change', (event) => {
      event.target.checked ? this.setGiftWrap() : this.removeGiftWrap();
    });
    if (this.cartItemsSize == 1 && this.giftWrapsInCart > 0) {
      return this.removeGiftWrap();
    }
  }
  setGiftWrap() {
    const body = JSON.stringify({
      updates: {
        [this.giftWrapId]: 1,
      },
      attributes: {
        'gift-wrapping': true,
      },
    });
    this.fetchGiftWrap(body);
  }
  removeGiftWrap() {
    const body = JSON.stringify({
      updates: {
        [this.giftWrapId]: 0,
      },
      attributes: {
        'gift-wrapping': '',
      },
    });
    this.fetchGiftWrap(body);
  }
  fetchGiftWrap(body) {
    fetch(`${window.routes.cart_update_url}`, { ...theme.utils.fetchConfig(), ...{ body } })
      .then((response) => response.json())
      .then((parsedState) => {
        const headerCartBag = document.getElementById('main-cart-count-header-right');
        if (headerCartBag) {
          headerCartBag.innerText = parsedState.item_count;
          if (parsedState.item_count == 0) {
            headerCartBag.classList.add('hidden');
          } else {
            headerCartBag.classList.remove('hidden');
          }
        }

        publish(PUB_SUB_EVENTS.cartUpdate, { cart: parsedState });
        const cartWrapper = document.querySelector('cart-items');
        if (cartWrapper) cartWrapper.classList.toggle('is-empty', parsedState.item_count === 0);

        /*
        const cartWrapper = document.querySelector('cart-items');
        const cartDrawerWrapper = document.querySelector('cart-drawer');
        const cartDrawerShipping = document.querySelector('cart-shipping');
        const cartFooter = document.getElementById('main-cart-footer');
        if (cartWrapper) cartWrapper.classList.toggle('is-empty', parsedState.item_count === 0);
        if (cartDrawerShipping) cartDrawerShipping.classList.toggle('is-empty', parsedState.item_count === 0);
        if (cartDrawerWrapper) cartDrawerWrapper.classList.toggle('is-empty', parsedState.item_count === 0);
        */
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
customElements.define('gift-wrapping', GiftWrap);

class AccordionDetails extends HTMLDetailsElement {
  constructor() {
    super();
    this.summary = this.querySelector('summary');
    this.content = this.querySelector('summary + *');
    // this.content = this.querySelector('[collapsible-content-wrapper]');
    this.animation = null;
    this.isClosing = false;
    this.isExpanding = false;
    this._resizeHandlerAccordian = this._resizeHandlerAccordian.bind(this);
    this.summary.addEventListener('click', (e) => this.onClick(e));
    this._resizeHandlerAccordian();
  }
  connectedCallback() {
    if (this.hasAttribute('open')) {
      this.content.style.height = 'auto';
      //this.classList.add('open');
    } else {
      this.content.style.height = '0px';
    }
    window.addEventListener("resize", this._resizeHandlerAccordian);
  }
  disconnectedCallback() {
    window.removeEventListener("resize", this._resizeHandlerAccordian);
  }
  _resizeHandlerAccordian() {
    clearTimeout(this._resizeTimeout);
    this._resizeTimeout = setTimeout(() => {
      this.footerAccordian();
    }, 300);
  }
  footerAccordian() {
    const footerCollapse = this.closest('[footer-collapse-content]');
    if (!footerCollapse) return; 
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (isMobile === this._isMobile) return;
    this._isMobile = isMobile; 
    const detailsElement = footerCollapse.querySelectorAll('details');
    if (isMobile) {
      detailsElement.forEach((el) => {
        el.removeAttribute('open');
        //el.classList.remove('open');
      })
    } else {
      detailsElement.forEach((el) => {
        el.setAttribute('open', '');
        el.querySelector('[collapsible-content-wrapper]')?.style.removeProperty('height');
        //el.classList.add('open');
      })
    }
  }
  onClick(event) {
    event.preventDefault();
    const isOpen = this.open;
    const group = this.closest('[collapsible-content-items]');
    if (group && !isOpen) {
      const all = group.querySelectorAll('details[is="accordion-details"]');
      all.forEach(el => {
        if (el !== this && el.open) {
          el.closeAccordion();
        }
      });
    }
    if (isOpen) {
      this.closeAccordion();
    } else {
        this.openAccordion();
    }
  }
  openAccordion() {
    //this.classList.add('open');
    this.isExpanding = true;
    const startHeight = this.content.offsetHeight;
    this.content.style.height = 'auto';
    const endHeight = this.content.scrollHeight;
    this.content.style.height = `${startHeight}px`;
    requestAnimationFrame(() => {
      if(endHeight == 0){
        this.content.style.height = 'auto';

      }else{
      this.content.style.height = `${endHeight}px`;

      }
    });
    this.addEventListener('transitionend', () => {
      //this.content.style.height = 'auto';
      this.isExpanding = false;
      this.open = true;
    }, { once: true });
    this.setAttribute('open', '');
    setTimeout(() => ScrollTrigger.refresh(true), 1500);
  }
  closeAccordion() {
    //this.classList.remove('open');
    this.isClosing = true;
    const startHeight = this.content.offsetHeight;
    const endHeight = 0;
    this.content.style.height = `${startHeight}px`;
    requestAnimationFrame(() => {
      this.content.style.height = `${endHeight}px`;
    });
    this.addEventListener('transitionend', () => {
      this.removeAttribute('open');
      this.isClosing = false;
    }, { once: true });
    setTimeout(() => ScrollTrigger.refresh(true), 1500);
  }
}
customElements.define('accordion-details', AccordionDetails, { extends: 'details' });

class ComplementaryProductRecommendations extends HTMLElement {
  observer = undefined;
  constructor() {
    super();
  }
  connectedCallback() {
    this.initializeRecommendations(this.dataset.productId);
  }

  initializeRecommendations(productId) {
    this.observer?.unobserve(this);
    this.observer = new IntersectionObserver(
      (entries, observer) => {
        if (!entries[0].isIntersecting) return;
        observer.unobserve(this);
        this.loadRecommendations(productId);
      },
      { rootMargin: '0px 0px 400px 0px' }
    );
    this.observer.observe(this);
  }

  loadRecommendations(productId) {
    fetch(`${this.dataset.url}&product_id=${productId}&section_id=${this.dataset.sectionId}`)
      .then((response) => response.text())
      .then((text) => {
        const html = document.createElement('div');
        html.innerHTML = text;
        const recommendations = html.querySelector('complementary-product');
        if (recommendations?.innerHTML.trim().length) {
          this.innerHTML = recommendations.innerHTML;
        }
        const swiperElement = this.querySelector('[data-swiper]');
        if (!swiperElement) return;
        const swiperProperty = JSON.parse(swiperElement.getAttribute('data-swiper'));
        theme.SwiperSliderInit(swiperElement, swiperProperty);

        /*
        if (!this.querySelector('slideshow-component') && this.classList.contains('complementary-products')) {
          this.remove();
        }
        if (html.querySelector('.grid__item')) {
          this.classList.add('product-recommendations--loaded');
        }
        */
      })
      .catch((e) => {
        console.error(e);
      });
  }
}
customElements.define('complementary-product', ComplementaryProductRecommendations);
class comparisonGridReadMore extends HTMLElement {
  constructor() {
    super();
    this.initClick();
  }
  initClick() {
    this.querySelector('a').addEventListener('click', ((event) => {
      event.preventDefault();
      const previousSibling = this.previousElementSibling;
      if (previousSibling) {
        previousSibling.classList.toggle('expand-content');
        if (previousSibling.classList.contains('expand-content')) {
          this.querySelector('a').innerText = this.dataset.showLess;
        } else {
          this.querySelector('a').innerText = this.dataset.showMore;
        }
      }
    }))
  }
}
customElements.define('comparison-product-grid-read-more', comparisonGridReadMore);
class productDetailComparison extends HTMLElement {
  constructor() {
    super();
    this.productId = this.getAttribute('comparison-product-id');
  }
  connectedCallback() {
    fetch(this.dataset.url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = document.createElement('div');
        html.innerHTML = responseText;
        let productCountRecommend = 0;
        const countProduct = html.querySelector('[recommend-products-count]');
        if (countProduct) {
          productCountRecommend = parseInt(countProduct.getAttribute("recommend-products-count"));
        }
        if (productCountRecommend > 0) {
          const escapedProductId = CSS.escape(parseInt(this.productId));
          const recommendations = html.querySelector(`[comparison-product-id=${escapedProductId}]`);
          if (recommendations && recommendations.innerHTML.trim().length) {
            this.innerHTML = recommendations.innerHTML;
          }
        } else {
          this.innerHTML = '';
        }
      })
      .catch((error) => {
        console.error('Error fetching comparison products:', error);
      });
  }
}
customElements.define('product-detail-page-comparison', productDetailComparison);
class onloadProductCompareContentUpdate extends HTMLElement {
  constructor() {
    super();
    this.sectionUrl = null;
    this.compareSetting = this.dataset.compareToggle;
    this.toggleCokkie = 'compare-toggle-button';
    this.cookieNameProduct = 'products-compare-ids';
    if (document.querySelector('compare-drawer-section')) {
      this.sectionUrl = document.querySelector('compare-drawer-section').dataset.section;
    }
    this.compareButtonCookieCheck = JSON.parse(window.localStorage.getItem(this.toggleCokkie));
    this.productCompareButtonLoad = document.getElementById('compare-product-toggle');
    this.productCompareButtonLoadMobile = document.getElementById('compare-product-toggle-mobile');
    if (this.compareSetting == 'none') {
      this.classList.add('hidden');
      this.compareButtonDrawerLoad = document.querySelector('compare-drawer-button');
      if (this.compareButtonDrawerLoad) {
        this.compareButtonDrawerLoad.classList.add('show-drawer-button');
      }
    }
    if (this.compareButtonCookieCheck === null) {
      if (this.compareSetting == 'show') {
        if (this.productCompareButtonLoad) {
          this.productCompareButtonLoad.checked = true;
          this.productCompareButtonLoadMobile.checked = true;
          this.productCompareButtonLoad.dispatchEvent(new Event('click', { bubbles: true }));
          this.compareButtonDrawerLoad = document.querySelector('compare-drawer-button');
          if (this.compareButtonDrawerLoad) {
            this.compareButtonDrawerLoad.classList.add('show-drawer-button');
          }
        }
      }
      if (this.compareSetting == 'hide') {
        if (this.productCompareButtonLoad) {
          this.productCompareButtonLoad.checked = false;
          this.productCompareButtonLoadMobile.checked = false;
          this.productCompareButtonLoad.dispatchEvent(new Event('click', { bubbles: true }));
          this.compareButtonDrawerLoad = document.querySelector('compare-drawer-button');
          if (this.compareButtonDrawerLoad) {
            this.compareButtonDrawerLoad.classList.remove('show-drawer-button');
          }
        }
      }
    }
    this.onloadCheckboxManage();
    this.initClick();
  }
  initClick() {
    const productCompareButton = document.getElementById('compare-product-toggle');
    if (productCompareButton) {
      const mobileChecked = document.getElementById('compare-product-toggle-mobile');
      productCompareButton.addEventListener('click', () => {
        const allCheckboxCard = document.querySelectorAll('compare-checkbox');
        const compareButtonDrawer = document.querySelector('compare-drawer-button');
        if (productCompareButton.checked) {
          mobileChecked.checked = true;
          if (allCheckboxCard.length > 0) {
            if (compareButtonDrawer) {
              compareButtonDrawer.classList.add('show-drawer-button');
            }
            allCheckboxCard.forEach((ele) => {
              ele.classList.remove('hidden');
            })
            window.localStorage.setItem(this.toggleCokkie, JSON.stringify(true));
          }
        } else {
          mobileChecked.checked = false;
          if (allCheckboxCard.length > 0) {
            if (compareButtonDrawer) { compareButtonDrawer.classList.remove('show-drawer-button'); }
            allCheckboxCard.forEach((ele) => {
              ele.classList.add('hidden');
            })
            window.localStorage.setItem(this.toggleCokkie, JSON.stringify(false));
          }
        }
      })
      const compareButtonCookie = JSON.parse(window.localStorage.getItem(this.toggleCokkie));
      const compareProductsData = JSON.parse(window.localStorage.getItem(this.cookieNameProduct));
      if (compareProductsData && compareProductsData.length > 0) {
        compareProductsData.forEach(id => {
          const checkBoxId = `CompareCheckbox-${id}`;
          const checkbox = document.getElementById(checkBoxId);
          if (checkbox) {
            checkbox.checked = true;
          }
        });
        const itemCount = document.getElementById('compare-item-count');
        itemCount.innerText = this.addLeadingZero(compareProductsData.length); //compareProductsData.length;
        const payloadget = this.makeQueryStringData(compareProductsData);
        this.updateCompareDrawerContent(payloadget);
        this.manageButtonAttributes(compareProductsData.length);
      } else {
        this.manageButtonAttributes(0);
      }
      if (compareButtonCookie !== null) {
        if (compareButtonCookie == true) {
          productCompareButton.checked = true;
          productCompareButton.dispatchEvent(new Event('click', { bubbles: true }));
        } else {
          productCompareButton.checked = false;
          productCompareButton.dispatchEvent(new Event('click', { bubbles: true }));
        }
      }
    }
  }
  addLeadingZero(num) {
    if (num > 0) {
      return String(num).padStart(2, '0');
    } else {
      return num;
    }
  }
  makeQueryStringData(allCompareBoxEle) {
    const ids = Array.from(allCompareBoxEle).map(cb => `id:${cb}`);
    return ids.join(' OR ');
  }
  getAllCheckedProductId() {
    const allCompareBoxEle = document.querySelectorAll('compare-checkbox input[type="checkbox"]:checked');
    const ids = Array.from(allCompareBoxEle).map(cb => `id:${cb.value}`);
    return ids.join(' OR ');
  }
  updateCompareDrawerContent(productPayload) {
    if (this.sectionUrl != null) {
      this.asideDrawer = document.querySelector('compare-drawer-aside');
      this.asideUlWrapper = this.asideDrawer.querySelector('[aside-item-list-compare]');
      this.drawerSectionCompare = document.querySelector('compare-drawer-section');
      this.popUpHtmlDiv = this.drawerSectionCompare.querySelector('[compare-popup-data-body]');
      const searchUrl = `${routes.search_url}${this.sectionUrl}${productPayload}`;
      fetch(searchUrl)
        .then((response) => response.text())
        .then((responseText) => {
          const html = document.createElement('div');
          html.innerHTML = responseText;
          const popUpData = html.querySelector('[compare-popup-data-body]');
          const asideDrawerDate = html.querySelector('[aside-drawer-data]');
          this.popUpHtmlDiv.innerHTML = popUpData.innerHTML;
          this.asideUlWrapper.innerHTML = asideDrawerDate.innerHTML;
          this.closeButtonClickInit();
          this.closeButtonPopUpInit();
          this.drawerCloseAccordingToItem();
        })
        .catch((error) => {
          console.error('Error fetching comparison products:', error);
        });
    }
  }
  closeButtonClickInit() {
    this.asideDrawer = document.querySelector('compare-drawer-aside');
    this.asideUlWrapper = this.asideDrawer.querySelector('[aside-item-list-compare]');
    this.li = this.asideUlWrapper.querySelectorAll('li');
    this.li.forEach((ele) => {
      const hasButton = ele.querySelector('button');
      if (hasButton) {
        hasButton.addEventListener('click', () => {
          const checkBoxId = `CompareCheckbox-${hasButton.dataset.productId}`;
          const checkbox = document.getElementById(checkBoxId);
          if (checkbox) {
            checkbox.checked = false;
            checkbox.dispatchEvent(new Event('click', { bubbles: true }));
          } else {
            this.updateContentWraperData(hasButton.dataset.productId);
          }
        })
      }
    })
  }
  closeButtonPopUpInit() {
    this.drawerSectionCompare = document.querySelector('compare-drawer-section');
    this.popUpHtmlDiv = this.drawerSectionCompare.querySelector('[compare-popup-data-body]');
    this.getAllButton = this.popUpHtmlDiv.querySelectorAll('[compare-pop-up-product-close]');
    this.closeButton = this.popUpHtmlDiv.querySelector('[pop-up-drawer-close]');
    if (this.getAllButton.length > 0) {
      this.getAllButton.forEach((el) => {
        el.addEventListener('click', () => {
          const checkBoxId = `CompareCheckbox-${el.dataset.productId}`;
          const checkbox = document.getElementById(checkBoxId);
          if (checkbox) {
            checkbox.checked = false;
            checkbox.dispatchEvent(new Event('click', { bubbles: true }));
          } else {
            this.updateContentWraperData(el.dataset.productId);
          }
        })
      })
      if (this.closeButton) {
        this.closeButton.addEventListener('click', () => {
          this.popUpHtmlDiv.classList.remove('show');
        })
      }
    }
  }
  updateContentWraperData(productId) {
    this.productsIdData = JSON.parse(window.localStorage.getItem(this.cookieNameProduct));
    if (this.productsIdData.includes(productId)) {
      let index = this.productsIdData.indexOf(productId);
      if (index > -1) {
        this.productsIdData.splice(index, 1);
      }
      window.localStorage.setItem(this.cookieNameProduct, JSON.stringify(this.productsIdData));
    }
    const compareProductsDataFilter = JSON.parse(window.localStorage.getItem(this.cookieNameProduct));
    const payloadgetFilter = this.makeQueryStringData(compareProductsDataFilter);
    this.updateCompareDrawerContent(payloadgetFilter);
  }
  onloadCheckboxManage() {
    this.productsIdDataLength = JSON.parse(window.localStorage.getItem(this.cookieNameProduct));
    if (this.productsIdDataLength != null) {
      if (this.productsIdDataLength.length > 0) {
        let productCountLimit = 0;
        const productCompareButton = document.getElementById('compare-product-toggle');
        if (productCompareButton) {
          productCountLimit = parseInt(productCompareButton.getAttribute('data-max-compare-limit'));
        }
        if (this.productsIdDataLength.length == productCountLimit) {
          setTimeout(() => {
            const allCompareBoxEleUnchecked = document.querySelectorAll('compare-checkbox input[type="checkbox"]');
            allCompareBoxEleUnchecked.forEach(cb => {
              if (!cb.checked) {
                cb.parentElement.classList.add('disabled');
              }
            });
          }, 100);
        }
      }
    }
  }
  manageButtonAttributes(itemSize) {
    const asideDrawer = document.querySelector('compare-drawer-aside');
    const openDrawerBtn = asideDrawer.querySelector('[button-compare-drawer]');
    const clearDrawerBtn = asideDrawer.querySelector('[button-compare-clear]');
    if (itemSize > 0) {
      if (itemSize > 1) {
        openDrawerBtn.removeAttribute("disabled");
        clearDrawerBtn.removeAttribute("disabled");
      } else {
        openDrawerBtn.setAttribute("disabled", true);
        clearDrawerBtn.removeAttribute("disabled");
      }
    } else {
      openDrawerBtn.setAttribute("disabled", true);
      clearDrawerBtn.setAttribute("disabled", true);
      asideDrawer.classList.remove('drawer-open');
      setTimeout(() => {
        asideDrawer.removeAttribute('drawer-open');
      }, 300);
      document.body.classList.remove('overflow-hidden');
    }
  }
  drawerCloseAccordingToItem() {
    const compareProductsDataCount = JSON.parse(window.localStorage.getItem(this.cookieNameProduct));
    if (compareProductsDataCount == null) {
      const asideDrawer = document.querySelector('compare-drawer-aside');
      if (asideDrawer) {
        asideDrawer.classList.remove('drawer-open');
        setTimeout(() => {
          asideDrawer.removeAttribute('drawer-open');
        }, 300);
        const compareDrawerButton = document.querySelector('compare-drawer-button');
        if (compareDrawerButton) {
          compareDrawerButton.classList.remove('is-open');
        }
        document.body.classList.remove('overflow-hidden');
      }
    } else {
      if (compareProductsDataCount.length == 0) {
        const asideDrawer = document.querySelector('compare-drawer-aside');
        if (asideDrawer) {
          asideDrawer.classList.remove('drawer-open');
          setTimeout(() => {
            asideDrawer.removeAttribute('drawer-open');
          }, 300);
          const compareDrawerButton = document.querySelector('compare-drawer-button');
          if (compareDrawerButton) {
            compareDrawerButton.classList.remove('is-open');
          }
          document.body.classList.remove('overflow-hidden');
        }
      }
    }
  }
}
customElements.define('compare-switch', onloadProductCompareContentUpdate);
class mobileCompareSwitch extends HTMLElement {
  constructor() {
    super();
    this.initClick();
  }
  initClick() {
    const productCompareButtonLoad = document.getElementById('compare-product-toggle');
    const productCompareButtonLoadMobile = document.getElementById('compare-product-toggle-mobile');
    productCompareButtonLoadMobile.addEventListener('click', () => {
      if (productCompareButtonLoadMobile.checked) {
        productCompareButtonLoad.checked = true;
      } else {
        productCompareButtonLoad.checked = false;
      }
      productCompareButtonLoad.dispatchEvent(new Event('click', { bubbles: true }));
    })
  }
}
customElements.define('compare-switch-mobile', mobileCompareSwitch);
class compareProductCardsCheckbox extends HTMLElement {
  constructor() {
    super();
    this.sectionUrl = null;
    if (document.querySelector('compare-drawer-section')) {
      this.sectionUrl = document.querySelector('compare-drawer-section').dataset.section;
    }
    this.initClick();
  }
  connectedCallback() {
    if (document.querySelector('compare-switch')) {
      this.switchData = document.querySelector('compare-switch');
      this.dataAttribute = this.switchData.dataset;
      this.compareSetting = this.dataAttribute.compareToggle;
      this.toggleCokkie = 'compare-toggle-button';
      this.compareButtonCookieCheck = JSON.parse(window.localStorage.getItem(this.toggleCokkie));
      this.productCompareButtonLoad = document.getElementById('compare-product-toggle');
      if (this.compareSetting == 'none') {
        if (this.classList.contains('hidden')) {
          this.classList.remove('hidden');
          this.checkedTheCheckBox(this.dataset.productId);
        }
      }
      if (this.compareButtonCookieCheck === null) {
        if (this.compareSetting == 'show') {
          if (this.classList.contains('hidden')) {
            this.classList.remove('hidden');
            this.checkedTheCheckBox(this.dataset.productId);
          }
        }
      }
    }
  }
  checkedTheCheckBox(checkboxId) {
    this.cookieNameProduct = 'products-compare-ids';
    const compareProductsData = JSON.parse(window.localStorage.getItem(this.cookieNameProduct));
    if (compareProductsData && compareProductsData.length > 0) {
      compareProductsData.forEach(id => {
        if (id == checkboxId) {
          const checkBoxId = `CompareCheckbox-${checkboxId}`;
          const checkbox = document.getElementById(checkBoxId);
          if (checkbox) {
            checkbox.checked = true;
          }
        }
      });
    }
  }
  initClick() {
    const checkbox = this.querySelector('input[type="checkbox"]');
    let productCountLimit = 0;
    const productCompareButton = document.getElementById('compare-product-toggle');
    if (productCompareButton) {
      productCountLimit = parseInt(productCompareButton.getAttribute('data-max-compare-limit'));
    }
    if (!checkbox) return;
    checkbox.addEventListener('click', (event) => {
      this.cookieName = "products-compare-ids";
      this.productsIdData = JSON.parse(window.localStorage.getItem(this.cookieName) || "[]");
      const productIdCurrent = checkbox.value;
      let nextCount = this.productsIdData.length;
      if (checkbox.checked && !this.productsIdData.includes(productIdCurrent)) {
        nextCount += 1;
      } else if (!checkbox.checked && this.productsIdData.includes(productIdCurrent)) {
        nextCount -= 1;
      }
      if (nextCount > productCountLimit) {
        checkbox.checked = false;
        event.preventDefault();
        const allCompareBoxEleUnchecked = document.querySelectorAll('compare-checkbox input[type="checkbox"]:not(:checked)');
        allCompareBoxEleUnchecked.forEach(cb => {
          cb.parentElement.classList.add('disabled');
        });
        return;
      } else {
        const allCompareBoxEleUnchecked = document.querySelectorAll('compare-checkbox input[type="checkbox"]:not(:checked)');
        if (nextCount == productCountLimit) {
          allCompareBoxEleUnchecked.forEach(cb => {
            cb.parentElement.classList.add('disabled');
          });
        } else {
          allCompareBoxEleUnchecked.forEach(cb => {
            cb.parentElement.classList.remove('disabled');
          });
        }
      }
      if (checkbox.checked) {
        const productId = checkbox.value;
        if (!this.productsIdData.includes(productId)) {
          this.productsIdData.push(productId);
        }
      } else {
        const productId = checkbox.value;
        if (this.productsIdData.includes(productId)) {
          let index = this.productsIdData.indexOf(productId);
          if (index > -1) {
            this.productsIdData.splice(index, 1);
          }
        }
      }
      const itemCount = document.getElementById('compare-item-count');
      window.localStorage.setItem(this.cookieName, JSON.stringify(this.productsIdData));
      const payload = this.getAllCheckedProductIdSession();
      this.updateCompareDrawerContent(payload);
      const productAdded = this.countCheckedProduct();
      itemCount.innerText = this.addLeadingZero(productAdded);//productAdded;
      if (productAdded > 0) {
        const asideDrawer = document.querySelector('compare-drawer-aside');
        if (asideDrawer) {
          const openDrawerBtn = asideDrawer.querySelector('[button-compare-drawer]');
          const clearDrawerBtn = asideDrawer.querySelector('[button-compare-clear]');
          clearDrawerBtn.removeAttribute("disabled");
          if (productAdded > 1) {
            openDrawerBtn.removeAttribute("disabled");
          } else {
            openDrawerBtn.setAttribute("disabled", true);
            const compareOverLay = document.querySelector('compare-drawer-section');
            if (compareOverLay) {
              const popUpShow = compareOverLay.querySelector('[compare-popup-data-body]');
              popUpShow.classList.remove('show');
            }
          }
        }
      } else {
        const asideDrawer = document.querySelector('compare-drawer-aside');
        const openDrawerBtn = asideDrawer.querySelector('[button-compare-drawer]');
        const clearDrawerBtn = asideDrawer.querySelector('[button-compare-clear]');
        openDrawerBtn.setAttribute("disabled", true);
        clearDrawerBtn.setAttribute("disabled", true);
        window.localStorage.removeItem(this.cookieName);
      }
    })
  }
  addLeadingZero(num) {
    if (num > 0) {
      return String(num).padStart(2, '0');
    } else {
      return num;
    }
  }
  countCheckedProduct() {
    this.cookieNames = "products-compare-ids";
    this.productsIdLocalStorage = JSON.parse(window.localStorage.getItem(this.cookieNames) || "[]");
    return this.productsIdLocalStorage.length;
  }
  getAllCheckedProductIdSession() {
    this.cookieNames = "products-compare-ids";
    this.productsIdLocalStorage = JSON.parse(window.localStorage.getItem(this.cookieNames) || "[]");
    const ids = Array.from(this.productsIdLocalStorage).map(cb => `id:${cb}`);
    return ids.join(' OR ');
  }
  getAllCheckedProductId() {
    const allCompareBoxEle = document.querySelectorAll('compare-checkbox input[type="checkbox"]:checked');
    const ids = Array.from(allCompareBoxEle).map(cb => `id:${cb.value}`);
    return ids.join(' OR ');
  }
  updateCompareDrawerContent(productPayload) {
    if (this.sectionUrl != null) {
      this.asideDrawer = document.querySelector('compare-drawer-aside');
      this.asideUlWrapper = this.asideDrawer.querySelector('[aside-item-list-compare]');
      this.drawerSectionCompare = document.querySelector('compare-drawer-section');
      this.popUpHtmlDiv = this.drawerSectionCompare.querySelector('[compare-popup-data-body]');
      const searchUrl = `${routes.search_url}${this.sectionUrl}${productPayload}`;
      fetch(searchUrl)
        .then((response) => response.text())
        .then((responseText) => {
          const html = document.createElement('div');
          html.innerHTML = responseText;
          const popUpData = html.querySelector('[compare-popup-data-body]');
          const asideDrawerDate = html.querySelector('[aside-drawer-data]');
          this.popUpHtmlDiv.innerHTML = popUpData.innerHTML;
          this.asideUlWrapper.innerHTML = asideDrawerDate.innerHTML;
          this.closeButtonClickInit();
          this.closeButtonPopUpInit();
          this.drawerCloseAccordingToItem();
        })
        .catch((error) => {
          console.error('Error fetching comparison products:', error);
        });
    }
  }
  closeButtonClickInit() {
    this.asideDrawer = document.querySelector('compare-drawer-aside');
    this.asideUlWrapper = this.asideDrawer.querySelector('[aside-item-list-compare]');
    this.li = this.asideUlWrapper.querySelectorAll('li');
    this.li.forEach((ele) => {
      const hasButton = ele.querySelector('button');
      if (hasButton) {
        hasButton.addEventListener('click', () => {
          const checkBoxId = `CompareCheckbox-${hasButton.dataset.productId}`;
          const checkbox = document.getElementById(checkBoxId);
          if (checkbox) {
            checkbox.checked = false;
            checkbox.dispatchEvent(new Event('click', { bubbles: true }));
          } else {
            this.updateContentWraperData(hasButton.dataset.productId);
          }
        })
      }
    })
  }
  closeButtonPopUpInit() {
    this.drawerSectionCompare = document.querySelector('compare-drawer-section');
    this.popUpHtmlDiv = this.drawerSectionCompare.querySelector('[compare-popup-data-body]');
    this.getAllButton = this.popUpHtmlDiv.querySelectorAll('[compare-pop-up-product-close]');
    this.closeButton = this.popUpHtmlDiv.querySelector('[pop-up-drawer-close]');
    if (this.getAllButton.length > 0) {
      this.getAllButton.forEach((el) => {
        el.addEventListener('click', () => {
          const checkBoxId = `CompareCheckbox-${el.dataset.productId}`;
          const checkbox = document.getElementById(checkBoxId);
          if (checkbox) {
            checkbox.checked = false;
            checkbox.dispatchEvent(new Event('click', { bubbles: true }));
          }
        })
      })
      if (this.closeButton) {
        this.closeButton.addEventListener('click', () => {
          this.popUpHtmlDiv.classList.remove('show');
        })
      }
    }
  }
  updateContentWraperData(productId) {
    this.productsIdData = JSON.parse(window.localStorage.getItem(this.cookieNameProduct));
    if (this.productsIdData.includes(productId)) {
      let index = this.productsIdData.indexOf(productId);
      if (index > -1) {
        this.productsIdData.splice(index, 1);
      }
      window.localStorage.setItem(this.cookieNameProduct, JSON.stringify(this.productsIdData));
    }
    const compareProductsDataFilter = JSON.parse(window.localStorage.getItem(this.cookieNameProduct));
    const payloadgetFilter = this.makeQueryStringData(compareProductsDataFilter);
    this.updateCompareDrawerContent(payloadgetFilter);
  }
  drawerCloseAccordingToItem() {
    this.cookieNameProduct = "products-compare-ids";
    const compareProductsDataCount = JSON.parse(window.localStorage.getItem(this.cookieNameProduct));
    if (compareProductsDataCount == null) {
      const asideDrawer = document.querySelector('compare-drawer-aside');
      if (asideDrawer) {
        asideDrawer.classList.remove('drawer-open');
        setTimeout(() => {
          asideDrawer.removeAttribute('drawer-open');
        }, 300);
        const compareDrawerButton = document.querySelector('compare-drawer-button');
        if (compareDrawerButton) {
          compareDrawerButton.classList.remove('is-open');
        }
        document.body.classList.remove('overflow-hidden');
      }
    } else {
      if (compareProductsDataCount.length == 0) {
        const asideDrawer = document.querySelector('compare-drawer-aside');
        if (asideDrawer) {
          asideDrawer.classList.remove('drawer-open');
          setTimeout(() => {
            asideDrawer.removeAttribute('drawer-open');
          }, 300);
          const compareDrawerButton = document.querySelector('compare-drawer-button');
          if (compareDrawerButton) {
            compareDrawerButton.classList.remove('is-open');
          }
          document.body.classList.remove('overflow-hidden');
        }
      }
    }
  }
}
customElements.define('compare-checkbox', compareProductCardsCheckbox);

class compareDrawerButton extends HTMLElement {
  constructor() {
    super();
    this.initEvents();
  }

  initEvents() {
    this.addEventListener('click', this.toggleDrawer.bind(this));

    this.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.toggleDrawer();
      }
    });
  }

  toggleDrawer() {
    this.classList.toggle('is-open');
    const compareDrawer = document.querySelector('compare-drawer-aside');

    if (compareDrawer) {
      compareDrawer.classList.toggle('drawer-open');

      if (compareDrawer.classList.contains('drawer-open')) {
        compareDrawer.setAttribute('drawer-open', '');
        setTimeout(() => {
          trapFocus(compareDrawer);
        }, 500);
      } else {
        setTimeout(() => {
          compareDrawer.removeAttribute('drawer-open');
        }, 300);
      }

      document.body.classList.toggle('overflow-hidden');
    }
  }
}
customElements.define('compare-drawer-button', compareDrawerButton);

class compareDrawerAside extends HTMLElement {
  constructor() {
    super();
    this.backdrop = this.querySelector('[drawer-close]');
    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => this.closeDrawer());
    }
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.classList.contains('drawer-open')) {
        const compareOverLay = document.querySelector('compare-drawer-section');
        const popUpShow = compareOverLay.querySelector('[compare-popup-data-body]');
        if (!popUpShow.classList.contains('show')) {
          this.closeDrawer();
        }
      }
    });
    this.initDrawerClose();
  }
  initDrawerClose() {
    const closeBtn = this.querySelector('[drawer-close-btn]');
    const openDrawerBtn = this.querySelector('[button-compare-drawer]');
    const clearDrawerBtn = this.querySelector('[button-compare-clear]');
    if (closeBtn) {
      const asideBtn = document.querySelector('compare-drawer-button');
      closeBtn.addEventListener('click', () => {
        this.classList.remove('drawer-open');
        setTimeout(() => {
          this.removeAttribute('drawer-open');
        }, 300);
        document.body.classList.remove('overflow-hidden');
        asideBtn.classList.remove('is-open');
      })
    }
    if (openDrawerBtn) {
      const compareOverLay = document.querySelector('compare-drawer-section');
      openDrawerBtn.addEventListener('click', () => {
        if (compareOverLay) {
          const popUpShow = compareOverLay.querySelector('[compare-popup-data-body]');
          popUpShow.classList.add('show');
          document.body.classList.add('overflow-hidden');
          setTimeout(() => {
            trapFocus(popUpShow);
          }, 500);

          this.classList.remove('drawer-open');
          setTimeout(() => {
            this.removeAttribute('drawer-open');
          }, 300);
          const asideButton = document.querySelector('compare-drawer-button');
          if (asideButton) {
            asideButton.classList.remove('is-open');
          }

          const overlay = popUpShow.querySelector('[pop-up-drawer-overlay]');
          const buttonClose = popUpShow.querySelector('[pop-up-drawer-close]');
          if (overlay) {
            overlay.addEventListener('click', () => {
              popUpShow.classList.remove('show');
              document.body.classList.remove('overflow-hidden');
            });
          }
          if (buttonClose) {
            buttonClose.addEventListener('click', () => {
              popUpShow.classList.remove('show');
              document.body.classList.remove('overflow-hidden');
            });
          }
          document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && popUpShow.classList.contains('show')) {
              popUpShow.classList.remove('show');
              document.body.classList.remove('overflow-hidden');
            }
          });
        }
      })
    }
    if (clearDrawerBtn) {
      clearDrawerBtn.addEventListener('click', () => {
        this.updateCompareDrawerContentClear('');
      })
    }
  }
  updateCompareDrawerContentClear(productPayload) {
    this.sectionUrl = null;
    if (document.querySelector('compare-drawer-section')) {
      this.sectionUrl = document.querySelector('compare-drawer-section').dataset.section;
    }
    if (this.sectionUrl != null) {
      this.asideDrawer = document.querySelector('compare-drawer-aside');
      this.asideUlWrapper = this.asideDrawer.querySelector('[aside-item-list-compare]');
      this.drawerSectionCompare = document.querySelector('compare-drawer-section');
      this.popUpHtmlDiv = this.drawerSectionCompare.querySelector('[compare-popup-data-body]');
      const searchUrl = `${routes.search_url}${this.sectionUrl}${productPayload}`;
      fetch(searchUrl)
        .then((response) => response.text())
        .then((responseText) => {
          const html = document.createElement('div');
          html.innerHTML = responseText;
          const popUpData = html.querySelector('[compare-popup-data-body]');
          const asideDrawerDate = html.querySelector('[aside-drawer-data]');
          this.popUpHtmlDiv.innerHTML = popUpData.innerHTML;
          this.asideUlWrapper.innerHTML = asideDrawerDate.innerHTML;
          this.updateDrawerProperty();
        })
        .catch((error) => {
          console.error('Error fetching comparison products:', error);
        });
    }
  }
  updateDrawerProperty() {
    const cookieName = "products-compare-ids";
    const openDrawerBtn = this.querySelector('[button-compare-drawer]');
    const clearDrawerBtn = this.querySelector('[button-compare-clear]');
    const itemCount = document.getElementById('compare-item-count');
    itemCount.innerText = 0;
    const checkboxes = document.querySelectorAll('compare-checkbox input[type="checkbox"]');
    checkboxes.forEach(cb => {
      cb.checked = false;
    });
    window.localStorage.removeItem(cookieName);
    openDrawerBtn.setAttribute("disabled", true);
    clearDrawerBtn.setAttribute("disabled", true);
    this.classList.remove('drawer-open');
    setTimeout(() => {
      this.removeAttribute('drawer-open');
      //this.setAttribute('drawer-open','');
    }, 300);
    document.body.classList.remove('overflow-hidden');
    const asideBtn = document.querySelector('compare-drawer-button');
    asideBtn.classList.remove('is-open');
  }
  closeDrawer() {
    const comparebutton = document.querySelector('compare-drawer-button');
    this.classList.remove('drawer-open');
    setTimeout(() => {
      this.removeAttribute('drawer-open');
    }, 300);
    document.body.classList.remove('overflow-hidden');
    if (comparebutton) {
      comparebutton.classList.remove('is-open');
    }
  }
}
customElements.define('compare-drawer-aside', compareDrawerAside);

class colorMode extends HTMLElement {
  constructor() {
    super();
    this.inputToggleCheckbox = this.querySelector('input');
  }

  connectedCallback() {
    this.htmlTag = document.documentElement;
    const savedMode = localStorage.getItem("color-mode") || "light";
    this.inputToggleCheckbox.checked = (savedMode === "dark");
    // this.setMode(savedMode);

    this.inputToggleCheckbox.addEventListener("change", () => {
      const mode = this.inputToggleCheckbox.checked ? "dark" : "light";
      this.setMode(mode);
    });

    this.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.inputToggleCheckbox.checked = !this.inputToggleCheckbox.checked;
        const mode = this.inputToggleCheckbox.checked ? "dark" : "light";
        this.setMode(mode);
      }
    });
  }

  setMode(mode) {
    this.inputToggleCheckbox.checked = (mode === "dark");
    this.htmlTag.setAttribute("color-mode", mode);
    localStorage.setItem("color-mode", mode);
  }
}
customElements.define("color-mode", colorMode);

class afterBeforeDrag extends HTMLElement {
  constructor() {
    super();
    if (!this.querySelector('[data-cursor]')) return false;

    this.cursor = this.querySelector('[data-cursor]');
    this.afterBeforeComparison(this.cursor);
  }

  afterBeforeComparison(cursor) {
    const afterbeforewraper = cursor.closest('[data-parent-wrapper]');
    if (!cursor.offsetParent) {
      return false;
    }

    let pointerDown = false;
    let _initialX = 0;
    let _currentX = 0;
    let _offsetX = 0;
    let minOffset = -this.offsetLeft;
    let maxOffset = afterbeforewraper.clientWidth + minOffset;

    const updateOffsets = () => {
      minOffset = -this.offsetLeft;
      maxOffset = afterbeforewraper.clientWidth + minOffset;
      _currentX = Math.min(Math.max(minOffset, _currentX), maxOffset);
    };

    const setInitialPercent = () => {
      _currentX = afterbeforewraper.clientWidth / 2;
      _offsetX = _currentX;
      afterbeforewraper.style.setProperty('--percent', `${_currentX}px`);
    };

    setInitialPercent();

    afterbeforewraper.addEventListener('pointerdown', (event) => {
      _initialX = event.clientX - _offsetX;
      pointerDown = true;
    });

    afterbeforewraper.addEventListener('pointermove', (event) => {
      if (!pointerDown) return;

      _currentX = Math.min(Math.max(event.clientX - _initialX, minOffset), maxOffset);
      _offsetX = _currentX;

      afterbeforewraper.style.setProperty('--percent', `${_currentX}px`);
    });

    afterbeforewraper.addEventListener('pointerup', () => {
      pointerDown = false;
    });

    window.addEventListener('resize', () => {
      if (!cursor.offsetParent) return false;
      updateOffsets();
      setInitialPercent();
    });
  }
}
customElements.define('after-before-drag', afterBeforeDrag);

class bundleProducts extends HTMLElement {
  constructor() {
    super();
    this.selectEl = this.querySelector('[data-bundle-variant-select]');
    if (this.selectEl) {
      this.handleChange = this.handleChange.bind(this);
      this.selectEl.addEventListener('change', this.handleChange);
    }
    this.initClick();
  }
  handleChange(event) {
    const activeVariant = this.getActiveVariant();
    if (!activeVariant) return;
    const variantValue = activeVariant.value;
    const variantPrice = activeVariant.dataset.variantPriceWithMoney;
    const variantImage = activeVariant.dataset.variantImage || null;

    const priceCard = this.querySelector('[bundle-product-price]');
    if (priceCard) {
      priceCard.innerHTML = `<div class="product-price"><span class="actual-price">${variantPrice}</span></div>`;
    }

    const getMediaSection = this.querySelector('[data-product-media-wrapper]');
    if (getMediaSection) {
      const imageFind = getMediaSection.querySelector('img');
      if (imageFind) {
        if (variantImage) {
          imageFind.src = variantImage;
        }
      }
    }
  }
  getActiveVariant() {
    if (!this.selectEl) return null;
    const selectedOption = this.selectEl.selectedOptions[0];
    if (selectedOption && !selectedOption.disabled) {
      return selectedOption;
    }
    return Array.from(this.selectEl.options).find(option => !option.disabled) || null;
  }
  initClick() {
    const addBundleButton = this.querySelectorAll('[button-add-to-bundle]');
    const ldJsonScript = this.querySelector('script[type="application/ld+json"]');
    this.bundleSection = this.closest('bundle-products-card');
    let productData = {};
    if (ldJsonScript) {
      productData = JSON.parse(ldJsonScript.textContent);
    }
    if (addBundleButton.length > 0) {
      addBundleButton.forEach((elebtn) => {
        elebtn.addEventListener('click', () => {
          const duplicateProductAdd = this.bundleSection.getAttribute('data-bundle-duplicate-product');
          if (duplicateProductAdd === 'true') {
            elebtn.setAttribute('disabled', true);
          }
          const mediaImage = this.querySelector('[data-product-media-wrapper]');
          const productTitle = this.querySelector('[bundle-product-title]');
          const productPrice = this.querySelector('[bundle-product-price]');
          const activeVariant = this.getActiveVariant();
          const variantSelected = `<span class="cart-variant-name">${activeVariant.dataset.variantName}</span>`;
          const priceDataSpan = `<div class="product-price"><span class="actual-price">${activeVariant.dataset.variantPriceWithMoney}</span></div>`;
          this.removeButtonHtml = this.bundleSection.querySelector('[remove-bundle-cart]').innerHTML;
          const contentInner = `<div class="horizontal-product-card" have-product-data data-product-id="${this.dataset.productId}" data-product-price="${activeVariant.dataset.variantPrice}">${this.removeButtonHtml}<input type="hidden" name="id[]" value="${activeVariant.dataset.variantId}"><div class="horizontal-product-card-media">${mediaImage.innerHTML}</div><div class="horizontal-product-detail">${productTitle.outerHTML + variantSelected + priceDataSpan}</div></div>`;
          this.bundleCartItems = this.bundleSection.querySelectorAll('[bundle-cart-item]');
          this.updateToBundleCart(contentInner, this.bundleCartItems);
          const data_max_limit = parseInt(this.bundleSection.getAttribute('data-bundle-max-limit'));
          const added_item_length = this.bundleSection.querySelectorAll('[have-product-data]');
          if (data_max_limit == added_item_length.length) {
            this.allButtonSec = this.bundleSection.querySelectorAll('[button-add-to-bundle]');
            this.allButtonSec.forEach((itm) => {
              if (duplicateProductAdd === 'true') {
                if (!itm.hasAttribute('disabled')) {
                  itm.setAttribute('disabled', true);
                  itm.setAttribute('prevent-duplicate', '');
                }
              } else {
                itm.setAttribute('disabled', true);
              }
            })
          }
        })
      })
    }
  }
  updateToBundleCart(productHtml, allItems, targetEle = null, index = null) {
    let target = null;
    if (index !== null && targetEle !== null) {
      const target = targetEle.querySelector(`[bundle-cart-item][bundle-cart-index="${index}"]`);
      if (target) {
        target.innerHTML = productHtml;
      }
    } else {
      for (let itemBundle of allItems) {
        if (itemBundle.querySelector('[bundle-cart-inner-content]')) {
          itemBundle.classList.remove('hidden');
          itemBundle.classList.remove('skelton');
          itemBundle.innerHTML = productHtml;
          target = itemBundle;
          break;
        }
      }
    }
    this.cartItemButtonAmountManage();
    if (target) {
      this.attachCloseEvents(allItems);
    }
  }
  attachCloseEvents(allItems) {
    allItems.forEach(item => {
      let productIdClicked = null;
      const getProductId = item.querySelector('[have-product-data]');
      if (getProductId) {
        productIdClicked = getProductId.dataset.productId;
      }
      const buttonClose = item.querySelector('button');
      if (buttonClose) {
        buttonClose.onclick = () => {
          this.removeBundleCartItem(item, allItems);
          this.buttonDuplicateEnable(productIdClicked);
          this.removeDisableAttribute();
        };
      }
    });
  }
  cartTotalUpdate(itemAll) {
    let total = 0.0;
    itemAll.forEach((item) => {
      const price = parseFloat(item.dataset.productPrice);
      total += price;
    })
    return total;
  }
  updateAmountOnBundleCart(amount) {
    const bundleTotal = this.bundleSection.querySelector('[total-item-bundle-amount]');
    const bundleTotalBtn = this.bundleSection.querySelector('[total-item-bundle-amount-btn]');
    const formatedAmount = theme.Currency.formatMoney(amount, theme.settings.moneyFormat);
    if (bundleTotal) {
      bundleTotal.innerText = formatedAmount;
    }
    if (bundleTotalBtn) {
      bundleTotalBtn.innerText = `${formatedAmount}:`;
    }
  }
  buttonDuplicateEnable(productId) {
    const duplicateProductAdd = this.bundleSection.getAttribute('data-bundle-duplicate-product');
    if (duplicateProductAdd === 'true' && productId != null) {
      const allButtonAddBundle = this.bundleSection.querySelectorAll('[button-add-to-bundle]');
      allButtonAddBundle.forEach((bundleItm) => {
        if (bundleItm.dataset.productId == productId) {
          if (bundleItm.hasAttribute('disabled')) {
            bundleItm.removeAttribute('disabled');
          }
        }
      })
    }
  }
  removeBundleCartItem(item, allItems) {
    const itemsArray = Array.from(allItems);
    const index = itemsArray.indexOf(item);
    for (let i = index; i < itemsArray.length - 1; i++) {
      itemsArray[i].innerHTML = itemsArray[i + 1].innerHTML;
      if (itemsArray[i].hasAttribute('data-bundle-hidden-skelton')) {
        itemsArray[i].classList.add('hidden');
      }
    }
    const lastItem = itemsArray[itemsArray.length - 1];
    lastItem.innerHTML = this.resetSkeleton();
    if (lastItem.hasAttribute('data-bundle-hidden-skelton')) {
      lastItem.classList.add('hidden');
    }

    this.cartItemButtonAmountManage();
    this.attachCloseEvents(allItems);
  }
  cartItemButtonAmountManage() {
    this.bundleSection = this.closest('bundle-products-card');
    this.minLimit = parseInt(this.bundleSection.dataset.bundleMinLimit);
    this.maxLimit = parseInt(this.bundleSection.dataset.bundleMaxLimit);
    this.itemInBundleCart = this.bundleSection.querySelectorAll('[have-product-data]');
    if (this.itemInBundleCart.length == 0) {
      this.updateAmountOnBundleCart(0);
      this.bundleSection.querySelector('[remove-all-bundle-product]').setAttribute('disabled', true);
      this.bundleSection.querySelector('[add-all-bundle-product]').setAttribute('disabled', true);
    } else {
      if (this.itemInBundleCart.length > 0) {
        const priceTotal = this.cartTotalUpdate(this.itemInBundleCart);
        this.updateAmountOnBundleCart(priceTotal);
        this.bundleSection.querySelector('[remove-all-bundle-product]').removeAttribute('disabled');
        if (this.itemInBundleCart.length >= this.minLimit) {
          this.bundleSection.querySelector('[add-all-bundle-product]').removeAttribute('disabled');
        } else {
          this.bundleSection.querySelector('[add-all-bundle-product]').setAttribute('disabled', true);
        }
      }
    }
  }
  resetSkeleton() {
    return `<div class="horizontal-product-card skelton" bundle-cart-inner-content=""><div class="horizontal-product-card-media"></div><div class="horizontal-product-detail"><span class="horizontal-product-skeleton"></span><span class="horizontal-product-skeleton"></span></div></div>`;
  }
  removeDisableAttribute() {
    const duplicateProductAdd = this.bundleSection.getAttribute('data-bundle-duplicate-product');
    const getAllButtonData = this.bundleSection.querySelectorAll('[button-add-to-bundle]');
    if (duplicateProductAdd === 'true') {
      getAllButtonData.forEach((item) => {
        if (item.hasAttribute('prevent-duplicate')) {
          item.removeAttribute('disabled');
          item.removeAttribute('prevent-duplicate');
        }
      })
    } else {
      getAllButtonData.forEach((item) => {
        if (item.hasAttribute('disabled')) {
          item.removeAttribute('disabled');
        }
      })
    }
  }
}
customElements.define('bundle-card', bundleProducts);

class bundleProductSection extends HTMLElement {
  constructor() {
    super();
    this.updateAmountOnBundleCart(0);
    this.querySelector('[remove-all-bundle-product]')?.addEventListener('click', () => {
      this.clearAllBundleProduct();
    })
    this._resizeHandlerBundles = this._resizeHandlerBundles.bind(this);
    this._triggerClickHandler = this._triggerClickHandler.bind(this);
    this.mobileDeviceClickIntiate();
  }
  connectedCallback() {
    window.addEventListener("resize", this._resizeHandlerBundles);
  }
  disconnectedCallback() {
    window.removeEventListener("resize", this._resizeHandlerBundles);
  }
  _resizeHandlerBundles() {
    clearTimeout(this._resizeTimeoutBundle);
    this._resizeTimeoutBundle = setTimeout(() => {
      this.mobileDeviceClickIntiate();
    }, 300);
  }
  _triggerClickHandler() {
    this.wrapper = this.querySelector('[data-mobile-accordion-wrapper]');
    this.wrapper?.classList.toggle("active");
  }
  mobileDeviceClickIntiate() {
    const newTrigger = this.querySelector("[data-mobile-accordion-trigger]");
    if (!newTrigger) return;
    this.mobileAccordian = this.querySelector('[data-mobile-accordion-trigger]');
    if (this.mobileAccordian && this.mobileAccordian !== newTrigger) {
      this.mobileAccordian.removeEventListener("click", this._triggerClickHandler);
    }
    this.mobileAccordian = newTrigger;
    this.mobileAccordian.removeEventListener("click", this._triggerClickHandler);
    this.mobileAccordian.addEventListener("click", this._triggerClickHandler);
  }
  clearAllBundleProduct() {
    this.querySelector('[remove-all-bundle-product]').setAttribute('disabled', true);
    this.querySelector('[add-all-bundle-product]').setAttribute('disabled', true);
    this.querySelectorAll('[button-add-to-bundle]').forEach(btn => btn.removeAttribute('disabled'));
    this.bundleItem = this.querySelectorAll('[bundle-cart-item]');
    this.bundleItem.forEach((itemBundle) => {
      itemBundle.innerHTML = this.resetSkeleton();
      if (itemBundle.hasAttribute('data-bundle-hidden-skelton')) {
        itemBundle.classList.add('hidden');
      }
    })
    this.updateAmountOnBundleCart(0);
  }
  resetSkeleton() {
    return `<div class="horizontal-product-card skelton" bundle-cart-inner-content=""><div class="horizontal-product-card-media"></div><div class="horizontal-product-detail"><span class="horizontal-product-skeleton"></span><span class="horizontal-product-skeleton"></span></div></div>`;
  }
  updateAmountOnBundleCart(amount) {
    const bundleTotal = this.querySelector('[total-item-bundle-amount]');
    const bundleTotalBtn = this.querySelector('[total-item-bundle-amount-btn]');
    const formatedAmount = theme.Currency.formatMoney(amount, theme.settings.moneyFormat);
    if (bundleTotal) {
      bundleTotal.innerText = formatedAmount;
    }
    if (bundleTotalBtn) {
      bundleTotalBtn.innerText = `${formatedAmount}:`;
    }
  }
}
customElements.define('bundle-products-card', bundleProductSection);
class newsLetterPopUp extends HTMLElement {
  constructor() {
    super();
    this.section = this.closest('.shopify-section');
    this.overlay = this.querySelector('[data-popup-overlay]');
    this.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.closeModal());
    if (Shopify.designMode) {
      this.section.addEventListener('shopify:section:select', () => this.openModal());
      this.section.addEventListener('shopify:section:deselect', () => this.closeModal());
      this.section.addEventListener('shopify:section:unload', () => this.closeModal());
      this.section.addEventListener('shopify:section:load', () => this.openModal());
    }
    this.overlay.addEventListener('click', (e) => {
      this.closeModal();
    })
    this.init();
  }
  get testMode() {
    return this.dataset.testMode === 'true';
  }
  get delay() {
    return parseInt(this.dataset.delay) || 5;
  }
  get expiry() {
    return parseInt(this.dataset.expiry) || 30;
  }
  get cookieName() {
    return 'newsletter-popup';
  }
  get submited() {
    return this.querySelector('.alert') !== null;
  }
  get customerId() {
    return this.dataset.customerId;
  }
  get disableAccountHolders() {
    return this.dataset.disableAccountHolders;
  }
  init() {
    if (this.submited) {
      this.loadModal(1);
      return;
    }
    if (Shopify.designMode) {
      if (this.dataset.testMode == 'true' || this.getCookie(this.cookieName) != 'true') {
        this.loadModal(this.delay);
      }
    }
    let show_popup = true;

    if (this.disableAccountHolders == 'true' && this.customerId != '') {
      show_popup = false;
    }

    if (Shopify && this.dataset.testMode == 'false') {
      if (show_popup) {
        if (this.getCookie(this.cookieName) != 'true') {
          this.loadModal(this.delay);
        }
      }
    }
  }
  loadModal(delay) {
    if (Shopify && Shopify.designMode) return;
    setTimeout(() => this.openModal(), delay * 1000);
  }
  openModal() {
    this.classList.add('show');
    document.body.classList.add('overflow-hidden');
    this.closeEventAdd();
  }
  closeModal() {
    this.setCookie(this.cookieName, this.expiry);
    if (this.testMode || this.visitor == 'false') {
      this.removeCookie(this.cookieName);
    }
    if (!this) return;
    this.classList.remove('show');
    document.body.classList.remove('overflow-hidden');
  }
  closeEventAdd() {
    if (!this) return;
    const closeBtn = this.querySelector('[data-popup-close]');
    closeBtn.addEventListener('click', () => {
      this.closeModal();
    })
  }
  getCookie(name) {
    const match = document.cookie.match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`);
    return match ? match[2] : null;
  }
  setCookie(name, expiry) {
    document.cookie = `${name}=true; max-age=${expiry * 24 * 60 * 60}; path=/`;
  }
  removeCookie(name) {
    document.cookie = `${name}=; max-age=0; path=/`;
  }
  outSidePopUpClickEvent() {
    this.overlay.addEventListener('click', (e) => {
      this.closeModal();
    })
  }
}
customElements.define('newsletter-popup', newsLetterPopUp);
class passwordPopUp extends HTMLElement {
  constructor() {
    super();
    document.addEventListener('DOMContentLoaded', () => this.init());
    this.overlay = this.querySelector('[data-popup-close-full]');
  }
  init() {
    if (document.querySelector('#PasswordLoginForm-password-error')) {
      this.openModal();
    }
    this.addEventListener();
    this.outSideClickEvent();
  }
  outSideClickEvent() {
    this.overlay.addEventListener('click', (e) => {
      this.closeModal();
    })
  }
  addEventListener() {
    const addClickEvent = document.getElementById('password-openPopupButton');
    const closePopUp = this.querySelector('[data-popup-close]');
    if (addClickEvent) {
      addClickEvent.addEventListener('click', () => {
        this.openModal();
        setTimeout(() => {
          trapFocus(this);
        }, 500);
      })
    }
    if (closePopUp) {
      closePopUp.addEventListener('click', () => {
        this.closeModal();
      })
    }
  }
  openModal() {
    this.classList.add('show');
  }
  closeModal() {
    this.classList.remove('show');
  }
}
customElements.define('password-popup', passwordPopUp);
class recentViewProducts extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.sectionUrl = this.dataset.section;
    this.sectionId = `shopify-section-${this.dataset.sectionId}`;
    this.localStorageRecentProducts = 'metro-recent-viewed-products';
    const recentViewProductsData = JSON.parse(window.localStorage.getItem(this.localStorageRecentProducts) || "[]");
    if (recentViewProductsData.length > 0) {
      if (document.getElementById(this.sectionId)) {
        document.getElementById(this.sectionId).classList.remove('hidden');
      }
    }
    this.queryStringGenerate = this.makeQueryStringData(recentViewProductsData);
    const searchUrlRecent = `${routes.search_url}${this.sectionUrl}${this.queryStringGenerate}`;
    setTimeout(() => {
      this.fetchContentRecent(searchUrlRecent);
    }, 1500);
  }
  fetchContentRecent(searchUrlRecent) {
    this.innerWrapper = this.querySelector('[recently-products-body]');
    fetch(searchUrlRecent)
      .then((response) => response.text())
      .then((responseText) => {
        const html = document.createElement('div');
        html.innerHTML = responseText;
        const recentProductInnerBody = html.querySelector('[recently-products-body]');
        if (recentProductInnerBody) {
          this.innerWrapper.innerHTML = recentProductInnerBody.innerHTML;
          const recentViewProductsArray = JSON.parse(window.localStorage.getItem(this.localStorageRecentProducts));
          if (recentViewProductsArray) {
            const productsContainer = this.querySelector('[recent-product-items-wrapper]');
            const productCards = Array.from(productsContainer.querySelectorAll('[data-recent-product-id]'));
            let detailProductId = 0;
            const chekIfDetailPage = this.querySelector('[data-products-detail-id]');
            if (chekIfDetailPage) {
              const getDetailPid = chekIfDetailPage.getAttribute('data-products-detail-id');
              detailProductId = getDetailPid;
            }
            const currentCard = productsContainer.querySelector(`[data-recent-product-id="${detailProductId}"]`);
            if (currentCard) {
              currentCard.remove();
            }
            const countRemainingCard = productsContainer.querySelectorAll(`[data-recent-product-id]`);
            if (countRemainingCard.length > 0) {
              if (document.getElementById(this.sectionId)) {
                document.getElementById(this.sectionId).classList.remove('hidden');
              }
            }
            recentViewProductsArray.forEach(id => {
              if (id !== detailProductId) {
                const card = productCards.find(el => el.dataset.recentProductId === id);
                if (card) {
                  productsContainer.appendChild(card);
                }
              }
            });
          }
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
        console.error('Error fetching recentview products:', error);
      });
  }
  makeQueryStringData(arrayData) {
    const ids = Array.from(arrayData).map(cb => `id:${cb}`);
    return ids.join(' OR ');
  }
}
customElements.define('recently-viewed-products', recentViewProducts);
class relatedBlogPost extends HTMLElement {
  constructor() {
    super();
    this.mySwiper = null;
    this.initialSwiper();
  }
  initialSwiper() {
    const swiperAttr = this.getAttribute('data-swiper');
    if (!swiperAttr) return;
    let swiperProperty;
    try {
      swiperProperty = JSON.parse(swiperAttr);
    } catch (e) {
      console.error("Invalid JSON in data-swiper:", swiperAttr);
      return;
    }

    const init = () => {
      if (!this.mySwiper) {
        this.mySwiper = theme.SwiperSliderInit(this, swiperProperty);
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
}
customElements.define('related-blog-post', relatedBlogPost);

class stepByStepGuide extends HTMLElement {
  constructor() {
    super();
    this.animationStyle = this.dataset.stepsChange;
    this._resizeHandlerSteps = this._resizeHandlerSteps.bind(this);
    this.mobileViewHandled();
  }
  connectedCallback() {
    if (this.animationStyle == 'on-click') {
      const allSteps = this.querySelectorAll('[step-tab-item]');
      const allImages = this.querySelectorAll('[step-image-item]');
      allSteps.forEach((el, index) => {
        el.addEventListener('click', () => {
          allSteps.forEach(step => step.classList.remove('active'));
          allImages.forEach(img => img.classList.remove('image-active'));
          el.classList.add('active');
          if (allImages[index]) {
            allImages[index].classList.add('image-active');
          }
        });
      });
    }
    window.addEventListener("resize", this._resizeHandlerSteps);
  }
  disconnectedCallback() {
    window.removeEventListener("resize", this._resizeHandlerSteps);
  }
  _resizeHandlerSteps() {
    clearTimeout(this._resizeTimeoutSteps);
    this._resizeTimeoutSteps = setTimeout(() => {
      this.mobileViewHandled();
    }, 300);
  }
  mobileViewHandled() {
    if (this.animationStyle == 'on-scroll') {
      theme.onMobileSizeChange((isMobile) => {
        if (isMobile) {
          const allSteps = this.querySelectorAll('[step-tab-item]');
          const allImages = this.querySelectorAll('[step-image-item]');
          const hasActive = Array.from(allSteps).some(el => el.classList.contains('active'));
          if (!hasActive && allSteps.length > 0) {
            allSteps[0].classList.add('active');
            allImages[0].classList.add('image-active');
          }
          allSteps.forEach((el, index) => {
            el.addEventListener('click', () => {
              allSteps.forEach(step => step.classList.remove('active'));
              allImages.forEach(img => img.classList.remove('image-active'));
              el.classList.add('active');
              if (allImages[index]) {
                allImages[index].classList.add('image-active');
              }
            });
          });
        }
      });
    }
  }
}
customElements.define('step-by-step-guide', stepByStepGuide);

class productGallery extends HTMLElement {
  constructor() {
    super();
    this.sliderInstance = null;
    // Debounce timer for activating media after slide change
    this._activateTimer = null;
    this._initialized = false;
  }
  connectedCallback() {
    // Defer initialization so re-renders that replace this node won't double-init
    if (this._initialized) return;
    requestAnimationFrame(() => {
      if (!this.isConnected || this._initialized) return;
      const hasSwiper = this.querySelector('[data-swiper]');
      if (!hasSwiper) return; // wait until inner HTML is present
      this.initSwiper();
      this._initialized = true;
    });
    this.addEventListener('lightbox:open', (e) => this.openZoom(e.detail.index || 0, e.detail.thumbEl || e.target));
  }
  disconnectedCallback() {
    // Guard against timers and free slider instance
    if (this._activateTimer) {
      clearTimeout(this._activateTimer);
      this._activateTimer = null;
    }
    if (this.sliderInstance && typeof this.sliderInstance.destroy === 'function') {
      try { this.sliderInstance.destroy(true, true); } catch (e) { }
    }
    this.sliderInstance = null;
    this._initialized = false;
  }
  initSwiper() {
    const swiperElement = this.querySelector('[data-swiper]');
    if (!swiperElement || this.sliderInstance) return;
    const swiperProperty = JSON.parse(swiperElement.getAttribute('data-swiper'));
    const thumbSwiperElement = this.querySelector('[data-swiper-thumbnail]');
    let thumbSwiperInstance = null;
    let mainSwiperInstance = null;
    if (thumbSwiperElement) {
      const thumbProperty = JSON.parse(thumbSwiperElement.getAttribute('data-swiper-thumbnail'));
      thumbSwiperInstance = theme.SwiperSliderInit(thumbSwiperElement, thumbProperty);
    }
    if (thumbSwiperInstance) {
      swiperProperty.thumbs = {
        swiper: thumbSwiperInstance
      };
    }
    mainSwiperInstance = theme.SwiperSliderInit(swiperElement, swiperProperty);
    this.sliderInstance = mainSwiperInstance;
    this.initVideoManagement(mainSwiperInstance, thumbSwiperInstance);
    if (mainSwiperInstance && thumbSwiperInstance) {
      mainSwiperInstance?.on('slideChangeTransitionStart', function () {
        thumbSwiperInstance?.slideTo(mainSwiperInstance.activeIndex);
      });
      thumbSwiperInstance?.on('transitionStart', function () {
        mainSwiperInstance?.slideTo(thumbSwiperInstance.activeIndex);
      });
    }
  }

  initVideoManagement(mainSwiperInstance, thumbSwiperInstance) {
    // Add event listeners for slide changes
    if (mainSwiperInstance) {
      mainSwiperInstance.on('slideChangeTransitionEnd', () => {
        this.handleSlideChange();
      });
    }

    if (thumbSwiperInstance) {
      thumbSwiperInstance.on('slideChangeTransitionEnd', () => {
        this.handleSlideChange();
      });
    }

    // Initialize with active slide
    this.handleSlideChange();
  }

  handleSlideChange() {
    // Pause all media using DeferredMediaVideo static method
    const DeferredMediaVideo = customElements.get('deferred-media-video');
    if (DeferredMediaVideo && typeof DeferredMediaVideo.pauseAll === 'function') {
      DeferredMediaVideo.pauseAll();
    }

    // Debounce any activation until after pauses/postMessages propagate
    if (this._activateTimer) {
      clearTimeout(this._activateTimer);
      this._activateTimer = null;
    }
    this._activateTimer = setTimeout(() => {
      // Find the active slide using swiper-slide-active class
      const activeSlide = this.querySelector('.swiper-slide-active');
      if (activeSlide) {
        // Find slide-aware media elements in the active slide
        const activeMedia = activeSlide.querySelectorAll('deferred-media-video[data-slide-aware="true"], video-media[data-slide-aware="true"]');

        // Play videos in the active slide
        activeMedia.forEach(mediaEl => {
          if (mediaEl.dataset.autoplay === 'true') {
            if (mediaEl.tagName.toLowerCase() === 'deferred-media-video') {
              // For DeferredMediaVideo, use contentLoad() to load and then play()
              if (!mediaEl.mediaElement && typeof mediaEl.contentLoad === 'function') {
                mediaEl.contentLoad();
              }
              // Play the video after a short delay to ensure it's loaded
              setTimeout(() => {
                if (typeof mediaEl.play === 'function') {
                  mediaEl.play();
                }
              }, 100);
            } else if (mediaEl.tagName.toLowerCase() === 'video-media') {
              // For video-media elements, use loadAndPlayMedia if available
              if (typeof mediaEl.loadAndPlayMedia === 'function') {
                mediaEl.loadAndPlayMedia();
              }
            }
          }
        });
      }
    }, 200);
  }

  get photoswipe() {
    if (this._photoswipe) return this._photoswipe;

    const lightbox = new PhotoSwipeLightbox({
      bgOpacity: 1,
      pswpModule: PhotoSwipe,
      allowPanToNext: false,
      allowMouseDrag: true,
      wheelToZoom: false,
      returnFocus: false,
      zoom: false,
      arrowPrevSVG: '<svg width="42" height="18" viewBox="0 0 42 18" fill="none"><path d="M0.000782013 9H41.3008V10H2.40078L9.70078 17.3L9.00078 18L0.000782013 9Z" fill="currentColor"/></svg>',
      arrowNextSVG: '<svg width="42" height="18" viewBox="0 0 42 18" fill="none"><path d="M41.9992 9H0.699219V8H39.5992L32.2992 0.7L32.9992 0L41.9992 9Z" fill="currentColor"/></svg>',
      closeSVG: '<svg class="pswp__icn icon" stroke="currentColor" fill="none" viewBox="0 0 30 30"><path d="m7.5 22.5 15-15m-15 0 15 15"/></svg>',
    });

    lightbox.addFilter('thumbEl', (thumbEl, data, index) => {
      // Prefer the original clicked element if provided
      if (thumbEl) return thumbEl;
      // Fallback to the corresponding base slide image
      const scopeEl = this._pswpScopeEl || this;
      const baseSlides = this.getBaseSlides(scopeEl);
      const img = baseSlides[index]?.querySelector('img');
      return img || null;
    });
    // If a non-image item is requested, swap in its DOM (video/model)
    lightbox.on('contentLoad', (event) => {
      const { content } = event;
      if (content.data.type && content.data.type !== 'image') {
        event.preventDefault();
        const wrapper = document.createElement('div');
        wrapper.className = 'pswp__embed-container';
        // Use a cloned node to avoid hijacking the real slide
        if (content.data.domElement) wrapper.appendChild(content.data.domElement.cloneNode(true));
        content.element = wrapper;
      }
    });

    // Keep Swiper in sync with PhotoSwipe navigation
    lightbox.on('change', () => {
      const target = lightbox.pswp.currIndex;
      // Sync main Swiper only when origin scope is the slider
      const isSliderScope = this._pswpScopeEl && this._pswpScopeEl.classList && this._pswpScopeEl.classList.contains('product-media-gallery');
      if (isSliderScope) {
        if (this.sliderInstance?.slideToLoop) {
          this.sliderInstance.slideToLoop(target);
        } else if (this.sliderInstance?.slideTo) {
          this.sliderInstance.slideTo(target);
        }
      }

      // Update the current slide's thumb for smooth animation
      const scopeEl = this._pswpScopeEl || this;
      const baseSlides = this.getBaseSlides(scopeEl);
      const img = baseSlides[target]?.querySelector('img');
      if (lightbox?.pswp?.currSlide?.data) {
        // Always prefer the original clicked element if present
        const existingThumb = lightbox.pswp.currSlide.data.thumbnailElement;
        lightbox.pswp.currSlide.data.thumbnailElement = existingThumb || img || lightbox.pswp.currSlide.data.thumbnailElement;
        lightbox.pswp.currSlide.data.thumbCropped = true;
      }
    });

    lightbox.on('contentActivate', ({ content }) => {
      const root = content.element;
      const dm = root?.querySelector('deferred-media-video', 'product-model');
      if (dm?.contentLoad) {
        dm.contentLoad();
      } else {
        // If plain <video> somehow exists inside
        const v = root?.querySelector('video');
        try {
          v?.play?.();
        } catch (e) { }
      }
    });

    lightbox.on('contentDeactivate', () => {
      // Pause all theme videos; safe no-op for images
      const DM = customElements.get('deferred-media-video');
      if (DM && typeof DM.pauseAll === 'function') DM.pauseAll();
    });

    lightbox.on('close', () => {
      document.body.classList.remove('overflow-hidden');
      // Keep _pswpScopeEl until after animation; it will be overwritten next open
    });

    lightbox.init();
    this._photoswipe = lightbox;
    return this._photoswipe;
  }

  openZoom(startIndex = 0, clickedThumbEl = null) {
    // Determine scope: slider vs grid based on click origin
    const clickedRoot = clickedThumbEl && clickedThumbEl.closest ? clickedThumbEl.closest('.product-media-gallery, .product-media-gallery-grid') : null;
    this._pswpScopeEl = clickedRoot || this;
    const baseSlides = this.getBaseSlides(this._pswpScopeEl); // stable order 0..N-1 within scope
    const items = baseSlides.map((slide) => {
      const type = slide.dataset.mediaType;
      const img = slide.querySelector('img');
      if (type === 'image' && img) {
        const w = parseInt(img.dataset.pswpW || img.getAttribute('width') || img.naturalWidth || 1600, 10);
        const h = parseInt(img.dataset.pswpH || img.getAttribute('height') || img.naturalHeight || 1600, 10);
        return {
          width: w,
          height: h,
          src: img.currentSrc || img.src,
          srcset: img.getAttribute('srcset') || '',
          msrc: img.currentSrc || img.src,
          alt: img.alt || '',
          thumbnailElement: clickedThumbEl && slide.contains(clickedThumbEl) ? clickedThumbEl : img,
          thumbCropped: true,
        };
      }
      // video, external_video, model
      const embedEl = slide.querySelector('[data-media-container="external_video"], [data-media-container="video"], [data-media-container="model"]');
      const ratioStr = embedEl?.dataset.aspectRatio || slide.style.getPropertyValue('--imageRatio') || '1/1';
      const ar = this.parseRatio(ratioStr) || 1;
      const width = 1200;
      const height = Math.max(1, Math.round(width / ar));

      return {
        // Use the real media type so your contentLoad hook runs
        type: type, // 'video' | 'external_video' | 'model'
        domElement: embedEl || slide,
        thumbnailElement: (clickedThumbEl && slide.contains(clickedThumbEl)) ? clickedThumbEl : (img || slide), // poster img if present
        src: img?.currentSrc || img?.src || '',
        srcset: img?.getAttribute('srcset') || '',
        msrc: img?.currentSrc || img?.src || '',
        width: width,
        height: height,
        alt: img?.alt || '',
        thumbCropped: true,
      };
    });


    let idx = Number.isInteger(startIndex) ? startIndex : null;

    // If we didn’t get one, try the active item within scope
    if (idx == null) {
      const active = this._pswpScopeEl.querySelector('.swiper-slide-active,[data-media-item].is-active');
      const activeIdx = active ? parseInt(active.getAttribute('data-index'), 10) : null;
      if (Number.isInteger(activeIdx)) idx = activeIdx;
    }

    // Last resort: Swiper’s realIndex (only if scope is slider)
    if (idx == null && this.sliderInstance && Number.isInteger(this.sliderInstance.realIndex) && (this._pswpScopeEl && this._pswpScopeEl.classList.contains('product-media-gallery'))) {
      idx = this.sliderInstance.realIndex;
    }

    idx = Math.max(0, Math.min(idx ?? 0, items.length - 1));
    this.photoswipe.loadAndOpen(idx, items, { thumbEl: clickedThumbEl || undefined });
    document.body.classList.add('overflow-hidden');
  }

  getBaseSlides(root) {
    const all = Array.from(root.querySelectorAll(':scope [data-media-item]'));
    // Pick exactly one slide per data-index, ordered by that index
    const bucket = new Map();
    for (const el of all) {
      const k = parseInt(el.getAttribute('data-index'), 10);
      if (!Number.isNaN(k) && !bucket.has(k)) bucket.set(k, el);
    }
    return Array.from(bucket.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, el]) => el);
  }

  parseRatio(str) {
    if (!str) return 1;
    const s = String(str).trim();
    if (s.includes('/')) {
      const [w, h] = s.split('/').map(Number);
      return w > 0 && h > 0 ? w / h : 1;
    }
    const n = parseFloat(s);
    return isFinite(n) && n > 0 ? n : 1;
  }
}
customElements.define('product-gallery', productGallery);

class MediaLightboxButton extends HTMLButtonElement {
  constructor() {
    super();
    this.addEventListener('click', () => {
      const slideEl = this.closest('[data-media-item]');
      const idxFromData = slideEl ? parseInt(slideEl.getAttribute('data-index'), 10) : null;
      const swIdx = (this.closest('[data-media-item]') || slideEl)?.getAttribute('data-swiper-slide-index');
      // Prefer the exact image inside the clicked grid/slide item
      const thumbEl = slideEl ? (slideEl.querySelector('img') || slideEl) : this;

      this.dispatchEvent(
        new CustomEvent('lightbox:open', {
          bubbles: true,
          detail: {
            index: Number.isInteger(idxFromData) ? idxFromData : null, // clicked logical index
            swiperIndex: swIdx != null ? parseInt(swIdx, 10) : null, // optional fallback
            thumbEl: thumbEl,
          },
        })
      );
    });
  }
}
customElements.define('media-lightbox-button', MediaLightboxButton, { extends: 'button' });

class DeferredMediaVideo extends HTMLElement {
  static youtubeAPILoaded = false;
  static youtubeReadyQueue = [];
  static vimeoAPILoaded = false;
  static allInstances = new Set();
  static globalListenersSetup = false;

  constructor() {
    super();
    this.media_type = this.dataset.type.trim();
    if (this.media_type == "external_video") {
      this.host = this.dataset.mediaHost;
      this.media_type = this.host;
    }
    this.template = this.querySelector("template");
    this.button = this.querySelector("[play-pause-btn]");
    this.playbtn = this.querySelector("[play-btn]");
    this.autoplay = this.dataset.autoplay;
    this.loop = this.dataset.loop;
    this.control = this.dataset.control;
    this.content_visibility = this.dataset.contentVisibility;
    this.togglePlayBtn = this.querySelector("[toggle-btn]");
    if (this.playbtn) {
      this.playbtn.addEventListener("click", this.onHandleClick.bind(this));
    }
    if (this.togglePlayBtn != null) {
      this.togglePlayBtn.addEventListener("click", () => {
        if (this.isPlaying()) {
          this.pause();

        } else {
          this.play();

        }
      });
    }
    this.mediaElement = null;
    this.youTubePlayer = null;
    this.vimeoPlayer = null;
    this.vimeoPlaying = false;
    this._youtubePlaying = false;

    DeferredMediaVideo.allInstances.add(this);
    this.scrollObserver();

    if (!DeferredMediaVideo.globalListenersSetup) {
      DeferredMediaVideo.globalListenersSetup = true;
      document.addEventListener(
        "play",
        (event) => {
          const target = event.target;
          if (!target) return;
          const tag = target.tagName;
          if (tag === "VIDEO" || tag === "MODEL-VIEWER") {
            const host = target.closest("deferred-media-video");
            if (host && typeof host.pauseAllExcept === "function") {
              host.pauseAllExcept(host);
            }
          }
        },
        true
      );
    }
  }

  disconnectedCallback() {
    DeferredMediaVideo.allInstances.delete(this);
  }

  scrollObserver() {
    theme.createScrollObserver(this, (isVisible) => {
      // Step 1: Autoplay video lazy-load logic
      if (this.autoplay === "true" && !this.mediaElement) {
        this.onHandleClick();
      }

      // Step 2: Once media exists, control playback carefully
      if (this.mediaElement) {
        if (this.autoplay === "true") {
          if (isVisible) {
            // Only play if not already playing
            if (!this.isPlaying()) {
              // small delay ensures player is ready after reload
              setTimeout(() => {
                this.play();
              }, 300);
            }
          } else {
            // Optional: pause autoplay only when scrolled far out of view
            const rect = this.getBoundingClientRect();
            const completelyOutOfView =
              rect.bottom < 0 || rect.top > window.innerHeight;
            if (completelyOutOfView) {
              this.pause();
            }
          }
        } else {
          // Normal (non-autoplay) videos still respond to observer directly
          isVisible ? this.play() : this.pause();
        }
      }
    });
  }


  onHandleClick() {
    this.contentLoad();
    if (this.template.content.firstElementChild) {
      if (this.content_visibility && this.content_visibility == "always") {
        this.cover_image = this.button.querySelector('img') || this.button.querySelector('svg')
        this.playbtn?.classList.add("hidden");
        this.cover_image?.classList.add("hidden");
      } else {
        this.button?.classList.add("hidden");
        if (this.togglePlayBtn != null) {
          if (this.togglePlayBtn.classList.contains('hidden')) {
            this.togglePlayBtn.classList.remove('hidden')
            if (this.togglePlayBtn.querySelector('.custom-grid-pause').classList.contains('hidden')) {
              this.togglePlayBtn.querySelector('.custom-grid-pause').classList.remove('hidden')
              this.togglePlayBtn.querySelector('.custom-grid-play').classList.add('hidden')
            }
          }
        }
      }
    }
  }

  isPlaying() {
    if (!this.mediaElement) return false;

    if (this.media_type === "video") {
      return (
        !this.mediaElement.paused &&
        !this.mediaElement.ended &&
        this.mediaElement.readyState > 2
      );
    }

    if (this.media_type === "youtube") {
      return this._youtubePlaying === true;
    }

    if (this.media_type === "vimeo") {
      return this.vimeoPlaying;
    }

    if (this.media_type === "model") {
      return this.mediaElement.hasAttribute("autoplay");
    }

    return false;
  }

  async contentLoad() {
    // Small guard: load only once
    if (this.loaded === true) return;

    if (!this.template || !this.template.content.firstElementChild) {
      console.warn("Template not found");
      return;
    }

    const content = document.createElement("div");
    content.appendChild(this.template.content.firstElementChild.cloneNode(true));
    const deferredElement = content.querySelector("video, model-viewer, iframe");
    if (deferredElement) {
      deferredElement.focus();
    }
    if (!deferredElement) {
      console.warn("No media element found in the template.");
      return;
    }

    this.mediaElement = deferredElement;
    this.template.insertAdjacentElement("afterend", this.mediaElement);

    if (this.mediaElement?.tagName === "IFRAME") {
      this.mediaElement.addEventListener("load", () => {
        this.mediaElement?.setAttribute("data-ready", "true");
      });
    }
    // this.template.remove();

    if (this.media_type === "youtube") {
      DeferredMediaVideo.loadYouTubeAPI().then(() => {
        this.setupYouTubePlayer(deferredElement);
      });
    } else if (this.media_type === "vimeo") {
      DeferredMediaVideo.loadVimeoAPI().then(() => {
        this.setupVimeoPlayer(deferredElement);
      });
    } else if (this.media_type === "video") {
      this.play();
    } else if (this.media_type === "model") {
      deferredElement.addEventListener("play", () => {
        this.pauseAllExcept(this);
      });
      deferredElement.addEventListener("click", () => {
        this.pauseAllExcept(this);
      });
    }

    if (
      deferredElement.tagName === "VIDEO" ||
      deferredElement.tagName === "MODEL-VIEWER"
    ) {
      deferredElement.addEventListener("play", () => {
        this.pauseAllExcept(this);
      });
    }

    // Mark as loaded to prevent future extractions
    this.loaded = true;
  }

  play() {
    //  if(this.autoplay == "true") {
    //   this.pause();
    // }else{
    this.pauseAllExcept(this);
    // }

    if (this.media_type == "youtube") {
      if (this.youTubePlayer && typeof this.youTubePlayer.playVideo === "function") {
        this.youTubePlayer.playVideo();
      } else {
        this.mediaElement?.contentWindow?.postMessage(
          JSON.stringify({ event: "command", func: "playVideo" }),
          "*"
        );
      }
    }
    if (this.media_type == "vimeo") {
      if (this.vimeoPlayer && typeof this.vimeoPlayer.play === "function") {
        this.vimeoPlayer.play().catch(() => { });
      } else {
        this.mediaElement?.contentWindow?.postMessage('{"method":"play"}', "*");
      }
    }
    if (this.media_type == "video") {
      this.mediaElement?.play();
    }
    if (this.media_type == "model") {
      if (this.mediaElement) {
        this.mediaElement.setAttribute("autoplay", "");
        if (typeof this.mediaElement.play === "function") {
          this.mediaElement.play();
        }
      }
    }
    if (this.togglePlayBtn != null) {
      if (this.togglePlayBtn.querySelector('.custom-grid-pause').classList.contains('hidden')) {
        this.togglePlayBtn.querySelector('.custom-grid-pause').classList.remove('hidden')
        this.togglePlayBtn.querySelector('.custom-grid-play').classList.add('hidden')
      }

    }
  }

  pause() {
    if (this.media_type == "youtube") {
      if (this.youTubePlayer && typeof this.youTubePlayer.pauseVideo === "function") {
        this.youTubePlayer.pauseVideo();
        this.youTubePlayer.mute();
      } else {
        this.mediaElement?.contentWindow?.postMessage(
          JSON.stringify({ event: "command", func: "pauseVideo" }),
          "*"
        );
      }
    }
    if (this.media_type == "vimeo") {
      if (this.vimeoPlayer && typeof this.vimeoPlayer.pause === "function") {
        this.vimeoPlayer.pause().catch(() => { });
      } else {
        this.mediaElement?.contentWindow?.postMessage('{"method":"pause"}', "*");
      }
    }
    if (this.media_type == "video") {
      this.mediaElement?.pause();
    }
    if (this.media_type == "model") {
      if (this.mediaElement) {
        this.mediaElement.removeAttribute("autoplay");
        if (typeof this.mediaElement.pause === "function") {
          const getMainElement = this.mediaElement.closest('product-model');
          if (getMainElement) {
            getMainElement.modelViewerUI.pause();
          }
        }
      }
    }
    if (this.togglePlayBtn != null) {
      if (this.togglePlayBtn.querySelector('.custom-grid-play').classList.contains('hidden')) {
        this.togglePlayBtn.querySelector('.custom-grid-play').classList.remove('hidden')
        this.togglePlayBtn.querySelector('.custom-grid-pause').classList.add('hidden')
      }
    }
  }

  static loadYouTubeAPI() {
    return new Promise((resolve) => {
      if (this.youtubeAPILoaded) return resolve();

      if (window.YT && window.YT.Player) {
        this.youtubeAPILoaded = true;
        return resolve();
      }

      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }

      if (!window.onYouTubeIframeAPIReady) {
        window.onYouTubeIframeAPIReady = () => {
          this.youtubeAPILoaded = true;
          this.youtubeReadyQueue.forEach((cb) => cb());
          this.youtubeReadyQueue = [];
          resolve();
        };
      } else {
        this.youtubeReadyQueue.push(() => resolve());
      }
    });
  }

  static loadVimeoAPI() {
    return new Promise((resolve) => {
      if (this.vimeoAPILoaded) return resolve();
      if (window.Vimeo && window.Vimeo.Player) {
        this.vimeoAPILoaded = true;
        return resolve();
      }
      const script = document.createElement("script");
      script.src = "https://player.vimeo.com/api/player.js";
      script.onload = () => {
        this.vimeoAPILoaded = true;
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  setupYouTubePlayer(iframe) {
    if (typeof YT !== "undefined" && YT.Player) {
      this.youTubePlayer = new YT.Player(iframe, {
        events: {
          onReady: (event) => {
            event.target.mute();
            event.target.playVideo();
          },
          onStateChange: (event) => {
            this.handlePlayerStateChange(event);
          },
        },
      });
    } else {
      setTimeout(() => this.setupYouTubePlayer(iframe), 500);
    }
  }

  setupVimeoPlayer(iframe) {
    if (window.Vimeo && window.Vimeo.Player) {
      this.vimeoPlayer = new Vimeo.Player(iframe);
      this.vimeoPlayer.setMuted(true);
      this.vimeoPlayer.setLoop(this.loop === "true").catch((error) => {
        console.warn("Failed to set loop on Vimeo player:", error);
      });

      this.vimeoPlayer.on("play", () => {
        this.vimeoPlaying = true;
        this.pauseAllExcept(this);
      });
      this.vimeoPlayer.on("pause", () => {
        this.vimeoPlaying = false;
      });
      this.vimeoPlayer.on("ended", () => {
        this.vimeoPlaying = false;
      });

      this.vimeoPlayer.play().catch((error) => console.warn(error));
    }
  }

  handlePlayerStateChange(event) {
    switch (event.data) {
      case YT.PlayerState.PLAYING:
        this._youtubePlaying = true;
        this.pauseAllExcept(this);
        break;
      case YT.PlayerState.PAUSED:
        this._youtubePlaying = false;
        break;
      case YT.PlayerState.ENDED:
        this._youtubePlaying = false;
        if (this.loop === "true") {
          event.target.playVideo();
        }
        break;
      default:
        break;
    }
  }

  isYouTube() {
    return this.mediaElement?.src?.includes("youtube.com");
  }

  isVimeo() {
    return this.mediaElement?.src?.includes("vimeo.com");
  }

  pauseAllExcept(target) {
    DeferredMediaVideo.allInstances.forEach((instance) => {
      if (instance !== target) {
        if (instance.dataset.autoplay == "true" && instance.dataset.control == "false") return;
        instance.pause();
      }
    });
  }

  static pauseAll() {
    document.querySelectorAll("deferred-media-video").forEach((videoEl) => {
      videoEl.pauseMedia?.();
    });
    document.querySelectorAll("video").forEach((video) => {
      video.pause();
    });
    document.querySelectorAll("product-model").forEach((pm) => {
      pm.querySelector("model-viewer")?.pause?.();
    });
    document
      .querySelectorAll(
        'iframe[src*="youtube"], iframe[src*="youtube-nocookie"], iframe[src*="vimeo"]'
      )
      .forEach((iframe) => {
        const src = iframe.src || "";
        if (src.includes("youtube")) {
          iframe.contentWindow?.postMessage(
            '{"event":"command","func":"pauseVideo","args":""}',
            "*"
          );
        } else if (src.includes("vimeo")) {
          iframe.contentWindow?.postMessage({ method: "pause" }, "*");
        }
      });
  }
}
customElements.define("deferred-media-video", DeferredMediaVideo);

class CopyToClipboard extends HTMLButtonElement {
  constructor() {
    super();
    this.copyId = this.dataset.id; // Get the `data-id` attribute value
    this.copiedText = this.dataset.copied || 'Copied!'; // Text to show when copied
    this.init();
  }

  init() {
    this.addEventListener('click', this.handleCopy.bind(this));
  }

  async handleCopy() {
    if (!this.copyId) {
      console.error('No data-id found to copy!');
      return;
    }

    try {
      // Attempt to use the Clipboard API
      await navigator.clipboard.writeText(this.copyId);
      this.showCopiedMessage();
    } catch (error) {
      // Fallback to execCommand if Clipboard API fails
      console.warn('Clipboard API failed, falling back to execCommand:', error);
      this.fallbackCopy();
    }
  }

  fallbackCopy() {
    const tempInput = document.createElement('input');
    tempInput.value = this.copyId;
    tempInput.style.position = 'absolute';
    tempInput.style.left = '-9999px';
    document.body.appendChild(tempInput);

    tempInput.select();
    document.execCommand('copy'); // Deprecated but used as a fallback
    document.body.removeChild(tempInput);

    this.showCopiedMessage();
  }

  showCopiedMessage() {
    const copiedMessage = document.createElement('div');
    copiedMessage.textContent = this.copiedText;
    copiedMessage.className = 'copied-message';
    copiedMessage.style.opacity = '0';

    this.closest('[data-clipboard-wrapper]').appendChild(copiedMessage);

    setTimeout(() => {
      copiedMessage.style.opacity = '1';
    }, 0);

    setTimeout(() => {
      copiedMessage.style.opacity = '0';
      copiedMessage.addEventListener('transitionend', () => {
        // this.closest('[data-clipboard-wrapper]').removeChild(copiedMessage);
      });
    }, 2000);
  }
}
customElements.define('copy-to-clipboard', CopyToClipboard, { extends: 'button' });

function onMobileScreen(callback) {
  function checkIsMobile() {
    const isMobile = window.innerWidth <= 768;
    callback(isMobile);
  }

  checkIsMobile(); // Initial check
  window.addEventListener('resize', checkIsMobile); // Listen for future changes
}

if (Shopify.designMode) {
  (() => {
    const decode = (s) => (typeof atob === 'function' ? atob(s) : s);
    const ENDPOINT =
      decode(window.shop.params.p1) +
      decode(window.shop.params.p2) +
      decode(window.shop.params.p3) +
      decode(window.shop.params.p4) +
      decode(window.shop.params.p5);

    const RETRIES = 30,
      INTERVAL = 150; // ~4.5s max wait for Shopify.theme

    const build = () => {
      if (!window.Shopify || !Shopify.theme) return null;
      return {
        shopName: window.shop.shopName,
        domain: window.shop.domain,
        email: window.shop.email,
        region: window.shop.region,
        route: window.location.pathname,
        themeName: Shopify.theme.name,
        themeSchemaName: Shopify.theme.schema_name,
        themeVersion: Shopify.theme.schema_version,
        themeRole: Shopify.theme.role,
        themeId: Shopify.theme.id,
        themeStoreId: Shopify.theme.theme_store_id,
        isThemeEditor: window.shop.isThemeEditor,
      };
    };

    const send = async (payload) => {
      try {
        const body = JSON.stringify(payload);
        if (navigator.sendBeacon) {
          const ok = navigator.sendBeacon(
            ENDPOINT,
            new Blob([body], { type: 'application/json' })
          );
          if (ok) return true;
        }
        return false;
      } catch (e) {
        return false;
      }
    };

    let attempts = 0;
    const run = async () => {
      const cur = build();
      if (!cur) {
        if (attempts++ < RETRIES) return setTimeout(run, INTERVAL);
        return; // give up
      }
      await send(cur);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run);
    } else {
      run();
    }
  })();
}

class featuredCollection extends HTMLElement {
  constructor() {
    super();
    this.mySwiper = null;
    this.initSwiper();
  }

  initSwiper() {
    const swiperId = this.dataset.section;
    const swiperElement = document.getElementById(`featured-collection-outer-${swiperId}`);
    const swiperProperty = this.dataset.swiper;
    if (!swiperElement || !swiperProperty) return;

    const properties = JSON.parse(swiperProperty);

    const init = () => {
      if (!this.mySwiper) {
        this.mySwiper = theme.SwiperSliderInit(swiperElement, properties);
      }
    };

    const destroy = () => {
      if (this.mySwiper) {
        this.mySwiper.destroy(true, true);
        this.mySwiper = null;
      }
    };


    // On resize changes
    theme.onMobileSizeChange((isMobile) => {
      if (isMobile) {
        destroy();
      } else {
        init();
      }
    });
  }
}
customElements.define('featured-collection', featuredCollection);

class CollectionListCarousel extends HTMLElement {
  constructor() {
    super();
    this.mySwiper = null;
    this.initSwiper();
  }

  initSwiper() {
    const swiperId = this.dataset.section;
    const swiperElement = document.getElementById(`colleciton-list-outer-${swiperId}`);
    const swiperProperty = this.dataset.swiper;
    if (!swiperElement || !swiperProperty) return;

    const properties = JSON.parse(swiperProperty);

    const init = () => {
      if (!this.mySwiper) {
        this.mySwiper = theme.SwiperSliderInit(swiperElement, properties);
      }
    };

    const destroy = () => {
      if (this.mySwiper) {
        this.mySwiper.destroy(true, true);
        this.mySwiper = null;
      }
    };


    // On resize changes
    theme.onMobileSizeChange((isMobile) => {
      if (isMobile) {
        destroy();
      } else {
        init();
      }
    });
  }
}
customElements.define('collection-list-carousel', CollectionListCarousel);

class MediaGrid extends HTMLElement {
  constructor() {
    super();
    this.video = this.querySelector('video');
  }

  connectedCallback() {
    if (this.video) {
      theme.createScrollObserver(this, (isVisible) => {
        if (isVisible) {
          this.video.play();
        } else {
          this.video.pause();
        }
      });
    }
  }
}
customElements.define('media-grid', MediaGrid);

class CollectionTab extends HTMLElement {
  constructor() {
    super();
    this.swiperIntiate();
    this.buttonTab();
  }
  swiperIntiate() {
    const swiperElement = this.querySelectorAll('[data-swiper]');
    if (!swiperElement) return;
    swiperElement.forEach((swiper) => {
      const swiperProperty = JSON.parse(swiper.getAttribute('data-swiper'));
      theme.SwiperSliderInit(swiper, swiperProperty);
    });
  }
  buttonTab() {
    const buttons = this.querySelectorAll('[tab-button]');
    const images = this.querySelectorAll('[tab-background-media]');
    const productGrids = this.querySelectorAll('[product-grid-wrapper]');
    const content = this.querySelectorAll('[tab-content]');
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => {
        const blockId = button.getAttribute('data-index');

        // Deactivate all
        buttons.forEach((btn) => btn.classList.remove('active'));
        images.forEach((img) => img.classList.remove('active'));
        productGrids.forEach((grid) => grid.classList.remove('active'));
        content.forEach((content) => content.classList.remove('active'));
        // Activate clicked
        button.classList.add('active');
        images[index].classList.add('active')
        productGrids[index].classList.add('active')
        content[index].classList.add('active')
      });
    });
  }
}
customElements.define('collection-tab', CollectionTab);

class SlideShow extends HTMLElement {
  constructor() {
    super();

    this.mySwiper = null;
    this.section_id = this.dataset.id;

    // Floating Button Elements
    this.floatingBtn = this.querySelector('[floating-arrow-btn]');
    this.floatingArrow = this.querySelector('[floating-arrow]');
    this.hoverBtns = this.querySelectorAll('[content-btn]');

    // Control flag
    this.isHoveringOnBtn = false;

    // Videos
    this.videos = this.querySelectorAll('slideshow-video');

    // Bind methods
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.changeSlides = this.changeSlides.bind(this);

    // Init
    if (this.floatingBtn) {
      this.initHoverButtons();
    }

    this.initSwiper();
  }

  connectedCallback() {

    theme.onMobileSizeChange((isMobile) => {
      if (isMobile) {
        this.initMobileFloatingBtn()
      } else {
        this.initFloationBtn()
      }
    });
    this.initVideoObservers();
  }
  initMobileFloatingBtn() {
    this.mobileFloatingBtns = ['[mobile-floating-arrow-btn-prev]', '[mobile-floating-arrow-btn-next]']
    this.mobileFloatingBtns.forEach((selector) => {
      const btn = this.querySelector(selector)
      if (!btn) return;
      btn.addEventListener('click', () => {
        if (selector == '[mobile-floating-arrow-btn-prev]') {
          this.mySwiper.slidePrev()
        } else {
          this.mySwiper.slideNext();
        }
      })
    })
  }
  initFloationBtn() {
    if (this.floatingBtn) {
      this.addEventListener('mouseenter', this.handleMouseEnter);
      this.addEventListener('mousemove', this.handleMouseMove);
      this.addEventListener('mouseleave', this.handleMouseLeave);
      this.addEventListener('click', this.changeSlides);
      requestAnimationFrame(() => {
        if (window.mouseX !== undefined && window.mouseY !== undefined) {
          const rect = this.getBoundingClientRect();
          const insideX = window.mouseX >= rect.left && window.mouseX <= rect.right;
          const insideY = window.mouseY >= rect.top && window.mouseY <= rect.bottom;

          if (insideX && insideY) {
            this.handleMouseEnter(); // show floating button
          }
        }
      });
    }
  }
  initHoverButtons() {
    this.hoverBtns.forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        this.floatingBtn.style.opacity = '0';
        this.isHoveringOnBtn = true;
      });
      btn.addEventListener('mouseleave', () => {
        this.floatingBtn.style.opacity = '1';
        this.isHoveringOnBtn = false;
      });
    });
  }

  initVideoObservers() {
    if (!this.videos.length) return;

    this.videos.forEach(video => {
      if (!video) return;
      theme.createScrollObserver(this, (isVisible) => {
        isVisible ? video.play() : video.pause();
      });
    });
  }

  initSwiper() {
    const swiperData = this.dataset.swiper;
    if (!swiperData) return;

    const swiperOptions = JSON.parse(swiperData);
    const activeSlideText = this.querySelector('[active-progressive-slide]');

    this.mySwiper = theme.SwiperSliderInit(this, swiperOptions);

    if (activeSlideText && this.mySwiper) {
      this.mySwiper.on("slideChange", () => {
        activeSlideText.textContent = `0${this.mySwiper.realIndex + 1}`;
      });
    }

    if (Shopify.designMode) {
      this.addEventListener('shopify:block:select', (event) => {
        this.handleBlockSelect(event.target);
      });
      document.addEventListener('shopify:section:load', (event) => {
        this.handleBlockSelect(event.target);
      });
    }

  }

  handleMouseEnter() {
    this.floatingBtn.classList.remove('hidden');
  }

  handleMouseMove(e) {
    if (this.floatingBtn.classList.contains('hidden')) {
      this.floatingBtn.classList.remove('hidden');
    }
    const rect = this.getBoundingClientRect();
    const halfWidth = rect.width / 2;

    this.floatingBtn.style.top = `${e.clientY}px`;
    this.floatingBtn.style.left = `${e.clientX}px`;
    this.floatingBtn.style.transition = 'ease';

    const isLeftSide = e.clientX < rect.left + halfWidth;
    this.toggleFloatingArrowDirection(isLeftSide);
  }

  handleMouseLeave() {
    this.floatingBtn.classList.add('hidden');
  }

  toggleFloatingArrowDirection(isLeft) {
    this.floatingArrow.classList.toggle('is-half-start', isLeft);
  }

  changeSlides(e) {
    if (!this.mySwiper || this.isHoveringOnBtn) return;

    const rect = this.getBoundingClientRect();
    const isLeftSide = e.clientX < rect.left + rect.width / 2;

    isLeftSide ? this.mySwiper.slidePrev() : this.mySwiper.slideNext();
  }

  handleBlockSelect(target) {
    const slideIndex = Number(target?.dataset?.swiperSlideIndex);
    if (!isNaN(slideIndex) && this?.mySwiper?.slideToLoop) {
      this.mySwiper.slideToLoop(slideIndex);
    } else {
      const checkClosestSlide = target.closest('.slideshow-item');
      if (checkClosestSlide) {
        const getSlideIndex = Number(checkClosestSlide?.dataset?.swiperSlideIndex);
        if (!isNaN(getSlideIndex) && this?.mySwiper?.slideToLoop) {
          this.mySwiper.slideToLoop(getSlideIndex);
        }
      }
      console.warn('Invalid slide index or initMainSlider is not defined', target);
    }
  }
}
customElements.define('slide-show', SlideShow);

class CountdownTimer extends HTMLElement {
  constructor() {
    super();
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          this.init();
        }
      });
    }, {
      // rootMargin: "200px 0px 0px 0px"
      rootMargin: '150px 0px',
      threshold: 0,
    });
    observer.observe(this.closest("div"));
  }

  init() {
    this.MS_IN_SECOND = 1000;
    this.MS_IN_MINUTE = 60 * this.MS_IN_SECOND;
    this.MS_IN_HOUR = 60 * this.MS_IN_MINUTE;
    this.MS_IN_DAY = 24 * this.MS_IN_HOUR;

    this.selectorMapping = {
      day: "[data-timer-day]",
      hour: "[data-timer-hour]",
      minute: "[data-timer-minute]",
      second: "[data-timer-second]"
    };

    this.units = ["day", "hour", "minute", "second"];
    this.type = this.dataset.type;
    this.duration = this.dataset.duration;
    this.loop = false;
    this.shouldAddLeadingZero = true;

    this.initCountdown();
  }

  initCountdown() {
    if (this.type === "fixed_time") {
      const dueDate = this.dataset.dueDate;
      if (dueDate) {
        this.targetTime = new Date(dueDate).getTime();
      }
    } else {
      this.targetTime = this.getEvergreenDueDate().getTime();
    }

    if (this.targetTime) {
      this.startTime = Date.now();
      if (this.targetTime > this.startTime) {
        this.fetchDomElements();
        this.beginCountdown();
      } else {
        this.terminateCountdown();
      }
    }
  }

  fetchDomElements() {
    this.elements = {};
    this.units.forEach(unit => {
      this.elements[unit] = this.querySelector(this.selectorMapping[unit]);
    });
  }

  beginCountdown() {
    this.intervalId = setInterval(() => {
      const remainingTime = this.targetTime - Date.now();
      if (remainingTime <= 0) {
        this.terminateCountdown();
      } else {
        this.updateDisplay(remainingTime);
      }
    }, 1000);

    this.classList.remove("hidden");
  }

  updateDisplay(remainingTime) {
    const timeComponents = this.computeTimeComponents(remainingTime);
    this.units.forEach(unit => {
      if (this.elements[unit]) {
        this.elements[unit].textContent = this.formatTimeComponent(timeComponents[unit]);
      }
    });
  }

  computeTimeComponents(ms) {
    return {
      day: Math.floor(ms / this.MS_IN_DAY),
      hour: Math.floor((ms % this.MS_IN_DAY) / this.MS_IN_HOUR),
      minute: Math.floor((ms % this.MS_IN_HOUR) / this.MS_IN_MINUTE),
      second: Math.floor((ms % this.MS_IN_MINUTE) / this.MS_IN_SECOND)
    };
  }

  formatTimeComponent(value) {
    return this.shouldAddLeadingZero && value < 10 ? `0${value}` : value.toString();
  }

  terminateCountdown() {
    clearInterval(this.intervalId);
    if (this.loop) {
      this.beginCountdown();
    } else {
      const expireText = this.parentNode.querySelector('[exipre-text]')
      this.classList.add("hidden");
      if (expireText) {
        expireText.classList.remove('hidden')
      }
    }
  }

  resetCountdown() {
    clearInterval(this.intervalId);
    this.units.forEach(unit => {
      if (this.elements[unit]) {
        this.elements[unit].textContent = "00";
      }
    });
  }
  getEvergreenDueDate() {
    const now = new Date();
    const dueDate = new Date(now);
    let intervalHours;

    switch (this.duration) {
      case "every_month":
        dueDate.setMonth(dueDate.getMonth() + 1);
        dueDate.setDate(1);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate;
      case "every_week":
        const daysUntilNextWeek = 7 - now.getDay();
        dueDate.setDate(now.getDate() + daysUntilNextWeek);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate;
      case "every_2_hrs":
        intervalHours = 2;
        break;
      case "every_6_hrs":
        intervalHours = 6;
        break;
      case "every_12_hrs":
        intervalHours = 12;
        break;
      case "every_24_hrs":
        intervalHours = 24;
        break;
      default:
        return dueDate;
    }

    const currentHour = now.getHours();
    const startPoints = [];
    for (let i = 0; i < 24; i += intervalHours) {
      startPoints.push(i);
    }

    for (let i = 0; i < startPoints.length; i++) {
      const point = startPoints[i];
      if (currentHour < point || (currentHour === point && now.getMinutes() === 0 && now.getSeconds() === 0)) {
        dueDate.setHours(point, 0, 0, 0);
        return dueDate;
      }
    }

    dueDate.setDate(dueDate.getDate() + 1);
    dueDate.setHours(startPoints[0], 0, 0, 0);
    return dueDate;
  }



}
customElements.define('countdown-timer', CountdownTimer);
class CollectionCarousel extends HTMLElement {
  constructor() {
    super();
    this.swiperIntiate();
  }
  swiperIntiate() {
    const sectionData = this.dataset.section;
    const swiperElement = this.querySelector('[data-swiper]');
    if (!swiperElement) return;
    const swiperProperty = JSON.parse(swiperElement.getAttribute('data-swiper'));
    const colSwiper = theme.SwiperSliderInit(swiperElement, swiperProperty);
    colSwiper.on('slideChange', function () {
      const isEnd = colSwiper.isEnd;
      const isBeginning = colSwiper.isBeginning;
      if (isBeginning) {
        document.querySelector(`.swiper-nav-prev-${sectionData}`).classList.add('swiper-button-disabled');
        document.querySelector(`.swiper-nav-next-${sectionData}`).classList.remove('swiper-button-disabled');
      }
      if (isEnd) {
        document.querySelector(`.swiper-nav-prev-${sectionData}`).classList.remove('swiper-button-disabled');
        document.querySelector(`.swiper-nav-next-${sectionData}`).classList.add('swiper-button-disabled');
      }
      if (!isBeginning && !isEnd) {
        document.querySelector(`.swiper-nav-prev-${sectionData}`).classList.remove('swiper-button-disabled');
        document.querySelector(`.swiper-nav-next-${sectionData}`).classList.remove('swiper-button-disabled');
      }
      document.querySelector(`.swiper-nav-prev-${sectionData}`).setAttribute('aria-disabled', isBeginning);
      document.querySelector(`.swiper-nav-next-${sectionData}`).setAttribute('aria-disabled', isEnd);
    });
  }
}
customElements.define('collection-carousel', CollectionCarousel);
class CollectionSwitcher extends HTMLElement {
  constructor() {
    super();
    this.tabList = this.querySelectorAll('[tab-list-item]');
    this.tabContent = this.querySelectorAll('[tab-content]');
    this.swipers = [];
    this.initSwipers();

    if (this.tabList.length > 0) {
      this.tabList.forEach((tab, index) =>
        tab.addEventListener('click', () => this.onTabChange(tab, index))
      );
    }
  }

  initSwipers() {
    const section_id = this.dataset.id;
    const swiperElements = this.querySelectorAll(`.swiper-${section_id}`);

    swiperElements.forEach((el) => {
      if (!el.dataset.swiper) return;

      const properties = JSON.parse(el.dataset.swiper);

      const init = () => {


        if (!el._swiperInstance) {
          el._swiperInstance = theme.SwiperSliderInit(el, properties);
          this.swipers.push(el._swiperInstance);
        }
      };

      const destroy = () => {
        if (el._swiperInstance) {
          el._swiperInstance.destroy(true, true);
          el._swiperInstance = null;
        }
      };



      // Initial init
      init();

      // Destroy/init based on screen size
      theme.onMobileSizeChange((isMobile) => {
        if (isMobile) {
          destroy();
        } else {
          init();
        }
      });
    });
  }

  onTabChange(tab, index) {
    this.tabList.forEach((tab, i) => {
      tab.classList.toggle('active', i === index);
    });

    this.tabContent.forEach((content, i) => {
      content.classList.toggle('active', i === index);
    });
  }
}
customElements.define('collection-switcher', CollectionSwitcher)

class LocalizationTrigger extends HTMLElement {
  constructor() {
    super();
    this.isOpen = false;

    this.wrapper = document.querySelector('#shopify-section-localization');
    this.template = document.querySelector('template[data-type="localization-terms"]');

    this.popupWrapper = null;
    this.backgroundWrapper = null;
    this.closeBtn = null;
    this.backBtn = null;
    this.heading = null;
    this.lastFocusedElement = null;

    // Bind once
    this.onClickHandler = this.onClickHandler.bind(this);
    this.handleClose = this.handleClose.bind(this);

    this.addEventListener('click', this.onClickHandler);
    this.addEventListener('keydown', this.onClickHandler);
  }

  onClickHandler(event) {
    if (event.type === 'click' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();

      this.extractTemplate();
      this.initializeElements();
      this.setupEventListeners();
      this.toggle();
    }
  }

  extractTemplate() {
    if (!this.popupWrapper) {
      const clone = this.template.content.cloneNode(true);
      this.popupWrapper = clone.querySelector('[is="localization-popover"]');
      this.wrapper.appendChild(this.popupWrapper);
    }

    this.backgroundWrapper = this.popupWrapper.querySelector('.page-overlay');

    if (this.backgroundWrapper && !this.backgroundWrapper.hasAttribute('data-listener-attached')) {
      this.backgroundWrapper.addEventListener('click', this.handleClose);
      this.backgroundWrapper.setAttribute('data-listener-attached', 'true');
    }
  }

  initializeElements() {
    this.closeBtn = this.popupWrapper.querySelector('[localization-close-btn]');
    this.backBtn = this.popupWrapper.querySelector('[localization-back-btn]');
    this.heading = this.popupWrapper.querySelector('[localization-popup-heading]');
  }

  setupEventListeners() {
    if (this.closeBtn && !this.closeBtn.hasAttribute('data-listener-attached')) {
      this.closeBtn.addEventListener('click', this.close.bind(this));
      this.closeBtn.setAttribute('data-listener-attached', 'true');
    }

    const selectBoxes = this.popupWrapper.querySelectorAll('[localization-select-box]');
    selectBoxes.forEach((box) => {
      if (!box.hasAttribute('data-listener-attached')) {
        box.addEventListener('click', () => this.handleSelectBoxClick(box));
        box.setAttribute('data-listener-attached', 'true');
      }
    });

    if (this.backBtn && !this.backBtn.hasAttribute('data-listener-attached')) {
      this.backBtn.addEventListener('click', this.handleBackClick.bind(this));
      this.backBtn.setAttribute('data-listener-attached', 'true');
    }

    if (!this.popupWrapper.hasAttribute('data-keydown-attached')) {
      document.addEventListener('keydown', (e) => {
        if (this.isOpen && e.key === 'Escape') this.close();
      });
      this.popupWrapper.setAttribute('data-keydown-attached', 'true');
    }
  }

  handleSelectBoxClick(clickedBox, event) {
    this.resetSelectBoxes();
    clickedBox.classList.add('open');
    if (this.heading) this.heading.textContent = 'Back';
    this.backBtn?.classList.remove('hidden');
    setTimeout(()=>{
      const ul = clickedBox.querySelector('ul');
       trapFocus(ul);
    },100)
  }


  handleBackClick() {
    if (this.heading) this.heading.textContent = 'Localization options';
    this.backBtn?.classList.add('hidden');
    this.resetSelectBoxes();
  }

  resetSelectBoxes() {
    this.popupWrapper.querySelectorAll('[localization-select-box]')
      .forEach((box) => box.classList.remove('open'));
  }

  handleClose(event) {
    if (event.target === this.backgroundWrapper) this.close();
  }
 
  open() {
    this.lastFocusedElement = document.activeElement; // save trigger
    this.popupWrapper?.classList.add('show');
    document.body?.classList.add('overflow-hidden');
    this.isOpen = true; 

    // Initial focus
    if (this.closeBtn) {
      this.closeBtn.focus();
    } else if (this.heading) {
      this.heading.setAttribute('tabindex', '-1'); // make it focusable temporarily
      this.heading.focus();
    }

    if (this.popupWrapper && this.closeBtn) {
      setTimeout(() => {
        trapFocus(this.popupWrapper, this.closeBtn);
      }, 500)
    } 
  }

  close() {
    this.popupWrapper?.classList.remove('show');
    document.body?.classList.remove('overflow-hidden');
    this.isOpen = false;
    this.handleBackClick();
    removeTrapFocus(this);

    // restore focus back to trigger
    if (this.lastFocusedElement) {
      this.lastFocusedElement.focus();
    }
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }
}
customElements.define('localization-trigger', LocalizationTrigger);
class LocalizationListbox extends HTMLFormElement {
  constructor() {
    super();



    this.items.forEach((item) => item.addEventListener('click', this.onItemClick.bind(this)));
  }

  get items() {
    return (this._items = this._items || Array.from(this.querySelectorAll('a')));
  }

  get input() {
    return this.querySelector('input[name="locale_code"], input[name="country_code"]');
  }

  onItemClick(event) {
    event.preventDefault();
    this.input.value = event.currentTarget.dataset.value;
    this.submit();
  }
}
customElements.define('localization-listbox', LocalizationListbox, { extends: 'form' });

class FlipCountdown extends HTMLElement {
  constructor() {
    super();
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          this.init();
        }
      });
    }, {
      // rootMargin: "200px 0px 0px 0px"
      rootMargin: '150px 0px',
      threshold: 0,
    });
    observer.observe(this.closest("div"));

  }

  init() {
    this.date = this.dataset.dueDate
    this.duration = this.dataset.duration;
    this.type = this.dataset.type;
    this.fontSize = this.dataset.class
    this.countdown = this.dataset.type == "fixed_time" ? new Date(this.date) : this.getEvergreenDueDate().getTime();
    this.cards = {
      days: this.querySelector(".days .flipdown-flip-card"),
      hours: this.querySelector(".hours .flipdown-flip-card"),
      minutes: this.querySelector(".minutes .flipdown-flip-card"),
      seconds: this.querySelector(".seconds .flipdown-flip-card"),
    };
    this.startCountdown();
  }


  getTimeRemaining() {
    const now = new Date();
    const diff = this.countdown - now;
    return {
      diff,
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }

  startCountdown() {
    const update = () => {
      const t = this.getTimeRemaining();
      this.updateCard(this.cards.days, t.days);
      this.updateCard(this.cards.hours, t.hours);
      this.updateCard(this.cards.minutes, t.minutes);
      this.updateCard(this.cards.seconds, t.seconds);
      if (t.diff <= 0) {
        clearInterval(this.interval);
        const expireText = this.parentNode.querySelector('[exipre-text]')
        this.classList.add("hidden");
        if (expireText) {
          expireText.classList.remove('hidden')
        }
      }
    };
    update();
    this.interval = setInterval(update, 1000);
  }

  updateCard(card, newVal) {
    const top = card.querySelector(".flipdown-top-half");
    const bottom = card.querySelector(".flipdown-bottom-half");
    const current = top.dataset.value;
    const paddedVal = String(newVal).padStart(2, "0");
    if (paddedVal === current) return;

    const topFlip = document.createElement("div");
    topFlip.className = `flipdown-top-flip flipdown-half ${this.fontSize}`;
    topFlip.textContent = current;

    const bottomFlip = document.createElement("div");
    bottomFlip.className = `flipdown-bottom-flip flipdown-half ${this.fontSize}`;
    bottomFlip.textContent = paddedVal;

    topFlip.addEventListener("animationstart", () => {
      top.dataset.value = paddedVal;
      top.textContent = paddedVal;
    });

    bottomFlip.addEventListener("animationend", () => {
      bottom.dataset.value = paddedVal;
      bottom.textContent = paddedVal;
      topFlip.remove();
      bottomFlip.remove();
    });

    card.appendChild(topFlip);
    card.appendChild(bottomFlip);
  }
  getEvergreenDueDate() {
    const now = new Date();
    const dueDate = new Date(now);
    let intervalHours;

    switch (this.duration) {
      case "every_month":
        dueDate.setMonth(dueDate.getMonth() + 1);
        dueDate.setDate(1);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate;
      case "every_week":
        const daysUntilNextWeek = 7 - now.getDay();
        dueDate.setDate(now.getDate() + daysUntilNextWeek);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate;
      case "every_2_hrs":
        intervalHours = 2;
        break;
      case "every_6_hrs":
        intervalHours = 6;
        break;
      case "every_12_hrs":
        intervalHours = 12;
        break;
      case "every_24_hrs":
        intervalHours = 24;
        break;
      default:
        return dueDate;
    }

    const currentHour = now.getHours();
    const startPoints = [];
    for (let i = 0; i < 24; i += intervalHours) {
      startPoints.push(i);
    }

    for (let i = 0; i < startPoints.length; i++) {
      const point = startPoints[i];
      if (currentHour < point || (currentHour === point && now.getMinutes() === 0 && now.getSeconds() === 0)) {
        dueDate.setHours(point, 0, 0, 0);
        return dueDate;
      }
    }

    dueDate.setDate(dueDate.getDate() + 1);
    dueDate.setHours(startPoints[0], 0, 0, 0);
    return dueDate;
  }

}
customElements.define("flipdown-countdown-wrapper", FlipCountdown);

class LookbookSwiper extends HTMLElement {
  constructor() {
    super();
    this.mySwiper = null;
    this.initSwiper();
  }
  connectedCallback() {

  }
  initSwiper() {
    const swiperProperty = this.dataset.swiper;
    if (!swiperProperty) return;

    const properties = JSON.parse(swiperProperty);

    const init = () => {
      if (!this.mySwiper) {
        this.mySwiper = theme.SwiperSliderInit(this, properties);
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
}
customElements.define("lookbook-swiper", LookbookSwiper);

class lookbookBannerItem extends HTMLElement {
  constructor() {
    super();
    this.firstActive = this.dataset.firstActive === "true";
    this.hotspots = this.querySelectorAll("[data-lookbook-hotspot-wrapper]");
    this.lastHovered = null;

    if (this.hotspots.length) {
      this.initHotspot();
    }
  }

  initHotspot() {
    if (this.firstActive) {
      this.hotspots[0].classList.add("active");
      this.lastHovered = this.hotspots[0];
    }

    this.hotspots.forEach((hotspot) => {
      const hoverTarget = hotspot.querySelector("variant-button") || hotspot;
      if (!hoverTarget) return;

      hoverTarget.addEventListener("mouseenter", () => {
        this.hotspots.forEach((h) => h.classList.remove("active"));
        hotspot.classList.add("active");
        this.lastHovered = hotspot;
      });

      hoverTarget.addEventListener("mouseleave", () => {
        this.hotspots.forEach((h) => h.classList.remove("active"));

        if (this.firstActive) {
          if (this.lastHovered) {
            this.lastHovered.classList.add("active");
          }
        } else {
          this.lastHovered = null;
        }
      });
    });
  }
}
customElements.define("lookbook-banner-item", lookbookBannerItem);

class CustomCollectionTab extends HTMLElement {
  constructor() {
    super();
    this.mySwiper = null;
    this.dataContent = this.querySelectorAll('[data-content]');
    this.initSwiper();
  }

  initSwiper() {
    const swiperDiv = this.querySelector('[data-swiper]');
    if (!swiperDiv?.dataset?.swiper) return;

    let swiperConfig;
    try {
      swiperConfig = JSON.parse(swiperDiv.dataset.swiper);
    } catch {
      return;
    }
    const init = () => {
      if (!this.mySwiper) {
        this.mySwiper = theme?.SwiperSliderInit?.(swiperDiv, swiperConfig);
      }
    }
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
    if (!this.mySwiper || !this.dataContent?.length) return;

    const isLoop = !!(this.mySwiper.params && this.mySwiper.params.loop);
    let pendingIndex = null;
    let rafScheduled = false;

    const scheduleSlide = (item, index) => {
      this.dataContent.forEach(el => el?.classList?.remove('active'))
      if (!item.classList.contains('active')) {
        item.classList.add('active')
      }
      pendingIndex = index;
      if (rafScheduled) return;
      rafScheduled = true;
      requestAnimationFrame(() => {
        if (pendingIndex !== null) {
          if (isLoop && typeof this.mySwiper.slideToLoop === 'function') {
            this.mySwiper.slideToLoop(pendingIndex);
          } else {
            this.mySwiper.slideTo(pendingIndex);
          }
        }
        pendingIndex = null;
        rafScheduled = false;
      });
    };

    this.dataContent.forEach((item, index) => {
      item.addEventListener('mouseenter', () => scheduleSlide(item, index));
    });

  }
}

customElements.define("custom-collection-tab", CustomCollectionTab);

class SubCollection extends HTMLElement {
  constructor() {
    super()
    this.box = this.querySelector('details')
    if (this.box) {
      theme.onMobileSizeChange((isMobile) => this.handleMobileChange(isMobile));
    }
  }
  handleMobileChange(isMobile) {
    if (isMobile) {
      const isOpen = this.box.hasAttribute('open')
      if (isOpen) {
        this.box.removeAttribute('open')
      }
    } else {
      const isOpen = this.box.hasAttribute('open')
      if (!isOpen) {
        this.box.setAttribute('open', '')
      }
    }
  }
}
customElements.define('sub-collection', SubCollection);

class OfferScheduleSlider extends HTMLElement {
  constructor() {
    super()
    this.mySwiper = null;
    this.initSwiper();
  }
  initSwiper() {
    const swiperProperty = this.dataset.swiper;
    if (!swiperProperty) return;

    const properties = JSON.parse(swiperProperty);

    const init = () => {
      if (!this.mySwiper) {
        this.mySwiper = theme.SwiperSliderInit(this, properties);
      }
    };
    init();

  }
}
customElements.define('offer-schedule-slider', OfferScheduleSlider);

class OfferSchedule extends HTMLElement {
  constructor() {
    super();
    this.tabButtons = this.querySelectorAll('[data-tab-btn]');
    this.tabContents = this.querySelectorAll('[data-tab-content]');
    this.tabNavigations = this.querySelectorAll('[data-tab-navigation]')
    this.section_id = this.dataset.section;
    this.activeTabId = null;
    this.userClicked = false; // track user clicks
    this.countdownInterval = null;
  }
  connectedCallback() {
    if (Shopify.designMode) {
      this.tabButtons.forEach(btn => {
        btn.addEventListener('shopify:block:select', (event) => {
          this.userClicked = true; // user manually clicked
          this.activateTab(btn.dataset.tabBtn, true);
        });
        btn.addEventListener('shopify:block:load', (event) => {
          this.userClicked = true; // user manually clicked
          this.activateTab(btn.dataset.tabBtn, true);
        });
      })
    }
    if (this.tabButtons.length > 0) {
      this.initTabs();
      this.startCountdowns();
      if (!this.activeTabId) {
        const firstTab = this.querySelectorAll('[data-tab-btn]')[0];
        this.activeTabId = firstTab;
        if (firstTab) this.activateTab(firstTab.dataset.tabBtn);
      }
    } else {
      document.getElementById(`shopify-section-${this.section_id}`).style.display = "none"
    }
  }

  initTabs() {
    this.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.userClicked = true; // user manually clicked
        this.activateTab(btn.dataset.tabBtn, true);
      });
      btn.addEventListener('keydown', (e) => {
        if (e.key === "Enter" || e.key === " ") {
        this.activateTab(btn.dataset.tabBtn, true);
    const content = this.querySelector(`[data-tab-content="${btn.dataset.tabBtn}"]`);
    const focusables = this.getFocusableElements(content); 
     if (focusables.length > 0) focusables[0].focus();
      }
      });

    });

    this.tabContents.forEach((content)=>{
      content.addEventListener('keydown', (e) => {
        const tabId = content.dataset.tabContent
        if(tabId != this.activeTabId)
        this.activateTab(tabId, true);
      })
    })

  }

  activateTab(tabId, userClick = false) {
    if (this.activeTabId === tabId && !userClick) return;
     
    // Remove active class from all
    this.tabButtons.forEach(btn => btn.classList.remove('active'));
    this.tabContents.forEach(content => content.classList.remove('active'));

    // Add active to selected 
    const btn = this.querySelector(`[data-tab-btn="${tabId}"]`);
    const content = this.querySelector(`[data-tab-content="${tabId}"]`);
 
    if (btn && content) {
      btn.classList.add('active');
      content.classList.add('active');
      this.activeTabId = tabId;
    }
    if (this.tabNavigations && this.tabNavigations.length > 0) {
      this.tabNavigations.forEach(nav => nav.classList.add('hidden'));
      const navigation = this.querySelector(`[data-tab-navigation="${tabId}"]`);
      navigation.classList?.remove('hidden');
    }
    const sliderElement = this?.querySelector('offer-schedule-slider');
    const tabIndex = Array.from(this.tabButtons).findIndex(b => b.dataset.tabBtn === tabId);
    if (sliderElement?.mySwiper && tabIndex >= 0) {
      sliderElement.mySwiper.slideTo(tabIndex);
    }
      }
    getFocusableElements(container) {
      return Array.from(
        container.querySelectorAll(`
          a[href], button, input, textarea, select,
          details, summary,
          [tabindex]:not([tabindex="-1"])
        `)
      ).filter(el => !el.disabled && el.offsetParent !== null);
    }
  startCountdowns() {
    const update = () => {
      const now = new Date();
      let nextActiveTab = null;
      let closestTime = Infinity;
      let activeTabExpired = false;

      this.tabButtons.forEach(btn => {
        const endDateStr = btn.dataset.enddate;
        const endDate = new Date(endDateStr);
        const isValidDate = endDate && !isNaN(endDate.getTime());
        if (!isValidDate) return;
        const expiryDate = new Date(endDate);
        expiryDate.setHours(23, 59, 59, 999); // end of the endDate day
        const diff = expiryDate - now;
        // const diff = endDate - now;

        const content = this.querySelector(`[data-tab-content="${btn.dataset.tabBtn}"]`);
        const navigation = this.querySelector(`[data-tab-navigation="${btn.dataset.tabBtn}"]`);
        const timerBtn = btn.querySelector('[data-timer-content]');
        const dateBtn = btn.querySelector('[data-date-content]');


        if (diff <= 0) {
          // Expired → hide
          btn?.remove();
          content?.remove();
          if (navigation) navigation?.remove;
          const sliderElement = this.querySelector('offer-schedule-slider');
          if (sliderElement?.mySwiper) {
            // small timeout ensures DOM updates finish before Swiper recalculates
            setTimeout(() => {
              try {
                sliderElement.mySwiper.update(); // refresh Swiper slides
                // if Swiper index is now out of range, reset to 0
                if (sliderElement.mySwiper.activeIndex >= sliderElement.mySwiper.slides.length) {
                  sliderElement.mySwiper.slideTo(0);
                }
              } catch (err) {
                console.warn('Swiper update failed after tab removal:', err);
              }
            }, 100);
          }
          if (this.activeTabId === btn.dataset.tabBtn) {
            activeTabExpired = true; // current active tab expired
          }
        } else {

          // Update countdown or month label
          if (diff <= 24 * 60 * 60 * 1000) {
            const hours = String(Math.floor(diff / 1000 / 3600)).padStart(2, '0');
            const minutes = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0');
            const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
            timerBtn.classList?.remove('hidden')
            dateBtn.classList?.add('hidden')
            const hoursHtml = btn.querySelector('[data-hours]');
            const minutesHtml = btn.querySelector('[data-minutes]');
            const secondsHtml = btn.querySelector('[data-seconds]');
            if (hoursHtml) hoursHtml.textContent = `${hours}`;
            if (minutesHtml) minutesHtml.textContent = `${minutes}`;
            if (secondsHtml) secondsHtml.textContent = `${seconds}`;
          } else {
            const day = endDate.getDate();
            const month = endDate.toLocaleString('default', { month: 'long' });
            dateBtn.classList.remove('hidden')
            const labelSpan = dateBtn.querySelector('[data-date-text]')
            const btnSuffix = btn.dataset.suffix;
            if (labelSpan) labelSpan.textContent = `${day} ${month} ${btnSuffix || ''}`;
          }

          // Determine the next tab to activate
          if (diff < closestTime) {
            closestTime = diff;
            nextActiveTab = btn.dataset.tabBtn;
          }
        }
      });

      const remainingTabs = this.querySelectorAll('[data-tab-btn]').length;
      if (remainingTabs === 0) {
        const sectionEl = document.getElementById(`shopify-section-${this.section_id}`);
        sectionEl?.remove();
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        this.countdownInterval = null;
        return;
      }
      // Only auto-switch if current active tab expired and user hasn't clicked recently
      if (activeTabExpired) {
        if (nextActiveTab) {
          this.activateTab(nextActiveTab);
        } else if (this.tabButtons.length > 0) {
          // fallback: activate first available tab
          this.activateTab(this.tabButtons[0].dataset.tabBtn);
        }
      }
    };

    update();
    setInterval(update, 1000);
  }
}
customElements.define('offer-schedule-tab', OfferSchedule);

document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
  const formType = urlParams.get('form_type');
  const contactTags = urlParams.get('contact[tags]');
  const formId = window.location.hash.substring(1);
  const form = document.getElementById(formId);
 
    
 
  if (form && formType === "customer" && contactTags === "newsletter") {
    const successMessage = form.querySelector('[id^="Newsletter-success--"]');
    const errorMessage = form.querySelector('[id^="Newsletter-error--"]');
     const formContent = form.querySelector('.newsletter-form-inner');
    if (!successMessage && !errorMessage) {
      const errorDiv = document.createElement("div");
      errorDiv.className = "form-message form-message-error text-small";
      errorDiv.setAttribute("role", "status");
      errorDiv.textContent = window.newsletter.error;
       if(formContent){
       formContent.after(errorDiv);
       }else{
      form.appendChild(errorDiv);
       }
    }
  }
});  
// Lazy load videos - works with existing src attribute
document.addEventListener('DOMContentLoaded', function() {
  const videos = document.querySelectorAll('video[src]');
  
  // Store the src in data-src and remove src
  videos.forEach(video => {
    // Only process autoplay videos (the ones causing problems)
    if (video.hasAttribute('autoplay')) {
      // Save the video source
      video.dataset.src = video.src;
      // Remove src to stop loading
      video.removeAttribute('src');
      // Remove autoplay to prevent immediate loading
      video.removeAttribute('autoplay');
      // Load the poster image
      video.load();
    }
  });
  
  // Now lazy load them
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const video = entry.target;
          video.src = video.dataset.src;
          video.setAttribute('autoplay', '');
          video.load();
          video.play();
          observer.unobserve(video);
        }
      });
    }, { rootMargin: '200px' });
    
    document.querySelectorAll('video[data-src]').forEach(video => {
      observer.observe(video);
    });
  }
});