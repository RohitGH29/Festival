/**
 * Viral Sharing Engine
 * High-conversion WhatsApp deep linking, Web Share API, multi-platform sharing,
 * and device haptics/vibrations.
 */
(function(window) {
  'use strict';

  var ShareEngine = {
    currentShareData: {
      url: window.location.href,
      text: '',
      title: '',
      to: '',
      from: '',
      lang: 'en'
    },

    init: function() {
      this.bindButtons();
    },

    updateLinks: function(data) {
      this.currentShareData.to = data.to || '';
      this.currentShareData.from = data.from || '';
      this.currentShareData.lang = data.lang || 'en';

      // Build target personalized URL
      var cleanUrl = window.location.origin + window.location.pathname;
      var params = new URLSearchParams();
      if (this.currentShareData.to) params.set('to', this.currentShareData.to);
      if (this.currentShareData.from) params.set('from', this.currentShareData.from);
      if (this.currentShareData.lang && this.currentShareData.lang !== 'en') params.set('lang', this.currentShareData.lang);

      var shareUrl = cleanUrl + (params.toString() ? '?' + params.toString() : '');
      this.currentShareData.url = shareUrl;

      // Construct high-converting viral message text
      var isHindi = this.currentShareData.lang === 'hi';
      var emoji = data.festivalName.toLowerCase().indexOf('diwali') !== -1 ? '🪔✨' : '🏹🚩';
      var headline = data.festivalGreeting || ('Happy ' + data.festivalName);
      var text = '';

      if (this.currentShareData.to && this.currentShareData.from) {
        if (isHindi) {
          text = emoji + ' ' + headline + ' ' + this.currentShareData.to + '! ' + this.currentShareData.from + ' ने आपके लिए एक खास पावन शुभकामना भेजी है। यहां देखें 👉 ' + shareUrl;
        } else {
          text = emoji + ' ' + headline + ', ' + this.currentShareData.to + '! ' + this.currentShareData.from + ' sent you a personalized festive greeting. Open it here 👉 ' + shareUrl;
        }
      } else if (this.currentShareData.to) {
        if (isHindi) {
          text = emoji + ' ' + headline + ' ' + this.currentShareData.to + '! आपके लिए एक खास शुभकामना संदेश 👉 ' + shareUrl;
        } else {
          text = emoji + ' ' + headline + ', ' + this.currentShareData.to + '! A special festive greeting just for you 👉 ' + shareUrl;
        }
      } else {
        if (isHindi) {
          text = emoji + ' ' + headline + '! आपके और आपके पूरे परिवार के लिए एक खास शुभकामना संदेश 👉 ' + shareUrl;
        } else {
          text = emoji + ' ' + headline + '! Wishing you and your family joy and prosperity 👉 ' + shareUrl;
        }
      }

      this.currentShareData.text = text;
      this.currentShareData.title = headline;

      // Update native WhatsApp button link
      var waBtn = document.getElementById('fest-btn-share-whatsapp');
      if (waBtn) {
        var waUrl = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(text);
        waBtn.setAttribute('href', waUrl);
      }
    },

    bindButtons: function() {
      var self = this;

      // Primary WhatsApp button
      var waBtn = document.getElementById('fest-btn-share-whatsapp');
      if (waBtn) {
        waBtn.addEventListener('click', function(e) {
          self.triggerVibrate();
          self.trackShare('whatsapp');
        });
      }

      // Native Web Share API button
      var webShareBtn = document.getElementById('fest-btn-web-share');
      if (webShareBtn) {
        // Show only if navigator.share is supported
        if (navigator.share) {
          webShareBtn.style.display = 'inline-flex';
          webShareBtn.addEventListener('click', function() {
            self.triggerVibrate();
            self.trackShare('web_share_api');
            navigator.share({
              title: self.currentShareData.title,
              text: self.currentShareData.text,
              url: self.currentShareData.url
            }).then(function() {
              if (window.FestivalAnalytics) {
                window.FestivalAnalytics.logEvent('share_success', { method: 'web_share_api' });
              }
            }).catch(function(err) {
              // User dismissed or share failed
            });
          });
        } else {
          webShareBtn.style.display = 'none';
        }
      }

      // Telegram button
      var tgBtn = document.getElementById('fest-btn-share-telegram');
      if (tgBtn) {
        tgBtn.addEventListener('click', function(e) {
          e.preventDefault();
          self.triggerVibrate();
          self.trackShare('telegram');
          var tgUrl = 'https://t.me/share/url?url=' + encodeURIComponent(self.currentShareData.url) + '&text=' + encodeURIComponent(self.currentShareData.text);
          window.open(tgUrl, '_blank', 'noopener,noreferrer');
        });
      }

      // Facebook button
      var fbBtn = document.getElementById('fest-btn-share-facebook');
      if (fbBtn) {
        fbBtn.addEventListener('click', function(e) {
          e.preventDefault();
          self.triggerVibrate();
          self.trackShare('facebook');
          var fbUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(self.currentShareData.url);
          window.open(fbUrl, '_blank', 'noopener,noreferrer');
        });
      }

      // X (Twitter) button
      var twBtn = document.getElementById('fest-btn-share-twitter');
      if (twBtn) {
        twBtn.addEventListener('click', function(e) {
          e.preventDefault();
          self.triggerVibrate();
          self.trackShare('twitter');
          var twUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(self.currentShareData.text);
          window.open(twUrl, '_blank', 'noopener,noreferrer');
        });
      }

      // Copy Link button
      var copyBtn = document.getElementById('fest-btn-copy-link');
      if (copyBtn) {
        copyBtn.addEventListener('click', function() {
          self.triggerVibrate();
          self.trackShare('copy_link');
          self.copyToClipboard(self.currentShareData.url);
        });
      }

      // SMS button
      var smsBtn = document.getElementById('fest-btn-share-sms');
      if (smsBtn) {
        smsBtn.addEventListener('click', function() {
          self.triggerVibrate();
          self.trackShare('sms');
          window.location.href = 'sms:?body=' + encodeURIComponent(self.currentShareData.text);
        });
      }
    },

    triggerVibrate: function() {
      if (navigator.vibrate) {
        try {
          navigator.vibrate([40, 50, 40]);
        } catch (e) {
          // Ignore
        }
      }
    },

    trackShare: function(method) {
      if (window.FestivalAnalytics) {
        window.FestivalAnalytics.logEvent('share_click', {
          method: method,
          has_to_name: Boolean(this.currentShareData.to),
          has_from_name: Boolean(this.currentShareData.from),
          lang: this.currentShareData.lang
        });
      }
    },

    copyToClipboard: function(text) {
      var self = this;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
          self.notifyToast(self.currentShareData.lang === 'hi' ? 'लिंक कॉपी हो गया! दोस्तों को भेजें 📋' : 'Link copied to clipboard! Share with friends 📋');
        }).catch(function() {
          self.fallbackCopy(text);
        });
      } else {
        self.fallbackCopy(text);
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
        this.notifyToast(this.currentShareData.lang === 'hi' ? 'लिंक कॉपी हो गया! 📋' : 'Link copied! 📋');
      } catch (e) {
        // Fallback error
      }
      document.body.removeChild(ta);
    },

    notifyToast: function(msg) {
      if (window.FestivalGreeting && window.FestivalGreeting.showToast) {
        window.FestivalGreeting.showToast(msg);
      }
    }
  };

  window.FestivalShare = ShareEngine;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShareEngine;
  }
})(typeof window !== 'undefined' ? window : this);
