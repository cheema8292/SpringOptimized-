if (Shopify.designMode) {
  if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
    try {
      gsap.registerPlugin(ScrollToPlugin);
    } catch (e) {
      console.warn('ScrollToPlugin not available, using fallback scroll method');
    }
  }
  var classIntializeMoonliteTheme = new animationsMoonLiteTheme();
  function clearScrollFlags() {
    window.pendingScrollPosition = null;
    window.blockInteraction = false;
    window.sectionLoading = false;
    window.sectionUnloading = false;
  }

  function safeScrollTo(target, duration = 0.5, ease = 'power2.out', forceScroll = false) {
    if (!target || target <= 0) {
      console.warn('Invalid scroll target:', target);
      return;
    }
    if (!forceScroll && (window.sectionLoading || window.sectionUnloading)) {
      console.log('Skipping scroll during section load/unload');
      return;
    }
    if (typeof gsap !== 'undefined' && gsap.to) {
      try {
        gsap.to(window, { scrollTo: target, duration: duration, ease: ease });
      } catch (e) {
        console.warn('GSAP scrollTo failed, using fallback:', e);
        window.scrollTo({ top: target, behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: target, behavior: 'smooth' });
    }
  }

  document.addEventListener('shopify:section:load', (event) => {
    let currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    window.sectionLoading = true;
    if (!window.pendingScrollPosition) {
      window.pendingScrollPosition = currentScrollPosition;
    }
    let sectionIdCustomizer = event.detail.sectionId;
    let targetSectionLoad = event.target;
    let getSectionCustomizer = document.getElementById('shopify-section-' + sectionIdCustomizer);
    let methodCalled = getSectionCustomizer?.querySelector('[animatedSection]');
    if (methodCalled && methodCalled.hasAttribute('animatedSection')) {
      let methodCalledItem = methodCalled.getAttribute("methodSection").trim();
      if (methodCalledItem != '') {
        let timeOutEditor = 2500;
        if (typeof classIntializeMoonliteTheme[methodCalledItem] === 'function') {
          ScrollTrigger.getAll().forEach(trigger => {
            if (targetSectionLoad.contains(trigger.trigger)) {
              trigger.kill();
            }
          });
          classIntializeMoonliteTheme[methodCalledItem](methodCalled);
          setTimeout(() => {
            ScrollTrigger.refresh(true);
            ScrollTrigger.sort();
            window.sectionLoading = false;
            if (window.pendingScrollPosition && window.blockInteraction) {
              setTimeout(() => {
                safeScrollTo(window.pendingScrollPosition, 0.3, "power2.out", true);
                window.pendingScrollPosition = null;
              }, 100);
            } else if (window.pendingScrollPosition && !window.blockInteraction) {
              window.pendingScrollPosition = null;
            }
          }, timeOutEditor);
        }
      }
    } else {
      setTimeout(() => {
        ScrollTrigger.refresh(true);
        ScrollTrigger.sort();
        window.sectionLoading = false;
        if (window.pendingScrollPosition && window.blockInteraction) {
          setTimeout(() => {
            safeScrollTo(window.pendingScrollPosition, 0.3, "power2.out", true);
            window.pendingScrollPosition = null;
          }, 100);
        } else if (window.pendingScrollPosition && !window.blockInteraction) {
          window.pendingScrollPosition = null;
        }
      }, 2500);
    }
  });
  document.addEventListener('shopify:section:unload', (event) => {
    window.sectionUnloading = true;
    let sectionIdCustomizer = event.detail.sectionId;
    if (sectionIdCustomizer) {
      let targetSectionLoad = event.target;
      let getSectionCustomizer = document.getElementById('shopify-section-' + sectionIdCustomizer);
      let methodCalled = getSectionCustomizer.querySelector('[animatedSection]');
      if (methodCalled && methodCalled.hasAttribute('animatedSection')) {
        let methodCalledItem = methodCalled.getAttribute("methodSection").trim();
        if (methodCalledItem != '') {
          if (typeof classIntializeMoonliteTheme[methodCalledItem] === 'function') {
            ScrollTrigger.getAll().forEach(trigger => {
              if (targetSectionLoad.contains(trigger.trigger)) {
                trigger.kill();
              }
            });
            ScrollTrigger.refresh(true);
            ScrollTrigger.sort();
          }
        }
      } else {
        ScrollTrigger.refresh(true);
        ScrollTrigger.sort();
      }
      setTimeout(() => {
        window.sectionUnloading = false;
      }, 100);
    }
  });
  document.addEventListener('shopify:section:reorder', (event) => {
    sectionReorderShopify();
  })
  document.addEventListener('shopify:section:select', (event) => {
    clearScrollFlags();
    let sectionIdCustomizer = event.detail.sectionId;
    let getSectionCustomizer = document.getElementById('shopify-section-' + sectionIdCustomizer);
    if (getSectionCustomizer) {
      let offSetTopData = getSectionCustomizer.offsetTop;
      safeScrollTo(offSetTopData, 0.5, 'power2.out', true); // Force scroll for section select
    } else {
      console.warn('Section not found for ID:', sectionIdCustomizer);
    }
  })
  document.addEventListener('shopify:section:deselect', (event) => {
    clearScrollFlags();
    let sectionIdCustomizer = event.detail.sectionId;
    let getSectionCustomizer = document.getElementById('shopify-section-' + sectionIdCustomizer);

    if (getSectionCustomizer) {
      let offSetTopData = getSectionCustomizer.offsetTop;
      safeScrollTo(offSetTopData, 0.5, 'power2.out', true); // Force scroll for section deselect
    } else {
      console.warn('Section not found for ID:', sectionIdCustomizer);
    }
  })
  document.addEventListener('shopify:block:select', (event) => {
    window.blockInteraction = true;
    let sectionIdCustomizer = event.detail.sectionId;
    let blockIdGet = event.target;
    let clickBlockId = event.detail.blockId;
    if (blockIdGet != null) {
      let getSectionCustomizer = document.getElementById('shopify-section-' + sectionIdCustomizer);
      let methodCalled = getSectionCustomizer.querySelector('[animatedSection]');
      let intendedScrollPosition = null;
      if (methodCalled) {
        const methodTheme = methodCalled.getAttribute('methodSection')?.trim();
        let checkScrollTriggerExist = ScrollTrigger.getById(sectionIdCustomizer);
        if (methodTheme == 'revealCategory') {
          let desktopId = `${sectionIdCustomizer}_desktopMain`;
          let mobileId = `${sectionIdCustomizer}_mobileMain`;
          checkScrollTriggerExist = ScrollTrigger.getById(desktopId) || ScrollTrigger.getById(mobileId);
        }
        if (typeof checkScrollTriggerExist != 'undefined') {
          switch (methodTheme) {
            case 'featuredImagesCards':
              const animationData = checkScrollTriggerExist.animation;
              if (animationData) {
                animationData.progress(1);
              }
              break;
            case 'revealCategory':
              const blockSize = parseInt(methodCalled.getAttribute("data-block-size")) - 1;
              const differnceScroll = scrollDifferenceGsap(checkScrollTriggerExist);
              const perViewSlide = differnceScroll / blockSize;
              const clickedIndex = parseInt(blockIdGet.getAttribute("data-reveal-index"));
              const scrollAmount = perViewSlide * clickedIndex;
              intendedScrollPosition = getSectionCustomizer.offsetTop + scrollAmount;
              setTimeout(() => {
                safeScrollTo(intendedScrollPosition, 0.3, "none", true); // Force scroll for block interaction
              }, 100);
              break;
            case 'stepByStepGuide':
              const blockSizeSteps = parseInt(methodCalled.getAttribute("data-block-size"));
              const stepsLayoutStyle = methodCalled.getAttribute("data-layout-style");
              const differnceScrollSteps = scrollDifferenceGsap(checkScrollTriggerExist);
              const perSlideScroll = differnceScrollSteps / (blockSizeSteps - 1);
              const clickedIndexSteps = parseInt(blockIdGet.getAttribute("data-step-index"));
              const scrollAmountSteps = perSlideScroll * clickedIndexSteps;
              intendedScrollPosition = getSectionCustomizer.offsetTop + scrollAmountSteps;
              if (stepsLayoutStyle == 'V1') {
                setTimeout(() => {
                  safeScrollTo(intendedScrollPosition, 0.3, "none", true); // Force scroll for block interaction
                }, 100);
              } else {
                setTimeout(() => {
                  safeScrollTo(intendedScrollPosition, 0.3, "none", true); // Force scroll for block interaction
                }, 100);
              }
              break;
            default:
              console.log('no scroll needed');
          }
        }
      } else {
        let blockOffsetTop = blockIdGet.offsetTop;
        let sectionOffsetTop = getSectionCustomizer.offsetTop;
        intendedScrollPosition = sectionOffsetTop + blockOffsetTop;
        // setTimeout(() => {
        //   safeScrollTo(intendedScrollPosition, 0.3, "power2.out", true); // Force scroll for block interaction
        // }, 100);

        if (getSectionCustomizer.querySelector('custom-collection-tab')) {
          blockIdGet.dispatchEvent(new Event('mouseenter', { bubbles: true }));
        } else if (getSectionCustomizer.querySelector('category-tabs-style')) {
          const eventSelected = getSectionCustomizer.querySelector('category-tabs-style');
          if (eventSelected.dataset.eventAction == 'click') {
            blockIdGet.dispatchEvent(new Event('click', { bubbles: true }));
          } else {
            blockIdGet.dispatchEvent(new Event('mouseenter', { bubbles: true }));
          }
        }
      }
      if (intendedScrollPosition) {
        window.pendingScrollPosition = intendedScrollPosition;
      }
    }
    setTimeout(() => {
      window.blockInteraction = false;
    }, 2000);
  })
  document.addEventListener('shopify:block:deselect', (event) => { })
  function scrollDifferenceGsap(checkScrollTriggerExistSection) {
    let differnceTrigger = checkScrollTriggerExistSection.end - checkScrollTriggerExistSection.start;
    return differnceTrigger;
  }
  function sectionReorderShopify() {
    const sectionContainerShopify = document.querySelector('main') || document.querySelector('#MainContent');
    if (!sectionContainerShopify) {
      console.warn("Section container not found. Reorder section case");
      return;
    }
    let lastPositions = [];
    let debounceTimer;
    let finalCheckTimer;
    let isSettled = false;
    const observerShopifyAdmin = new MutationObserver(() => {
      clearTimeout(debounceTimer);
      clearTimeout(finalCheckTimer);
      isSettled = false;
      debounceTimer = setTimeout(() => {
        checkReorderSettledShopify();
      }, 500);
    });
    observerShopifyAdmin.observe(sectionContainerShopify, { childList: true, subtree: true });
    function checkReorderSettledShopify() {
      const sectionsMoved = document.querySelectorAll('[animatedSection]');
      let currentPositions = Array.from(sectionsMoved).map(sec => sec.getBoundingClientRect().top);
      if (JSON.stringify(currentPositions) === JSON.stringify(lastPositions)) {
        if (!isSettled) {
          isSettled = true;
          ScrollTrigger.refresh(true);
          ScrollTrigger.sort();
          observerShopifyAdmin.disconnect();
        }
        return;
      }
      lastPositions = currentPositions;
      finalCheckTimer = setTimeout(checkReorderSettledShopify, 300);
    }
  }
}
