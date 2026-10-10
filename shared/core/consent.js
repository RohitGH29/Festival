/**
 * Privacy & Consent Engine
 * DPDP-friendly, lightweight consent banner.
 * Does not block essential content or greeting flow.
 */
(function(window) {
  'use strict';

  var Consent = {
    init: function() {
      var saved = localStorage.getItem('fest_cookie_consent');
      if (!saved) {
        this.renderBanner();
      }
    },

    renderBanner: function() {
      var banner = document.getElementById('fest-consent-banner');
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'fest-consent-banner';
        banner.className = 'fest-consent-banner';
        banner.setAttribute('role', 'region');
        banner.setAttribute('aria-label', 'Privacy and Cookies Notice');
        banner.innerHTML = '<div class="consent-content">' +
          '<span>🍪 We use minimal cookies & analytics to measure greetings and ensure ad safety. ' +
          '<a href="#privacy-policy" class="consent-link">Privacy Policy</a></span>' +
          '<div class="consent-actions">' +
          '<button type="button" id="fest-btn-consent-accept" class="btn-consent-accept">Got it</button>' +
          '</div></div>';
        document.body.appendChild(banner);
      }

      banner.style.display = 'block';

      var acceptBtn = document.getElementById('fest-btn-consent-accept');
      if (acceptBtn) {
        acceptBtn.addEventListener('click', function() {
          banner.style.display = 'none';
          localStorage.setItem('fest_cookie_consent', 'granted');
          if (window.FestivalAnalytics) {
            window.FestivalAnalytics.setConsent(true);
          }
        });
      }
    }
  };

  window.FestivalConsent = Consent;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Consent;
  }
})(typeof window !== 'undefined' ? window : this);
