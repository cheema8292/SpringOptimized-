class animationsMoonLiteTheme {
  constructor() {
    if (typeof gsap !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    } else {
      console.warn('GSAP is not defined');
    }
  }
  revealCategory(revealObject) {
    let matchMediaCheck = gsap.matchMedia();
    matchMediaCheck.add('(min-width: 768px)', () => {
      const ulListImages = revealObject.querySelector('[reveal-catgory-image-list]');
      const overlayListSection = revealObject.querySelector('[reveal-highlight-overlay]');
      const allOverlayBox = overlayListSection.querySelectorAll('.reveal-overlay-box');
      const heightCaption = revealObject.querySelector('[reveal-category-caption]');
      const desktopMainId = `${this.scrollTriggerIdGet(revealObject)}_desktopMain`;
      const id1 = `${this.scrollTriggerIdGet(revealObject)}_second`;
      const id2 = `${this.scrollTriggerIdGet(revealObject)}_third`;
      const animationStyle = revealObject.dataset.animationStyle;
      ScrollTrigger.getAll().forEach((st) => {
        if (revealObject.contains(st.trigger)) st.kill();
      });
      gsap.set([ulListImages], { clearProps: 'all' });
      let opacityIntial = 0;
      let opacityFinal = 0;
      if (animationStyle == 'both' || animationStyle == 'background') {
        opacityIntial = 0;
        opacityFinal = 1;
      } else {
        gsap.set(allOverlayBox, { opacity: 0 });
      }
      const mainTrigger = gsap.timeline({
        scrollTrigger: {
          id: desktopMainId,
          trigger: revealObject,
          start: 'top 0%',
          end: () => {
            const cap = revealObject.querySelector('[reveal-category-caption]');
            return '+=' + (cap ? cap.offsetHeight : 0);
          },
          pin: ulListImages,
          pinSpacing: false,
          onUpdate: updateActiveItems,
        },
      });
      const revealTimeLine = gsap
        .timeline({
          scrollTrigger: {
            id: id1,
            trigger: revealObject,
            start: 'top 90%',
            end: '+=50%',
            scrub: true,
          },
        })
        .to(allOverlayBox, {
          duration: 0.2,
          opacity: opacityIntial,
          delay: () => gsap.utils.random(0, 1),
          ease: 'linear.none',
        });
      const revealTimeLineSecond = gsap
        .timeline({
          scrollTrigger: {
            id: id2,
            trigger: revealObject,
            start: 'bottom 70%',
            end: '+=50%',
            scrub: true,
          },
        })
        .to(allOverlayBox, {
          duration: 0.2,
          opacity: opacityFinal,
          delay: () => gsap.utils.random(0, 1),
          ease: 'linear.none',
        });
      setTimeout(() => ScrollTrigger.refresh(), 1000);
      return () => {
        ScrollTrigger.getById(desktopMainId)?.kill();
        ScrollTrigger.getById(id1)?.kill();
        ScrollTrigger.getById(id2)?.kill();
        mainTrigger.kill();
        revealTimeLine.kill();
        revealTimeLineSecond.kill();
      };
    });
    matchMediaCheck.add('(max-width: 767px)', () => {
      const ulListImages = revealObject.querySelector('[reveal-catgory-image-list]');
      const overlayListSection = revealObject.querySelector('[reveal-highlight-overlay]');
      const allOverlayBox = overlayListSection.querySelectorAll('.reveal-overlay-box');
      const heightCaption = revealObject.querySelector('[reveal-category-caption]');
      const mobileMainId = `${this.scrollTriggerIdGet(revealObject)}_mobileMain`;
      gsap.set(allOverlayBox, { opacity: 0 });
      ScrollTrigger.getAll().forEach((st) => {
        if (revealObject.contains(st.trigger)) st.kill();
      });
      gsap.set([ulListImages], { clearProps: 'all' });
      const mobileTrigger = gsap.timeline({
        scrollTrigger: {
          id: mobileMainId,
          trigger: revealObject,
          start: 'top 0%',
          end: () => {
            const cap = revealObject.querySelector('[reveal-category-caption]');
            return '+=' + (cap ? cap.offsetHeight : 0);
          },
          //end: () => "+=" + heightCaption.offsetHeight,
          pin: ulListImages,
          pinSpacing: false,
          onUpdate: updateActiveItems,
        },
      });
      setTimeout(() => ScrollTrigger.refresh(true), 1000);
      return () => {
        ScrollTrigger.getById(mobileMainId)?.kill();
        mobileTrigger.kill();
      };
    });
    function updateActiveItems() {
      const viewportCenter = window.innerHeight / 2;
      const lis = revealObject.querySelectorAll('[reveal-caption-list]');
      let centerLi = null;
      let minDistance = Infinity;
      let activeIndex = -1;
      lis.forEach((li, index) => {
        const liRect = li.getBoundingClientRect();
        const liCenter = liRect.top + liRect.height / 2;
        const distance = Math.abs(liCenter - viewportCenter);
        if (distance < minDistance) {
          minDistance = distance;
          centerLi = li;
          activeIndex = index;
        }
      });
      lis.forEach((li) => li.classList.remove('active'));
      if (centerLi) centerLi.classList.add('active');
      const lisImage = revealObject.querySelectorAll('[reveal-category-images]');
      lisImage.forEach((li) => li.classList.remove('active'));
      if (activeIndex >= 0 && lisImage[activeIndex]) {
        lisImage[activeIndex].classList.add('active');
      }
    }
  }
  ImageWithTextScroll(textScrollObj) {
    let matchMediaCheck = gsap.matchMedia();
    //matchMediaCheck.add('(min-width: 768px)', () => {
      const triggerId = this.scrollTriggerIdGet(textScrollObj);
      const leftMediaWrapper = textScrollObj.querySelector('[media-wrapper-left]');
      const rightMediaWrapper = textScrollObj.querySelector('[media-wrapper-right]');
      let widthArray = [35, 65];
      if (textScrollObj.classList.contains('image-second')) {
        widthArray = [65, 35];
      }
      ScrollTrigger.getAll().forEach((st) => {
        if (textScrollObj.contains(st.trigger)) st.kill();
      });
      const imageWithTextTimeline = gsap.timeline({
        scrollTrigger: {
          id: triggerId,
          trigger: textScrollObj,
          start: 'top 90%',
          end: '+=135%',
          scrub: true,
        },
      });
      imageWithTextTimeline
        .fromTo(
          leftMediaWrapper,
          { width: `${widthArray[0]}%`, ease: 'power2.out' },
          { width: `${widthArray[1]}%`, ease: 'power2.out' }
        )
        .fromTo(
          rightMediaWrapper,
          { width: `${widthArray[1]}%`, ease: 'power2.out' },
          { width: `${widthArray[0]}%`, ease: 'power2.out' },
          '<'
        );

      setTimeout(() => ScrollTrigger.refresh(true), 1000);
      return () => {
        ScrollTrigger.getById(triggerId)?.kill();
        imageWithTextTimeline.kill();
      };
    //});
  }
  stepByStepGuide(sectionObj) {
    let matchMediaCheck = gsap.matchMedia();
    matchMediaCheck.add('(min-width: 768px)', () => {
      const triggerId = this.scrollTriggerIdGet(sectionObj);
      const stepsImageItem = sectionObj.querySelectorAll('[step-image-item]');
      const stepsItems = sectionObj.querySelectorAll('[step-tab-item]');
      const stepsLayoutSection = sectionObj.getAttribute('data-layout-style');
      const stepWrapperTabs = sectionObj.querySelector('[step-tab-wrapper]');
      const itemLengthData = stepsItems.length - 1;
      let startValue = 'top top';
      //let endValue = `+=${100 * itemLengthData}%`;
      let endValue = `+=${100 * itemLengthData}%`;
      let pinVal = true;
      const heightTabWrap = stepWrapperTabs.getBoundingClientRect();
      gsap.set(sectionObj, { '--stepGuideContentHeight': `${Math.round(heightTabWrap.height)}px` });
      if (stepsLayoutSection == 'V2') {
        startValue = 'top 40%';
        endValue = `+=60%`;
        pinVal = false;
      }
      ScrollTrigger.getAll().forEach((st) => {
        if (sectionObj.contains(st.trigger)) st.kill();
      });
      const stepByStepTimeLine = gsap.timeline({
        scrollTrigger: {
          id: triggerId,
          trigger: sectionObj.closest('.section-wrapper'),
          start: startValue,
          end: endValue,
          scrub: true,
          pin: pinVal,
          onUpdate: (self) => {
            sectionObj.setAttribute('scroll-direction-data', self.direction === 1 ? 'down' : 'up');
          },
        },
      });
      stepsItems.forEach((itemEle, indexEle) => {
        const progressEle = itemEle.querySelector('[step-progress-bar]');
        const progressCircle = itemEle.querySelector('[step-progress-circle]');
        //if(indexEle > 0){
        stepByStepTimeLine
          .fromTo(
            progressEle,
            { '--progressPath': 1 },
            {
              '--progressPath': 0,
              onStart: () => {
                if (indexEle > 0) {
                  stepsImageItem[indexEle - 1].classList.remove('image-active');
                }
                stepsImageItem[indexEle].classList.add('image-active');
              },
              onReverseComplete: () => {
                if (indexEle > 0) {
                  stepsImageItem[indexEle].classList.remove('image-active');
                  stepsImageItem[indexEle - 1].classList.add('image-active');
                }
                itemEle.classList.remove('active');
              },
            }
          )
          .fromTo(
            progressCircle,
            { scale: 0 },
            {
              scale: 1,
              onComplete: () => {
                itemEle.classList.add('active');
              },
              onUpdate: () => {
                const directionScroll = sectionObj.getAttribute('scroll-direction-data');
                if (directionScroll == 'up') {
                  itemEle.classList.remove('active');
                }
              },
            }
          );
        //}
      });
      setTimeout(() => ScrollTrigger.refresh(true), 1000);
      return () => {
        ScrollTrigger.getById(triggerId)?.kill();
        stepByStepTimeLine.kill();
      };
    });
  }
  featuredImagesCards(sectionObj) {
    let matchMediaCheck = gsap.matchMedia();
    matchMediaCheck.add('(min-width: 768px)', () => {
      const triggerId = this.scrollTriggerIdGet(sectionObj);
      const featureImageCards = sectionObj.querySelectorAll('[fetaured-image-card]');
      const headerTitle = sectionObj.querySelector('[fetaured-image-header]');
      const headerDescription = sectionObj.querySelector('[fetaured-image-description]');
      const animationType = sectionObj.getAttribute('data-animation-visible');
      let onceanimation = false;
      if (animationType == 'once') {
        onceanimation = true;
      }
      let clipPathStyleIntial = 'circle(0% at 50% 50%)';
      let clipPathStyle = 'circle(150% at 50% 50%)';
      gsap.set(featureImageCards, { opacity: 0.07, clipPath: clipPathStyleIntial });
      ScrollTrigger.getAll().forEach((st) => {
        if (sectionObj.contains(st.trigger)) st.kill();
      });
      const featuredCards = gsap.timeline({
        scrollTrigger: {
          id: triggerId,
          trigger: sectionObj.closest('.section-wrapper'),
          start: 'top 25%',
          end: '+=1',
          toggleActions: 'play none reverse none',
          once: onceanimation,
        },
      });
      if (headerTitle) {
        featuredCards.to(headerTitle, {
          scale: 0.8,
          duration: 0.5,
        });
      }
      if (headerDescription) {
        featuredCards.to(
          headerDescription,
          {
            scale: 1.1,
            duration: 0.5,
          },
          '<'
        );
      }
      if (headerTitle) {
        featuredCards.to(headerTitle, {
          opacity: 0,
          duration: 0.5,
          ease: 'power1.out',
        });
      }
      if (headerDescription) {
        featuredCards.to(
          headerDescription,
          {
            opacity: 0,
            duration: 0.5,
            ease: 'power1.out',
          },
          '<'
        );
      }
      featuredCards.to(
        featureImageCards,
        {
          duration: 0.8,
          opacity: 1,
          scale: 1,
          clipPath: clipPathStyle,
          delay: function () {
            return gsap.utils.random(0, 1);
          },
          ease: 'expo.out',
        },
        '<'
      );
      setTimeout(() => ScrollTrigger.refresh(true), 1000);
      return () => {
        ScrollTrigger.getById(triggerId)?.kill();
        featuredCards.kill();
      };
    });
  }
  scrollTriggerIdGet(sectionElementsData) {
    const sectionIdScrollTrigger = sectionElementsData.getAttribute('data-section');
    return sectionIdScrollTrigger;
  }
}

class AnimateOnView {
  constructor(selector = '[animate-element]') {
    this.selector = selector;
    this.elements = [];
    this.observer = null;
    this.init();
  }
  init() {
    this.observer = new IntersectionObserver(this.handleIntersect.bind(this), {
      threshold: 0.2,
    });
    this.observeNewElements();
  }
  observeNewElements() {
    this.observer.disconnect();
    this.elements = document.querySelectorAll(this.selector);
    this.elements.forEach((el) => this.observer.observe(el));
  }

  handleIntersect(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        this.animate(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
  }
  animateFirstLoad() {
    this.elements = document.querySelectorAll(this.selector);
    this.elements.forEach((el) => this.animateIntial(el));
  }
  animateIntial(el) {
    const type = el.dataset.animate || 'fade-up';
    const delay = parseFloat(el.dataset.delay) || 0;
    switch (type) {
      case 'fade-up':
        gsap.set(el, { opacity: 0, y: 50, duration: 0 });
        break;
      case 'fade-in':
        gsap.set(el, { opacity: 0, duration: 0 });
        break;
      case 'fade-right':
        gsap.set(el, { opacity: 0, x: -50, duration: 0 });
        break;
      case 'fade-up-large':
        gsap.set(el, { yPercent: 90, opacity: 0, duration: 0 });
        break;
      case 'media-zoom-effect':
        const media = el.querySelector('img, video');
        if (media) {
          const initialScale = parseFloat(el.dataset.zoomInitial) || 1.1;
          gsap.set(media, { scale: initialScale });
        }
        break;
    }
  }
  animate(el) {
    const type = el.dataset.animate || 'fade-up';
    const delay = parseFloat(el.dataset.delay) || 0;
    const duration = parseFloat(el.dataset.duration) || 0.5;
    switch (type) {
      case 'fade-up':
        gsap.to(el, { opacity: 1, y: 0, duration: duration, delay: delay, ease: 'power1.in' });
        break;
      case 'fade-in':
        gsap.to(el, { opacity: 1, duration: duration, delay: 0.5, ease: 'power1.out' });
        break;
      case 'fade-right':
        gsap.to(el, { opacity: 1, x: 0, duration: duration, delay: 0.2, ease: 'power1.in' });
        break;
      case 'fade-up-large':
        gsap.to(el, { opacity: 1, yPercent: 0, duration: duration, delay: delay, ease: 'power1.out' });
        break;
      case 'media-zoom-effect':
        const media = el.querySelector('img, video');
        if (media) {
          const finalScale = parseFloat(el.dataset.zoomFinal) || 1.0;
          const duration = parseFloat(el.dataset.zoomDuration) || 1.0;
          const ease = el.dataset.zoomEase || 'power2.out';
          gsap.to(media, {
            scale: finalScale,
            duration: duration,
            delay: delay,
            ease: ease,
          });
        }
        break;
    }
  }
}
