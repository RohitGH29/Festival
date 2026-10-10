/**
 * WhatsApp Status & Instagram Story 1080x1920 Image Generator
 * Renders a high-resolution, client-side canvas card with personalized recipient,
 * festival motifs, wish text, and sender attribution.
 * Zero external image dependencies - renders pure vector art & gradients on canvas!
 */
(function(window) {
  'use strict';

  var StatusCanvas = {
    canvas: null,
    ctx: null,
    isGenerating: false,

    init: function() {
      this.bindButtons();
    },

    bindButtons: function() {
      var self = this;
      var statusBtn = document.getElementById('fest-btn-status-image');
      if (statusBtn) {
        statusBtn.addEventListener('click', function() {
          self.generateStatusImage();
        });
      }
    },

    generateStatusImage: function() {
      if (this.isGenerating) return;
      this.isGenerating = true;

      var self = this;
      var greetingState = window.FestivalGreeting ? window.FestivalGreeting.state : { to: '', from: '' };
      var config = window.FestivalGreeting ? window.FestivalGreeting.config : {};
      var lang = window.FestivalGreeting ? window.FestivalGreeting.currentLang : 'en';
      var currentWish = window.FestivalGreeting ? window.FestivalGreeting.getCurrentWish() : { text: '' };

      var statusBtn = document.getElementById('fest-btn-status-image');
      var originalBtnText = statusBtn ? statusBtn.innerHTML : '';
      if (statusBtn) {
        statusBtn.innerHTML = '⏳ Generating HD Status...';
        statusBtn.style.opacity = '0.7';
      }

      // Create off-screen 1080x1920 Canvas
      var cvs = document.createElement('canvas');
      cvs.width = 1080;
      cvs.height = 1920;
      var ctx = cvs.getContext('2d');

      var isDiwali = (config.slug && config.slug.indexOf('diwali') !== -1);
      var isHindi = (lang === 'hi');

      // 1. Draw Luxurious Festive Background Gradient
      var bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
      if (isDiwali) {
        bgGrad.addColorStop(0, '#0F0C20');
        bgGrad.addColorStop(0.3, '#1E1236');
        bgGrad.addColorStop(0.7, '#3A1448');
        bgGrad.addColorStop(1, '#1A0826');
      } else {
        // Dussehra / Vijayadashami: Majestic Crimson, Royal Gold, Sunset Saffron
        bgGrad.addColorStop(0, '#1C0606');
        bgGrad.addColorStop(0.35, '#3D0A0A');
        bgGrad.addColorStop(0.7, '#6E1B0E');
        bgGrad.addColorStop(1, '#260404');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // 2. Draw Decorative Golden Sparkles & Aura
      ctx.save();
      var centerGrad = ctx.createRadialGradient(540, 850, 50, 540, 850, 650);
      centerGrad.addColorStop(0, 'rgba(255, 215, 0, 0.18)');
      centerGrad.addColorStop(0.5, 'rgba(255, 165, 0, 0.08)');
      centerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = centerGrad;
      ctx.fillRect(0, 200, 1080, 1300);
      ctx.restore();

      // 3. Draw Royal Golden Border Frame
      ctx.save();
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 6;
      ctx.strokeRect(60, 60, 960, 1800);

      ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(80, 80, 920, 1760);

      // Corner Ornaments
      self.drawCornerOrnaments(ctx, 60, 60, 960, 1800);
      ctx.restore();

      // 4. Draw Header Festive Motif
      ctx.save();
      if (isDiwali) {
        self.drawDiwaliArt(ctx, 540, 360);
      } else {
        self.drawDussehraArt(ctx, 540, 360);
      }
      ctx.restore();

      // 5. Draw Festival Greeting Title
      ctx.textAlign = 'center';
      var festTitle = isHindi ? (isDiwali ? 'शुभ दीपावली' : 'शुभ विजयदशमी') : (isDiwali ? 'HAPPY DIWALI' : 'HAPPY DUSSEHRA');
      ctx.font = 'bold 64px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif';
      var textGrad = ctx.createLinearGradient(200, 560, 880, 560);
      textGrad.addColorStop(0, '#FFE066');
      textGrad.addColorStop(0.5, '#FFD700');
      textGrad.addColorStop(1, '#FFA500');
      ctx.fillStyle = textGrad;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 15;
      ctx.fillText(festTitle, 540, 620);
      ctx.shadowBlur = 0;

      // 6. Draw Recipient Name (Personalized)
      if (greetingState.to) {
        var toText = (isHindi ? 'प्रिय ' : 'For ') + greetingState.to + '!';
        ctx.font = '600 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(toText, 540, 710);
      } else {
        var toText = isHindi ? 'आपके और आपके परिवार के लिए' : 'Wishing You & Your Family';
        ctx.font = '400 40px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif';
        ctx.fillStyle = '#E5E7EB';
        ctx.fillText(toText, 540, 700);
      }

      // Decorative divider line
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(340, 770);
      ctx.lineTo(740, 770);
      ctx.stroke();

      // Golden diamond in center of divider
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(540, 770, 7, 0, Math.PI * 2);
      ctx.fill();

      // 7. Draw Wish Text (Multi-line wrapped cleanly)
      var wishText = currentWish.text || 'May the divine light illuminate your path with joy, success, and prosperity!';
      ctx.font = '400 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif';
      ctx.fillStyle = '#FFF8E7';
      self.wrapText(ctx, wishText, 540, 890, 800, 56);

      // 8. Draw Sender Name (Attribution)
      if (greetingState.from) {
        var fromText = isHindi ? '— ' + greetingState.from + ' की ओर से सप्रेम' : '— With love & blessings from ' + greetingState.from;
        ctx.font = 'italic 500 38px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif';
        ctx.fillStyle = '#FFD700';
        ctx.fillText(fromText, 540, 1340);
      }

      // 9. Draw Footer Festive Blessing & Watermark Badge
      ctx.font = '500 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      var brandName = config.brandName || 'FestiveGreetings';
      ctx.fillText('✨ ' + brandName + ' • ' + (config.dates && config.dates.year || '2026') + ' ✨', 540, 1680);

      // Convert Canvas to Blob
      cvs.toBlob(function(blob) {
        self.isGenerating = false;
        if (statusBtn) {
          statusBtn.innerHTML = originalBtnText;
          statusBtn.style.opacity = '1';
        }

        if (!blob) return;
        var fileName = (config.slug || 'festival') + '-status-wish.png';

        // Check if Web Share API level 2 supports file sharing
        var file = new File([blob], fileName, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({
            title: festTitle,
            text: wishText,
            files: [file]
          }).then(function() {
            if (window.FestivalAnalytics) {
              window.FestivalAnalytics.logEvent('image_downloaded', { method: 'web_share_file' });
            }
          }).catch(function() {
            self.downloadBlobFile(blob, fileName);
          });
        } else {
          // Fallback to instant PNG download
          self.downloadBlobFile(blob, fileName);
        }
      }, 'image/png');
    },

    downloadBlobFile: function(blob, fileName) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (window.FestivalAnalytics) {
        window.FestivalAnalytics.logEvent('image_downloaded', { method: 'direct_download' });
      }

      if (window.FestivalGreeting && window.FestivalGreeting.showToast) {
        window.FestivalGreeting.showToast('HD Status Card Downloaded! 📲 Share to WhatsApp Status');
      }
    },

    wrapText: function(ctx, text, x, y, maxWidth, lineHeight) {
      var words = text.split(' ');
      var line = '';
      var currentY = y;

      for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        var metrics = ctx.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line.trim(), x, currentY);
          line = words[n] + ' ';
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), x, currentY);
    },

    drawCornerOrnaments: function(ctx, x, y, w, h) {
      var size = 40;
      // Top Left
      ctx.beginPath();
      ctx.arc(x + size, y + size, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#D4AF37';
      ctx.fill();

      // Top Right
      ctx.beginPath();
      ctx.arc(x + w - size, y + size, 14, 0, Math.PI * 2);
      ctx.fill();

      // Bottom Left
      ctx.beginPath();
      ctx.arc(x + size, y + h - size, 14, 0, Math.PI * 2);
      ctx.fill();

      // Bottom Right
      ctx.beginPath();
      ctx.arc(x + w - size, y + h - size, 14, 0, Math.PI * 2);
      ctx.fill();
    },

    drawDiwaliArt: function(ctx, cx, cy) {
      // Draw Glowing Diya Clay Lamp
      // Aura
      var rad = ctx.createRadialGradient(cx, cy - 40, 10, cx, cy - 40, 120);
      rad.addColorStop(0, 'rgba(255, 230, 0, 0.9)');
      rad.addColorStop(0.5, 'rgba(255, 120, 0, 0.4)');
      rad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = rad;
      ctx.fillRect(cx - 150, cy - 180, 300, 300);

      // Flame
      ctx.fillStyle = '#FF9900';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 90);
      ctx.bezierCurveTo(cx - 28, cy - 40, cx - 24, cy, cx, cy);
      ctx.bezierCurveTo(cx + 24, cy, cx + 28, cy - 40, cx, cy - 90);
      ctx.fill();

      // Inner flame
      ctx.fillStyle = '#FFFF99';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 70);
      ctx.bezierCurveTo(cx - 14, cy - 35, cx - 12, cy, cx, cy);
      ctx.bezierCurveTo(cx + 12, cy, cx + 14, cy - 35, cx, cy - 70);
      ctx.fill();

      // Clay Diya base
      ctx.fillStyle = '#C25E00';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 20, 90, 45, 0, 0, Math.PI);
      ctx.fill();

      ctx.fillStyle = '#8B3A00';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 20, 85, 20, 0, 0, Math.PI * 2);
      ctx.fill();
    },

    drawDussehraArt: function(ctx, cx, cy) {
      // Draw Sacred Bow & Arrow with Golden Radiance
      // Golden circular aura
      var aura = ctx.createRadialGradient(cx, cy, 10, cx, cy, 110);
      aura.addColorStop(0, 'rgba(255, 215, 0, 0.5)');
      aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(cx, cy, 110, 0, Math.PI * 2);
      ctx.fill();

      // Golden Bow
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(cx - 20, cy, 75, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.stroke();

      // Bow string
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 20 + 75 * Math.cos(-Math.PI * 0.45), cy + 75 * Math.sin(-Math.PI * 0.45));
      ctx.lineTo(cx - 20 + 75 * Math.cos(Math.PI * 0.45), cy + 75 * Math.sin(Math.PI * 0.45));
      ctx.stroke();

      // Arrow shaft
      ctx.strokeStyle = '#FFA500';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cx - 60, cy);
      ctx.lineTo(cx + 80, cy);
      ctx.stroke();

      // Arrow head (Golden spearhead)
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.moveTo(cx + 105, cy);
      ctx.lineTo(cx + 75, cy - 20);
      ctx.lineTo(cx + 75, cy + 20);
      ctx.closePath();
      ctx.fill();
    }
  };

  window.FestivalStatusCanvas = StatusCanvas;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = StatusCanvas;
  }
})(typeof window !== 'undefined' ? window : this);
