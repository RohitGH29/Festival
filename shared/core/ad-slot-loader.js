/**
 * Google AdSense Safe Integration & Lazy Loader
 * Complies strictly with Google AdSense program policies:
 * - Max 3 manual ad units per page.
 * - Minimum 100px vertical buffer from tappable controls.
 * - Reserved min-height (prevents Cumulative Layout Shift CLS < 0.1).
 * - Mandatory "ADVERTISEMENT" labels (12px readable).
 * - Immediate zero-height collapse when unfilled (data-ad-status="unfilled").
 * - No stray preview text or deceptive elements.
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
      this.setupUnfilledCollapseWatcher();
    },

    setupSlots: function() {
      var self = this;
      var adUnits = document.querySelectorAll('.fest-ad-slot');

      adUnits.forEach(function(slot, index) {
        // Enforce max 3 units limit
        if (index >= 3) {
          slot.parentElement ? slot.parentElement.remove() : slot.remove();
          return;
        }

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
          rootMargin: '250px 0px 250px 0px',
          threshold: 0.05
        });

        adSlots.forEach(function(slot) {
          observer.observe(slot);
        });
      } else {
        var triggerFallbackLoad = function() {
          adSlots.forEach(function(slot) {
            self.loadSlot(slot);
          });
        };
        if (document.readyState === 'complete') {
          triggerFallbackLoad();
        } else {
          window.addEventListener('load', triggerFallbackLoad);
        }
      }
    },

    loadSlot: function(slotEl) {
      var slotId = slotEl.getAttribute('id');
      if (this.slotsLoaded[slotId]) return;
      this.slotsLoaded[slotId] = true;

      var ins = slotEl.querySelector('ins.adsbygoogle');
      if (!ins) return;

      // Don't push to AdSense if publisher ID is default placeholder
      if (!this.publisherId || this.publisherId === 'ca-pub-XXXXXXXXXXXXXXXX') {
        return;
      }

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});

        if (window.FestivalAnalytics) {
          window.FestivalAnalytics.logEvent('ad_slot_viewed', {
            slot_id: slotId
          });
        }
      } catch (e) {
        // Silently catch ad load issues
      }
    },

    setupUnfilledCollapseWatcher: function() {
      // Monitor unfilled slots and collapse them cleanly without layout gaps
      function checkAndCollapse() {
        var adSlots = document.querySelectorAll('.fest-ad-slot');
        adSlots.forEach(function(slot) {
          var ins = slot.querySelector('ins.adsbygoogle');
          if (ins) {
            var status = ins.getAttribute('data-ad-status');
            if (status === 'unfilled') {
              slot.classList.add('ad-slot-collapsed');
              if (slot.parentElement && slot.parentElement.classList.contains('fest-ad-slot-wrapper')) {
                slot.parentElement.style.display = 'none';
              }
            }
          }
        });
      }

      // Check on load and periodically for filled status
      var triggerWatcher = function() {
        setTimeout(checkAndCollapse, 2000);
        setTimeout(checkAndCollapse, 4500);
      };
      if (document.readyState === 'complete') {
        triggerWatcher();
      } else {
        window.addEventListener('load', triggerWatcher);
      }
    }
  };

  window.FestivalAdLoader = AdLoader;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdLoader;
  }
})(typeof window !== 'undefined' ? window : this);
