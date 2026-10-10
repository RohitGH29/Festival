/**
 * Privacy-First GA4 & Viral Growth Analytics Engine
 * Tracks viral coefficient, shares, interaction events without logging PII (names).
 * AdSense policy safe: viewability only for ad slots, NEVER tracking ad clicks.
 */
(function(window) {
  'use strict';

  var Analytics = {
    measurementId: '',
    consentGranted: false,
    viralData: {
      hasFrom: false,
      sharesCount: 0,
      visitorId: ''
    },

    init: function(config) {
      if (config && config.ga4MeasurementId) {
        this.measurementId = config.ga4MeasurementId;
      }

      this.checkConsent();
      this.initVisitorId();
      this.initScrollTracking();

      // Check if came via a viral share (presence of 'from' parameter)
      var params = window.FestivalSanitizer ? window.FestivalSanitizer.getQueryParams() : {};
      if (params.from && params.from.length > 0) {
        this.viralData.hasFrom = true;
        this.logEvent('viral_visit_received', {
          festival: config ? config.slug : 'festival',
          has_recipient: Boolean(params.to)
        });
      }

      // Check return visit
      var lastVisit = localStorage.getItem('fest_last_visit');
      var now = Date.now();
      if (lastVisit) {
        var daysSince = Math.round((now - parseInt(lastVisit, 10)) / (1000 * 60 * 60 * 24));
        if (daysSince >= 1) {
          this.logEvent('return_visit', { days_since_last: daysSince });
        }
      }
      localStorage.setItem('fest_last_visit', now.toString());
    },

    initVisitorId: function() {
      var vid = localStorage.getItem('fest_vid');
      if (!vid) {
        vid = 'v_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
        localStorage.setItem('fest_vid', vid);
      }
      this.viralData.visitorId = vid;
    },

    checkConsent: function() {
      var savedConsent = localStorage.getItem('fest_cookie_consent');
      this.consentGranted = savedConsent === 'granted';
    },

    setConsent: function(granted) {
      this.consentGranted = Boolean(granted);
      localStorage.setItem('fest_cookie_consent', granted ? 'granted' : 'denied');
      if (granted && window.gtag) {
        window.gtag('consent', 'update', {
          'analytics_storage': 'granted'
        });
      }
    },

    /**
     * Anonymize any name input to protect user privacy (never logs real names to GA4)
     */
    hashString: function(str) {
      if (!str) return 'none';
      var hash = 0;
      for (var i = 0; i < str.length; i++) {
        var char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return 'len_' + str.length + '_h' + Math.abs(hash).toString(16).substring(0, 6);
    },

    /**
     * Log an event to GA4 safely
     */
    logEvent: function(eventName, eventParams) {
      eventParams = eventParams || {};
      eventParams.timestamp = new Date().toISOString();

      // Safely ensure no names are leaked
      if (eventParams.to) delete eventParams.to;
      if (eventParams.from) delete eventParams.from;

      // Add viral context
      eventParams.is_viral_referral = this.viralData.hasFrom;

      if (window.gtag && (this.consentGranted || !this.measurementId.startsWith('G-XXX'))) {
        try {
          window.gtag('event', eventName, eventParams);
        } catch (e) {
          // Silent catch
        }
      }

      // Also dispatch synthetic window event for local analytics/debugging
      var customEvt;
      if (typeof CustomEvent === 'function') {
        customEvt = new CustomEvent('fest_event', { detail: { name: eventName, params: eventParams } });
      } else {
        customEvt = document.createEvent('CustomEvent');
        customEvt.initCustomEvent('fest_event', true, true, { name: eventName, params: eventParams });
      }
      window.dispatchEvent(customEvt);
    },

    /**
     * Track scroll depth milestone (25%, 50%, 75%, 90%)
     */
    initScrollTracking: function() {
      var tracked = { 25: false, 50: false, 75: false, 90: false };
      var self = this;

      window.addEventListener('scroll', function() {
        var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollHeight <= 0) return;
        var percent = Math.round((window.scrollY / scrollHeight) * 100);

        [25, 50, 75, 90].forEach(function(mark) {
          if (percent >= mark && !tracked[mark]) {
            tracked[mark] = true;
            self.logEvent('scroll_depth', { depth_percent: mark });
          }
        });
      }, { passive: true });
    }
  };

  window.FestivalAnalytics = Analytics;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Analytics;
  }
})(typeof window !== 'undefined' ? window : this);
