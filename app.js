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
    wounds: {
        light: 1, heavy: 0, deadly: 0,
        light_max: 3, heavy_max: 3, deadly_max: 3, // extensibles via Perks
    },
    ap_current: 4,
    defense_current: 14,
    defense_max: 14,
    armure_bonus: 1,
    mana_current: 8,
    mana_max: 12,
    grit_current: 4,
    grit_max: 6,
    short_rests_used: 0,
    spell_bonus: 1,
    statuses: [
        { id: 'bloodied', value: 0 },
        { id: 'burning', value: 2 },
    ],
    perks: [
        { id: 'p1', titre: 'Ascendant Bloodline', color: 'crimson', description: "Once per Downtime, for 3 rounds, your spells ignore Defense and resistances." },
        { id: 'p2', titre: 'Aspect Affinity (Inheric)', color: 'blue', description: "Reduce the Mana cost of spells with the Inheric tag by 1 (min 1)." },
    ],
    sorts: [
        { id: 's1', titre: 'Bolt', aspect: 'Inheric', mana_cost: 2, ap_cost: 1, color: 'blue', description: "A surge of inheric energy targets a creature.\nThe target suffers 3 Wounds." },
        { id: 's2', titre: 'Ward', aspect: 'Inheric', mana_cost: 2, ap_cost: 1, color: 'blue', description: "You cloak an ally in protective will.\nUntil end of next round, target gains +2 Defense Slots." },
    ],
    techniques: [],
    wild_perks: [
        { id: 'w1', titre: 'The Maker', color: 'gold', description: "For the rest of the scene, all your 4s now count as two successes.", used: false },
    ],
    draviks: 145,
    weapons: [
        {
            id: 'wp1', nom: 'Longsword', type: 'medium',
            bonus_dice: 2, damage_tiers: [3, 4, 5, 6, 7], damage_type: 'Slashing',
            range: 1, min_body: 2,
            perk: 'Versatile : When two-handed, escalate damage by 1 Tier (max Tier 5).',
            draviks: 60, equipped: true, color: 'gold'
        },
    ],
    armors: [
        {
            id: 'ar1', nom: 'Medium Armor', type: 'armor',
            armor_bonus: 2, min_body: 2, speed_penalty: -1,
            perk: '',
            draviks: 60, equipped: true, color: 'gold'
        },
    ],
    tools: [
        {
            id: 'tl1', nom: 'Lockpick Set',
            attribute: 'Shadow',
            description: '+2d6 sur les checks Shadow pour crocheter une serrure ou désamorcer un piège silencieusement.',
            draviks: 40, quantity: 1, color: 'gold'
        },
    ],
    dragon: {
        nom: 'Stormfang',
        family: 'Storm',
        stage: 'Juvenile',
        speed: 8,
        pillars: {
            love: 'Voler dans les orages, sentir le tonnerre vibrer dans ses ailes.',
            fear: "L'isolement et le silence après la tempête.",
            instinct: 'Charger droit sur l\'ennemi le plus dangereux du champ de bataille.',
        },
        attributs: { Body: 2, Mind: 1, Soul: 3 },
        bp_current: 5,
        bp_max: 9,
        armor_bonus: 2,
        breath: {
            element: 'Lightning',
            shape: 'Cone',
            description: "Une décharge de foudre concentrée jaillit de la gueule de Stormfang, illuminant tout sur son passage.",
            effect: 'Stunned 1 (sur 1+ succès)',
            charges_current: 2,
            charges_max: 2,
        },
        perks: [
            { id: 'dp1', nom: 'Storm Affinity', source: 'Family Core', color: 'purple',
              description: 'Le dragon ignore le terrain difficile lié aux orages, à la pluie, et aux vents violents. Ses attaques avec le tag Lightning gagnent un Faveur.',
              used: false },
            { id: 'dp2', nom: 'Bond Sense', source: 'Bond', color: 'gold',
              description: "Tu sais toujours l'état émotionnel et la position générale de ton dragon, même séparés. Once per scene, demande au Herald une question oui/non sur ce que ton dragon voit ou entend.",
              used: false },
        ],
        weapons: [
            {
                id: 'dw1', nom: 'Fang Caps', type: 'light',
                bonus_dice: 1, damage_tiers: [2, 4, 6, 8, 10], damage_type: 'Bite',
                range: 1, min_body: 2,
                perk: 'On 2+ successes, target suffers Weakened 1.',
                draviks: 50, equipped: true, color: 'gold',
            },
        ],
        armors: [
            {
                id: 'da1', nom: 'Leather Barding',
                armor_bonus: 2, min_body: 2,
                draviks: 75, equipped: true, color: 'gold',
            },
        ],
    },
};

/* Les 16 statuses officiels du Core Rulebook (effets côté joueur)
   - id : identifiant en anglais (compat données desktop)
   - nomFr : nom affiché en français
   - emoji : icône visuelle
   - hasIntensity : true si X = paramètre numérique (Burning et Poisoned, où X = dégâts)
   - color : 'crimson' (sévère) ou 'shadow' (mental/contrôle)
   - description : effet en jeu, formulé en mes propres mots */
const STATUSES_CATALOG = [
    { id: 'blinded',     nomFr: 'Aveuglé',     emoji: '🙈', hasIntensity: false, color: 'shadow',  description: "Tous tes checks d'attaque subissent un Fardeau." },
    { id: 'bloodied',    nomFr: 'Ensanglanté', emoji: '🩸', hasIntensity: false, color: 'crimson', description: "Si tu prends une Wound supplémentaire, tu meurs (drapeau narratif)." },
    { id: 'burning',     nomFr: 'En feu',      emoji: '🔥', hasIntensity: true,  color: 'crimson', description: "En début de tour, subis X Light Wounds. Tes dégâts physiques sont divisés par 2. Coût : 1 AP/BP pour étouffer." },
    { id: 'charmed',     nomFr: 'Charmé',      emoji: '💞', hasIntensity: false, color: 'shadow',  description: "Tu ne peux pas cibler le charmeur. Termine si lui ou ses alliés te blessent." },
    { id: 'confused',    nomFr: 'Confus',      emoji: '😵\u200d💫', hasIntensity: false, color: 'shadow',  description: "En début de tour, lance 1d6. 1-3 = agis erratiquement (Herald décide), 4-6 = normal." },
    { id: 'dazed',       nomFr: 'Hébété',      emoji: '😶\u200d🌫️', hasIntensity: false, color: 'shadow',  description: "Pool d'AP réduit de 1, BP du dragon réduit de 2. Interruptions subissent un Fardeau." },
    { id: 'frightened',  nomFr: 'Effrayé',     emoji: '😱', hasIntensity: false, color: 'shadow',  description: "Tu ne peux pas cibler la source de la peur. Tant qu'elle est en vue, Fardeau sur tous tes checks." },
    { id: 'frozen',      nomFr: 'Gelé',        emoji: '🧊', hasIntensity: false, color: 'shadow',  description: "Tu ne peux pas bouger. Toute attaque physique te fait moitié des dégâts en plus." },
    { id: 'knocked_down',nomFr: 'À terre',     emoji: '🤕', hasIntensity: false, color: 'shadow',  description: "Tu es à terre (Prone). Coût : 1 AP/BP pour te relever." },
    { id: 'poisoned',    nomFr: 'Empoisonné',  emoji: '🧪', hasIntensity: true,  color: 'crimson', description: "À la fin de chaque round, subis X Light Wounds. Double chaque round non traité. Coût : 1 AP pour traiter ou utiliser un antidote." },
    { id: 'rooted',      nomFr: 'Enraciné',    emoji: '🌿', hasIntensity: false, color: 'shadow',  description: "Tu ne peux pas bouger. Tu ne peux pas dépenser de Defense Slots pour bloquer." },
    { id: 'silenced',    nomFr: 'Bâillonné',   emoji: '🤐', hasIntensity: false, color: 'shadow',  description: "Tu ne peux pas parler ni lancer de sort, sauf via Subtle Cast ou capacité similaire." },
    { id: 'slowed',      nomFr: 'Ralenti',     emoji: '🐢', hasIntensity: false, color: 'shadow',  description: "Mouvement divisé par 2." },
    { id: 'stunned',     nomFr: 'Sonné',       emoji: '⚡', hasIntensity: false, color: 'shadow',  description: "Tu ne peux pas utiliser d'interruptions." },
    { id: 'unseen',      nomFr: 'Invisible',   emoji: '👻', hasIntensity: false, color: 'shadow',  description: "Tant que tu n'es pas détecté, tu ne peux pas être ciblé. Tes attaques gagnent un Faveur." },
    { id: 'weakened',    nomFr: 'Affaibli',    emoji: '💪', hasIntensity: false, color: 'shadow',  description: "Tes checks d'attaque subissent Fardeau 2." },
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
                const niceName = { light: 'Light', heavy: 'Heavy', deadly: 'Deadly' };
                showToast(`Track ${niceName[startTier]} pleine → +1 ${niceName[t]}`);
            }
            return true;
        }
        i++;
    }
    // Toutes les tracks sont pleines, y compris Deadly
    showToast('💀 Wounds overflow — la mort possible !');
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
    merged.wounds = Object.assign(
        { light: 0, heavy: 0, deadly: 0, light_max: 3, heavy_max: 3, deadly_max: 3 },
        merged.wounds || {}
    );
    if (Array.isArray(merged.statuses)) {
        const validIds = new Set(STATUSES_CATALOG.map(c => c.id));
        merged.statuses = merged.statuses.filter(s => validIds.has(s.id));
    }
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
        nom: '', family: '', stage: 'Hatchling', speed: 6,
        pillars: { love: '', fear: '', instinct: '' },
        attributs: { Body: 1, Mind: 1, Soul: 1 },
        bp_current: 0, bp_max: 6,
        armor_bonus: 0,
        breath: { element: '', shape: 'Cone', description: '', effect: '', charges_current: 0, charges_max: 1 },
        perks: [], weapons: [], armors: [],
    }, merged.dragon || {});
    merged.dragon.pillars = Object.assign({ love: '', fear: '', instinct: '' }, merged.dragon.pillars || {});
    merged.dragon.attributs = Object.assign({ Body: 1, Mind: 1, Soul: 1 }, merged.dragon.attributs || {});
    merged.dragon.breath = Object.assign({ element: '', shape: 'Cone', description: '', effect: '', charges_current: 0, charges_max: 1 }, merged.dragon.breath || {});
    if (!Array.isArray(merged.dragon.perks)) merged.dragon.perks = [];
    if (!Array.isArray(merged.dragon.weapons)) merged.dragon.weapons = [];
    if (!Array.isArray(merged.dragon.armors)) merged.dragon.armors = [];
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
    // Aucune fiche : crée une démo et la rend active
    const demo = mergeFicheDefaults(JSON.parse(JSON.stringify(FICHE_DEMO)));
    store.activeId = demo._fiche_id;
    store.fiches[demo._fiche_id] = demo;
    saveStore(store);
    return demo;
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
    renderCapacites();
    renderEquipement();
    renderDragon();
    renderConfigFields();
    renderHistoireFields();
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

    // Wounds : un pip par tier, rempli s'il y a au moins 1 wound à ce tier
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


/* ─── Sheet : Wounds (3 tracks indépendants avec overflow) ─── */
function openWoundsSheet() {
    const tierLabels = { light: 'Light', heavy: 'Heavy', deadly: 'Deadly' };

    function buildHtml() {
        let html = '<div class="wounds-sheet">';
        for (const tier of ['light', 'heavy', 'deadly']) {
            const count = currentFiche.wounds[tier] || 0;
            const max = currentFiche.wounds[tier + '_max'] || 3;
            let boxesHtml = '';
            for (let i = 0; i < max; i++) {
                const filled = i < count ? ` filled tier-${tier}` : '';
                boxesHtml += `<span class="wound-box${filled}"></span>`;
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
        html += `<p class="wounds-hint">Track pleine → la wound suivante <em>overflow</em> au tier supérieur. Deadly overflow = mort.<br>Les maxes (3 par défaut) peuvent être étendues par certaines Perks.</p></div>`;
        return html;
    }

    function refreshTrack(contentEl, tier) {
        const count = currentFiche.wounds[tier] || 0;
        const max = currentFiche.wounds[tier + '_max'] || 3;
        const boxesEl = contentEl.querySelector(`#wt-boxes-${tier}`);
        let boxesHtml = '';
        for (let i = 0; i < max; i++) {
            const filled = i < count ? ` filled tier-${tier}` : '';
            boxesHtml += `<span class="wound-box${filled}"></span>`;
        }
        boxesEl.innerHTML = boxesHtml;
        contentEl.querySelector(`#wt-count-${tier}`).textContent = `${count} / ${max}`;
    }

    openBottomSheet('Wounds', buildHtml(), (contentEl) => {
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

    openBottomSheet('Statuses · ajouter ou retirer', html, (contentEl) => {
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
        showToast("3 Short Rests déjà utilisés aujourd'hui");
        return;
    }

    const refillAmount = 3 + Math.ceil(currentFiche.niveau / 2);
    const html = `
        <div class="confirm-sheet">
            <p class="confirm-message">
                <strong>Repos court</strong> appliquera&nbsp;:<br><br>
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

    openBottomSheet('Repos court', html, (contentEl) => {
        contentEl.querySelector('[data-action="cancel"]').addEventListener('click', closeBottomSheet);
        contentEl.querySelector('[data-action="confirm"]').addEventListener('click', () => {
            // Wounds : Heavy → Light (transfert), Light → 0. Deadly inchangé (règle officielle).
            // Plafonné au light_max courant.
            const oldHeavy = currentFiche.wounds.heavy || 0;
            const lightMax = currentFiche.wounds.light_max || 3;
            currentFiche.wounds.light = Math.min(lightMax, oldHeavy);
            currentFiche.wounds.heavy = 0;
            // Deadly inchangé volontairement.

            // Mana / Grit
            currentFiche.mana_current = Math.min(currentFiche.mana_max, currentFiche.mana_current + refillAmount);
            currentFiche.grit_current = Math.min(currentFiche.grit_max, currentFiche.grit_current + refillAmount);

            currentFiche.short_rests_used += 1;

            saveFiche();
            renderAll();
            closeBottomSheet();
            showToast('Repos court appliqué');
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

    countEl.textContent = items.length;

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
    const usedClass = (type === 'wild_perks' && item.used) ? ' used' : '';
    const expanded = item._expanded ? ' expanded' : '';
    const colorClass = item.color ? ` color-${item.color}` : '';

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
        // Pool spellcasting = Primary + Spell Bonus (mode attaque, sans doublement)
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
    // Light (+1d6, Min Body 1)
    { nom: 'Club',       type: 'light',  bonus_dice: 1, damage_tiers: [3,3,4,5,5], damage_type: 'Bludgeoning', range: 1, min_body: 1, perk: 'Bruising : Enemies damaged lose 1 Speed on their next turn.', draviks: 5 },
    { nom: 'Dagger',     type: 'light',  bonus_dice: 1, damage_tiers: [3,3,4,4,5], damage_type: 'Slashing',    range: 1, min_body: 1, perk: 'Thrown : May be thrown up to 5 sq.', draviks: 10 },
    { nom: 'Hand Axe',   type: 'light',  bonus_dice: 1, damage_tiers: [3,4,4,5,6], damage_type: 'Slashing',    range: 1, min_body: 1, perk: 'Thrown : May be thrown up to 5 sq.', draviks: 15 },
    { nom: 'Shortsword', type: 'light',  bonus_dice: 1, damage_tiers: [3,4,5,6,7], damage_type: 'Slashing',    range: 1, min_body: 1, perk: 'Swift : Once per round, after hitting, move 1 square for free.', draviks: 20 },
    // Medium (+2d6, Min Body 2)
    { nom: 'Battleaxe',  type: 'medium', bonus_dice: 2, damage_tiers: [3,4,5,6,8], damage_type: 'Slashing',    range: 1, min_body: 2, perk: 'Chop : If you down an enemy, make a free Quick Attack against an adjacent enemy.', draviks: 50 },
    { nom: 'Longsword',  type: 'medium', bonus_dice: 2, damage_tiers: [3,4,5,6,7], damage_type: 'Slashing',    range: 1, min_body: 2, perk: 'Versatile : When two-handed, escalate damage by 1 Tier (max Tier 5).', draviks: 60 },
    { nom: 'Mace',       type: 'medium', bonus_dice: 2, damage_tiers: [3,4,5,5,6], damage_type: 'Bludgeoning', range: 1, min_body: 2, perk: 'Shatter : When you deal damage, remove 1 Defense Slot from the target (1/turn).', draviks: 40 },
    { nom: 'Spear',      type: 'medium', bonus_dice: 2, damage_tiers: [3,4,4,5,6], damage_type: 'Piercing',    range: 2, min_body: 2, perk: 'Reach : Target enemies up to 2 sqs away.', draviks: 30 },
    // Heavy (Min Body 3)
    { nom: 'Greataxe',   type: 'heavy',  bonus_dice: 3, damage_tiers: [4,5,7,8,9], damage_type: 'Slashing',    range: 1, min_body: 3, perk: 'Broken : If you hit with Tier 3+, enemies must spend double the Defense Slots to reduce the damage.', draviks: 100 },
    { nom: 'Greatsword', type: 'heavy',  bonus_dice: 3, damage_tiers: [4,5,6,7,8], damage_type: 'Slashing',    range: 1, min_body: 3, perk: 'Cleave : If a target is downed, deal remaining Wounds to another target within 1 square.', draviks: 90 },
    { nom: 'Halberd',    type: 'heavy',  bonus_dice: 2, damage_tiers: [4,5,6,7,9], damage_type: 'Piercing',    range: 2, min_body: 3, perk: 'Hook : When you hit, pull the target 1 square closer.', draviks: 85 },
    { nom: 'Maul',       type: 'heavy',  bonus_dice: 2, damage_tiers: [4,6,7,8,9], damage_type: 'Bludgeoning', range: 1, min_body: 3, perk: 'Crushing : If you deal Tier 4+ damage, the target is Knocked Down.', draviks: 75 },
    // Ranged
    { nom: 'Crossbow',   type: 'ranged', bonus_dice: 2, damage_tiers: [4,5,6,7,7], damage_type: 'Piercing',    range: 10, min_body: 2, perk: 'Pierce : On armored targets, escalate damage by 1 Tier (max Tier 5).', draviks: 60 },
    { nom: 'Longbow',    type: 'ranged', bonus_dice: 2, damage_tiers: [4,5,6,7,8], damage_type: 'Piercing',    range: 12, min_body: 3, perk: 'Piercing : The first attack each round cannot be reduced using Defense Slots.', draviks: 55 },
    { nom: 'Revolver',   type: 'ranged', bonus_dice: 2, damage_tiers: [4,5,6,7,8], damage_type: 'Piercing',    range: 8,  min_body: 2, perk: 'Ricochet : Once per scene, when you hit, you may target a second enemy within 2 squares (2 Wounds to the new target).', draviks: 75 },
    { nom: 'Shortbow',   type: 'ranged', bonus_dice: 2, damage_tiers: [3,4,5,5,6], damage_type: 'Piercing',    range: 10, min_body: 1, perk: 'Quick Nock : Once per scene, fire twice in the same turn.', draviks: 35 },
    { nom: 'Sling',      type: 'ranged', bonus_dice: 1, damage_tiers: [3,3,4,4,5], damage_type: 'Bludgeoning', range: 8,  min_body: 1, perk: 'Rattle : On max damage, the target is Stunned 1.', draviks: 10 },
    // Spell Focuses
    { nom: 'Orb',        type: 'focus',  bonus_dice: 2, damage_tiers: [0,0,0,0,0], damage_type: '',            range: 0, min_body: 0, perk: 'Adaptable : Can be embedded into another item (weapon or shield).', draviks: 70 },
    { nom: 'Staff',      type: 'focus',  bonus_dice: 1, damage_tiers: [3,4,4,5,5], damage_type: 'Bludgeoning', range: 1, min_body: 1, perk: 'Weapon : May be used as a melee weapon.', draviks: 25 },
    { nom: 'Tome',       type: 'focus',  bonus_dice: 1, damage_tiers: [0,0,0,0,0], damage_type: '',            range: 0, min_body: 0, perk: 'Insight : Once per scene, reroll one failed spellcasting check.', draviks: 50 },
    { nom: 'Wand',       type: 'focus',  bonus_dice: 1, damage_tiers: [0,0,0,0,0], damage_type: '',            range: 0, min_body: 0, perk: 'Overcharge : Once per scene, spells you cast gain a Faveur.', draviks: 40 },
];

/* Presets officiels d'armures (rulebook page 131) */
const ARMOR_PRESETS = [
    { nom: 'Light Armor',  type: 'armor',  armor_bonus: 1, min_body: 1, speed_penalty: 0,  draviks: 25 },
    { nom: 'Medium Armor', type: 'armor',  armor_bonus: 2, min_body: 2, speed_penalty: -1, draviks: 60 },
    { nom: 'Heavy Armor',  type: 'armor',  armor_bonus: 3, min_body: 3, speed_penalty: -2, draviks: 90 },
    { nom: 'Buckler',      type: 'shield', armor_bonus: 1, min_body: 1, speed_penalty: 0,  draviks: 20 },
    { nom: 'Kite Shield',  type: 'shield', armor_bonus: 2, min_body: 2, speed_penalty: -1, draviks: 40 },
    { nom: 'Tower Shield', type: 'shield', armor_bonus: 3, min_body: 3, speed_penalty: -2, draviks: 70 },
];

const WEAPON_TYPE_LABELS = { light: 'Light', medium: 'Medium', heavy: 'Heavy', ranged: 'Ranged', focus: 'Focus' };
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
    countEl.textContent = items.length;

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
    // Utilise les classes type-* existantes pour les couleurs par catégorie
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
        if (item.range > 1) metaTags += `<span class="capacite-meta-tag">Range ${item.range}</span>`;
        if (item.min_body > 0) metaTags += `<span class="capacite-meta-tag">Min Body ${item.min_body}</span>`;
    } else if (type === 'armors') {
        if (item.type) metaTags += `<span class="capacite-meta-tag">${ARMOR_TYPE_LABELS[item.type] || item.type}</span>`;
        if (item.min_body > 0) metaTags += `<span class="capacite-meta-tag">Min Body ${item.min_body}</span>`;
        if (item.speed_penalty < 0) metaTags += `<span class="capacite-meta-tag">Speed ${item.speed_penalty}</span>`;
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
    const bonusDice = meetsMin ? (item.bonus_dice || 0) : 0;

    openDiceRoller([primary], {
        modifier: bonusDice,
        attackMode: true,
        label: `Attaque · ${item.nom}`,
    });

    if (!meetsMin && item.bonus_dice > 0) {
        setTimeout(() => showToast(`⚠️ Min Body ${item.min_body} non atteint — pas de bonus arme`), 200);
    }
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
                <input type="text" class="form-row-input" id="form-nom" placeholder="Ex: Longsword" value="${escapeHtml(e.nom || '')}" maxlength="60">
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
                <label class="form-row-label">Damage Tiers (T1 / T2 / T3 / T4 / T5)</label>
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
                        <option value="Slashing"${e.damage_type === 'Slashing' ? ' selected' : ''}>Slashing</option>
                        <option value="Bludgeoning"${e.damage_type === 'Bludgeoning' ? ' selected' : ''}>Bludgeoning</option>
                        <option value="Piercing"${e.damage_type === 'Piercing' ? ' selected' : ''}>Piercing</option>
                    </select>
                </div>
                <div class="form-row">
                    <label class="form-row-label">Range (1 = mêlée)</label>
                    <input type="number" class="form-row-input" id="form-range" min="0" max="20" value="${e.range ?? 1}">
                </div>
            </div>
            <div class="form-row-grid">
                <div class="form-row">
                    <label class="form-row-label">Min Body</label>
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
                <textarea class="form-row-textarea" id="form-perk" placeholder="Ex: Versatile : When two-handed, escalate damage by 1 Tier (max Tier 5).">${escapeHtml(e.perk || '')}</textarea>
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
                <input type="text" class="form-row-input" id="form-nom" placeholder="Ex: Medium Armor" value="${escapeHtml(e.nom || '')}" maxlength="60">
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
                    <label class="form-row-label">Armor Bonus</label>
                    <input type="number" class="form-row-input" id="form-armor-bonus" min="0" max="5" value="${e.armor_bonus ?? 1}">
                </div>
            </div>
            <div class="form-row-grid">
                <div class="form-row">
                    <label class="form-row-label">Min Body</label>
                    <input type="number" class="form-row-input" id="form-min-body" min="0" max="6" value="${e.min_body ?? 1}">
                </div>
                <div class="form-row">
                    <label class="form-row-label">Speed Penalty</label>
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
                <input type="text" class="form-row-input" id="form-nom" placeholder="Ex: Lockpick Set" value="${escapeHtml(e.nom || '')}" maxlength="60">
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
   Identité, Attributs, Bond Points, Breath Weapon, Pillars,
   Bond Perks, Équipement (armes + armures avec presets officiels)
   ═══════════════════════════════════════════════════════════════ */

/* Familles officielles (rulebook chapter 4) */
const DRAGON_FAMILIES = ['Astral', 'Aura', 'Mirror', 'Moon', 'Pyre', 'Shard', 'Storm', 'Sun', 'Half-Dragon'];

/* Stages avec BP Cap (rulebook page 240) */
const DRAGON_STAGES = ['Hatchling', 'Juvenile', 'Mature', 'Elder', 'Mythic'];
const DRAGON_BP_CAP_BY_STAGE = {
    Hatchling: 6, Juvenile: 9, Mature: 12, Elder: 15, Mythic: 18,
};

/* Shapes officielles du Breath Weapon (rulebook page 19) */
const BREATH_SHAPES = ['Cone', 'Line', 'Sphere'];

/* Sources possibles d'un perk dragon (pour organisation) */
const DRAGON_PERK_SOURCES = ['Bond', 'Family Core', 'Family Minor', 'Family Major', 'Other'];

/* Strike types (zones d'impact des armes naturelles du dragon) */
const DRAGON_STRIKE_TYPES = ['Bite', 'Claw', 'Tail', 'Wing'];

/* Presets officiels d'armes dragon (rulebook page 188) */
const DRAGON_WEAPON_PRESETS = [
    // Light (+1 bonus, +2 damage per Tier)
    { nom: 'Fang Caps',    type: 'light',  bonus_dice: 1, damage_tiers: [2,4,6,8,10],   damage_type: 'Bite',  range: 1, min_body: 2, perk: 'On 2+ successes, target suffers Weakened 1.', draviks: 50 },
    { nom: 'Claw Sheaths', type: 'light',  bonus_dice: 1, damage_tiers: [2,4,6,8,10],   damage_type: 'Claw',  range: 1, min_body: 2, perk: 'Strike two adjacent targets with one Claw attack.', draviks: 50 },
    { nom: 'Tail Rings',   type: 'light',  bonus_dice: 1, damage_tiers: [2,4,6,8,10],   damage_type: 'Tail',  range: 1, min_body: 2, perk: 'On 3+ successes, push target 1 square.', draviks: 75 },
    // Medium (+2 bonus, +4 damage per Tier)
    { nom: 'Iron Fangs',   type: 'medium', bonus_dice: 2, damage_tiers: [4,8,12,16,20], damage_type: 'Bite',  range: 1, min_body: 3, perk: 'On 3+ successes, target is Weakened 1.', draviks: 150 },
    { nom: 'Razor Claws',  type: 'medium', bonus_dice: 2, damage_tiers: [4,8,12,16,20], damage_type: 'Claw',  range: 1, min_body: 3, perk: 'On 2+ successes, target is Dazed 1.', draviks: 150 },
    { nom: 'Spiked Tail',  type: 'medium', bonus_dice: 2, damage_tiers: [4,8,12,16,20], damage_type: 'Tail',  range: 2, min_body: 4, perk: 'On 3+ successes, all targets hit are Knocked Down. (Range : 2-square line)', draviks: 200 },
    { nom: 'Wing Blades',  type: 'medium', bonus_dice: 2, damage_tiers: [4,8,12,16,20], damage_type: 'Wing',  range: 1, min_body: 4, perk: 'On 2+ successes, push target 2 squares. (Adjacent only)', draviks: 200 },
    // Heavy (+3 bonus, +6 damage per Tier)
    { nom: 'Obsidian Fangs', type: 'heavy', bonus_dice: 3, damage_tiers: [6,12,18,24,30], damage_type: 'Bite', range: 1, min_body: 5, perk: 'On 3+ successes, deal 3 extra Wounds directly.', draviks: 500 },
    { nom: 'Adamant Claws',  type: 'heavy', bonus_dice: 3, damage_tiers: [6,12,18,24,30], damage_type: 'Claw', range: 1, min_body: 5, perk: 'On 3+ successes, target is Stunned 1.', draviks: 500 },
    { nom: 'Barbed Tail',    type: 'heavy', bonus_dice: 3, damage_tiers: [6,12,18,24,30], damage_type: 'Tail', range: 3, min_body: 6, perk: 'On 2+ successes, targets also suffer Weakened 1. (Range : 3-square line)', draviks: 600 },
    { nom: 'Storm Wings',    type: 'heavy', bonus_dice: 3, damage_tiers: [6,12,18,24,30], damage_type: 'Wing', range: 1, min_body: 6, perk: 'On 2+ successes, all adjacent targets are pushed 2 squares.', draviks: 600 },
];

/* Presets officiels d'armures dragon (rulebook page 188) */
const DRAGON_ARMOR_PRESETS = [
    { nom: 'Scale Wraps',     armor_bonus: 2, min_body: 2, draviks: 50  },
    { nom: 'Leather Barding', armor_bonus: 2, min_body: 2, draviks: 75  },
    { nom: 'Bronze Plating',  armor_bonus: 2, min_body: 3, draviks: 100 },
    { nom: 'Iron Barding',    armor_bonus: 3, min_body: 3, draviks: 200 },
    { nom: 'Runed Plating',   armor_bonus: 3, min_body: 4, draviks: 250 },
    { nom: 'Steel Harness',   armor_bonus: 3, min_body: 4, draviks: 300 },
    { nom: 'Mithril Plating', armor_bonus: 4, min_body: 5, draviks: 500 },
    { nom: 'Adamant Harness', armor_bonus: 4, min_body: 6, draviks: 600 },
    { nom: 'Sunsteel Barding',armor_bonus: 4, min_body: 6, draviks: 750 },
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

    // BP
    document.getElementById('dragon-bp-current').textContent = d.bp_current || 0;
    document.getElementById('dragon-bp-max').textContent = d.bp_max || dragonBpCap(d.stage);

    // Defense Slots (calculé)
    const ds = dragonDefenseSlots(d);
    document.getElementById('dragon-ds-value').textContent = ds;
    const playerLvl = currentFiche.niveau || 1;
    const armor = (d.armors || []).filter(a => a.equipped).reduce((s, a) => s + (a.armor_bonus || 0), 0);
    const body = (d.attributs && d.attributs.Body) || 0;
    document.getElementById('dragon-ds-formula').textContent = `${armor} + ${body} + ${Math.floor(playerLvl/2)} (½ niv)`;

    // Speed
    document.getElementById('dragon-speed').value = d.speed || 6;

    // Breath
    const b = d.breath || {};
    document.getElementById('breath-element-display').textContent = b.element ? b.element : '— Aucun élément —';
    document.getElementById('breath-shape-display').textContent = b.shape || 'Cone';
    document.getElementById('breath-charges-current').textContent = b.charges_current || 0;
    document.getElementById('breath-charges-max').textContent = b.charges_max || dragonBreathChargesMax(d.attributs.Soul);
    document.getElementById('breath-description-display').textContent = b.description || '— Tap pour configurer —';
    document.getElementById('breath-effect-display').textContent = b.effect ? `Effet : ${b.effect}` : '';

    // Pillars
    document.getElementById('dragon-love').value = (d.pillars && d.pillars.love) || '';
    document.getElementById('dragon-fear').value = (d.pillars && d.pillars.fear) || '';
    document.getElementById('dragon-instinct').value = (d.pillars && d.pillars.instinct) || '';

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
    countEl.textContent = items.length;

    if (items.length === 0) {
        const labels = {
            dperks: "Aucun Bond/Family Perk. Ajoute ceux de ta famille de dragon.",
            dweapons: "Aucune arme dragon. 12 presets officiels disponibles (Fang Caps, Iron Fangs, etc.).",
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
        costBadge = `<span class="capacite-item-cost">+${item.armor_bonus} DS</span>`;
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
        showToast(`Stage : ${d.stage} · BP cap suggéré ${newCap}`);
    });

    // Speed
    const speedInput = document.getElementById('dragon-speed');
    if (speedInput) speedInput.addEventListener('change', () => {
        d.speed = Math.max(0, parseInt(speedInput.value, 10) || 0);
        saveFiche();
    });

    // Attributs : tap pour ouvrir éditeur
    document.querySelectorAll('[data-dattr]').forEach(cell => {
        cell.addEventListener('click', () => openDragonAttributEditor(cell.dataset.dattr));
    });

    // BP card
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

    // Boutons "+ Ajouter" pour le dragon
    ['dperks', 'dweapons', 'darmors'].forEach(type => {
        document.querySelectorAll(`.btn-add-capacite[data-list="${type}"]`).forEach(btn => {
            btn.addEventListener('click', () => {
                if (type === 'dperks') openDragonPerkForm(null);
                else if (type === 'dweapons') openDragonWeaponForm(null);
                else openDragonArmorForm(null);
            });
        });
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
    const label = b.element ? `🐉 Souffle (${b.element}, ${b.shape || 'Cone'})` : `🐉 Souffle de ${d.nom || 'dragon'}`;
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


/* ─── Bottom sheet : éditer Bond Points ──────────────── */
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
                Regain : 1 BP + ½ niv au début du Hero Round, +2 BP via Pillars/RP, ½ max au Repos court, full au Downtime.
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
    openBottomSheet('Bond Points', html, (root) => {
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
                <input type="text" class="form-row-input" id="form-element" placeholder="Lightning, Fire, Cold, Necrotic, Radiance, Acid, Poison…" value="${escapeHtml(b.element || '')}">
            </div>
            <div class="form-row">
                <label class="form-row-label">Shape</label>
                <select class="form-row-select" id="form-shape">${shapesOptions}</select>
                <p style="font-size: 11px; color: var(--text-subtle); font-style: italic; margin-top: 4px;">
                    Cone : 3 cases · Line : 5x1 · Sphere : rayon 2 dans la portée
                </p>
            </div>
            <div class="form-row">
                <label class="form-row-label">Description du souffle</label>
                <textarea class="form-row-textarea" id="form-description" placeholder="Ex: Une décharge de foudre concentrée jaillit de la gueule…">${escapeHtml(b.description || '')}</textarea>
            </div>
            <div class="form-row">
                <label class="form-row-label">Effet / Status infligé</label>
                <input type="text" class="form-row-input" id="form-effect" placeholder="Ex: Stunned 1, Burning 2, Knocked Down…" value="${escapeHtml(b.effect || '')}">
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
    openBottomSheet('Breath Weapon', html, (root) => {
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
            showToast('Breath Weapon mis à jour');
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
                <textarea class="form-row-textarea" id="form-description" placeholder="Effet du perk, coût en BP, conditions…">${escapeHtml(e.description || '')}</textarea>
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
                <input type="text" class="form-row-input" id="form-nom" placeholder="Ex: Iron Fangs" value="${escapeHtml(e.nom || '')}" maxlength="60">
            </div>
            <div class="form-row-grid">
                <div class="form-row">
                    <label class="form-row-label">Catégorie</label>
                    <select class="form-row-select" id="form-type">
                        <option value="light"${e.type === 'light' ? ' selected' : ''}>Light</option>
                        <option value="medium"${e.type === 'medium' ? ' selected' : ''}>Medium</option>
                        <option value="heavy"${e.type === 'heavy' ? ' selected' : ''}>Heavy</option>
                    </select>
                </div>
                <div class="form-row">
                    <label class="form-row-label">Strike (zone)</label>
                    <select class="form-row-select" id="form-dmg-type">${strikeOptions}</select>
                </div>
            </div>
            <div class="form-row-grid">
                <div class="form-row">
                    <label class="form-row-label">Bonus d'attaque (dés)</label>
                    <input type="number" class="form-row-input" id="form-bonus" min="0" max="5" value="${e.bonus_dice ?? 1}">
                </div>
                <div class="form-row">
                    <label class="form-row-label">Range (1=mêlée)</label>
                    <input type="number" class="form-row-input" id="form-range" min="0" max="20" value="${e.range ?? 1}">
                </div>
            </div>
            <div class="form-row">
                <label class="form-row-label">Damage Tiers (T1-T5)</label>
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
                <textarea class="form-row-textarea" id="form-perk" placeholder="Ex: On 2+ successes, target suffers Weakened 1.">${escapeHtml(e.perk || '')}</textarea>
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
        DRAGON_ARMOR_PRESETS.map((p, i) => `<option value="${i}">${p.nom} (+${p.armor_bonus} DS · Min Body ${p.min_body} · ${p.draviks} Drv)</option>`).join('');

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
                <input type="text" class="form-row-input" id="form-nom" placeholder="Ex: Iron Barding" value="${escapeHtml(e.nom || '')}" maxlength="60">
            </div>
            <div class="form-row-grid">
                <div class="form-row">
                    <label class="form-row-label">Armor Bonus</label>
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
                <input type="text" class="form-row-input" id="form-preset-nom" placeholder="Ex: Attaque Longsword, Sneak attack…" maxlength="40">
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


/* ─── Shadow Die outcomes (rulebook page 15) ─────────────── */
function getShadowOutcome(value) {
    if (value === 1)  return { name: 'Disaster',     cssClass: 'disaster',     desc: "Un revers narratif sévère, même si le check réussit." };
    if (value <= 3)   return { name: 'Complication', cssClass: 'complication', desc: "Un revers négatif s'ajoute au résultat." };
    if (value <= 9)   return { name: 'Aucun changement', cssClass: 'neutral', desc: "Seul le résultat du check importe." };
    if (value <= 11)  return { name: 'Opportunity',  cssClass: 'opportunity',  desc: "Un petit coup de pouce narratif." };
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
        // rempli après le jet :
        dice: null,
        shadowValue: null,
        boonsRemaining: 0,
        secondWindUsed: [],
        bonesAfterCancel: 0,
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

    if (diceModalView === 'log') {
        titleEl.textContent = 'Historique';
        bodyEl.innerHTML = renderDiceLogHtml();
        bindDiceLogActions(bodyEl);
    } else if (diceModalView === 'result' && currentRoll && currentRoll.dice) {
        titleEl.textContent = 'Résultat';
        bodyEl.innerHTML = renderDiceResultHtml();
        bindDiceResultActions(bodyEl);
    } else {
        titleEl.textContent = 'Lancer de dés';
        bodyEl.innerHTML = renderDiceConfigHtml();
        bindDiceConfigActions(bodyEl);
    }
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
    return Math.max(0, base + currentRoll.modifier);
}

function getPoolModeLabel() {
    const attrs = currentRoll.attrs.filter(a => currentFiche.attributs[a] != null);
    if (attrs.length === 0) return { html: 'Sélectionne 1 ou 2 attributs', empty: true };
    if (currentRoll.attackMode) {
        const total = attrs.reduce((sum, a) => sum + (currentFiche.attributs[a] || 0), 0);
        const detail = attrs.map(a => `<em>${a}</em> (${currentFiche.attributs[a] || 0})`).join(' + ');
        return { html: `${detail} → ${total} dés (mode attaque, sans doublement)`, empty: false };
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
        ${currentRoll.attackMode ? `
            <div class="attack-mode-banner">
                ⚔️ <strong>Mode attaque</strong> · Pool = Primary + Weapon Bonus (sans doublement)
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
                    <span class="dice-row-stepper-label" style="color: var(--gold);">Boons</span>
                    <div class="dice-row-stepper-controls">
                        <button type="button" data-stepper="boons" data-delta="-1">−</button>
                        <span class="dice-row-stepper-value">${currentRoll.boons}</span>
                        <button type="button" data-stepper="boons" data-delta="1">+</button>
                    </div>
                </div>
                <div class="dice-row-stepper">
                    <span class="dice-row-stepper-label" style="color: var(--shadow-bright);">Banes</span>
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
                <span class="dice-toggle-label"><span class="dice-toggle-icon">🌑</span> Shadow Die (d12)</span>
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

        <button type="button" class="dice-roll-btn" id="dice-roll-btn"${pool === 0 ? ' disabled' : ''}>
            <span class="dice-roll-btn-glyph">⚂</span>
            <span>${rollLabel}</span>
        </button>
    `;
}

function bindDiceConfigActions(root) {
    // Label
    const labelInput = root.querySelector('#dice-label-input');
    labelInput.addEventListener('input', () => { currentRoll.label = labelInput.value; });

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

    // Roll button
    const rollBtn = root.querySelector('#dice-roll-btn');
    if (rollBtn && !rollBtn.disabled) {
        rollBtn.addEventListener('click', performRoll);
    }

    // Save preset button
    const savePresetBtn = root.querySelector('[data-action="save-preset"]');
    if (savePresetBtn) savePresetBtn.addEventListener('click', saveCurrentRollAsPreset);

    // Render presets list (after the rest of the config is in DOM)
    renderDicePresetsList();
}


/* ─── Effectue le jet ────────────────────────────────── */
function performRoll() {
    const pool = computePoolSize();
    if (pool < 1) return;

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

    diceModalView = 'result';
    renderDiceModal();
    // Reset le flag après l'animation (sans re-render — l'animation CSS termine d'elle-même)
    setTimeout(() => { if (currentRoll) currentRoll._freshRoll = false; }, 700);
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
        boonHtml = `<p class="dice-boon-empty" style="margin-bottom: 14px;">Tous tes Boons ont été utilisés.</p>`;
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

    // Wound tracks max
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
    setVal('cfg-primary', f.primary || 'Body');
    ['Body', 'Mind', 'Soul', 'Shadow', 'Gods', 'World'].forEach(name => {
        setVal(`cfg-attr-${name}`, (f.attributs && f.attributs[name]) || 0);
    });
    setVal('cfg-mana-max', f.mana_max || 0);
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

function createNewFiche() {
    const html = `
        <div class="capacite-form">
            <div class="form-row">
                <label class="form-row-label">Nom du nouveau personnage *</label>
                <input type="text" class="form-row-input" id="form-new-nom" placeholder="Ex: Lyriel" maxlength="40" autofocus>
            </div>
            <p style="font-size: 12px; color: var(--text-muted); font-style: italic;">
                Une nouvelle fiche vierge sera créée et activée. Tu pourras la remplir ensuite dans l'onglet Fiche.
            </p>
            <div class="form-actions">
                <button type="button" class="form-btn cancel" data-action="cancel">Annuler</button>
                <button type="button" class="form-btn save" data-action="save">Créer</button>
            </div>
        </div>
    `;
    openBottomSheet('Nouvelle fiche', html, (root) => {
        const input = root.querySelector('#form-new-nom');
        setTimeout(() => input.focus(), 100);
        root.querySelector('[data-action="cancel"]').addEventListener('click', closeBottomSheet);
        root.querySelector('[data-action="save"]').addEventListener('click', () => {
            const nom = input.value.trim();
            if (!nom) { showToast('Donne un nom au personnage'); return; }
            // Crée une fiche vierge (basée sur FICHE_DEMO mais nettoyée)
            const blank = mergeFicheDefaults({ nom, niveau: 1 });
            // Vide les listes pour éviter d'hériter de la démo
            blank.perks = []; blank.sorts = []; blank.techniques = []; blank.wild_perks = [];
            blank.weapons = []; blank.armors = []; blank.tools = [];
            blank.statuses = [];
            blank.dragon.perks = []; blank.dragon.weapons = []; blank.dragon.armors = [];
            blank.dragon.nom = '';
            blank.apparence = ''; blank.histoire = ''; blank.liens = ''; blank.notes = '';
            // Sauve dans le store et active
            const store = loadStore();
            store.fiches[blank._fiche_id] = blank;
            store.activeId = blank._fiche_id;
            saveStore(store);
            currentFiche = blank;
            closeBottomSheet();
            renderAll();
            renderHistoireFields();
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

    renderAll();
    renderFichesList();

    handleStartupAction();
    registerServiceWorker();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
