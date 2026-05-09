# 🐉 Drakonym Compagnon — Vague 2 (v1.1.0)

App mobile-first PWA pour gérer ta fiche Drakonym en pleine session.

## 🆕 Nouveautés v1.1.0 (Vague 2)
- 📜 **Onglet Fiche complet** : identité, attributs (Soul mis en valeur Primary), Mana/Grit avec barres, Hero Points, Statuses
- 📲 **Bottom sheets** : tap sur HP/Wounds/AP/Defense/Mana/Grit/HP → modale glissante avec +/− pour modifier
- 🏷️ **16 statuses officiels** : Bloodied, Burning(intensité), Frightened(intensité), etc. Bouton "+ ajouter" ouvre un sélecteur
- 💤 **Short Rest** : bouton dédié qui applique automatiquement la règle officielle (Heavy → Light, Light → 0, refill ressources de 3 + ⌈niveau/2⌉)
- 💾 **Persistance localStorage** : tous tes changements sont sauvés automatiquement, sous la clé `drakonym_compagnon_v1`

## 📦 Contenu de la Vague 1

Cette première vague pose le **squelette PWA installable** :

- ✅ Manifest PWA + service worker (offline)
- ✅ Vital Bar fonctionnelle (Tharion lvl 5, données de démo)
- ✅ Navigation entre les 5 onglets (Fiche · Capacités · Équip. · Dragon · Plus)
- ✅ Toggle de thème (Parchemin / Nuit / Auto) persisté
- ✅ FAB lanceur de dés (placeholder cliquable)
- ✅ Onglet "Plus" avec settings de thème + footer DCL
- ✅ Icônes PNG générées (toutes tailles, dont maskable Android)

Tout le reste affiche un placeholder **"à venir en Vague X"**. Les vagues suivantes :
- Vague 2 : Onglet Fiche complet (attributs, mana, grit, hero points, statuses)
- Vague 3 : Lanceur de dés (config + résultat avec Boon interactif)
- Vague 4 : Onglet Capacités (Perks / Sorts / Techniques / Wild)
- Vague 5 : Onglet Équipement (armes / armure / outils / draviks)
- Vague 6 : Onglet Dragon (identité, Bond Points, Breath Weapon)
- Vague 7 : Multi-fiches + import/export JSON + Histoire

---

## 🚀 Installation locale (test sur PC)

1. Décompresse l'archive dans `C:\Users\graas\Desktop\drakonym-compagnon\`.
2. Ouvre PowerShell dans ce dossier (Shift + clic droit → "Ouvrir une fenêtre PowerShell ici").
3. Lance un petit serveur HTTP local :
   ```
   python -m http.server 8000
   ```
   (si Python n'est pas installé : `npx serve` ou installe Python depuis python.org)
4. Ouvre dans ton navigateur : `http://localhost:8000`

> 💡 **Pourquoi un serveur local ?** Les service workers (offline) et le manifest PWA ne fonctionnent pas en `file:///`. Il faut un vrai serveur HTTP, même local.

---

## 🌐 Déploiement sur GitHub Pages

1. Crée un nouveau repo GitHub : **`drakonym-compagnon`** (peut être public ou privé peu importe pour Pages).
2. Push tous les fichiers du dossier à la racine du repo.
3. Va dans **Settings → Pages** :
   - **Source** : `Deploy from a branch`
   - **Branch** : `main` (ou `master`), dossier `/ (root)`
   - **Save**
4. Attends 1-2 minutes. Ton URL sera : **`https://nathrigolo.github.io/drakonym-compagnon/`**

---

## 📲 Installation sur tes appareils

### iPhone / iPad (Safari uniquement)
Apple **ne propose JAMAIS** de bannière d'install automatique. C'est manuel :
1. Ouvre l'URL dans **Safari** (pas Chrome iOS qui ne gère pas l'install PWA correctement).
2. Tap le bouton **Partager** ⤴ (carré avec flèche vers le haut).
3. Fais défiler les options et choisis **« Sur l'écran d'accueil »**.
4. Confirme avec **« Ajouter »**.

L'icône D dorée apparaît sur ton écran d'accueil. Tu peux la déplacer comme n'importe quelle autre app.

### Android (Chrome)
Deux possibilités selon le navigateur :
- Une bannière **« Installer Drakonym Compagnon ? »** apparaît automatiquement (souvent au bout de quelques secondes d'utilisation).
- Sinon : menu ⋮ en haut à droite → **« Installer l'application »** ou **« Ajouter à l'écran d'accueil »**.

### PC (Chrome / Edge)
- Une **petite icône d'installation** ⊕ apparaît dans la barre d'adresse, à droite de l'URL. Clique dessus → confirme.
- Si invisible : menu ⋮ → **« Installer Drakonym Compagnon »**.

### Bouton "Installer" dans l'app
L'app embarque aussi un **bouton install** dans l'onglet **« Plus »** qui marche sur Chrome/Edge desktop et Android. Sur iOS le bouton n'apparaît pas (limitation Apple) mais l'app affiche les instructions à suivre.

### Firefox
Pas de support PWA install natif. Tu peux quand même utiliser l'app dans le navigateur, mais sans icône sur l'écran d'accueil.

---

## 🔄 Mettre à jour l'app après modifs

1. Modifie tes fichiers en local (Notepad++).
2. Push sur GitHub.
3. **Bumpe la version dans `service-worker.js`** :
   ```js
   const CACHE_NAME = 'drakonym-v1.0.1'; // était v1.0.0
   ```
   Ça force le navigateur à invalider le vieux cache et tirer la nouvelle version.
4. Rouvre l'app : la mise à jour est appliquée à la prochaine visite.

---

## 🗂️ Structure des fichiers

```
drakonym-compagnon/
├── index.html              # structure HTML
├── style.css               # theming clair/sombre + layout
├── app.js                  # logique JS (nav, thème, vital bar)
├── manifest.json           # déclaration PWA
├── service-worker.js       # cache offline
├── README.md               # ce fichier
└── icons/                  # icônes PWA toutes tailles
    ├── icon-72.png
    ├── icon-96.png
    ├── icon-128.png
    ├── icon-144.png
    ├── icon-152.png
    ├── icon-192.png
    ├── icon-192-maskable.png
    ├── icon-384.png
    ├── icon-512.png
    ├── icon-512-maskable.png
    ├── shortcut-dice.png
    └── shortcut-fiches.png
```

---

## ⚖️ Mention légale

Drakonym Compagnon is an independent product published under the
[Drakonym Creator License (DCL)](https://www.crossedpaths.co.uk/drakonym-creator)
and is not affiliated with or endorsed by Crossed Paths Press.
Drakonym™, Akeroth™, and the Runebinder™ System are © 2025 Crossed Paths Press.
