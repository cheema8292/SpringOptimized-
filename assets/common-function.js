class HTMLUpdateUtility {
  /**
   * Used to swap an HTML node with a new node.
   * The new node is inserted as a previous sibling to the old node, the old node is hidden, and then the old node is removed.
   *
   * The function currently uses a double buffer approach, but this should be replaced by a view transition once it is more widely supported https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
   */
  static viewTransition(oldNode, newContent, preProcessCallbacks = [], postProcessCallbacks = []) {
    preProcessCallbacks?.forEach((callback) => callback(newContent));

    const newNodeWrapper = document.createElement('div');
    HTMLUpdateUtility.setInnerHTML(newNodeWrapper, newContent.outerHTML);
    const newNode = newNodeWrapper.firstChild;

    // dedupe IDs
    const uniqueKey = Date.now();
    oldNode.querySelectorAll('[id], [form]').forEach((element) => {
      element.id && (element.id = `${element.id}-${uniqueKey}`);
      element.form && element.setAttribute('form', `${element.form.getAttribute('id')}-${uniqueKey}`);
    });

    oldNode.parentNode.insertBefore(newNode, oldNode);
    oldNode.style.display = 'none';

    postProcessCallbacks?.forEach((callback) => callback(newNode));

    setTimeout(() => oldNode.remove(), 500);
  }

  // Sets inner HTML and reinjects the script tags to allow execution. By default, scripts are disabled when using element.innerHTML.
  static setInnerHTML(element, html) {
    element.innerHTML = html;
    element.querySelectorAll('script').forEach((oldScriptTag) => {
      const newScriptTag = document.createElement('script');
      Array.from(oldScriptTag.attributes).forEach((attribute) => {
        newScriptTag.setAttribute(attribute.name, attribute.value);
      });
      newScriptTag.appendChild(document.createTextNode(oldScriptTag.innerHTML));
      oldScriptTag.parentNode.replaceChild(newScriptTag, oldScriptTag);
    });
  }
}
class CartPerformance {
  static #metric_prefix = "cart-performance"

  static createStartingMarker(benchmarkName) {
    const metricName = `${CartPerformance.#metric_prefix}:${benchmarkName}`
    return performance.mark(`${metricName}:start`);
  }

  static measureFromEvent(benchmarkName, event) {
    const metricName = `${CartPerformance.#metric_prefix}:${benchmarkName}`
    const startMarker = performance.mark(`${metricName}:start`, {
      startTime: event.timeStamp
    });

    const endMarker = performance.mark(`${metricName}:end`);

    performance.measure(
      metricName,
      `${metricName}:start`,
      `${metricName}:end`
    );
  }

  static measureFromMarker(benchmarkName, startMarker) {
    const metricName = `${CartPerformance.#metric_prefix}:${benchmarkName}`
    const endMarker = performance.mark(`${metricName}:end`);

    performance.measure(
      metricName,
      startMarker.name,
      `${metricName}:end`
    );
  }

  static measure(benchmarkName, callback) {
    const metricName = `${CartPerformance.#metric_prefix}:${benchmarkName}`
    const startMarker = performance.mark(`${metricName}:start`);

    callback();

    const endMarker = performance.mark(`${metricName}:end`);

    performance.measure(
      metricName,
      `${metricName}:start`,
      `${metricName}:end`
    );
  }
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: `application/${type}` },
  };
}

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

/*
 * Product-card hover videos.
 * The <video> is rendered with `preload="none"` and NO autoplay, so the file is
 * not downloaded until the shopper actually hovers the card (previously autoplay
 * forced every card video to download on page load, slowing the home page and
 * mega-menu). We start playback on hover and pause/reset on leave. Uses event
 * delegation on document so it also covers cards injected later (mega-menu,
 * quick-view, infinite scroll).
 */
(function () {
  function cardVideo(target) {
    const card = target && target.closest && target.closest('.product-card-media');
    if (!card) return null;
    return card.querySelector('.product-card-hover-video');
  }

  document.addEventListener('mouseover', (event) => {
    const video = cardVideo(event.target);
    if (video && video.paused) {
      video.muted = true;
      video.playsInline = true;
      video.play().catch(() => {});
    }
  });

  document.addEventListener('mouseout', (event) => {
    const card = event.target.closest && event.target.closest('.product-card-media');
    // Ignore moves between children of the same card.
    if (!card || (event.relatedTarget && card.contains(event.relatedTarget))) return;
    const video = card.querySelector('.product-card-hover-video');
    if (video && !video.paused) {
      video.pause();
      video.currentTime = 0;
    }
  });
})();