/**
 * Dynamic Greeting & Wish Personalization Engine
 * Manages personalized state, wish pool shuffling, style categories, and instant multi-language toggling.
 */
(function(window) {
  'use strict';

  var GreetingEngine = {
    config: null,
    currentLang: 'en',
    currentStyle: 'all',
    currentWishIndex: 0,
    state: {
      to: '',
      from: ''
    },

    init: function(config) {
      this.config = config || {};
      var params = window.FestivalSanitizer ? window.FestivalSanitizer.getQueryParams() : { to: '', from: '', lang: 'en', style: 'all' };

      this.currentLang = params.lang || (this.config.defaultLanguage || 'en');
      this.currentStyle = params.style || 'all';
      this.state.to = params.to || '';
      this.state.from = params.from || '';

      this.setupDOM();
      this.bindEvents();
      this.render();
    },

    setupDOM: function() {
      // Set initial input values if present
      var toInput = document.getElementById('fest-input-to');
      var fromInput = document.getElementById('fest-input-from');
      if (toInput && this.state.to) toInput.value = this.state.to;
      if (fromInput && this.state.from) fromInput.value = this.state.from;

      // Update active language pill
      var langButtons = document.querySelectorAll('.lang-pill');
      var self = this;
      langButtons.forEach(function(btn) {
        if (btn.getAttribute('data-lang') === self.currentLang) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      // Update active style pill
      var styleButtons = document.querySelectorAll('.style-pill');
      styleButtons.forEach(function(btn) {
        if (btn.getAttribute('data-style') === self.currentStyle) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    },

    bindEvents: function() {
      var self = this;

      // Personalize form submit
      var form = document.getElementById('fest-personalize-form');
      if (form) {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          self.handlePersonalizeSubmit();
        });
      }

      // Shuffle wish button
      var shuffleBtn = document.getElementById('fest-btn-shuffle');
      if (shuffleBtn) {
        shuffleBtn.addEventListener('click', function() {
          self.shuffleWish();
        });
      }

      // Copy wish button
      var copyWishBtn = document.getElementById('fest-btn-copy-wish');
      if (copyWishBtn) {
        copyWishBtn.addEventListener('click', function() {
          self.copyCurrentWish();
        });
      }

      // "Make one for someone else" button
      var makeOwnBtn = document.getElementById('fest-btn-make-own');
      if (makeOwnBtn) {
        makeOwnBtn.addEventListener('click', function() {
          self.handleMakeForSomeoneElse();
        });
      }

      // Language switcher pills
      var langButtons = document.querySelectorAll('.lang-pill');
      langButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
          var targetLang = btn.getAttribute('data-lang');
          self.setLanguage(targetLang);
        });
      });

      // Style category pills
      var styleButtons = document.querySelectorAll('.style-pill');
      styleButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
          var targetStyle = btn.getAttribute('data-style');
          self.setStyle(targetStyle);
        });
      });

      // Quick recipient selector chips (Family, Friends, Boss, Teacher)
      var recipientChips = document.querySelectorAll('.recipient-chip');
      recipientChips.forEach(function(chip) {
        chip.addEventListener('click', function() {
          var targetStyle = chip.getAttribute('data-target-style');
          if (targetStyle) self.setStyle(targetStyle);
          // Highlight chip
          recipientChips.forEach(function(c) { c.classList.remove('active'); });
          chip.classList.add('active');
        });
      });
    },

    handlePersonalizeSubmit: function() {
      var toInput = document.getElementById('fest-input-to');
      var fromInput = document.getElementById('fest-input-from');

      var rawTo = toInput ? toInput.value : '';
      var rawFrom = fromInput ? fromInput.value : '';

      this.state.to = window.FestivalSanitizer ? window.FestivalSanitizer.sanitizeName(rawTo, 30) : rawTo.trim();
      this.state.from = window.FestivalSanitizer ? window.FestivalSanitizer.sanitizeName(rawFrom, 30) : rawFrom.trim();

      // Update URL query parameters without reloading
      this.updateUrlParams();

      // Track analytics
      if (window.FestivalAnalytics) {
        window.FestivalAnalytics.logEvent('name_entered', {
          festival: this.config.slug,
          has_from: Boolean(this.state.from),
          lang: this.currentLang
        });
      }

      // Re-render
      this.render();

      // Trigger celebratory golden sparkle particles
      if (window.triggerFestConfetti) {
        window.triggerFestConfetti();
      }

      // Smooth scroll to card
      var card = document.getElementById('fest-greeting-card');
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },

    handleMakeForSomeoneElse: function() {
      // Growth loop: recipient becomes the sender!
      var previousTo = this.state.to;
      this.state.from = previousTo;
      this.state.to = '';

      var toInput = document.getElementById('fest-input-to');
      var fromInput = document.getElementById('fest-input-from');
      if (toInput) {
        toInput.value = '';
        toInput.focus();
      }
      if (fromInput) {
        fromInput.value = previousTo;
      }

      // Switch view to form if card was in personalized display mode
      var formSection = document.getElementById('fest-personalize-section');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      if (window.FestivalAnalytics) {
        window.FestivalAnalytics.logEvent('make_your_own_click', {
          festival: this.config.slug
        });
      }

      this.render();
    },

    updateUrlParams: function() {
      try {
        var url = new URL(window.location.href);
        if (this.state.to) {
          url.searchParams.set('to', this.state.to);
        } else {
          url.searchParams.delete('to');
        }

        if (this.state.from) {
          url.searchParams.set('from', this.state.from);
        } else {
          url.searchParams.delete('from');
        }

        url.searchParams.set('lang', this.currentLang);
        if (this.currentStyle !== 'all') {
          url.searchParams.set('style', this.currentStyle);
        } else {
          url.searchParams.delete('style');
        }

        window.history.replaceState({}, '', url.toString());
      } catch (e) {
        // Fallback for older browsers
      }
    },

    setLanguage: function(lang) {
      if (!this.config || !this.config.languages || !this.config.languages[lang]) return;
      this.currentLang = lang;
      this.currentWishIndex = 0;

      // Update pills
      var langButtons = document.querySelectorAll('.lang-pill');
      langButtons.forEach(function(btn) {
        if (btn.getAttribute('data-lang') === lang) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      this.updateUrlParams();

      if (window.FestivalAnalytics) {
        window.FestivalAnalytics.logEvent('language_changed', {
          language: lang,
          festival: this.config.slug
        });
      }

      this.render();
    },

    setStyle: function(style) {
      this.currentStyle = style;
      this.currentWishIndex = 0;

      var styleButtons = document.querySelectorAll('.style-pill');
      styleButtons.forEach(function(btn) {
        if (btn.getAttribute('data-style') === style) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      this.updateUrlParams();
      this.renderWish();
    },

    getFilteredWishes: function() {
      var langData = (this.config.languages && this.config.languages[this.currentLang]) || {};
      var wishes = langData.wishes || [];

      if (!this.currentStyle || this.currentStyle === 'all') {
        return wishes;
      }

      var self = this;
      var filtered = wishes.filter(function(w) {
        return w.category === self.currentStyle;
      });

      return filtered.length > 0 ? filtered : wishes;
    },

    getCurrentWish: function() {
      var pool = this.getFilteredWishes();
      if (!pool || pool.length === 0) {
        return { text: 'May this festive season bring joy, health, and prosperity to you and your loved ones!', category: 'all' };
      }
      return pool[this.currentWishIndex % pool.length];
    },

    shuffleWish: function() {
      var pool = this.getFilteredWishes();
      if (pool.length > 1) {
        this.currentWishIndex = (this.currentWishIndex + 1) % pool.length;
      }

      var wishEl = document.getElementById('fest-card-wish');
      if (wishEl) {
        wishEl.classList.remove('fade-in-wish');
        void wishEl.offsetWidth; // Trigger reflow for animation
        wishEl.classList.add('fade-in-wish');
      }

      this.renderWish();

      if (window.FestivalAnalytics) {
        window.FestivalAnalytics.logEvent('wish_shuffled', {
          festival: this.config.slug,
          lang: this.currentLang,
          style: this.currentStyle
        });
      }
    },

    renderWish: function() {
      var wishObj = this.getCurrentWish();
      var wishEl = document.getElementById('fest-card-wish');
      if (wishEl) {
        wishEl.textContent = wishObj.text;
      }
    },

    copyCurrentWish: function() {
      var wishObj = this.getCurrentWish();
      var textToCopy = wishObj.text;
      var self = this;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(function() {
          self.showToast(self.currentLang === 'hi' ? 'शुभकामना कॉपी हो गई! 📋' : 'Wish copied to clipboard! 📋');
        }).catch(function() {
          self.fallbackCopy(textToCopy);
        });
      } else {
        self.fallbackCopy(textToCopy);
      }
    },

    fallbackCopy: function(text) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        this.showToast(this.currentLang === 'hi' ? 'शुभकामना कॉपी हो गई! 📋' : 'Wish copied! 📋');
      } catch (e) {
        // Failed
      }
      document.body.removeChild(ta);
    },

    showToast: function(message) {
      var toast = document.getElementById('fest-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'fest-toast';
        toast.className = 'fest-toast';
        document.body.appendChild(toast);
      }
      toast.textContent = message;
      toast.classList.add('visible');
      setTimeout(function() {
        toast.classList.remove('visible');
      }, 2500);
    },

    render: function() {
      var langData = (this.config.languages && this.config.languages[this.currentLang]) || {};
      var isHindi = this.currentLang === 'hi';

      // 1. Render Greeting Title
      var titleEl = document.getElementById('fest-card-title');
      var nameEl = document.getElementById('fest-card-name');
      var fromEl = document.getElementById('fest-card-from');
      var festivalGreeting = langData.greetingName || (this.config.name + ' Greeting');

      if (titleEl) {
        titleEl.textContent = festivalGreeting;
      }

      if (nameEl) {
        if (this.state.to) {
          nameEl.textContent = (isHindi ? 'प्रिय ' : 'Dearest ') + this.state.to + '!';
          nameEl.style.display = 'block';
        } else {
          nameEl.textContent = isHindi ? 'आपके और आपके परिवार के लिए!' : 'For You & Your Family!';
          nameEl.style.display = 'block';
        }
      }

      // 2. Render Sender line
      if (fromEl) {
        if (this.state.from) {
          fromEl.textContent = isHindi ? '— ' + this.state.from + ' की ओर से सप्रेम' : '— With love & warm wishes from ' + this.state.from;
          fromEl.style.display = 'block';
        } else {
          fromEl.style.display = 'none';
        }
      }

      // 3. Render current wish
      this.renderWish();

      // 4. Update UI labels and placeholders according to language
      this.updateLanguageTexts(langData, isHindi);

      // 5. Update Share Engine links with current personalization state
      if (window.FestivalShare) {
        window.FestivalShare.updateLinks({
          to: this.state.to,
          from: this.state.from,
          lang: this.currentLang,
          wishText: this.getCurrentWish().text,
          festivalName: this.config.name,
          festivalGreeting: festivalGreeting
        });
      }
    },

    updateLanguageTexts: function(langData, isHindi) {
      // Toggle editorial sections between EN and HI
      var enContent = document.querySelectorAll('.lang-content-en');
      var hiContent = document.querySelectorAll('.lang-content-hi');

      if (isHindi) {
        enContent.forEach(function(el) { el.style.display = 'none'; });
        hiContent.forEach(function(el) { el.style.display = 'block'; });
      } else {
        enContent.forEach(function(el) { el.style.display = 'block'; });
        hiContent.forEach(function(el) { el.style.display = 'none'; });
      }

      // Update Form button & labels
      var toLabel = document.getElementById('label-to');
      var fromLabel = document.getElementById('label-from');
      var createBtn = document.getElementById('fest-btn-create');
      var shuffleBtn = document.getElementById('fest-btn-shuffle');
      var makeOwnBtn = document.getElementById('fest-btn-make-own');

      if (toLabel) toLabel.textContent = isHindi ? 'यह शुभकामना किसके लिए है? (नाम)' : 'Enter Recipient Name (e.g., Priya)';
      if (fromLabel) fromLabel.textContent = isHindi ? 'आपका नाम (वैकल्पिक)' : 'Your Name (Optional)';
      if (createBtn) createBtn.textContent = isHindi ? '✨ व्यक्तिगत कार्ड बनाएं' : '✨ Generate Personalized Greeting';
      if (shuffleBtn) shuffleBtn.textContent = isHindi ? '🔀 नया संदेश देखें' : '🔀 Shuffle Wish';
      if (makeOwnBtn) makeOwnBtn.textContent = isHindi ? '✍️ अपने नाम से दूसरों के लिए बनाएं' : '✍️ Make One for Someone Else';
    }
  };

  window.FestivalGreeting = GreetingEngine;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = GreetingEngine;
  }
})(typeof window !== 'undefined' ? window : this);
