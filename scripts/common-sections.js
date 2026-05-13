// scripts/common-sections.js
// Dynamically injects navigation buttons and footer into conjugation lesson pages.
// Navigation rules:
//   - If filename ends with "-p1", Previous button is empty & inactive.
//   - If filename ends with "-p3", Next button is empty & inactive.
//   - If filename ends with "-p2", both Previous and Next are active.
//   - "Return to Conjugation" button is always present and active.
//   - All text uses data-i18n keys and integrates with translation-refraction.

(function () {
    'use strict';

    /**
     * Extract lesson prefix and page number from current URL.
     * Assumes filenames like ".../EH-conj-modals-Conditional3-p2.html"
     * @returns {Object|null} { prefix, page, suffix } or null if not matched
     */
    function parsePageInfo() {
        const path = window.location.pathname;
        const match = path.match(/(.*-p)(\d+)(\.html)$/);
        if (!match) return null;
        return {
            prefix: match[1],   // e.g., "EH-conj-modals-Conditional3-p"
            page: parseInt(match[2], 10),
            suffix: match[3]    // ".html"
        };
    }

    function injectNavigation() {
        const content = document.querySelector('.EH-conjugation-content');
        if (!content) return;

        // Remove any existing navigation (fully replace)
        const oldNav = content.querySelector('.EH-conjugation-navigation');
        if (oldNav) oldNav.remove();

        const pageInfo = parsePageInfo();
        const nav = document.createElement('div');
        nav.className = 'EH-conjugation-navigation';

        // 1. Previous button (empty & inactive for p1)
        const prev = document.createElement('button');
        prev.className = 'EH-conjugation-nav-button back';
        if (pageInfo && pageInfo.page > 1) {
            // Active: add text and click handler
            const span = document.createElement('span');
            span.setAttribute('data-i18n', 'common.previousLesson');
            prev.appendChild(span);
            prev.onclick = function () {
                window.location.href = pageInfo.prefix + (pageInfo.page - 1) + pageInfo.suffix;
            };
        } else {
            // Inactive: no text, no onclick
            prev.style.pointerEvents = 'none';
        }
        nav.appendChild(prev);

        // 2. Return to Conjugation (always active)
        const ret = document.createElement('button');
        ret.className = 'EH-conjugation-nav-button';
        ret.onclick = function () {
            window.location.href = 'conjugation.html';
        };
        const retSpan = document.createElement('span');
        retSpan.setAttribute('data-i18n', 'common.returnToConjugation');
        ret.appendChild(retSpan);
        nav.appendChild(ret);

        // 3. Next button (empty & inactive for p3 or max page)
        const next = document.createElement('button');
        next.className = 'EH-conjugation-nav-button';
        if (pageInfo && pageInfo.page < 3) {  // Adjust max page number if you have more than 3
            // Active: add text and click handler
            const span = document.createElement('span');
            span.setAttribute('data-i18n', 'common.nextLesson');
            next.appendChild(span);
            next.onclick = function () {
                window.location.href = pageInfo.prefix + (pageInfo.page + 1) + pageInfo.suffix;
            };
        } else {
            // Inactive: no text, no onclick
            next.style.pointerEvents = 'none';
        }
        nav.appendChild(next);

        content.appendChild(nav);
    }

    function injectFooter() {
        const oldFooter = document.querySelector('footer.EH-common-footer');
        if (oldFooter) oldFooter.remove();

        const footer = document.createElement('footer');
        footer.className = 'EH-common-footer';

        const div = document.createElement('div');
        div.className = 'EH-common-footer-content';

        const dev = document.createElement('div');
        dev.className = 'EH-common-footer-developer';
        dev.setAttribute('data-i18n', 'footer.developer');

        const linksDiv = document.createElement('div');
        linksDiv.className = 'EH-common-footer-links';

        // Privacy Policy
        const privacyLink = document.createElement('a');
        privacyLink.href = 'policy.html';
        privacyLink.setAttribute('data-i18n', 'footer.privacy');

        // Terms of Service
        const termsLink = document.createElement('a');
        termsLink.href = 'terms.html';
        termsLink.setAttribute('data-i18n', 'footer.terms');

        // Contact
        const contactLink = document.createElement('a');
        contactLink.href = 'contact.html';
        contactLink.setAttribute('data-i18n', 'footer.contact');

        linksDiv.appendChild(privacyLink);
        linksDiv.appendChild(termsLink);
        linksDiv.appendChild(contactLink);

        div.appendChild(dev);
        div.appendChild(linksDiv);
        footer.appendChild(div);

        document.body.appendChild(footer);
    }

    function triggerTranslationUpdate() {
        const langSelector = document.getElementById('language-selector');
        if (langSelector) {
            // Dispatch change event so translation-refraction picks up new elements
            langSelector.dispatchEvent(new Event('change'));
        }
    }

    function init() {
        injectNavigation();
        injectFooter();
        triggerTranslationUpdate();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();