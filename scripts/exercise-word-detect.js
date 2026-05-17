// exercise-word-detect.js – Multi-player progress display (optimised)
(function() {
    'use strict';

    const PLAYERS_KEY = 'EH_words_detect_players';
    const PROGRESS_KEY = 'EH_words_detect_player_progress';

    function getColorFromPercent(percent) {
        const r = Math.round(255 + (59 - 255) * (percent / 100));
        const g = Math.round(204 + (130 - 204) * (percent / 100));
        const b = Math.round(0 + (246 - 0) * (percent / 100));
        return `rgb(${r}, ${g}, ${b})`;
    }

    function loadData() {
        let players = [];
        let progress = {};

        const storedPlayers = localStorage.getItem(PLAYERS_KEY);
        const storedProgress = localStorage.getItem(PROGRESS_KEY);

        if (storedPlayers) {
            try { players = JSON.parse(storedPlayers); } catch(e) { players = []; }
        }
        if (storedProgress) {
            try { progress = JSON.parse(storedProgress); } catch(e) { progress = {}; }
        }

        for (let p of players) {
            if (!p.regLang) p.regLang = 'en';
            if (!progress[p.id]) progress[p.id] = {};
            for (let card = 0; card < 3; card++) {
                const cardKey = String(card);
                if (!progress[p.id][cardKey]) {
                    progress[p.id][cardKey] = { level1: 0, level2: 0, level3: 0 };
                } else {
                    const c = progress[p.id][cardKey];
                    c.level1 = Math.min(100, Math.max(0, Number(c.level1) || 0));
                    c.level2 = Math.min(100, Math.max(0, Number(c.level2) || 0));
                    c.level3 = Math.min(100, Math.max(0, Number(c.level3) || 0));
                }
            }
        }
        return { players, progress };
    }

    function renderCard(cardElement, cardIndex, players, progress) {
        let cluster = cardElement.querySelector('.EH-words-detect-progress-cluster');
        if (!cluster) return;

        cluster.setAttribute('dir', 'ltr');
        cluster.innerHTML = '';

        if (!players.length) {
            cluster.innerHTML = '<div style="text-align:center; padding:1rem;">No detectives found.</div>';
            return;
        }

        const icons = ['⭐', '⚡', '🔥'];
        const fragment = document.createDocumentFragment();

        for (let player of players) {
            const playerProgress = progress[player.id]?.[String(cardIndex)] || { level1: 0, level2: 0, level3: 0 };
            const levels = [playerProgress.level1, playerProgress.level2, playerProgress.level3];

            const playerDiv = document.createElement('div');
            playerDiv.style.marginBottom = '1.2rem';
            playerDiv.style.borderBottom = '1px solid var(--EH-words-detect-common-border)';
            playerDiv.style.paddingBottom = '0.8rem';

            const nameSpan = document.createElement('div');
            nameSpan.textContent = player.name;
            nameSpan.style.fontWeight = 'bold';
            nameSpan.style.marginBottom = '0.5rem';
            nameSpan.style.fontSize = '0.85rem';
            nameSpan.style.color = 'var(--EH-words-detect-common-title-color)';
            const isRTL = (player.regLang === 'ar');
            nameSpan.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
            nameSpan.style.textAlign = isRTL ? 'right' : 'left';
            playerDiv.appendChild(nameSpan);

            for (let i = 0; i < 3; i++) {
                const percent = levels[i];
                const barRow = document.createElement('div');
                barRow.style.display = 'flex';
                barRow.style.alignItems = 'center';
                barRow.style.gap = '0.75rem';
                barRow.style.marginBottom = '0.4rem';
                barRow.setAttribute('dir', 'ltr');

                const iconSpan = document.createElement('span');
                iconSpan.textContent = icons[i];
                iconSpan.style.fontSize = '0.9rem';
                iconSpan.style.minWidth = '28px';
                iconSpan.style.textAlign = 'center';

                const barWrapper = document.createElement('div');
                barWrapper.style.flex = '1';
                barWrapper.style.background = 'rgba(128,128,128,0.2)';
                barWrapper.style.borderRadius = '20px';
                barWrapper.style.height = '8px';
                barWrapper.style.overflow = 'hidden';

                const fill = document.createElement('div');
                fill.style.width = percent + '%';
                fill.style.height = '100%';
                fill.style.backgroundColor = getColorFromPercent(percent);
                fill.style.borderRadius = '20px';
                barWrapper.appendChild(fill);

                const percentSpan = document.createElement('span');
                percentSpan.textContent = Math.round(percent) + '%';
                percentSpan.style.fontSize = '0.7rem';
                percentSpan.style.fontWeight = '600';
                percentSpan.style.minWidth = '2.5rem';
                percentSpan.style.textAlign = 'right';

                barRow.appendChild(iconSpan);
                barRow.appendChild(barWrapper);
                barRow.appendChild(percentSpan);
                playerDiv.appendChild(barRow);
            }
            fragment.appendChild(playerDiv);
        }
        cluster.appendChild(fragment);
    }

    function renderAllCards() {
        const { players, progress } = loadData();
        const cards = document.querySelectorAll('.EH-words-detect-common-card');
        for (let i = 0; i < cards.length; i++) {
            renderCard(cards[i], i, players, progress);
        }
    }

    function bindEvents() {
        let renderPending = false;
        function scheduleRender() {
            if (renderPending) return;
            renderPending = true;
            requestAnimationFrame(() => {
                renderAllCards();
                renderPending = false;
            });
        }

        const langSelect = document.getElementById('EH-words-detect-common-lang-select');
        if (langSelect) langSelect.addEventListener('change', scheduleRender);
        const themeBtn = document.getElementById('EH-words-detect-common-theme-toggle-btn');
        if (themeBtn) themeBtn.addEventListener('click', scheduleRender);
        window.addEventListener('storage', (e) => {
            if (e.key === PLAYERS_KEY || e.key === PROGRESS_KEY) scheduleRender();
        });
    }

    function init() {
        renderAllCards();
        bindEvents();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();