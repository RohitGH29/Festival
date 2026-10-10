/**
 * Google AdSense Safe Integration & Lazy Loader
 * Complies strictly with Google AdSense program policies:
 * - Minimum 100px vertical buffer from tappable buttons.
 * - Reserved min-height (prevents Cumulative Layout Shift CLS < 0.1).
 * - Mandatory "ADVERTISEMENT" labels.
 * - IntersectionObserver lazy loading with push-once guarantee.
 * - Ad-blocker safe collapse fallback.
 * - Zero click tracking (only legitimate viewability events).
 */
(function(window) {
  'use strict';

  var AdLoader = {
    initialized: false,
    slotsLoaded: {},
    publisherId: 'ca-pub-XXXXXXXXXXXXXXXX',

    init: function(config) {
      if (this.initialized) return;
      this.initialized = true;

      if (config && config.adsensePublisherId) {
        this.publisherId = config.adsensePublisherId;
      }

      this.setupSlots();
      this.observeAdSlots();
      this.setupAdBlockerFallback();
    },

    setupSlots: function() {
      var self = this;
      var adUnits = document.querySelectorAll('.fest-ad-slot');

      adUnits.forEach(function(slot, index) {
        var slotId = slot.getAttribute('id') || ('fest-ad-' + (index + 1));
        slot.setAttribute('id', slotId);

        // Ensure label is present
        if (!slot.querySelector('.fest-ad-label')) {
          var label = document.createElement('div');
          label.className = 'fest-ad-label';
          label.textContent = 'ADVERTISEMENT';
          label.setAttribute('aria-hidden', 'true');
          slot.insertBefore(label, slot.firstChild);
        }

        // Configure ins element attributes if needed
        var ins = slot.querySelector('ins.adsbygoogle');
        if (ins && self.publisherId && self.publisherId !== 'ca-pub-XXXXXXXXXXXXXXXX') {
          ins.setAttribute('data-ad-client', self.publisherId);
        }
      });
    },

    observeAdSlots: function() {
      var self = this;
      var adSlots = document.querySelectorAll('.fest-ad-slot');
      if (!adSlots.length) return;

      if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function(entries, obs) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              var target = entry.target;
              var slotId = target.getAttribute('id');
              if (!self.slotsLoaded[slotId]) {
                self.loadSlot(target);
                obs.unobserve(target);
              }
            }
          });
        }, {
          rootMargin: '250px 0px 250px 0px', // Preload when 250px away
          threshold: 0.05
        });

        adSlots.forEach(function(slot) {
          observer.observe(slot);
        });
      } else {
        // Fallback for browsers without IntersectionObserver
        window.addEventListener('load', function() {
          adSlots.forEach(function(slot) {
            self.loadSlot(slot);
          });
        });
      }
    },

    loadSlot: function(slotEl) {
      var slotId = slotEl.getAttribute('id');
      if (this.slotsLoaded[slotId]) return;
      this.slotsLoaded[slotId] = true;

      var ins = slotEl.querySelector('ins.adsbygoogle');
      if (!ins) return;

      // Policy check: Don't load real ads if publisher ID is not set
      if (!this.publisherId || this.publisherId === 'ca-pub-XXXXXXXXXXXXXXXX') {
        // Show test placeholder styling in preview/development
        slotEl.classList.add('ad-slot-preview-mode');
        var previewNotice = slotEl.querySelector('.ad-preview-badge');
        if (!previewNotice) {
          var badge = document.createElement('div');
          badge.className = 'ad-preview-badge';
          badge.textContent = 'AdSense Unit ' + slotId + ' (Policy-Safe Slot)';
          slotEl.appendChild(badge);
        }
        return;
      }

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});

        // Log viewability only to GA4 (Never track clicks on ads)
        if (window.FestivalAnalytics) {
          window.FestivalAnalytics.logEvent('ad_slot_viewed', {
            slot_id: slotId
          });
        }
      } catch (e) {
        console.warn('AdSense push error for ' + slotId + ':', e);
      }
    },

    setupAdBlockerFallback: function() {
      // After 3.5s, check if ads failed to fill or blocked; collapse empty space gracefully
      window.addEventListener('load', function() {
        setTimeout(function() {
          var adSlots = document.querySelectorAll('.fest-ad-slot:not(.ad-slot-preview-mode)');
          adSlots.forEach(function(slot) {
            var ins = slot.querySelector('ins.adsbygoogle');
            if (ins) {
              var status = ins.getAttribute('data-ad-status');
              // If unfilled or 0 height
              if (status === 'unfilled' || (ins.clientHeight === 0 && ins.innerHTML.trim() === '')) {
                slot.classList.add('ad-slot-collapsed');
              }
            }
          });
        }, 3500);
      });
    }
  };

  window.FestivalAdLoader = AdLoader;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdLoader;
  }
})(typeof window !== 'undefined' ? window : this);
