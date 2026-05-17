// common-sections-words-detect.js – injects footer with default English text

(function() {
    'use strict';

    function injectFooter() {
        var oldFooter = document.querySelector('footer.EH-words-detect-common-footer');
        if (oldFooter) oldFooter.remove();

        var footer = document.createElement('footer');
        footer.className = 'EH-words-detect-common-footer';

        var div = document.createElement('div');
        div.className = 'EH-words-detect-common-footer-content';

        var dev = document.createElement('div');
        dev.className = 'EH-words-detect-common-footer-developer';
        dev.setAttribute('data-i18n', 'footer.developer');
        dev.textContent = 'Developer: Mejri Ziad';

        var linksDiv = document.createElement('div');
        linksDiv.className = 'EH-words-detect-common-footer-links';

        var privacyLink = document.createElement('a');
        privacyLink.href = 'policy.html';
        privacyLink.setAttribute('data-i18n', 'footer.privacy');
        privacyLink.textContent = 'Privacy Policy';

        var termsLink = document.createElement('a');
        termsLink.href = 'terms.html';
        termsLink.setAttribute('data-i18n', 'footer.terms');
        termsLink.textContent = 'Terms of Service';

        var contactLink = document.createElement('a');
        contactLink.href = 'contact.html';
        contactLink.setAttribute('data-i18n', 'footer.contact');
        contactLink.textContent = 'Contact';

        linksDiv.appendChild(privacyLink);
        linksDiv.appendChild(termsLink);
        linksDiv.appendChild(contactLink);

        div.appendChild(dev);
        div.appendChild(linksDiv);
        footer.appendChild(div);

        document.body.appendChild(footer);

        // Force re-translation so footer gets proper text & original text stored
        var langSelect = document.getElementById('EH-words-detect-common-lang-select');
        if (langSelect) {
            langSelect.dispatchEvent(new Event('change'));
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectFooter);
    } else {
        injectFooter();
    }
})();