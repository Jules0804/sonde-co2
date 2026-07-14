# Analyse de bout en bout — Projet « Régulation Ventilation CO₂ »

> Analyse complète de l'existant à l'échelle du **projet entier** (et plus seulement du
> firmware). But : comprendre l'architecture actuelle — produit, logiciel embarqué,
> simulateur de référence, interface web, matériel, gouvernance — pour préparer une
> **refonte globale respectant les principes d'architecture propres à ce type de projet**
> (produit électronique de sûreté, à interface web locale, sur marché réglementé).
>
> Complète `doc/analyse-old.md` (firmware seul) et `doc/refonte-one.md` (plan de refonte
> firmware). Ce document élargit le périmètre à tout le dépôt.

---

## 0. Résumé exécutif

- **Nature** : ce n'est pas « un firmware », c'est un **projet d'ingénierie produit complet**
  (261 fichiers) organisé en 12 dossiers thématiques `00`–`11` + le code
  (`simulateur/`, `firmware-esp32/`, `07 - INTERFACE WEB LOCALE/`, `arduino-outils/`).
- **Le cœur de l'architecture logicielle est une chaîne « spécification exécutable →
  portage »** : un **simulateur JavaScript** modélise toute la logique décisionnelle et
  **génère des vecteurs golden** que le **firmware C++** doit rejouer à l'identique. Un
  **contrat OpenAPI** + une **PWA** jouent le même rôle pour la couche HTTP.
- **Architecture déjà saine sur le principe** : séparation stricte *noyau pur déterministe*
  / *effets de bord*, testable hors matériel — exactement ce qu'exige le document
  d'architecture système (« séparation claire entre logique de régulation et pilotes
  matériels ; simulateur compilable sur ordinateur »).
- **Deux firmwares coexistent** (point clé, détaillé dans `doc/analyse-proto.md`) : un
  **PROTOTYPE** Arduino fonctionnel et le plus avancé (`firmware-esp32/tests-materiel/
  wifi_ap_web`, compile/flashe/tourne — cf. `install.md`) et la **version PRODUCTION**
  ESP‑IDF architecturée (`firmware-esp32/main` + `components/`), propre mais **squelette non
  compilé**.
- **Dette et incohérences réelles** : la version production **ne compile pas** et plusieurs
  **contradictions matérielles** subsistent (ESP32‑C3 vs S2, adresse DAC `0x58` côté
  production **vs `0x5F`** côté prototype/banc). Le couplage inter‑dossiers par **chemins
  relatifs codés en dur** (`06 - LOGICIEL EMBARQUE/…`) reste une **fragilité structurelle**
  (déplacer un dossier casse le harnais de parité et le mock web).
- **État réel** : Phase 2 (sélection composants). **Aucun achat, aucun essai matériel,
  aucune compilation ESP‑IDF.** Tout ce qui « passe » est **simulé**.

---

## 1. Cartographie du dépôt

```
sonde-co2/
├─ 00 - PILOTAGE DU PROJET/        plan directeur, registre des décisions, suivi, scripts vérif
├─ 01 - CAHIER DES CHARGES/        exigences produit (fonction, sûreté, contraintes)
├─ 02 - REGLEMENTATION ET CONFORMITE/  (en veille) CE/RED/CRA, risques, menaces
├─ 03 - ARCHITECTURE ET CONCEPTION/  ARCHITECTURE SYSTEME + SPECIFICATION DES INTERFACES
├─ 04 - ELECTRONIQUE ET CABLAGE/   câblage lot 1, netlist, schémas .drawio/.svg
├─ 05 - MECANIQUE ET AERAULIQUE/   CAO sonde (Fusion/py), hypothèses aérauliques
├─ 06 - LOGICIEL EMBARQUE/         ★ tout le code embarqué (voir ci-dessous)
│  ├─ simulateur/                  ★ SOURCE DE VÉRITÉ (Node.js, logique décisionnelle)
│  ├─ firmware-esp32/              ★ PORTAGE C++ ESP-IDF (20 composants)
│  └─ arduino-outils/              sketches de mise au point carte (.ino)
├─ 07 - INTERFACE WEB LOCALE/      contrat OpenAPI + maquette PWA + mock serveur
├─ 08 - PROTOTYPES ET ESSAIS/      protocole réception lot 1, guide dépannage, modèles CSV
├─ 09 - ACHATS ET COUTS/           nomenclature, budget, comparatifs devis
├─ 10 - INDUSTRIALISATION/         (vide/README)
├─ 11 - DOCUMENTATION ET MAINTENANCE/ (vide/README)
├─ 99 - ARCHIVES/                  anciens livrables (copies archivées de 06, etc.)
├─ doc/                            analyses (analyse-old, refonte-one, architecture.html, ce fichier)
├─ AGENTS.md                       règles de travail (autonomie, périmètre)
├─ README.md (1 ligne) · LICENSE · .gitignore
```

> **Note structurante** : `simulateur/`, `firmware-esp32/` et `arduino-outils/` vivent sous
> `06 - LOGICIEL EMBARQUE/`. Les chemins croisés codés en dur (`../../06 - LOGICIEL
> EMBARQUE/…`) **résolvent donc correctement** dans cette disposition. Attention toutefois :
> ce couplage par chemins relatifs est **fragile** — tout déplacement de dossier casse le
> harnais de parité et le mock web (cf. §9‑#2 et principe P8).

---

## 2. Vision produit & exigences (dossier 01)

**Fonction** : réguler la ventilation d'une salle selon le CO₂, en pilotant
proportionnellement 1 à 6 volets motorisés (même consigne), avec interface téléphone
locale, **sans cloud ni Internet ni GTB**. Finalité : produit reproductible, certifiable,
commercialisable.

**Boucle** : mesurer CO₂ (reprise) → valider → calculer une ouverture entre un minimum
réglable et 100 % → même consigne 0–10 V aux moteurs → afficher → persister → réguler en
autonomie.

**Cibles & règles** :
- Consigne usine **1000 ppm** (modifiable, pas un seuil légal).
- **Débit minimal réglementaire prioritaire** (base 30 m³/h/occupant) — **borne dure jamais
  franchie vers le bas**.
- Commande **stable/progressive** : filtrage + rampe + PI lent (ou proportionnel segmenté),
  à valider par essais.

**Sûreté (exigence produit)** :
- Défaut critique **sous tension → ouverture 100 %** + signalement.
- **Coupure totale → aucun rappel mécanique exigé** (salle réputée inoccupée).
- Détection sonde : absence, incohérence, valeur figée, hors plage.
- Séparation **230 V / TBTS**, pas d'accès dangereux en usage normal.
- **Pas de mot de passe universel fixe**, mise à jour signée + rollback.

**Exclusions v1** : pas un détecteur de sécurité gaz/incendie, pas de commande de clapet
coupe-feu, pas ATEX, pas médical.

---

## 3. Architecture système (dossier 03)

### 3.1 Découpage physique
Contrôleur autonome 230 V + **tête CO₂ déportée** (reprise) + **sortie commune 0–10 V** +
**6 départs moteurs protégés** (24 V ou 230 V, à trancher) + interface web Wi‑Fi locale.
Régulation **indépendante** du cloud/Wi‑Fi bâtiment/GTB.

### 3.2 Principe logiciel imposé par la doc
- **« Séparation claire entre logique de régulation et pilotes matériels »** ;
- **« Simulateur compilable sur ordinateur pour tester la machine d'états et la
  régulation »**.
> → L'architecture *ports & adapters* + *noyau testable sur hôte* n'est pas un choix
> d'opportunité : **elle est prescrite par le document d'architecture**. À conserver.

### 3.3 Sûreté à deux niveaux (point capital)
- **Niveau logiciel** : le firmware demande 100 % sur défaut critique.
- **Niveau matériel indépendant (prescrit)** : pour couvrir le **blocage du logiciel**,
  l'architecture produit **doit** prévoir un **watchdog matériel indépendant** : un circuit
  attend un signal périodique du µC ; en son absence, un relais/commutateur analogique
  **ramène la sortie vers la référence 10 V (= 100 %)**. Tant que l'alimentation moteurs et
  la référence 10 V sont présentes.
> → **Conséquence refonte** : le firmware doit **émettre un “heartbeat” matériel** en plus
> de sa logique fail‑safe. La sûreté ne peut pas reposer uniquement sur le logiciel.

### 3.4 Interface téléphone (I‑06)
AP Wi‑Fi **uniquement en mode service** (appui **3 s** → SSID `VENT-CO2-XXXX`, QR, IP
`http://192.168.4.1`, portail captif, compte à rebours **15 min**), interface web
responsive servie par le boîtier, **mise à jour firmware depuis le navigateur** + image de
secours/rollback. Ethernet **exclu** v1 ; Modbus/BACnet **reportés mais à ne pas bloquer
architecturalement**.

### 3.5 Persistance (I‑07) & mise à jour (I‑09)
Paramètres **versionnés + contrôle d'intégrité**, usine séparé de l'utilisateur ; **journal
circulaire** des défauts/événements **sans donnée personnelle** ; historique désactivable
~7 jours. MAJ **signée**, vérifiée avant activation, **double image / rollback**.

---

## 4. Le cœur de l'architecture : la chaîne « source de vérité → portage »

C'est **le** concept structurant du projet, à préserver absolument.

```
     ┌────────────────────────────┐        génère (rejoue le code JS)
     │   simulateur/ (Node.js)     │  ─────────────────────────────────┐
     │   SPÉCIFICATION EXÉCUTABLE  │                                    │
     │   controller, config-store, │        firmware-esp32/test/vectors/*.json
     │   history-log, service-...  │        (golden : inputs + expected, hex binaire)
     └────────────────────────────┘                                    │
                 ▲   spec du comportement                               ▼
                 │                                        ┌──────────────────────────┐
     ┌───────────┴─────────────┐   doit rejouer à         │  firmware-esp32/ (C++)   │
     │  07 - OpenAPI + PWA      │   l'identique (byte &     │  PORTAGE                 │
     │  core.mjs (validateConfig)│   valeur-exact)         │  control_core, config_.. │
     │  = contrat HTTP + règles  │ ───────────────────────▶│  http_api_contract, ...  │
     └──────────────────────────┘                          └──────────────────────────┘
```

- **Le comportement n'est pas spécifié en prose, il est calculé par le JS**, sérialisé en
  vecteurs, puis rejoué en C++. Comparaison **byte‑exacte** (formats binaires) et
  **valeur‑exacte** (snapshots, y compris arrondis `toFixed(3)`/`toFixed(1)`).
- **Doctrine** (confirmée) : en cas de désaccord, **le JS/OpenAPI fait foi** ; le C++ est un
  portage.

---

## 5. Sous‑système A — Simulateur (spécification exécutable)

Projet Node.js ESM pur, **zéro dépendance**, testé avec `node:test`.

### 5.1 `controller.js` — noyau de régulation (référence exacte)
États `STARTUP/AUTO/FORCE_OPEN/FAULT` ; défauts `NONE/SENSOR_MISSING/SENSOR_RANGE/
SENSOR_STALE/HIGH_CO2`. **Défauts EXACTS** (repris à l'identique dans `control_core.hpp`) :

| Param | Valeur | Param | Valeur |
|---|---|---|---|
| targetPpm | 1000 ppm | filterTauSeconds | 60 s |
| minOutputPct | 20 % | kpPctPerPpm | 0.08 %/ppm |
| maxOutputPct | 100 % | kiPctPerPpmSecond | 0.00035 %/(ppm·s) |
| validMinPpm / validMaxPpm | 350 / 5000 ppm | rampUpPctPerSecond | 0.5 %/s |
| startupValidSeconds | 15 s | rampDownPctPerSecond | 0.2 %/s |
| sensorTimeoutSeconds | 30 s | highAlarmPpm | 1500 ppm |
| highAlarmDelaySeconds | 60 s | | |

Algorithme (priorité fail‑safe) : `dt` borné à 60 s → **forceOpen** → **défaut capteur** →
**filtre passe‑bas** `alpha=1-exp(-dt/τ)` → **alarme CO₂ haut** temporisée 60 s → **startup**
tant que `validDuration<15 s` → **AUTO** = PI (biais `minOutputPct`, **anti‑windup par gel
conditionnel de l'intégrale**) + **rampe**. `snapshot()` arrondit (contrat de comparaison).

### 5.2 `config-store.js` — persistance A/B (façon NVS)
Enregistrement **32 o** little‑endian (magic `VCO2`, schéma v1, génération u32, 7 paramètres,
CRC32). Sélection **A/B robuste** avec statuts (`OK`, `REDUNDANT`, `BACKUP_DEGRADED`,
`FACTORY_DEFAULTS`, `CONFIG_CORRUPT`, `GENERATION_CONFLICT/AMBIGUOUS`), **génération série
mod 2³²** (rollover géré), **écriture ping‑pong** dans le slot opposé, **détection no‑op**
(anti‑usure flash), preuve de robustesse **coupure de courant testée octet par octet**.

### 5.3 `hardware-contracts.js` — HAL logique
Conversion `%`→mot DAC 12 bits (`100 %→10 V`, `code<<4`), trames I²C par canal ;
classification SCD41 (`VALID/NOT_READY/MISSING/CRC_ERROR/STALE/RANGE`).

### 5.4 `history-log.js` — journal compact
Échantillon **24 o**, événement **32 o**, **CRC16‑CCITT**, logs circulaires, **coalescence**
des événements identiques (sauf `CRITICAL`), **liste blanche stricte de clés** (aucun texte
libre / secret / PII), dimensionnement flash calculé.

### 5.5 `service-access.js` — mode service
Machine `OFF/STARTING/ACTIVE/STOPPING/FAULT`, appui long **3 s** anti‑répétition, fenêtre
**15 min**, effets de bord découplés (`START_WIFI/STOP_WIFI/INVALIDATE_SESSIONS`), horloge
monotone, `sessionGeneration` pour invalider les jetons. **Ne touche jamais la régulation**
(propriété testée).

### 5.6 `generate-firmware-vectors.js` — le pont de parité
Exécute réellement les modules et écrit `{input, expected}` + hex binaires dans
`firmware-esp32/test/vectors/`. Scénarios contrôleur (startup→auto, rising_co2,
missing/range/high_co2, force_open), service (retry/expiry/unexpected‑stop), config‑store
(**power‑cut à chaque octet 0→32**), history‑log.

---

## 6. Sous‑système B — Firmware C++ (portage ESP‑IDF)

*(Analyse détaillée dans `doc/analyse-old.md` ; rappel synthétique.)*

20 composants, architecture **ports & adapters** manuelle :
- **Contrôle‑commande** : `control_core`, `sensor_cycle`, `actuator_output`, `firmware_app`.
- **Contrats & pilotes purs** : `hardware_contracts`, `lot1_drivers`.
- **Adaptateur matériel réel** : `esp32_i2c_port` (seul I/O).
- **HTTP/API** : `http_api_contract`, `api_request_guard`, `http_server_app`, `api_handlers`,
  `api_payloads`, `api_response`.
- **Sécurité** : `local_auth`, `credential_store`.
- **Persistance & transverse** : `config_store`, `history_log`, `service_mode`.

Style « C++ embarqué défensif » : POD, `std::array` bornés, pas d'exceptions, pas de heap,
CRC/compare/JSON **faits main**. `app_main` ne câble **pas** les pilotes ni la pile HTTP
(tourne « à blanc », sortie forcée 100 %).

---

## 7. Sous‑système C — Interface web locale (dossier 07)

### 7.1 Contrat OpenAPI (source de vérité HTTP)
OpenAPI **3.1.0**, `info.version = 0.3.0` (⚠️ le fichier est nommé « V0.1 »), base `/api/v1`,
**11 opérations / 8 chemins**. Sécurité : `bearerAuth` (jeton opaque de session) +
`csrfToken` (`X-CSRF-Token`) sur toutes les écritures. Rôles `viewer < installer < admin`.
Codes : **401** auth, **403** rôle/CSRF, **409** conflit de révision, **422** validation
métier, **428** `If-Match` manquant, **429** trop d'essais.

| Route | Auth | CSRF | Notes |
|---|---|---|---|
| POST `/session` | public | non | login (12–128 car.), 429 anti‑bruteforce |
| GET/DELETE `/session` | bearer | del: oui | lecture / logout |
| GET `/status` | public | non | mode ∈ STARTUP/AUTO/SERVICE/TEST/FORCE_OPEN/FAULT |
| GET/PUT `/config` | bearer | put: oui | **If‑Match obligatoire** (révision, 409/422/428) |
| GET/DELETE `/history` | del: admin | del: oui | historique / effacement admin |
| GET `/events` | installer | non | journal technique (sans PII) |
| POST/DELETE `/output-test` | bearer | oui | paliers {0,25,50,75,100} %, 5–600 s |

### 7.2 Mock serveur (`server.mjs`)
Node `http` pur, **double rôle** : sert la PWA (`public/`, path‑traversal bloqué, **en‑têtes
durcis + CSP stricte**) **et** simule le contrôleur + l'API (état en mémoire, historique
synthétique, évolution CO₂). Sécurité réelle **de haut niveau** : **scrypt+sel**,
`timingSafeEqual`, **anti‑énumération** (dummy verifier), verrou **5 échecs/30 s** (429 +
`Retry-After`), sessions `randomBytes`, CSRF, corps plafonné 32 Ko. **Barre haute que le
firmware doit égaler.**

### 7.3 PWA (`public/`)
Vanilla JS, **aucun build/dépendance**, 4 vues (Accueil/Historique/Réglages/Service).
Pièce maîtresse : **`core.mjs` = logique métier partagée front ET back** (`validateConfig`
identique navigateur + serveur, `presentEvent` sans texte libre, seuils qualité d'air,
conversion 0–10 V). `api-client.mjs` gère Bearer/CSRF/If‑Match. `sw.js` = service worker
network‑first (offline de la coquille). `manifest.webmanifest` installable.

### 7.4 Parité avec le firmware
`http_api_contract` C++ réplique **exactement** les 11 routes (rôles, CSRF, handlers) et les
constantes (session 15 min, 5 échecs, base `/api/v1`). Les **assets PWA ne sont pas encore
embarqués** dans le firmware (à mettre en LittleFS + servir par `esp_http_server`).

---

## 8. Sous‑système D — Outillage matériel & essais

- **`arduino-outils/`** (`.ino` bruts) : `scan_i2c_lot1`, `lecture_scd41_csv`,
  `test_dfr0971_csv` — bring‑up réel, export CSV.
- **`firmware-esp32/tests-materiel/`** (PlatformIO) : `blink_gpio39`, `scan_i2c_lot1`, et
  surtout **`wifi_ap_web` = le PROTOTYPE fonctionnel le plus avancé** (Wi‑Fi + web + SCD41 +
  DAC + AUTO/MANUEL + historique RAM + export CSV), builé/flashé par `install.md`.
  **Chevauchement partiel** avec `arduino-outils/` (deux chaînes Arduino distinctes → à
  unifier). Comparaison prototype ↔ production : **`doc/analyse-proto.md`**.
- **`08 - PROTOTYPES ET ESSAIS/PROTOCOLE DE RECEPTION DU LOT 1`** : critères chiffrés (scan
  I²C `0x62`+`0x5F` ; SCD41 : 1 mesure/5 s, <0,1 % invalides/24 h ; DAC : 0/2/5/8/10 V à
  **±0,10 V**, monotone ; **essai charge 6 entrées 10 kΩ**). Analyse auto via
  `analyser-reception.mjs`.

---

## 9. Défauts, incohérences et dette — consolidés

| # | Sévérité | Constat |
|---|---|---|
| 1 | 🔴 Bloquant build | `lot1_drivers.cpp:66` : `I2cWrite::bytes` (`array<8>`) initialisé depuis `frame.bytes` (`array<4>`) → **ne compile pas**. |
| 2 | 🟡 Fragilité structurelle | **Couplage inter‑dossiers par chemins relatifs codés en dur** : `07/.../server.mjs` (import `history-log.js`), les validateurs `firmware-esp32/test/validate-*.mjs` (`-control-core`, `-hardware-contracts`, `-http-api-contract`…) et `00/.../verifier-phase2.mjs` référencent `../../06 - LOGICIEL EMBARQUE/…`. Avec `06 - LOGICIEL EMBARQUE/` restauré, **ces chemins résolvent et le harnais de parité fonctionne à nouveau**. Mais le couplage reste fragile : tout déplacement de `simulateur/`, `firmware-esp32/` ou `07/` casse à nouveau parité et mock (à assainir, cf. P8). |
| 3 | 🟠 Matériel | **Adresse DAC** : firmware `hardware_contracts.hpp` = `0x58` (défaut usine) **mais banc = `0x5F`** (switchs 111, VALIDATED). Le firmware est **faux pour le banc réel**. |
| 4 | 🟠 Cible | **ESP32‑C3 vs ESP32‑S2** : décision figée = **S2** (D‑026), mais guide dépannage, plan de partitions et commentaires `main` encore libellés **C3**. À propager. |
| 5 | 🟡 Données | `boot_id`/séquences non persistés (0 au reboot) ; `epoch_seconds` = 0 → historique sans datation absolue. |
| 6 | 🟡 Couplage | `sensor_cycle`/`actuator_output` (couche matériel) dépendent de `control_core` (couche contrôle) → dépendance à inverser. |
| 7 | 🟡 Versionnage | Contrat nommé « V0.1 » mais `info.version=0.3.0` (verrouillé par le test). Nommage à corriger. |
| 8 | 🟡 GPIO | SDA/SCL proposés GPIO15/GPIO21 mais **`GPIO_PENDING`** dans la netlist ; bouton/LED non affectés. |

---

## 10. Matériel — état figé / non figé

- **Cible** : Wemos **S2 Mini (ESP32‑S2)**, `esp32s2`, flash **4 Mo**, 8 partitions
  (factory + OTA A/B + LittleFS historique + coredump) — à **revalider** pour S2.
- **I²C** : SCD41 `0x62` (fixe, à confirmer par scan) ; DFR0971 **`0x5F`** (banc, switchs
  111). **GPIO non figés** (proposition SDA=15 / SCL=21).
- **Alimentation** : lot 1 = USB/3,3 V, **aucun 24 V ni moteur**. Produit = 230 V →
  Mean Well HDR‑60‑24 + DDR‑15G‑5. Sortie **0–10 V** (max 10,2 V) **jamais** reliée à une
  entrée ESP32.
- **Lots** : Lot 1 (SCD41 + DAC, ≤90 € — panier 69 € prêt, **non acheté**) ; **Lot 2 =
  NO‑GO** (moteurs/alim/coffret).

---

## 11. Sûreté & conformité

- **Fail‑safe logiciel** → 100 % sur tout défaut (déjà codé) ; **+ watchdog matériel
  indépendant** ramenant 10 V (prescrit, **à concevoir**).
- **Débit minimal** = borne dure jamais franchie.
- **Coupure totale** → pas de rappel mécanique exigé.
- **Sécurité applicative** (déjà spécifiée, barre haute) : sessions installer/admin, jeton
  256 bits, CSRF 192 bits, expiration 15 min, verrou 5 échecs/30 s, comparaison temps
  constant, `If-Match`, schéma JSON strict, en‑têtes `no-store`/`nosniff`/`DENY`/CSP, journal
  sans PII. **KDF mot de passe non figée** (coût à mesurer sur ESP32).
- **Conformité** : radio → **RED** ; commercialisation post‑2027 → **CRA** ; **CE**/CEM/
  sécurité électrique. Dossier `02` **en veille** jusqu'au prototype.

---

## 12. Principes d'architecture pour la refonte globale

Ce que « bien architecturer ce type de projet » (produit embarqué de sûreté + web local +
marché réglementé) impose — et comment l'appliquer ici.

**P1 — Noyau pur, hexagonal, testable hors matériel.** *Déjà présent et prescrit.* À
conserver : logique décisionnelle sans I/O, adaptateurs fins. Cible : **une bibliothèque C++
portable** (`core/`) + **firmware mince** d'adaptateurs (4 ports : `Clock`, `I2cBus`, `Rng`,
`Storage` ; le HTTP reste des fonctions pures). Voir `doc/refonte-one.md`.

**P2 — Spécification exécutable + tests de parité comme garde‑fou.** *Atout majeur du
projet.* Conserver le **simulateur** comme oracle et le **pipeline de vecteurs golden**.
La refonte se **mesure au rejeu byte/valeur‑exact**. Étendre la même discipline aux
couches aujourd'hui non couvertes (HTTP/sécurité/pilotes).

**P3 — Contrat unique partagé.** L'**OpenAPI** est la source de vérité de l'API : front,
back C++ et tests doivent en dériver. `core.mjs` prouve la valeur d'une **logique métier
unique partagée** (validation identique front/back) — à préserver (bornes de config
identiques JS ↔ C++).

**P4 — Sûreté à deux niveaux, explicite.** Fail‑safe logiciel **et** heartbeat vers un
**watchdog matériel indépendant** (10 V). État sûr = 100 % garanti même en cas de crash.
Tests dédiés « fault → 100 % » (vecteurs déjà présents).

**P5 — Défense en profondeur (sécurité).** Porter fidèlement la barre du mock (scrypt/KDF
mesurée, anti‑énumération, verrou, CSRF, sessions opaques, CSP). Secrets **effacés en
mémoire** ; **pas de mot de passe universel**.

**P6 — Persistance robuste versionnée.** Schéma + intégrité + **redondance A/B** + anti‑usure
(déjà modélisé). OTA **A/B signé + rollback**. Ring‑buffer historique **sans PII**.

**P7 — Discipline embarquée.** Sur ESP32‑S2 (**pas de FPU**, ~320 Ko RAM) : **allocation
nulle/bornée**, pas d'exceptions/RTTI, JSON **borné avec échappement**, RAII sur les
ressources (bus I²C), `enum class`. *(Ne pas « moderniser » vers du heap STL.)*

**P8 — Hygiène de monorepo.** *Supprimer la fragilité identifiée en §9‑#2* : **aucun
chemin relatif codé en dur entre dossiers frères** (aujourd'hui fonctionnel uniquement parce
que `06 - LOGICIEL EMBARQUE/` est en place). Adopter une structure claire avec
frontières de paquets (ex. un paquet `spec/` partagé importé proprement par le simulateur,
le mock et les générateurs de vecteurs), et des chemins résolus depuis une racine stable.

**P9 — Traçabilité exigences → conception → code → tests.** Les dossiers `00`–`11`
fournissent déjà cette traçabilité (cahier des charges, décisions, interfaces, réception).
La refonte doit **rester rattachée** à ces exigences (ne pas diverger du CDC).

**P10 — Portabilité de cible.** Le contrôleur produit final n'est pas figé (S2 pour le
prototype). Garder le noyau **indépendant du µC** ; isoler tout le spécifique ESP‑IDF dans
les adaptateurs.

### Structure cible proposée (monorepo assaini)
```
sonde-co2/
├─ spec/            simulateur (oracle) + générateur de vecteurs + contrat OpenAPI (source unique)
├─ web/             PWA (public/) + mock serveur + core partagé (importé, non dupliqué)
├─ core/            bibliothèque C++ portable (noyau pur, no-exceptions/no-heap) + tests hôte
├─ firmware/        app ESP-IDF mince (adaptateurs I2C/Wi-Fi/httpd/NVS/FS/clock/rng + PWA embarquée)
├─ tools/           bring-up Arduino unifié (fusion arduino-outils + tests-materiel)
├─ docs/            00–11 (gouvernance, exigences, archi, essais…) + analyses
└─ (racine propre : README, LICENSE, gitignore, CI)
```
Chemins **résolus depuis la racine du dépôt** (variable/`git rev-parse`), jamais via
`../../<dossier à espaces>`.

---

## 13. Ce qui manque pour fonctionner (mis à jour)

- **Build** : corriger le bug §9‑#1 ; installer/figer ESP‑IDF. *(Les chemins croisés §9‑#2
  résolvent tant que `06 - LOGICIEL EMBARQUE/` reste en place ; à assainir plus tard, P8.)*
- **Matériel** : réceptionner le lot 1, identifier la carte S2, **figer GPIO**, propager S2
  (retirer C3), confirmer l'adresse DAC (`0x5F`).
- **Intégration firmware** : câbler pilotes + boucle FreeRTOS dans `main` ; **serveur HTTP
  réel** (`esp_http_server`) ; **orchestration Wi‑Fi** (AP service) ; **PWA embarquée**
  (LittleFS) ; **persistance NVS/LittleFS** réelle ; **aléa** (RNG) ; **KDF** ; **source de
  temps** ; **watchdog matériel** (heartbeat).
- **Sécurité produit** : provisionnement physique des identifiants (les comptes de démo ne
  partent pas en production).
- **Conformité** : réactiver le dossier `02` au moment du prototype vendable (CE/RED/CRA).

---

## 14. Conclusion

Le projet est **bien plus mature qu'un simple firmware** : il possède une **spécification
exécutable** (simulateur), un **contrat d'API partagé** (OpenAPI + PWA), une **traçabilité
d'exigences** complète et une **architecture hexagonale déjà prescrite**. Ces atouts sont
**exactement les bons** pour une refonte propre — il faut les **préserver et durcir**, pas
les réinventer.

La refonte doit donc : (1) **libérer** le noyau en bibliothèque C++ portable testée sur
hôte ; (2) **conserver** simulateur + vecteurs comme oracle de parité ; (3) **assainir la
structure** (monorepo sans chemins croisés fragiles) ; (4) **combler** l'intégration réelle
manquante (HTTP, Wi‑Fi, persistance, PWA embarquée, watchdog matériel) ; (5) **corriger** les
incohérences matérielles (S2, `0x5F`, GPIO) ; le tout **mesuré** au rejeu des vecteurs et
**rattaché** au cahier des charges.
