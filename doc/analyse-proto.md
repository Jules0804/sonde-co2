# Prototype vs Production — comparaison et stratégie de refonte

> Le projet contient **deux firmwares distincts** pour la même carte (Wemos S2 Mini) :
>
> - **PROTOTYPE** — `06 - LOGICIEL EMBARQUE/firmware-esp32/tests-materiel/wifi_ap_web/`
>   (Arduino/PlatformIO, `main.cpp` monolithique, ~640 lignes). **C'est la version la plus
>   avancée en fonctionnalités : elle compile, se flashe et fonctionne réellement sur la
>   carte** (procédure `install.md`).
> - **PRODUCTION (cible)** — `06 - LOGICIEL EMBARQUE/firmware-esp32/main` + `components/`
>   (ESP‑IDF, 20 composants, architecture hexagonale). **Version propre destinée à la
>   production, mais encore à l'état de squelette : ne compile pas, jamais exécutée.**
>
> Ce document compare ce qui est **bien implémenté côté production** et ce qui **manque
> par rapport au prototype**, puis conclut sur la stratégie : **réutiliser l'ébauche
> production ou repartir du prototype ?**
>
> Voir aussi : `analyse-old.md` (production détaillée), `analyse-two.md` (projet global),
> `refonte-one.md` (plan de refonte).

---

## 1. Nature des deux versions

| | **Prototype `wifi_ap_web`** | **Production `main` + `components`** |
|---|---|---|
| Framework | Arduino (PlatformIO) | ESP‑IDF (CMake) |
| Structure | 1 fichier `main.cpp` monolithique | 20 composants, ports & adapters |
| Compile ? | ✅ Oui | ❌ Non (bug `array<4>→array<8>`) |
| Tourne sur carte ? | ✅ Oui (validé `install.md §20`) | ❌ Jamais exécuté |
| Rôle | Preuve de fonctionnement matériel | Base d'architecture pour le produit final |
| Parité simulateur | ❌ Aucune | ✅ Vecteurs golden (cœur validé) |
| Testabilité hors carte | ❌ Non | ✅ Noyau pur testable sur hôte |

**Résumé en une phrase** : le prototype a **l'intégration qui marche mais un design
jetable** ; la production a **le bon design mais aucune intégration qui tourne**.

---

## 2. Ce qui est BIEN implémenté dans la version production

Ce sont des **implémentations propres, souvent supérieures au prototype** — mais présentes
sous forme de **logique pure / contrats**, validées par les vecteurs, **pas encore
intégrées au matériel**.

- **Régulation évoluée (`control_core`)** — PI avec **filtre passe‑bas (τ=60 s)**, **rampes**
  montée/descente, **anti‑windup** par gel conditionnel de l'intégrale, machine à états
  `STARTUP/AUTO/FORCE_OPEN/FAULT`, seuils (plage 350–5000 ppm, alarme 1500 ppm/60 s, timeout
  sonde 30 s). **Parité exacte avec le simulateur** (vecteurs golden). *Nettement plus riche
  et sûr que le proportionnel linéaire du prototype.*
- **Persistance config robuste (`config_store`)** — double copie **A/B redondante**, magic
  `VCO2`, **CRC32**, génération série (rollover géré), écriture ping‑pong, détection no‑op
  anti‑usure flash, gestion des corruptions/conflits. *Le prototype n'a qu'une copie NVS
  simple (`Preferences`) sans intégrité ni redondance.*
- **Journal binaire (`history_log`)** — enregistrements 24 o / 32 o, **CRC16**, coalescence
  d'événements, **liste blanche stricte (sans PII)**, dimensionnement flash. *Prévu pour
  persistance ; le prototype garde l'historique en RAM uniquement.*
- **Sécurité réelle (`local_auth`, `credential_store`)** — sessions opaques 256 bits, **CSRF**,
  **rôles hiérarchiques** (viewer/installer/admin), expiration 15 min, verrou anti‑bruteforce
  (5 échecs/30 s), **comparaison à temps constant**, record d'identifiant versionné (sel +
  vérificateur 32 o + CRC32). *Le prototype a une auth **factice** (mot de passe vérifié
  uniquement côté navigateur).* 
- **Contrat HTTP complet (`http_api_contract` + garde/plan/handlers/payloads/response)** —
  **11 routes `/api/v1`** alignées sur l'OpenAPI et la PWA, concurrence optimiste
  (`If‑Match`/révision), en‑têtes de sécurité/CSP, validation stricte des corps JSON. *Le
  prototype expose une API maison simplifiée (`/api/status`, `/api/settings`…).* 
- **Mode service (`service_mode`)** — machine à états bouton 3 s / fenêtre Wi‑Fi 15 min,
  invalidation de sessions, retries. *Le prototype laisse le Wi‑Fi **toujours actif**.* 
- **Contrats & pilotes purs (`hardware_contracts`, `lot1_drivers`)** — protocole SCD41
  (CRC8 Sensirion, décodage), trames DAC 12 bits. *Équivalents mais découplés et testables.*
- **Architecture** — séparation **noyau pur / effets de bord**, **testable sur hôte**,
  conforme au document d'architecture système. *Le prototype est monolithique.*

> **En clair** : la production détient déjà **le “quoi” difficile** (algorithmes sûrs,
> sécurité, contrat, persistance robuste), et il est **validé par la spécification
> exécutable**. C'est un capital réel.

---

## 3. Ce qui MANQUE dans la production par rapport au prototype

Le prototype **fait réellement fonctionner la carte de bout en bout**. La production, non.
Voici tout ce que le prototype possède et que la production **n'a pas encore** :

| Capacité (présente dans le prototype) | État côté production |
|---|---|
| **Compile** | ❌ Bug bloquant `lot1_drivers.cpp:66` |
| **`app_main` câblé + boucle** (setup/loop) | ❌ `app_main` tourne « à blanc » (entrée sonde forcée invalide) |
| **Lecture I²C réelle du SCD41** (dans la boucle) | ❌ `esp32_i2c_port`/`sensor_cycle` existent mais **non appelés** par `main` |
| **Écriture I²C réelle du DAC** (dans la boucle) | ❌ `actuator_output` produit une trame mais **rien ne l'émet** |
| **Point d'accès Wi‑Fi démarré** (`softAP`) | ❌ Aucune orchestration Wi‑Fi câblée |
| **Serveur HTTP qui répond** (`WebServer`) | ❌ `http_server_app` produit un « plan », **aucun `esp_http_server`** ne l'exécute |
| **Interface web servie** (HTML embarqué) | ❌ **Aucun asset PWA embarqué** dans le firmware |
| **Persistance NVS réelle** (`Preferences`) | ❌ `config_store` **sérialise seulement** ; aucun accès NVS |
| **Portail captif / DNS** | ❌ Absent |
| **Export CSV** (`/api/history.csv`) | ❌ Absent (API JSON seulement) |
| **Adresse DAC correcte (`0x5F`)** | ❌ Code en dur à `0x58` (faux pour le banc) |
| **Diagnostic série** (états, `write=OK`) | ❌ Seulement un log « à blanc » |
| **Fonctionnement démontré sur carte** | ❌ Jamais exécuté |

> **En clair** : il manque à la production **tout le “comment ça tourne”** — les
> **adaptateurs** (I²C, Wi‑Fi, HTTP, NVS, LittleFS), le **câblage `app_main` + boucle
> FreeRTOS**, la **PWA embarquée**, et la **preuve matérielle**. C'est précisément le travail
> d'intégration que le prototype a déjà réalisé (en plus simple).

---

## 4. Comparaison fonctionnelle, capacité par capacité

Légende : ✅ implémenté et fonctionnel · 🟡 conçu mais non intégré · ❌ absent · ⚠️ présent mais faible.

| Fonction | Prototype | Production | Meilleure conception |
|---|:--:|:--:|:--:|
| Compilation / flash | ✅ | ❌ | Prototype |
| Boucle temps réel sur carte | ✅ | ❌ | Prototype |
| Lecture SCD41 (I²C réel) | ✅ | 🟡 | Prototype (intégré) / Prod (design) |
| Écriture DAC 0–10 V (I²C réel) | ✅ | 🟡 | Prototype (intégré) |
| Loi de régulation | ⚠️ proportionnel simple | 🟡 PI+filtre+rampe+anti‑windup | **Production** |
| Adresse DAC | ✅ `0x5F` | ❌ `0x58` | Prototype |
| Point d'accès Wi‑Fi | ✅ (toujours actif) | 🟡 mode service 3 s/15 min | **Production** (design) |
| Serveur HTTP | ✅ `WebServer` | 🟡 plan sans exécuteur | Prototype (intégré) |
| Interface web | ✅ HTML embarqué | ❌ non embarquée | Prototype (présent) / Prod (PWA 07 à embarquer) |
| API | ⚠️ maison | 🟡 OpenAPI `/api/v1` | **Production** |
| Authentification | ⚠️ factice (client) | 🟡 sessions/CSRF/rôles/temps constant | **Production** |
| Persistance config | ⚠️ NVS simple | 🟡 A/B + CRC32 + anti‑usure | **Production** |
| Historique | ✅ RAM 288 pts/5 min | 🟡 binaire CRC16 (LittleFS prévu) | **Production** (design) |
| Export CSV | ✅ | ❌ | Prototype |
| Mode service (bouton) | ❌ | 🟡 3 s/15 min | Production |
| Parité simulateur / tests | ❌ | 🟡 vecteurs golden | **Production** |
| Watchdog matériel (10 V) | ❌ | ❌ | *ni l'un ni l'autre (à créer)* |
| OTA A/B + rollback | ❌ | 🟡 partitions prévues, code absent | Production (design) |
| Testabilité hors carte | ❌ | ✅ noyau pur | **Production** |

**Lecture** : le prototype gagne sur **l'intégration et la preuve matérielle** ; la
production gagne sur **la conception, la sûreté, la sécurité, la testabilité et la
conformité au contrat**. Les deux sont **complémentaires**, pas concurrents.

---

## 5. Analyse : réutiliser l'ébauche production, ou repartir du prototype ?

Rappel de l'objectif : **architecture simple, propre, robuste**, respectant les bonnes
pratiques du langage, adaptée à ce type de produit (embarqué de sûreté + web local +
marché réglementé).

### 5.1 Critères de décision

1. Alignement avec l'architecture cible (hexagonale, testable, séparée du matériel).
2. Réutilisation du travail à forte valeur déjà validé (parité, sécurité, contrat).
3. Robustesse/sûreté (fail‑safe, intégrité, watchdog, OTA).
4. Simplicité et maintenabilité.
5. Coût/risque de la voie choisie.

### 5.2 Repartir du prototype — évaluation

**Pour** : ça marche déjà sur la carte ; le chemin matériel (I²C, DAC, Wi‑Fi, HTTP) est
prouvé ; c'est simple à comprendre.

**Contre (rédhibitoire pour une cible “propre production”)** :
- Monolithe **Arduino**, un seul fichier, **zéro séparation** logique/matériel → l'exact
  inverse de l'architecture prescrite (« séparation claire logique de régulation / pilotes »).
- **Non testable hors carte**, **aucune parité** avec le simulateur (spécification
  exécutable) → on **perdrait** l'oracle de non‑régression.
- **Sécurité factice**, API non conforme au contrat OpenAPI, régulation simplifiée, config
  sans intégrité/redondance, pas d'états de défaut riches, pas d'OTA.
- Repartir du prototype = **re‑développer proprement tout ce que la production a déjà
  conçu et validé** (régulation PI, A/B, sécurité, contrat). **Gaspillage du capital.**

**Conclusion** : le prototype est un **excellent banc de référence matériel**, mais **un
mauvais socle d'architecture** pour la production.

### 5.3 Réutiliser l'ébauche production — évaluation

**Pour** :
- C'est **déjà l'architecture cible** (hexagonale, testable), **prescrite** par la doc.
- Elle porte le **capital validé** : régulation à **parité simulateur**, sécurité réelle,
  contrat OpenAPI, persistance robuste. C'est **le travail conceptuel difficile, fait**.
- Alignée avec **tout le reste du projet** (cahier des charges, OpenAPI, PWA, vecteurs).

**Contre** :
- **Ne compile pas** et **n'a jamais tourné** → le **risque d'intégration est réel et non
  mesuré** (c'est justement la force du prototype).
- Découpage en **20 micro‑composants** probablement **plus complexe que nécessaire**
  (contre l'objectif « simple »).

**Conclusion** : socle **pertinent**, à condition de **le prouver sur carte** et de le
**simplifier**.

### 5.4 Recommandation : **synthèse hybride** (ni l'un, ni l'autre en aveugle)

> **Réutiliser l'architecture et le cœur de la version production comme fondation ; y
> porter (récolter) le code d'intégration éprouvé du prototype ; simplifier la structure.**
> Ne PAS repartir du prototype comme socle ; ne PAS reprendre la production telle quelle.

C'est la seule voie qui donne à la fois **le bon design** (production) **et une intégration
qui tourne** (prototype), tout en restant **simple**.

**Plan concret (incrémental, chaque étape prouvée sur carte + vecteurs)** :

1. **Débloquer & simplifier** : corriger le bug de build ; corriger l'adresse DAC `0x5F` ;
   propager la cible **ESP32‑S2** (retirer les restes C3). Restructurer selon `refonte-one.md`
   (**une bibliothèque C++ portable `core/`** + **firmware ESP‑IDF mince**, **4 ports**
   `Clock/I2cBus/Rng/Storage`, HTTP en fonctions pures) — regrouper les 20 micro‑composants
   en ~7 modules cohésifs. *(Simplicité.)*
2. **Filet de sécurité** : brancher les **vecteurs golden** comme **vrais tests C++ sur
   hôte** → tout portage reste mesuré à la parité simulateur.
3. **Récolter le prototype** (sa vraie valeur restante) : reprendre son **code d'intégration
   éprouvé** pour écrire les **adaptateurs** manquants de la production —
   séquences I²C SCD41, écriture registres DAC `0x5F`, `softAP` Wi‑Fi, serveur HTTP,
   lecture/écriture NVS — et le **câblage `app_main` + boucle** (périodicités capteur/DAC).
   *(Le prototype devient la “doc vivante” du chemin matériel.)*
4. **Compléter le produit** : **PWA embarquée** (assets du dossier 07 en LittleFS, servis par
   `esp_http_server`), persistance **NVS A/B** + **LittleFS** réelles, aléa (RNG), **KDF**
   (mbedTLS), source de temps, mode service (bouton 3 s / AP 15 min), **OTA A/B signé +
   rollback**.
5. **Sûreté matérielle** : concevoir le **watchdog matériel indépendant** (heartbeat →
   repli 10 V), **absent des deux versions** et pourtant **prescrit par l'architecture**.
6. **Valider sur carte** en rejouant le comportement connu‑bon du prototype comme sanity
   check, puis le protocole de réception du lot 1.

**Ce qu'on garde de chaque version** :
- **De la production** : l'architecture, le noyau PI (parité), la sécurité, le contrat
  OpenAPI, la persistance robuste, la testabilité.
- **Du prototype** : le **savoir‑faire d'intégration matériel prouvé** (I²C/DAC/Wi‑Fi/HTTP/
  NVS) et la confiance « ça tourne sur la S2 » — porté proprement dans les adaptateurs.
- **On abandonne** : le monolithe Arduino, l'auth factice, l'API maison et la régulation
  simplifiée du prototype (remplacés par les équivalents propres de la production).

### 5.5 En une phrase

**Ne repartez pas du prototype et ne livrez pas la production telle quelle : gardez
l'architecture + le cœur validé de la production, portez‑y l'intégration matérielle
éprouvée du prototype, simplifiez la structure — et prouvez chaque étape sur la carte et
contre les vecteurs.**
