# Analyse du firmware `sonde-co2` (état actuel, avant refonte)

> Document d'analyse de l'existant. Objectif : décortiquer l'architecture du projet
> C++/ESP-IDF tel qu'il est aujourd'hui, pour préparer une refonte en projet C++
> standard bien structuré.
>
> Périmètre analysé : `firmware-esp32/` (20 composants ESP-IDF, ~3 700 lignes C++).

---

## 1. À quoi sert le projet

Firmware d'un **régulateur de ventilation piloté par le taux de CO₂**, cible **Wemos S2
Mini (ESP32-S2)**. Chaîne fonctionnelle :

- capteur **CO₂ SCD41** (I²C `0x62`) → mesure du taux de CO₂ ;
- **cœur de régulation PI** (filtre passe-bas + rampes + anti-windup) → calcule un
  pourcentage d'ouverture de ventilation (0–100 %) pour tenir une cible (défaut 1000 ppm) ;
- **actionneur DAC DFR0971** (I²C, sortie **0–10 V**) → commande le variateur/moteur ;
- **interface web locale (PWA)** servie par le point d'accès Wi-Fi de la carte →
  configuration et supervision, protégée par authentification à rôles ;
- **mode service** (appui bouton 3 s → Wi-Fi de config limité à 15 min) et
  **historique/journal d'événements** persistés en flash.

**Principe de sûreté central : l'état sûr est la ventilation à 100 % (plein débit).**
Au démarrage, sur défaut capteur, sur CO₂ trop haut, sur échec I²C, ou tant que le
matériel n'est pas validé → repli automatique à 100 %.

---

## 2. Contexte structurant (à comprendre avant toute refonte)

1. **Ce dépôt n'est qu'un sous-ensemble d'un projet plus grand.** Commit initial :
   « Ajout du projet non restructuré ». Les tests `.mjs` référencent des dossiers frères
   **absents du dépôt** :
   - `06 - LOGICIEL EMBARQUE/simulateur/src/controller.js`
   - `07 - INTERFACE WEB LOCALE/CONTRAT API LOCALE V0.1.json`
   - `07 - INTERFACE WEB LOCALE/maquette-web-locale/server.mjs`

   La **source de vérité** est un **simulateur JavaScript** + un **contrat OpenAPI**.
   Ce C++ en est un **portage** maintenu en parité.

2. **C'est le squelette de la version PRODUCTION (cible), pas la version fonctionnelle.**
   Ce document analyse `firmware-esp32/main` + `components/` (ESP‑IDF), qui est la **cible
   propre destinée à la production** mais **jamais compilée** (« squelette de conception non
   compilé » ; bug bloquant `std::array<4>` → `std::array<8>`, cf. §8). ⚠️ **Un second
   firmware, fonctionnel et le plus avancé, existe** : le **prototype** Arduino
   `firmware-esp32/tests-materiel/wifi_ap_web/` (celui que `install.md` compile et flashe).
   La comparaison prototype ↔ production est traitée dans **`doc/analyse-proto.md`**.

3. **Aucun GPIO n'est figé, aucun pilote n'est branché au `main`.** `app_main.cpp` fait
   tourner le noyau « à blanc » (capteur toujours invalide → sortie 100 %) et se contente
   de logguer. Le firmware attend l'identification physique de la carte (« lot 1 »).

---

## 3. Architecture : un « ports & adapters » (hexagonal) fait main

Séparation stricte **logique pure / effets de bord**. Les composants **calculent quoi
faire** (trame I²C, bitmask d'actions, JSON, « plan » de requête) mais **n'exécutent
jamais l'I/O**. Un orchestrateur externe exécute réellement.

```
┌──────────────────────────────────────────────────────────────┐
│  SHELL / ADAPTATEURS (I/O réelle)                            │
│  • app_main.cpp      (ESP-IDF : NVS, esp_timer, logs)        │
│  • esp32_i2c_port    (driver I²C ESP-IDF — SEUL I/O réel)    │
│  • tests-materiel/*  (sketches Arduino/PlatformIO séparés)   │
└──────────────────────────────────────────────────────────────┘
                      ▲  intentions (trames, actions, plans)
┌──────────────────────────────────────────────────────────────┐
│  NOYAU PUR (déterministe, testable sur hôte, sans I/O)      │
│                                                              │
│  Contrôle-commande            Domaine HTTP/API               │
│  • control_core (PI+états)    • http_api_contract            │
│  • sensor_cycle               • api_request_guard            │
│  • actuator_output            • http_server_app (plan)       │
│  • firmware_app (orchestre)   • api_handlers                 │
│                               • api_payloads / api_response  │
│  Contrats & pilotes purs      Sécurité                       │
│  • hardware_contracts         • local_auth (sessions)        │
│  • lot1_drivers (SCD41/DAC)   • credential_store             │
│                                                              │
│  Persistance (sérialisation)  Transverse                     │
│  • config_store  • history_log • service_mode                │
└──────────────────────────────────────────────────────────────┘
```

Choix payant pour la **testabilité sur hôte** : le port I²C se compile même sans SDK via
`#if __has_include("driver/i2c.h")`.

---

## 4. Les 20 composants par couche

### Contrôle-commande (temps réel)
- **`control_core`** — Régulateur **PI** + filtre passe-bas, machine à états
  `Startup/Auto/ForceOpen/Fault`, anti-windup, rampes montée/descente, détection défaut
  capteur (absence, hors-plage, CO₂ haut temporisé). Pur, zéro dépendance.
- **`sensor_cycle`** — Machine à états du cycle SCD41 (start périodique → poll data-ready
  → lecture → classification). Produit un `ControlInput`.
- **`actuator_output`** — Machine à états de la sortie DAC (config plage 0-10 V → sortie
  sûre → suivi consigne / faute). Produit l'`I2cWrite`.
- **`firmware_app`** — **Orchestrateur temps réel** : compose capteur→contrôle→actionneur
  + mode service, encode historique et événements à chaque tick.

### Contrats & pilotes matériels (purs)
- **`hardware_contracts`** — Adresses I²C, conversion `%`→mot DAC 12 bits, classification
  qualité échantillon SCD41.
- **`lot1_drivers`** — Protocole SCD41 (commandes, CRC-8 Sensirion, décodage mesure) +
  fabrication trames DFR0971.
- **`esp32_i2c_port`** — **Seul adaptateur matériel réel** : pilote I²C ESP-IDF (API
  *legacy*), refuse les GPIO non assignés.

### HTTP / API
- **`http_api_contract`** — Table figée des **11 routes** `/api/v1`. Source unique de
  vérité, alignée sur l'OpenAPI.
- **`api_request_guard`** — Garde d'entrée : route + Content-Type + taille corps +
  auth/rôle/CSRF → verdict.
- **`http_server_app`** — Planificateur : requête → **plan d'exécution**.
- **`api_handlers`** — Logique métier par endpoint + **mini-parseur JSON maison** +
  concurrence optimiste (`If-Match`/revision).
- **`api_payloads`** — Sérialisation JSON des succès (via `snprintf`).
- **`api_response`** — En-têtes de sécurité (CSP stricte, `no-store`…) + JSON d'erreur.

### Sécurité
- **`local_auth`** — Sessions en RAM (2 slots), token opaque 256 bits, CSRF, rôles
  hiérarchiques `Public<Installer<Admin`, expiration 15 min, verrou anti-bruteforce
  (5 échecs → 30 s), comparaison temps constant maison.
- **`credential_store`** — Enregistrement d'identifiant binaire 80 o (magic « AUTH »,
  rôle, sel 16 o, verifier 32 o, CRC32). Le hash du mot de passe est calculé **hors
  composant** (« external measured verifier »).

### Persistance & transverse
- **`config_store`** — Config persistante binaire 32 o (magic « VCO2 », CRC32, génération)
  avec **double slot A/B redondant** et résolution de conflits.
- **`history_log`** — Sérialisation échantillons (24 o) et événements (32 o), CRC-16 CCITT
  + estimation dimensionnement stockage.
- **`service_mode`** — Machine à états bouton service / fenêtre Wi-Fi 15 min ; émet des
  actions (start/stop Wi-Fi, invalidation sessions) via bitmask + `session_generation`.

---

## 5. Les deux flux de données

**Flux temps réel** (`firmware_app::update`, à chaque tick) :
```
SensorCycleInput → sensor_cycle → ControlInput → control_core → ControlSnapshot
  → actuator_output → I2cWrite        (+ service_mode en parallèle)
  → history_log (encode HistoryRecord + EventRecord)
```

**Flux HTTP** (par requête) :
```
HttpServerRequest → api_request_guard (auth/CSRF/taille)
  → http_server_app (plan) → api_handlers (parse/valide/exécute)
  → api_payloads (JSON succès) | api_response (JSON erreur + headers)
```

---

## 6. Graphe de dépendances (extrait des `REQUIRES` CMake)

- Feuilles sans dépendance (socle propre) : `control_core`, `config_store`, `history_log`,
  `hardware_contracts`, `http_api_contract`, `service_mode`.
- **`firmware_app`** orchestre le contrôle-commande mais **ne connaît ni `local_auth`, ni
  `credential_store`, ni le HTTP** → la sécurité web doit être assemblée par une couche
  supérieure **absente du dépôt**.
- **Couplage de couches douteux** : `sensor_cycle` et `actuator_output` dépendent de
  `control_core` (une couche « matérielle » connaît la couche « contrôle »). À inverser.

---

## 7. Build & tests

- **Build** : ESP-IDF, un composant CMake par dossier, `idf.py set-target esp32s2`, flash
  4 Mo (factory + OTA A/B + LittleFS historique + coredump). `sdkconfig.defaults` active
  watchdog, rollback, chiffrement NVS.
- **Tests** : **28 scripts Node.js** qui **analysent le texte des sources C++** (regex) et
  vérifient la **parité avec le simulateur JS et l'OpenAPI**. **Ils ne compilent ni
  n'exécutent le C++**, et échouent en l'état (dossiers de référence absents).
- **`tests-materiel/`** : 3 sketches **Arduino/PlatformIO** indépendants (blink, scan I²C,
  `wifi_ap_web`) — écosystème de build **différent** du firmware ESP-IDF principal.
  ⚠️ **`wifi_ap_web` n'est pas un simple sketch de bring-up : c'est le PROTOTYPE fonctionnel
  le plus avancé** (Wi-Fi + web + SCD41 + DAC + AUTO/MANUEL + historique), celui que
  `install.md` builde et flashe. Comparaison détaillée dans `doc/analyse-proto.md`.

---

## 8. Bugs et incohérences concrets détectés

- **Ne compile pas** : `lot1_drivers.cpp:66` initialise `I2cWrite::bytes`
  (`std::array<uint8_t,8>`) depuis `frame.bytes` (`std::array<uint8_t,4>`). Incompatible en
  C++ standard. **Confirmé.**
- **Adresse I²C DAC incohérente** : `0x58` dans `hardware_contracts.hpp` vs `0x5F` dans le
  test matériel `scan_i2c_lot1`. À trancher.
- **Compteurs non persistés** : `history_sequence_`, `event_sequence_`, `boot_id_`
  repartent de 0 à chaque boot ; `boot_id_` jamais assigné ; `epoch_seconds` toujours 0
  (pas d'horodatage réel) → historique sans datation absolue ni continuité.
- **Surcharge sémantique des champs `Scd41Sample`** dans `sensor_cycle::classify`
  (`crc_valid`/`data_ready`/`communication_ok` détournés de leur sens).

---

## 9. Ce qui manque pour que le projet fonctionne

Le dépôt contient **le noyau de décision, pas la machine qui l'exécute**. Inventaire.

### A. Artefacts absents du dépôt (référentiel)
- Le **simulateur JS de référence** (`controller.js`) — source de vérité du comportement.
- Le **contrat OpenAPI** (`CONTRAT API LOCALE V0.1.json`) et le **serveur PWA de maquette**
  (`server.mjs`) — sans eux, aucun test `.mjs` ne peut passer.
- Les **assets de la PWA embarquée** (HTML/CSS/JS de l'interface locale) — mentionnés
  « à intégrer », inexistants.

### B. Couches logicielles non implémentées
- **Le serveur HTTP réel** : adaptateur `esp_http_server` qui reçoit les requêtes, appelle
  `plan_http_server_request`, exécute les `api_handlers` et écrit la réponse. Tout le
  domaine HTTP produit des *plans* et des *chaînes* — **rien ne les branche à `httpd`**.
- **L'orchestration Wi-Fi** : démarrage/arrêt du point d'accès `VENT-CO2-XXXX`, gestion des
  événements Wi-Fi consommés par `service_mode`. Absente.
- **La persistance réelle** : lecture/écriture NVS de la config (slots A/B) et des
  identifiants ; **ring-buffer LittleFS** de l'historique/événements. `config_store`,
  `credential_store`, `history_log` ne font que **sérialiser** — aucune I/O flash.
- **La génération d'aléa** : tokens de session (256 bits) et CSRF sont **fournis en
  paramètres** ; le générateur (`esp_random`/RNG matériel) n'est pas branché.
- **La dérivation de mot de passe (KDF)** : `credential_store` stocke un « verifier »
  calculé **ailleurs** ; le mécanisme réel (PBKDF2/Argon2/…), ses paramètres et le
  provisionnement physique des identifiants ne sont **pas choisis ni implémentés**.
- **La source de temps réel** : `epoch_seconds` reste 0 partout → pas d'horodatage absolu
  (SNTP ou RTC non intégrés).
- **La persistance des compteurs** : `boot_id`, séquences historique/événements repartent
  de 0 à chaque boot.

### C. Intégration matérielle (« lot 1 »)
- **Identification de la carte** : port série, `chip_id`, `flash_id`, scan I²C — non faits.
- **Choix et gel des GPIO** : SDA/SCL, bouton service, LED d'état — **aucun figé**.
- **Branchement des pilotes au `main`** : le cycle capteur, la sortie DAC, la lecture
  bouton, la boucle de tâche périodique (FreeRTOS) ne sont **pas reliés** à
  `app_main.cpp`, qui ne fait qu'un passage « à blanc ».
- **LED d'état / QR Wi-Fi / adresse de secours** : prévus, non implémentés.

### D. Correction de blocage build
- Le **bug de compilation** `std::array<4>`→`std::array<8>` (§8) doit être corrigé avant
  tout, sinon rien ne bâtit.
- **Migration éventuelle** du pilote I²C *legacy* vers `i2c_master` (ESP-IDF 5.x).

### E. Outillage
- **Chaîne ESP-IDF** installée et **version figée** (reproductibilité).
- **Vrais tests C++** (compilés/exécutés) — aujourd'hui inexistants ; seuls des tests
  d'analyse textuelle JS existent.

**Conclusion §9** : en l'état, le projet **ne peut pas fonctionner sur cible**. Il faut, au
minimum : corriger le bug de build, identifier la carte et figer les GPIO, brancher les
pilotes + une boucle FreeRTOS dans `main`, implémenter la persistance NVS/LittteFS, le
serveur HTTP réel, l'orchestration Wi-Fi, l'aléa/KDF, et une source de temps.

---

## 10. Écarts aux bonnes pratiques C++ standard (axes de refonte)

Style « **C++ embarqué défensif** » proche du *C-with-classes*. Axes de modernisation par
impact :

**a) Réinventions de la stdlib**
- `bool` + pointeur/longueur, structs `{bool ok; size_t len;}`, `{status; http_status;}`
  → `std::optional`, `std::expected`, `std::span`, `std::string_view`.
- Pointeurs nus nullable (`const SessionRecord*`, `const ApiRoute*`) → `std::optional`/réf.

**b) Sérialisation & JSON artisanaux**
- Encodage binaire **little-endian manuel** (offsets magiques) **dupliqué** entre
  `config_store`, `credential_store`, `history_log` → une lib de (dé)sérialisation typée
  unique (struct packée + `static_assert` de layout, ou reflection).
- **Parsing JSON par `strstr`/`strtod`** (fragile, faille potentielle) et **sérialisation
  par `snprintf`/`%s` sans échappement** → vrai parseur/sérialiseur (ArduinoJson,
  nlohmann, glaze…).
- Réimplémentation manuelle de `gmtime` → `std::chrono`.

**c) Crypto / intégrité maison**
- `constant_time_equal`, `crc32`, `crc16_ccitt` réimplémentés → mbedTLS
  (`mbedtls_ct_memcmp`) et `esp_rom_crc*` de l'IDF.
- Verifier 32 o copié par valeur **sans effacement mémoire** → type secret auto-`zeroize`.

**d) RAII & abstraction matérielle**
- `Esp32I2cPort` : `i2c_driver_install` **sans** `i2c_driver_delete`, classe **copiable**
  possédant une ressource globale → handle RAII non copiable.
- Pas d'interface `I2cBus` injectable → introduire une abstraction (test sans macro,
  migration vers `i2c_master`).

**e) Types & style**
- `enum` C non typés pour les bitmasks d'actions → `enum class` + opérateurs de flags.
- POD « fat buffer » (`array` fixe + `length` séparé, sans invariant) → types
  longueur-bornée / `std::span`.
- Validation d'enums par bornes numériques, `to_string` par `switch` dupliqués → tables /
  reflection (`magic_enum`).
- Duplication (branches « safe » d'`actuator_output`, calcul d'âge de `sensor_cycle`,
  mapping statut→message HTTP dispersé sur 3 composants).

**f) Conception**
- Effets de bord par **bitmask/retour non structuré** (`service_mode` → `firmware_app` →
  couche HTTP absente) → modèle explicite de commandes/événements.
- Inverser le couplage `sensor_cycle`/`actuator_output` → `control_core`.
- Gros agrégats (`ApiReadContext`, snapshots imbriqués) copiés par valeur → vues/références.

---

## 11. À préserver dans la refonte

- La **séparation pure/impur** (formidable pour les tests) ;
- la **matrice de sécurité centralisée** (rôles / CSRF / CSP stricte) ;
- le **repli sûr systématique à 100 %** ;
- la **redondance config A/B** ;
- le principe de **parité avec un contrat de référence**.
