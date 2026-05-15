/* ═══════════════════════════════════════════════════════════════
   DRAKONYM COMPAGNON — APP.JS
   Vague 2 : Fiche complète + bottom sheets + persistance localStorage.
   ═══════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════
   DATA LAYER — fiche par défaut, statuses officiels, persistance
   ═══════════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'drakonym_compagnon_v1';

/* Structure de défaut utilisée par mergeFicheDefaults pour garantir l'existence des champs.
   Plus aucune donnée démo : à la première ouverture, createBlankFiche() crée une fiche vierge. */
const FICHE_DEMO = {
    nom: '',
    niveau: 1,
    kin: '',
    classe: '',
    voie: '',
    carriere: '',
    primary: 'Body',
    attributs: { Body: 1, Mind: 1, Soul: 1, Shadow: 1, Gods: 1, World: 1 },
    hp_current: 1,
    hp_max: 3,
    wounds: {
        light: 0, heavy: 0, deadly: 0,
        light_max: 3, heavy_max: 3, deadly_max: 3,
    },
    ap_current: 0,
    defense_current: 0,
    defense_max: 0,
    armure_bonus: 0,
    mana_current: 0,
    mana_max: 0,
    grit_current: 0,
    grit_max: 0,
    short_rests_used: 0,
    spell_bonus: 0,
    statuses: [],
    perks: [],
    sorts: [],
    techniques: [],
    wild_perks: [],
    draviks: 0,
    weapons: [],
    armors: [],
    tools: [],
    dragon: {
        nom: '', family: '', stage: 'Hatchling', speed: 6, speed_fly: 0,
        pillars: { love: '', fear: '', instinct: '' },
        attributs: { Body: 1, Mind: 1, Soul: 1 },
        bp_current: 0, bp_max: 6,
        armor_bonus: 0,
        breath: { element: '', shape: 'Cône', description: '', effect: '', charges_current: 0, charges_max: 1 },
        perks: [], weapons: [], armors: [],
    },
    apparence: '', histoire: '', liens: '', notes: '',
};

/* Les 16 statuses officiels du Core Rulebook (effets côté joueur)
   - id : identifiant en anglais (compat données desktop)
   - nomFr : nom affiché en français
   - emoji : icône visuelle
   - hasIntensity : true si X = paramètre numérique (Burning et Poisoned, où X = dégâts)
   - color : 'crimson' (sévère) ou 'shadow' (mental/contrôle)
   - description : effet en jeu, formulé en mes propres mots */
const STATUSES_CATALOG = [
    { id: 'blinded',     nomFr: 'Aveuglé',     emoji: '🙈', hasIntensity: false, color: 'shadow',  description: "Tous tes jets d'attaque subissent un Fardeau." },
    { id: 'bloodied',    nomFr: 'Ensanglanté', emoji: '🩸', hasIntensity: false, color: 'crimson', description: "Si tu prends une Blessure supplémentaire, tu meurs (drapeau narratif)." },
    { id: 'burning',     nomFr: 'En feu',      emoji: '🔥', hasIntensity: true,  color: 'crimson', description: "En début de tour, subis X Blessures Légères. Tes dégâts physiques sont divisés par 2. Coût : 1 AP/PL pour étouffer." },
    { id: 'charmed',     nomFr: 'Charmé',      emoji: '💞', hasIntensity: false, color: 'shadow',  description: "Tu ne peux pas cibler le charmeur. L'effet se termine si lui ou ses alliés te blessent." },
    { id: 'confused',    nomFr: 'Confus',      emoji: '😵\u200d💫', hasIntensity: false, color: 'shadow',  description: "En début de tour, lance 1d6. 1-3 = agis erratiquement (le Herald décide), 4-6 = normal." },
    { id: 'dazed',       nomFr: 'Hébété',      emoji: '😶\u200d🌫️', hasIntensity: false, color: 'shadow',  description: "Pool d'AP réduit de 1, PL du dragon réduit de 2. Tes interruptions subissent un Fardeau." },
    { id: 'frightened',  nomFr: 'Effrayé',     emoji: '😱', hasIntensity: false, color: 'shadow',  description: "Tu ne peux pas cibler la source de la peur. Tant qu'elle est en vue, Fardeau sur tous tes jets." },
    { id: 'frozen',      nomFr: 'Gelé',        emoji: '🧊', hasIntensity: false, color: 'shadow',  description: "Tu ne peux pas bouger. Toute attaque physique te fait moitié des dégâts en plus." },
    { id: 'knocked_down',nomFr: 'À terre',     emoji: '🤕', hasIntensity: false, color: 'shadow',  description: "Tu es à terre. Coût : 1 AP/PL pour te relever." },
    { id: 'poisoned',    nomFr: 'Empoisonné',  emoji: '🧪', hasIntensity: true,  color: 'crimson', description: "À la fin de chaque round, subis X Blessures Légères. Double à chaque round non traité. Coût : 1 AP pour traiter ou utiliser un antidote." },
    { id: 'rooted',      nomFr: 'Enraciné',    emoji: '🌿', hasIntensity: false, color: 'shadow',  description: "Tu ne peux pas bouger. Tu ne peux pas dépenser de la Défense pour bloquer." },
    { id: 'silenced',    nomFr: 'Bâillonné',   emoji: '🤐', hasIntensity: false, color: 'shadow',  description: "Tu ne peux pas parler ni lancer de sort, sauf via une capacité de type Incantation silencieuse." },
    { id: 'slowed',      nomFr: 'Ralenti',     emoji: '🐢', hasIntensity: false, color: 'shadow',  description: "Mouvement divisé par 2." },
    { id: 'stunned',     nomFr: 'Sonné',       emoji: '⚡', hasIntensity: false, color: 'shadow',  description: "Tu ne peux pas utiliser d'interruptions." },
    { id: 'unseen',      nomFr: 'Invisible',   emoji: '👻', hasIntensity: false, color: 'shadow',  description: "Tant que tu n'es pas détecté, tu ne peux pas être ciblé. Tes attaques gagnent une Faveur." },
    { id: 'weakened',    nomFr: 'Affaibli',    emoji: '💪', hasIntensity: false, color: 'shadow',  description: "Tes jets d'attaque subissent Fardeau 2." },
];


/* Helper : retrouve les infos d'un status à partir de son id */
function getStatusCat(id) {
    return STATUSES_CATALOG.find(c => c.id === id) || null;
}

/* Ajoute une wound à un tier, avec overflow vers le tier supérieur si plein.
   Retourne true si tout s'est bien passé, false si overflow Deadly (= mort). */
function addWound(startTier) {
    const tiers = ['light', 'heavy', 'deadly'];
    const startIdx = tiers.indexOf(startTier);
    if (startIdx < 0) return false;

    let i = startIdx;
    while (i < tiers.length) {
        const t = tiers[i];
        const max = currentFiche.wounds[t + '_max'] || 3;
        if ((currentFiche.wounds[t] || 0) < max) {
            currentFiche.wounds[t] = (currentFiche.wounds[t] || 0) + 1;
            saveFiche();
            renderVitalBar(currentFiche);
            if (i > startIdx) {
                const niceName = { light: 'Légères', heavy: 'Graves', deadly: 'Mortelles' };
                showToast(`Track ${niceName[startTier]} pleine → +1 ${niceName[t]}`);
            }
            return true;
        }
        i++;
    }
    // Toutes les tracks sont pleines, y compris Deadly
    showToast('💀 Blessures débordent — la mort possible !');
    return false;
}

/* Retire une wound à un tier (sans cascade vers le bas). */
function removeWound(tier) {
    if ((currentFiche.wounds[tier] || 0) > 0) {
        currentFiche.wounds[tier] -= 1;
        saveFiche();
        renderVitalBar(currentFiche);
    }
}


/* État courant de la fiche */
let currentFiche = null;


/* ═══════════════════════════════════════════════════════════════
   STOCKAGE MULTI-FICHES — Vague 7
   - V1 (legacy) : 'drakonym_compagnon_v1' = une seule fiche
   - V2          : 'drakonym_compagnon_fiches' = { activeId, fiches: { id: fiche, ... } }
   Migration auto : si V1 existe et V2 absent, on convertit.
   ═══════════════════════════════════════════════════════════════ */
const STORAGE_KEY_V2 = 'drakonym_compagnon_fiches';

/* Applique tous les défauts à une fiche (factorisé pour réutilisation) */
function mergeFicheDefaults(fiche) {
    const merged = Object.assign({}, FICHE_DEMO, fiche);
    // Migration : hp_max minimum 3 (règle officielle Drakonym page 15 — Players can hold up to 3 Hero Points)
    if (typeof merged.hp_max !== 'number' || merged.hp_max < 3) merged.hp_max = 3;
    if (typeof merged.hp_current !== 'number') merged.hp_current = 1;
    if (merged.hp_current > merged.hp_max) merged.hp_current = merged.hp_max;
    merged.wounds = Object.assign(
        { light: 0, heavy: 0, deadly: 0, light_max: 3, heavy_max: 3, deadly_max: 3 },
        merged.wounds || {}
    );
    if (Array.isArray(merged.statuses)) {
        const validIds = new Set(STATUSES_CATALOG.map(c => c.id));
        merged.statuses = merged.statuses.filter(s => validIds.has(s.id));
    }
    // Migration v1.14 : champs voie + carriere
    if (typeof merged.voie !== 'string') merged.voie = '';
    if (typeof merged.carriere !== 'string') merged.carriere = '';
    // Capacités (Vague 4)
    if (!Array.isArray(merged.perks)) merged.perks = [];
    if (!Array.isArray(merged.sorts)) merged.sorts = [];
    if (!Array.isArray(merged.techniques)) merged.techniques = [];
    if (!Array.isArray(merged.wild_perks)) merged.wild_perks = [];
    if (typeof merged.spell_bonus !== 'number') merged.spell_bonus = 0;
    // Équipement (Vague 5)
    if (typeof merged.draviks !== 'number') merged.draviks = 0;
    if (!Array.isArray(merged.weapons)) merged.weapons = [];
    if (!Array.isArray(merged.armors)) merged.armors = [];
    if (!Array.isArray(merged.tools)) merged.tools = [];
    // Dragon (Vague 6)
    merged.dragon = Object.assign({
        nom: '', family: '', stage: 'Hatchling', speed: 6, speed_fly: 0,
        pillars: { love: '', fear: '', instinct: '' },
        attributs: { Body: 1, Mind: 1, Soul: 1 },
        bp_current: 0, bp_max: 6,
        armor_bonus: 0,
        breath: { element: '', shape: 'Cône', description: '', effect: '', charges_current: 0, charges_max: 1 },
        perks: [], weapons: [], armors: [],
    }, merged.dragon || {});
    merged.dragon.pillars = Object.assign({ love: '', fear: '', instinct: '' }, merged.dragon.pillars || {});
    merged.dragon.attributs = Object.assign({ Body: 1, Mind: 1, Soul: 1 }, merged.dragon.attributs || {});
    merged.dragon.breath = Object.assign({ element: '', shape: 'Cône', description: '', effect: '', charges_current: 0, charges_max: 1 }, merged.dragon.breath || {});
    if (!Array.isArray(merged.dragon.perks)) merged.dragon.perks = [];
    if (!Array.isArray(merged.dragon.weapons)) merged.dragon.weapons = [];
    if (!Array.isArray(merged.dragon.armors)) merged.dragon.armors = [];
    if (typeof merged.dragon.speed_fly !== 'number') merged.dragon.speed_fly = 0;
    // Histoire (Vague 7)
    if (typeof merged.apparence !== 'string') merged.apparence = '';
    if (typeof merged.histoire !== 'string') merged.histoire = '';
    if (typeof merged.liens !== 'string') merged.liens = '';
    if (typeof merged.notes !== 'string') merged.notes = '';
    if (typeof merged._fiche_id !== 'string' || !merged._fiche_id) {
        merged._fiche_id = 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    }
    return merged;
}

/* Lit le store V2 — migre depuis V1 si nécessaire, ou crée vide. */
function loadStore() {
    // Tentative V2
    try {
        const raw = localStorage.getItem(STORAGE_KEY_V2);
        if (raw) {
            const store = JSON.parse(raw);
            if (store && store.fiches && typeof store.fiches === 'object') {
                return store;
            }
        }
    } catch (e) {}
    // Migration V1 → V2
    try {
        const oldRaw = localStorage.getItem(STORAGE_KEY);
        if (oldRaw) {
            const oldFiche = JSON.parse(oldRaw);
            const merged = mergeFicheDefaults(oldFiche);
            const store = { activeId: merged._fiche_id, fiches: { [merged._fiche_id]: merged } };
            saveStore(store);
            return store;
        }
    } catch (e) {}
    // Aucune donnée : crée store vide (loadFiche y mettra une fiche démo)
    return { activeId: null, fiches: {} };
}

function saveStore(store) {
    try { localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(store)); }
    catch (e) { console.warn('Impossible de sauvegarder le store :', e); }
}


function loadFiche() {
    const store = loadStore();
    if (store.activeId && store.fiches[store.activeId]) {
        return mergeFicheDefaults(store.fiches[store.activeId]);
    }
    // Aucune fiche : crée une fiche vierge et la rend active
    const blank = createBlankFiche('Nouveau personnage');
    store.activeId = blank._fiche_id;
    store.fiches[blank._fiche_id] = blank;
    saveStore(store);
    return blank;
}

function saveFiche() {
    try {
        const store = loadStore();
        // Si pas d'active, on en assigne un (cas edge)
        if (!currentFiche._fiche_id) {
            currentFiche._fiche_id = 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
        }
        if (!store.activeId) store.activeId = currentFiche._fiche_id;
        store.fiches[currentFiche._fiche_id] = currentFiche;
        saveStore(store);
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

function bindSoundToggle() {
    const btn = document.getElementById('btn-sound-dice');
    if (!btn) return;
    refreshSoundDiceToggle();
    btn.addEventListener('click', () => {
        setDiceSoundEnabled(!isDiceSoundEnabled());
        if (isDiceSoundEnabled()) {
            // Test audible immédiat (pour confirmer que c'est activé)
            playDiceRollSound(3);
            showToast('🎲 Son des dés activé');
        } else {
            showToast('🔇 Son des dés désactivé');
        }
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
    // Sync sidebar gauche desktop
    document.querySelectorAll('.desktop-nav-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.desktopTab === tabName);
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
    renderCapacites();
    renderEquipement();
    renderDragon();
    renderConfigFields();
    renderHistoireFields();
    refreshDesktopPersona();
    renderDesktopEquipped();
    renderDesktopRollsLog();
    if (_combatMode) renderCombatPanel();
}

function renderVitalBar(f) {
    document.getElementById('vital-name').textContent = f.nom;
    const subtitleParts = [f.kin, f.classe, f.voie].filter(Boolean).map(s => s.toUpperCase());
    document.getElementById('vital-subtitle').textContent = subtitleParts.join(' · ');
    document.getElementById('vital-level').textContent = f.niveau;

    const hpDisplay = document.getElementById('vital-hp-display');
    hpDisplay.innerHTML = '';
    for (let i = 0; i < f.hp_max; i++) {
        const pip = document.createElement('span');
        pip.className = 'hp-pip' + (i < f.hp_current ? ' filled' : '');
        hpDisplay.appendChild(pip);
    }

    // Blessures : un pip par tier, rempli s'il y a au moins 1 wound à ce tier
    const woundsDisplay = document.getElementById('vital-wounds-display');
    woundsDisplay.innerHTML = '';
    ['light', 'heavy', 'deadly'].forEach(tier => {
        const count = f.wounds[tier] || 0;
        const pip = document.createElement('span');
        pip.className = 'wound-pip' + (count > 0 ? ` filled tier-${tier}` : '');
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
        for (const t of [f.kin, f.classe, f.voie, f.carriere]) {
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

    // (Points de Héros : seulement dans la Vital Bar maintenant, plus de carte dédiée)

    const statusesEl = document.getElementById('statuses-chips');
    statusesEl.innerHTML = '';
    for (const s of f.statuses) {
        const cat = getStatusCat(s.id);
        if (!cat) continue;
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'status-chip' + (cat.color === 'crimson' ? ' crimson' : '');
        chip.dataset.statusId = s.id;
        let html = `<span class="status-chip-emoji">${cat.emoji}</span> ${cat.nomFr}`;
        if (cat.hasIntensity && (s.value || 0) > 0) {
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
    // Toggle Mode Combat
    const combatToggle = document.getElementById('vital-combat-toggle');
    if (combatToggle) {
        combatToggle.addEventListener('click', () => setCombatMode(!isCombatMode()));
    }
}

function bindFicheActions() {
    const attrsEl = document.getElementById('attributes-grid');
    if (attrsEl) {
        attrsEl.addEventListener('click', (e) => {
            const cell = e.target.closest('.attribute-cell');
            if (!cell) return;
            // Tap sur un attribut → ouvre le lanceur de dés pré-rempli avec cet attribut
            openDiceRoller([cell.dataset.attribute]);
        });
    }

    const manaBtn = document.getElementById('resource-mana');
    if (manaBtn) manaBtn.addEventListener('click', openManaSheet);

    const gritBtn = document.getElementById('resource-grit');
    if (gritBtn) gritBtn.addEventListener('click', openGritSheet);

    // (Points de Héros carte retirée — l'accès reste via la Vital Bar)

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
    const downBtn = document.getElementById('btn-downtime');
    if (downBtn) downBtn.addEventListener('click', confirmDowntime);
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


/* ─── Sheets spécifiques : Mana, Grit, AP, Defense, Points de Héros ── */
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
        title: "Points d'Action",
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
        title: 'Défense',
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
        title: 'Points de Héros',
        current: currentFiche.hp_current,
        max: currentFiche.hp_max,
        onChange: (v) => {
            currentFiche.hp_current = v;
            saveFiche();
            renderAll();
        },
    });
}


/* ─── Sheet : Blessures (3 tracks indépendants avec overflow) ─── */
function openWoundsSheet() {
    const tierLabels = { light: 'Légères', heavy: 'Graves', deadly: 'Mortelles' };

    function buildHtml() {
        let html = '<div class="wounds-sheet">';
        for (const tier of ['light', 'heavy', 'deadly']) {
            const count = currentFiche.wounds[tier] || 0;
            const max = currentFiche.wounds[tier + '_max'] || 3;
            let boxesHtml = '';
            for (let i = 0; i < max; i++) {
                const filled = i < count ? ` filled tier-${tier}` : '';
                boxesHtml += `<span class="wound-box clickable${filled}" data-tier="${tier}" data-index="${i}" role="button" tabindex="0" aria-label="Case ${i + 1}"></span>`;
            }
            html += `
                <div class="wound-track tier-${tier}" data-tier="${tier}">
                    <div class="wound-track-header">
                        <span class="wound-track-name">${tierLabels[tier]}</span>
                        <span class="wound-track-count" id="wt-count-${tier}">${count} / ${max}</span>
                    </div>
                    <div class="wound-track-row">
                        <div class="wound-track-boxes" id="wt-boxes-${tier}">${boxesHtml}</div>
                        <div class="wound-track-buttons">
                            <button class="wound-btn" type="button" data-tier="${tier}" data-action="dec" aria-label="Retirer">−</button>
                            <button class="wound-btn" type="button" data-tier="${tier}" data-action="inc" aria-label="Ajouter">+</button>
                        </div>
                    </div>
                </div>
            `;
        }
        html += `<p class="wounds-hint">💡 Tape directement sur une case pour la cocher, ou utilise les boutons +/−. Une track pleine → la blessure suivante déborde au tier supérieur. Une Mortelle qui déborde = mort.</p></div>`;
        return html;
    }

    function refreshTrack(contentEl, tier) {
        const count = currentFiche.wounds[tier] || 0;
        const max = currentFiche.wounds[tier + '_max'] || 3;
        const boxesEl = contentEl.querySelector(`#wt-boxes-${tier}`);
        let boxesHtml = '';
        for (let i = 0; i < max; i++) {
            const filled = i < count ? ` filled tier-${tier}` : '';
            boxesHtml += `<span class="wound-box clickable${filled}" data-tier="${tier}" data-index="${i}" role="button" tabindex="0" aria-label="Case ${i + 1}"></span>`;
        }
        boxesEl.innerHTML = boxesHtml;
        contentEl.querySelector(`#wt-count-${tier}`).textContent = `${count} / ${max}`;
    }

    /* Logique click sur case :
       - Si on clique sur une case non remplie (i >= count) → count = i + 1 (remplit jusque là)
       - Si on clique sur la dernière case remplie (i === count - 1) → count = i (décrémente d'1)
       - Sinon (clique sur une case remplie pas la dernière) → count = i + 1 (réajuste vers le bas) */
    function handleBoxClick(tier, index) {
        const oldCount = currentFiche.wounds[tier] || 0;
        let newCount;
        if (index >= oldCount) {
            newCount = index + 1;  // remplit jusque là
        } else if (index === oldCount - 1) {
            newCount = index;  // décrémente
        } else {
            newCount = index + 1;  // ajuste
        }
        const delta = newCount - oldCount;
        if (delta > 0) {
            for (let k = 0; k < delta; k++) addWound(tier);
        } else if (delta < 0) {
            for (let k = 0; k < -delta; k++) removeWound(tier);
        }
    }

    openBottomSheet('Blessures', buildHtml(), (contentEl) => {
        // Listeners pour les cases cliquables (délégation)
        contentEl.addEventListener('click', (ev) => {
            const box = ev.target.closest('.wound-box.clickable');
            if (!box) return;
            const tier = box.dataset.tier;
            const idx = parseInt(box.dataset.index, 10);
            if (isNaN(idx)) return;
            handleBoxClick(tier, idx);
            ['light', 'heavy', 'deadly'].forEach(t => refreshTrack(contentEl, t));
        });

        // Support clavier (Enter / Space)
        contentEl.addEventListener('keydown', (ev) => {
            if (ev.key !== 'Enter' && ev.key !== ' ') return;
            const box = ev.target.closest && ev.target.closest('.wound-box.clickable');
            if (!box) return;
            ev.preventDefault();
            const tier = box.dataset.tier;
            const idx = parseInt(box.dataset.index, 10);
            if (isNaN(idx)) return;
            handleBoxClick(tier, idx);
            ['light', 'heavy', 'deadly'].forEach(t => refreshTrack(contentEl, t));
        });

        contentEl.querySelectorAll('.wound-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tier = btn.dataset.tier;
                const action = btn.dataset.action;
                if (action === 'inc') {
                    addWound(tier); // gère l'overflow et le toast tout seul
                } else {
                    removeWound(tier);
                }
                // Rafraîchir tous les tracks (overflow peut affecter d'autres tiers)
                ['light', 'heavy', 'deadly'].forEach(t => refreshTrack(contentEl, t));
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
        const intensityIcon = cat.hasIntensity ? '<span class="status-pick-intensity" title="Avec intensité">⚡</span>' : '';
        html += `
            <button type="button" class="status-pick-btn ${colorTag}${isActive ? ' active' : ''}" data-id="${cat.id}">
                <div class="status-pick-name"><span class="status-chip-emoji">${cat.emoji}</span> ${cat.nomFr}${isActive ? ' ✓' : ''}${intensityIcon}</div>
                <div class="status-pick-desc">${cat.description}</div>
            </button>
        `;
    }
    html += '</div>';

    openBottomSheet('Statuts · ajouter ou retirer', html, (contentEl) => {
        contentEl.querySelectorAll('.status-pick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const cat = getStatusCat(id);
                if (!cat) return;

                const idx = currentFiche.statuses.findIndex(s => s.id === id);
                if (idx >= 0) {
                    currentFiche.statuses.splice(idx, 1);
                    showToast(`${cat.nomFr} retiré`);
                } else {
                    currentFiche.statuses.push({
                        id: cat.id,
                        value: cat.hasIntensity ? 1 : 0,
                    });
                    showToast(`${cat.nomFr} ajouté`);
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
    const cat = getStatusCat(statusId);
    if (!cat) return;

    let html = `<div class="status-edit">
        <div class="status-edit-name"><span class="status-chip-emoji">${cat.emoji}</span> ${cat.nomFr}</div>
        <p class="status-edit-desc">${cat.description}</p>`;

    if (cat.hasIntensity) {
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
    }

    html += `
        <div class="confirm-actions" style="margin-top: 16px;">
            <button class="confirm-btn cancel" type="button" data-action="close">Fermer</button>
            <button class="confirm-btn confirm" type="button" data-action="remove" style="background: var(--crimson); color: #f5e8c5; border-color: var(--crimson-bright);">Retirer</button>
        </div>
    </div>`;

    openBottomSheet(`Modifier · ${cat.nomFr}`, html, (contentEl) => {
        if (cat.hasIntensity) {
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
            showToast(`${cat.nomFr} retiré`);
        });
    });
}


/* ═══════════════════════════════════════════════════════════════
   SHORT REST — règle officielle Drakonym
   ═══════════════════════════════════════════════════════════════ */
function confirmShortRest() {
    if (currentFiche.short_rests_used >= 3) {
        showToast("3 Repos courts déjà utilisés aujourd'hui");
        return;
    }

    const refillAmount = 3 + Math.floor(currentFiche.niveau / 2);
    const dragonHasBp = currentFiche.dragon && currentFiche.dragon.bp_max > 0;
    const html = `
        <div class="confirm-sheet">
            <p class="confirm-message">
                <strong>Repos court</strong> appliquera&nbsp;:<br><br>
                ▸ Blessures&nbsp;: Graves → Légères, Légères → 0<br>
                ▸ Mana et Grit&nbsp;: +${refillAmount} chacun<br>
                ${dragonHasBp ? '▸ Bond Points dragon&nbsp;: +1<br>' : ''}
                ▸ Compteur&nbsp;: ${currentFiche.short_rests_used + 1} / 3
            </p>
            <div class="confirm-actions">
                <button class="confirm-btn cancel" type="button" data-action="cancel">Annuler</button>
                <button class="confirm-btn confirm" type="button" data-action="confirm">Confirmer</button>
            </div>
        </div>
    `;

    openBottomSheet('Repos court', html, (contentEl) => {
        contentEl.querySelector('[data-action="cancel"]').addEventListener('click', closeBottomSheet);
        contentEl.querySelector('[data-action="confirm"]').addEventListener('click', () => {
            // Blessures : Heavy → Light (transfert), Light → 0. Deadly inchangé (règle officielle).
            const oldHeavy = currentFiche.wounds.heavy || 0;
            const lightMax = currentFiche.wounds.light_max || 3;
            currentFiche.wounds.light = Math.min(lightMax, oldHeavy);
            currentFiche.wounds.heavy = 0;

            // Mana / Grit
            currentFiche.mana_current = Math.min(currentFiche.mana_max, currentFiche.mana_current + refillAmount);
            currentFiche.grit_current = Math.min(currentFiche.grit_max, currentFiche.grit_current + refillAmount);

            // BP dragon +1 (règle officielle p.23)
            if (dragonHasBp) {
                currentFiche.dragon.bp_current = Math.min(currentFiche.dragon.bp_max, (currentFiche.dragon.bp_current || 0) + 1);
            }

            currentFiche.short_rests_used += 1;

            saveFiche();
            renderAll();
            closeBottomSheet();
            showToast('Repos court appliqué');
        });
    });
}

/* ─── Downtime : long rest officiel (règle p.23) ───────── */
function confirmDowntime() {
    const f = currentFiche;
    const hasDeadly = (f.wounds.deadly || 0) > 0;
    const dragon = f.dragon || {};
    const dragonHasBp = dragon.bp_max > 0;
    const breath = (dragon && dragon.breath) || {};
    const html = `
        <div class="confirm-sheet">
            <p class="confirm-message">
                <strong>Downtime</strong> appliquera&nbsp;:<br><br>
                ▸ HP&nbsp;: ${f.hp_current}/${f.hp_max} → ${f.hp_max}/${f.hp_max}<br>
                ▸ Blessures Légères&nbsp;: ${f.wounds.light || 0} → 0<br>
                ▸ Blessures Graves&nbsp;: ${f.wounds.heavy || 0} → 0<br>
                ${hasDeadly ? '▸ <span style="color:var(--crimson)">Mortelles inchangées (nécessite une Activité de Downtime)</span><br>' : ''}
                ▸ Mana&nbsp;: ${f.mana_current}/${f.mana_max} → ${f.mana_max}/${f.mana_max}<br>
                ▸ Grit&nbsp;: ${f.grit_current}/${f.grit_max} → ${f.grit_max}/${f.grit_max}<br>
                ▸ Repos courts&nbsp;: ${f.short_rests_used}/3 → 0/3<br>
                ${dragonHasBp ? `▸ Bond Points&nbsp;: ${dragon.bp_current || 0}/${dragon.bp_max} → ${dragon.bp_max}/${dragon.bp_max}<br>` : ''}
                ${breath.charges_max > 0 ? `▸ Charges Souffle&nbsp;: ${breath.charges_current || 0}/${breath.charges_max} → ${breath.charges_max}/${breath.charges_max}<br>` : ''}
            </p>
            <div class="confirm-actions">
                <button class="confirm-btn cancel" type="button" data-action="cancel">Annuler</button>
                <button class="confirm-btn confirm" type="button" data-action="confirm">Confirmer</button>
            </div>
        </div>
    `;
    openBottomSheet('Downtime', html, (contentEl) => {
        contentEl.querySelector('[data-action="cancel"]').addEventListener('click', closeBottomSheet);
        contentEl.querySelector('[data-action="confirm"]').addEventListener('click', () => {
            f.hp_current = f.hp_max;
            f.wounds.light = 0;
            f.wounds.heavy = 0;
            // Deadly inchangé (règle officielle)
            f.mana_current = f.mana_max;
            f.grit_current = f.grit_max;
            f.short_rests_used = 0;
            if (dragonHasBp) {
                f.dragon.bp_current = f.dragon.bp_max;
            }
            if (breath.charges_max > 0) {
                f.dragon.breath.charges_current = f.dragon.breath.charges_max;
            }
            saveFiche();
            renderAll();
            closeBottomSheet();
            showToast('🌙 Downtime appliqué');
        });
    });
}


/* ═══════════════════════════════════════════════════════════════
   FAB — bouton lanceur de dés
   ═══════════════════════════════════════════════════════════════ */
function bindFab() {
    const fab = document.getElementById('fab-dice');
    if (!fab) return;
    fab.addEventListener('click', () => openDiceRoller());
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
   CAPACITÉS — Vague 4
   4 sous-onglets : Perks (passifs) / Sorts (Mana) / Techniques (Grit) / Wild Perks (one-shot)
   Toutes les listes vivent dans currentFiche.perks/sorts/techniques/wild_perks
   ═══════════════════════════════════════════════════════════════ */

/* Aspects de magie officiels (rulebook page 193) */
const SPELL_ASPECTS = ['Arcanum', 'Divinity', 'Inheric', 'Radiant', 'Untamed', 'Voidcraft'];

/* Traditions martiales officielles (rulebook page 229) */
const MARTIAL_TRADITIONS = ['Assessment', 'Momentum', 'Power', 'Precision', 'Protection', 'Suppression'];

/* Mana Cost Table (rulebook page 17) — calcule AP à partir du coût Mana */
function manaToActionCost(mana) {
    if (mana <= 2)  return 1;
    if (mana <= 4)  return 2;
    if (mana <= 6)  return 3;
    if (mana <= 8)  return 3;
    if (mana <= 10) return 4;
    if (mana <= 12) return 4;
    return 5; // 13+ MP
}
function manaToSuccesses(mana) {
    if (mana <= 2)  return 1;
    if (mana <= 4)  return 2;
    if (mana <= 6)  return 3;
    if (mana <= 8)  return 4;
    if (mana <= 10) return 5;
    if (mana <= 12) return 6;
    return 7; // 13+ MP
}

/* Génère un id unique pour un nouvel item */
function genId() {
    return 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

let currentSubtab = 'perks';


/* ─── Render : sous-onglets actifs + listes ───────────── */
function renderCapacites() {
    renderCapacitesList('perks');
    renderCapacitesList('sorts');
    renderCapacitesList('techniques');
    renderCapacitesList('wild_perks');
}

function switchSubtab(scope, name) {
    const tabSection = document.getElementById(`section-${scope}`);
    if (!tabSection) return;
    if (scope === 'capacites') currentSubtab = name;
    tabSection.querySelectorAll('.subtab').forEach(t => {
        const isActive = t.dataset.subtab === name;
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    tabSection.querySelectorAll('.subtab-section').forEach(s => {
        s.classList.toggle('active', s.dataset.subtab === name);
    });
}

function renderCapacitesList(type) {
    const items = currentFiche[type] || [];
    const listEl = document.getElementById(`list-${type}`);
    const countEl = document.getElementById(`count-${type}`);
    if (!listEl) return;

    if (countEl) countEl.textContent = items.length;

    if (items.length === 0) {
        const labels = {
            perks: "Aucun perk pour l'instant.",
            sorts: "Aucun sort dans ton grimoire.",
            techniques: "Aucune technique martiale apprise.",
            wild_perks: "Aucune Wild Perk reçue du Herald.",
        };
        listEl.innerHTML = `<div class="capacites-empty">${labels[type]}<br><br>Tape « + Ajouter » pour en créer.</div>`;
        return;
    }

    listEl.innerHTML = items.map(item => renderCapaciteItem(type, item)).join('');
}

function renderCapaciteItem(type, item) {
    const typeClass = type === 'wild_perks' ? 'type-wild'
        : type === 'sorts' ? 'type-sort'
        : type === 'techniques' ? 'type-technique'
        : 'type-perk';
    const colorClass = item.color ? ` color-${item.color}` : '';
    const usedClass = (type === 'wild_perks' && item.used) ? ' used' : '';
    const expanded = item._expanded ? ' expanded' : '';

    let costBadge = '';
    if (type === 'sorts' && item.mana_cost > 0) {
        costBadge = `<span class="capacite-item-cost mana">${item.mana_cost} MP · ${item.ap_cost || manaToActionCost(item.mana_cost)} AP</span>`;
    } else if (type === 'techniques' && item.grit_cost > 0) {
        const ap = item.ap_cost > 0 ? ` · ${item.ap_cost} AP` : '';
        costBadge = `<span class="capacite-item-cost grit">${item.grit_cost} Grit${ap}</span>`;
    }

    let metaTags = '';
    if (type === 'sorts' && item.aspect) {
        metaTags += `<span class="capacite-meta-tag">${item.aspect}</span>`;
    }
    if (type === 'techniques' && item.tradition) {
        metaTags += `<span class="capacite-meta-tag">${item.tradition}</span>`;
    }
    if (type === 'sorts' && item.mana_cost > 0) {
        metaTags += `<span class="capacite-meta-tag">${manaToSuccesses(item.mana_cost)} succès req.</span>`;
    }

    let actionsHtml = '';
    if (type === 'sorts') {
        const canCast = (currentFiche.mana_current || 0) >= (item.mana_cost || 0);
        actionsHtml = `
            <button class="capacite-action-btn primary${canCast ? '' : ' disabled'}" data-action="cast" data-id="${item.id}">
                ${canCast ? '✨ Lancer le sort' : '✨ Mana insuffisant'}
            </button>
            <button class="capacite-action-btn" data-action="edit" data-id="${item.id}">Modifier</button>
            <button class="capacite-action-btn danger" data-action="delete" data-id="${item.id}">Supprimer</button>`;
    } else if (type === 'techniques') {
        const canUse = (currentFiche.grit_current || 0) >= (item.grit_cost || 0);
        actionsHtml = `
            <button class="capacite-action-btn primary${canUse ? '' : ' disabled'}" data-action="use" data-id="${item.id}">
                ${canUse ? '⚔️ Utiliser la technique' : '⚔️ Grit insuffisant'}
            </button>
            <button class="capacite-action-btn" data-action="edit" data-id="${item.id}">Modifier</button>
            <button class="capacite-action-btn danger" data-action="delete" data-id="${item.id}">Supprimer</button>`;
    } else if (type === 'wild_perks') {
        actionsHtml = `
            <button class="capacite-action-btn primary" data-action="toggle-used" data-id="${item.id}">
                ${item.used ? '↩️ Marquer non utilisée' : '⚡ Marquer comme utilisée'}
            </button>
            <button class="capacite-action-btn" data-action="edit" data-id="${item.id}">Modifier</button>
            <button class="capacite-action-btn danger" data-action="delete" data-id="${item.id}">Supprimer</button>`;
    } else {
        // Perks : pas d'action principale, juste edit/delete
        actionsHtml = `
            <button class="capacite-action-btn" data-action="edit" data-id="${item.id}">Modifier</button>
            <button class="capacite-action-btn danger" data-action="delete" data-id="${item.id}">Supprimer</button>`;
    }

    return `
        <div class="capacite-item ${typeClass}${colorClass}${usedClass}${expanded}" data-type="${type}" data-id="${item.id}">
            <div class="capacite-item-header" data-action="toggle">
                <span class="capacite-item-title">${escapeHtml(item.titre || 'Sans titre')}</span>
                ${costBadge}
                <span class="capacite-item-arrow">▶</span>
            </div>
            <div class="capacite-item-body">
                ${metaTags ? `<div class="capacite-item-meta">${metaTags}</div>` : ''}
                <div class="capacite-item-description">${escapeHtml(item.description || '')}</div>
                <div class="capacite-item-actions">${actionsHtml}</div>
            </div>
        </div>
    `;
}


/* ─── Bind interactions Capacités ────────────────────── */
function bindCapacitesActions() {
    // Sub-tabs scopés par onglet parent (.subtabs-bar dans .tab-section)
    document.querySelectorAll('.subtabs-bar').forEach(bar => {
        const tabSection = bar.closest('.tab-section');
        if (!tabSection) return;
        const scope = tabSection.id.replace(/^section-/, '');
        bar.querySelectorAll('.subtab').forEach(t => {
            t.addEventListener('click', () => switchSubtab(scope, t.dataset.subtab));
        });
    });

    // Délégation : clics sur les items et leurs actions (Capacités)
    ['perks', 'sorts', 'techniques', 'wild_perks'].forEach(type => {
        const listEl = document.getElementById(`list-${type}`);
        if (!listEl) return;
        listEl.addEventListener('click', (e) => handleCapaciteClick(e, type));
    });

    // Boutons "+ Ajouter" pour Capacités uniquement
    ['perks', 'sorts', 'techniques', 'wild_perks'].forEach(type => {
        document.querySelectorAll(`.btn-add-capacite[data-list="${type}"]`).forEach(btn => {
            btn.addEventListener('click', () => openCapaciteForm(type, null));
        });
    });

    // Bouton restore wild perks
    const restoreBtn = document.getElementById('btn-restore-wild');
    if (restoreBtn) restoreBtn.addEventListener('click', confirmRestoreWildPerks);
}

function handleCapaciteClick(e, type) {
    const itemEl = e.target.closest('.capacite-item');
    if (!itemEl) return;
    const itemId = itemEl.dataset.id;
    const item = (currentFiche[type] || []).find(i => i.id === itemId);
    if (!item) return;

    // Click sur le header → toggle expand
    if (e.target.closest('[data-action="toggle"]') && !e.target.closest('.capacite-item-cost')) {
        item._expanded = !item._expanded;
        renderCapacitesList(type);
        return;
    }

    // Click sur un bouton d'action
    const actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;
    const action = actionBtn.dataset.action;

    if (action === 'cast') {
        if (actionBtn.classList.contains('disabled')) return;
        castSpell(item);
    } else if (action === 'use') {
        if (actionBtn.classList.contains('disabled')) return;
        useTechnique(item);
    } else if (action === 'toggle-used') {
        item.used = !item.used;
        saveFiche();
        renderCapacitesList(type);
        showToast(item.used ? `⚡ "${item.titre}" utilisée` : `↩️ "${item.titre}" restaurée`);
    } else if (action === 'edit') {
        openCapaciteForm(type, itemId);
    } else if (action === 'delete') {
        confirmDeleteCapacite(type, itemId);
    }
}


/* ─── Action : Lancer un sort (consomme Mana) ──────── */
function castSpell(item) {
    const cost = item.mana_cost || 0;
    if ((currentFiche.mana_current || 0) < cost) {
        showToast('Mana insuffisant');
        return;
    }
    currentFiche.mana_current = Math.max(0, currentFiche.mana_current - cost);
    saveFiche();
    renderFiche(currentFiche);
    const successesNeeded = manaToSuccesses(cost);
    const spellBonus = currentFiche.spell_bonus || 0;
    const primary = currentFiche.primary;

    // Si Primary défini, ouvre le dice roller pré-rempli pour le spellcasting check
    if (primary && currentFiche.attributs[primary] != null) {
        // Pool spellcasting = Primary + Bonus magique (mode attaque, sans doublement)
        openDiceRoller([primary], {
            modifier: spellBonus,
            attackMode: true,
            label: `✨ Sort : ${item.titre}`,
            difficulty: successesNeeded,
        });
        showToast(`✨ −${cost} Mana · ${successesNeeded} succès requis`);
    } else {
        showToast(`✨ ${item.titre} · −${cost} Mana · ${successesNeeded} succès requis (définis un Primary pour auto-rouler)`);
    }
}

/* ─── Action : Utiliser une technique (consomme Grit) ─ */
function useTechnique(item) {
    const cost = item.grit_cost || 0;
    if ((currentFiche.grit_current || 0) < cost) {
        showToast('Grit insuffisant');
        return;
    }
    currentFiche.grit_current = Math.max(0, currentFiche.grit_current - cost);
    saveFiche();
    renderFiche(currentFiche);
    showToast(`⚔️ ${item.titre} utilisée · −${cost} Grit`);
}


/* ─── Confirmer suppression d'un item ──────────────── */
function confirmDeleteCapacite(type, itemId) {
    const item = (currentFiche[type] || []).find(i => i.id === itemId);
    if (!item) return;

    const html = `
        <div class="confirm-sheet">
            <p class="confirm-message">Supprimer définitivement <strong>${escapeHtml(item.titre)}</strong> ?</p>
            <div class="confirm-actions">
                <button class="confirm-btn cancel" type="button" data-action="cancel">Annuler</button>
                <button class="confirm-btn confirm" type="button" data-action="confirm" style="background: var(--crimson); color: #f5e8c5; border-color: var(--crimson-bright);">Supprimer</button>
            </div>
        </div>
    `;
    openBottomSheet('Confirmer', html, (contentEl) => {
        contentEl.querySelector('[data-action="cancel"]').addEventListener('click', closeBottomSheet);
        contentEl.querySelector('[data-action="confirm"]').addEventListener('click', () => {
            currentFiche[type] = (currentFiche[type] || []).filter(i => i.id !== itemId);
            saveFiche();
            renderCapacitesList(type);
            closeBottomSheet();
            showToast('Supprimé');
        });
    });
}


/* ─── Confirmer restauration de toutes les Wild Perks ── */
function confirmRestoreWildPerks() {
    const usedCount = (currentFiche.wild_perks || []).filter(w => w.used).length;
    if (usedCount === 0) {
        showToast("Aucune Wild Perk utilisée à restaurer");
        return;
    }
    const html = `
        <div class="confirm-sheet">
            <p class="confirm-message">Restaurer <strong>${usedCount}</strong> Wild Perk${usedCount > 1 ? 's' : ''} utilisée${usedCount > 1 ? 's' : ''} ?<br><br>À utiliser si le Herald décide de te les rendre disponibles.</p>
            <div class="confirm-actions">
                <button class="confirm-btn cancel" type="button" data-action="cancel">Annuler</button>
                <button class="confirm-btn confirm" type="button" data-action="confirm">Restaurer</button>
            </div>
        </div>
    `;
    openBottomSheet('Restaurer les Wild Perks', html, (contentEl) => {
        contentEl.querySelector('[data-action="cancel"]').addEventListener('click', closeBottomSheet);
        contentEl.querySelector('[data-action="confirm"]').addEventListener('click', () => {
            (currentFiche.wild_perks || []).forEach(w => w.used = false);
            saveFiche();
            renderCapacitesList('wild_perks');
            closeBottomSheet();
            showToast(`↻ ${usedCount} Wild Perk${usedCount > 1 ? 's' : ''} restaurée${usedCount > 1 ? 's' : ''}`);
        });
    });
}


/* ─── Form : Ajouter ou modifier un item ─────────────── */
function openCapaciteForm(type, itemId) {
    const isEdit = !!itemId;
    const existing = isEdit ? (currentFiche[type] || []).find(i => i.id === itemId) : null;

    const titles = {
        perks: 'Perk',
        sorts: 'Sort',
        techniques: 'Technique martiale',
        wild_perks: 'Wild Perk',
    };
    const formTitle = (isEdit ? 'Modifier · ' : 'Ajouter · ') + titles[type];

    // Champs communs
    const titre = existing?.titre || '';
    const description = existing?.description || '';
    const currentColor = existing?.color || 'gold';

    // Palette de couleurs disponibles
    const COLOR_PALETTE = [
        { id: 'gold',    label: 'Or' },
        { id: 'blue',    label: 'Bleu' },
        { id: 'crimson', label: 'Rouge' },
        { id: 'green',   label: 'Vert' },
        { id: 'purple',  label: 'Violet' },
        { id: 'orange',  label: 'Orange' },
        { id: 'teal',    label: 'Sarcelle' },
        { id: 'pink',    label: 'Rose' },
    ];
    const colorPickerHtml = `
        <div class="form-row">
            <label class="form-row-label">Couleur (organisation)</label>
            <div class="color-picker">
                ${COLOR_PALETTE.map(c => `
                    <button type="button"
                            class="color-swatch swatch-${c.id}${c.id === currentColor ? ' selected' : ''}"
                            data-color="${c.id}"
                            aria-label="${c.label}"
                            title="${c.label}"></button>
                `).join('')}
            </div>
        </div>
    `;

    // Champs spécifiques selon type
    let extraFields = '';
    if (type === 'sorts') {
        const aspect = existing?.aspect || '';
        const manaCost = existing?.mana_cost || 1;
        const apCost = existing?.ap_cost || manaToActionCost(manaCost);
        extraFields = `
            <div class="form-row">
                <label class="form-row-label">Aspect</label>
                <select class="form-row-select" id="form-aspect">
                    <option value="">— Aucun —</option>
                    ${SPELL_ASPECTS.map(a => `<option value="${a}"${aspect === a ? ' selected' : ''}>${a}</option>`).join('')}
                </select>
            </div>
            <div class="form-row-grid">
                <div class="form-row">
                    <label class="form-row-label">Coût Mana</label>
                    <input type="number" class="form-row-input" id="form-mana-cost" min="0" max="20" value="${manaCost}">
                </div>
                <div class="form-row">
                    <label class="form-row-label">Coût AP</label>
                    <input type="number" class="form-row-input" id="form-ap-cost" min="0" max="10" value="${apCost}">
                </div>
            </div>
        `;
    } else if (type === 'techniques') {
        const tradition = existing?.tradition || '';
        const gritCost = existing?.grit_cost || 1;
        const apCost = existing?.ap_cost || 0;
        extraFields = `
            <div class="form-row">
                <label class="form-row-label">Tradition</label>
                <select class="form-row-select" id="form-tradition">
                    <option value="">— Aucune —</option>
                    ${MARTIAL_TRADITIONS.map(t => `<option value="${t}"${tradition === t ? ' selected' : ''}>${t}</option>`).join('')}
                </select>
            </div>
            <div class="form-row-grid">
                <div class="form-row">
                    <label class="form-row-label">Coût Grit</label>
                    <input type="number" class="form-row-input" id="form-grit-cost" min="0" max="20" value="${gritCost}">
                </div>
                <div class="form-row">
                    <label class="form-row-label">Coût AP</label>
                    <input type="number" class="form-row-input" id="form-ap-cost" min="0" max="10" value="${apCost}">
                </div>
            </div>
        `;
    }

    const html = `
        <div class="capacite-form">
            <div class="form-row">
                <label class="form-row-label">Titre *</label>
                <input type="text" class="form-row-input" id="form-titre" placeholder="Ex: Lance de feu" value="${escapeHtml(titre)}" maxlength="80">
            </div>
            ${colorPickerHtml}
            ${extraFields}
            <div class="form-row">
                <label class="form-row-label">Description *</label>
                <textarea class="form-row-textarea" id="form-description" placeholder="Effet, conditions, durée…">${escapeHtml(description)}</textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="form-btn cancel" data-action="cancel">Annuler</button>
                <button type="button" class="form-btn save" data-action="save">${isEdit ? 'Sauvegarder' : 'Ajouter'}</button>
            </div>
        </div>
    `;

    openBottomSheet(formTitle, html, (contentEl) => {
        // Color picker : sélection unique
        contentEl.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', () => {
                contentEl.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
                swatch.classList.add('selected');
            });
        });

        contentEl.querySelector('[data-action="cancel"]').addEventListener('click', closeBottomSheet);
        contentEl.querySelector('[data-action="save"]').addEventListener('click', () => {
            const newTitre = contentEl.querySelector('#form-titre').value.trim();
            const newDesc = contentEl.querySelector('#form-description').value.trim();
            const selectedSwatch = contentEl.querySelector('.color-swatch.selected');
            const newColor = selectedSwatch ? selectedSwatch.dataset.color : 'gold';

            if (!newTitre) { showToast('Le titre est requis'); return; }
            if (!newDesc)  { showToast('La description est requise'); return; }

            const item = isEdit ? existing : { id: genId() };
            item.titre = newTitre;
            item.description = newDesc;
            item.color = newColor;

            if (type === 'sorts') {
                item.aspect = contentEl.querySelector('#form-aspect').value;
                item.mana_cost = parseInt(contentEl.querySelector('#form-mana-cost').value, 10) || 0;
                item.ap_cost = parseInt(contentEl.querySelector('#form-ap-cost').value, 10) || 0;
            } else if (type === 'techniques') {
                item.tradition = contentEl.querySelector('#form-tradition').value;
                item.grit_cost = parseInt(contentEl.querySelector('#form-grit-cost').value, 10) || 0;
                item.ap_cost = parseInt(contentEl.querySelector('#form-ap-cost').value, 10) || 0;
            } else if (type === 'wild_perks' && !isEdit) {
                item.used = false;
            }

            if (!isEdit) {
                if (!Array.isArray(currentFiche[type])) currentFiche[type] = [];
                currentFiche[type].push(item);
            }

            saveFiche();
            renderCapacitesList(type);
            closeBottomSheet();
            showToast(isEdit ? 'Modifié' : 'Ajouté');
        });
    });
}


/* ═══════════════════════════════════════════════════════════════
   ÉQUIPEMENT — Vague 5
   Armes, armures, outils, draviks. Presets officiels du rulebook.
   ═══════════════════════════════════════════════════════════════ */

/* Presets officiels d'armes (rulebook page 130) — données strictement vérifiées */
const WEAPON_PRESETS = [
    // Légères (+1d6, Min Body 1)
    { nom: 'Massue',         type: 'light',  bonus_dice: 1, damage_tiers: [3,3,4,5,5], damage_type: 'Contondants', range: 1, min_body: 1, perk: 'Meurtri : les ennemis blessés perdent 1 Vitesse à leur prochain tour.', draviks: 5 },
    { nom: 'Dague',          type: 'light',  bonus_dice: 1, damage_tiers: [3,3,4,4,5], damage_type: 'Tranchants',  range: 1, min_body: 1, perk: 'Lancer : peut être lancée jusqu\'à 5 cases.', draviks: 10 },
    { nom: 'Hachette',       type: 'light',  bonus_dice: 1, damage_tiers: [3,4,4,5,6], damage_type: 'Tranchants',  range: 1, min_body: 1, perk: 'Lancer : peut être lancée jusqu\'à 5 cases.', draviks: 15 },
    { nom: 'Épée courte',    type: 'light',  bonus_dice: 1, damage_tiers: [3,4,5,6,7], damage_type: 'Tranchants',  range: 1, min_body: 1, perk: 'Vif : une fois par round, après avoir touché, déplace-toi d\'1 case gratuitement.', draviks: 20 },
    // Moyennes (+2d6, Min Body 2)
    { nom: 'Hache de bataille', type: 'medium', bonus_dice: 2, damage_tiers: [3,4,5,6,8], damage_type: 'Tranchants',  range: 1, min_body: 2, perk: 'Couperet : si tu mets un ennemi à terre, fais une attaque rapide gratuite contre un ennemi adjacent.', draviks: 50 },
    { nom: 'Épée longue',    type: 'medium', bonus_dice: 2, damage_tiers: [3,4,5,6,7], damage_type: 'Tranchants',  range: 1, min_body: 2, perk: 'Polyvalente : à deux mains, augmente les dégâts d\'1 Tier (max Tier 5).', draviks: 60 },
    { nom: 'Masse',          type: 'medium', bonus_dice: 2, damage_tiers: [3,4,5,5,6], damage_type: 'Contondants', range: 1, min_body: 2, perk: 'Briser : quand tu infliges des dégâts, retire 1 Défense à la cible (1 fois par tour).', draviks: 40 },
    { nom: 'Lance',          type: 'medium', bonus_dice: 2, damage_tiers: [3,4,4,5,6], damage_type: 'Perforants',  range: 2, min_body: 2, perk: 'Allonge : cible des ennemis jusqu\'à 2 cases de distance.', draviks: 30 },
    // Lourdes (Min Body 3)
    { nom: 'Grande hache',   type: 'heavy',  bonus_dice: 3, damage_tiers: [4,5,7,8,9], damage_type: 'Tranchants',  range: 1, min_body: 3, perk: 'Brise-armure : si tu touches au Tier 3+, les ennemis doivent dépenser le double de Défense pour réduire les dégâts.', draviks: 100 },
    { nom: 'Espadon',        type: 'heavy',  bonus_dice: 3, damage_tiers: [4,5,6,7,8], damage_type: 'Tranchants',  range: 1, min_body: 3, perk: 'Fendoir : si une cible est mise à terre, transfère les Blessures restantes à une autre cible dans 1 case.', draviks: 90 },
    { nom: 'Hallebarde',     type: 'heavy',  bonus_dice: 2, damage_tiers: [4,5,6,7,9], damage_type: 'Perforants',  range: 2, min_body: 3, perk: 'Crochet : quand tu touches, attire la cible d\'1 case vers toi.', draviks: 85 },
    { nom: 'Maillet',        type: 'heavy',  bonus_dice: 2, damage_tiers: [4,6,7,8,9], damage_type: 'Contondants', range: 1, min_body: 3, perk: 'Écrasant : si tu infliges Tier 4+ de dégâts, la cible est Mise à terre.', draviks: 75 },
    // Distance
    { nom: 'Arbalète',       type: 'ranged', bonus_dice: 2, damage_tiers: [4,5,6,7,7], damage_type: 'Perforants',  range: 10, min_body: 2, perk: 'Perçant : sur les cibles armurées, augmente les dégâts d\'1 Tier (max Tier 5).', draviks: 60 },
    { nom: 'Arc long',       type: 'ranged', bonus_dice: 2, damage_tiers: [4,5,6,7,8], damage_type: 'Perforants',  range: 12, min_body: 3, perk: 'Transperçant : la première attaque de chaque round ne peut pas être réduite avec de la Défense.', draviks: 55 },
    { nom: 'Revolver',       type: 'ranged', bonus_dice: 2, damage_tiers: [4,5,6,7,8], damage_type: 'Perforants',  range: 8,  min_body: 2, perk: 'Ricochet : une fois par scène, en touchant tu peux toucher un second ennemi dans 2 cases (2 Blessures à la nouvelle cible).', draviks: 75 },
    { nom: 'Arc court',      type: 'ranged', bonus_dice: 2, damage_tiers: [3,4,5,5,6], damage_type: 'Perforants',  range: 10, min_body: 1, perk: 'Tir rapide : une fois par scène, tire deux fois dans le même tour.', draviks: 35 },
    { nom: 'Fronde',         type: 'ranged', bonus_dice: 1, damage_tiers: [3,3,4,4,5], damage_type: 'Contondants', range: 8,  min_body: 1, perk: 'Étourdir : sur dégâts max, la cible est Sonnée 1.', draviks: 10 },
    // Focus magique
    { nom: 'Orbe',           type: 'focus',  bonus_dice: 2, damage_tiers: [0,0,0,0,0], damage_type: '',            range: 0, min_body: 0, perk: 'Adaptable : peut être enchâssée dans un autre objet (arme ou bouclier).', draviks: 70 },
    { nom: 'Bâton',          type: 'focus',  bonus_dice: 1, damage_tiers: [3,4,4,5,5], damage_type: 'Contondants', range: 1, min_body: 1, perk: 'Arme : peut servir d\'arme de mêlée.', draviks: 25 },
    { nom: 'Grimoire',       type: 'focus',  bonus_dice: 1, damage_tiers: [0,0,0,0,0], damage_type: '',            range: 0, min_body: 0, perk: 'Intuition : une fois par scène, relance un jet de spellcasting raté.', draviks: 50 },
    { nom: 'Baguette',       type: 'focus',  bonus_dice: 1, damage_tiers: [0,0,0,0,0], damage_type: '',            range: 0, min_body: 0, perk: 'Surcharge : une fois par scène, tes sorts gagnent une Faveur.', draviks: 40 },
];

/* Presets officiels d'armures (rulebook page 131) */
const ARMOR_PRESETS = [
    { nom: 'Armure légère',  type: 'armor',  armor_bonus: 1, min_body: 1, speed_penalty: 0,  draviks: 25 },
    { nom: 'Armure moyenne', type: 'armor',  armor_bonus: 2, min_body: 2, speed_penalty: -1, draviks: 60 },
    { nom: 'Armure lourde',  type: 'armor',  armor_bonus: 3, min_body: 3, speed_penalty: -2, draviks: 90 },
    { nom: 'Petit bouclier', type: 'shield', armor_bonus: 1, min_body: 1, speed_penalty: 0,  draviks: 20 },
    { nom: 'Bouclier ovale', type: 'shield', armor_bonus: 2, min_body: 2, speed_penalty: -1, draviks: 40 },
    { nom: 'Pavois',         type: 'shield', armor_bonus: 3, min_body: 3, speed_penalty: -2, draviks: 70 },
];

const WEAPON_TYPE_LABELS = { light: 'Légère', medium: 'Moyenne', heavy: 'Lourde', ranged: 'Distance', focus: 'Focus magique' };
const ARMOR_TYPE_LABELS = { armor: 'Armure', shield: 'Bouclier' };
const TOOL_ATTRIBUTES = ['Body', 'Mind', 'Soul', 'Shadow', 'Gods', 'World'];


/* ─── Render général Équipement ────────────────────────── */
function renderEquipement() {
    renderDraviks();
    renderEquipementList('weapons');
    renderEquipementList('armors');
    renderEquipementList('tools');
}

function renderDraviks() {
    const valEl = document.getElementById('draviks-value');
    if (valEl) valEl.textContent = currentFiche.draviks || 0;
}

function renderEquipementList(type) {
    const items = currentFiche[type] || [];
    const listEl = document.getElementById(`list-${type}`);
    const countEl = document.getElementById(`count-${type}`);
    if (!listEl) return;
    if (countEl) countEl.textContent = items.length;

    if (items.length === 0) {
        const labels = {
            weapons: "Aucune arme. Utilise un preset officiel ou crée la tienne.",
            armors: "Aucune armure ni bouclier équipé.",
            tools: "Aucun outil ni item dans ton inventaire.",
        };
        listEl.innerHTML = `<div class="capacites-empty">${labels[type]}<br><br>Tape « + Ajouter ».</div>`;
        return;
    }
    listEl.innerHTML = items.map(item => renderEquipementItem(type, item)).join('');
}

function renderEquipementItem(type, item) {
    const baseTypeClass = type === 'weapons' ? 'type-technique' : type === 'armors' ? 'type-sort' : 'type-perk';
    const colorClass = item.color ? ` color-${item.color}` : '';
    const equippedClass = (type !== 'tools' && item.equipped) ? ' equipped' : '';
    const expanded = item._expanded ? ' expanded' : '';

    let costBadge = '';
    if (type === 'weapons' && item.bonus_dice > 0) {
        costBadge = `<span class="capacite-item-cost">+${item.bonus_dice}d6</span>`;
    } else if (type === 'armors' && item.armor_bonus > 0) {
        costBadge = `<span class="capacite-item-cost">+${item.armor_bonus} Def</span>`;
    } else if (type === 'tools' && item.draviks) {
        costBadge = `<span class="capacite-item-cost">${item.draviks} Drv</span>`;
    }

    let metaTags = '';
    if (type === 'weapons') {
        if (item.type) metaTags += `<span class="capacite-meta-tag">${WEAPON_TYPE_LABELS[item.type] || item.type}</span>`;
        if (item.damage_type) metaTags += `<span class="capacite-meta-tag">${item.damage_type}</span>`;
        if (item.range > 1) metaTags += `<span class="capacite-meta-tag">Portée ${item.range}</span>`;
        if (item.min_body > 0) metaTags += `<span class="capacite-meta-tag">Min Body ${item.min_body}</span>`;
    } else if (type === 'armors') {
        if (item.type) metaTags += `<span class="capacite-meta-tag">${ARMOR_TYPE_LABELS[item.type] || item.type}</span>`;
        if (item.min_body > 0) metaTags += `<span class="capacite-meta-tag">Min Body ${item.min_body}</span>`;
        if (item.speed_penalty < 0) metaTags += `<span class="capacite-meta-tag">Vitesse ${item.speed_penalty}</span>`;
    } else if (type === 'tools') {
        if (item.attribute) metaTags += `<span class="capacite-meta-tag">${item.attribute}</span>`;
        if (item.quantity > 1) metaTags += `<span class="capacite-meta-tag">×${item.quantity}</span>`;
    }

    // Tiers de dégâts pour armes (sauf si tous à 0 = focus pur)
    let tiersHtml = '';
    if (type === 'weapons' && Array.isArray(item.damage_tiers) && item.damage_tiers.some(t => t > 0)) {
        tiersHtml = `
            <div class="weapon-tiers">
                ${item.damage_tiers.map((t, i) => `
                    <div class="weapon-tier">
                        <span class="weapon-tier-label">T${i+1}</span>
                        <span class="weapon-tier-value">${t}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Actions selon type
    let actionsHtml = '';
    if (type === 'weapons') {
        const equipLabel = item.equipped ? 'Déséquiper' : 'Équiper';
        const isFocus = item.type === 'focus';
        actionsHtml = `
            ${isFocus ? '' : `<button class="capacite-action-btn primary" data-action="attack" data-id="${item.id}">⚔️ Attaquer</button>`}
            <button class="capacite-action-btn" data-action="equip" data-id="${item.id}">${equipLabel}</button>
            <button class="capacite-action-btn" data-action="edit" data-id="${item.id}">Modifier</button>
            <button class="capacite-action-btn danger" data-action="delete" data-id="${item.id}">Supprimer</button>`;
    } else if (type === 'armors') {
        const equipLabel = item.equipped ? 'Déséquiper' : 'Équiper';
        actionsHtml = `
            <button class="capacite-action-btn primary" data-action="equip" data-id="${item.id}">⦿ ${equipLabel}</button>
            <button class="capacite-action-btn" data-action="edit" data-id="${item.id}">Modifier</button>
            <button class="capacite-action-btn danger" data-action="delete" data-id="${item.id}">Supprimer</button>`;
    } else {
        actionsHtml = `
            <button class="capacite-action-btn" data-action="edit" data-id="${item.id}">Modifier</button>
            <button class="capacite-action-btn danger" data-action="delete" data-id="${item.id}">Supprimer</button>`;
    }

    const description = item.perk || item.description || '';

    return `
        <div class="capacite-item ${baseTypeClass}${colorClass}${equippedClass}${expanded}" data-type="${type}" data-id="${item.id}">
            <div class="capacite-item-header" data-action="toggle">
                <span class="capacite-item-title">${escapeHtml(item.nom || 'Sans nom')}</span>
                ${costBadge}
                <span class="capacite-item-arrow">▶</span>
            </div>
            <div class="capacite-item-body">
                ${metaTags ? `<div class="capacite-item-meta">${metaTags}</div>` : ''}
                ${tiersHtml}
                ${description ? `<div class="capacite-item-description">${escapeHtml(description)}</div>` : ''}
                <div class="capacite-item-actions">${actionsHtml}</div>
            </div>
        </div>
    `;
}


/* ─── Bind interactions Équipement ───────────────────── */
function bindEquipementActions() {
    // Délégation : clics dans chaque liste
    ['weapons', 'armors', 'tools'].forEach(type => {
        const listEl = document.getElementById(`list-${type}`);
        if (!listEl) return;
        listEl.addEventListener('click', (e) => handleEquipementClick(e, type));
    });

    // Boutons "+ Ajouter" pour Équipement
    ['weapons', 'armors', 'tools'].forEach(type => {
        document.querySelectorAll(`.btn-add-capacite[data-list="${type}"]`).forEach(btn => {
            btn.addEventListener('click', () => openEquipementForm(type, null));
        });
    });

    // Carte Draviks → ouvre éditeur
    const drvCard = document.getElementById('draviks-card');
    if (drvCard) drvCard.addEventListener('click', openDraviksEditor);
}

function handleEquipementClick(e, type) {
    const itemEl = e.target.closest('.capacite-item');
    if (!itemEl) return;
    const itemId = itemEl.dataset.id;
    const item = (currentFiche[type] || []).find(i => i.id === itemId);
    if (!item) return;

    // Click sur le header → toggle expand
    if (e.target.closest('[data-action="toggle"]') && !e.target.closest('.capacite-item-cost')) {
        item._expanded = !item._expanded;
        renderEquipementList(type);
        return;
    }

    const actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;
    const action = actionBtn.dataset.action;

    if (action === 'attack') {
        performWeaponAttack(item);
    } else if (action === 'equip') {
        toggleEquip(type, item);
    } else if (action === 'edit') {
        openEquipementForm(type, itemId);
    } else if (action === 'delete') {
        confirmDeleteEquipement(type, itemId);
    }
}


/* ─── Action : Équiper / Déséquiper ──────────────────── */
function toggleEquip(type, item) {
    item.equipped = !item.equipped;
    saveFiche();
    renderEquipementList(type);
    renderDesktopEquipped();
    showToast(item.equipped ? `⦿ ${item.nom} équipé` : `${item.nom} déséquipé`);
}


/* ─── Action : Lancer une attaque ────────────────────── */
function performWeaponAttack(item) {
    const primary = currentFiche.primary;
    if (!primary || currentFiche.attributs[primary] == null) {
        showToast('Définis un attribut Primary dans la fiche');
        return;
    }
    const bodyValue = currentFiche.attributs.Body || 0;
    const meetsMin = bodyValue >= (item.min_body || 0);
    const weaponBonus = item.bonus_dice || 0;

    openDiceRoller([primary], {
        attackMode: true,
        label: `Attaque · ${item.nom}`,
        weaponName: item.nom,
        weaponBonus: weaponBonus,
        weaponMinBody: item.min_body || 0,
        weaponMinBodyOk: meetsMin,
    });
}


/* ─── Confirmer suppression ──────────────────────────── */
function confirmDeleteEquipement(type, itemId) {
    const item = (currentFiche[type] || []).find(i => i.id === itemId);
    if (!item) return;
    const html = `
        <div class="confirm-sheet">
            <p class="confirm-message">Supprimer définitivement <strong>${escapeHtml(item.nom)}</strong> ?</p>
            <div class="confirm-actions">
                <button class="confirm-btn cancel" type="button" data-action="cancel">Annuler</button>
                <button class="confirm-btn confirm" type="button" data-action="confirm" style="background: var(--crimson); color: #f5e8c5; border-color: var(--crimson-bright);">Supprimer</button>
            </div>
        </div>
    `;
    openBottomSheet('Confirmer', html, (contentEl) => {
        contentEl.querySelector('[data-action="cancel"]').addEventListener('click', closeBottomSheet);
        contentEl.querySelector('[data-action="confirm"]').addEventListener('click', () => {
            currentFiche[type] = (currentFiche[type] || []).filter(i => i.id !== itemId);
            saveFiche();
            renderEquipementList(type);
            closeBottomSheet();
            showToast('Supprimé');
        });
    });
}


/* ─── Éditeur Draviks ───────────────────────────────── */
function openDraviksEditor() {
    const current = currentFiche.draviks || 0;
    const html = `
        <div class="capacite-form">
            <div class="form-row">
                <label class="form-row-label">Total de Draviks</label>
                <input type="number" class="form-row-input" id="form-draviks" min="0" max="999999" value="${current}">
            </div>
            <div class="form-row-grid">
                <button type="button" class="form-btn cancel" data-action="minus10">−10</button>
                <button type="button" class="form-btn cancel" data-action="plus10">+10</button>
            </div>
            <div class="form-row-grid">
                <button type="button" class="form-btn cancel" data-action="minus50">−50</button>
                <button type="button" class="form-btn cancel" data-action="plus50">+50</button>
            </div>
            <div class="form-actions">
                <button type="button" class="form-btn cancel" data-action="cancel">Annuler</button>
                <button type="button" class="form-btn save" data-action="save">Enregistrer</button>
            </div>
        </div>
    `;
    openBottomSheet('Modifier Draviks', html, (root) => {
        const input = root.querySelector('#form-draviks');
        const adjust = (delta) => {
            const v = (parseInt(input.value, 10) || 0) + delta;
            input.value = Math.max(0, v);
        };
        root.querySelector('[data-action="minus10"]').addEventListener('click', () => adjust(-10));
        root.querySelector('[data-action="plus10"]').addEventListener('click', () => adjust(10));
        root.querySelector('[data-action="minus50"]').addEventListener('click', () => adjust(-50));
        root.querySelector('[data-action="plus50"]').addEventListener('click', () => adjust(50));
        root.querySelector('[data-action="cancel"]').addEventListener('click', closeBottomSheet);
        root.querySelector('[data-action="save"]').addEventListener('click', () => {
            const v = Math.max(0, parseInt(input.value, 10) || 0);
            currentFiche.draviks = v;
            saveFiche();
            renderDraviks();
            closeBottomSheet();
            showToast(`Draviks : ${v}`);
        });
    });
}


/* ─── Form équipement : Ajouter ou modifier ──────────── */
function openEquipementForm(type, itemId) {
    const isEdit = !!itemId;
    const existing = isEdit ? (currentFiche[type] || []).find(i => i.id === itemId) : null;

    if (type === 'weapons') openWeaponForm(existing);
    else if (type === 'armors') openArmorForm(existing);
    else if (type === 'tools') openToolForm(existing);
}

/* Palette de couleurs (partagée avec Capacités) */
function buildColorPickerHtml(currentColor) {
    const COLOR_PALETTE = [
        { id: 'gold',    label: 'Or' }, { id: 'blue',    label: 'Bleu' },
        { id: 'crimson', label: 'Rouge' }, { id: 'green',   label: 'Vert' },
        { id: 'purple',  label: 'Violet' }, { id: 'orange',  label: 'Orange' },
        { id: 'teal',    label: 'Sarcelle' }, { id: 'pink',    label: 'Rose' },
    ];
    return `
        <div class="form-row">
            <label class="form-row-label">Couleur (organisation)</label>
            <div class="color-picker">
                ${COLOR_PALETTE.map(c => `
                    <button type="button"
                            class="color-swatch swatch-${c.id}${c.id === (currentColor || 'gold') ? ' selected' : ''}"
                            data-color="${c.id}"
                            aria-label="${c.label}"
                            title="${c.label}"></button>
                `).join('')}
            </div>
        </div>
    `;
}
function bindColorPicker(root) {
    root.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
            root.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
            swatch.classList.add('selected');
        });
    });
}
function getSelectedColor(root) {
    const sel = root.querySelector('.color-swatch.selected');
    return sel ? sel.dataset.color : 'gold';
}


/* ─── Form ARME ─────────────────────────────────────── */
function openWeaponForm(existing) {
    const isEdit = !!existing;
    const e = existing || {};
    const tiers = Array.isArray(e.damage_tiers) ? e.damage_tiers : [3,4,5,6,7];

    const presetOptions = `<option value="">— Custom (saisie libre) —</option>` +
        WEAPON_PRESETS.map((p, i) => `<option value="${i}">${p.nom} (${WEAPON_TYPE_LABELS[p.type]} · +${p.bonus_dice}d6 · ${p.draviks} Drv)</option>`).join('');

    const typeOptions = Object.entries(WEAPON_TYPE_LABELS)
        .map(([k, v]) => `<option value="${k}"${e.type === k ? ' selected' : ''}>${v}</option>`).join('');

    const html = `
        <div class="capacite-form">
            ${!isEdit ? `
                <p class="equip-preset-banner">💡 <strong>Preset officiel</strong> : choisis une arme du rulebook pour pré-remplir tous les champs. Sinon, garde « Custom » et saisis manuellement.</p>
                <div class="form-row">
                    <label class="form-row-label">Preset</label>
                    <select class="form-row-select" id="form-preset">${presetOptions}</select>
                </div>
            ` : ''}
            <div class="form-row">
                <label class="form-row-label">Nom *</label>
                <input type="text" class="form-row-input" id="form-nom" placeholder="Ex: Épée longue" value="${escapeHtml(e.nom || '')}" maxlength="60">
            </div>
            <div class="form-row-grid">
                <div class="form-row">
                    <label class="form-row-label">Catégorie</label>
                    <select class="form-row-select" id="form-type">${typeOptions}</select>
                </div>
                <div class="form-row">
                    <label class="form-row-label">Bonus d'attaque (dés)</label>
                    <input type="number" class="form-row-input" id="form-bonus" min="0" max="5" value="${e.bonus_dice ?? 1}">
                </div>
            </div>
            <div class="form-row">
                <label class="form-row-label">Dégâts par Tier (T1 / T2 / T3 / T4 / T5)</label>
                <div class="form-row-grid" style="grid-template-columns: repeat(5, 1fr); gap: 4px;">
                    <input type="number" class="form-row-input" id="form-t1" min="0" max="20" value="${tiers[0]}" style="text-align:center;">
                    <input type="number" class="form-row-input" id="form-t2" min="0" max="20" value="${tiers[1]}" style="text-align:center;">
                    <input type="number" class="form-row-input" id="form-t3" min="0" max="20" value="${tiers[2]}" style="text-align:center;">
                    <input type="number" class="form-row-input" id="form-t4" min="0" max="20" value="${tiers[3]}" style="text-align:center;">
                    <input type="number" class="form-row-input" id="form-t5" min="0" max="20" value="${tiers[4]}" style="text-align:center;">
                </div>
            </div>
            <div class="form-row-grid">
                <div class="form-row">
                    <label class="form-row-label">Type de dégâts</label>
                    <select class="form-row-select" id="form-dmg-type">
                        <option value="">— Aucun —</option>
                        <option value="Tranchants"${e.damage_type === 'Tranchants' ? ' selected' : ''}>Tranchants</option>
                        <option value="Contondants"${e.damage_type === 'Contondants' ? ' selected' : ''}>Contondants</option>
                        <option value="Perforants"${e.damage_type === 'Perforants' ? ' selected' : ''}>Perforants</option>
                        <option value="Acide"${e.damage_type === 'Acide' ? ' selected' : ''}>Acide</option>
                        <option value="Feu"${e.damage_type === 'Feu' ? ' selected' : ''}>Feu</option>
                        <option value="Froid"${e.damage_type === 'Froid' ? ' selected' : ''}>Froid</option>
                        <option value="Foudre"${e.damage_type === 'Foudre' ? ' selected' : ''}>Foudre</option>
                        <option value="Nécrotiques"${e.damage_type === 'Nécrotiques' ? ' selected' : ''}>Nécrotiques</option>
                        <option value="Poison"${e.damage_type === 'Poison' ? ' selected' : ''}>Poison</option>
                        <option value="Psychiques"${e.damage_type === 'Psychiques' ? ' selected' : ''}>Psychiques</option>
                        <option value="Radiants"${e.damage_type === 'Radiants' ? ' selected' : ''}>Radiants</option>
                    </select>
                </div>
                <div class="form-row">
                    <label class="form-row-label">Portée (1 = mêlée)</label>
                    <input type="number" class="form-row-input" id="form-range" min="0" max="20" value="${e.range ?? 1}">
                </div>
            </div>
            <div class="form-row-grid">
                <div class="form-row">
                    <label class="form-row-label">Body min.</label>
                    <input type="number" class="form-row-input" id="form-min-body" min="0" max="6" value="${e.min_body ?? 1}">
                </div>
                <div class="form-row">
                    <label class="form-row-label">Prix (Draviks)</label>
                    <input type="number" class="form-row-input" id="form-draviks" min="0" max="9999" value="${e.draviks ?? 0}">
                </div>
            </div>
            ${buildColorPickerHtml(e.color)}
            <div class="form-row">
                <label class="form-row-label">Perk de l'arme</label>
                <textarea class="form-row-textarea" id="form-perk" placeholder="Ex: Polyvalente : à deux mains, augmente les dégâts d'1 Tier (max Tier 5).">${escapeHtml(e.perk || '')}</textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="form-btn cancel" data-action="cancel">Annuler</button>
                <button type="button" class="form-btn save" data-action="save">${isEdit ? 'Sauvegarder' : 'Ajouter'}</button>
            </div>
        </div>
    `;

    openBottomSheet(isEdit ? `Modifier · ${e.nom}` : 'Ajouter une arme', html, (root) => {
        bindColorPicker(root);

        // Preset → auto-fill
        const presetSel = root.querySelector('#form-preset');
        if (presetSel) {
            presetSel.addEventListener('change', () => {
                const idx = parseInt(presetSel.value, 10);
                if (isNaN(idx)) return;
                const p = WEAPON_PRESETS[idx];
                if (!p) return;
                root.querySelector('#form-nom').value = p.nom;
                root.querySelector('#form-type').value = p.type;
                root.querySelector('#form-bonus').value = p.bonus_dice;
                root.querySelector('#form-t1').value = p.damage_tiers[0];
                root.querySelector('#form-t2').value = p.damage_tiers[1];
                root.querySelector('#form-t3').value = p.damage_tiers[2];
                root.querySelector('#form-t4').value = p.damage_tiers[3];
                root.querySelector('#form-t5').value = p.damage_tiers[4];
                root.querySelector('#form-dmg-type').value = p.damage_type;
                root.querySelector('#form-range').value = p.range;
                root.querySelector('#form-min-body').value = p.min_body;
                root.querySelector('#form-draviks').value = p.draviks;
                root.querySelector('#form-perk').value = p.perk;
            });
        }

        root.querySelector('[data-action="cancel"]').addEventListener('click', closeBottomSheet);
        root.querySelector('[data-action="save"]').addEventListener('click', () => {
            const nom = root.querySelector('#form-nom').value.trim();
            if (!nom) { showToast('Donne un nom à l\'arme'); return; }

            const item = isEdit ? existing : { id: genId(), equipped: false };
            item.nom = nom;
            item.type = root.querySelector('#form-type').value;
            item.bonus_dice = parseInt(root.querySelector('#form-bonus').value, 10) || 0;
            item.damage_tiers = [
                parseInt(root.querySelector('#form-t1').value, 10) || 0,
                parseInt(root.querySelector('#form-t2').value, 10) || 0,
                parseInt(root.querySelector('#form-t3').value, 10) || 0,
                parseInt(root.querySelector('#form-t4').value, 10) || 0,
                parseInt(root.querySelector('#form-t5').value, 10) || 0,
            ];
            item.damage_type = root.querySelector('#form-dmg-type').value;
            item.range = parseInt(root.querySelector('#form-range').value, 10) || 0;
            item.min_body = parseInt(root.querySelector('#form-min-body').value, 10) || 0;
            item.draviks = parseInt(root.querySelector('#form-draviks').value, 10) || 0;
            item.perk = root.querySelector('#form-perk').value.trim();
            item.color = getSelectedColor(root);

            if (!isEdit) {
                if (!Array.isArray(currentFiche.weapons)) currentFiche.weapons = [];
                currentFiche.weapons.push(item);
            }
            saveFiche();
            renderEquipementList('weapons');
            closeBottomSheet();
            showToast(isEdit ? 'Arme modifiée' : 'Arme ajoutée');
        });
    });
}


/* ─── Form ARMURE ───────────────────────────────────── */
function openArmorForm(existing) {
    const isEdit = !!existing;
    const e = existing || {};

    const presetOptions = `<option value="">— Custom (saisie libre) —</option>` +
        ARMOR_PRESETS.map((p, i) => `<option value="${i}">${p.nom} (+${p.armor_bonus} Def · ${p.draviks} Drv)</option>`).join('');

    const html = `
        <div class="capacite-form">
            ${!isEdit ? `
                <p class="equip-preset-banner">💡 <strong>Preset officiel</strong> : Light/Medium/Heavy Armor + Buckler/Kite/Tower Shield du rulebook.</p>
                <div class="form-row">
                    <label class="form-row-label">Preset</label>
                    <select class="form-row-select" id="form-preset">${presetOptions}</select>
                </div>
            ` : ''}
            <div class="form-row">
                <label class="form-row-label">Nom *</label>
                <input type="text" class="form-row-input" id="form-nom" placeholder="Ex: Cotte de mailles" value="${escapeHtml(e.nom || '')}" maxlength="60">
            </div>
            <div class="form-row-grid">
                <div class="form-row">
                    <label class="form-row-label">Type</label>
                    <select class="form-row-select" id="form-type">
                        <option value="armor"${e.type === 'armor' ? ' selected' : ''}>Armure</option>
                        <option value="shield"${e.type === 'shield' ? ' selected' : ''}>Bouclier</option>
                    </select>
                </div>
                <div class="form-row">
                    <label class="form-row-label">Bonus Armure</label>
                    <input type="number" class="form-row-input" id="form-armor-bonus" min="0" max="5" value="${e.armor_bonus ?? 1}">
                </div>
            </div>
            <div class="form-row-grid">
                <div class="form-row">
                    <label class="form-row-label">Min Body</label>
                    <input type="number" class="form-row-input" id="form-min-body" min="0" max="6" value="${e.min_body ?? 1}">
                </div>
                <div class="form-row">
                    <label class="form-row-label">Pénalité Vitesse</label>
                    <input type="number" class="form-row-input" id="form-speed" min="-5" max="0" value="${e.speed_penalty ?? 0}">
                </div>
            </div>
            <div class="form-row">
                <label class="form-row-label">Prix (Draviks)</label>
                <input type="number" class="form-row-input" id="form-draviks" min="0" max="9999" value="${e.draviks ?? 0}">
            </div>
            ${buildColorPickerHtml(e.color)}
            <div class="form-row">
                <label class="form-row-label">Perk / notes</label>
                <textarea class="form-row-textarea" id="form-perk" placeholder="Effet spécial éventuel">${escapeHtml(e.perk || '')}</textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="form-btn cancel" data-action="cancel">Annuler</button>
                <button type="button" class="form-btn save" data-action="save">${isEdit ? 'Sauvegarder' : 'Ajouter'}</button>
            </div>
        </div>
    `;

    openBottomSheet(isEdit ? `Modifier · ${e.nom}` : 'Ajouter une armure', html, (root) => {
        bindColorPicker(root);

        const presetSel = root.querySelector('#form-preset');
        if (presetSel) {
            presetSel.addEventListener('change', () => {
                const idx = parseInt(presetSel.value, 10);
                if (isNaN(idx)) return;
                const p = ARMOR_PRESETS[idx];
                if (!p) return;
                root.querySelector('#form-nom').value = p.nom;
                root.querySelector('#form-type').value = p.type;
                root.querySelector('#form-armor-bonus').value = p.armor_bonus;
                root.querySelector('#form-min-body').value = p.min_body;
                root.querySelector('#form-speed').value = p.speed_penalty;
                root.querySelector('#form-draviks').value = p.draviks;
                root.querySelector('#form-perk').value = '';
            });
        }

        root.querySelector('[data-action="cancel"]').addEventListener('click', closeBottomSheet);
        root.querySelector('[data-action="save"]').addEventListener('click', () => {
            const nom = root.querySelector('#form-nom').value.trim();
            if (!nom) { showToast('Donne un nom à l\'armure'); return; }

            const item = isEdit ? existing : { id: genId(), equipped: false };
            item.nom = nom;
            item.type = root.querySelector('#form-type').value;
            item.armor_bonus = parseInt(root.querySelector('#form-armor-bonus').value, 10) || 0;
            item.min_body = parseInt(root.querySelector('#form-min-body').value, 10) || 0;
            item.speed_penalty = parseInt(root.querySelector('#form-speed').value, 10) || 0;
            item.draviks = parseInt(root.querySelector('#form-draviks').value, 10) || 0;
            item.perk = root.querySelector('#form-perk').value.trim();
            item.color = getSelectedColor(root);

            if (!isEdit) {
                if (!Array.isArray(currentFiche.armors)) currentFiche.armors = [];
                currentFiche.armors.push(item);
            }
            saveFiche();
            renderEquipementList('armors');
            closeBottomSheet();
            showToast(isEdit ? 'Armure modifiée' : 'Armure ajoutée');
        });
    });
}


/* ─── Form OUTIL ────────────────────────────────────── */
function openToolForm(existing) {
    const isEdit = !!existing;
    const e = existing || {};

    const attrOptions = `<option value="">— Aucun —</option>` +
        TOOL_ATTRIBUTES.map(a => `<option value="${a}"${e.attribute === a ? ' selected' : ''}>${a}</option>`).join('');

    const html = `
        <div class="capacite-form">
            <div class="form-row">
                <label class="form-row-label">Nom *</label>
                <input type="text" class="form-row-input" id="form-nom" placeholder="Ex: Trousseau de crochets" value="${escapeHtml(e.nom || '')}" maxlength="60">
            </div>
            <div class="form-row-grid">
                <div class="form-row">
                    <label class="form-row-label">Attribut associé</label>
                    <select class="form-row-select" id="form-attribute">${attrOptions}</select>
                </div>
                <div class="form-row">
                    <label class="form-row-label">Quantité</label>
                    <input type="number" class="form-row-input" id="form-quantity" min="1" max="99" value="${e.quantity ?? 1}">
                </div>
            </div>
            <div class="form-row">
                <label class="form-row-label">Prix (Draviks)</label>
                <input type="number" class="form-row-input" id="form-draviks" min="0" max="9999" value="${e.draviks ?? 0}">
            </div>
            ${buildColorPickerHtml(e.color)}
            <div class="form-row">
                <label class="form-row-label">Description</label>
                <textarea class="form-row-textarea" id="form-description" placeholder="Effet, conditions d'utilisation, etc.">${escapeHtml(e.description || '')}</textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="form-btn cancel" data-action="cancel">Annuler</button>
                <button type="button" class="form-btn save" data-action="save">${isEdit ? 'Sauvegarder' : 'Ajouter'}</button>
            </div>
        </div>
    `;

    openBottomSheet(isEdit ? `Modifier · ${e.nom}` : 'Ajouter un outil', html, (root) => {
        bindColorPicker(root);

        root.querySelector('[data-action="cancel"]').addEventListener('click', closeBottomSheet);
        root.querySelector('[data-action="save"]').addEventListener('click', () => {
            const nom = root.querySelector('#form-nom').value.trim();
            if (!nom) { showToast('Donne un nom à l\'outil'); return; }

            const item = isEdit ? existing : { id: genId() };
            item.nom = nom;
            item.attribute = root.querySelector('#form-attribute').value;
            item.quantity = parseInt(root.querySelector('#form-quantity').value, 10) || 1;
            item.draviks = parseInt(root.querySelector('#form-draviks').value, 10) || 0;
            item.description = root.querySelector('#form-description').value.trim();
            item.color = getSelectedColor(root);

            if (!isEdit) {
                if (!Array.isArray(currentFiche.tools)) currentFiche.tools = [];
                currentFiche.tools.push(item);
            }
            saveFiche();
            renderEquipementList('tools');
            closeBottomSheet();
            showToast(isEdit ? 'Outil modifié' : 'Outil ajouté');
        });
    });
}


/* ═══════════════════════════════════════════════════════════════
   DRAGON — Vague 6
   Identité, Attributs, Points de Lien, Breath Weapon, Pillars,
   Bond Perks, Équipement (armes + armures avec presets officiels)
   ═══════════════════════════════════════════════════════════════ */

/* Familles officielles (rulebook chapter 4) */
const DRAGON_FAMILIES = ['Astral', 'Aura', 'Mirror', 'Moon', 'Pyre', 'Shard', 'Storm', 'Sun', 'Half-Dragon'];

/* Stages avec PL Cap (rulebook page 240) */
const DRAGON_STAGES = ['Hatchling', 'Juvenile', 'Mature', 'Elder', 'Mythic'];
const DRAGON_BP_CAP_BY_STAGE = {
    Hatchling: 6, Juvenile: 9, Mature: 12, Elder: 15, Mythic: 18,
};

/* Shapes officielles du Breath Weapon (rulebook page 19) */
const BREATH_SHAPES = ['Cône', 'Ligne', 'Sphère'];

/* Sources possibles d'un perk dragon (pour organisation) */
const DRAGON_PERK_SOURCES = ['Lien', 'Famille (Core)', 'Famille (Minor)', 'Famille (Major)', 'Autre'];

/* Strike types (zones d'impact des armes naturelles du dragon) */
const DRAGON_STRIKE_TYPES = ['Morsure', 'Griffe', 'Queue', 'Aile'];

/* Presets officiels d'armes dragon (rulebook page 188) */
const DRAGON_WEAPON_PRESETS = [
    // Légères (+1 bonus, +2 dégâts par Tier)
    { nom: 'Capes de crocs',     type: 'light',  bonus_dice: 1, damage_tiers: [2,4,6,8,10],   damage_type: 'Morsure',     range: 1, min_body: 2, perk: 'Sur 2+ succès, la cible est Affaiblie 1.', draviks: 50 },
    { nom: 'Fourreaux de griffes', type: 'light',  bonus_dice: 1, damage_tiers: [2,4,6,8,10],   damage_type: 'Griffe',      range: 1, min_body: 2, perk: 'Frappe deux cibles adjacentes avec une seule attaque de griffe.', draviks: 50 },
    { nom: 'Anneaux de queue',   type: 'light',  bonus_dice: 1, damage_tiers: [2,4,6,8,10],   damage_type: 'Queue',       range: 1, min_body: 2, perk: 'Sur 3+ succès, repousse la cible d\'1 case.', draviks: 75 },
    // Moyennes (+2 bonus, +4 dégâts par Tier)
    { nom: 'Crocs de fer',       type: 'medium', bonus_dice: 2, damage_tiers: [4,8,12,16,20], damage_type: 'Morsure',     range: 1, min_body: 3, perk: 'Sur 3+ succès, la cible est Affaiblie 1.', draviks: 150 },
    { nom: 'Griffes-rasoirs',    type: 'medium', bonus_dice: 2, damage_tiers: [4,8,12,16,20], damage_type: 'Griffe',      range: 1, min_body: 3, perk: 'Sur 2+ succès, la cible est Hébétée 1.', draviks: 150 },
    { nom: 'Queue cloutée',      type: 'medium', bonus_dice: 2, damage_tiers: [4,8,12,16,20], damage_type: 'Queue',       range: 2, min_body: 4, perk: 'Sur 3+ succès, toutes les cibles touchées sont Mises à terre. (Portée : ligne de 2 cases)', draviks: 200 },
    { nom: 'Lames d\'ailes',     type: 'medium', bonus_dice: 2, damage_tiers: [4,8,12,16,20], damage_type: 'Aile',        range: 1, min_body: 4, perk: 'Sur 2+ succès, repousse la cible de 2 cases. (Adjacent uniquement)', draviks: 200 },
    // Lourdes (+3 bonus, +6 dégâts par Tier)
    { nom: 'Crocs d\'obsidienne',type: 'heavy',  bonus_dice: 3, damage_tiers: [6,12,18,24,30], damage_type: 'Morsure',    range: 1, min_body: 5, perk: 'Sur 3+ succès, inflige 3 Blessures supplémentaires directement.', draviks: 500 },
    { nom: 'Griffes d\'adamantium', type: 'heavy', bonus_dice: 3, damage_tiers: [6,12,18,24,30], damage_type: 'Griffe',   range: 1, min_body: 5, perk: 'Sur 3+ succès, la cible est Sonnée 1.', draviks: 500 },
    { nom: 'Queue à pointes',    type: 'heavy',  bonus_dice: 3, damage_tiers: [6,12,18,24,30], damage_type: 'Queue',      range: 3, min_body: 6, perk: 'Sur 2+ succès, les cibles subissent aussi Affaiblie 1. (Portée : ligne de 3 cases)', draviks: 600 },
    { nom: 'Ailes d\'orage',     type: 'heavy',  bonus_dice: 3, damage_tiers: [6,12,18,24,30], damage_type: 'Aile',       range: 1, min_body: 6, perk: 'Sur 2+ succès, toutes les cibles adjacentes sont repoussées de 2 cases.', draviks: 600 },
];

/* Presets officiels d'armures dragon (rulebook page 188) */
const DRAGON_ARMOR_PRESETS = [
    { nom: 'Bandelettes d\'écailles', armor_bonus: 2, min_body: 2, draviks: 50  },
    { nom: 'Caparaçon de cuir',       armor_bonus: 2, min_body: 2, draviks: 75  },
    { nom: 'Plaques de bronze',       armor_bonus: 2, min_body: 3, draviks: 100 },
    { nom: 'Caparaçon de fer',        armor_bonus: 3, min_body: 3, draviks: 200 },
    { nom: 'Plaques runiques',        armor_bonus: 3, min_body: 4, draviks: 250 },
    { nom: 'Harnais d\'acier',        armor_bonus: 3, min_body: 4, draviks: 300 },
    { nom: 'Plaques de mithril',      armor_bonus: 4, min_body: 5, draviks: 500 },
    { nom: 'Harnais d\'adamantium',   armor_bonus: 4, min_body: 6, draviks: 600 },
    { nom: 'Caparaçon d\'acier solaire', armor_bonus: 4, min_body: 6, draviks: 750 },
];


/* ─── Helpers ─────────────────────────────────────────── */
function dragonBpCap(stage) {
    return DRAGON_BP_CAP_BY_STAGE[stage] || 6;
}
function dragonBreathChargesMax(soul) {
    return Math.max(1, Math.ceil((soul || 1) / 2));
}
function dragonDefenseSlots(d) {
    const playerLvl = currentFiche.niveau || 1;
    const armor = (d.armors || []).filter(a => a.equipped).reduce((s, a) => s + (a.armor_bonus || 0), 0);
    const totalArmor = armor + (d.armor_bonus || 0);
    return totalArmor + ((d.attributs && d.attributs.Body) || 0) + Math.floor(playerLvl / 2);
}


/* ─── Render général Dragon ───────────────────────────── */
function renderDragon() {
    const d = currentFiche.dragon;
    if (!d) return;

    // Identité
    document.getElementById('dragon-nom').value = d.nom || '';
    document.getElementById('dragon-family').value = d.family || '';
    document.getElementById('dragon-stage').value = d.stage || 'Hatchling';

    // Attributs
    ['Body', 'Mind', 'Soul'].forEach(k => {
        const el = document.getElementById(`dragon-attr-${k}`);
        if (el) el.textContent = (d.attributs && d.attributs[k]) || 0;
    });

    // PL
    document.getElementById('dragon-bp-current').textContent = d.bp_current || 0;
    document.getElementById('dragon-bp-max').textContent = d.bp_max || dragonBpCap(d.stage);

    // Défense (calculé)
    const ds = dragonDefenseSlots(d);
    document.getElementById('dragon-ds-value').textContent = ds;
    const playerLvl = currentFiche.niveau || 1;
    const armor = (d.armors || []).filter(a => a.equipped).reduce((s, a) => s + (a.armor_bonus || 0), 0);
    const body = (d.attributs && d.attributs.Body) || 0;
    document.getElementById('dragon-ds-formula').textContent = `${armor} + ${body} + ${Math.floor(playerLvl/2)} (½ niv)`;

    // Speed + Fly
    document.getElementById('dragon-speed').value = d.speed || 6;
    const flyEl = document.getElementById('dragon-speed-fly');
    if (flyEl) flyEl.value = d.speed_fly || 0;

    // Breath
    const b = d.breath || {};
    document.getElementById('breath-element-display').textContent = b.element ? b.element : '— Aucun élément —';
    document.getElementById('breath-shape-display').textContent = b.shape || 'Cône';
    document.getElementById('breath-charges-current').textContent = b.charges_current || 0;
    document.getElementById('breath-charges-max').textContent = b.charges_max || dragonBreathChargesMax(d.attributs.Soul);
    document.getElementById('breath-description-display').textContent = b.description || '— Tap pour configurer —';
    document.getElementById('breath-effect-display').textContent = b.effect ? `Effet : ${b.effect}` : '';

    // Pillars
    document.getElementById('dragon-love').value = (d.pillars && d.pillars.love) || '';
    document.getElementById('dragon-fear').value = (d.pillars && d.pillars.fear) || '';
    document.getElementById('dragon-instinct').value = (d.pillars && d.pillars.instinct) || '';

    // Configuration dragon (champs sans focus)
    const setCfg = (id, value) => {
        const el = document.getElementById(id);
        if (el && document.activeElement !== el) el.value = value;
    };
    setCfg('cfg-d-body', (d.attributs && d.attributs.Body) || 0);
    setCfg('cfg-d-mind', (d.attributs && d.attributs.Mind) || 0);
    setCfg('cfg-d-soul', (d.attributs && d.attributs.Soul) || 0);
    setCfg('cfg-d-bp-cur', d.bp_current || 0);
    setCfg('cfg-d-bp-max', d.bp_max || 0);
    setCfg('cfg-d-speed', d.speed || 0);
    setCfg('cfg-d-speed-fly', d.speed_fly || 0);
    setCfg('cfg-d-armor', d.armor_bonus || 0);

    // Listes
    renderDragonList('dperks');
    renderDragonList('dweapons');
    renderDragonList('darmors');
}

function renderDragonList(type) {
    // type ∈ 'dperks', 'dweapons', 'darmors'
    const d = currentFiche.dragon;
    const items = type === 'dperks' ? (d.perks || [])
                : type === 'dweapons' ? (d.weapons || [])
                : (d.armors || []);
    const listEl = document.getElementById(`list-${type}`);
    const countEl = document.getElementById(`count-${type}`);
    if (!listEl) return;
    if (countEl) countEl.textContent = items.length;

    if (items.length === 0) {
        const labels = {
            dperks: "Aucun Bond/Family Perk. Ajoute ceux de ta famille de dragon.",
            dweapons: "Aucune arme dragon. 12 presets officiels disponibles (Capes de crocs, Crocs de fer, etc.).",
            darmors: "Aucune armure. 9 presets officiels disponibles (Scale Wraps → Sunsteel Barding).",
        };
        listEl.innerHTML = `<div class="capacites-empty">${labels[type]}<br><br>Tape « + Ajouter ».</div>`;
        return;
    }
    listEl.innerHTML = items.map(item => renderDragonItem(type, item)).join('');
}

function renderDragonItem(type, item) {
    const baseTypeClass = type === 'dperks' ? 'type-perk'
                        : type === 'dweapons' ? 'type-technique'
                        : 'type-sort';
    const colorClass = item.color ? ` color-${item.color}` : '';
    const equippedClass = (type !== 'dperks' && item.equipped) ? ' equipped' : '';
    const usedClass = (type === 'dperks' && item.used) ? ' used' : '';
    const expanded = item._expanded ? ' expanded' : '';

    let costBadge = '';
    if (type === 'dweapons' && item.bonus_dice > 0) {
        costBadge = `<span class="capacite-item-cost">+${item.bonus_dice}d6</span>`;
    } else if (type === 'darmors' && item.armor_bonus > 0) {
        costBadge = `<span class="capacite-item-cost">+${item.armor_bonus} Def</span>`;
    }

    let metaTags = '';
    if (type === 'dperks' && item.source) {
        metaTags += `<span class="capacite-meta-tag">${escapeHtml(item.source)}</span>`;
    } else if (type === 'dweapons') {
        if (item.type) metaTags += `<span class="capacite-meta-tag">${WEAPON_TYPE_LABELS[item.type] || item.type}</span>`;
        if (item.damage_type) metaTags += `<span class="capacite-meta-tag">${item.damage_type}</span>`;
        if (item.min_body > 0) metaTags += `<span class="capacite-meta-tag">Min Body ${item.min_body}</span>`;
    } else if (type === 'darmors') {
        if (item.min_body > 0) metaTags += `<span class="capacite-meta-tag">Min Body ${item.min_body}</span>`;
    }

    let tiersHtml = '';
    if (type === 'dweapons' && Array.isArray(item.damage_tiers) && item.damage_tiers.some(t => t > 0)) {
        tiersHtml = `
            <div class="weapon-tiers">
                ${item.damage_tiers.map((t, i) => `
                    <div class="weapon-tier">
                        <span class="weapon-tier-label">T${i+1}</span>
                        <span class="weapon-tier-value">${t}</span>
                    </div>
                `).join('')}
            </div>`;
    }

    let actionsHtml = '';
    if (type === 'dweapons') {
        const equipLabel = item.equipped ? 'Déséquiper' : 'Équiper';
        actionsHtml = `
            <button class="capacite-action-btn primary" data-action="dragon-attack" data-id="${item.id}">⚔️ Attaquer</button>
            <button class="capacite-action-btn" data-action="dequip" data-id="${item.id}">${equipLabel}</button>
            <button class="capacite-action-btn" data-action="dedit" data-id="${item.id}">Modifier</button>
            <button class="capacite-action-btn danger" data-action="ddelete" data-id="${item.id}">Supprimer</button>`;
    } else if (type === 'darmors') {
        const equipLabel = item.equipped ? 'Déséquiper' : 'Équiper';
        actionsHtml = `
            <button class="capacite-action-btn primary" data-action="dequip" data-id="${item.id}">⦿ ${equipLabel}</button>
            <button class="capacite-action-btn" data-action="dedit" data-id="${item.id}">Modifier</button>
            <button class="capacite-action-btn danger" data-action="ddelete" data-id="${item.id}">Supprimer</button>`;
    } else {
        // Bond Perks
        actionsHtml = `
            <button class="capacite-action-btn primary" data-action="dperk-toggle-used" data-id="${item.id}">
                ${item.used ? '↩️ Marquer non utilisé' : '⚡ Marquer utilisé'}
            </button>
            <button class="capacite-action-btn" data-action="dedit" data-id="${item.id}">Modifier</button>
            <button class="capacite-action-btn danger" data-action="ddelete" data-id="${item.id}">Supprimer</button>`;
    }

    const description = item.perk || item.description || '';

    return `
        <div class="capacite-item ${baseTypeClass}${colorClass}${equippedClass}${usedClass}${expanded}" data-type="${type}" data-id="${item.id}">
            <div class="capacite-item-header" data-action="toggle">
                <span class="capacite-item-title">${escapeHtml(item.nom || 'Sans nom')}</span>
                ${costBadge}
                <span class="capacite-item-arrow">▶</span>
            </div>
            <div class="capacite-item-body">
                ${metaTags ? `<div class="capacite-item-meta">${metaTags}</div>` : ''}
                ${tiersHtml}
                ${description ? `<div class="capacite-item-description">${escapeHtml(description)}</div>` : ''}
                <div class="capacite-item-actions">${actionsHtml}</div>
            </div>
        </div>
    `;
}


/* ─── Bind interactions Dragon ────────────────────────── */
function bindDragonActions() {
    const d = currentFiche.dragon;
    if (!d) return;

    // Identité (auto-save sur changement)
    const nomInput = document.getElementById('dragon-nom');
    if (nomInput) nomInput.addEventListener('input', () => {
        d.nom = nomInput.value;
        saveFiche();
    });
    const familySel = document.getElementById('dragon-family');
    if (familySel) familySel.addEventListener('change', () => {
        d.family = familySel.value;
        saveFiche();
    });
    const stageSel = document.getElementById('dragon-stage');
    if (stageSel) stageSel.addEventListener('change', () => {
        d.stage = stageSel.value;
        // Suggestion du nouveau cap, sans forcer
        const newCap = dragonBpCap(d.stage);
        d.bp_max = newCap;
        if (d.bp_current > newCap) d.bp_current = newCap;
        saveFiche();
        renderDragon();
        showToast(`Stage : ${d.stage} · PL cap suggéré ${newCap}`);
    });

    // Speed + Fly
    const speedInput = document.getElementById('dragon-speed');
    if (speedInput) speedInput.addEventListener('change', () => {
        d.speed = Math.max(0, parseInt(speedInput.value, 10) || 0);
        saveFiche();
    });
    const flyInput = document.getElementById('dragon-speed-fly');
    if (flyInput) flyInput.addEventListener('change', () => {
        d.speed_fly = Math.max(0, parseInt(flyInput.value, 10) || 0);
        saveFiche();
    });

    // ─── Section Configuration du dragon (auto-save sur change) ───
    const cfgBindNumber = (id, key, max, callback) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('change', () => {
            let v = parseInt(el.value, 10);
            if (isNaN(v)) v = 0;
            v = Math.max(0, max != null ? Math.min(max, v) : v);
            el.value = v;
            if (typeof key === 'function') key(v);
            saveFiche();
            renderDragon();
        });
    };
    cfgBindNumber('cfg-d-body', (v) => { d.attributs.Body = v; }, 10);
    cfgBindNumber('cfg-d-mind', (v) => { d.attributs.Mind = v; }, 10);
    cfgBindNumber('cfg-d-soul', (v) => {
        d.attributs.Soul = v;
        // Auto-ajuste les charges max du souffle
        d.breath.charges_max = dragonBreathChargesMax(v);
        if (d.breath.charges_current > d.breath.charges_max) d.breath.charges_current = d.breath.charges_max;
    }, 10);
    cfgBindNumber('cfg-d-bp-cur', (v) => {
        d.bp_current = Math.min(d.bp_max || 0, v);
    }, 50);
    cfgBindNumber('cfg-d-bp-max', (v) => {
        d.bp_max = v;
        if (d.bp_current > v) d.bp_current = v;
    }, 50);
    cfgBindNumber('cfg-d-speed', (v) => { d.speed = v; }, 20);
    cfgBindNumber('cfg-d-speed-fly', (v) => { d.speed_fly = v; }, 40);
    cfgBindNumber('cfg-d-armor', (v) => { d.armor_bonus = v; }, 10);

    // Attributs : tap pour ouvrir éditeur
    document.querySelectorAll('[data-dattr]').forEach(cell => {
        cell.addEventListener('click', () => openDragonAttributEditor(cell.dataset.dattr));
    });

    // PL card
    const bpCard = document.getElementById('dragon-bp-card');
    if (bpCard) bpCard.addEventListener('click', openDragonBpEditor);

    // Breath card
    const breathCard = document.getElementById('breath-card');
    if (breathCard) breathCard.addEventListener('click', openBreathEditor);

    // Bouton Lancer souffle
    const breathLaunch = document.getElementById('btn-breath-launch');
    if (breathLaunch) breathLaunch.addEventListener('click', performBreathAttack);

    // Bouton Recharger
    const breathRecharge = document.getElementById('btn-breath-recharge');
    if (breathRecharge) breathRecharge.addEventListener('click', () => {
        const b = d.breath;
        b.charges_max = dragonBreathChargesMax(d.attributs.Soul);
        b.charges_current = b.charges_max;
        saveFiche();
        renderDragon();
        showToast(`↻ Souffle rechargé · ${b.charges_max} charges`);
    });

    // Pillars (sauve au blur)
    ['love', 'fear', 'instinct'].forEach(p => {
        const el = document.getElementById(`dragon-${p}`);
        if (el) el.addEventListener('blur', () => {
            d.pillars[p] = el.value;
            saveFiche();
        });
    });

    // Délégation : clics sur les listes (perks, weapons, armors)
    ['dperks', 'dweapons', 'darmors'].forEach(type => {
        const listEl = document.getElementById(`list-${type}`);
        if (!listEl) return;
        listEl.addEventListener('click', (e) => handleDragonListClick(e, type));
    });

    // Boutons "+ Ajouter" pour le dragon — délégation globale pour survivre aux re-renders
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-add-capacite');
        if (!btn) return;
        const type = btn.dataset.list;
        if (type === 'dperks') openDragonPerkForm(null);
        else if (type === 'dweapons') openDragonWeaponForm(null);
        else if (type === 'darmors') openDragonArmorForm(null);
    });
}

function handleDragonListClick(e, type) {
    const itemEl = e.target.closest('.capacite-item');
    if (!itemEl) return;
    const itemId = itemEl.dataset.id;
    const list = type === 'dperks' ? currentFiche.dragon.perks
               : type === 'dweapons' ? currentFiche.dragon.weapons
               : currentFiche.dragon.armors;
    const item = list.find(i => i.id === itemId);
    if (!item) return;

    if (e.target.closest('[data-action="toggle"]') && !e.target.closest('.capacite-item-cost')) {
        item._expanded = !item._expanded;
        renderDragonList(type);
        return;
    }

    const actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;
    const action = actionBtn.dataset.action;

    if (action === 'dragon-attack') {
        performDragonWeaponAttack(item);
    } else if (action === 'dequip') {
        item.equipped = !item.equipped;
        saveFiche();
        renderDragon();
        showToast(item.equipped ? `⦿ ${item.nom} équipé` : `${item.nom} déséquipé`);
    } else if (action === 'dperk-toggle-used') {
        item.used = !item.used;
        saveFiche();
        renderDragonList('dperks');
        showToast(item.used ? `⚡ "${item.nom}" utilisé` : `↩️ "${item.nom}" restauré`);
    } else if (action === 'dedit') {
        if (type === 'dperks') openDragonPerkForm(itemId);
        else if (type === 'dweapons') openDragonWeaponForm(itemId);
        else openDragonArmorForm(itemId);
    } else if (action === 'ddelete') {
        confirmDeleteDragonItem(type, itemId);
    }
}


/* ─── Action : Lancer le souffle ─────────────────────── */
function performBreathAttack() {
    const d = currentFiche.dragon;
    const b = d.breath || {};
    if ((b.charges_current || 0) < 1) {
        showToast('Aucune charge de souffle restante (recharge au Repos court)');
        return;
    }
    const primary = currentFiche.primary;
    if (!primary || currentFiche.attributs[primary] == null) {
        showToast('Définis un attribut Primary pour ton joueur');
        return;
    }
    const dragonSoul = (d.attributs && d.attributs.Soul) || 0;

    // Consomme 1 charge
    b.charges_current = Math.max(0, b.charges_current - 1);
    saveFiche();
    renderDragon();

    // Pool = Player Primary + Dragon Soul (mode attaque, sans doublement)
    const label = b.element ? `🐉 Souffle (${b.element}, ${b.shape || 'Cône'})` : `🐉 Souffle de ${d.nom || 'dragon'}`;
    openDiceRoller([primary], {
        modifier: dragonSoul,
        attackMode: true,
        label,
    });
}

/* ─── Action : Attaque dragon avec une arme ──────────── */
function performDragonWeaponAttack(weapon) {
    const d = currentFiche.dragon;
    const primary = currentFiche.primary;
    if (!primary || currentFiche.attributs[primary] == null) {
        showToast('Définis un attribut Primary pour ton joueur');
        return;
    }
    const dragonBody = (d.attributs && d.attributs.Body) || 0;
    const meetsMin = dragonBody >= (weapon.min_body || 0);
    const bonusDice = meetsMin ? (weapon.bonus_dice || 0) : 0;

    // Pool = Player Primary + Dragon Body + bonus dice de l'arme
    openDiceRoller([primary], {
        modifier: dragonBody + bonusDice,
        attackMode: true,
        label: `🐉 ${d.nom || 'Dragon'} · ${weapon.nom}`,
    });

    if (!meetsMin && weapon.bonus_dice > 0) {
        setTimeout(() => showToast(`⚠️ Dragon Body ${dragonBody} < Min Body ${weapon.min_body} — pas de bonus`), 200);
    }
}


/* ─── Bottom sheet : éditer un attribut du dragon ────── */
function openDragonAttributEditor(attr) {
    const d = currentFiche.dragon;
    const current = (d.attributs && d.attributs[attr]) || 1;
    const html = `
        <div class="capacite-form">
            <div class="form-row">
                <label class="form-row-label">${attr}</label>
                <input type="number" class="form-row-input" id="form-attr" min="0" max="10" value="${current}">
            </div>
            <p style="font-size: 12px; color: var(--text-muted); font-style: italic;">
                ${attr === 'Body' ? 'Force, résilience, présence du dragon.'
                : attr === 'Mind' ? 'Perception, ruse, attention du dragon.'
                : 'Intuition, empathie, esprit du dragon. Détermine aussi les charges de souffle.'}
            </p>
            <div class="form-actions">
                <button type="button" class="form-btn cancel" data-action="cancel">Annuler</button>
                <button type="button" class="form-btn save" data-action="save">Enregistrer</button>
            </div>
        </div>
    `;
    openBottomSheet(`Dragon · ${attr}`, html, (root) => {
        root.querySelector('[data-action="cancel"]').addEventListener('click', closeBottomSheet);
        root.querySelector('[data-action="save"]').addEventListener('click', () => {
            const v = Math.max(0, parseInt(root.querySelector('#form-attr').value, 10) || 0);
            d.attributs[attr] = v;
            // Si Soul change, ajuste le max de charges du souffle
            if (attr === 'Soul') {
                d.breath.charges_max = dragonBreathChargesMax(v);
                if (d.breath.charges_current > d.breath.charges_max) {
                    d.breath.charges_current = d.breath.charges_max;
                }
            }
            saveFiche();
            renderDragon();
            closeBottomSheet();
        });
    });
}


/* ─── Bottom sheet : éditer Points de Lien ──────────────── */
function openDragonBpEditor() {
    const d = currentFiche.dragon;
    const html = `
        <div class="capacite-form">
            <div class="form-row-grid">
                <div class="form-row">
                    <label class="form-row-label">Actuel</label>
                    <input type="number" class="form-row-input" id="form-bp-cur" min="0" max="50" value="${d.bp_current || 0}">
                </div>
                <div class="form-row">
                    <label class="form-row-label">Max (Cap)</label>
                    <input type="number" class="form-row-input" id="form-bp-max" min="0" max="50" value="${d.bp_max || 6}">
                </div>
            </div>
            <p style="font-size: 12px; color: var(--text-muted); font-style: italic;">
                Cap suggéré selon stage : Hatchling=6 · Juvenile=9 · Mature=12 · Elder=15 · Mythic=18.<br>
                Regain : 1 PL + ½ niv au début du Hero Round, +2 PL via Piliers/RP, ½ max au Repos court, full au Downtime.
            </p>
            <div class="form-row-grid">
                <button type="button" class="form-btn cancel" data-action="m1">−1</button>
                <button type="button" class="form-btn cancel" data-action="p1">+1</button>
            </div>
            <div class="form-row-grid">
                <button type="button" class="form-btn cancel" data-action="rest">↻ Repos court (½ max)</button>
                <button type="button" class="form-btn cancel" data-action="full">↻↻ Downtime (full)</button>
            </div>
            <div class="form-actions">
                <button type="button" class="form-btn cancel" data-action="cancel">Annuler</button>
                <button type="button" class="form-btn save" data-action="save">Enregistrer</button>
            </div>
        </div>
    `;
    openBottomSheet('Points de Lien', html, (root) => {
        const curInput = root.querySelector('#form-bp-cur');
        const maxInput = root.querySelector('#form-bp-max');
        const adjust = (delta) => {
            const v = (parseInt(curInput.value, 10) || 0) + delta;
            const max = parseInt(maxInput.value, 10) || 0;
            curInput.value = Math.max(0, Math.min(max, v));
        };
        root.querySelector('[data-action="m1"]').addEventListener('click', () => adjust(-1));
        root.querySelector('[data-action="p1"]').addEventListener('click', () => adjust(1));
        root.querySelector('[data-action="rest"]').addEventListener('click', () => {
            const max = parseInt(maxInput.value, 10) || 0;
            const half = Math.ceil(max / 2);
            const cur = parseInt(curInput.value, 10) || 0;
            curInput.value = Math.min(max, cur + half);
        });
        root.querySelector('[data-action="full"]').addEventListener('click', () => {
            curInput.value = parseInt(maxInput.value, 10) || 0;
        });
        root.querySelector('[data-action="cancel"]').addEventListener('click', closeBottomSheet);
        root.querySelector('[data-action="save"]').addEventListener('click', () => {
            d.bp_max = Math.max(0, parseInt(maxInput.value, 10) || 0);
            d.bp_current = Math.max(0, Math.min(d.bp_max, parseInt(curInput.value, 10) || 0));
            saveFiche();
            renderDragon();
            closeBottomSheet();
        });
    });
}


/* ─── Bottom sheet : éditer le Breath Weapon ────────── */
function openBreathEditor() {
    const d = currentFiche.dragon;
    const b = d.breath;
    const shapesOptions = BREATH_SHAPES.map(s =>
        `<option value="${s}"${b.shape === s ? ' selected' : ''}>${s}</option>`).join('');

    const html = `
        <div class="capacite-form">
            <p style="font-size: 12px; color: var(--text-muted); font-style: italic; line-height: 1.4;">
                Pool = <strong>Dragon Soul + Player Primary</strong>. Charges max = ⌈Soul/2⌉ (recharge au Repos court).
            </p>
            <div class="form-row">
                <label class="form-row-label">Élément</label>
                <input type="text" class="form-row-input" id="form-element" placeholder="Foudre, Feu, Froid, Nécrotique, Radiant, Acide, Poison…" value="${escapeHtml(b.element || '')}">
            </div>
            <div class="form-row">
                <label class="form-row-label">Forme</label>
                <select class="form-row-select" id="form-shape">${shapesOptions}</select>
                <p style="font-size: 11px; color: var(--text-subtle); font-style: italic; margin-top: 4px;">
                    Cône : 3 cases · Ligne : 5x1 · Sphère : rayon 2 dans la portée
                </p>
            </div>
            <div class="form-row">
                <label class="form-row-label">Description du souffle</label>
                <textarea class="form-row-textarea" id="form-description" placeholder="Ex: Une décharge de foudre concentrée jaillit de la gueule…">${escapeHtml(b.description || '')}</textarea>
            </div>
            <div class="form-row">
                <label class="form-row-label">Effet / Status infligé</label>
                <input type="text" class="form-row-input" id="form-effect" placeholder="Ex : Étourdi 1, En feu 2, À terre…" value="${escapeHtml(b.effect || '')}">
            </div>
            <div class="form-row-grid">
                <div class="form-row">
                    <label class="form-row-label">Charges actuelles</label>
                    <input type="number" class="form-row-input" id="form-charges-cur" min="0" max="20" value="${b.charges_current || 0}">
                </div>
                <div class="form-row">
                    <label class="form-row-label">Charges max</label>
                    <input type="number" class="form-row-input" id="form-charges-max" min="0" max="20" value="${b.charges_max || dragonBreathChargesMax(d.attributs.Soul)}">
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="form-btn cancel" data-action="cancel">Annuler</button>
                <button type="button" class="form-btn save" data-action="save">Enregistrer</button>
            </div>
        </div>
    `;
    openBottomSheet('Souffle du dragon', html, (root) => {
        root.querySelector('[data-action="cancel"]').addEventListener('click', closeBottomSheet);
        root.querySelector('[data-action="save"]').addEventListener('click', () => {
            b.element = root.querySelector('#form-element').value.trim();
            b.shape = root.querySelector('#form-shape').value;
            b.description = root.querySelector('#form-description').value.trim();
            b.effect = root.querySelector('#form-effect').value.trim();
            b.charges_max = Math.max(0, parseInt(root.querySelector('#form-charges-max').value, 10) || 0);
            b.charges_current = Math.max(0, Math.min(b.charges_max, parseInt(root.querySelector('#form-charges-cur').value, 10) || 0));
            saveFiche();
            renderDragon();
            closeBottomSheet();
            showToast('Souffle mis à jour');
        });
    });
}


/* ─── Confirmer suppression d'un item dragon ─────────── */
function confirmDeleteDragonItem(type, itemId) {
    const list = type === 'dperks' ? currentFiche.dragon.perks
               : type === 'dweapons' ? currentFiche.dragon.weapons
               : currentFiche.dragon.armors;
    const item = list.find(i => i.id === itemId);
    if (!item) return;
    const html = `
        <div class="confirm-sheet">
            <p class="confirm-message">Supprimer définitivement <strong>${escapeHtml(item.nom)}</strong> ?</p>
            <div class="confirm-actions">
                <button class="confirm-btn cancel" type="button" data-action="cancel">Annuler</button>
                <button class="confirm-btn confirm" type="button" data-action="confirm" style="background: var(--crimson); color: #f5e8c5; border-color: var(--crimson-bright);">Supprimer</button>
            </div>
        </div>
    `;
    openBottomSheet('Confirmer', html, (root) => {
        root.querySelector('[data-action="cancel"]').addEventListener('click', closeBottomSheet);
        root.querySelector('[data-action="confirm"]').addEventListener('click', () => {
            const idx = list.findIndex(i => i.id === itemId);
            if (idx >= 0) list.splice(idx, 1);
            saveFiche();
            renderDragonList(type);
            closeBottomSheet();
            showToast('Supprimé');
        });
    });
}


/* ─── Form : Bond Perk ─────────────────────────────── */
function openDragonPerkForm(itemId) {
    const isEdit = !!itemId;
    const existing = isEdit ? currentFiche.dragon.perks.find(i => i.id === itemId) : null;
    const e = existing || {};

    const sourceOptions = `<option value="">— Aucune —</option>` +
        DRAGON_PERK_SOURCES.map(s => `<option value="${s}"${e.source === s ? ' selected' : ''}>${s}</option>`).join('');

    const html = `
        <div class="capacite-form">
            <div class="form-row">
                <label class="form-row-label">Nom *</label>
                <input type="text" class="form-row-input" id="form-nom" placeholder="Ex: Bond Surge" value="${escapeHtml(e.nom || '')}" maxlength="60">
            </div>
            <div class="form-row">
                <label class="form-row-label">Source</label>
                <select class="form-row-select" id="form-source">${sourceOptions}</select>
            </div>
            ${buildColorPickerHtml(e.color)}
            <div class="form-row">
                <label class="form-row-label">Description</label>
                <textarea class="form-row-textarea" id="form-description" placeholder="Effet du perk, coût en PL, conditions…">${escapeHtml(e.description || '')}</textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="form-btn cancel" data-action="cancel">Annuler</button>
                <button type="button" class="form-btn save" data-action="save">${isEdit ? 'Sauvegarder' : 'Ajouter'}</button>
            </div>
        </div>
    `;
    openBottomSheet(isEdit ? `Modifier · ${e.nom}` : 'Ajouter un Bond Perk', html, (root) => {
        bindColorPicker(root);
        root.querySelector('[data-action="cancel"]').addEventListener('click', closeBottomSheet);
        root.querySelector('[data-action="save"]').addEventListener('click', () => {
            const nom = root.querySelector('#form-nom').value.trim();
            if (!nom) { showToast('Donne un nom au perk'); return; }
            const item = isEdit ? existing : { id: genId(), used: false };
            item.nom = nom;
            item.source = root.querySelector('#form-source').value;
            item.description = root.querySelector('#form-description').value.trim();
            item.color = getSelectedColor(root);
            if (!isEdit) currentFiche.dragon.perks.push(item);
            saveFiche();
            renderDragonList('dperks');
            closeBottomSheet();
            showToast(isEdit ? 'Perk modifié' : 'Perk ajouté');
        });
    });
}


/* ─── Form : Arme dragon ───────────────────────────── */
function openDragonWeaponForm(itemId) {
    const isEdit = !!itemId;
    const existing = isEdit ? currentFiche.dragon.weapons.find(i => i.id === itemId) : null;
    const e = existing || {};
    const tiers = Array.isArray(e.damage_tiers) ? e.damage_tiers : [2,4,6,8,10];

    const presetOptions = `<option value="">— Custom (saisie libre) —</option>` +
        DRAGON_WEAPON_PRESETS.map((p, i) => `<option value="${i}">${p.nom} (${p.damage_type} · +${p.bonus_dice}d6 · ${p.draviks} Drv)</option>`).join('');

    const strikeOptions = `<option value="">— Aucun —</option>` +
        DRAGON_STRIKE_TYPES.map(s => `<option value="${s}"${e.damage_type === s ? ' selected' : ''}>${s}</option>`).join('');

    const html = `
        <div class="capacite-form">
            ${!isEdit ? `
                <p class="equip-preset-banner">💡 <strong>Preset officiel</strong> : 11 armes dragon du rulebook (Light/Medium/Heavy).</p>
                <div class="form-row">
                    <label class="form-row-label">Preset</label>
                    <select class="form-row-select" id="form-preset">${presetOptions}</select>
                </div>
            ` : ''}
            <div class="form-row">
                <label class="form-row-label">Nom *</label>
                <input type="text" class="form-row-input" id="form-nom" placeholder="Ex: Crocs de fer" value="${escapeHtml(e.nom || '')}" maxlength="60">
            </div>
            <div class="form-row-grid">
                <div class="form-row">
                    <label class="form-row-label">Catégorie</label>
                    <select class="form-row-select" id="form-type">
                        <option value="light"${e.type === 'light' ? ' selected' : ''}>Légère</option>
                        <option value="medium"${e.type === 'medium' ? ' selected' : ''}>Moyenne</option>
                        <option value="heavy"${e.type === 'heavy' ? ' selected' : ''}>Lourde</option>
                    </select>
                </div>
                <div class="form-row">
                    <label class="form-row-label">Zone de frappe</label>
                    <select class="form-row-select" id="form-dmg-type">${strikeOptions}</select>
                </div>
            </div>
            <div class="form-row-grid">
                <div class="form-row">
                    <label class="form-row-label">Bonus d'attaque (dés)</label>
                    <input type="number" class="form-row-input" id="form-bonus" min="0" max="5" value="${e.bonus_dice ?? 1}">
                </div>
                <div class="form-row">
                    <label class="form-row-label">Portée (1 = mêlée)</label>
                    <input type="number" class="form-row-input" id="form-range" min="0" max="20" value="${e.range ?? 1}">
                </div>
            </div>
            <div class="form-row">
                <label class="form-row-label">Dégâts par Tier (T1-T5)</label>
                <div class="form-row-grid" style="grid-template-columns: repeat(5, 1fr); gap: 4px;">
                    <input type="number" class="form-row-input" id="form-t1" min="0" max="50" value="${tiers[0]}" style="text-align:center;">
                    <input type="number" class="form-row-input" id="form-t2" min="0" max="50" value="${tiers[1]}" style="text-align:center;">
                    <input type="number" class="form-row-input" id="form-t3" min="0" max="50" value="${tiers[2]}" style="text-align:center;">
                    <input type="number" class="form-row-input" id="form-t4" min="0" max="50" value="${tiers[3]}" style="text-align:center;">
                    <input type="number" class="form-row-input" id="form-t5" min="0" max="50" value="${tiers[4]}" style="text-align:center;">
                </div>
            </div>
            <div class="form-row-grid">
                <div class="form-row">
                    <label class="form-row-label">Min Body</label>
                    <input type="number" class="form-row-input" id="form-min-body" min="0" max="10" value="${e.min_body ?? 2}">
                </div>
                <div class="form-row">
                    <label class="form-row-label">Prix (Draviks)</label>
                    <input type="number" class="form-row-input" id="form-draviks" min="0" max="9999" value="${e.draviks ?? 0}">
                </div>
            </div>
            ${buildColorPickerHtml(e.color)}
            <div class="form-row">
                <label class="form-row-label">Perk de l'arme</label>
                <textarea class="form-row-textarea" id="form-perk" placeholder="Ex : Sur 2+ succès, la cible subit Affaibli 1.">${escapeHtml(e.perk || '')}</textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="form-btn cancel" data-action="cancel">Annuler</button>
                <button type="button" class="form-btn save" data-action="save">${isEdit ? 'Sauvegarder' : 'Ajouter'}</button>
            </div>
        </div>
    `;
    openBottomSheet(isEdit ? `Modifier · ${e.nom}` : 'Ajouter une arme dragon', html, (root) => {
        bindColorPicker(root);

        const presetSel = root.querySelector('#form-preset');
        if (presetSel) {
            presetSel.addEventListener('change', () => {
                const idx = parseInt(presetSel.value, 10);
                if (isNaN(idx)) return;
                const p = DRAGON_WEAPON_PRESETS[idx];
                if (!p) return;
                root.querySelector('#form-nom').value = p.nom;
                root.querySelector('#form-type').value = p.type;
                root.querySelector('#form-dmg-type').value = p.damage_type;
                root.querySelector('#form-bonus').value = p.bonus_dice;
                root.querySelector('#form-range').value = p.range;
                root.querySelector('#form-t1').value = p.damage_tiers[0];
                root.querySelector('#form-t2').value = p.damage_tiers[1];
                root.querySelector('#form-t3').value = p.damage_tiers[2];
                root.querySelector('#form-t4').value = p.damage_tiers[3];
                root.querySelector('#form-t5').value = p.damage_tiers[4];
                root.querySelector('#form-min-body').value = p.min_body;
                root.querySelector('#form-draviks').value = p.draviks;
                root.querySelector('#form-perk').value = p.perk;
            });
        }

        root.querySelector('[data-action="cancel"]').addEventListener('click', closeBottomSheet);
        root.querySelector('[data-action="save"]').addEventListener('click', () => {
            const nom = root.querySelector('#form-nom').value.trim();
            if (!nom) { showToast('Donne un nom à l\'arme'); return; }
            const item = isEdit ? existing : { id: genId(), equipped: false };
            item.nom = nom;
            item.type = root.querySelector('#form-type').value;
            item.damage_type = root.querySelector('#form-dmg-type').value;
            item.bonus_dice = parseInt(root.querySelector('#form-bonus').value, 10) || 0;
            item.range = parseInt(root.querySelector('#form-range').value, 10) || 0;
            item.damage_tiers = [
                parseInt(root.querySelector('#form-t1').value, 10) || 0,
                parseInt(root.querySelector('#form-t2').value, 10) || 0,
                parseInt(root.querySelector('#form-t3').value, 10) || 0,
                parseInt(root.querySelector('#form-t4').value, 10) || 0,
                parseInt(root.querySelector('#form-t5').value, 10) || 0,
            ];
            item.min_body = parseInt(root.querySelector('#form-min-body').value, 10) || 0;
            item.draviks = parseInt(root.querySelector('#form-draviks').value, 10) || 0;
            item.perk = root.querySelector('#form-perk').value.trim();
            item.color = getSelectedColor(root);
            if (!isEdit) currentFiche.dragon.weapons.push(item);
            saveFiche();
            renderDragon();
            closeBottomSheet();
            showToast(isEdit ? 'Arme modifiée' : 'Arme ajoutée');
        });
    });
}


/* ─── Form : Armure dragon ─────────────────────────── */
function openDragonArmorForm(itemId) {
    const isEdit = !!itemId;
    const existing = isEdit ? currentFiche.dragon.armors.find(i => i.id === itemId) : null;
    const e = existing || {};

    const presetOptions = `<option value="">— Custom (saisie libre) —</option>` +
        DRAGON_ARMOR_PRESETS.map((p, i) => `<option value="${i}">${p.nom} (+${p.armor_bonus} Def · Min Body ${p.min_body} · ${p.draviks} Drv)</option>`).join('');

    const html = `
        <div class="capacite-form">
            ${!isEdit ? `
                <p class="equip-preset-banner">💡 <strong>Preset officiel</strong> : 9 armures dragon du rulebook (Scale Wraps → Sunsteel Barding).</p>
                <div class="form-row">
                    <label class="form-row-label">Preset</label>
                    <select class="form-row-select" id="form-preset">${presetOptions}</select>
                </div>
            ` : ''}
            <div class="form-row">
                <label class="form-row-label">Nom *</label>
                <input type="text" class="form-row-input" id="form-nom" placeholder="Ex: Caparaçon de fer" value="${escapeHtml(e.nom || '')}" maxlength="60">
            </div>
            <div class="form-row-grid">
                <div class="form-row">
                    <label class="form-row-label">Bonus Armure</label>
                    <input type="number" class="form-row-input" id="form-armor-bonus" min="0" max="10" value="${e.armor_bonus ?? 2}">
                </div>
                <div class="form-row">
                    <label class="form-row-label">Min Body</label>
                    <input type="number" class="form-row-input" id="form-min-body" min="0" max="10" value="${e.min_body ?? 2}">
                </div>
            </div>
            <div class="form-row">
                <label class="form-row-label">Prix (Draviks)</label>
                <input type="number" class="form-row-input" id="form-draviks" min="0" max="9999" value="${e.draviks ?? 0}">
            </div>
            ${buildColorPickerHtml(e.color)}
            <div class="form-row">
                <label class="form-row-label">Notes</label>
                <textarea class="form-row-textarea" id="form-perk" placeholder="Notes sur l'armure (optionnel)">${escapeHtml(e.perk || '')}</textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="form-btn cancel" data-action="cancel">Annuler</button>
                <button type="button" class="form-btn save" data-action="save">${isEdit ? 'Sauvegarder' : 'Ajouter'}</button>
            </div>
        </div>
    `;
    openBottomSheet(isEdit ? `Modifier · ${e.nom}` : 'Ajouter une armure dragon', html, (root) => {
        bindColorPicker(root);

        const presetSel = root.querySelector('#form-preset');
        if (presetSel) {
            presetSel.addEventListener('change', () => {
                const idx = parseInt(presetSel.value, 10);
                if (isNaN(idx)) return;
                const p = DRAGON_ARMOR_PRESETS[idx];
                if (!p) return;
                root.querySelector('#form-nom').value = p.nom;
                root.querySelector('#form-armor-bonus').value = p.armor_bonus;
                root.querySelector('#form-min-body').value = p.min_body;
                root.querySelector('#form-draviks').value = p.draviks;
                root.querySelector('#form-perk').value = '';
            });
        }

        root.querySelector('[data-action="cancel"]').addEventListener('click', closeBottomSheet);
        root.querySelector('[data-action="save"]').addEventListener('click', () => {
            const nom = root.querySelector('#form-nom').value.trim();
            if (!nom) { showToast('Donne un nom à l\'armure'); return; }
            const item = isEdit ? existing : { id: genId(), equipped: false };
            item.nom = nom;
            item.armor_bonus = parseInt(root.querySelector('#form-armor-bonus').value, 10) || 0;
            item.min_body = parseInt(root.querySelector('#form-min-body').value, 10) || 0;
            item.draviks = parseInt(root.querySelector('#form-draviks').value, 10) || 0;
            item.perk = root.querySelector('#form-perk').value.trim();
            item.color = getSelectedColor(root);
            if (!isEdit) currentFiche.dragon.armors.push(item);
            saveFiche();
            renderDragon();
            closeBottomSheet();
            showToast(isEdit ? 'Armure modifiée' : 'Armure ajoutée');
        });
    });
}


/* ═══════════════════════════════════════════════════════════════
   LANCEUR DE DÉS — Vague 3
   Mécaniques officielles Drakonym (Core Rulebook v1.0) :
   - Pool : 2 attributs additionnés OU 1 attribut doublé (Single Attribute Check)
   - 5 sur d6 = 1 succès, 6 sur d6 = 2 succès, 1 ne fait rien
   - Faveur : compte un 4 comme succès OU Second Wind sur doublons non-succès (1-4)
   - Fardeau : ignore un 5 (strict, pas de fallback)
   - Boons et Banes s'annulent 1-pour-1 avant le jet
   - Shadow Die (d12) : narratif (1=Disaster, 2-3=Complication, 4-9=Aucun, 10-11=Opportunity, 12=Miracle)
   - Points de Héros : Faveur (-1HP), Reroll (-2HP), Aide allié (-1HP), Narratif (-3HP)
   ═══════════════════════════════════════════════════════════════ */

const DICE_LOG_KEY = 'drakonym_compagnon_dice_log';
const DICE_PRESETS_KEY = 'drakonym_compagnon_dice_presets';

/* ─── Presets de jets sauvegardés (Vague 8) ─────────── */
let dicePresets = [];

function loadDicePresets() {
    try {
        const raw = localStorage.getItem(DICE_PRESETS_KEY);
        if (raw) dicePresets = JSON.parse(raw) || [];
    } catch (e) { dicePresets = []; }
}

function saveDicePresets() {
    try { localStorage.setItem(DICE_PRESETS_KEY, JSON.stringify(dicePresets)); }
    catch (e) {}
}

function saveCurrentRollAsPreset() {
    if (!currentRoll) return;
    // Capturer un snapshot maintenant — currentRoll peut devenir null si la modal se ferme
    const snapshot = {
        attrs: currentRoll.attrs.slice(),
        modifier: currentRoll.modifier || 0,
        attackMode: !!currentRoll.attackMode,
        difficulty: currentRoll.difficulty || 0,
        useShadow: !!currentRoll.useShadow,
        label: currentRoll.label || '',
    };
    const html = `
        <div class="capacite-form">
            <div class="form-row">
                <label class="form-row-label">Nom du preset *</label>
                <input type="text" class="form-row-input" id="form-preset-nom" placeholder="Ex: Attaque arme, Charme, Sortilège…" maxlength="40">
            </div>
            <p style="font-size: 12px; color: var(--text-muted); font-style: italic;">
                Le preset enregistre les attributs sélectionnés, le modificateur, la difficulté et le mode (attaque ou normal).
            </p>
            <div class="form-actions">
                <button type="button" class="form-btn cancel" data-action="cancel">Annuler</button>
                <button type="button" class="form-btn save" data-action="save">Enregistrer</button>
            </div>
        </div>
    `;
    openBottomSheet('Sauver le jet', html, (root) => {
        const input = root.querySelector('#form-preset-nom');
        // Pré-rempli avec le label si dispo
        if (snapshot.label) input.value = snapshot.label;
        setTimeout(() => input.focus(), 200);

        root.querySelector('[data-action="cancel"]').addEventListener('click', closeBottomSheet);
        root.querySelector('[data-action="save"]').addEventListener('click', () => {
            const nom = input.value.trim();
            if (!nom) { showToast('Donne un nom au preset'); return; }
            dicePresets.push({
                id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
                nom,
                attrs: snapshot.attrs,
                modifier: snapshot.modifier,
                attackMode: snapshot.attackMode,
                difficulty: snapshot.difficulty,
                useShadow: snapshot.useShadow,
                label: snapshot.label || nom,
            });
            saveDicePresets();
            closeBottomSheet();
            renderDicePresetsList();
            showToast(`💾 Preset « ${nom} » sauvé`);
        });
    });
}

function applyDicePreset(presetId) {
    const p = dicePresets.find(x => x.id === presetId);
    if (!p) return;
    currentRoll.attrs = p.attrs.slice();
    currentRoll.modifier = p.modifier;
    currentRoll.attackMode = p.attackMode;
    currentRoll.difficulty = p.difficulty;
    currentRoll.useShadow = p.useShadow;
    currentRoll.label = p.label;
    renderDiceModal();
    showToast(`📌 ${p.nom} chargé`);
}

function deleteDicePreset(presetId) {
    const idx = dicePresets.findIndex(x => x.id === presetId);
    if (idx < 0) return;
    const p = dicePresets[idx];
    dicePresets.splice(idx, 1);
    saveDicePresets();
    renderDicePresetsList();
    showToast(`Preset « ${p.nom} » supprimé`);
}

function renderDicePresetsList() {
    const listEl = document.getElementById('dice-presets-list');
    if (!listEl) return;
    if (dicePresets.length === 0) {
        listEl.innerHTML = `<p class="dice-presets-empty">Aucun preset. Configure un jet et tap « Sauver ».</p>`;
        return;
    }
    listEl.innerHTML = dicePresets.map(p => {
        const attrSummary = p.attrs.length > 0 ? p.attrs.join('+') : '∅';
        const modSign = p.modifier > 0 ? '+' : '';
        return `
            <div class="dice-preset-row" data-id="${p.id}">
                <button type="button" class="dice-preset-apply" data-action="apply" data-id="${p.id}">
                    <span class="dice-preset-name">${escapeHtml(p.nom)}</span>
                    <span class="dice-preset-meta">${attrSummary}${p.modifier !== 0 ? ` ${modSign}${p.modifier}` : ''}${p.attackMode ? ' · ⚔' : ''}${p.difficulty > 0 ? ` · D${p.difficulty}` : ''}</span>
                </button>
                <button type="button" class="dice-preset-delete" data-action="delete" data-id="${p.id}" aria-label="Supprimer">🗑</button>
            </div>
        `;
    }).join('');
    // Bind clicks
    listEl.querySelectorAll('[data-action="apply"]').forEach(btn => {
        btn.addEventListener('click', () => applyDicePreset(btn.dataset.id));
    });
    listEl.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteDicePreset(btn.dataset.id);
        });
    });
}
const MAX_DICE_LOG = 20;

let currentRoll = null;  // état du jet en cours
let diceLog = [];        // historique des derniers jets
let diceModalView = 'config'; // 'config' | 'result' | 'log'

function rollD6() { return Math.floor(Math.random() * 6) + 1; }
function rollD12() { return Math.floor(Math.random() * 12) + 1; }


/* ─── Outcomes du Dé d'Ombre (rulebook page 15) ─────────────── */
function getShadowOutcome(value) {
    if (value === 1)  return { name: 'Désastre',     cssClass: 'disaster',     desc: "Un revers narratif sévère, même si le check réussit." };
    if (value <= 3)   return { name: 'Complication', cssClass: 'complication', desc: "Un revers négatif s'ajoute au résultat." };
    if (value <= 9)   return { name: 'Aucun changement', cssClass: 'neutral', desc: "Seul le résultat du check importe." };
    if (value <= 11)  return { name: 'Opportunité',  cssClass: 'opportunity',  desc: "Un petit coup de pouce narratif." };
    return                  { name: 'Miracle',       cssClass: 'miracle',      desc: "Si le check réussit, l'effet est amplifié. S'il échoue, le pire est évité." };
}


/* ─── Persistance du log ──────────────────────────────── */
function loadDiceLog() {
    try {
        const raw = localStorage.getItem(DICE_LOG_KEY);
        if (raw) diceLog = JSON.parse(raw);
    } catch (e) { diceLog = []; }
}
function saveDiceLog() {
    try { localStorage.setItem(DICE_LOG_KEY, JSON.stringify(diceLog)); }
    catch (e) { /* ignore */ }
}


/* ─── Ouverture du modal ─────────────────────────────── */
function openDiceRoller(presetAttrs, options) {
    options = options || {};
    currentRoll = {
        attrs: Array.isArray(presetAttrs) ? presetAttrs.slice(0, 2) : [],
        modifier: options.modifier || 0,
        boons: options.boons || 0,
        banes: options.banes || 0,
        useHpBoon: false,
        useShadow: false,
        difficulty: options.difficulty || 0,
        label: options.label || '',
        attackMode: options.attackMode === true,
        // Bonus d'arme dédié (séparé du modifier pour affichage explicite)
        weaponName: options.weaponName || null,
        weaponBonus: options.weaponBonus || 0,
        weaponMinBody: options.weaponMinBody || 0,
        weaponMinBodyOk: options.weaponMinBodyOk !== false,
        // Mode "jets libres" : autres dés classiques JDR
        freeMode: false,
        freeDieType: 6,         // d4, d6, d8, d10, d12, d20, d100
        freeDiceCount: 1,
        freeModifier: 0,
        // rempli après le jet :
        dice: null,
        shadowValue: null,
        boonsRemaining: 0,
        secondWindUsed: [],
        bonesAfterCancel: 0,
        // pour les jets libres
        freeResults: null,      // array de valeurs
        freeTotal: null,
    };
    diceModalView = 'config';
    document.getElementById('dice-modal').hidden = false;
    renderDiceModal();
}

function closeDiceRoller() {
    // Si un jet a été effectué et pas encore loggé, on l'enregistre
    if (currentRoll && currentRoll.dice && !currentRoll._logged) {
        addCurrentRollToLog();
    }
    document.getElementById('dice-modal').hidden = true;
    currentRoll = null;
    diceModalView = 'config';
}


/* ─── Rendering : router selon la vue ─────────────────── */
function renderDiceModal() {
    const titleEl = document.getElementById('dice-modal-title');
    const bodyEl = document.getElementById('dice-modal-body');
    const footerEl = document.getElementById('dice-modal-footer');

    if (diceModalView === 'log') {
        titleEl.textContent = 'Historique';
        bodyEl.innerHTML = renderDiceLogHtml();
        if (footerEl) footerEl.innerHTML = '';
        bindDiceLogActions(bodyEl);
    } else if (diceModalView === 'rolling' && currentRoll && currentRoll.dice) {
        titleEl.textContent = 'Lancement…';
        bodyEl.innerHTML = renderDiceRollingHtml();
        if (footerEl) footerEl.innerHTML = '';
        // Pas de bind, l'animation se gère via JS direct
    } else if (diceModalView === 'result' && currentRoll && currentRoll.freeMode && currentRoll.freeResults) {
        titleEl.textContent = 'Résultat';
        bodyEl.innerHTML = renderDiceFreeResultHtml();
        if (footerEl) footerEl.innerHTML = '';
        // Bind les boutons reroll / back
        const rerollBtn = bodyEl.querySelector('[data-action="reroll-free"]');
        if (rerollBtn) rerollBtn.addEventListener('click', performFreeRoll);
        const backBtn = bodyEl.querySelector('[data-action="back-config"]');
        if (backBtn) backBtn.addEventListener('click', () => {
            diceModalView = 'config';
            currentRoll.freeResults = null;
            currentRoll.freeTotal = null;
            renderDiceModal();
        });
    } else if (diceModalView === 'result' && currentRoll && currentRoll.dice) {
        titleEl.textContent = 'Résultat';
        bodyEl.innerHTML = renderDiceResultHtml();
        if (footerEl) footerEl.innerHTML = '';
        bindDiceResultActions(bodyEl);
    } else {
        titleEl.textContent = 'Lancer de dés';
        bodyEl.innerHTML = renderDiceConfigHtml();
        if (footerEl) footerEl.innerHTML = renderDiceLaunchButtonHtml();
        bindDiceConfigActions(bodyEl);
        // Le bouton Lancer est dans le footer mais ses listeners sont bindés via bindDiceConfigActions
        bindDiceLaunchButton(footerEl);
    }
}

/* Bouton "Lancer" rendu dans le footer fixe */
function renderDiceLaunchButtonHtml() {
    if (currentRoll && currentRoll.freeMode) {
        const dieType = currentRoll.freeDieType || 6;
        const count = currentRoll.freeDiceCount || 1;
        const mod = currentRoll.freeModifier || 0;
        const modStr = mod === 0 ? '' : (mod > 0 ? ` + ${mod}` : ` − ${-mod}`);
        return `
            <button type="button" class="dice-roll-btn" id="dice-roll-btn">
                <span class="dice-roll-btn-glyph">🎲</span>
                <span>LANCER ${count}d${dieType}${modStr}</span>
            </button>
        `;
    }
    const pool = computePoolSize();
    const netBoon = Math.max(0, (currentRoll.boons || 0) - (currentRoll.banes || 0));
    const netBane = Math.max(0, (currentRoll.banes || 0) - (currentRoll.boons || 0));
    const rollLabel = pool === 0
        ? 'Sélectionne au moins un attribut'
        : `LANCER ${pool}d6${netBoon > 0 ? ` + ${netBoon} Faveur` : ''}${netBane > 0 ? ` + ${netBane} Fardeau` : ''}${currentRoll.useShadow ? ' + d12' : ''}`;
    return `
        <button type="button" class="dice-roll-btn" id="dice-roll-btn"${pool === 0 ? ' disabled' : ''}>
            <span class="dice-roll-btn-glyph">⚂</span>
            <span>${rollLabel}</span>
        </button>
    `;
}

function bindDiceLaunchButton(footerEl) {
    if (!footerEl) return;
    const btn = footerEl.querySelector('#dice-roll-btn');
    if (btn) btn.addEventListener('click', () => {
        if (currentRoll && currentRoll.freeMode) performFreeRoll();
        else performRoll();
    });
}

function refreshDiceLaunchButton() {
    const footerEl = document.getElementById('dice-modal-footer');
    if (!footerEl) return;
    footerEl.innerHTML = renderDiceLaunchButtonHtml();
    bindDiceLaunchButton(footerEl);
}

function renderDiceRollingHtml() {
    const pool = currentRoll.dice.length;
    const dice = Array.from({ length: pool }, (_, i) =>
        `<div class="dice-die rolling-die" data-rolling-idx="${i}">${Math.ceil(Math.random() * 6)}</div>`
    ).join('');
    return `
        <div class="dice-rolling-banner">
            <div class="dice-rolling-spinner">⚄</div>
            <p class="dice-rolling-text">${currentRoll.label ? escapeHtml(currentRoll.label) + ' · ' : ''}<strong>${pool} dés en cours…</strong></p>
        </div>
        <div class="dice-display dice-display-rolling">
            ${dice}
        </div>
        ${currentRoll.shadowValue !== null ? `
            <div class="dice-shadow-rolling">
                <span class="dice-rolling-spinner small">🌑</span>
                <span class="dice-shadow-rolling-value" id="shadow-rolling-value">${Math.ceil(Math.random()*12)}</span>
            </div>
        ` : ''}
    `;
}


/* ─── Calcul du pool selon les attributs sélectionnés ─── */
function computePoolSize() {
    if (!currentRoll) return 0;
    const f = currentFiche;
    const attrs = currentRoll.attrs.filter(a => f.attributs[a] != null);
    let base = 0;
    if (currentRoll.attackMode) {
        // Mode attaque : Primary + bonus, pas de doublement
        base = attrs.reduce((sum, a) => sum + (f.attributs[a] || 0), 0);
    } else if (attrs.length === 1) {
        base = (f.attributs[attrs[0]] || 0) * 2;
    } else if (attrs.length >= 2) {
        base = (f.attributs[attrs[0]] || 0) + (f.attributs[attrs[1]] || 0);
    }
    // Bonus d'arme uniquement si min_body atteint
    const wBonus = currentRoll.weaponMinBodyOk ? (currentRoll.weaponBonus || 0) : 0;
    return Math.max(0, base + currentRoll.modifier + wBonus);
}

function getPoolModeLabel() {
    const attrs = currentRoll.attrs.filter(a => currentFiche.attributs[a] != null);
    if (attrs.length === 0) return { html: 'Sélectionne 1 ou 2 attributs', empty: true };
    if (currentRoll.attackMode) {
        const total = attrs.reduce((sum, a) => sum + (currentFiche.attributs[a] || 0), 0);
        const detail = attrs.map(a => `<em>${a}</em> (${currentFiche.attributs[a] || 0})`).join(' + ');
        // Bonus d'arme (visible explicitement)
        const wBonus = currentRoll.weaponBonus || 0;
        const wOk = currentRoll.weaponMinBodyOk;
        let bonusPart = '';
        let totalWithBonus = total;
        if (wBonus > 0) {
            if (wOk) {
                bonusPart = ` + <em>Bonus arme</em> (+${wBonus})`;
                totalWithBonus = total + wBonus;
            } else {
                bonusPart = ` <span style="color: var(--crimson); text-decoration: line-through;">+ Bonus arme (+${wBonus})</span> <small style="color: var(--crimson);">⚠ Min Body ${currentRoll.weaponMinBody} non atteint</small>`;
            }
        }
        return { html: `${detail}${bonusPart} → ${totalWithBonus} dés (mode attaque, sans doublement)`, empty: false };
    }
    if (attrs.length === 1) {
        const v = currentFiche.attributs[attrs[0]] || 0;
        return { html: `<em>${attrs[0]}</em> (${v}) × 2 → un seul attribut, doublé`, empty: false };
    }
    const v1 = currentFiche.attributs[attrs[0]] || 0;
    const v2 = currentFiche.attributs[attrs[1]] || 0;
    return { html: `<em>${attrs[0]}</em> (${v1}) + <em>${attrs[1]}</em> (${v2}) → addition`, empty: false };
}


/* ─── Vue : Configuration ────────────────────────────── */
function renderDiceConfigHtml() {
    // Toggle mode Drakonym / Libre tout en haut
    const modeToggleHtml = `
        <div class="dice-mode-toggle" role="group" aria-label="Mode de lancer">
            <button type="button" class="dice-mode-btn${currentRoll.freeMode ? '' : ' active'}" data-mode="drakonym">
                <span class="dice-mode-icon">⚔️</span>
                <span>Drakonym</span>
            </button>
            <button type="button" class="dice-mode-btn${currentRoll.freeMode ? ' active' : ''}" data-mode="free">
                <span class="dice-mode-icon">🎲</span>
                <span>Dés libres</span>
            </button>
        </div>
    `;

    if (currentRoll.freeMode) {
        return modeToggleHtml + renderDiceConfigFreeHtml();
    }

    const f = currentFiche;
    const pool = computePoolSize();
    const mode = getPoolModeLabel();

    // Auto-cancellation pour l'affichage du Net Faveur/Fardeau
    const effBoons = currentRoll.boons + (currentRoll.useHpBoon ? 1 : 0);
    const effBanes = currentRoll.banes;
    const cancel = Math.min(effBoons, effBanes);
    const netBoon = effBoons - cancel;
    const netBane = effBanes - cancel;
    let netLabel = '';
    if (netBoon > 0) netLabel = `+${netBoon} Faveur nette`;
    else if (netBane > 0) netLabel = `+${netBane} Fardeau net`;
    else if (cancel > 0) netLabel = 'Annulés';
    else netLabel = 'aucun';

    const hpAvailable = (f.hp_current || 0) > 0;
    const order = ['Body', 'Mind', 'Soul', 'Shadow', 'Gods', 'World'];
    const attrCellsHtml = order.map(name => {
        const isSelected = currentRoll.attrs.includes(name);
        const isDoubled = isSelected && currentRoll.attrs.length === 1 && !currentRoll.attackMode;
        const cls = 'dice-attr-cell' + (isSelected ? ' selected' : '') + (isDoubled ? ' doubled' : '');
        return `
            <button type="button" class="${cls}" data-attr="${name}">
                <div class="dice-attr-name">${name}</div>
                <div class="dice-attr-value">${f.attributs[name] || 0}</div>
            </button>`;
    }).join('');

    const rollLabel = pool > 0
        ? `LANCER ${pool}d6${netBoon > 0 ? ` + ${netBoon} Faveur` : ''}${netBane > 0 ? ` + ${netBane} Fardeau` : ''}${currentRoll.useShadow ? ' + d12' : ''}`
        : 'SÉLECTIONNE UN ATTRIBUT';

    return `
        ${modeToggleHtml}
        ${currentRoll.attackMode ? `
            <div class="attack-mode-banner">
                ⚔️ <strong>Mode attaque</strong> · Pool = Primary + Bonus Arme (sans doublement)
            </div>
        ` : ''}
        <div class="dice-config-block">
            <input type="text" class="dice-label-input" id="dice-label-input" placeholder="Nom du jet (optionnel)" value="${escapeHtml(currentRoll.label)}">
        </div>

        <div class="dice-config-block">
            <div class="dice-config-label">
                <span>Pool · 1 ou 2 attributs</span>
                <span class="dice-config-label-info">${pool}d6</span>
            </div>
            <div class="dice-attr-grid">${attrCellsHtml}</div>
            <div class="dice-pool-mode${mode.empty ? ' empty' : ''}">${mode.html}</div>

            <div class="dice-row-stepper">
                <span class="dice-row-stepper-label">Modificateur</span>
                <div class="dice-row-stepper-controls">
                    <button type="button" data-stepper="modifier" data-delta="-1">−</button>
                    <span class="dice-row-stepper-value">${currentRoll.modifier > 0 ? '+' : ''}${currentRoll.modifier}</span>
                    <button type="button" data-stepper="modifier" data-delta="1">+</button>
                </div>
            </div>
        </div>

        <div class="dice-config-block">
            <div class="dice-config-label">
                <span>Modificateurs</span>
                <span class="dice-config-label-info">${netLabel}</span>
            </div>
            <div class="dice-bb-row">
                <div class="dice-row-stepper">
                    <span class="dice-row-stepper-label" style="color: var(--gold);">Faveurs</span>
                    <div class="dice-row-stepper-controls">
                        <button type="button" data-stepper="boons" data-delta="-1">−</button>
                        <span class="dice-row-stepper-value">${currentRoll.boons}</span>
                        <button type="button" data-stepper="boons" data-delta="1">+</button>
                    </div>
                </div>
                <div class="dice-row-stepper">
                    <span class="dice-row-stepper-label" style="color: var(--shadow-bright);">Fardeaux</span>
                    <div class="dice-row-stepper-controls">
                        <button type="button" data-stepper="banes" data-delta="-1">−</button>
                        <span class="dice-row-stepper-value">${currentRoll.banes}</span>
                        <button type="button" data-stepper="banes" data-delta="1">+</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="dice-config-block">
            <div class="dice-config-label"><span>Difficulté (optionnel)</span></div>
            <div class="dice-row-stepper">
                <span class="dice-row-stepper-label">${currentRoll.difficulty === 0 ? 'Jet libre' : 'D' + currentRoll.difficulty}</span>
                <div class="dice-row-stepper-controls">
                    <button type="button" data-stepper="difficulty" data-delta="-1">−</button>
                    <span class="dice-row-stepper-value">${currentRoll.difficulty}</span>
                    <button type="button" data-stepper="difficulty" data-delta="1">+</button>
                </div>
            </div>
        </div>

        <div class="dice-config-block">
            <div class="dice-config-label"><span>Options</span></div>
            <div class="dice-toggle${currentRoll.useShadow ? ' active' : ''}" data-toggle="useShadow">
                <span class="dice-toggle-label"><span class="dice-toggle-icon">🌑</span> Dé d'Ombre (d12)</span>
                <span class="dice-toggle-switch"></span>
            </div>
            <div class="dice-toggle${currentRoll.useHpBoon ? ' active' : ''}${!hpAvailable ? ' disabled' : ''}" data-toggle="useHpBoon">
                <span class="dice-toggle-label"><span class="dice-toggle-icon">⭐</span> Point de Héros · Faveur gratuite (−1 HP)</span>
                <span class="dice-toggle-switch"></span>
            </div>
        </div>

        <div class="dice-config-block dice-presets-block">
            <div class="dice-config-label">
                <span>📌 Mes presets de jets</span>
                <button type="button" class="dice-preset-save-btn" data-action="save-preset">💾 Sauver ce jet</button>
            </div>
            <div class="dice-presets-list" id="dice-presets-list"></div>
        </div>
    `;
}

/* ═══════════════════════════════════════════════════════════════
   MODE JETS LIBRES — d4, d6, d8, d10, d12, d20, d100
   ═══════════════════════════════════════════════════════════════ */
const FREE_DIE_TYPES = [4, 6, 8, 10, 12, 20, 100];

function renderDiceConfigFreeHtml() {
    const dieType = currentRoll.freeDieType || 6;
    const count = currentRoll.freeDiceCount || 1;
    const mod = currentRoll.freeModifier || 0;

    const dieButtonsHtml = FREE_DIE_TYPES.map(d => `
        <button type="button" class="free-die-btn${d === dieType ? ' active' : ''}" data-free-die="${d}">
            d${d}
        </button>
    `).join('');

    return `
        <div class="dice-config-block">
            <input type="text" class="dice-label-input" id="dice-label-input" placeholder="Nom du jet (optionnel)" value="${escapeHtml(currentRoll.label)}">
        </div>

        <div class="dice-config-block">
            <div class="dice-config-label"><span>Type de dé</span></div>
            <div class="free-dice-grid">${dieButtonsHtml}</div>
        </div>

        <div class="dice-config-block">
            <div class="dice-row-stepper">
                <span class="dice-row-stepper-label">Nombre de dés</span>
                <div class="dice-row-stepper-controls">
                    <button type="button" data-free-stepper="count" data-delta="-1">−</button>
                    <span class="dice-row-stepper-value">${count}</span>
                    <button type="button" data-free-stepper="count" data-delta="1">+</button>
                </div>
            </div>
            <div class="dice-row-stepper">
                <span class="dice-row-stepper-label">Modificateur</span>
                <div class="dice-row-stepper-controls">
                    <button type="button" data-free-stepper="modifier" data-delta="-1">−</button>
                    <span class="dice-row-stepper-value">${mod > 0 ? '+' : ''}${mod}</span>
                    <button type="button" data-free-stepper="modifier" data-delta="1">+</button>
                </div>
            </div>
        </div>

        <p class="dice-free-hint">💡 Mode libre : utilisé pour les jets d'autres systèmes (D&D, etc.). Affiche somme + détail. Pas de Faveurs/Fardeaux ni de succès.</p>
    `;
}

function performFreeRoll() {
    const dieType = currentRoll.freeDieType || 6;
    const count = Math.max(1, Math.min(20, currentRoll.freeDiceCount || 1));
    const mod = currentRoll.freeModifier || 0;

    // Son des dés
    playDiceRollSound(count);

    const results = [];
    for (let i = 0; i < count; i++) {
        results.push(Math.floor(Math.random() * dieType) + 1);
    }
    const sum = results.reduce((a, b) => a + b, 0);
    currentRoll.freeResults = results;
    currentRoll.freeTotal = sum + mod;
    diceModalView = 'result';
    renderDiceModal();
}

function renderDiceFreeResultHtml() {
    const dieType = currentRoll.freeDieType;
    const count = currentRoll.freeDiceCount;
    const mod = currentRoll.freeModifier;
    const results = currentRoll.freeResults || [];
    const sum = results.reduce((a, b) => a + b, 0);
    const total = currentRoll.freeTotal;

    const formula = mod !== 0
        ? `${count}d${dieType}${mod > 0 ? ` + ${mod}` : ` − ${-mod}`} = <strong>${total}</strong>`
        : `${count}d${dieType} = <strong>${total}</strong>`;

    const detailsHtml = results.map(v => `<span class="free-die-result">${v}</span>`).join(' ');

    return `
        ${currentRoll.label ? `<p class="dice-result-label">${escapeHtml(currentRoll.label)}</p>` : ''}
        <div class="dice-free-result">
            <div class="dice-free-formula">${formula}</div>
            <div class="dice-free-detail">
                <span class="dice-free-detail-label">Détail : </span>
                ${detailsHtml}
                ${mod !== 0 ? `<span class="dice-free-mod"> ${mod > 0 ? '+' : '−'} ${Math.abs(mod)}</span>` : ''}
            </div>
        </div>
        <div class="dice-result-actions">
            <button type="button" class="action-btn primary" data-action="reroll-free">↻ Relancer</button>
            <button type="button" class="action-btn" data-action="back-config">⚙️ Modifier</button>
        </div>
    `;
}

function bindDiceConfigActions(root) {
    // Toggle Drakonym / Libre
    root.querySelectorAll('[data-mode]').forEach(btn => {
        btn.addEventListener('click', () => {
            const newMode = btn.dataset.mode === 'free';
            if (newMode === !!currentRoll.freeMode) return;
            currentRoll.freeMode = newMode;
            renderDiceModal();
        });
    });

    // Label
    const labelInput = root.querySelector('#dice-label-input');
    if (labelInput) labelInput.addEventListener('input', () => { currentRoll.label = labelInput.value; });

    // ── MODE LIBRE : boutons de type de dé + steppers ──
    if (currentRoll.freeMode) {
        root.querySelectorAll('[data-free-die]').forEach(btn => {
            btn.addEventListener('click', () => {
                currentRoll.freeDieType = parseInt(btn.dataset.freeDie, 10);
                renderDiceModal();
            });
        });
        root.querySelectorAll('[data-free-stepper]').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.dataset.freeStepper;
                const delta = parseInt(btn.dataset.delta, 10);
                if (key === 'count') {
                    currentRoll.freeDiceCount = Math.max(1, Math.min(20, (currentRoll.freeDiceCount || 1) + delta));
                } else if (key === 'modifier') {
                    currentRoll.freeModifier = Math.max(-50, Math.min(50, (currentRoll.freeModifier || 0) + delta));
                }
                renderDiceModal();
            });
        });
        return;  // pas besoin des autres bindings Drakonym
    }

    // Attribute selection
    root.querySelectorAll('.dice-attr-cell').forEach(cell => {
        cell.addEventListener('click', () => {
            const name = cell.dataset.attr;
            const idx = currentRoll.attrs.indexOf(name);
            if (idx >= 0) {
                currentRoll.attrs.splice(idx, 1);
            } else {
                if (currentRoll.attrs.length >= 2) currentRoll.attrs.shift(); // FIFO si déjà 2
                currentRoll.attrs.push(name);
            }
            renderDiceModal();
        });
    });

    // Steppers (modifier, boons, banes, difficulty)
    root.querySelectorAll('[data-stepper]').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.stepper;
            const delta = parseInt(btn.dataset.delta, 10);
            if (key === 'modifier') currentRoll.modifier = Math.max(-20, Math.min(20, currentRoll.modifier + delta));
            else if (key === 'boons') currentRoll.boons = Math.max(0, Math.min(10, currentRoll.boons + delta));
            else if (key === 'banes') currentRoll.banes = Math.max(0, Math.min(10, currentRoll.banes + delta));
            else if (key === 'difficulty') currentRoll.difficulty = Math.max(0, Math.min(20, currentRoll.difficulty + delta));
            renderDiceModal();
        });
    });

    // Toggles
    root.querySelectorAll('[data-toggle]').forEach(el => {
        el.addEventListener('click', () => {
            if (el.classList.contains('disabled')) return;
            const key = el.dataset.toggle;
            currentRoll[key] = !currentRoll[key];
            renderDiceModal();
        });
    });

    // Save preset button
    const savePresetBtn = root.querySelector('[data-action="save-preset"]');
    if (savePresetBtn) savePresetBtn.addEventListener('click', saveCurrentRollAsPreset);

    // Render presets list (after the rest of the config is in DOM)
    renderDicePresetsList();
}


/* ═══════════════════════════════════════════════════════════════
   COMBAT MODE — v1.18.0 — UI simplifiée pour gérer un combat
   ═══════════════════════════════════════════════════════════════ */
const COMBAT_MODE_KEY = 'drakonym_combat_mode';
let _combatMode = (function() {
    try { return localStorage.getItem(COMBAT_MODE_KEY) === '1'; }
    catch (e) { return false; }
})();
function isCombatMode() { return _combatMode; }
function setCombatMode(enabled) {
    _combatMode = !!enabled;
    try { localStorage.setItem(COMBAT_MODE_KEY, _combatMode ? '1' : '0'); } catch (e) {}
    document.body.classList.toggle('combat-mode-on', _combatMode);
    renderCombatPanel();
    refreshCombatToggle();
}
function refreshCombatToggle() {
    const btn = document.getElementById('vital-combat-toggle');
    if (!btn) return;
    btn.classList.toggle('combat-on', _combatMode);
    btn.setAttribute('aria-pressed', _combatMode ? 'true' : 'false');
    btn.title = _combatMode ? 'Mode combat actif — clique pour désactiver' : 'Activer le mode combat (UI simplifiée)';
}

/* ─── Render du panneau Combat sous la Vital Bar ─────────────── */
function renderCombatPanel() {
    const panel = document.getElementById('combat-panel');
    if (!panel) return;
    if (!_combatMode) {
        panel.hidden = true;
        panel.innerHTML = '';
        return;
    }
    panel.hidden = false;
    const f = currentFiche;
    if (!f) { panel.innerHTML = ''; return; }

    // Steppers compacts pour HP/AP/Mana/Grit/Défense
    const stepperHtml = (label, current, max, key) => {
        const display = (max !== null && max !== undefined) ? `${current}/${max}` : `${current}`;
        return `
            <div class="combat-stepper" data-stepper-key="${key}">
                <div class="combat-stepper-label">${label}</div>
                <div class="combat-stepper-controls">
                    <button type="button" class="combat-stepper-btn" data-combat-stepper="${key}" data-delta="-1">−</button>
                    <span class="combat-stepper-value">${display}</span>
                    <button type="button" class="combat-stepper-btn" data-combat-stepper="${key}" data-delta="1">+</button>
                </div>
            </div>
        `;
    };

    panel.innerHTML = `
        <button type="button" class="combat-start-round-btn" id="combat-start-round-btn">
            <span class="combat-start-round-icon">🎯</span>
            <span class="combat-start-round-text">Début de round</span>
            <span class="combat-start-round-hint">+3 AP · Def · Mana · Grit · BP</span>
        </button>

        <div class="combat-steppers-grid">
            ${stepperHtml('PH', f.hp_current, f.hp_max, 'hp')}
            ${stepperHtml('AP', f.ap_current, null, 'ap')}
            ${stepperHtml('Mana', f.mana_current, f.mana_max, 'mana')}
            ${stepperHtml('Grit', f.grit_current, f.grit_max, 'grit')}
            ${stepperHtml('Déf', f.defense_current, f.defense_max, 'defense')}
        </div>

        <div class="combat-actions-row">
            <button type="button" class="combat-action-btn danger" id="combat-suffer-wound-btn">
                <span>💥</span> Subir Wound
            </button>
            <button type="button" class="combat-action-btn" id="combat-dice-btn">
                <span>🎲</span> Lancer dés
            </button>
        </div>
    `;

    // Bind
    document.getElementById('combat-start-round-btn').addEventListener('click', openStartOfRoundSheet);
    document.getElementById('combat-suffer-wound-btn').addEventListener('click', openSufferWoundSheet);
    document.getElementById('combat-dice-btn').addEventListener('click', () => openDiceRoller([], {}));
    panel.querySelectorAll('[data-combat-stepper]').forEach(btn => {
        btn.addEventListener('click', () => {
            applyCombatStepper(btn.dataset.combatStepper, parseInt(btn.dataset.delta, 10));
        });
    });
}

function applyCombatStepper(key, delta) {
    const f = currentFiche;
    if (!f) return;
    switch (key) {
        case 'hp':
            f.hp_current = Math.max(0, Math.min(f.hp_max, (f.hp_current || 0) + delta));
            break;
        case 'ap':
            f.ap_current = Math.max(0, (f.ap_current || 0) + delta);
            break;
        case 'mana':
            f.mana_current = Math.max(0, Math.min(f.mana_max || 0, (f.mana_current || 0) + delta));
            break;
        case 'grit':
            f.grit_current = Math.max(0, Math.min(f.grit_max || 0, (f.grit_current || 0) + delta));
            break;
        case 'defense':
            f.defense_current = Math.max(0, Math.min(f.defense_max || 0, (f.defense_current || 0) + delta));
            break;
    }
    saveFiche();
    renderAll();  // refresh tout (vital bar + panel)
}

/* ─── Modal : Début de round (checklist officielle p.276) ─────── */
function openStartOfRoundSheet() {
    const f = currentFiche;
    if (!f) return;
    const halfLevel = Math.ceil((f.niveau || 1) / 2);

    // Calculs (caps respectés)
    const defGain = Math.ceil((f.defense_max || 0) / 2);
    const defNew = Math.min(f.defense_max || 0, (f.defense_current || 0) + defGain);
    const defDelta = defNew - (f.defense_current || 0);

    const manaGain = 3 + halfLevel;
    const manaNew = Math.min(f.mana_max || 0, (f.mana_current || 0) + manaGain);
    const manaDelta = manaNew - (f.mana_current || 0);

    const gritGain = 3 + halfLevel;
    const gritNew = Math.min(f.grit_max || 0, (f.grit_current || 0) + gritGain);
    const gritDelta = gritNew - (f.grit_current || 0);

    const d = f.dragon || {};
    const bpGain = 1 + halfLevel;
    const bpNew = Math.min(d.bp_max || 0, (d.bp_current || 0) + bpGain);
    const bpDelta = bpNew - (d.bp_current || 0);

    const dragonDefMax = (d.armor_bonus || 0) + (d.attributs ? d.attributs.Body || 0 : 0) + halfLevel;

    const html = `
        <div class="capacite-form">
            <p class="start-round-intro">📜 Checklist officielle (Drakonym p.276)</p>
            <div class="start-round-changes">
                <div class="start-round-item">
                    <span class="start-round-icon">⚡</span>
                    <span class="start-round-label">Points d'Action</span>
                    <span class="start-round-delta gain">+3 AP</span>
                    <span class="start-round-result">${f.ap_current || 0} → ${(f.ap_current || 0) + 3}</span>
                </div>
                <div class="start-round-item">
                    <span class="start-round-icon">🛡</span>
                    <span class="start-round-label">Defense Slots</span>
                    <span class="start-round-delta gain">+${defDelta}</span>
                    <span class="start-round-result">${f.defense_current || 0}/${f.defense_max || 0} → ${defNew}/${f.defense_max || 0}</span>
                </div>
                ${(f.mana_max || 0) > 0 ? `
                <div class="start-round-item">
                    <span class="start-round-icon">✨</span>
                    <span class="start-round-label">Mana</span>
                    <span class="start-round-delta gain">+${manaDelta}</span>
                    <span class="start-round-result">${f.mana_current || 0}/${f.mana_max || 0} → ${manaNew}/${f.mana_max || 0}</span>
                </div>` : ''}
                ${(f.grit_max || 0) > 0 ? `
                <div class="start-round-item">
                    <span class="start-round-icon">💪</span>
                    <span class="start-round-label">Grit</span>
                    <span class="start-round-delta gain">+${gritDelta}</span>
                    <span class="start-round-result">${f.grit_current || 0}/${f.grit_max || 0} → ${gritNew}/${f.grit_max || 0}</span>
                </div>` : ''}
                ${(d.bp_max || 0) > 0 ? `
                <div class="start-round-item">
                    <span class="start-round-icon">🔗</span>
                    <span class="start-round-label">Bond Points (dragon)</span>
                    <span class="start-round-delta gain">+${bpDelta}</span>
                    <span class="start-round-result">${d.bp_current || 0}/${d.bp_max || 0} → ${bpNew}/${d.bp_max || 0}</span>
                </div>
                <div class="start-round-item info">
                    <span class="start-round-icon">🐉</span>
                    <span class="start-round-label">Defense Slots dragon</span>
                    <span class="start-round-delta gain">Refresh complet</span>
                    <span class="start-round-result">${dragonDefMax}/${dragonDefMax}</span>
                </div>` : ''}
            </div>
            <p class="start-round-hint">Demi-niveau = ${halfLevel} (niveau ${f.niveau || 1})</p>
            <div class="form-actions">
                <button type="button" class="form-btn cancel" data-action="cancel">Annuler</button>
                <button type="button" class="form-btn save" data-action="apply">✓ Appliquer</button>
            </div>
        </div>
    `;

    openBottomSheet('🎯 Début de round', html, (root) => {
        root.querySelector('[data-action="cancel"]').addEventListener('click', closeBottomSheet);
        root.querySelector('[data-action="apply"]').addEventListener('click', () => {
            f.ap_current = (f.ap_current || 0) + 3;
            f.defense_current = defNew;
            if ((f.mana_max || 0) > 0) f.mana_current = manaNew;
            if ((f.grit_max || 0) > 0) f.grit_current = gritNew;
            if ((d.bp_max || 0) > 0) {
                d.bp_current = bpNew;
            }
            saveFiche();
            renderAll();
            closeBottomSheet();
            showToast('🎯 Round démarré');
        });
    });
}

/* ─── Modal : Subir une Wound (p.280) ─────────────────────────── */
function openSufferWoundSheet(initialTier) {
    const f = currentFiche;
    if (!f) return;
    const w = f.wounds || { light: 0, heavy: 0, deadly: 0, light_max: 3, heavy_max: 3, deadly_max: 3 };
    const ds = f.defense_current || 0;

    const html = `
        <div class="capacite-form">
            <p class="suffer-intro">⚠️ Quel Tier de Wound subis-tu ?</p>
            <div class="suffer-tier-grid">
                <button type="button" class="suffer-tier-btn tier-light${initialTier === 'light' ? ' selected' : ''}" data-tier="light">
                    <span class="suffer-tier-name">Légère</span>
                    <span class="suffer-tier-count">${w.light}/${w.light_max}</span>
                </button>
                <button type="button" class="suffer-tier-btn tier-heavy${initialTier === 'heavy' ? ' selected' : ''}" data-tier="heavy">
                    <span class="suffer-tier-name">Grave</span>
                    <span class="suffer-tier-count">${w.heavy}/${w.heavy_max}</span>
                </button>
                <button type="button" class="suffer-tier-btn tier-deadly${initialTier === 'deadly' ? ' selected' : ''}" data-tier="deadly">
                    <span class="suffer-tier-name">Mortelle</span>
                    <span class="suffer-tier-count">${w.deadly}/${w.deadly_max}</span>
                </button>
            </div>

            <div class="suffer-ds-info">
                <strong>Defense Slots disponibles :</strong> ${ds}
                <p class="suffer-ds-hint">Coût : 2 DS pour réduire d'1 Tier (Mortelle → Grave → Légère → Annulée). Chainable.</p>
            </div>

            <div class="suffer-actions">
                <button type="button" class="suffer-action-btn reduce" data-action="reduce" ${ds < 2 ? 'disabled' : ''}>
                    🛡 Réduire (−2 DS)
                </button>
                <button type="button" class="suffer-action-btn absorb" data-action="absorb">
                    💥 Encaisser ce Tier
                </button>
            </div>

            <div class="suffer-preview" id="suffer-preview">
                Choisis un Tier ci-dessus.
            </div>

            <div class="form-actions">
                <button type="button" class="form-btn cancel" data-action="cancel">Fermer</button>
            </div>
        </div>
    `;

    openBottomSheet('💥 Subir un Wound', html, (root) => {
        let selectedTier = initialTier || null;
        const preview = root.querySelector('#suffer-preview');
        const reduceBtn = root.querySelector('[data-action="reduce"]');
        const absorbBtn = root.querySelector('[data-action="absorb"]');

        const tierOrder = ['light', 'heavy', 'deadly'];
        const tierLabel = { light: 'Légère', heavy: 'Grave', deadly: 'Mortelle' };

        function refreshPreview() {
            const fish = currentFiche;
            const ws = fish.wounds;
            const dsCur = fish.defense_current || 0;
            if (!selectedTier) {
                preview.textContent = 'Choisis un Tier ci-dessus.';
                reduceBtn.disabled = true;
                absorbBtn.disabled = true;
                return;
            }
            const tierName = tierLabel[selectedTier];
            const wsField = `${selectedTier}`;
            const cur = ws[wsField];
            const max = ws[`${wsField}_max`];
            preview.innerHTML = `Tier sélectionné : <strong>${tierName}</strong> · Wounds ${tierName} : ${cur}/${max} · DS : ${dsCur}`;
            reduceBtn.disabled = dsCur < 2;
            absorbBtn.disabled = false;
        }

        root.querySelectorAll('[data-tier]').forEach(btn => {
            btn.addEventListener('click', () => {
                root.querySelectorAll('[data-tier]').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedTier = btn.dataset.tier;
                refreshPreview();
            });
        });

        // Réduire : dépense 2 DS, downgrade d'un tier
        reduceBtn.addEventListener('click', () => {
            if (!selectedTier) { showToast('Choisis d\'abord un Tier'); return; }
            if ((currentFiche.defense_current || 0) < 2) { showToast('Pas assez de Defense Slots'); return; }
            currentFiche.defense_current -= 2;
            const idx = tierOrder.indexOf(selectedTier);
            if (idx <= 0) {
                // Light → Negated
                saveFiche();
                renderAll();
                closeBottomSheet();
                showToast('🛡 Wound annulée (−2 DS)');
                return;
            }
            selectedTier = tierOrder[idx - 1];
            // Update visual selection
            root.querySelectorAll('[data-tier]').forEach(b => {
                b.classList.toggle('selected', b.dataset.tier === selectedTier);
            });
            saveFiche();
            renderAll();
            refreshPreview();
            showToast(`🛡 Réduit à ${tierLabel[selectedTier]} (−2 DS)`);
        });

        // Encaisser : applique le wound au tier, gère overflow
        absorbBtn.addEventListener('click', () => {
            if (!selectedTier) { showToast('Choisis d\'abord un Tier'); return; }
            applyWoundAtTier(selectedTier);
            saveFiche();
            renderAll();
            closeBottomSheet();
            showToast(`💥 Wound ${tierLabel[selectedTier]} subie`);
        });

        root.querySelector('[data-action="cancel"]').addEventListener('click', closeBottomSheet);

        if (selectedTier) refreshPreview();
    });
}

/* Applique +1 wound à un tier, avec gestion de l'overflow (track plein → tier suivant) */
function applyWoundAtTier(tier) {
    const f = currentFiche;
    if (!f.wounds) f.wounds = { light: 0, heavy: 0, deadly: 0, light_max: 3, heavy_max: 3, deadly_max: 3 };
    const w = f.wounds;
    const apply = (tierName) => {
        const cur = w[tierName] || 0;
        const max = w[`${tierName}_max`] || 0;
        if (cur < max) {
            w[tierName] = cur + 1;
            return true;
        }
        return false;  // overflow nécessaire
    };
    if (tier === 'light') {
        if (apply('light')) return;
        if (apply('heavy')) return;
        apply('deadly');
    } else if (tier === 'heavy') {
        if (apply('heavy')) return;
        apply('deadly');
    } else if (tier === 'deadly') {
        apply('deadly');
    }
}


let _soundDiceEnabled = (function() {
    try {
        const v = localStorage.getItem(SOUND_DICE_KEY);
        return v === null ? true : v === '1';  // activé par défaut
    } catch (e) { return true; }
})();

let _diceRollAudio = null;

function preloadDiceSound() {
    if (_diceRollAudio) return;
    try {
        _diceRollAudio = new Audio('dice-roll.mp3');
        _diceRollAudio.preload = 'auto';
        _diceRollAudio.volume = 0.7;
    } catch (e) { _diceRollAudio = null; }
}

function isDiceSoundEnabled() { return _soundDiceEnabled; }

function setDiceSoundEnabled(enabled) {
    _soundDiceEnabled = !!enabled;
    try { localStorage.setItem(SOUND_DICE_KEY, _soundDiceEnabled ? '1' : '0'); } catch (e) {}
    refreshSoundDiceToggle();
}

function refreshSoundDiceToggle() {
    const btn = document.getElementById('btn-sound-dice');
    if (btn) btn.setAttribute('aria-pressed', _soundDiceEnabled ? 'true' : 'false');
}

/* Joue le son MP3 des dés (cloné pour permettre les jets rapprochés) */
function playDiceRollSound(diceCount) {
    if (!_soundDiceEnabled) return;
    try {
        if (!_diceRollAudio) preloadDiceSound();
        if (!_diceRollAudio) return;
        // Clone pour pouvoir relancer même si le précédent joue encore
        const audio = _diceRollAudio.cloneNode();
        audio.volume = 0.7;
        const playPromise = audio.play();
        if (playPromise && playPromise.catch) playPromise.catch(() => {});
    } catch (e) {
        /* silencieux : si l'audio échoue, on ne casse pas le jet */
    }
}


/* ─── Effectue le jet ────────────────────────────────── */
function performRoll() {
    const pool = computePoolSize();
    if (pool < 1) return;

    // 🎲 Son des dés (si activé) — son proportionnel au nombre de dés
    playDiceRollSound(pool);

    // Point de Héros boon : on consomme 1 HP et on ajoute 1 Faveur
    let totalBoons = currentRoll.boons + (currentRoll.useHpBoon ? 1 : 0);
    let totalBanes = currentRoll.banes;

    if (currentRoll.useHpBoon && (currentFiche.hp_current || 0) > 0) {
        currentFiche.hp_current = Math.max(0, currentFiche.hp_current - 1);
        saveFiche();
        renderVitalBar(currentFiche);
    }

    // Annulation 1-pour-1 (règle officielle)
    const cancel = Math.min(totalBoons, totalBanes);
    totalBoons -= cancel;
    totalBanes -= cancel;

    // Lancer les d6
    const dice = [];
    for (let i = 0; i < pool; i++) {
        dice.push({ id: i, value: rollD6(), boonConverted: false, baneCanceled: false });
    }

    // Appliquer les Banes : annule un 5 par Fardeau (strict, pas de fallback sur 6)
    let banesToApply = totalBanes;
    for (const d of dice) {
        if (banesToApply <= 0) break;
        if (d.value === 5 && !d.baneCanceled) {
            d.baneCanceled = true;
            banesToApply--;
        }
    }
    // banesToApply restant = Banes gaspillés (pas de 5 disponibles)

    // Shadow Die
    const shadow = currentRoll.useShadow ? rollD12() : null;

    currentRoll.dice = dice;
    currentRoll.shadowValue = shadow;
    currentRoll.boonsRemaining = totalBoons;
    currentRoll.boonsInitial = totalBoons;
    currentRoll.banesApplied = totalBanes - banesToApply;
    currentRoll.banesWasted = banesToApply;
    currentRoll.bonesAfterCancel = cancel;
    currentRoll.secondWindUsed = [];
    currentRoll._logged = false;
    currentRoll._freshRoll = true;

    // Phase 1 : rolling animation (~1.2s)
    diceModalView = 'rolling';
    renderDiceModal();

    // Mise à jour rapide des valeurs aléatoires pendant l'anim
    let tick = 0;
    const totalTicks = 14;
    const rollingInterval = setInterval(() => {
        document.querySelectorAll('.rolling-die').forEach(el => {
            el.textContent = Math.ceil(Math.random() * 6);
        });
        const shadowEl = document.getElementById('shadow-rolling-value');
        if (shadowEl) shadowEl.textContent = Math.ceil(Math.random() * 12);
        tick++;
        if (tick >= totalTicks) {
            clearInterval(rollingInterval);
            // Phase 2 : afficher le résultat
            diceModalView = 'result';
            renderDiceModal();
            setTimeout(() => { if (currentRoll) currentRoll._freshRoll = false; }, 700);
        }
    }, 80);
}


/* ─── Calcul des succès en tenant compte des conversions ─── */
function computeSuccesses() {
    if (!currentRoll || !currentRoll.dice) return 0;
    let successes = 0;
    for (const d of currentRoll.dice) {
        if (d.baneCanceled) continue;
        if (d.value === 6) successes += 2;
        else if (d.value === 5) successes += 1;
        else if (d.value === 4 && d.boonConverted) successes += 1;
    }
    return successes;
}


/* ─── Trouve les groupes de doublons non-succès (pour Second Wind) ─── */
function findDuplicateGroups() {
    const groups = {};
    for (const d of currentRoll.dice) {
        if (d.baneCanceled) continue;
        if (d.boonConverted) continue;
        if (d.value >= 5) continue; // succès, pas éligible
        if (!groups[d.value]) groups[d.value] = [];
        groups[d.value].push(d.id);
    }
    const result = {};
    for (const [v, ids] of Object.entries(groups)) {
        if (ids.length >= 2 && !currentRoll.secondWindUsed.includes(parseInt(v, 10))) {
            result[v] = ids;
        }
    }
    return result;
}


/* ─── Vue : Résultat ─────────────────────────────────── */
function renderDiceResultHtml() {
    const successes = computeSuccesses();
    const diff = currentRoll.difficulty;

    // Couleur du total selon difficulté
    let totalCls = '';
    let diffInfo = '';
    if (diff > 0) {
        totalCls = successes >= diff ? ' success' : ' failure';
        diffInfo = `<div class="diff-info">${successes >= diff ? 'Réussite' : 'Échec'} · objectif D${diff}</div>`;
    }

    // Dés
    let diceHtml = '<div class="dice-display">';
    for (const d of currentRoll.dice) {
        let cls = 'dice-die';
        const canSelect = !d.baneCanceled && !d.boonConverted;
        if (d.baneCanceled) cls += ' bane-canceled';
        else if (d.boonConverted) cls += ' boon-converted';
        else if (d.value === 5 || d.value === 6) cls += ' success';
        if (canSelect && d._rerollSelected) cls += ' selected-reroll';
        if (canSelect) cls += ' selectable';
        if (currentRoll._freshRoll) cls += ' fresh-roll';
        diceHtml += `<div class="${cls}" data-die-id="${d.id}" ${canSelect ? 'data-action="toggle-reroll"' : ''}>${d.value}</div>`;
    }
    diceHtml += '</div>';
    diceHtml += '<p class="dice-reroll-hint">💡 Tap les dés pour les sélectionner à relancer</p>';

    // Détails Fardeau
    let baneDetail = '';
    if (currentRoll.bonesAfterCancel > 0 || currentRoll.banesApplied > 0 || currentRoll.banesWasted > 0) {
        const parts = [];
        if (currentRoll.bonesAfterCancel > 0) parts.push(`${currentRoll.bonesAfterCancel} Faveur/Fardeau annulés`);
        if (currentRoll.banesApplied > 0) parts.push(`${currentRoll.banesApplied} Fardeau appliqué (5 ignoré)`);
        if (currentRoll.banesWasted > 0) parts.push(`${currentRoll.banesWasted} Fardeau gaspillé (pas de 5)`);
        baneDetail = `<p style="font-size: 11px; color: var(--text-muted); text-align: center; margin: -8px 0 12px; font-family: 'EB Garamond', serif; font-style: italic;">${parts.join(' · ')}</p>`;
    }

    // Shadow Die
    let shadowHtml = '';
    if (currentRoll.shadowValue !== null) {
        const out = getShadowOutcome(currentRoll.shadowValue);
        shadowHtml = `
            <div class="dice-shadow-result ${out.cssClass}">
                <div class="dice-shadow-d12">
                    <div class="dice-shadow-d12-label">d12</div>
                    <div class="dice-shadow-d12-value">${currentRoll.shadowValue}</div>
                </div>
                <div class="dice-shadow-info">
                    <div class="dice-shadow-name">${out.name}</div>
                    <div class="dice-shadow-desc">${out.desc}</div>
                </div>
            </div>`;
    }

    // Faveur panel
    let boonHtml = '';
    if (currentRoll.boonsRemaining > 0) {
        const fours = currentRoll.dice.filter(d => d.value === 4 && !d.baneCanceled && !d.boonConverted);
        const groups = findDuplicateGroups();

        let actionsHtml = '';
        if (fours.length > 0) {
            actionsHtml += `
                <button type="button" class="dice-boon-action" data-action="convert4">
                    <div class="dice-boon-action-text">
                        <strong>Convertir un 4 → succès</strong>
                        <small>${fours.length} dé${fours.length > 1 ? 's' : ''} éligible${fours.length > 1 ? 's' : ''}</small>
                    </div>
                    <span class="dice-boon-action-arrow">›</span>
                </button>`;
        }
        for (const [val, ids] of Object.entries(groups)) {
            actionsHtml += `
                <button type="button" class="dice-boon-action" data-action="secondwind" data-value="${val}">
                    <div class="dice-boon-action-text">
                        <strong>Second Wind · relance les ${val}</strong>
                        <small>${ids.length} dés à relancer</small>
                    </div>
                    <span class="dice-boon-action-arrow">›</span>
                </button>`;
        }
        if (!actionsHtml) {
            actionsHtml = `<p class="dice-boon-empty">Aucune action Faveur dispo (pas de 4 ni de doublons non-succès)</p>`;
        }

        boonHtml = `
            <div class="dice-boon-panel">
                <div class="dice-boon-header">
                    <span class="dice-boon-title">⭐ Faveur disponible</span>
                    <span class="dice-boon-count">${currentRoll.boonsRemaining} / ${currentRoll.boonsInitial}</span>
                </div>
                ${actionsHtml}
            </div>`;
    } else if (currentRoll.boonsInitial > 0) {
        boonHtml = `<p class="dice-boon-empty" style="margin-bottom: 14px;">Toutes tes Faveurs ont été utilisées.</p>`;
    }

    // Actions
    const selectedReroll = currentRoll.dice.filter(d => d._rerollSelected && !d.baneCanceled && !d.boonConverted);
    const rerollCost = selectedReroll.length * 2;
    const canReroll = selectedReroll.length > 0 && (currentFiche.hp_current || 0) >= rerollCost;
    const rerollLabel = selectedReroll.length === 0
        ? `🔄 Sélectionne des dés à relancer`
        : `🔄 Relancer ${selectedReroll.length} dé${selectedReroll.length > 1 ? 's' : ''} <small>−${rerollCost} HP</small>`;
    const configSummary = currentRoll.attrs.join(' + ').toUpperCase() +
        ` · ${currentRoll.dice.length}d6` +
        (currentRoll.boonsInitial > 0 ? ` + ${currentRoll.boonsInitial} FAVEUR` : '') +
        (currentRoll.shadowValue !== null ? ' · SHADOW' : '');

    return `
        <div class="dice-result-context">
            ${currentRoll.label ? `<div class="dice-result-label">${escapeHtml(currentRoll.label)}</div>` : ''}
            <div class="dice-result-config">${configSummary}</div>
        </div>

        <div class="dice-result-total${totalCls}">
            <span class="big-number">${successes}</span>
            <span class="label">SUCCÈS</span>
            ${diffInfo}
        </div>

        ${diceHtml}
        ${baneDetail}
        ${shadowHtml}
        ${boonHtml}

        <div class="dice-result-actions">
            <div class="dice-result-actions-row">
                <button type="button" class="action-btn${canReroll ? '' : ' disabled'}" data-action="reroll-selected">
                    ${rerollLabel}
                </button>
                <button type="button" class="action-btn" data-action="repeat">
                    ↻ Refaire (gratuit)
                </button>
            </div>
            <button type="button" class="action-btn primary" data-action="close">FERMER</button>
        </div>
    `;
}

function bindDiceResultActions(root) {
    // Click sur un dé : toggle sélection pour reroll
    root.querySelectorAll('[data-die-id][data-action="toggle-reroll"]').forEach(dieEl => {
        dieEl.addEventListener('click', () => {
            const id = dieEl.dataset.dieId;
            const die = currentRoll.dice.find(d => d.id === id);
            if (!die || die.baneCanceled || die.boonConverted) return;
            die._rerollSelected = !die._rerollSelected;
            renderDiceModal();
        });
    });

    root.querySelectorAll('[data-action]').forEach(btn => {
        const action = btn.dataset.action;
        // skip les data-action toggle-reroll (déjà bind ci-dessus)
        if (action === 'toggle-reroll') return;
        btn.addEventListener('click', () => {
            if (action === 'convert4') {
                // Convertit le premier 4 disponible
                const die = currentRoll.dice.find(d => d.value === 4 && !d.baneCanceled && !d.boonConverted);
                if (die) {
                    die.boonConverted = true;
                    currentRoll.boonsRemaining--;
                    renderDiceModal();
                }
            } else if (action === 'secondwind') {
                const val = parseInt(btn.dataset.value, 10);
                // Relance tous les dés de cette valeur (non bane-canceled, non boon-converted)
                for (const d of currentRoll.dice) {
                    if (d.value === val && !d.baneCanceled && !d.boonConverted) {
                        d.value = rollD6();
                        delete d._rerollSelected;
                    }
                }
                currentRoll.secondWindUsed.push(val);
                currentRoll.boonsRemaining--;
                renderDiceModal();
            } else if (action === 'reroll-selected') {
                if (btn.classList.contains('disabled')) return;
                const selected = currentRoll.dice.filter(d => d._rerollSelected && !d.baneCanceled && !d.boonConverted);
                const cost = selected.length * 2;
                if (selected.length === 0) {
                    showToast('Tap un dé pour le sélectionner');
                    return;
                }
                if ((currentFiche.hp_current || 0) < cost) {
                    showToast(`Pas assez de HP (${cost} requis)`);
                    return;
                }
                currentFiche.hp_current -= cost;
                saveFiche();
                renderVitalBar(currentFiche);
                // Relance uniquement les dés sélectionnés
                for (const d of selected) {
                    d.value = rollD6();
                    delete d._rerollSelected;
                }
                renderDiceModal();
                showToast(`🔄 ${selected.length} dé${selected.length > 1 ? 's' : ''} relancé${selected.length > 1 ? 's' : ''} · −${cost} HP`);
            } else if (action === 'repeat') {
                // Refait un jet identique sans coût
                if (currentRoll && !currentRoll._logged) addCurrentRollToLog();
                performRoll();
            } else if (action === 'close') {
                closeDiceRoller();
            }
        });
    });
}


/* ─── Vue : Historique ───────────────────────────────── */
function renderDiceLogHtml() {
    if (!diceLog || diceLog.length === 0) {
        return `<div class="dice-log-empty">Aucun jet enregistré pour l'instant.<br>Lance des dés et reviens ici !</div>`;
    }
    let html = '';
    for (const e of diceLog) {
        const time = new Date(e.time).toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' });
        const cls = e.entryClass ? ' ' + e.entryClass : '';
        html += `
            <div class="dice-log-entry${cls}">
                <div class="dice-log-header">
                    <span class="dice-log-label">${escapeHtml(e.label || 'Jet libre')}</span>
                    <span class="dice-log-time">${time}</span>
                </div>
                <div class="dice-log-result">${e.result}</div>
                <div class="dice-log-detail">${e.detail || ''}</div>
            </div>`;
    }
    html += `<button type="button" class="action-btn primary" id="dice-log-back" style="margin-top: 16px; width: 100%; padding: 14px; font-family: 'Cinzel', serif; letter-spacing: 1px; font-weight: 500; background: var(--gold); color: var(--on-gold); border: 1px solid var(--gold-bright); border-radius: 8px;">RETOUR AU LANCEUR</button>`;
    return html;
}

function bindDiceLogActions(root) {
    const backBtn = root.querySelector('#dice-log-back');
    if (backBtn) backBtn.addEventListener('click', () => {
        diceModalView = 'config';
        renderDiceModal();
    });
}


/* ─── Ajoute le jet courant au log ───────────────────── */
function addCurrentRollToLog() {
    if (!currentRoll || !currentRoll.dice) return;
    const successes = computeSuccesses();
    const diff = currentRoll.difficulty;

    let result, entryClass = '';
    if (diff > 0) {
        if (successes >= diff) { result = `✅ ${successes} succès / D${diff}`; entryClass = 'success'; }
        else { result = `❌ ${successes} succès / D${diff}`; entryClass = 'failure'; }
    } else {
        result = `${successes} succès`;
    }

    const diceStr = currentRoll.dice.map(d => {
        if (d.baneCanceled) return `~${d.value}~`;
        if (d.boonConverted) return `★${d.value}`;
        return d.value.toString();
    }).join(', ');

    let detail = `[${diceStr}] · ${currentRoll.attrs.join('+') || 'aucun attr'}`;
    if (currentRoll.shadowValue !== null) {
        const out = getShadowOutcome(currentRoll.shadowValue);
        detail += ` · 🌑 ${currentRoll.shadowValue} (${out.name})`;
    }

    diceLog.unshift({
        time: Date.now(),
        label: currentRoll.label,
        result, entryClass, detail,
    });
    if (diceLog.length > MAX_DICE_LOG) diceLog = diceLog.slice(0, MAX_DICE_LOG);
    saveDiceLog();
    currentRoll._logged = true;
    renderDesktopRollsLog();
}


/* ─── Bind global : header buttons ───────────────────── */
function bindDiceModalGlobalActions() {
    document.getElementById('dice-modal-close').addEventListener('click', closeDiceRoller);
    document.getElementById('dice-modal-history-btn').addEventListener('click', () => {
        // Si on était sur résultat et qu'il n'est pas loggé, log it
        if (diceModalView === 'result' && currentRoll && !currentRoll._logged) {
            addCurrentRollToLog();
        }
        diceModalView = (diceModalView === 'log') ? 'config' : 'log';
        renderDiceModal();
    });
}


/* ─── Helper : escape HTML ──────────────────────────── */
function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}


/* ═══════════════════════════════════════════════════════════════
   VAGUE 7 — Multi-fiches, Histoire, Import/Export JSON
   ═══════════════════════════════════════════════════════════════ */

/* ─── Bind des champs Configuration (auto-save) ──────── */
function bindConfigFields() {
    // Identité
    const bindText = (id, key) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('change', () => {
            currentFiche[key] = el.value.trim();
            saveFiche();
            renderVitalBar(currentFiche);
            renderFiche(currentFiche);
        });
    };
    const bindNumber = (id, key, max, callback) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('change', () => {
            let v = parseInt(el.value, 10);
            if (isNaN(v)) v = 0;
            v = Math.max(0, max != null ? Math.min(max, v) : v);
            currentFiche[key] = v;
            el.value = v;
            saveFiche();
            if (callback) callback();
            renderVitalBar(currentFiche);
            renderFiche(currentFiche);
        });
    };
    bindText('cfg-nom', 'nom');
    bindText('cfg-kin', 'kin');
    bindText('cfg-classe', 'classe');
    bindText('cfg-voie', 'voie');
    bindText('cfg-carriere', 'carriere');
    bindNumber('cfg-niveau', 'niveau', 20);

    // Primary
    const cfgPrimary = document.getElementById('cfg-primary');
    if (cfgPrimary) {
        cfgPrimary.addEventListener('change', () => {
            currentFiche.primary = cfgPrimary.value;
            saveFiche();
            renderFiche(currentFiche);
        });
    }

    // Attributs : 6 inputs
    ['Body', 'Mind', 'Soul', 'Shadow', 'Gods', 'World'].forEach(name => {
        const el = document.getElementById(`cfg-attr-${name}`);
        if (!el) return;
        el.addEventListener('change', () => {
            let v = parseInt(el.value, 10);
            if (isNaN(v)) v = 0;
            v = Math.max(0, Math.min(10, v));
            currentFiche.attributs[name] = v;
            el.value = v;
            saveFiche();
            renderFiche(currentFiche);
        });
    });

    // Pools max + bonuses
    bindNumber('cfg-hp-max', 'hp_max', 10, () => {
        if (currentFiche.hp_current > currentFiche.hp_max) currentFiche.hp_current = currentFiche.hp_max;
    });
    bindNumber('cfg-mana-max', 'mana_max', 50, () => {
        if (currentFiche.mana_current > currentFiche.mana_max) currentFiche.mana_current = currentFiche.mana_max;
    });
    bindNumber('cfg-grit-max', 'grit_max', 50, () => {
        if (currentFiche.grit_current > currentFiche.grit_max) currentFiche.grit_current = currentFiche.grit_max;
    });
    bindNumber('cfg-defense-max', 'defense_max', 50, () => {
        if (currentFiche.defense_current > currentFiche.defense_max) currentFiche.defense_current = currentFiche.defense_max;
    });
    bindNumber('cfg-armure', 'armure_bonus', 10);
    bindNumber('cfg-spell-bonus', 'spell_bonus', 5);

    // Blessure tracks max
    ['light', 'heavy', 'deadly'].forEach(tier => {
        const el = document.getElementById(`cfg-${tier}-max`);
        if (!el) return;
        el.addEventListener('change', () => {
            let v = parseInt(el.value, 10);
            if (isNaN(v) || v < 1) v = 1;
            v = Math.min(10, v);
            currentFiche.wounds[`${tier}_max`] = v;
            // Si le current dépasse le nouveau max, on cap
            if (currentFiche.wounds[tier] > v) currentFiche.wounds[tier] = v;
            el.value = v;
            saveFiche();
            renderVitalBar(currentFiche);
        });
    });
}

function renderConfigFields() {
    const f = currentFiche;
    const setVal = (id, value) => {
        const el = document.getElementById(id);
        if (el && document.activeElement !== el) el.value = value;
    };
    setVal('cfg-nom', f.nom || '');
    setVal('cfg-niveau', f.niveau || 1);
    setVal('cfg-kin', f.kin || '');
    setVal('cfg-classe', f.classe || '');
    setVal('cfg-voie', f.voie || '');
    setVal('cfg-carriere', f.carriere || '');
    setVal('cfg-primary', f.primary || 'Body');
    ['Body', 'Mind', 'Soul', 'Shadow', 'Gods', 'World'].forEach(name => {
        setVal(`cfg-attr-${name}`, (f.attributs && f.attributs[name]) || 0);
    });
    setVal('cfg-mana-max', f.mana_max || 0);
    setVal('cfg-hp-max', f.hp_max || 3);
    setVal('cfg-grit-max', f.grit_max || 0);
    setVal('cfg-defense-max', f.defense_max || 0);
    setVal('cfg-armure', f.armure_bonus || 0);
    setVal('cfg-spell-bonus', f.spell_bonus || 0);
    setVal('cfg-light-max', (f.wounds && f.wounds.light_max) || 3);
    setVal('cfg-heavy-max', (f.wounds && f.wounds.heavy_max) || 3);
    setVal('cfg-deadly-max', (f.wounds && f.wounds.deadly_max) || 3);
}


/* ─── Bind des champs Histoire (auto-save sur blur) ───── */
function bindHistoireFields() {
    const fields = ['apparence', 'histoire', 'liens', 'notes'];
    fields.forEach(key => {
        const el = document.getElementById(`fiche-${key}`);
        if (!el) return;
        el.addEventListener('blur', () => {
            currentFiche[key] = el.value;
            saveFiche();
        });
    });
}

function renderHistoireFields() {
    ['apparence', 'histoire', 'liens', 'notes'].forEach(key => {
        const el = document.getElementById(`fiche-${key}`);
        if (el) el.value = currentFiche[key] || '';
    });
}


/* ─── Multi-fiches : helpers ──────────────────────────── */
function getFichesList() {
    const store = loadStore();
    const list = Object.values(store.fiches).map(f => ({
        id: f._fiche_id,
        nom: f.nom || 'Sans nom',
        niveau: f.niveau || 1,
        kin: f.kin || '',
        classe: f.classe || '',
        dragonNom: (f.dragon && f.dragon.nom) || '',
        isActive: f._fiche_id === store.activeId,
    }));
    list.sort((a, b) => {
        if (a.isActive) return -1;
        if (b.isActive) return 1;
        return a.nom.localeCompare(b.nom);
    });
    return list;
}

function switchToFiche(id) {
    const store = loadStore();
    if (!store.fiches[id]) { showToast('Fiche introuvable'); return; }
    store.activeId = id;
    saveStore(store);
    currentFiche = mergeFicheDefaults(store.fiches[id]);
    renderAll();
    renderHistoireFields();
    renderFichesList();
    showToast(`Fiche active : ${currentFiche.nom || 'Sans nom'}`);
}

/* Crée une fiche vraiment vierge (attributs à 1 minimum selon la règle officielle de création) */
function createBlankFiche(nom) {
    return mergeFicheDefaults({
        _fiche_id: 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
        nom: nom || 'Nouveau personnage',
        niveau: 1,
        kin: '',
        classe: '',
        primary: 'Body',
        attributs: { Body: 1, Mind: 1, Soul: 1, Shadow: 1, Gods: 1, World: 1 },
        hp_current: 1, hp_max: 3,
        mana_current: 0, mana_max: 0,
        grit_current: 0, grit_max: 0,
        defense_current: 0, defense_max: 0,
        armure_bonus: 0,
        spell_bonus: 0,
        wounds: { light: 0, heavy: 0, deadly: 0, light_max: 3, heavy_max: 3, deadly_max: 3 },
        statuses: [],
        short_rests_taken: 0, short_rests_max: 3,
        perks: [], sorts: [], techniques: [], wild_perks: [],
        draviks: 0,
        weapons: [], armors: [], tools: [],
        dragon: {
            nom: '', family: '', stage: 'Hatchling', speed: 6, speed_fly: 0,
            pillars: { love: '', fear: '', instinct: '' },
            attributs: { Body: 1, Mind: 1, Soul: 1 },
            bp_current: 0, bp_max: 6,
            armor_bonus: 0,
            breath: { element: '', shape: 'Cône', description: '', effect: '', charges_current: 0, charges_max: 1 },
            perks: [], weapons: [], armors: [],
        },
        apparence: '', histoire: '', liens: '', notes: '',
    });
}

function createNewFiche() {
    const html = `
        <div class="capacite-form">
            <div class="form-row">
                <label class="form-row-label">Nom du nouveau personnage *</label>
                <input type="text" class="form-row-input" id="form-new-nom" placeholder="Ex: Lyriel" maxlength="40">
            </div>
            <p style="font-size: 12px; color: var(--text-muted); font-style: italic;">
                Une fiche vide est créée et activée. Tu pourras la remplir via la section ⚙️ Configuration de l'onglet Fiche.<br>
                <strong style="color: var(--text);">Note :</strong> les 6 attributs commencent à 1 (règle de création officielle Drakonym).
            </p>
            <div class="form-actions">
                <button type="button" class="form-btn cancel" data-action="cancel">Annuler</button>
                <button type="button" class="form-btn save" data-action="save">Créer</button>
            </div>
        </div>
    `;
    openBottomSheet('Nouvelle fiche', html, (root) => {
        const input = root.querySelector('#form-new-nom');
        setTimeout(() => input.focus(), 200);
        root.querySelector('[data-action="cancel"]').addEventListener('click', closeBottomSheet);
        root.querySelector('[data-action="save"]').addEventListener('click', () => {
            const nom = input.value.trim();
            if (!nom) { showToast('Donne un nom au personnage'); return; }
            const blank = createBlankFiche(nom);
            const store = loadStore();
            store.fiches[blank._fiche_id] = blank;
            store.activeId = blank._fiche_id;
            saveStore(store);
            currentFiche = blank;
            closeBottomSheet();
            renderAll();
            renderFichesList();
            showToast(`✨ ${nom} créé`);
        });
    });
}

function duplicateActiveFiche() {
    if (!currentFiche || !currentFiche._fiche_id) { showToast('Aucune fiche active'); return; }
    const html = `
        <div class="capacite-form">
            <p style="font-size: 13px; color: var(--text);">Dupliquer <strong>${escapeHtml(currentFiche.nom || 'Sans nom')}</strong> ?</p>
            <div class="form-row">
                <label class="form-row-label">Nom de la copie</label>
                <input type="text" class="form-row-input" id="form-dup-nom" value="${escapeHtml((currentFiche.nom || 'Sans nom') + ' (copie)')}" maxlength="40">
            </div>
            <div class="form-actions">
                <button type="button" class="form-btn cancel" data-action="cancel">Annuler</button>
                <button type="button" class="form-btn save" data-action="save">Dupliquer</button>
            </div>
        </div>
    `;
    openBottomSheet('Dupliquer la fiche', html, (root) => {
        root.querySelector('[data-action="cancel"]').addEventListener('click', closeBottomSheet);
        root.querySelector('[data-action="save"]').addEventListener('click', () => {
            const nom = root.querySelector('#form-dup-nom').value.trim() || 'Sans nom';
            const copy = JSON.parse(JSON.stringify(currentFiche));
            copy.nom = nom;
            copy._fiche_id = 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
            const store = loadStore();
            store.fiches[copy._fiche_id] = copy;
            store.activeId = copy._fiche_id;
            saveStore(store);
            currentFiche = mergeFicheDefaults(copy);
            closeBottomSheet();
            renderAll();
            renderHistoireFields();
            renderFichesList();
            showToast(`⎘ Copié vers : ${nom}`);
        });
    });
}

function renameFiche(id) {
    const store = loadStore();
    const f = store.fiches[id];
    if (!f) return;
    const html = `
        <div class="capacite-form">
            <div class="form-row">
                <label class="form-row-label">Nouveau nom</label>
                <input type="text" class="form-row-input" id="form-rename" value="${escapeHtml(f.nom || '')}" maxlength="40">
            </div>
            <div class="form-actions">
                <button type="button" class="form-btn cancel" data-action="cancel">Annuler</button>
                <button type="button" class="form-btn save" data-action="save">Renommer</button>
            </div>
        </div>
    `;
    openBottomSheet('Renommer', html, (root) => {
        root.querySelector('[data-action="cancel"]').addEventListener('click', closeBottomSheet);
        root.querySelector('[data-action="save"]').addEventListener('click', () => {
            const nom = root.querySelector('#form-rename').value.trim() || 'Sans nom';
            f.nom = nom;
            saveStore(store);
            // Si c'est la fiche active, met à jour currentFiche aussi
            if (currentFiche._fiche_id === id) {
                currentFiche.nom = nom;
                renderVitalBar(currentFiche);
            }
            closeBottomSheet();
            renderFichesList();
            showToast(`Renommé : ${nom}`);
        });
    });
}

function confirmDeleteFiche(id) {
    const store = loadStore();
    const f = store.fiches[id];
    if (!f) return;
    const total = Object.keys(store.fiches).length;
    if (total <= 1) {
        showToast('Impossible : c\'est ta dernière fiche');
        return;
    }
    const html = `
        <div class="confirm-sheet">
            <p class="confirm-message">
                Supprimer définitivement <strong>${escapeHtml(f.nom || 'Sans nom')}</strong> ?<br>
                <small style="color: var(--text-muted);">Cette action est irréversible.<br>Pense à exporter la fiche en JSON avant si tu veux la garder en sauvegarde.</small>
            </p>
            <div class="confirm-actions">
                <button class="confirm-btn cancel" type="button" data-action="cancel">Annuler</button>
                <button class="confirm-btn confirm" type="button" data-action="confirm" style="background: var(--crimson); color: #f5e8c5; border-color: var(--crimson-bright);">Supprimer</button>
            </div>
        </div>
    `;
    openBottomSheet('Confirmer suppression', html, (root) => {
        root.querySelector('[data-action="cancel"]').addEventListener('click', closeBottomSheet);
        root.querySelector('[data-action="confirm"]').addEventListener('click', () => {
            delete store.fiches[id];
            // Si c'était l'active, on en active une autre
            if (store.activeId === id) {
                const remaining = Object.keys(store.fiches);
                store.activeId = remaining[0] || null;
                if (store.activeId) {
                    currentFiche = mergeFicheDefaults(store.fiches[store.activeId]);
                }
            }
            saveStore(store);
            closeBottomSheet();
            renderAll();
            renderHistoireFields();
            renderFichesList();
            showToast('Supprimé');
        });
    });
}


/* ─── Render liste des fiches dans l'onglet Plus ────── */
function renderFichesList() {
    const listEl = document.getElementById('fiches-list');
    if (!listEl) return;
    const fiches = getFichesList();
    if (fiches.length === 0) {
        listEl.innerHTML = '<p class="settings-info">Aucune fiche. Crée-en une avec « Nouvelle fiche ».</p>';
        return;
    }
    listEl.innerHTML = fiches.map(f => {
        const meta = [
            f.kin, f.classe, f.niveau ? `Niv. ${f.niveau}` : '',
            f.dragonNom ? `🐉 ${f.dragonNom}` : '',
        ].filter(Boolean).join(' · ');
        return `
            <div class="fiche-item${f.isActive ? ' active' : ''}" data-id="${f.id}" role="button" tabindex="0">
                <span class="fiche-item-text">
                    <p class="fiche-item-name">${escapeHtml(f.nom)}</p>
                    <p class="fiche-item-meta">${escapeHtml(meta) || '— pas encore rempli —'}</p>
                </span>
                ${f.isActive ? '<span class="fiche-active-indicator">⦿</span>' : ''}
                <span class="fiche-item-actions">
                    <button type="button" class="fiche-action-mini" data-action="rename" data-id="${f.id}" aria-label="Renommer">✎</button>
                    <button type="button" class="fiche-action-mini danger" data-action="delete" data-id="${f.id}" aria-label="Supprimer">🗑</button>
                </span>
            </div>
        `;
    }).join('');

    // Bind clicks
    listEl.querySelectorAll('.fiche-item').forEach(el => {
        el.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('[data-action]');
            if (actionBtn) {
                e.stopPropagation();
                const action = actionBtn.dataset.action;
                const id = actionBtn.dataset.id;
                if (action === 'rename') renameFiche(id);
                else if (action === 'delete') confirmDeleteFiche(id);
                return;
            }
            // Click sur la card → switch active
            const id = el.dataset.id;
            if (id !== currentFiche._fiche_id) switchToFiche(id);
        });
    });
}


/* ─── Export / Import JSON ────────────────────────────── */
function downloadBlob(filename, jsonObj) {
    try {
        const blob = new Blob([JSON.stringify(jsonObj, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 300);
    } catch (e) {
        console.warn('Export échoué :', e);
        showToast('Export échoué');
    }
}

function exportActiveFiche() {
    if (!currentFiche || !currentFiche._fiche_id) { showToast('Aucune fiche active'); return; }
    const cleaned = JSON.parse(JSON.stringify(currentFiche));
    // Nettoie les flags transitoires _expanded
    const stripExpanded = (arr) => Array.isArray(arr) && arr.forEach(i => delete i._expanded);
    stripExpanded(cleaned.perks); stripExpanded(cleaned.sorts); stripExpanded(cleaned.techniques);
    stripExpanded(cleaned.wild_perks); stripExpanded(cleaned.weapons); stripExpanded(cleaned.armors); stripExpanded(cleaned.tools);
    if (cleaned.dragon) {
        stripExpanded(cleaned.dragon.perks); stripExpanded(cleaned.dragon.weapons); stripExpanded(cleaned.dragon.armors);
    }
    const safeName = (cleaned.nom || 'fiche').replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
    const filename = `drakonym_${safeName}_${new Date().toISOString().slice(0,10)}.json`;
    downloadBlob(filename, {
        _format: 'drakonym-compagnon',
        _version: 1,
        _exported_at: new Date().toISOString(),
        fiche: cleaned,
    });
    showToast(`⇩ ${cleaned.nom || 'Fiche'} exportée`);
}

function exportAllFiches() {
    const store = loadStore();
    const fiches = Object.values(store.fiches).map(f => {
        const cleaned = JSON.parse(JSON.stringify(f));
        const stripExpanded = (arr) => Array.isArray(arr) && arr.forEach(i => delete i._expanded);
        stripExpanded(cleaned.perks); stripExpanded(cleaned.sorts); stripExpanded(cleaned.techniques);
        stripExpanded(cleaned.wild_perks); stripExpanded(cleaned.weapons); stripExpanded(cleaned.armors); stripExpanded(cleaned.tools);
        if (cleaned.dragon) {
            stripExpanded(cleaned.dragon.perks); stripExpanded(cleaned.dragon.weapons); stripExpanded(cleaned.dragon.armors);
        }
        return cleaned;
    });
    const filename = `drakonym_toutes_fiches_${new Date().toISOString().slice(0,10)}.json`;
    downloadBlob(filename, {
        _format: 'drakonym-compagnon',
        _version: 1,
        _exported_at: new Date().toISOString(),
        fiches,
    });
    showToast(`⇩ ${fiches.length} fiche${fiches.length > 1 ? 's' : ''} exportée${fiches.length > 1 ? 's' : ''}`);
}

function triggerImport() {
    const input = document.getElementById('import-file-input');
    if (input) input.click();
}

function handleImportFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            previewAndImport(data);
        } catch (err) {
            showToast('Fichier JSON invalide');
        }
    };
    reader.readAsText(file);
}

function previewAndImport(data) {
    // Détecte le format : {fiche: {...}} ou {fiches: [...]} ou objet fiche brut
    let fichesToImport = [];
    if (data && data.fiche && typeof data.fiche === 'object') {
        fichesToImport = [data.fiche];
    } else if (data && Array.isArray(data.fiches)) {
        fichesToImport = data.fiches;
    } else if (data && data.nom && data.attributs) {
        // Format brut (fiche directe)
        fichesToImport = [data];
    } else {
        showToast('Format JSON non reconnu');
        return;
    }
    if (fichesToImport.length === 0) {
        showToast('Aucune fiche à importer');
        return;
    }

    // Bottom sheet preview
    const previewHtml = fichesToImport.map(f => {
        const dragon = (f.dragon && f.dragon.nom) ? ` · 🐉 ${escapeHtml(f.dragon.nom)}` : '';
        return `<li><strong>${escapeHtml(f.nom || 'Sans nom')}</strong> · ${escapeHtml(f.kin || '?')} · ${escapeHtml(f.classe || '?')} · Niv. ${f.niveau || '?'}${dragon}</li>`;
    }).join('');
    const html = `
        <div class="capacite-form">
            <p style="font-size: 13px; color: var(--text);">
                ${fichesToImport.length} fiche${fichesToImport.length > 1 ? 's' : ''} détectée${fichesToImport.length > 1 ? 's' : ''} dans le fichier :
            </p>
            <div class="fiche-import-preview">
                <ul>${previewHtml}</ul>
            </div>
            <p style="font-size: 12px; color: var(--text-muted); font-style: italic; line-height: 1.4;">
                <strong style="color: var(--text);">Ajouter</strong> : les fiches importées sont ajoutées (les tiennes restent).<br>
                <strong style="color: var(--crimson-bright);">Remplacer</strong> : ⚠️ écrase TOUTES tes fiches actuelles.
            </p>
            <div class="form-actions">
                <button type="button" class="form-btn cancel" data-action="cancel">Annuler</button>
                <button type="button" class="form-btn save" data-action="add">Ajouter</button>
            </div>
            <div class="form-actions" style="margin-top: 4px;">
                <button type="button" class="form-btn cancel" data-action="replace" style="background: var(--crimson); color: #f5e8c5; border-color: var(--crimson-bright);">⚠️ Tout remplacer</button>
            </div>
        </div>
    `;
    openBottomSheet('Importer', html, (root) => {
        root.querySelector('[data-action="cancel"]').addEventListener('click', closeBottomSheet);
        const doImport = (replace) => {
            const store = replace ? { activeId: null, fiches: {} } : loadStore();
            let firstId = null;
            fichesToImport.forEach(raw => {
                // Force un nouvel id pour éviter collision
                const merged = mergeFicheDefaults(raw);
                merged._fiche_id = 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
                store.fiches[merged._fiche_id] = merged;
                if (!firstId) firstId = merged._fiche_id;
            });
            if (replace || !store.activeId) store.activeId = firstId;
            saveStore(store);
            currentFiche = mergeFicheDefaults(store.fiches[store.activeId]);
            closeBottomSheet();
            renderAll();
            renderHistoireFields();
            renderFichesList();
            showToast(`⇧ ${fichesToImport.length} fiche${fichesToImport.length > 1 ? 's' : ''} importée${fichesToImport.length > 1 ? 's' : ''}`);
        };
        root.querySelector('[data-action="add"]').addEventListener('click', () => doImport(false));
        root.querySelector('[data-action="replace"]').addEventListener('click', () => doImport(true));
    });
}


/* ─── Bind onglet Plus (multi-fiches + export/import) ──── */
function bindPlusActions() {
    const btnNew = document.getElementById('btn-fiche-new');
    if (btnNew) btnNew.addEventListener('click', createNewFiche);

    const btnDup = document.getElementById('btn-fiche-duplicate');
    if (btnDup) btnDup.addEventListener('click', duplicateActiveFiche);

    const btnExportActive = document.getElementById('btn-export-active');
    if (btnExportActive) btnExportActive.addEventListener('click', exportActiveFiche);

    const btnExportAll = document.getElementById('btn-export-all');
    if (btnExportAll) btnExportAll.addEventListener('click', exportAllFiches);

    const btnImport = document.getElementById('btn-import');
    if (btnImport) btnImport.addEventListener('click', triggerImport);

    const importInput = document.getElementById('import-file-input');
    if (importInput) {
        importInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (file) handleImportFile(file);
            // Reset pour pouvoir réimporter le même fichier
            e.target.value = '';
        });
    }
}


/* ═══════════════════════════════════════════════════════════════
   INSTALLATION PWA
   ═══════════════════════════════════════════════════════════════ */
let deferredInstallPrompt = null;

function setupInstallFlow() {
    const btnInstall = document.getElementById('btn-install');
    const statusHint = document.getElementById('install-status-hint');
    const installBlock = document.getElementById('install-block');
    if (!btnInstall || !statusHint) return;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;

    // Si l'app est déjà installée et lancée en standalone, on cache TOUT le bloc Installation
    if (isStandalone) {
        if (installBlock) installBlock.hidden = true;
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
        if (installBlock) installBlock.hidden = true;
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
    if (action === 'dice') {
        // Petit délai pour laisser l'app finir de s'initialiser
        setTimeout(() => openDiceRoller(), 100);
    } else if (action === 'fiches') {
        switchToTab('plus');
        showToast('Raccourci fiches — bientôt');
    }
}


/* ═══════════════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════════════ */
function init() {
    currentFiche = loadFiche();
    loadDiceLog();
    loadDicePresets();

    applyTheme(getStoredTheme());
    bindThemeToggle();
    bindSoundToggle();
    preloadDiceSound();
    bindTabNavigation();
    bindVitalBarActions();
    bindFicheActions();
    bindCapacitesActions();
    bindEquipementActions();
    bindDragonActions();
    bindConfigFields();
    bindHistoireFields();
    bindPlusActions();
    bindFab();
    bindBottomSheetGlobalActions();
    bindDiceModalGlobalActions();
    setupInstallFlow();
    bindDesktopSidebar();

    renderAll();
    renderFichesList();

    // Restaure l'état du Mode Combat (si activé avant un reload)
    if (_combatMode) {
        document.body.classList.add('combat-mode-on');
    }
    renderCombatPanel();
    refreshCombatToggle();

    handleStartupAction();
    registerServiceWorker();
}


/* ═══════════════════════════════════════════════════════════════
   v2.0.0 — RACCOURCIS CLAVIER (desktop)
   ═══════════════════════════════════════════════════════════════ */
function bindDesktopSidebar() {
    // Sidebar gauche : navigation onglets
    document.querySelectorAll('.desktop-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.desktopTab;
            if (tab) switchToTab(tab);
        });
    });

    // Bouton "Lancer dés" sidebar gauche
    const desktopDiceBtn = document.getElementById('desktop-dice-btn');
    if (desktopDiceBtn) {
        desktopDiceBtn.addEventListener('click', () => openDiceRoller([], {}));
    }

    // Persona switcher : le binding se fait dans refreshDesktopPersona()
    // (bind direct sur le select et le bouton, idempotent via flag)

    // Toggle sidebar droite (Vague D)
    const hideBtn = document.getElementById('desktop-sidebar-toggle-hide');
    const showBtn = document.getElementById('desktop-sidebar-toggle-show');
    if (hideBtn) hideBtn.addEventListener('click', () => setDesktopSidebarRightHidden(true));
    if (showBtn) showBtn.addEventListener('click', () => setDesktopSidebarRightHidden(false));

    // Restaurer l'état au chargement
    const saved = localStorage.getItem('drakonym_sidebar_right_hidden');
    if (saved === '1') setDesktopSidebarRightHidden(true);
}

function setDesktopSidebarRightHidden(hidden) {
    const layout = document.querySelector('.app-layout');
    if (!layout) return;
    layout.classList.toggle('right-hidden', hidden);
    try {
        localStorage.setItem('drakonym_sidebar_right_hidden', hidden ? '1' : '0');
    } catch (e) { /* localStorage indispo, on ignore */ }
}

function refreshDesktopPersona() {
    const select = document.getElementById('desktop-persona-select');
    if (!select) return;

    const fiches = getFichesList();
    const activeId = currentFiche && currentFiche._fiche_id;
    if (fiches.length === 0) {
        select.innerHTML = '<option value="">— Aucune fiche —</option>';
        select.disabled = true;
        return;
    }
    select.disabled = false;
    select.innerHTML = fiches.map(f => {
        const meta = [f.kin, f.classe, f.niveau ? `Niv.${f.niveau}` : ''].filter(Boolean).join(' · ');
        const label = meta ? `${f.nom} (${meta})` : f.nom;
        return `<option value="${escapeHtml(f.id)}"${f.id === activeId ? ' selected' : ''}>${escapeHtml(label)}</option>`;
    }).join('');

    // (Re)bind le listener change. Pour éviter les doublons, on clone le select
    // mais c'est plus simple d'utiliser une propriété sentinelle.
    if (!select.__personaBound) {
        select.addEventListener('change', () => {
            const id = select.value;
            if (!id) return;
            if (currentFiche && id === currentFiche._fiche_id) return;
            switchToFiche(id);
        });
        select.__personaBound = true;
    }
    // Idem pour le bouton +
    const addBtn = document.getElementById('desktop-persona-add');
    if (addBtn && !addBtn.__personaAddBound) {
        addBtn.addEventListener('click', () => createNewFiche());
        addBtn.__personaAddBound = true;
    }
}

function renderDesktopEquipped() {
    const container = document.getElementById('desktop-equipped');
    if (!container) return;
    const f = currentFiche;
    if (!f) {
        container.innerHTML = '<p class="desktop-side-empty">Aucun personnage</p>';
        return;
    }
    const weapons = (f.weapons || []).filter(w => w.equipped && w.type !== 'focus');
    const focuses = (f.weapons || []).filter(w => w.equipped && w.type === 'focus');
    const armors = (f.armors || []).filter(a => a.equipped);

    if (weapons.length === 0 && focuses.length === 0 && armors.length === 0) {
        container.innerHTML = `<p class="desktop-side-empty">Rien d'équipé.<br><small>Utilise les onglets Équipement pour équiper.</small></p>`;
        return;
    }

    let html = '';

    // ─── Armes (cliquable → attaque) ───
    if (weapons.length > 0) {
        html += '<div class="desktop-equip-group"><div class="desktop-equip-group-label">Armes</div>';
        weapons.forEach(w => {
            const bodyValue = f.attributs.Body || 0;
            const meetsMin = bodyValue >= (w.min_body || 0);
            const bonus = meetsMin ? (w.bonus_dice || 0) : 0;
            const minWarn = !meetsMin && w.bonus_dice > 0
                ? `<span class="desktop-equip-warn" title="Min Body ${w.min_body} non atteint">⚠</span>`
                : '';
            html += `
                <button type="button" class="desktop-equip-item desktop-equip-weapon" data-equip-weapon="${w.id}">
                    <span class="desktop-equip-icon">⚔️</span>
                    <span class="desktop-equip-info">
                        <span class="desktop-equip-name">${escapeHtml(w.nom)}</span>
                        <span class="desktop-equip-meta">+${bonus} dés${w.range > 1 ? ` · portée ${w.range}` : ''} ${minWarn}</span>
                    </span>
                    <span class="desktop-equip-cta">Attaquer</span>
                </button>
            `;
        });
        html += '</div>';
    }

    // ─── Armures ───
    if (armors.length > 0) {
        const totalArmor = armors.reduce((s, a) => s + (a.armor_bonus || 0), 0);
        html += '<div class="desktop-equip-group"><div class="desktop-equip-group-label">Armures</div>';
        armors.forEach(a => {
            html += `
                <div class="desktop-equip-item">
                    <span class="desktop-equip-icon">🛡</span>
                    <span class="desktop-equip-info">
                        <span class="desktop-equip-name">${escapeHtml(a.nom)}</span>
                        <span class="desktop-equip-meta">Armor +${a.armor_bonus || 0}</span>
                    </span>
                </div>
            `;
        });
        html += `<div class="desktop-equip-total">Total Armure : <strong>+${totalArmor}</strong></div>`;
        html += '</div>';
    }

    // ─── Focus magique ───
    if (focuses.length > 0) {
        const totalSpell = focuses.reduce((s, f2) => s + (f2.bonus_dice || 0), 0);
        html += '<div class="desktop-equip-group"><div class="desktop-equip-group-label">Focus magique</div>';
        focuses.forEach(fo => {
            html += `
                <div class="desktop-equip-item">
                    <span class="desktop-equip-icon">🔮</span>
                    <span class="desktop-equip-info">
                        <span class="desktop-equip-name">${escapeHtml(fo.nom)}</span>
                        <span class="desktop-equip-meta">Spell Bonus +${fo.bonus_dice || 0}</span>
                    </span>
                </div>
            `;
        });
        html += `<div class="desktop-equip-total">Bonus magique total : <strong>+${totalSpell}</strong></div>`;
        html += '</div>';
    }

    container.innerHTML = html;

    // Bind click sur armes équipées → attaque directe
    container.querySelectorAll('[data-equip-weapon]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.equipWeapon;
            const w = (currentFiche.weapons || []).find(x => x.id === id);
            if (w) performWeaponAttack(w);
        });
    });
}

/* ─── Vague C : Log de dés permanent dans sidebar droite ──── */
function formatRelativeTime(timestamp) {
    if (!timestamp) return '';
    const diff = (Date.now() - timestamp) / 1000;
    if (diff < 30) return 'à l\'instant';
    if (diff < 60) return 'il y a ' + Math.floor(diff) + 's';
    if (diff < 3600) return 'il y a ' + Math.floor(diff / 60) + 'min';
    if (diff < 86400) return 'il y a ' + Math.floor(diff / 3600) + 'h';
    return 'il y a ' + Math.floor(diff / 86400) + 'j';
}

function renderDesktopRollsLog() {
    const container = document.getElementById('desktop-rolls-log');
    if (!container) return;

    if (!Array.isArray(diceLog) || diceLog.length === 0) {
        container.innerHTML = `<p class="desktop-side-empty">Aucun jet pour l'instant.<br><small>Lance les dés pour voir l'historique ici.</small></p>`;
        return;
    }

    const recent = diceLog.slice(0, 6);
    let html = '<div class="desktop-rolls-list">';
    recent.forEach((entry, idx) => {
        const cls = entry.entryClass ? ` desktop-roll-${entry.entryClass}` : '';
        const label = entry.label || 'Jet';
        const time = formatRelativeTime(entry.time);
        html += `
            <button type="button" class="desktop-roll-item${cls}" data-roll-idx="${idx}">
                <span class="desktop-roll-top">
                    <span class="desktop-roll-label">${escapeHtml(label)}</span>
                    <span class="desktop-roll-time">${time}</span>
                </span>
                <span class="desktop-roll-result">${entry.result || ''}</span>
            </button>
        `;
    });
    html += '</div>';

    if (diceLog.length > 6) {
        html += `<button type="button" class="desktop-rolls-viewall" id="desktop-rolls-viewall">Voir tout l'historique (${diceLog.length})</button>`;
    }

    container.innerHTML = html;

    // Click sur une entrée → ouvre le dice modal en mode log
    container.querySelectorAll('[data-roll-idx]').forEach(btn => {
        btn.addEventListener('click', () => {
            openDiceLogView();
        });
    });
    const viewAll = container.querySelector('#desktop-rolls-viewall');
    if (viewAll) viewAll.addEventListener('click', openDiceLogView);
}

function openDiceLogView() {
    // Ouvre le dice modal directement sur la vue log
    if (!currentRoll) {
        currentRoll = {
            attrs: [], modifier: 0, boons: 0, banes: 0,
            useHpBoon: false, useShadow: false, difficulty: 0,
            label: '', attackMode: false,
            weaponName: null, weaponBonus: 0, weaponMinBody: 0, weaponMinBodyOk: true,
            dice: null, shadowValue: null, boonsRemaining: 0,
            secondWindUsed: [], bonesAfterCancel: 0,
        };
    }
    diceModalView = 'log';
    document.getElementById('dice-modal').hidden = false;
    renderDiceModal();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
