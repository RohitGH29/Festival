/**
 * Dynamic Greeting & Wish Personalization Engine
 * Manages personalized state, wish pool shuffling, style categories, entity decoding,
 * and 100% consistent bilingual UI toggling (Hindi <-> English).
 */
(function(window) {
  'use strict';

  // Helper: Decode decimal (&#2369;) and hex (&#x0941;) HTML entities and double-escaped entities
  function decodeEntities(str) {
    if (typeof str !== 'string' || !str) return str || '';
    if (!/&#\d+|&#x[0-9a-fA-F]+;|&amp;#/i.test(str)) return str;
    return str
      .replace(/&amp;#(\d+);/g, function(_, dec) { return String.fromCodePoint(parseInt(dec, 10)); })
      .replace(/&amp;#x([0-9a-fA-F]+);/gi, function(_, hex) { return String.fromCodePoint(parseInt(hex, 16)); })
      .replace(/&#(\d+);/g, function(_, dec) { return String.fromCodePoint(parseInt(dec, 10)); })
      .replace(/&#x([0-9a-fA-F]+);/gi, function(_, hex) { return String.fromCodePoint(parseInt(hex, 16)); });
  }

  // Recursively decode all strings within config
  function deepDecode(obj) {
    if (typeof obj === 'string') return decodeEntities(obj);
    if (Array.isArray(obj)) return obj.map(deepDecode);
    if (obj && typeof obj === 'object') {
      for (var k in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, k)) {
          obj[k] = deepDecode(obj[k]);
        }
      }
    }
    return obj;
  }

  // Walk DOM text nodes, placeholders, and aria-labels to repair any Blogger-encoded entities
  function decodeDOMEntities(root) {
    try {
      var r = root || document.body;
      if (!r) return;
      var walker = document.createTreeWalker(r, NodeFilter.SHOW_TEXT, null, false);
      var node;
      while ((node = walker.nextNode())) {
        if (node.nodeValue && /&#\d+|&#x[0-9a-fA-F]+;|&amp;#/i.test(node.nodeValue)) {
          node.nodeValue = decodeEntities(node.nodeValue);
        }
      }
      var inputs = r.querySelectorAll('input[placeholder], textarea[placeholder]');
      inputs.forEach(function(el) {
        var ph = el.getAttribute('placeholder');
        if (ph && /&#\d+|&#x[0-9a-fA-F]+;|&amp;#/i.test(ph)) {
          el.setAttribute('placeholder', decodeEntities(ph));
        }
      });
      var ariaEls = r.querySelectorAll('[aria-label]');
      ariaEls.forEach(function(el) {
        var al = el.getAttribute('aria-label');
        if (al && /&#\d+|&#x[0-9a-fA-F]+;|&amp;#/i.test(al)) {
          el.setAttribute('aria-label', decodeEntities(al));
        }
      });
    } catch (e) {
      // Graceful fallback for older environments
    }
  }

  window.decodeEntities = decodeEntities;
  window.decodeDOMEntities = decodeDOMEntities;

  var GreetingEngine = {
    config: null,
    currentLang: 'hi',
    currentStyle: 'all',
    currentWishIndex: 0,
    state: {
      to: '',
      from: ''
    },

    init: function(config) {
      this.config = deepDecode(config || {});

      // Fix mobile viewport if host theme injected desktop width=1100
      this.enforceMobileViewport();

      var params = window.FestivalSanitizer ? window.FestivalSanitizer.getQueryParams() : { to: '', from: '', lang: '', style: 'all' };

      this.currentLang = params.lang || (this.config.defaultLanguage || 'hi');
      this.currentStyle = params.style || 'all';
      this.state.to = params.to || '';
      this.state.from = params.from || '';

      // Clean up any entities existing in the DOM from host template
      decodeDOMEntities(document.body);

      this.setupDOM();
      this.bindEvents();
      this.render();
    },

    enforceMobileViewport: function() {
      try {
        var metaVp = document.querySelector('meta[name="viewport"]');
        if (metaVp) {
          metaVp.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover');
        } else {
          metaVp = document.createElement('meta');
          metaVp.name = 'viewport';
          metaVp.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover';
          document.head.appendChild(metaVp);
        }
      } catch (e) {}
    },

    setupDOM: function() {
      var toInput = document.getElementById('fest-input-to');
      var fromInput = document.getElementById('fest-input-from');
      if (toInput && this.state.to) toInput.value = this.state.to;
      if (fromInput && this.state.from) fromInput.value = this.state.from;

      var self = this;
      var langButtons = document.querySelectorAll('.lang-pill');
      langButtons.forEach(function(btn) {
        if (btn.getAttribute('data-lang') === self.currentLang) {
          btn.classList.add('active');
          btn.setAttribute('aria-checked', 'true');
        } else {
          btn.classList.remove('active');
          btn.setAttribute('aria-checked', 'false');
        }
      });

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

      var form = document.getElementById('fest-personalize-form');
      if (form) {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          self.handlePersonalizeSubmit();
        });
      }

      var shuffleBtn = document.getElementById('fest-btn-shuffle');
      if (shuffleBtn) {
        shuffleBtn.addEventListener('click', function() {
          self.shuffleWish();
        });
      }

      var copyWishBtn = document.getElementById('fest-btn-copy-wish');
      if (copyWishBtn) {
        copyWishBtn.addEventListener('click', function() {
          self.copyCurrentWish();
        });
      }

      var makeOwnBtn = document.getElementById('fest-btn-make-own');
      if (makeOwnBtn) {
        makeOwnBtn.addEventListener('click', function() {
          self.handleMakeForSomeoneElse();
        });
      }

      var langButtons = document.querySelectorAll('.lang-pill');
      langButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
          var targetLang = btn.getAttribute('data-lang');
          self.setLanguage(targetLang);
        });
      });

      var styleButtons = document.querySelectorAll('.style-pill');
      styleButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
          var targetStyle = btn.getAttribute('data-style');
          self.setStyle(targetStyle);
        });
      });

      var recipientChips = document.querySelectorAll('.recipient-chip');
      recipientChips.forEach(function(chip) {
        chip.addEventListener('click', function() {
          var targetStyle = chip.getAttribute('data-target-style');
          if (targetStyle) self.setStyle(targetStyle);
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

      this.updateUrlParams();

      if (window.FestivalAnalytics) {
        window.FestivalAnalytics.logEvent('name_entered', {
          festival: this.config.slug,
          has_from: Boolean(this.state.from),
          lang: this.currentLang
        });
      }

      this.render();

      if (window.triggerFestConfetti) {
        window.triggerFestConfetti();
      }

      var card = document.getElementById('fest-greeting-card');
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },

    handleMakeForSomeoneElse: function() {
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
      } catch (e) {}
    },

    setLanguage: function(lang) {
      if (!this.config || !this.config.languages || !this.config.languages[lang]) return;
      this.currentLang = lang;
      this.currentWishIndex = 0;

      var langButtons = document.querySelectorAll('.lang-pill');
      langButtons.forEach(function(btn) {
        if (btn.getAttribute('data-lang') === lang) {
          btn.classList.add('active');
          btn.setAttribute('aria-checked', 'true');
        } else {
          btn.classList.remove('active');
          btn.setAttribute('aria-checked', 'false');
        }
      });

      this.updateUrlParams();

      if (window.FestivalAnalytics) {
        window.FestivalAnalytics.logEvent('language_changed', {
          language: lang,
          festival: this.config.slug
        });
      }

      // Propagate language update to interactive engine (quiz, diya) and countdown
      if (window.FestivalInteractive && window.FestivalInteractive.setLanguage) {
        window.FestivalInteractive.setLanguage(lang);
      }
      if (window.FestivalCountdown && window.FestivalCountdown.setLanguage) {
        window.FestivalCountdown.setLanguage(lang);
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
        var defaultText = this.currentLang === 'hi'
          ? 'आपके और आपके परिवार के लिए यह पावन पर्व सुख, शांति और समृद्धि लाए!'
          : 'May this festive season bring joy, health, and prosperity to you and your loved ones!';
        return { text: defaultText, category: 'all' };
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
        void wishEl.offsetWidth;
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
        wishEl.textContent = decodeEntities(wishObj.text);
      }
    },

    copyCurrentWish: function() {
      var wishObj = this.getCurrentWish();
      var textToCopy = decodeEntities(wishObj.text);
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
      } catch (e) {}
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
      toast.textContent = decodeEntities(message);
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
      var festivalGreeting = langData.greetingName || (isHindi ? (this.config.nameHindi || 'शुभ पर्व') : (this.config.name + ' Greeting'));

      if (titleEl) {
        titleEl.textContent = decodeEntities(festivalGreeting);
      }

      if (nameEl) {
        if (this.state.to) {
          nameEl.textContent = decodeEntities((isHindi ? 'प्रिय ' : 'Dearest ') + this.state.to + '!');
        } else {
          nameEl.textContent = decodeEntities(isHindi ? 'आपके और आपके परिवार के लिए!' : 'For You & Your Family!');
        }
        nameEl.style.display = 'block';
      }

      // 2. Render Sender line
      if (fromEl) {
        if (this.state.from) {
          fromEl.textContent = decodeEntities(isHindi ? ('— ' + this.state.from + ' की ओर से सप्रेम') : ('— With warm wishes from ' + this.state.from));
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
          wishText: decodeEntities(this.getCurrentWish().text),
          festivalName: isHindi ? (this.config.nameHindi || this.config.name) : this.config.name,
          festivalGreeting: decodeEntities(festivalGreeting)
        });
      }

      decodeDOMEntities(document.body);
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
      var toInput = document.getElementById('fest-input-to');
      var fromInput = document.getElementById('fest-input-from');
      var createBtn = document.getElementById('fest-btn-create');
      var shuffleBtn = document.getElementById('fest-btn-shuffle');
      var copyBtn = document.getElementById('fest-btn-copy-wish');
      var makeOwnBtn = document.getElementById('fest-btn-make-own');
      var statusBtn = document.getElementById('fest-btn-status-image');
      var boxTitle = document.querySelector('.fest-box-title');
      var badgeEl = document.querySelector('.fest-card-badge');
      var waBtn = document.getElementById('fest-btn-share-whatsapp');

      if (toLabel) toLabel.textContent = decodeEntities(isHindi ? 'यह शुभकामना किसके लिए है? (नाम)' : 'Enter Recipient Name (e.g., Priya)');
      if (fromLabel) fromLabel.textContent = decodeEntities(isHindi ? 'आपका नाम (वैकल्पिक)' : 'Your Name (Optional)');
      if (toInput) toInput.placeholder = decodeEntities(isHindi ? 'उदा. राहुल या प्रिया' : 'e.g., Rahul or Priya');
      if (fromInput) fromInput.placeholder = decodeEntities(isHindi ? 'आपका नाम' : 'Your name');
      if (boxTitle) boxTitle.textContent = decodeEntities(isHindi ? '2 सेकंड में अपने नाम से बनाएं' : 'Personalize This Greeting in 2 Seconds');

      if (createBtn) createBtn.innerHTML = decodeEntities(isHindi ? '<span>✨</span> <span>व्यक्तिगत कार्ड बनाएं</span>' : '<span>✨</span> <span>Generate Personalized Greeting</span>');
      if (shuffleBtn) shuffleBtn.innerHTML = decodeEntities(isHindi ? '<span>🔀</span> <span>नया संदेश</span>' : '<span>🔀</span> <span>Shuffle Wish</span>');
      if (copyBtn) copyBtn.innerHTML = decodeEntities(isHindi ? '<span>📋</span> <span>कॉपी करें</span>' : '<span>📋</span> <span>Copy Text</span>');
      if (makeOwnBtn) makeOwnBtn.innerHTML = decodeEntities(isHindi ? '<span>✍️</span> <span>अपने नाम से दूसरों के लिए बनाएं</span>' : '<span>✍️</span> <span>Make One for Someone Else</span>');
      if (statusBtn) statusBtn.innerHTML = decodeEntities(isHindi ? '<span>📸</span> <span>व्हाट्सएप स्टेटस इमेज डाउनलोड करें (HD)</span>' : '<span>📸</span> <span>Download WhatsApp Status Image (HD)</span>');

      if (waBtn) {
        var waSpan = waBtn.querySelector('span');
        if (waSpan) waSpan.textContent = decodeEntities(isHindi ? 'व्हाट्सएप पर भेजें 🚀' : 'Share on WhatsApp 🚀');
      }

      if (badgeEl) {
        var festName = isHindi ? (this.config.nameHindi || this.config.name) : this.config.name;
        badgeEl.textContent = decodeEntities(isHindi ? ('✨ पावन ' + festName + ' 2026 ✨') : ('✨ Auspicious ' + festName + ' 2026 ✨'));
      }

      // Update Daily Celebration Counter Pill
      var counterLabel = document.getElementById('fest-counter-lbl');
      if (counterLabel) {
        counterLabel.textContent = decodeEntities(isHindi ? 'शुभकामनाएं आज भेजी गईं' : 'wishes shared today');
      }

      // Update Secondary Share Grid labels
      var shareGrid = document.querySelector('.fest-share-secondary-row');
      if (shareGrid) {
        var btnWeb = document.getElementById('fest-btn-web-share');
        var btnTg = document.getElementById('fest-btn-share-telegram');
        var btnFb = document.getElementById('fest-btn-share-facebook');
        var btnCopy = document.getElementById('fest-btn-copy-link');

        if (btnWeb) btnWeb.querySelector('span:last-child').textContent = decodeEntities(isHindi ? 'शेयर' : 'Share');
        if (btnTg) btnTg.querySelector('span:last-child').textContent = decodeEntities(isHindi ? 'टेलीग्राम' : 'Telegram');
        if (btnFb) btnFb.querySelector('span:last-child').textContent = decodeEntities(isHindi ? 'फेसबुक' : 'Facebook');
        if (btnCopy) btnCopy.querySelector('span:last-child').textContent = decodeEntities(isHindi ? 'लिंक कॉपी' : 'Copy Link');
      }

      // Update Recipient Category Chips
      var recipientChips = document.querySelectorAll('.recipient-chip');
      var chipNamesHindi = {
        'all': 'सभी संदेश 🌟',
        'family': 'परिवार 👨‍👩‍👧‍👦',
        'friends': 'मित्र 🤝',
        'formal': 'ऑफिस 💼',
        'traditional': 'धार्मिक 🙏'
      };
      var chipNamesEn = {
        'all': 'All Wishes 🌟',
        'family': 'Family 👨‍👩‍👧‍👦',
        'friends': 'Friends 🤝',
        'formal': 'Office 💼',
        'traditional': 'Devotional 🙏'
      };
      recipientChips.forEach(function(chip) {
        var s = chip.getAttribute('data-target-style');
        if (s) {
          chip.textContent = decodeEntities(isHindi ? (chipNamesHindi[s] || s) : (chipNamesEn[s] || s));
        }
      });

      // Update Style Navigation Pills
      var stylePills = document.querySelectorAll('.style-pill');
      var styleNamesHindi = {
        'all': 'लोकप्रिय',
        'traditional': 'पारंपरिक',
        'family': 'परिवार',
        'friends': 'मित्र',
        'formal': 'औपचारिक',
        'shayari': 'शायरी'
      };
      var styleNamesEn = {
        'all': 'Popular',
        'traditional': 'Traditional',
        'family': 'For Family',
        'friends': 'For Friends',
        'formal': 'Formal',
        'shayari': 'Shayari'
      };
      stylePills.forEach(function(pill) {
        var s = pill.getAttribute('data-style');
        if (s) {
          pill.textContent = decodeEntities(isHindi ? (styleNamesHindi[s] || s) : (styleNamesEn[s] || s));
        }
      });

      // Update WhatsApp Channel Community CTA
      var channelTitle = document.querySelector('.fest-channel-cta h4');
      var channelDesc = document.querySelector('.fest-channel-cta p');
      var channelBtn = document.querySelector('.btn-join-channel span');
      if (channelTitle) {
        channelTitle.textContent = decodeEntities(isHindi
          ? '🔔 शुभ मुहूर्त व शुभकामनाओं के लिए जुड़ें'
          : '🔔 Never Miss a Festival Muhurat or Wish!');
      }
      if (channelDesc) {
        channelDesc.textContent = decodeEntities(isHindi
          ? 'हमारे निःशुल्क व्हाट्सएप चैनल से जुड़ें और पाएं पावन मुहूर्त, प्रेरक विचार व HD ग्रीटिंग कार्ड्स सीधे अपने फोन पर।'
          : 'Join our free WhatsApp channel to receive auspicious muhurat reminders, devotional quotes, and HD greeting cards directly on your phone.');
      }
      if (channelBtn) {
        channelBtn.textContent = decodeEntities(isHindi ? '📲 व्हाट्सएप चैनल से जुड़ें' : '📲 Join WhatsApp Channel');
      }

      // Update Upcoming Festivals Section Title
      var carouselTitle = document.querySelector('.fest-carousel-title');
      if (carouselTitle) {
        carouselTitle.textContent = decodeEntities(isHindi ? 'आगामी पावन पर्व' : 'Upcoming Auspicious Festivals');
      }

      // Update FAQ Section Title
      var faqTitle = document.querySelector('.fest-faq-section-title');
      if (faqTitle) {
        faqTitle.textContent = decodeEntities(isHindi ? 'अक्सर पूछे जाने वाले प्रश्न (FAQ)' : 'Frequently Asked Questions (FAQ)');
      }

      decodeDOMEntities(document.body);
    }
  };

  // Automated Real-Time Mutation Observer to keep all text clean of Blogger entities
  if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
    try {
      var entityObserver = new MutationObserver(function(mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var m = mutations[i];
          if (m.type === 'characterData' && m.target && /&#\d+|&#x[0-9a-fA-F]+;|&amp;#/i.test(m.target.nodeValue)) {
            m.target.nodeValue = decodeEntities(m.target.nodeValue);
          } else if (m.addedNodes && m.addedNodes.length) {
            for (var j = 0; j < m.addedNodes.length; j++) {
              var n = m.addedNodes[j];
              if (n.nodeType === 1 || n.nodeType === 3) decodeDOMEntities(n);
            }
          }
        }
      });
      if (document.body) {
        entityObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
      } else {
        document.addEventListener('DOMContentLoaded', function() {
          entityObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
        });
      }
    } catch (e) {}
  }

  window.FestivalGreeting = GreetingEngine;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = GreetingEngine;
  }
})(typeof window !== 'undefined' ? window : this);
