/**
 * Festival Countdown Engine
 * Calculates real-time difference to festival date and muhurat.
 * Accurate time calculations in IST (Asia/Kolkata).
 */
(function(window) {
  'use strict';

  var Countdown = {
    timerInterval: null,

    init: function(config) {
      if (!config || !config.dates || !config.dates.primaryDate) return;
      this.start(config.dates.primaryDate, config.name);
    },

    start: function(targetDateStr, festivalName) {
      var self = this;
      var targetDate = new Date(targetDateStr).getTime();
      if (isNaN(targetDate)) return;

      var container = document.getElementById('fest-countdown-container');
      if (!container) return;

      function update() {
        var now = new Date().getTime();
        var diff = targetDate - now;

        var daysEl = document.getElementById('cd-days');
        var hoursEl = document.getElementById('cd-hours');
        var minsEl = document.getElementById('cd-mins');
        var secsEl = document.getElementById('cd-secs');
        var bannerEl = document.getElementById('fest-live-banner');

        if (diff <= 0) {
          // If within the same day (within 24 hours after target date)
          var oneDayMs = 24 * 60 * 60 * 1000;
          if (Math.abs(diff) < oneDayMs) {
            if (bannerEl) {
              bannerEl.innerHTML = '✨ <strong>Today is the auspicious day of ' + (festivalName || 'the festival') + '!</strong> May joy and blessings fill your home! ✨';
              bannerEl.style.display = 'block';
            }
            if (container) container.classList.add('fest-day-today');
          } else {
            if (bannerEl) {
              bannerEl.innerHTML = '🙏 Wishing you peace and happiness throughout this festive season!';
              bannerEl.style.display = 'block';
            }
          }
          if (daysEl) daysEl.textContent = '00';
          if (hoursEl) hoursEl.textContent = '00';
          if (minsEl) minsEl.textContent = '00';
          if (secsEl) secsEl.textContent = '00';
          if (self.timerInterval) clearInterval(self.timerInterval);
          return;
        }

        var days = Math.floor(diff / (1000 * 60 * 60 * 24));
        var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        var secs = Math.floor((diff % (1000 * 60)) / 1000);

        if (daysEl) daysEl.textContent = (days < 10 ? '0' : '') + days;
        if (hoursEl) hoursEl.textContent = (hours < 10 ? '0' : '') + hours;
        if (minsEl) minsEl.textContent = (mins < 10 ? '0' : '') + mins;
        if (secsEl) secsEl.textContent = (secs < 10 ? '0' : '') + secs;
      }

      update();
      this.timerInterval = setInterval(update, 1000);
    }
  };

  window.FestivalCountdown = Countdown;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Countdown;
  }
})(typeof window !== 'undefined' ? window : this);
