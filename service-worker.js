/* ═══════════════════════════════════════════════════════════════
   DRAKONYM COMPAGNON — SERVICE WORKER
   Met en cache les fichiers de l'app pour fonctionnement offline.
   Bumpe la version CACHE_NAME quand tu modifies un fichier source
   pour forcer la mise à jour côté utilisateur.
   ═══════════════════════════════════════════════════════════════ */

const CACHE_NAME = 'drakonym-v1.17.0';

// Fichiers à mettre en cache au premier chargement
const APP_SHELL = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './dragon-bg.webp',
    './dice-roll.mp3',
    './icons/icon-72.png',
    './icons/icon-96.png',
    './icons/icon-128.png',
    './icons/icon-144.png',
    './icons/icon-152.png',
    './icons/icon-192.png',
    './icons/icon-384.png',
    './icons/icon-512.png',
];


/* ─── INSTALL : pré-cache les fichiers de base ────────────── */
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});


/* ─── ACTIVATE : nettoie les vieux caches ─────────────────── */
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});


/* ─── FETCH : stratégie cache-first avec fallback réseau ──── */
self.addEventListener('fetch', event => {
    const req = event.request;

    // Ne traite que les requêtes GET
    if (req.method !== 'GET') return;

    // Stratégie : cache-first pour l'app shell, network-first pour le reste
    event.respondWith(
        caches.match(req).then(cached => {
            if (cached) return cached;

            return fetch(req)
                .then(response => {
                    // Cache uniquement les ressources same-origin valides
                    if (
                        response &&
                        response.status === 200 &&
                        response.type === 'basic'
                    ) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
                    }
                    return response;
                })
                .catch(() => {
                    // Offline et pas en cache : retourne au moins la page principale
                    if (req.destination === 'document') {
                        return caches.match('./index.html');
                    }
                });
        })
    );
});
