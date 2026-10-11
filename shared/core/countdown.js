/**
 * Festival Countdown Engine
 * Calculates real-time difference to festival date and shubh muhurat in IST.
 * Tabular-nums digits, zero layout shift, and localized Hindi/English labels.
 */
(function(window) {
  'use strict';

  function decodeEntities(str) {
    if (typeof str !== 'string' || !str) return str || '';
    if (!/&#\d+|&#x[0-9a-fA-F]+;|&amp;#/i.test(str)) return str;
    return str
      .replace(/&amp;#(\d+);/g, function(_, dec) { return String.fromCodePoint(parseInt(dec, 10)); })
      .replace(/&amp;#x([0-9a-fA-F]+);/gi, function(_, hex) { return String.fromCodePoint(parseInt(hex, 16)); })
      .replace(/&#(\d+);/g, function(_, dec) { return String.fromCodePoint(parseInt(dec, 10)); })
      .replace(/&#x([0-9a-fA-F]+);/gi, function(_, hex) { return String.fromCodePoint(parseInt(hex, 16)); });
  }

  var Countdown = {
    config: null,
    timerInterval: null,
    currentLang: 'hi',

    init: function(config) {
      this.config = config || {};
      var params = window.FestivalSanitizer ? window.FestivalSanitizer.getQueryParams() : {};
      this.currentLang = params.lang || (this.config.defaultLanguage || 'hi');

      if (!config || !config.dates || !config.dates.primaryDate) return;
      this.start();
      this.updateLabels();
    },

    setLanguage: function(lang) {
      this.currentLang = lang;
      this.updateLabels();
    },

    updateLabels: function() {
      var isHindi = this.currentLang === 'hi';
      var festName = isHindi ? (this.config.nameHindi || this.config.name || 'पर्व') : (this.config.name || 'Festival');
      var year = (this.config.dates && this.config.dates.year) || '2026';

      var titleEl = document.querySelector('.fest-countdown-title');
      if (titleEl) {
        titleEl.textContent = decodeEntities(isHindi ? (festName + ' ' + year + ' काउंटडाउन ⏳') : (festName + ' ' + year + ' Countdown ⏳'));
      }

      var labels = isHindi ? ['दिन', 'घंटे', 'मिनट', 'सेकंड'] : ['Days', 'Hours', 'Mins', 'Secs'];
      var lblEls = document.querySelectorAll('.fest-timer-lbl');
      if (lblEls.length === 4) {
        lblEls[0].textContent = decodeEntities(labels[0]);
        lblEls[1].textContent = decodeEntities(labels[1]);
        lblEls[2].textContent = decodeEntities(labels[2]);
        lblEls[3].textContent = decodeEntities(labels[3]);
      }

      if (typeof window.decodeDOMEntities === 'function') {
        window.decodeDOMEntities(document.getElementById('fest-countdown-container'));
      }
    },

    start: function() {
      var self = this;
      var targetDateStr = (this.config && this.config.dates && this.config.dates.primaryDate) || '';
      var targetDate = Date.parse(targetDateStr);
      if (isNaN(targetDate)) {
        targetDate = new Date(targetDateStr.replace(/-/g, '/').replace('T', ' ')).getTime();
      }
      if (isNaN(targetDate)) {
        var y = (this.config && this.config.dates && this.config.dates.year) || 2026;
        targetDate = new Date(y, 9, 20, 0, 0, 0).getTime();
      }
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
        var isHindi = self.currentLang === 'hi';
        var festName = isHindi ? (self.config.nameHindi || self.config.name || 'पर्व') : (self.config.name || 'Festival');

        if (diff <= 0) {
          var oneDayMs = 24 * 60 * 60 * 1000;
          if (Math.abs(diff) < oneDayMs) {
            if (bannerEl) {
              bannerEl.innerHTML = '✨ <strong>' +
                (isHindi ? ('आज पावन ' + festName + ' है! हार्दिक शुभकामनाएं!') : ("It's " + festName + " today! Wishing you joy and triumph!")) +
                '</strong> ✨';
              bannerEl.style.display = 'block';
            }
            if (container) container.classList.add('fest-day-today');
          } else {
            if (bannerEl) {
              bannerEl.innerHTML = isHindi ? '🙏 आप सभी को पावन पर्व की मंगलमय शुभकामनाएं!' : '🙏 Wishing you peace and happiness throughout this festive season!';
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
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.timerInterval = setInterval(update, 1000);
    }
  };

  window.FestivalCountdown = Countdown;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Countdown;
  }
})(typeof window !== 'undefined' ? window : this);
