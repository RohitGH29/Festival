/**
 * Sanitizer & Security Engine for Festival Greeting Cards
 * Ensures 100% XSS-safe query param parsing and rendering.
 * Strictly uses textContent, caps length at 30 chars, and permits only letters, spaces, and Indic scripts.
 */
(function(window) {
  'use strict';

  var Sanitizer = {
    // Regex allows Unicode letters, marks (combining diacritics / matras), and spaces.
    // Covers Latin, Devanagari (\u0900-\u097F), Bengali (\u0980-\u09FF), Gurmukhi (\u0A00-\u0A7F),
    // Gujarati (\u0A80-\u0AFF), Oriya (\u0B00-\u0B7F), Tamil (\u0B80-\u0BFF), Telugu (\u0C00-\u0C7F),
    // Kannada (\u0C80-\u0CFF), Malayalam (\u0D00-\u0D7F).
    SAFE_NAME_REGEX: /^[\p{L}\p{M}\s'-]+$/u,

    /**
     * Sanitizes an input string to be strictly text-only, max 30 chars.
     * @param {string} rawString
     * @param {number} [maxLength=30]
     * @returns {string} Sanitized string
     */
    sanitizeName: function(rawString, maxLength) {
      if (!rawString || typeof rawString !== 'string') return '';
      maxLength = maxLength || 30;

      // 1. Remove dangerous control chars, tags, scripts, and brackets
      var cleaned = rawString
        .replace(/<[^>]*>/g, '') // remove HTML tags
        .replace(/[<>{}[\]\\\/^~`$+=|;:%"&]/g, '') // strip special code/injection characters
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // strip control chars
        .trim();

      // 2. Truncate to maximum characters
      if (cleaned.length > maxLength) {
        cleaned = cleaned.substring(0, maxLength).trim();
      }

      // 3. Keep only allowable characters (letters, Indic diacritics/matras, spaces, hyphens)
      try {
        // Unicode property escape check
        cleaned = cleaned.split('').filter(function(char) {
          return /^[\p{L}\p{M}\s'-]$/u.test(char);
        }).join('');
      } catch (e) {
        // Fallback for older regex engines: allow Latin + Indic range + space
        cleaned = cleaned.replace(/[^a-zA-Z\u0900-\u0D7F\s'-]/g, '');
      }

      // Collapse multiple consecutive spaces to a single space
      cleaned = cleaned.replace(/\s+/g, ' ');

      return cleaned;
    },

    /**
     * Parse and sanitize query parameters from current window.location.search or provided URL.
     * @param {string} [searchString]
     * @returns {Object} { to: string, from: string, lang: string, style: string }
     */
    getQueryParams: function(searchString) {
      var query = searchString !== undefined ? searchString : window.location.search;
      var params = {
        to: '',
        from: '',
        lang: '',
        style: 'all'
      };

      if (!query) return params;

      try {
        var urlParams = new URLSearchParams(query);

        if (urlParams.has('to')) {
          params.to = this.sanitizeName(urlParams.get('to'), 30);
        }
        if (urlParams.has('from')) {
          params.from = this.sanitizeName(urlParams.get('from'), 30);
        }
        if (urlParams.has('lang')) {
          var rawLang = urlParams.get('lang').toLowerCase().trim();
          var allowedLangs = ['en', 'hi', 'mr', 'gu', 'ta', 'te', 'bn', 'kn', 'pa'];
          if (allowedLangs.indexOf(rawLang) !== -1) {
            params.lang = rawLang;
          }
        }
        if (urlParams.has('style')) {
          var rawStyle = urlParams.get('style').toLowerCase().trim();
          var allowedStyles = ['all', 'traditional', 'family', 'friends', 'formal', 'shayari'];
          if (allowedStyles.indexOf(rawStyle) !== -1) {
            params.style = rawStyle;
          }
        }
      } catch (e) {
        console.warn('URLSearchParams error:', e);
      }

      return params;
    },

    /**
     * Safely update an element's textContent (strictly preventing innerHTML XSS)
     * @param {HTMLElement|string} target Element or selector
     * @param {string} text Plain text to insert
     */
    safeSetText: function(target, text) {
      var el = typeof target === 'string' ? document.querySelector(target) : target;
      if (el) {
        el.textContent = text;
      }
    },

    /**
     * Escapes text for safe inclusion in HTML attributes if needed
     * @param {string} str
     * @returns {string}
     */
    escapeHtml: function(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  };

  window.FestivalSanitizer = Sanitizer;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Sanitizer;
  }
})(typeof window !== 'undefined' ? window : this);
