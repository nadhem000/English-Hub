// scripts/special-effects.js
// Theme toggle + score effects (sound + visual)
(function () {
  'use strict';

  /* ======================= THEME TOGGLE ======================= */
  function initThemeToggle() {
    const html = document.documentElement;
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    const STORAGE_KEY = 'EH-theme';

    function setTheme(isDark) {
      if (isDark) {
        html.setAttribute('data-theme', 'dark');
      } else {
        html.removeAttribute('data-theme');
      }
    }

    function loadTheme() {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        setTheme(saved === 'dark');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark);
      }
    }

    toggleBtn.addEventListener('click', function () {
      const isDark = html.hasAttribute('data-theme') && html.getAttribute('data-theme') === 'dark';
      const newIsDark = !isDark;
      setTheme(newIsDark);
      localStorage.setItem(STORAGE_KEY, newIsDark ? 'dark' : 'light');
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (localStorage.getItem(STORAGE_KEY) === null) {
        setTheme(e.matches);
      }
    });

    loadTheme();
  }

  /* ======================= SCORE EFFECTS ======================= */

  // Preload audio files once
  const audioFiles = {
    high: new Audio('assets2/sounds/scoring3.wav'),
    mid:  new Audio('assets2/sounds/scoring2.wav'),
    low:  new Audio('assets2/sounds/scoring1.wav')
  };

  function playScoreSound(pct) {
    try {
      let sound;
      if (pct >= 80) sound = audioFiles.high;
      else if (pct >= 50) sound = audioFiles.mid;
      else sound = audioFiles.low;

      // Reset and play (user gesture allows it)
      sound.pause();
      sound.currentTime = 0;
      sound.play().catch(() => {}); // ignore autoplay blocks
    } catch (e) {
      // Non‑critical
    }
  }

  function playScoreVisual(pct) {
    const scoreDisplay = document.getElementById('score-display');
    const scoreValue = document.getElementById('score-value');
    if (!scoreDisplay || !scoreValue) return;

    // 1. Flash the score card using a CSS class
    let flashClass;
    if (pct >= 80) flashClass = 'EH-score-flash-high';
    else if (pct >= 50) flashClass = 'EH-score-flash-mid';
    else flashClass = 'EH-score-flash-low';

    scoreDisplay.classList.add(flashClass);
    setTimeout(() => {
      scoreDisplay.classList.remove(flashClass);
    }, 300);

    // 2. Pop animation on the score number (class defined in CSS)
    scoreValue.classList.add('EH-score-pop');
    scoreValue.addEventListener('animationend', () => {
      scoreValue.classList.remove('EH-score-pop');
    }, { once: true });
  }

  window.EHScoreEffects = {
    show: function (totalScore, totalQuestions) {
      const pct = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
      playScoreSound(pct);
      playScoreVisual(pct);
    }
  };

  /* ======================= STARTUP ======================= */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeToggle);
  } else {
    initThemeToggle();
  }
})();