---
name: QG
description: Le QG de Stan & Anat, posé sur le plateau de FaceUp Pairs.
colors:
  board: "#1c1c1e"
  rail: "#0e0e0f"
  card: "#000000"
  lift: "#141415"
  ink: "#f5f5f5"
  muted: "#8a8a8e"
  faint: "#5a5a5e"
  hair: "rgb(255 255 255 / 0.14)"
  hair-soft: "rgb(255 255 255 / 0.08)"
  accent: "#0a84ff"
  accent-hover: "#3395ff"
  danger: "#ff6b6b"
  green: "#b5f3c7"
  purple: "#b79cff"
  blue: "#8ccbff"
  gold: "#f8ca5a"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Display, system-ui, Roboto, Segoe UI, sans-serif"
    fontSize: "26px"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Display, system-ui, Roboto, Segoe UI, sans-serif"
    fontSize: "17px"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, system-ui, Roboto, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, system-ui, Roboto, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.45
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, system-ui, Roboto, Segoe UI, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.4
  mono:
    fontFamily: "ui-monospace, SF Mono, SFMono-Regular, Menlo, monospace"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  tile: "12px"
  segment: "9px"
  control-sm: "10px"
  control: "12px"
  pill: "9999px"
spacing:
  board-gap: "8px"
  tile-pad-sm: "14px"
  tile-pad: "16px"
  page-x-sm: "16px"
  page-x: "32px"
  section: "48px"
components:
  button:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "36px"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "36px"
  button-sm:
    rounded: "{rounded.control-sm}"
    padding: "0 10px"
    height: "30px"
  button-icon:
    rounded: "{rounded.control-sm}"
    size: "32px"
  field:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "38px"
  field-sm:
    rounded: "{rounded.control-sm}"
    padding: "0 10px"
    height: "30px"
  tile:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
    padding: "{spacing.tile-pad}"
  segmented-track:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.control}"
    padding: "4px"
  segmented-active:
    backgroundColor: "{colors.ink}"
    textColor: "#000000"
    rounded: "{rounded.segment}"
    height: "32px"
  chip:
    backgroundColor: "{colors.hair-soft}"
    textColor: "{colors.muted}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  nav-item:
    textColor: "{colors.muted}"
    rounded: "{rounded.control-sm}"
    padding: "0 10px"
    height: "36px"
  nav-item-active:
    backgroundColor: "{colors.hair-soft}"
    textColor: "{colors.ink}"
---

# Design System: QG

## Overview

**Creative North Star: "Le plateau de jeu"**

QG est posé sur le plateau de FaceUp Pairs. Le fond est le plateau gris anthracite, chaque app est une carte noire carrée posée dessus, arrondie à 12px comme les contrôles, sans bordure ni ombre, séparée des autres par 8px de plateau. Tout ce qui se manipule (boutons, champs, onglets, navigation) parle un autre langage : arrondi, natif, discret. Le contraste entre ces deux langages, cartes droites et contrôles ronds, est la structure de tout l'outil ; les deux ne convergent jamais.

La densité est celle d'un outil de travail ouvert plusieurs fois par jour : corps de texte 14px, labels 12px, listes de tâches en rangées de 48px, aucun ornement. La couleur est quasi absente : noir, anthracite et deux gris portent l'interface ; le bleu système n'apparaît que sur l'action principale ; les quatre pastels FaceUp servent uniquement de signaux (statut, personne, priorité, couleur d'app). Le seul moment théâtral est le retournement 3D d'une carte d'accès pour révéler un mot de passe, comme une carte du jeu.

Rejet confirmé : le dashboard SaaS à widgets arrondis, ombres portées, dégradés et halos.

**Key Characteristics:**
- Plateau `#1C1C1E`, cartes `#000000` arrondies à 12px, sans bordure, gap 8px.
- Contrôles arrondis 12px (10px en petit), fond noir et filet blanc 14 %.
- Un seul bleu, pour l'action principale seulement.
- Pastels FaceUp réservés aux signaux, jamais en aplat sur une carte.
- Police système, aucune police chargée.
- Plat : aucun dégradé, aucun glow, aucune ombre au repos.

## Colors

Une palette quasi monochrome sur laquelle un bleu système unique et quatre pastels de signal ressortent par rareté.

### Primary
- **Bleu système** (accent) : fond du bouton principal (« Nouvelle app », « Ajouter un accès », « Entrer »), anneau de focus, caret, sélection de texte (à 45 %), bordure de champ au focus, cases à cocher du markdown. Un seul bouton principal par vue. Survol : **Bleu système éclairci** (accent-hover).

### Secondary
- **Vert menthe** (green) : statut « En prod », couleur d'app.
- **Violet lilas** (purple) : statut « Idée », pastille d'Anat, couleur d'app.
- **Bleu ciel** (blue) : statut « En dev », tâche « En cours », pastille de Stan, liens dans les notes, couleur d'app.
- **Or** (gold) : priorité haute (flèche + compteur), échéance proche, couleur d'app de « Commun ».

### Tertiary
- **Rouge corail** (danger) : échéance dépassée, erreur du code d'entrée, texte des boutons destructifs. Texte seulement, jamais en aplat.

### Neutral
- **Plateau** (board) : fond de toutes les pages. Jamais noir pur.
- **Rail** (rail) : fond du rail latéral desktop et de la barre d'onglets mobile, un cran sous le plateau.
- **Carte** (card) : fond des cartes d'app, cartes d'accès, listes de tâches, formulaires, et fond des contrôles.
- **Relief** (lift) : blocs de code dans les notes, seul fond « soulevé » à l'intérieur d'une carte.
- **Encre** (ink) : titres, valeurs, texte courant ; aussi fond du segment d'onglet actif.
- **Gris** (muted) : labels, métadonnées, compteurs, éléments de navigation au repos.
- **Gris effacé** (faint) : information tertiaire (« 3/7 », compteurs d'onglets inactifs, champ vide).
- **Filet** (hair) : bordure des contrôles au repos.
- **Filet doux** (hair-soft) : séparateurs de listes, bordure du rail, fond des puces et de l'item de navigation actif.

### Named Rules
**The Un Seul Bleu Rule.** Le bleu système marque l'action principale de la vue et l'état de focus, rien d'autre. Jamais en texte décoratif, jamais sur une carte.

**The Pastel = Signal Rule.** Les quatre pastels identifient un statut, une personne, une priorité ou une app : pastille de 6px, texte, liseré de 2-3px sous l'icône d'app. Jamais en fond de carte, jamais en dégradé, jamais en halo.

## Typography

**Display Font:** police système (-apple-system / SF Pro, repli Roboto, Segoe UI)
**Body Font:** police système, identique
**Label/Mono Font:** ui-monospace / SF Mono pour les mots de passe et le code

**Character:** La police du système, comme dans le jeu : aucune police chargée, la hiérarchie vient uniquement du poids (500 à 800) et de la taille. C'est un engagement de marque explicite hérité de FaceUp Pairs.

### Hierarchy
- **Display** (800, 26px, interlettrage -0.02em) : titre de page (« Vos apps », nom d'app, « QG » à l'entrée). 24px sur mobile pour les noms d'app longs.
- **Headline** (800, 17px, -0.01em) : titres de section (« À faire maintenant ») et marque « QG » du rail.
- **Title** (700, 15px ; 16px sur la carte d'app en sm+) : nom sur une carte, titre de carte d'accès ou de formulaire. Les en-têtes de groupe (13px, 700, suivis d'un compteur gris) en sont la variante compacte.
- **Body** (500, 14px, interligne 1.45) : texte courant, titres de tâches, sous-titres de page en gris. Notes en markdown : 14px, interligne 1.6, 72ch max.
- **Label** (600, 12px) : labels de champ, statuts, métadonnées de carte, compteurs. Casse normale, jamais en capitales.
- **Mono** (500, 13px) : mots de passe masqués (interlettrage 0.2em) ; mot de passe révélé à 19px.

### Named Rules
**The Chiffres Alignés Rule.** Tout compteur, coût ou progression utilise des chiffres tabulaires (`tabular-nums`).

**The Casse Normale Rule.** Aucun texte en capitales, aucun sur-titre au-dessus d'un titre : un titre est seul, suivi au plus d'un sous-titre gris.

## Layout

Rail latéral fixe de 248px à gauche sur desktop (md+), remplacé sur mobile par une barre d'onglets fixe en bas (4 entrées, 56px + zone de sécurité). Zone de contenu centrée, 1180px max, marges 16px (mobile) / 32px (sm+), 40px en haut sur desktop.

Le plateau des apps est une grille de cartes carrées (ratio 1:1 strict) : 2 colonnes, 3 en sm, 4 en lg, 5 en xl, gap 8px partout. Les cartes d'accès suivent la même grille à 8px (1, 2 puis 3 colonnes). Le kanban passe en carrousel horizontal à accroche sur mobile (colonnes à 82vw), en 3 colonnes égales sur sm+. Les sections se séparent par 48px ; en-tête de page à 24px du contenu.

**The Gap du Plateau Rule.** Entre deux cartes, toujours 8px de plateau visible, jamais de bordure pour les séparer.

## Elevation & Depth

Système plat. La profondeur vient uniquement du contraste de tons : rail (`#0E0E0F`) sous plateau (`#1C1C1E`), cartes noires posées sur le plateau, filets blancs translucides pour séparer les rangées. Aucune ombre au repos. Seuls mouvements verticaux : la carte d'app monte de 2px au survol (et son emoji grossit à 110 %), et la barre d'onglets mobile est translucide (95 %, flou d'arrière-plan) puisque le verre est réservé à la navigation.

### Named Rules
**The Plateau Plat Rule.** Aucune ombre portée, aucun dégradé, aucun glow sur une carte ou un contrôle. Le relief se lit par le ton (plateau, carte, relief) et par un déplacement de 2px au survol.

## Shapes

Un seul arrondi, décidé par Stan le 2026-09-30 (écart assumé avec FaceUp Pairs, où les cartes sont à radius 0) : tout ce qui est contenu (carte d'app, carte d'accès, liste de tâches, formulaire, carte kanban) est arrondi à 12px comme les boutons, sans bordure ; les petits éléments (icône d'app, case à cocher) à 6px, la vignette d'emoji du sélecteur à 10px. Tout ce qui se manipule est arrondi : 12px pour boutons, champs et piste d'onglets ; 10px pour les petites tailles, boutons-icônes et items du rail ; 9px pour le segment actif ; capsule pour les puces de plateforme et de catégorie ; cercle pour les pastilles de personne et de statut.

Les cartes portent deux marques à leur base, toujours au bord inférieur, pleine largeur : la barre de progression de 3px (encre à 70 % sur blanc 6 %) sur les cartes d'app, et le liseré de couleur d'app (2-3px) sous l'icône d'app.

**The Un Seul Arrondi Rule.** Aucun angle droit dans l'app : blocs et contrôles partagent le radius 12px (10px en petit, 6px pour les mini-éléments). Un coin carré casse le système.

## Components

### Buttons
Natifs et retenus : noirs, filet clair, arrondis.
- **Shape:** coins arrondis (12px), hauteur 36px, padding horizontal 14px, texte 13px 600.
- **Primary:** fond bleu système, texte blanc 700, sans bordure. Une seule instance par vue, en haut à droite de l'en-tête de page ou de la barre d'outils.
- **Hover / Focus:** le filet passe de 14 % à 28 % de blanc (le primaire s'éclaircit) ; transitions 150ms sur fond, bordure, opacité. Focus clavier : anneau bleu 2px décalé de 2px. Désactivé : opacité 45 %.
- **Ghost:** transparent, texte gris ; au survol, texte encre sur fond blanc 6 %. Utilisé pour annuler, cacher, et les actions en ligne.
- **Small / Icon:** 30px de haut (radius 10px, texte 12px) ; bouton-icône carré de 32px à radius 10px, icône Lucide 14-16px.
- **Danger:** bouton standard dont le texte passe en rouge corail.

### Chips
- **Style:** capsule, fond blanc 8 %, texte 11px 600 gris (plateformes iOS/Android, catégories de service).
- **State:** informatives seulement, pas d'état sélectionné.

### Cards / Containers
- **Corner Style:** arrondi 12px.
- **Background:** noir `#000000`, identique dans tous les états.
- **Shadow Strategy:** aucune (voir Elevation & Depth).
- **Border:** aucune. Les rangées internes se séparent par un filet doux.
- **Internal Padding:** 14px (mobile) / 16px ; listes en rangées de 48px min, padding 12px.

### Inputs / Fields
- **Style:** fond noir, filet 14 %, coins arrondis (12px), hauteur 38px, texte 14px ; petite taille 30px à radius 10px. Les selects portent un chevron gris dessiné. Label au-dessus, 12px 600 gris, 6px d'écart.
- **Focus:** bordure bleu système, sans halo. Survol : filet à 24 %.
- **Error / Disabled:** message d'erreur en texte rouge corail sous le champ.

### Navigation
- **Rail (desktop):** fond rail, filet doux à droite. Marque (logo + « QG » 17px 800 + « Stan & Anat » gris), puis sections (Vue d'ensemble, Tâches, Accès, Stack) et liste des apps, chacune avec icône d'app 22px. Items de 36px, radius 10px, 13.5px 600 ; repos gris, survol fond blanc 4 %, actif fond blanc 8 % et texte encre. Compteurs à droite en 12px gris tabulaire.
- **Barre d'onglets (mobile):** fixe en bas, rail à 95 % flouté, 4 colonnes, icône 20px au-dessus d'un label 11px 600 ; actif en encre, repos en gris.

### Segmented Control
Onglets d'une app (Tâches, Accès, Stack, Notes) et bascule Liste/Kanban : piste noire à radius 12px entourée d'un filet doux, padding 4px (2px en petit) ; segment actif fond encre et texte noir (radius 9-10px), segments inactifs gris. Repris du sélecteur `Segmented` du jeu.

### App Tile (signature)
Carte carrée noire : statut en haut à gauche (pastille pastel 6px + label), compteur de priorité haute en or à droite, emoji centré à 44px (52px en sm+), nom et avancement (« 4 à faire · 3/7 ») en bas, barre de progression de 3px au bord inférieur. Au survol, la carte monte de 2px et l'emoji grossit, avec la courbe expo (cubic-bezier(0.16, 1, 0.3, 1)). La carte « Ajouter une app » est la même carte vide avec un plus et un label gris.

### Credential Flip (signature)
Révéler un mot de passe retourne la carte d'accès en 3D (perspective 1400px, 520ms, courbe expo). Face avant : service, domaine, identifiant et mot de passe masqué ; dos : mot de passe en mono 19px sélectionnable, bouton copier, « Cacher ». Aucune bordure, aucune couleur pendant la rotation ; mouvement désactivé si réduction des animations demandée.

## Do's and Don'ts

### Do:
- **Do** poser tout contenu sur une carte noire arrondie à 12px, séparée des autres par 8px de plateau.
- **Do** arrondir tous les contrôles : 12px, ou 10px en petite taille.
- **Do** réserver le bleu système à un seul bouton principal par vue et à l'anneau de focus.
- **Do** coder statut, personne et priorité par les pastels FaceUp en pastille ou en texte, et identifier une app par son emoji et son liseré de couleur.
- **Do** utiliser la police système et hiérarchiser par le poids (500, 600, 700, 800).
- **Do** animer avec la courbe expo (cubic-bezier(0.16, 1, 0.3, 1)) et couper le mouvement en `prefers-reduced-motion`.

### Don't:
- **Don't** arrondir une carte ni ajouter de bordure à une carte, même pendant le retournement.
- **Don't** utiliser de dégradé, de glow ou d'ombre portée sur une carte ou un contrôle.
- **Don't** mettre un pastel en fond de carte ni colorer une carte selon son app.
- **Don't** utiliser le bleu système en texte décoratif ou sur plusieurs boutons d'une même vue.
- **Don't** charger une police personnalisée.
- **Don't** écrire de sur-titre ni de texte en capitales au-dessus d'un titre.
