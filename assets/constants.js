window.theme = window.theme || {};
window.Shopify = window.Shopify || {};

const ON_CHANGE_DEBOUNCE_TIMER = 400;

const PUB_SUB_EVENTS = {
  cartUpdate: 'cart-update',
  quantityUpdate: 'quantity-update',
  optionValueSelectionChange: 'option-value-selection-change',
  variantChange: 'variant-change',
  cartError: 'cart-error',
};

theme.createScrollObserver = function (element, callback) {
  if (!element || typeof callback !== 'function') {
    throw new Error('Invalid arguments: Please provide an element and a callback function.');
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        callback(entry.isIntersecting);
      });
    },
    { threshold: 0.3 } // Adjust this value for sensitivity (e.g., 0.1 = 10% visibility)
  );

  observer.observe(element);

  return () => observer.disconnect(); // Return a function to stop observing
}
theme.SwiperSliderInit = function (element, properties) {
  const sliderInit = new Swiper(element, properties);
  return sliderInit;
};
theme.onMobileSizeChange = function (callback, breakpoint = 767) {
  function checkSize() {
    callback(window.innerWidth <= breakpoint);
  }

  checkSize();

  window.addEventListener("resize", checkSize);
};


theme.config = {
  extractedPopover: null,
};

theme.utils = {
  fetchConfig: (type = 'json') => {
    return {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: `application/${type}` },
    };
  },
  postLink: (path, options) => {
    options = options || {};
    const method = options['method'] || 'post';
    const params = options['parameters'] || {};

    const form = document.createElement('form');
    form.setAttribute('method', method);
    form.setAttribute('action', path);

    for (const key in params) {
      const hiddenField = document.createElement('input');
      hiddenField.setAttribute('type', 'hidden');
      hiddenField.setAttribute('name', key);
      hiddenField.setAttribute('value', params[key]);
      form.appendChild(hiddenField);
    }
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }
};
theme.Currency = {
  formatMoney: (cents, format = '') => {
    if (typeof cents === 'string') {
      cents = cents.replace('.', '');
    }
    const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/,
      formatString = format || window.themeVariables.settings.moneyFormat;
    function defaultTo(value2, defaultValue) {
      return value2 == null || value2 !== value2 ? defaultValue : value2;
    }
    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = defaultTo(precision, 2);
      thousands = defaultTo(thousands, ',');
      decimal = defaultTo(decimal, '.');
      if (isNaN(number) || number == null) {
        return 0;
      }
      number = (number / 100).toFixed(precision);
      let parts = number.split('.'),
        dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
        centsAmount = parts[1] ? decimal + parts[1] : '';
      return dollarsAmount + centsAmount;
    }

    function formatWithDelimitersRR(number, precision, thousands, decimal) {
      precision = defaultTo(precision, 2);
      thousands = defaultTo(thousands, ',');
      decimal = defaultTo(decimal, '.');
      if (isNaN(number) || number == null) {
        return 0;
      }
      // Convert the number to a fixed precision
      number = number.toFixed(precision);
      // Split into dollars and cents
      let parts = number.split('.');
      // Format the dollars part with a custom thousands separator
      let dollarsAmount = parts[0].replace(/(\d{2})(\d{3})/, '$1' + thousands + '$2');
      // Add the cents part
      let centsAmount = parts[1] ? decimal + parts[1] : '';
      return dollarsAmount + centsAmount;
    }
    let value = '';
    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_space_separator':
        value = formatWithDelimiters(cents, 2, ' ', '.');
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_with_apostrophe_separator':
        value = formatWithDelimiters(cents, 2, "'", '.');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;
      case 'amount_no_decimals_with_space_separator':
        value = formatWithDelimiters(cents, 0, ' ');
        break;
      case 'amount_no_decimals_with_apostrophe_separator':
        value = formatWithDelimiters(cents, 0, "'");
        break;
      default:
        value = formatWithDelimiters(cents, 2);
        break;
    }
    if (formatString.indexOf('with_comma_separator') !== -1) {
      return formatString.replace(placeholderRegex, value);
    } else {
      return formatString.replace(placeholderRegex, value);
    }
  },
};



