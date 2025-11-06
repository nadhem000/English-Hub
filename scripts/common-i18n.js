// scripts/common-i18n.js

// Common translation functions for all pages
window.I18N = window.I18N || {};

// Translation function
function updateTranslations(lang) {
    const i18n = window.I18N && window.I18N[lang];
    if (!i18n) {
        console.error(`Translations for language '${lang}' not found`);
        return;
    }
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const keys = key.split('.');
        let translation = i18n;
        
        // Navigate through the nested object
        for (const k of keys) {
            translation = translation?.[k];
            if (!translation) break;
        }
        
        if (translation && typeof translation === 'string') {
            if (element.tagName === 'INPUT' && element.type === 'button') {
                element.value = translation;
            } else {
                element.textContent = translation;
            }
        }
    });
    
    // Update tooltips for buttons with data-tooltip attribute
    document.querySelectorAll('[data-tooltip]').forEach(button => {
        const tooltipKey = button.getAttribute('data-tooltip');
        let tooltipTranslation;
        
        // Try to find translation in common section first
        if (i18n.common && i18n.common[tooltipKey]) {
            tooltipTranslation = i18n.common[tooltipKey];
        }
        
        // If not found in common, try to find in the current language structure
        if (!tooltipTranslation) {
            const keys = tooltipKey.split('.');
            tooltipTranslation = i18n;
            for (const k of keys) {
                tooltipTranslation = tooltipTranslation?.[k];
                if (!tooltipTranslation) break;
            }
        }
        
        if (tooltipTranslation && typeof tooltipTranslation === 'string') {
            button.setAttribute('data-tooltip', tooltipTranslation);
        }
    });
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    
    // Update direction for RTL languages
    if (lang === 'ar') {
        document.documentElement.dir = 'rtl';
        document.body.style.direction = 'rtl';
    } else {
        document.documentElement.dir = 'ltr';
        document.body.style.direction = 'ltr';
    }
}

// Initialize translations when DOM is loaded
function initTranslations() {
    const languageSelector = document.getElementById('language-selector');
    
    if (!languageSelector) {
        console.warn('Language selector not found on this page');
        return;
    }
    
    // Set initial language
    const savedLanguage = localStorage.getItem('preferred-language') || 'en';
    languageSelector.value = savedLanguage;
    
    // Update translations immediately
    updateTranslations(savedLanguage);
    
    // Update translations when language changes
    languageSelector.addEventListener('change', function() {
        const selectedLang = this.value;
        localStorage.setItem('preferred-language', selectedLang);
        updateTranslations(selectedLang);
        
        // Dispatch custom event for pages that need to handle additional language changes
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: selectedLang } 
        }));
    });
}

// Function to get current language
function getCurrentLanguage() {
    const languageSelector = document.getElementById('language-selector');
    return languageSelector ? languageSelector.value : 'en';
}

// Function to get courses for current language
function getCoursesForCurrentLanguage() {
    const currentLang = getCurrentLanguage();
    const i18n = window.I18N && window.I18N[currentLang];
    return i18n ? i18n.courses : null;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initTranslations();
});