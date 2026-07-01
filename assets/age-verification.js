if (!customElements.get('age-verifier')) {
  class ageVerifier extends HTMLElement {
    constructor() {
      super();
      this.section = this.closest('.shopify-section');
      this.ageVerificationDisplayMode = this.dataset.displayMode;
      this.submit_btn = this.querySelector('[data-submit-age]');
      this.isAccount = this.dataset.isAccount;
      this.accountHolder = this.dataset.accountHolder;
      this.submit_incorrect = this.querySelector('[data-submit-incorrect]');
      if (this.submit_btn) {
        this.submit_btn.addEventListener('click', this.ageSubmitted.bind(this));
      }
      this.frequency = this.dataset.frequency;
      // this.submit_incorrect.addEventListener('click', this.ageSubmittedIncorrect.bind(this));
    }
    connectedCallback() {
      if (Shopify.designMode) {
        this.section.addEventListener('shopify:section:select', () => this.open());
        this.section.addEventListener('shopify:section:deselect', () => this.close());
        this.section.addEventListener('shopify:section:unload', () => this.close());
        this.section.addEventListener('shopify:section:load', () => this.open());
      }
      this.init();
    }
    init() {
      const ageVerified = this.getCookie('is_age_verified') === 'age_verified';
      const isChallengePage = window.location.pathname.includes('/challenge');

      if (Shopify.designMode || this.ageVerificationDisplayMode !== 'enable' || ageVerified || isChallengePage) {
        return; // Exit early if not applicable
      }

      // Show popup only for account holder rules
      if (this.accountHolder === 'true' && this.isAccount === 'false') {
        this.classList.add('show');
        document.body.classList.add('overflow-hidden');
      }

      // Show popup for non-account holders
      if (this.accountHolder !== 'true') {
        this.classList.add('show');
        document.body.classList.add('overflow-hidden');
      }
    }
    open() {
      this.classList.add('show');
      document.body.classList.add('overflow-hidden');
    }

    close() {
      this.classList.remove('show');
      document.body.classList.remove('overflow-hidden');
    }

    ageSubmittedIncorrect() {
      this.querySelector('[data-age-verifier]').classList.remove('hidden');
      this.querySelector('[data-age-declined]').classList.add('hidden');
      this.querySelector('[data-age-verifier] button').focus();
    }

    ageSubmitted() {
      this.classList.remove('show');
      document.body.classList.remove('overflow-hidden');
      var date = new Date();
      date.setTime(date.getTime() + parseInt(this.frequency) * 24 * 60 * 60 * 1000);
      this.setCookieValue('is_age_verified', 'age_verified', this.frequency);
      document.dispatchEvent(new CustomEvent('ageVerified', { detail: { verified: true } }));
    }
    getCookie(name) {
      let cname = name + '=';
      let decodedCookie = decodeURIComponent(document.cookie);
      let cookies = decodedCookie.split(';');
      for (let c of cookies) {
        c = c.trim();
        if (c.indexOf(cname) === 0) {
          return c.substring(cname.length, c.length);
        }
      }
      return '';
    }

    setCookieValue(name, value, expireDays) {
      let d = new Date();
      d.setTime(d.getTime() + parseInt(expireDays) * 24 * 60 * 60 * 1000);
      let expires = 'expires=' + d.toUTCString();
      document.cookie = name + '=' + value + ';' + expires + ';path=/';
    }
  }
  customElements.define('age-verifier', ageVerifier);
}
