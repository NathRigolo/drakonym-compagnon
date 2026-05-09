# Drakonym Compagnon

> Compagnon mobile et desktop pour gérer ta fiche de personnage **Drakonym** en pleine session de jeu de rôle.

🎲 **App live** : [https://nathrigolo.github.io/drakonym-compagnon/](https://nathrigolo.github.io/drakonym-compagnon/)

---

## 🐉 Pour qui ?

Pour les groupes francophones qui jouent à **Drakonym** (Crossed Paths Press, 2025), notamment ceux qui n'ont pas envie de jongler avec un PDF en anglais et une fiche papier pendant la partie. L'app est entièrement traduite en français, fonctionne hors-ligne, et se synchronise sur ton téléphone, ta tablette ou ton PC.

## ✨ Ce qu'elle fait

### Au quotidien
- **Fiches multi-personnages** : crée plusieurs persos, switch en un tap, exporte en JSON pour partager
- **Vital Bar permanent** : HP, Blessures (Légères / Graves / Mortelles), AP, Defense toujours visibles
- **Pools de ressources** : Mana, Grit, Defense Slots avec compteurs interactifs
- **Statuts officiels** : les 16 statuts du Core Rulebook traduits, avec descriptions
- **Repos courts** : compteur quotidien
- **Hero Points** : démarrage à 1, max 3 (extensible avec Deep Reserves)

### En combat
- **Lanceur de dés intelligent** :
  - Sélection 1 ou 2 attributs avec doublement automatique
  - Mode attaque : Primary + Bonus arme avec validation Min Body
  - Boons / Banes avec compensation
  - Dé Shadow (résultats narratifs)
  - Difficulté ajustable (Trivial → Mythique)
- **Bouton Attaquer direct** sur chaque arme : pré-remplit le dice modal avec les bons bonus
- **Sidebar Équipé** (desktop) : vue permanente des armes/armures équipées, Spell Bonus calculé, attaque en 1 clic
- **Log de dés permanent** : 6 derniers jets visibles avec codes couleur succès/échec, historique complet sauvegardé

### Dragon
- **Fiche dragon dédiée** : Pillars (Love / Fear / Instinct), BP, niveau d'âge
- **Souffle dragon** : description, élément, forme, charges
- **Équipement dragon** : armes naturelles, armures, perks séparés du joueur

### Apparence
- 3 thèmes : **Parchemin** (clair, livre ancien) / **Nuit dorures** (sombre, soirée JDR) / **Auto** (suit le système)
- Image de fond dragon en arrière-plan, intensité adaptée au thème
- Layout 3 zones sur desktop, mobile-first sur téléphone
- Sidebar droite cachable pour les écrans plus étroits

### Pratique
- **PWA installable** : ajoute l'app sur ton écran d'accueil iOS/Android, ouvre-la comme une vraie appli
- **100% offline** : une fois chargée, fonctionne sans connexion via Service Worker
- **Données locales** : tout reste sur ton appareil (localStorage), aucun serveur, aucun compte
- **Export / Import JSON** : partage tes fiches avec ton groupe en un fichier

---

## 📲 Installer l'app

### Sur iPhone / iPad
1. Ouvre [l'app dans Safari](https://nathrigolo.github.io/drakonym-compagnon/)
2. Tape l'icône **Partager** (carré + flèche)
3. Choisis **Sur l'écran d'accueil**
4. L'app s'installe comme une appli native

### Sur Android
1. Ouvre [l'app dans Chrome](https://nathrigolo.github.io/drakonym-compagnon/)
2. Un bandeau **« Installer l'app »** apparaît, ou ouvre le menu ⋮ → **Installer l'app**

### Sur PC (Chrome / Edge)
1. Ouvre [l'app](https://nathrigolo.github.io/drakonym-compagnon/)
2. Icône **Installer** dans la barre d'URL, ou Plus → Installation manuelle

---

## 🚀 Démarrage rapide

1. **Ouvre l'app** : un personnage vide est créé automatiquement
2. **Configure-le** : nom, niveau, kin (race), classe, attributs, primary
3. **Ajoute ton équipement** : utilise les presets officiels ou crée tes propres armes/armures
4. **Équipe ce que tu portes** : bouton Équiper sur chaque item
5. **Ouvre l'onglet Dragon** : configure les Pillars, le Souffle, le BP
6. **En partie** : lance les dés avec le bouton FAB ou la sidebar, attaque en 1 tap depuis la sidebar Équipé

### Importer la fiche démo

Pour tester l'app avec un perso déjà rempli :
1. Télécharge le fichier `drakonym_demo_kira.json`
2. Ouvre l'app → onglet **Plus → Sauvegarde & transfert → Importer**
3. Choisis le fichier
4. Tu as maintenant **Kira la Pyromancienne** niveau 3 avec son dragon Pyrolore, équipement, sorts, perks et historique complets.

---

## 🛠️ Technique

### Stack
- **HTML / CSS / JavaScript vanilla** — aucune dépendance externe
- **Service Worker** pour le mode offline
- **PWA Manifest** pour l'installation
- **localStorage** pour la persistance multi-fiches

### Structure
```
drakonym-compagnon/
├── index.html              Structure de l'app
├── style.css               Thèmes + layout responsive
├── app.js                  Logique complète (~4900 lignes)
├── manifest.json           PWA manifest
├── service-worker.js       Cache offline
├── dragon-bg.webp          Image de fond
├── icons/                  Icônes PWA (12 fichiers)
└── README.md               Ce fichier
```

### Hébergement
Déployé via **GitHub Pages** depuis la branche `main`. Le dépôt est public.

---

## 🎨 Crédits

### Image de fond
**Black Dragon** par **mythologyart**, gracieusement mise à disposition via [Pixabay](https://pixabay.com/illustrations/mythology-art-black-dragon-8808267/) sous licence libre d'utilisation.

### Polices
- **Cinzel** (titres) — Google Fonts
- **EB Garamond** (texte) — Google Fonts
- **Spectral** (notes) — Google Fonts

---

## ⚖️ Licence

Drakonym Compagnon est un produit indépendant publié sous la [Drakonym Creator License (DCL)](https://www.crossedpaths.co.uk/drakonym-creator). Il n'est **pas affilié à ni endossé par Crossed Paths Press**.

> Drakonym™, Akeroth™, et le système Runebinder™ sont © 2025 Crossed Paths Press.

Pour acheter le **Core Rulebook officiel** : [crossedpaths.itch.io/drakonym](https://crossedpaths.itch.io/drakonym)
Compendium en ligne : [sanctum.crossedpaths.co.uk/drakonym](https://sanctum.crossedpaths.co.uk/drakonym/)

---

## 💌 Retours

Tu trouves un bug ? Tu veux une feature ? Tu joues à Drakonym et tu veux en discuter ? Ouvre une [issue sur GitHub](https://github.com/nathrigolo/drakonym-compagnon/issues).

Bon jeu, et que ton dragon vole haut. 🐉
