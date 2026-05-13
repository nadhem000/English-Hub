// scripts/translation-refraction.js (cleaned)
(function() {
    'use strict';

    /* ==================== HELPERS ==================== */
    function getTranslation(key, lang) {
        const keys = key.split('.');
        let obj = window.I18N && window.I18N[lang];
        for (const k of keys) {
            if (obj && typeof obj === 'object' && k in obj) {
                obj = obj[k];
            } else {
                return null;
            }
        }
        return typeof obj === 'string' ? obj : null;
    }

    function saveOriginalEnglish() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            if (!el.hasAttribute('data-refraction-original')) {
                el.setAttribute('data-refraction-original', el.textContent.trim());
            }
        });
    }

    function refractTranslations(lang) {
        if (!window.I18N || !window.I18N.en) return;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (!key) return;

            let englishText = getTranslation(key, 'en');
            if (englishText === null || englishText === undefined) {
                englishText = el.getAttribute('data-refraction-original') || '';
            }

            const translatedText = (lang === 'en') ? null : getTranslation(key, lang);
            const displayTrans = translatedText || englishText || '';

            const isHeader = el.closest('.EH-site-header') !== null;
            const isFooter = el.closest('.EH-common-footer') !== null;
            const isNav    = el.closest('.EH-conjugation-navigation') !== null;
            const isExercise = el.closest('.EH-exercise-section') !== null;

            if (isHeader) {
                el.textContent = englishText;
            } else if (isFooter || isNav) {
                el.textContent = displayTrans;
            } else if (isExercise) {
                el.textContent = englishText;
            } else {
                if (lang === 'en') {
                    el.textContent = englishText;
                } else {
                    el.innerHTML =
                        `<span class="EH-conjugation-refraction-english">${englishText}</span>` +
                        `<hr class="EH-conjugation-refraction-divider">` +
                        `<span class="EH-conjugation-refraction-translation" dir="auto">${displayTrans}</span>`;
                }
            }
        });
    }

    /* ==================== INITIALIZATION ==================== */
    document.addEventListener('DOMContentLoaded', saveOriginalEnglish);

    window.addEventListener('load', function() {
        const selector = document.getElementById('language-selector');
        if (selector) {
            setTimeout(() => refractTranslations(selector.value), 300);
        }
    });

    document.addEventListener('DOMContentLoaded', function() {
        const selector = document.getElementById('language-selector');
        if (selector) {
            selector.addEventListener('change', function() {
                const lang = this.value;
                setTimeout(() => refractTranslations(lang), 120);
            });
        }
    });

})();