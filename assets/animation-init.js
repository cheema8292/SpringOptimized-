document.addEventListener('DOMContentLoaded', () => {
  const classInitTheme = new animationsMoonLiteTheme();
  const themeSectionFetched = document.querySelectorAll('[animatedSection]');
  if (themeSectionFetched.length > 0) {
    themeSectionFetched.forEach((section, index) => {
      let methodTheme = section.getAttribute('methodSection')?.trim();
      if (methodTheme && typeof classInitTheme[methodTheme] === 'function') {
        classInitTheme[methodTheme](section);
      }
    });
  }
  const animateElements = document.querySelectorAll('[animate-element]');
  if (animateElements.length > 0) {
    const animateView = new AnimateOnView();
    animateView.animateFirstLoad();
    animateView.observeNewElements();
  }
});
window.addEventListener('resize', () => {
  const themeSectionFetched = document.querySelectorAll('[animatedSection]');
  if (themeSectionFetched.length > 0) {
    setTimeout(() => ScrollTrigger.refresh(true), 2500);
  }
});
