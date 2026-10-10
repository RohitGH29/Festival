/**
 * Interactive Festival Delight & Engagement Engine
 * Includes:
 * 1. Lightweight Canvas Sparkles & Confetti (zero external libs, auto-pauses)
 * 2. Web Audio API Procedural Festive Temple Chime (zero audio files, tap-activated only)
 * 3. Interactive Diya Lighting Mini-Game (tap 5 diyas to illuminate)
 * 4. 5-Question Interactive Festival Trivia Quiz
 * 5. Celebration Wishes Counter
 */
(function(window) {
  'use strict';

  var Interactive = {
    audioCtx: null,
    audioEnabled: false,
    quizState: {
      currentIndex: 0,
      score: 0,
      answered: false
    },
    litDiyasCount: 0,

    init: function(config) {
      this.initParticles();
      this.initAudioButton();
      this.initDiyaGame();
      this.initQuiz(config ? config.quiz : null);
      this.initCounter();
    },

    // --- 1. LIGHTWEIGHT CANVAS PARTICLES ---
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

      var colors = ['#FFD700', '#FFA500', '#FF4500', '#FF6347', '#FFF8DC', '#FFCC00'];

      function createParticle() {
        return {
          x: Math.random() * canvas.width,
          y: -10,
          size: Math.random() * 6 + 3,
          speedY: Math.random() * 3 + 1.5,
          speedX: (Math.random() - 0.5) * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 4,
          opacity: 1
        };
      }

      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Add 2 new particles per frame while active
        if (particles.length < 50 && isRunning) {
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

          // Draw festive flower petal or diamond
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
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
        for (var k = 0; k < 25; k++) {
          particles.push(createParticle());
        }
        if (!animationFrame) {
          draw();
        }
        clearTimeout(stopTimeout);
        stopTimeout = setTimeout(function() {
          isRunning = false;
        }, 5000); // Automatically stop after 5s to save mobile battery
      };

      // Trigger brief sparkle on page load
      window.addEventListener('load', function() {
        setTimeout(function() {
          window.triggerFestConfetti();
        }, 800);
      });
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
          audioBtn.setAttribute('aria-label', 'Sound Playing');
          audioBtn.innerHTML = '🔔 Sound: ON';
          self.playFestiveChime();
        } else {
          audioBtn.classList.remove('playing');
          audioBtn.setAttribute('aria-label', 'Sound Muted');
          audioBtn.innerHTML = '🔕 Sound: OFF';
        }
      });
    },

    playFestiveChime: function() {
      if (!this.audioCtx) return;
      var ctx = this.audioCtx;
      var now = ctx.currentTime;

      // Indian classical pentatonic harmonic frequencies (Bhoopali/Mohanam scale: Sa, Re, Ga, Pa, Dha)
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

    // --- 3. INTERACTIVE DIYA LIGHTING MINI-GAME ---
    initDiyaGame: function() {
      var self = this;
      var diyas = document.querySelectorAll('.interactive-diya');
      var statusText = document.getElementById('diya-game-status');
      if (!diyas.length) return;

      diyas.forEach(function(diya, idx) {
        diya.addEventListener('click', function() {
          if (!diya.classList.contains('lit')) {
            diya.classList.add('lit');
            self.litDiyasCount++;

            // Play gentle single chime
            if (self.audioCtx) {
              var osc = self.audioCtx.createOscillator();
              var gain = self.audioCtx.createGain();
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(440 + self.litDiyasCount * 80, self.audioCtx.currentTime);
              gain.gain.setValueAtTime(0.1, self.audioCtx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.001, self.audioCtx.currentTime + 0.4);
              osc.connect(gain);
              gain.connect(self.audioCtx.destination);
              osc.start();
              osc.stop(self.audioCtx.currentTime + 0.4);
            }

            if (self.litDiyasCount === diyas.length) {
              if (statusText) {
                statusText.innerHTML = '✨ <strong>All Lamps Lit!</strong> May Divine Light bring endless prosperity and health into your life! 🌟';
                statusText.classList.add('completed');
              }
              if (window.triggerFestConfetti) window.triggerFestConfetti();
            } else {
              if (statusText) {
                statusText.textContent = '🌟 ' + self.litDiyasCount + ' of ' + diyas.length + ' lamps lit! Tap remaining lamps.';
              }
            }
          }
        });
      });
    },

    // --- 4. FESTIVAL TRIVIA QUIZ ---
    initQuiz: function(quizData) {
      if (!quizData || !quizData.questions || quizData.questions.length === 0) return;
      var self = this;
      this.quizData = quizData;
      this.renderQuizQuestion();

      var nextBtn = document.getElementById('quiz-btn-next');
      if (nextBtn) {
        nextBtn.addEventListener('click', function() {
          self.handleNextQuestion();
        });
      }
    },

    renderQuizQuestion: function() {
      var q = this.quizData.questions[this.quizState.currentIndex];
      var questionEl = document.getElementById('quiz-question-text');
      var optionsContainer = document.getElementById('quiz-options-container');
      var progressEl = document.getElementById('quiz-progress');
      var explanationEl = document.getElementById('quiz-explanation');
      var nextBtn = document.getElementById('quiz-btn-next');

      if (!q || !questionEl || !optionsContainer) return;

      this.quizState.answered = false;
      if (explanationEl) {
        explanationEl.textContent = '';
        explanationEl.style.display = 'none';
      }
      if (nextBtn) nextBtn.style.display = 'none';

      if (progressEl) {
        progressEl.textContent = 'Question ' + (this.quizState.currentIndex + 1) + ' of ' + this.quizData.questions.length;
      }

      questionEl.textContent = q.question;
      optionsContainer.innerHTML = '';

      var self = this;
      q.options.forEach(function(opt, optIdx) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-opt-btn';
        btn.textContent = opt;
        btn.addEventListener('click', function() {
          self.handleOptionClick(optIdx, q, btn);
        });
        optionsContainer.appendChild(btn);
      });
    },

    handleOptionClick: function(selectedIndex, question, selectedBtn) {
      if (this.quizState.answered) return;
      this.quizState.answered = true;

      var buttons = document.querySelectorAll('.quiz-opt-btn');
      var isCorrect = (selectedIndex === question.correctIndex);
      var explanationEl = document.getElementById('quiz-explanation');
      var nextBtn = document.getElementById('quiz-btn-next');

      if (isCorrect) {
        this.quizState.score++;
        selectedBtn.classList.add('correct');
      } else {
        selectedBtn.classList.add('incorrect');
        // Highlight the correct one
        if (buttons[question.correctIndex]) {
          buttons[question.correctIndex].classList.add('correct');
        }
      }

      if (explanationEl && question.explanation) {
        explanationEl.innerHTML = (isCorrect ? '✅ <strong>Correct!</strong> ' : '❌ <strong>Oops!</strong> ') + question.explanation;
        explanationEl.style.display = 'block';
      }

      if (nextBtn) {
        nextBtn.style.display = 'inline-block';
        if (this.quizState.currentIndex === this.quizData.questions.length - 1) {
          nextBtn.textContent = 'See Final Score 🏆';
        } else {
          nextBtn.textContent = 'Next Question →';
        }
      }
    },

    handleNextQuestion: function() {
      if (this.quizState.currentIndex < this.quizData.questions.length - 1) {
        this.quizState.currentIndex++;
        this.renderQuizQuestion();
      } else {
        this.showQuizResult();
      }
    },

    showQuizResult: function() {
      var quizBox = document.getElementById('fest-quiz-box');
      if (!quizBox) return;

      var total = this.quizData.questions.length;
      var score = this.quizState.score;
      var percent = Math.round((score / total) * 100);

      var title = '🎉 Quiz Completed!';
      var msg = 'You scored ' + score + ' out of ' + total + ' (' + percent + '%)!';
      if (percent >= 80) {
        msg += ' 🌟 Brilliant! You are a Festival Scholar!';
        if (window.triggerFestConfetti) window.triggerFestConfetti();
      } else if (percent >= 50) {
        msg += ' 👍 Well played! You know your traditions!';
      } else {
        msg += ' 📖 Good try! Read the festival story below to learn more.';
      }

      quizBox.innerHTML = '<div class="quiz-result-card">' +
        '<h3>' + title + '</h3>' +
        '<p class="quiz-score-badge">' + msg + '</p>' +
        '<button type="button" class="btn-fest-secondary" id="quiz-btn-restart">Play Again 🔄</button>' +
        '</div>';

      var self = this;
      var restartBtn = document.getElementById('quiz-btn-restart');
      if (restartBtn) {
        restartBtn.addEventListener('click', function() {
          self.quizState.currentIndex = 0;
          self.quizState.score = 0;
          self.quizState.answered = false;
          self.renderQuizQuestion();
        });
      }

      if (window.FestivalAnalytics) {
        window.FestivalAnalytics.logEvent('quiz_completed', {
          score: score,
          total: total
        });
      }
    },

    // --- 5. CELEBRATION WISH COUNTER ---
    initCounter: function() {
      var counterEl = document.getElementById('fest-counter-val');
      if (!counterEl) return;

      // Deterministic dynamic base based on day of year + time of day
      var now = new Date();
      var dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
      var hour = now.getHours();
      var base = 12000 + (dayOfYear * 73) + (hour * 42) + now.getMinutes();

      counterEl.textContent = base.toLocaleString('en-IN');

      // Subtle dynamic increment
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
