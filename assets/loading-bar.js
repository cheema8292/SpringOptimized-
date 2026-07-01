    if (!customElements.get('loading-bar')) {
      class LoadingBar extends HTMLElement {
        constructor() {
          super();
          window.addEventListener('beforeunload', () => {
          document.body.classList.add('unloading');
        });

        window.addEventListener('DOMContentLoaded', () => {
          // gsap.to(this, {
          //   opacity: 0,
          //   duration: 0.7,
          //   onComplete: () => {
          //     gsap.set(this, { visibility: "hidden" });
          //   }
          // });
          gsap.to(this, {
            duration: 1,
            autoAlpha: 0, // animates opacity to 0 and sets visibility to hidden
            ease: "power2.out"
          }); 

          document.body.classList.add('loaded');
          document.dispatchEvent(new CustomEvent('page:loaded'));
        });

        window.addEventListener('pageshow', (event) => {
          // Removes unload class when returning to page via history
          if (event.persisted) {
            document.body.classList.remove('unloading');
          }
        });
      }
    }
    customElements.define('loading-bar', LoadingBar);
  }