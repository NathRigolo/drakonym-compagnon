/* ═══════════════════════════════════════════════════════════════
   DRAKONYM COMPAGNON — APP.JS
   Vague 2 : Fiche complète + bottom sheets + persistance localStorage.
   ═══════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════
   DATA LAYER — fiche par défaut, statuses officiels, persistance
   ═══════════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'drakonym_compagnon_v1';

/* Fiche de démonstration utilisée au premier lancement */
const FICHE_DEMO = {
    nom: 'Tharion',
    niveau: 5,
    kin: 'Drakari',
    classe: 'Dragonbound',
    primary: 'Soul',
    attributs: { Body: 3, Mind: 2, Soul: 4, Shadow: 1, Gods: 2, World: 3 },
    hp_current: 2,
    hp_max: 3,
    wounds: { light: 1, heavy: 0, deadly: 0 },
    ap_current: 4,
    defense_current: 14,
    defense_max: 14,
    armure_bonus: 1,
    mana_current: 8,
    mana_max: 12,
    grit_current: 4,
    grit_max: 6,
    short_rests_used: 0,
    statuses: [
        { id: 'bloodied', nom: 'Bloodied', value: 0, hasIntensity: false },
        { id: 'frightened', nom: 'Frightened', value: 2, hasIntensity: true },
    ],
};

/* Les 16 statuses officiels du Core Rulebook */
const STATUSES_CATALOG = [
    { id: 'blinded',       nom: 'Blinded',       hasIntensity: false, color: 'shadow' },
    { id: 'bloodied',      nom: 'Bloodied',      hasIntensity: false, color: 'crimson' },
    { id: 'burning',       nom: 'Burning',       hasIntensity: true,  color: 'crimson' },
    { id: 'charmed',       nom: 'Charmed',       hasIntensity: false, color: 'shadow' },
    { id: 'confused',      nom: 'Confused',      hasIntensity: false, color: 'shadow' },
    { id: 'deafened',      nom: 'Deafened',      hasIntensity: false, color: 'shadow' },
    { id: 'frightened',    nom: 'Frightened',    hasIntensity: true,  color: 'shadow' },
    { id: 'grappled',      nom: 'Grappled',      hasIntensity: false, color: 'shadow' },
    { id: 'incapacitated', nom: 'Incapacitated', hasIntensity: false, color: 'crimson' },
    { id: 'invisible',     nom: 'Invisible',     hasIntensity: false, color: 'shadow' },
    { id: 'paralyzed',     nom: 'Paralyzed',     hasIntensity: false, color: 'crimson' },
    { id: 'poisoned',      nom: 'Poisoned',      hasIntensity: true,  color: 'crimson' },
    { id: 'prone',         nom: 'Prone',         hasIntensity: false, color: 'shadow' },
    { id: 'restrained',    nom: 'Restrained',    hasIntensity: false, color: 'shadow' },
    { id: 'stunned',       nom: 'Stunned',       hasIntensity: false, color: 'crimson' },
    { id: 'unconscious',   nom: 'Unconscious',   hasIntensity: false, color: 'crimson' },
];


/* État courant de la fiche */
let currentFiche = null;


function loadFiche() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            return Object.assign({}, FICHE_DEMO, parsed);
        }
    } catch (e) {
        console.warn('Impossible de charger la fiche, fallback démo :', e);
    }
    return JSON.parse(JSON.stringify(FICHE_DEMO));
}

function saveFiche() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentFiche));
    } catch (e) {
        console.warn('Impossible de sauvegarder la fiche :', e);
    }
}


/* ═══════════════════════════════════════════════════════════════
   THÈME — light / dark / auto
   ═══════════════════════════════════════════════════════════════ */
const THEME_KEY = 'drakonym_compagnon_theme';

function getStoredTheme() {
    try { return localStorage.getItem(THEME_KEY) || 'dark'; }
    catch (e) { return 'dark'; }
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f0e3c2' : '#1f1812');
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* ignore */ }
}

function bindThemeToggle() {
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            applyTheme(btn.dataset.theme);
            showToast(`Thème : ${btn.textContent.trim()}`);
        });
    });
}


/* ═══════════════════════════════════════════════════════════════
   NAVIGATION ONGLETS
   ═══════════════════════════════════════════════════════════════ */
function bindTabNavigation() {
    document.querySelectorAll('.tab').forEach(tabBtn => {
        tabBtn.addEventListener('click', () => switchToTab(tabBtn.dataset.tab));
    });
}

function switchToTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => {
        const isActive = t.dataset.tab === tabName;
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    document.querySelectorAll('.tab-section').forEach(s => {
        s.classList.toggle('active', s.dataset.tab === tabName);
    });
    const content = document.getElementById('content');
    if (content) content.scrollTop = 0;
}


/* ═══════════════════════════════════════════════════════════════
   RENDER — pousse les données vers le DOM
   ═══════════════════════════════════════════════════════════════ */
function renderAll() {
    renderVitalBar(currentFiche);
    renderFiche(currentFiche);
}

function renderVitalBar(f) {
    document.getElementById('vital-name').textContent = f.nom;
    document.getElementById('vital-subtitle').textContent =
        `${f.kin.toUpperCase()} · ${f.classe.toUpperCase()}`;
    document.getElementById('vital-level').textContent = f.niveau;

    const hpDisplay = document.getElementById('vital-hp-display');
    hpDisplay.innerHTML = '';
    for (let i = 0; i < f.hp_max; i++) {
        const pip = document.createElement('span');
        pip.className = 'hp-pip' + (i < f.hp_current ? ' filled' : '');
        hpDisplay.appendChild(pip);
    }

    const woundsDisplay = document.getElementById('vital-wounds-display');
    woundsDisplay.innerHTML = '';
    ['light', 'heavy', 'deadly'].forEach(tier => {
        const pip = document.createElement('span');
        pip.className = 'wound-pip' + ((f.wounds[tier] || 0) > 0 ? ' filled' : '');
        pip.dataset.tier = tier;
        woundsDisplay.appendChild(pip);
    });

    document.getElementById('vital-ap').textContent = f.ap_current;
    document.getElementById('vital-defense').textContent = f.defense_current;
}


function renderFiche(f) {
    const tagsEl = document.getElementById('identity-tags');
    if (tagsEl) {
        tagsEl.innerHTML = '';
        for (const t of [f.kin, f.classe]) {
            if (!t) continue;
            const span = document.createElement('span');
            span.className = 'tag';
            span.textContent = t;
            tagsEl.appendChild(span);
        }
        if (f.primary) {
            const p = document.createElement('span');
            p.className = 'tag tag-primary';
            p.textContent = f.primary;
            tagsEl.appendChild(p);
        }
    }

    const attrsEl = document.getElementById('attributes-grid');
    if (attrsEl) {
        attrsEl.innerHTML = '';
        const order = ['Body', 'Mind', 'Soul', 'Shadow', 'Gods', 'World'];
        for (const name of order) {
            const cell = document.createElement('button');
            cell.type = 'button';
            cell.className = 'attribute-cell' + (name === f.primary ? ' primary' : '');
            cell.dataset.attribute = name;
            cell.innerHTML = `
                <div class="attribute-name">${name}</div>
                <div class="attribute-value">${f.attributs[name] || 0}</div>
            `;
            attrsEl.appendChild(cell);
        }
    }

    document.getElementById('mana-current').textContent = f.mana_current;
    document.getElementById('mana-max').textContent = f.mana_max;
    document.getElementById('mana-bar').style.width =
        f.mana_max > 0 ? Math.min(100, (f.mana_current / f.mana_max) * 100) + '%' : '0%';

    document.getElementById('grit-current').textContent = f.grit_current;
    document.getElementById('grit-max').textContent = f.grit_max;
    document.getElementById('grit-bar').style.width =
        f.grit_max > 0 ? Math.min(100, (f.grit_current / f.grit_max) * 100) + '%' : '0%';

    const hpStarsEl = document.getElementById('hp-stars');
    hpStarsEl.innerHTML = '';
    for (let i = 0; i < f.hp_max; i++) {
        const star = document.createElement('span');
        star.className = 'hp-star' + (i < f.hp_current ? ' filled' : '');
        star.textContent = '★';
        hpStarsEl.appendChild(star);
    }
    document.getElementById('hp-text').textContent =
        `${f.hp_current} / ${f.hp_max} disponibles`;

    const statusesEl = document.getElementById('statuses-chips');
    statusesEl.innerHTML = '';
    for (const s of f.statuses) {
        const chip = document.createElement('button');
        chip.type = 'button';
        const cat = STATUSES_CATALOG.find(c => c.id === s.id);
        const colorClass = (cat && cat.color === 'crimson') ? ' crimson' : '';
        chip.className = 'status-chip' + colorClass;
        chip.dataset.statusId = s.id;
        let html = s.nom;
        if (s.hasIntensity && s.value > 0) {
            html += ` <span class="status-chip-intensity">${s.value}</span>`;
        }
        chip.innerHTML = html;
        statusesEl.appendChild(chip);
    }
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'status-add';
    addBtn.id = 'status-add';
    addBtn.textContent = '+ ajouter';
    statusesEl.appendChild(addBtn);

    document.getElementById('short-rests-info').textContent =
        `${f.short_rests_used} / 3 utilisés aujourd'hui`;
}


/* ═══════════════════════════════════════════════════════════════
   ACTIONS — branche les clics utilisateur sur les bottom sheets
   ═══════════════════════════════════════════════════════════════ */

function bindVitalBarActions() {
    document.querySelectorAll('.vital-stat').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            if (action === 'hp') openHeroPointsSheet();
            else if (action === 'wounds') openWoundsSheet();
            else if (action === 'ap') openApSheet();
            else if (action === 'defense') openDefenseSheet();
        });
    });
}

function bindFicheActions() {
    const attrsEl = document.getElementById('attributes-grid');
    if (attrsEl) {
        attrsEl.addEventListener('click', (e) => {
            const cell = e.target.closest('.attribute-cell');
            if (!cell) return;
            showToast(`Lanceur de dés ${cell.dataset.attribute} — Vague 3`);
        });
    }

    const manaBtn = document.getElementById('resource-mana');
    if (manaBtn) manaBtn.addEventListener('click', openManaSheet);

    const gritBtn = document.getElementById('resource-grit');
    if (gritBtn) gritBtn.addEventListener('click', openGritSheet);

    const hpCard = document.getElementById('hero-points-card');
    if (hpCard) hpCard.addEventListener('click', openHeroPointsSheet);

    const statusesEl = document.getElementById('statuses-chips');
    if (statusesEl) {
        statusesEl.addEventListener('click', (e) => {
            const chip = e.target.closest('.status-chip');
            if (chip) { openStatusEditSheet(chip.dataset.statusId); return; }
            const addBtn = e.target.closest('#status-add');
            if (addBtn) openStatusPickerSheet();
        });
    }

    const restBtn = document.getElementById('btn-short-rest');
    if (restBtn) restBtn.addEventListener('click', confirmShortRest);
}


/* ═══════════════════════════════════════════════════════════════
   BOTTOM SHEETS — système générique de modale glissante
   ═══════════════════════════════════════════════════════════════ */

function openBottomSheet(title, contentHtml, onShow) {
    const backdrop = document.getElementById('bottom-sheet-backdrop');
    document.getElementById('bottom-sheet-title').textContent = title;
    const contentEl = document.getElementById('bottom-sheet-content');
    contentEl.innerHTML = contentHtml;
    backdrop.hidden = false;
    if (typeof onShow === 'function') onShow(contentEl);
}

function closeBottomSheet() {
    document.getElementById('bottom-sheet-backdrop').hidden = true;
    document.getElementById('bottom-sheet-content').innerHTML = '';
}

function bindBottomSheetGlobalActions() {
    const backdrop = document.getElementById('bottom-sheet-backdrop');
    document.getElementById('bottom-sheet-close').addEventListener('click', closeBottomSheet);
    backdrop.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeBottomSheet();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !backdrop.hidden) closeBottomSheet();
    });
}


/* ─── Sheet générique : compteur (+/− avec min/max) ──────── */
function openCounterSheet(opts) {
    /* opts : { title, current, max, min=0, onChange(newValue), showResetFull=true } */
    const showResetFull = opts.showResetFull !== false;
    const html = `
        <div class="counter-sheet">
            <div class="counter-display">
                <span class="counter-value" id="counter-val">${opts.current}</span>
                ${opts.max != null ? `<span class="counter-max">/ ${opts.max}</span>` : ''}
            </div>
            <div class="counter-controls">
                <button class="counter-btn" type="button" data-delta="-1">−1</button>
                <button class="counter-btn primary" type="button" data-delta="-3">−3</button>
                <button class="counter-btn primary" type="button" data-delta="3">+3</button>
                <button class="counter-btn" type="button" data-delta="1">+1</button>
            </div>
            ${showResetFull ? `
            <div class="counter-actions">
                <button class="counter-action" type="button" data-action="reset">Vider</button>
                ${opts.max != null ? '<button class="counter-action" type="button" data-action="full">Au max</button>' : ''}
            </div>
            ` : ''}
        </div>
    `;

    openBottomSheet(opts.title, html, (contentEl) => {
        let value = opts.current;
        const valEl = contentEl.querySelector('#counter-val');
        const min = opts.min != null ? opts.min : 0;

        function update(newValue) {
            value = Math.max(min, opts.max != null ? Math.min(opts.max, newValue) : newValue);
            valEl.textContent = value;
            opts.onChange(value);
        }

        contentEl.querySelectorAll('[data-delta]').forEach(btn => {
            btn.addEventListener('click', () => update(value + parseInt(btn.dataset.delta, 10)));
        });
        const resetBtn = contentEl.querySelector('[data-action="reset"]');
        if (resetBtn) resetBtn.addEventListener('click', () => update(min));
        const fullBtn = contentEl.querySelector('[data-action="full"]');
        if (fullBtn) fullBtn.addEventListener('click', () => update(opts.max));
    });
}


/* ─── Sheets spécifiques : Mana, Grit, AP, Defense, Hero Points ── */
function openManaSheet() {
    openCounterSheet({
        title: 'Mana',
        current: currentFiche.mana_current,
        max: currentFiche.mana_max,
        onChange: (v) => {
            currentFiche.mana_current = v;
            saveFiche();
            renderFiche(currentFiche);
        },
    });
}

function openGritSheet() {
    openCounterSheet({
        title: 'Grit',
        current: currentFiche.grit_current,
        max: currentFiche.grit_max,
        onChange: (v) => {
            currentFiche.grit_current = v;
            saveFiche();
            renderFiche(currentFiche);
        },
    });
}

function openApSheet() {
    openCounterSheet({
        title: 'Action Points',
        current: currentFiche.ap_current,
        max: null,
        onChange: (v) => {
            currentFiche.ap_current = v;
            saveFiche();
            renderVitalBar(currentFiche);
        },
    });
}

function openDefenseSheet() {
    openCounterSheet({
        title: 'Defense',
        current: currentFiche.defense_current,
        max: currentFiche.defense_max,
        onChange: (v) => {
            currentFiche.defense_current = v;
            saveFiche();
            renderVitalBar(currentFiche);
        },
    });
}

function openHeroPointsSheet() {
    openCounterSheet({
        title: 'Hero Points',
        current: currentFiche.hp_current,
        max: currentFiche.hp_max,
        onChange: (v) => {
            currentFiche.hp_current = v;
            saveFiche();
            renderAll();
        },
    });
}


/* ─── Sheet : Wounds (3 tiers) ─────────────────────────── */
function openWoundsSheet() {
    const tierInfo = {
        light:  { label: 'Light',  effect: 'Coup encaissé, pas de pénalité forte' },
        heavy:  { label: 'Heavy',  effect: 'Blessure sérieuse, pénalités possibles' },
        deadly: { label: 'Deadly', effect: 'Blessure mortelle, à surveiller' },
    };

    let html = '<div class="wounds-sheet">';
    for (const tier of ['light', 'heavy', 'deadly']) {
        const count = currentFiche.wounds[tier] || 0;
        html += `
            <div class="wound-row${count > 0 ? ' has-wound' : ''}" data-tier="${tier}">
                <div class="wound-info">
                    <span class="wound-name">${tierInfo[tier].label}</span>
                    <span class="wound-effect">${tierInfo[tier].effect}</span>
                </div>
                <div class="wound-counter">
                    <button class="wound-btn" type="button" data-tier="${tier}" data-delta="-1" aria-label="Retirer">−</button>
                    <span class="wound-count" id="wc-${tier}">${count}</span>
                    <button class="wound-btn" type="button" data-tier="${tier}" data-delta="1" aria-label="Ajouter">+</button>
                </div>
            </div>
        `;
    }
    html += '</div>';

    openBottomSheet('Wounds', html, (contentEl) => {
        contentEl.querySelectorAll('.wound-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tier = btn.dataset.tier;
                const delta = parseInt(btn.dataset.delta, 10);
                const newVal = Math.max(0, (currentFiche.wounds[tier] || 0) + delta);
                currentFiche.wounds[tier] = newVal;
                saveFiche();
                contentEl.querySelector(`#wc-${tier}`).textContent = newVal;
                contentEl.querySelector(`.wound-row[data-tier="${tier}"]`)
                    .classList.toggle('has-wound', newVal > 0);
                renderVitalBar(currentFiche);
            });
        });
    });
}


/* ─── Sheet : Status picker ─────────────────────────────── */
function openStatusPickerSheet() {
    const activeIds = new Set(currentFiche.statuses.map(s => s.id));

    let html = '<div class="status-picker">';
    for (const cat of STATUSES_CATALOG) {
        const isActive = activeIds.has(cat.id);
        const colorTag = cat.color === 'crimson' ? 'crimson-tag' : 'shadow-tag';
        const meta = cat.hasIntensity
            ? '⚡ avec intensité'
            : (isActive ? 'tap pour retirer' : 'simple');
        html += `
            <button type="button" class="status-pick-btn ${colorTag}${isActive ? ' active' : ''}" data-id="${cat.id}">
                <span class="status-pick-name">${cat.nom}${isActive ? ' ✓' : ''}</span>
                <span class="status-pick-meta">${meta}</span>
            </button>
        `;
    }
    html += '</div>';

    openBottomSheet('Statuses', html, (contentEl) => {
        contentEl.querySelectorAll('.status-pick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const cat = STATUSES_CATALOG.find(s => s.id === id);
                if (!cat) return;

                const idx = currentFiche.statuses.findIndex(s => s.id === id);
                if (idx >= 0) {
                    currentFiche.statuses.splice(idx, 1);
                    showToast(`${cat.nom} retiré`);
                } else {
                    currentFiche.statuses.push({
                        id: cat.id,
                        nom: cat.nom,
                        value: cat.hasIntensity ? 1 : 0,
                        hasIntensity: cat.hasIntensity,
                    });
                    showToast(`${cat.nom} ajouté`);
                }
                saveFiche();
                renderFiche(currentFiche);
                closeBottomSheet();
            });
        });
    });
}


/* ─── Sheet : Status edit (modifier ou retirer) ─────────── */
function openStatusEditSheet(statusId) {
    const status = currentFiche.statuses.find(s => s.id === statusId);
    if (!status) return;

    let html = `<div class="status-edit">
        <div class="status-edit-name">${status.nom}</div>`;

    if (status.hasIntensity) {
        html += `
            <div class="counter-display">
                <span class="counter-value" id="status-val">${status.value}</span>
                <span class="counter-max">intensité</span>
            </div>
            <div class="counter-controls">
                <button class="counter-btn" type="button" data-delta="-1">−1</button>
                <button class="counter-btn primary" type="button" data-delta="-2">−2</button>
                <button class="counter-btn primary" type="button" data-delta="2">+2</button>
                <button class="counter-btn" type="button" data-delta="1">+1</button>
            </div>
        `;
    } else {
        html += `<p class="confirm-message" style="margin-bottom: 16px;">Status simple, sans intensité.</p>`;
    }

    html += `
        <div class="confirm-actions" style="margin-top: 16px;">
            <button class="confirm-btn cancel" type="button" data-action="close">Fermer</button>
            <button class="confirm-btn confirm" type="button" data-action="remove" style="background: var(--crimson); color: #f5e8c5; border-color: var(--crimson-bright);">Retirer</button>
        </div>
    </div>`;

    openBottomSheet(`Modifier · ${status.nom}`, html, (contentEl) => {
        if (status.hasIntensity) {
            const valEl = contentEl.querySelector('#status-val');
            contentEl.querySelectorAll('[data-delta]').forEach(btn => {
                btn.addEventListener('click', () => {
                    status.value = Math.max(1, status.value + parseInt(btn.dataset.delta, 10));
                    valEl.textContent = status.value;
                    saveFiche();
                    renderFiche(currentFiche);
                });
            });
        }
        contentEl.querySelector('[data-action="close"]').addEventListener('click', closeBottomSheet);
        contentEl.querySelector('[data-action="remove"]').addEventListener('click', () => {
            currentFiche.statuses = currentFiche.statuses.filter(s => s.id !== statusId);
            saveFiche();
            renderFiche(currentFiche);
            closeBottomSheet();
            showToast(`${status.nom} retiré`);
        });
    });
}


/* ═══════════════════════════════════════════════════════════════
   SHORT REST — règle officielle Drakonym
   ═══════════════════════════════════════════════════════════════ */
function confirmShortRest() {
    if (currentFiche.short_rests_used >= 3) {
        showToast("3 Short Rests déjà utilisés aujourd'hui");
        return;
    }

    const refillAmount = 3 + Math.ceil(currentFiche.niveau / 2);
    const html = `
        <div class="confirm-sheet">
            <p class="confirm-message">
                <strong>Short Rest</strong> appliquera&nbsp;:<br><br>
                ▸ Wounds&nbsp;: Heavy → Light, Light → 0<br>
                ▸ Mana et Grit&nbsp;: +${refillAmount} chacun<br>
                ▸ Compteur&nbsp;: ${currentFiche.short_rests_used + 1} / 3
            </p>
            <div class="confirm-actions">
                <button class="confirm-btn cancel" type="button" data-action="cancel">Annuler</button>
                <button class="confirm-btn confirm" type="button" data-action="confirm">Confirmer</button>
            </div>
        </div>
    `;

    openBottomSheet('Short Rest', html, (contentEl) => {
        contentEl.querySelector('[data-action="cancel"]').addEventListener('click', closeBottomSheet);
        contentEl.querySelector('[data-action="confirm"]').addEventListener('click', () => {
            // Wounds : décale d'un tier vers le bas (Deadly inchangé par règle)
            const oldHeavy = currentFiche.wounds.heavy || 0;
            currentFiche.wounds.light = oldHeavy; // l'ancien Light disparaît, le Heavy devient Light
            currentFiche.wounds.heavy = 0;

            // Mana / Grit
            currentFiche.mana_current = Math.min(currentFiche.mana_max, currentFiche.mana_current + refillAmount);
            currentFiche.grit_current = Math.min(currentFiche.grit_max, currentFiche.grit_current + refillAmount);

            currentFiche.short_rests_used += 1;

            saveFiche();
            renderAll();
            closeBottomSheet();
            showToast('Short Rest appliqué');
        });
    });
}


/* ═══════════════════════════════════════════════════════════════
   FAB — placeholder Vague 3
   ═══════════════════════════════════════════════════════════════ */
function bindFab() {
    const fab = document.getElementById('fab-dice');
    if (!fab) return;
    fab.addEventListener('click', () => {
        showToast('Lanceur de dés — à venir en Vague 3');
    });
}


/* ═══════════════════════════════════════════════════════════════
   TOAST — message éphémère
   ═══════════════════════════════════════════════════════════════ */
let toastTimer = null;
function showToast(message, duration = 1800) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), duration);
}


/* ═══════════════════════════════════════════════════════════════
   INSTALLATION PWA
   ═══════════════════════════════════════════════════════════════ */
let deferredInstallPrompt = null;

function setupInstallFlow() {
    const btnInstall = document.getElementById('btn-install');
    const statusHint = document.getElementById('install-status-hint');
    if (!btnInstall || !statusHint) return;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;

    if (isStandalone) {
        statusHint.innerHTML = '✓ <strong>App installée</strong> et lancée en mode plein écran.';
        return;
    }
    if (isIOS) {
        statusHint.innerHTML = "Sur iOS, l'installation se fait manuellement&nbsp;: tap le bouton <strong>Partager</strong> dans Safari, puis <em>«&nbsp;Sur l'écran d'accueil&nbsp;»</em>.";
        return;
    }

    statusHint.textContent = "Si ton navigateur supporte l'installation, un bouton apparaîtra ici dans quelques secondes.";

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredInstallPrompt = e;
        btnInstall.hidden = false;
        statusHint.textContent = "Ton appareil est prêt à installer l'app.";
    });

    btnInstall.addEventListener('click', async () => {
        if (!deferredInstallPrompt) return;
        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;
        if (outcome === 'accepted') showToast('Installation en cours...');
        else showToast('Installation annulée');
        deferredInstallPrompt = null;
        btnInstall.hidden = true;
    });

    window.addEventListener('appinstalled', () => {
        showToast('App installée avec succès !');
        statusHint.innerHTML = '✓ <strong>App installée.</strong>';
        btnInstall.hidden = true;
    });
}


/* ═══════════════════════════════════════════════════════════════
   SERVICE WORKER + STARTUP
   ═══════════════════════════════════════════════════════════════ */
function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('service-worker.js')
            .then(reg => console.log('SW enregistré, scope :', reg.scope))
            .catch(err => console.warn('SW échec :', err));
    });
}

function handleStartupAction() {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    if (action === 'dice') showToast('Raccourci dés — bientôt');
    else if (action === 'fiches') {
        switchToTab('plus');
        showToast('Raccourci fiches — bientôt');
    }
}


/* ═══════════════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════════════ */
function init() {
    currentFiche = loadFiche();

    applyTheme(getStoredTheme());
    bindThemeToggle();
    bindTabNavigation();
    bindVitalBarActions();
    bindFicheActions();
    bindFab();
    bindBottomSheetGlobalActions();
    setupInstallFlow();

    renderAll();

    handleStartupAction();
    registerServiceWorker();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
