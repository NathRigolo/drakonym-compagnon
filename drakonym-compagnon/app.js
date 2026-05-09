/* ═══════════════════════════════════════════════════════════════
   DRAKONYM COMPAGNON — APP.JS
   Vague 1 : navigation, thème, Vital Bar, service worker.
   ═══════════════════════════════════════════════════════════════ */


/* ─── DONNÉES FACTICES (à remplacer plus tard par une vraie fiche) ── */
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
};


/* ═══════════════════════════════════════════════════════════════
   THÈME — light / dark / auto, persisté en localStorage
   ═══════════════════════════════════════════════════════════════ */
const THEME_KEY = 'drakonym_compagnon_theme';

function getStoredTheme() {
    try {
        return localStorage.getItem(THEME_KEY) || 'dark';
    } catch (e) {
        return 'dark';
    }
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    // Met à jour la couleur de status bar mobile
    const meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (meta) {
        meta.setAttribute('content', theme === 'light' ? '#f0e3c2' : '#1f1812');
    }

    // Met à jour les boutons du theme toggle
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
   NAVIGATION ONGLETS — switch entre les 5 sections
   ═══════════════════════════════════════════════════════════════ */
function bindTabNavigation() {
    document.querySelectorAll('.tab').forEach(tabBtn => {
        tabBtn.addEventListener('click', () => {
            const targetTab = tabBtn.dataset.tab;
            switchToTab(targetTab);
        });
    });
}

function switchToTab(tabName) {
    // Met à jour les onglets actifs (boutons)
    document.querySelectorAll('.tab').forEach(t => {
        const isActive = t.dataset.tab === tabName;
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Met à jour les sections (contenu)
    document.querySelectorAll('.tab-section').forEach(s => {
        s.classList.toggle('active', s.dataset.tab === tabName);
    });

    // Remonte en haut du nouveau contenu
    const content = document.getElementById('content');
    if (content) content.scrollTop = 0;
}


/* ═══════════════════════════════════════════════════════════════
   VITAL BAR — rendu et interactions
   ═══════════════════════════════════════════════════════════════ */
function renderVitalBar(fiche) {
    // Identité
    document.getElementById('vital-name').textContent = fiche.nom;
    document.getElementById('vital-subtitle').textContent =
        `${fiche.kin.toUpperCase()} · ${fiche.classe.toUpperCase()}`;
    document.getElementById('vital-level').textContent = fiche.niveau;

    // HP pips (étoiles)
    const hpDisplay = document.getElementById('vital-hp-display');
    hpDisplay.innerHTML = '';
    for (let i = 0; i < fiche.hp_max; i++) {
        const pip = document.createElement('span');
        pip.className = 'hp-pip' + (i < fiche.hp_current ? ' filled' : '');
        hpDisplay.appendChild(pip);
    }

    // Wounds pips (Light/Heavy/Deadly)
    const woundsDisplay = document.getElementById('vital-wounds-display');
    woundsDisplay.innerHTML = '';
    const tiers = ['light', 'heavy', 'deadly'];
    for (const tier of tiers) {
        const pip = document.createElement('span');
        pip.className = 'wound-pip' + (fiche.wounds[tier] > 0 ? ' filled' : '');
        pip.dataset.tier = tier;
        woundsDisplay.appendChild(pip);
    }

    // AP et Défense
    document.getElementById('vital-ap').textContent = fiche.ap_current;
    document.getElementById('vital-defense').textContent = fiche.defense_current;
}

function bindVitalBarActions() {
    document.querySelectorAll('.vital-stat').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            // Pour la Vague 1, on affiche juste un toast.
            // En Vague 2/3, on ouvrira un bottom sheet pour modifier.
            const labels = {
                hp: 'Modifier les Hero Points',
                wounds: 'Modifier les Wounds',
                ap: 'Modifier les Action Points',
                defense: 'Modifier la Défense',
            };
            showToast(`${labels[action] || action} — à venir en Vague 2`);
        });
    });
}


/* ═══════════════════════════════════════════════════════════════
   FAB — bouton dés (placeholder en Vague 1)
   ═══════════════════════════════════════════════════════════════ */
function bindFab() {
    const fab = document.getElementById('fab-dice');
    if (!fab) return;
    fab.addEventListener('click', () => {
        showToast('Lanceur de dés — à venir en Vague 3');
    });
}


/* ═══════════════════════════════════════════════════════════════
   TOAST — petit message éphémère
   ═══════════════════════════════════════════════════════════════ */
let toastTimer = null;
function showToast(message, duration = 1800) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('visible');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('visible');
    }, duration);
}


/* ═══════════════════════════════════════════════════════════════
   INSTALLATION PWA — bouton install + détection plateforme
   ═══════════════════════════════════════════════════════════════ */
let deferredInstallPrompt = null;

function setupInstallFlow() {
    const btnInstall = document.getElementById('btn-install');
    const statusHint = document.getElementById('install-status-hint');
    if (!btnInstall || !statusHint) return;

    // Détection iOS Safari (qui ne supporte pas beforeinstallprompt)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    // Détection si on est déjà en mode standalone (donc déjà installé)
    const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;

    if (isStandalone) {
        statusHint.innerHTML = '✓ <strong>App installée</strong> et lancée en mode plein écran.';
        return;
    }

    if (isIOS) {
        statusHint.innerHTML = "Sur iOS, l'installation se fait manuellement&nbsp;: tap le bouton <strong>Partager</strong> dans Safari, puis <em>«&nbsp;Sur l'écran d'accueil&nbsp;»</em>. Voir détails ci-dessous.";
        return;
    }

    // Par défaut : on attend que le navigateur déclenche beforeinstallprompt
    statusHint.textContent = "Si ton navigateur supporte l'installation, un bouton apparaîtra ici dans quelques secondes.";

    // Écoute l'événement beforeinstallprompt (Android Chrome, Desktop Chrome/Edge)
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredInstallPrompt = e;
        btnInstall.hidden = false;
        statusHint.textContent = "Ton appareil est prêt à installer l'app.";
    });

    // Clic sur le bouton install
    btnInstall.addEventListener('click', async () => {
        if (!deferredInstallPrompt) return;

        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;

        if (outcome === 'accepted') {
            showToast('Installation en cours...');
        } else {
            showToast('Installation annulée');
        }

        deferredInstallPrompt = null;
        btnInstall.hidden = true;
    });

    // Détecte l'installation réussie a posteriori
    window.addEventListener('appinstalled', () => {
        showToast('App installée avec succès !');
        statusHint.innerHTML = '✓ <strong>App installée.</strong>';
        btnInstall.hidden = true;
    });
}


/* ═══════════════════════════════════════════════════════════════
   SERVICE WORKER — enregistrement pour fonctionnement offline
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


/* ═══════════════════════════════════════════════════════════════
   GESTION DES RACCOURCIS PWA (?action=dice / ?action=fiches)
   ═══════════════════════════════════════════════════════════════ */
function handleStartupAction() {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    if (action === 'dice') {
        // En Vague 3, ouvrira directement le lanceur de dés
        showToast('Raccourci dés — bientôt');
    } else if (action === 'fiches') {
        // En Vague 7, ouvrira la liste des fiches
        switchToTab('plus');
        showToast('Raccourci fiches — bientôt');
    }
}


/* ═══════════════════════════════════════════════════════════════
   INIT — point d'entrée principal
   ═══════════════════════════════════════════════════════════════ */
function init() {
    applyTheme(getStoredTheme());
    bindThemeToggle();
    bindTabNavigation();
    bindVitalBarActions();
    bindFab();
    renderVitalBar(FICHE_DEMO);
    setupInstallFlow();
    handleStartupAction();
    registerServiceWorker();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
