/**
 * Interactive Festival Delight & Engagement Engine
 * Includes:
 * 1. Canvas Sparkles & Confetti (zero external libs, battery-safe auto-pause)
 * 2. Web Audio API Procedural Festive Temple Chime (zero audio files, tap-activated only)
 * 3. SVG Terracotta Diya Mini-Game (haptic vibration, realistic flickers, shareable completion)
 * 4. 5-Question Interactive Festival Trivia Quiz (100% localized Hindi & English, 52px targets, score share)
 * 5. Celebration Wishes Counter
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

  var Interactive = {
    config: null,
    audioCtx: null,
    audioEnabled: false,
    currentLang: 'hi',
    quizState: {
      currentIndex: 0,
      score: 0,
      answered: false
    },
    litDiyasCount: 0,

    init: function(config) {
      this.config = config || {};
      var params = window.FestivalSanitizer ? window.FestivalSanitizer.getQueryParams() : {};
      this.currentLang = params.lang || (this.config.defaultLanguage || 'hi');

      this.initParticles();
      this.initAudioButton();
      this.initDiyaGame();
      this.initQuiz();
      this.initCounter();
    },

    setLanguage: function(lang) {
      this.currentLang = lang;
      this.updateDiyaGameLanguage();
      this.renderQuizQuestion();
      this.updateAudioButtonText();
    },

    // --- 1. LIGHTWEIGHT CANVAS PARTICLES & CONFETTI ---
    initParticles: function() {
      var canvas = document.getElementById('fest-particles-canvas');
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      var particles = [];
      var animationFrame = null;
      var isRunning = false;
      var stopTimeout = null;

      function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      resize();
      window.addEventListener('resize', resize, { passive: true });

      var colors = ['#FFC857', '#FF9933', '#FF4500', '#FFF4DC', '#FFA500', '#FFD700'];

      function createParticle() {
        return {
          x: Math.random() * canvas.width,
          y: -10,
          size: Math.random() * 5 + 3,
          speedY: Math.random() * 2.8 + 1.2,
          speedX: (Math.random() - 0.5) * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 4,
          opacity: 1
        };
      }

      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (particles.length < 40 && isRunning) {
          particles.push(createParticle());
          particles.push(createParticle());
        }

        for (var i = particles.length - 1; i >= 0; i--) {
          var p = particles[i];
          p.y += p.speedY;
          p.x += p.speedX;
          p.rotation += p.rotSpeed;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;

          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          if (p.y > canvas.height + 20) {
            particles.splice(i, 1);
          }
        }

        if (particles.length > 0 || isRunning) {
          animationFrame = requestAnimationFrame(draw);
        } else {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
      }

      window.triggerFestConfetti = function() {
        isRunning = true;
        for (var k = 0; k < 28; k++) {
          particles.push(createParticle());
        }
        if (!animationFrame) {
          draw();
        }
        clearTimeout(stopTimeout);
        stopTimeout = setTimeout(function() {
          isRunning = false;
        }, 4500); // Save mobile battery
      };

      // Trigger modest sparkle on initial load
      var triggerInitialSparkle = function() {
        setTimeout(function() {
          if (window.triggerFestConfetti) window.triggerFestConfetti();
        }, 700);
      };
      if (document.readyState === 'complete') {
        triggerInitialSparkle();
      } else {
        window.addEventListener('load', triggerInitialSparkle);
      }
    },

    // --- 2. PROCEDURAL FESTIVE CHIME AUDIO (WEB AUDIO API) ---
    initAudioButton: function() {
      var self = this;
      var audioBtn = document.getElementById('fest-btn-audio');
      if (!audioBtn) return;

      audioBtn.addEventListener('click', function() {
        if (!self.audioCtx) {
          var AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) {
            self.audioCtx = new AudioContext();
          }
        }

        if (self.audioCtx && self.audioCtx.state === 'suspended') {
          self.audioCtx.resume();
        }

        self.audioEnabled = !self.audioEnabled;
        if (self.audioEnabled) {
          audioBtn.classList.add('playing');
          self.updateAudioButtonText();
          self.playFestiveChime();
        } else {
          audioBtn.classList.remove('playing');
          self.updateAudioButtonText();
        }
      });
    },

    updateAudioButtonText: function() {
      var audioBtn = document.getElementById('fest-btn-audio');
      if (!audioBtn) return;
      var isHindi = this.currentLang === 'hi';
      if (this.audioEnabled) {
        audioBtn.setAttribute('aria-label', isHindi ? 'ध्वनि चालू' : 'Sound Playing');
        audioBtn.innerHTML = isHindi ? '🔔 ध्वनि: चालू' : '🔔 Sound: ON';
      } else {
        audioBtn.setAttribute('aria-label', isHindi ? 'ध्वनि म्यूट' : 'Sound Muted');
        audioBtn.innerHTML = isHindi ? '🔕 ध्वनि' : '🔔 Audio';
      }
    },

    playFestiveChime: function() {
      if (!this.audioCtx) return;
      var ctx = this.audioCtx;
      var now = ctx.currentTime;
      var notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];

      notes.forEach(function(freq, index) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.16);

        gain.gain.setValueAtTime(0.001, now + index * 0.16);
        gain.gain.exponentialRampToValueAtTime(0.12, now + index * 0.16 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.16 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.16);
        osc.stop(now + index * 0.16 + 1.3);
      });
    },

    // --- 3. SVG TERRACOTTA DIYA LIGHTING MINI-GAME ---
    initDiyaGame: function() {
      var self = this;
      var diyas = document.querySelectorAll('.interactive-diya');
      var statusText = document.getElementById('diya-game-status');
      if (!diyas.length) return;

      // Inject high-detail SVG Terracotta lamp into each diya button
      diyas.forEach(function(diya, idx) {
        diya.innerHTML = '<svg viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
          '<defs>' +
            '<radialGradient id="diya-glow-' + idx + '" cx="50%" cy="50%" r="50%">' +
              '<stop offset="0%" stop-color="#FFD700" stop-opacity="0.9"/>' +
              '<stop offset="60%" stop-color="#FF9900" stop-opacity="0.4"/>' +
              '<stop offset="100%" stop-color="#FF9900" stop-opacity="0"/>' +
            '</radialGradient>' +
            '<linearGradient id="flame-grad-' + idx + '" x1="0" y1="1" x2="0" y2="0">' +
              '<stop offset="0%" stop-color="#FF2200"/>' +
              '<stop offset="45%" stop-color="#FF9900"/>' +
              '<stop offset="100%" stop-color="#FFF700"/>' +
            '</linearGradient>' +
          '</defs>' +
          '<circle cx="27" cy="16" r="14" fill="url(#diya-glow-' + idx + ')" class="diya-flame-path"/>' +
          '<path d="M7 30 C7 44 47 44 47 30 C47 26 38 28 27 28 C16 28 7 26 7 30 Z" fill="#B85D19" stroke="#E6A119" stroke-width="1.5"/>' +
          '<ellipse cx="27" cy="30" rx="18" ry="4" fill="#6A2E05"/>' +
          '<path d="M27 30 Q27 22 28 20" stroke="#2B1200" stroke-width="2.5" stroke-linecap="round"/>' +
          '<path d="M28 20 C25 15 25.5 9 28 4 C30.5 9 31 15 28 20 Z" fill="url(#flame-grad-' + idx + ')" class="diya-flame-path"/>' +
          '<ellipse cx="28" cy="14" rx="1.5" ry="3.5" fill="#FFF9D2" class="diya-flame-path"/>' +
        '</svg>';

        diya.addEventListener('click', function() {
          if (!diya.classList.contains('lit')) {
            diya.classList.add('lit');
            self.litDiyasCount++;

            // Haptic feedback
            if (navigator.vibrate) {
              try { navigator.vibrate(35); } catch (e) {}
            }

            // Gentle harmonious bell chime
            if (self.audioCtx) {
              try {
                var osc = self.audioCtx.createOscillator();
                var gain = self.audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(520 + self.litDiyasCount * 90, self.audioCtx.currentTime);
                gain.gain.setValueAtTime(0.08, self.audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, self.audioCtx.currentTime + 0.35);
                osc.connect(gain);
                gain.connect(self.audioCtx.destination);
                osc.start();
                osc.stop(self.audioCtx.currentTime + 0.35);
              } catch (e) {}
            }

            self.updateDiyaGameStatus();

            if (self.litDiyasCount === diyas.length) {
              if (window.triggerFestConfetti) window.triggerFestConfetti();
            }
          }
        });
      });

      this.updateDiyaGameStatus();
    },

    updateDiyaGameStatus: function() {
      var diyas = document.querySelectorAll('.interactive-diya');
      var statusText = document.getElementById('diya-game-status');
      var isHindi = this.currentLang === 'hi';
      if (!statusText || !diyas.length) return;

      if (this.litDiyasCount === 0) {
        statusText.textContent = decodeEntities(isHindi
          ? 'दीपक स्पर्श करें और अपने घर को दिव्य प्रकाश से आलोकित करें!'
          : 'Tap each earthen lamp to illuminate your home with divine grace!');
      } else if (this.litDiyasCount === diyas.length) {
        var festName = isHindi ? (this.config.nameHindi || 'पर्व') : (this.config.name || 'Festival');
        var shareMsg = isHindi
          ? 'मैंने 5 पावन दीए प्रज्वलित किए हैं! आप भी ' + festName + ' के पावन दीए जलाएं: ' + window.location.href
          : 'I have lit the 5 sacred lamps of ' + festName + '! Light yours too: ' + window.location.href;
        var waUrl = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(decodeEntities(shareMsg));

        statusText.innerHTML = decodeEntities('✨ <strong>' + (isHindi ? 'सभी 5 दीप प्रज्वलित!' : 'All 5 Lamps Lit!') + '</strong> ' +
          (isHindi ? 'आपके घर में सुख, शांति और आरोग्य का वास हो! 🌟' : 'May Divine Light bring endless prosperity and health into your life! 🌟') +
          '<br><a href="' + waUrl + '" class="btn-diya-share" target="_blank" rel="noopener noreferrer">' +
          '<span>🪔</span> <span>' + (isHindi ? 'प्रज्वलित दीए शेयर करें' : 'Share Your Lit Diyas') + '</span></a>');
      } else {
        statusText.textContent = decodeEntities(isHindi
          ? '🌟 ' + this.litDiyasCount + ' / ' + diyas.length + ' दीए प्रज्वलित! बाकी दीए भी जलाएं।'
          : '🌟 ' + this.litDiyasCount + ' of ' + diyas.length + ' lamps lit! Tap remaining lamps.');
      }
    },

    updateDiyaGameLanguage: function() {
      var titleEl = document.querySelector('.diya-game-title');
      var descEl = document.querySelector('.diya-game-desc');
      var isHindi = this.currentLang === 'hi';
      var festName = isHindi ? (this.config.nameHindi || 'विजयादशमी') : (this.config.name || 'Vijayadashami');

      if (titleEl) {
        titleEl.textContent = decodeEntities(isHindi
          ? (festName + ' के 5 पावन दीपक प्रज्वलित करें 🪔')
          : ('Light the 5 Sacred Lamps of ' + festName + ' 🪔'));
      }
      if (descEl) {
        descEl.textContent = decodeEntities(isHindi
          ? 'आरोग्य, साहस और विजय के दीप प्रज्वलित करने के लिए प्रत्येक दीए पर स्पर्श करें:'
          : 'Tap each earthen lamp to illuminate blessings of health, courage, and triumph:');
      }
      this.updateDiyaGameStatus();
    },

    // --- 4. 5-QUESTION BILINGUAL FESTIVAL QUIZ ---
    initQuiz: function() {
      var self = this;
      this.renderQuizQuestion();

      var nextBtn = document.getElementById('quiz-btn-next');
      if (nextBtn) {
        nextBtn.addEventListener('click', function() {
          self.handleNextQuestion();
        });
      }
    },

    getQuizQuestions: function() {
      if (!this.config || !this.config.quiz) return [];
      var quizObj = this.config.quiz;

      // Support bilingual format: quiz.hi / quiz.en OR quiz.questions
      if (quizObj[this.currentLang] && quizObj[this.currentLang].questions) {
        return quizObj[this.currentLang].questions;
      }
      if (quizObj.questions) {
        return quizObj.questions;
      }
      return [];
    },

    renderQuizQuestion: function() {
      var questions = this.getQuizQuestions();
      var questionEl = document.getElementById('quiz-question-text');
      var optionsContainer = document.getElementById('quiz-options-container');
      var progressEl = document.getElementById('quiz-progress');
      var badgeEl = document.querySelector('.quiz-badge');
      var explanationEl = document.getElementById('quiz-explanation');
      var nextBtn = document.getElementById('quiz-btn-next');
      var isHindi = this.currentLang === 'hi';

      if (!questions.length || !questionEl || !optionsContainer) return;

      var q = questions[this.quizState.currentIndex];
      if (!q) return;

      this.quizState.answered = false;
      if (explanationEl) {
        explanationEl.textContent = '';
        explanationEl.style.display = 'none';
      }
      if (nextBtn) nextBtn.style.display = 'none';

      if (badgeEl) {
        badgeEl.textContent = decodeEntities(isHindi ? '🏹 ज्ञानोत्कर्ष प्रश्नोत्तरी' : '🏹 Festival Trivia');
      }

      if (progressEl) {
        progressEl.textContent = decodeEntities(isHindi
          ? ('प्रश्न ' + (this.quizState.currentIndex + 1) + '/' + questions.length)
          : ('Question ' + (this.quizState.currentIndex + 1) + ' of ' + questions.length));
      }

      questionEl.textContent = decodeEntities(q.question);
      optionsContainer.innerHTML = '';

      var self = this;
      q.options.forEach(function(opt, optIdx) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-opt-btn';
        btn.innerHTML = '<span>' + decodeEntities(opt) + '</span><span class="quiz-opt-icon">⚪</span>';
        btn.addEventListener('click', function() {
          self.handleOptionClick(optIdx, q, btn, questions);
        });
        optionsContainer.appendChild(btn);
      });
    },

    handleOptionClick: function(selectedIndex, question, selectedBtn, questions) {
      if (this.quizState.answered) return;
      this.quizState.answered = true;

      var buttons = document.querySelectorAll('.quiz-opt-btn');
      var isCorrect = (selectedIndex === question.correctIndex);
      var explanationEl = document.getElementById('quiz-explanation');
      var nextBtn = document.getElementById('quiz-btn-next');
      var isHindi = this.currentLang === 'hi';

      // Haptic feedback
      if (navigator.vibrate) {
        try { navigator.vibrate(isCorrect ? 30 : [50, 40, 50]); } catch (e) {}
      }

      if (isCorrect) {
        this.quizState.score++;
        selectedBtn.classList.add('correct');
        selectedBtn.querySelector('.quiz-opt-icon').textContent = '✅';
      } else {
        selectedBtn.classList.add('incorrect');
        selectedBtn.querySelector('.quiz-opt-icon').textContent = '❌';
        if (buttons[question.correctIndex]) {
          buttons[question.correctIndex].classList.add('correct');
          buttons[question.correctIndex].querySelector('.quiz-opt-icon').textContent = '✅';
        }
      }

      if (explanationEl && question.explanation) {
        explanationEl.innerHTML = decodeEntities((isCorrect
          ? ('✅ <strong>' + (isHindi ? 'बिल्कुल सही!' : 'Correct!') + '</strong> ')
          : ('❌ <strong>' + (isHindi ? 'गलत उत्तर!' : 'Oops!') + '</strong> ')) + question.explanation);
        explanationEl.style.display = 'block';
      }

      if (nextBtn) {
        nextBtn.style.display = 'inline-block';
        if (this.quizState.currentIndex === questions.length - 1) {
          nextBtn.textContent = decodeEntities(isHindi ? 'अंतिम स्कोर देखें 🏆' : 'See Final Score 🏆');
        } else {
          nextBtn.textContent = decodeEntities(isHindi ? 'अगला प्रश्न →' : 'Next Question →');
        }
      }
    },

    handleNextQuestion: function() {
      var questions = this.getQuizQuestions();
      if (this.quizState.currentIndex < questions.length - 1) {
        this.quizState.currentIndex++;
        this.renderQuizQuestion();
      } else {
        this.showQuizResult();
      }
    },

    showQuizResult: function() {
      var quizBox = document.getElementById('fest-quiz-box');
      if (!quizBox) return;

      var questions = this.getQuizQuestions();
      var total = questions.length;
      var score = this.quizState.score;
      var percent = Math.round((score / total) * 100);
      var isHindi = this.currentLang === 'hi';
      var festName = isHindi ? (this.config.nameHindi || 'पर्व') : (this.config.name || 'Festival');

      var title = isHindi ? '🎉 प्रश्नोत्तरी संपन्न!' : '🎉 Quiz Completed!';
      var msg = isHindi
        ? ('आपने ' + total + ' में से ' + score + ' अंक (' + percent + '%) प्राप्त किए!')
        : ('You scored ' + score + ' out of ' + total + ' (' + percent + '%)!');

      if (percent >= 80) {
        msg += isHindi ? ' 🌟 शानदार! आप संस्कृति व परंपरा के ज्ञाता हैं!' : ' 🌟 Brilliant! You are a Festival Scholar!';
        if (window.triggerFestConfetti) window.triggerFestConfetti();
      } else if (percent >= 50) {
        msg += isHindi ? ' 👍 बहुत अच्छा खेले!' : ' 👍 Well played!';
      } else {
        msg += isHindi ? ' 📖 कोई बात नहीं! नीचे लेख पढ़कर और जानें।' : ' 📖 Good try! Read the article below to learn more.';
      }

      var shareText = isHindi
        ? ('मैंने ' + festName + ' क्विज़ में ' + score + '/' + total + ' स्कोर किया! क्या आप मेरा स्कोर तोड़ सकते हैं? 🎯 ' + window.location.href)
        : ('I scored ' + score + '/' + total + ' on the ' + festName + ' Quiz! Can you beat my score? 🎯 ' + window.location.href);

      var waShareUrl = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(shareText);

      quizBox.innerHTML = '<div class="quiz-result-card">' +
        '<h3>' + title + '</h3>' +
        '<p class="quiz-score-badge">' + msg + '</p>' +
        '<div class="quiz-action-btns">' +
          '<a href="' + waShareUrl + '" class="btn-fest-primary-whatsapp" target="_blank" rel="noopener noreferrer">' +
            '<span>📲</span> <span>' + (isHindi ? 'स्कोर व्हाट्सएप पर शेयर करें' : 'Share Score on WhatsApp') + '</span>' +
          '</a>' +
          '<button type="button" class="btn-fest-secondary" id="quiz-btn-restart">' +
            '<span>🔄</span> <span>' + (isHindi ? 'दोबारा खेलें' : 'Play Again') + '</span>' +
          '</button>' +
        '</div>' +
      '</div>';

      var self = this;
      var restartBtn = document.getElementById('quiz-btn-restart');
      if (restartBtn) {
        restartBtn.addEventListener('click', function() {
          self.quizState.currentIndex = 0;
          self.quizState.score = 0;
          self.quizState.answered = false;
          self.initQuiz();
        });
      }

      if (window.FestivalAnalytics) {
        window.FestivalAnalytics.logEvent('quiz_completed', {
          score: score,
          total: total,
          lang: this.currentLang
        });
      }
    },

    // --- 5. CELEBRATION WISH COUNTER ---
    initCounter: function() {
      var counterEl = document.getElementById('fest-counter-val');
      if (!counterEl) return;

      var now = new Date();
      var dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
      var hour = now.getHours();
      var base = 14200 + (dayOfYear * 71) + (hour * 43) + now.getMinutes();

      counterEl.textContent = base.toLocaleString('en-IN');

      setInterval(function() {
        if (Math.random() > 0.4) {
          base += Math.floor(Math.random() * 3) + 1;
          counterEl.textContent = base.toLocaleString('en-IN');
        }
      }, 7000);
    }
  };

  window.FestivalInteractive = Interactive;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Interactive;
  }
})(typeof window !== 'undefined' ? window : this);
