# Plan de refonte — nouvelle application `app/` (production-ready) — v2

> **But** : créer, dans un **nouveau dossier `sonde-co2/app/`**, une version **propre, robuste,
> simple (non « overkill ») et prête pour la production** du firmware de régulation CO₂,
> **sans aucune régression fonctionnelle** par rapport au prototype.
>
> **Stratégie (v2, phasée)** : le **prototype `wifi_ap_web`** (le plus complet
> fonctionnellement, il tourne réellement sur la carte) est la **base et la référence de
> parité**. On le refactore d'abord en architecture propre **à comportement identique**
> (Phase A), puis on **greffe les apports validés de la production** (régulation PI, auth
> réelle, intégrité, contrat OpenAPI, OTA) **un à un, derrière validation** (Phase B).
>
> **Changements v1 → v2** (suite à la revue critique) : plan **phasé** (parité d'abord) ;
> **mode MANUEL** modélisé de première classe ; **bornes de config du prototype conservées** ;
> **AP toujours actif conservé** (mode service repoussé en option) ; **couche API rendue
> pure** ; **modèle de concurrence fixé** (super-boucle coopérative) ; **conventions de
> nommage** explicitées ; ajout d'une **checklist de parité** mesurable.
>
> Contexte : `doc/analyse-two.md`, `doc/analyse-proto.md`, `doc/analyse-old.md`.

---

## 1. Principes directeurs

1. **Zéro régression** : le comportement du prototype est un **contrat**. Toute fonction du
   prototype doit exister à l'identique en fin de **Phase A** (checklist §3, vérifiée).
2. **Le prototype fournit le squelette qui tourne** (I²C SCD41, DAC `0x5F`, Wi‑Fi `softAP`,
   serveur HTTP, NVS, boucle temps réel) — on **refactore**, on ne réécrit pas.
3. **La production fournit des apports validés** (régulation PI à parité simulateur, auth
   réelle, intégrité config, contrat) — **greffés en Phase B**, chacun validé.
4. **Architecture hexagonale allégée** : noyau **pur portable** (testable sur PC) +
   adaptateurs matériels fins. Séparation logique/matériel **prescrite** par l'archi système.
5. **Simple, pas overkill** : ~6 modules cohésifs, pas 20. Une brique n'est ajoutée que si
   elle sert la **sûreté, la sécurité ou la robustesse réelles**.
6. **Sûreté d'abord** : état sûr = **ventilation 100 %** ; watchdog nourri ; **heartbeat**
   réservé pour le futur watchdog matériel indépendant.
7. **Un seul emplacement** : tout dans `sonde-co2/app/`. `firmware-esp32/` et le prototype
   restent des **références** (non supprimés).

---

## 2. Décisions d'architecture structurantes

### D1 — Framework : **PlatformIO + Arduino‑ESP32** (device) + **native** (tests hôte)
Réutilise directement le code éprouvé du prototype ; simple ; donne accès (via ESP‑IDF 5.x
sous‑jacent) à **OTA, partitions A/B, NVS, LittleFS, task‑watchdog, brownout**. L'env
**`native`** teste le **noyau pur sur PC**. *Alternative documentée : ESP‑IDF pur pour secure
boot/flash encryption — migration peu coûteuse car seuls les adaptateurs changeraient.*

### D2 — Architecture : **hexagonale allégée**
```
web (PWA)  ──►  runtime (composition + boucle)  ──►  ports (interfaces)  ◄──  adapters (matériel)
                          │
                          ▼
                    core (pur, testable)   ◄── appelle les ports (clock, i2c, stockage, random)
```
Règle : **les dépendances pointent vers le `core`** ; `core` ne connaît **ni Arduino ni ESP‑IDF**.

### D3 — Origine du code (rééquilibrée)
- **`core`** = **prototype refactoré (Phase A)**, puis **enrichi des modules validés de la
  production (Phase B)**.
- **`adapters`** = **I/O éprouvée du prototype**, propre.
- **`web`** = **PWA du dossier 07** (Phase B ; en Phase A, l'UI du prototype est conservée).

### D4 — Couche API **pure** + contrat progressif
Le **routage, l'authentification, la validation et la sérialisation** vivent dans
`core/api` (fonctions **requête → réponse**, testables hors réseau). L'adaptateur
`http_server` ne fait **que le transport**. Le contrat **OpenAPI 0.3.0** est la cible ;
alignement **progressif** (Phase A garde l'API du prototype, Phase B migre vers `/api/v1`).

### D5 — Modèle de concurrence : **super‑boucle coopérative**
Un **seul fil d'exécution** (comme le prototype ; l'ESP32‑S2 est **mono‑cœur**) : la boucle
séquence capteur → régulation → DAC → historique → service HTTP. **Aucun partage d'état
concurrent, aucun verrou.** *(On n'introduit pas de tâches FreeRTOS partageant l'état — cela
ajouterait des verrous et des risques sans bénéfice ici.)*

### D6 — Sûreté à deux niveaux
Fail‑safe logiciel **100 %** + **feed watchdog** + **heartbeat GPIO** réservé pour le futur
**watchdog matériel indépendant** (repli 10 V si blocage logiciel).

### D7 — Matériel figé (corrections intégrées)
Cible **ESP32‑S2** (`board = lolin_s2_mini`) ; I²C **SDA=GPIO15 / SCL=GPIO21**
(configurables) ; **SCD41 `0x62`**, **DAC `0x5F`** (corrige le `0x58` de la production) ;
VOUT0/VOUT1 identiques, jamais reliés à un GPIO.

### D8 — Conventions de nommage (cf. §5)
Fichiers **snake_case** `.hpp`/`.cpp` ; types **PascalCase** ; fonctions/variables
**snake_case** ; constantes **`kPascalCase`** ; namespace projet **`vco2`**.

---

## 3. Checklist de parité prototype (anti‑régression, vérifiée fin de Phase A)

Chaque ligne doit être **préservée à l'identique**. C'est le critère de sortie de Phase A.

| # | Fonction | Comportement à conserver |
|---|---|---|
| 1 | Wi‑Fi AP | **toujours actif** ; SSID `VENT‑CO2‑TEST`, mot de passe `ventco2test`, max 4 clients |
| 2 | Portail captif | DNS `*`→`192.168.4.1` + redirection des routes inconnues |
| 3 | Interface web | 4 vues (Accueil / Réglages / Test / Historique) |
| 4 | API | endpoints équivalents (`status`, `settings`, `history`, `history.csv`) |
| 5 | **Mode MANUEL** | persistant, **slider continu 0–100 %**, sortie = valeur choisie |
| 6 | Mode AUTO | proportionnel entre `cible‑100`→min et `cible+300`→max ; défaut lecture → **max** |
| 7 | **Bornes config** | **target 600–2000, min 0–80, max 20–100, manual 0–100** (`min ≤ max`) |
| 8 | Lecture SCD41 | CO₂ + température + humidité, CRC8 vérifié |
| 9 | DAC | range 10 V, **canaux 0 et 1** même valeur, adresse `0x5F` |
| 10 | Historique | RAM, **288 points, 1/5 min**, 1er point à la 1re mesure valide |
| 11 | **Export CSV** | BOM UTF‑8, séparateur `;`, décimales `,`, colonnes `age_secondes;age_hhmmss;co2_ppm;temperature_c;humidite_rh;sortie_pct`, fichier `historique_co2_24h.csv` |
| 12 | Réglages | validation serveur des bornes (422 hors plage) + persistance NVS |
| 13 | Diagnostic série | boot, AP, HTTP prêt, présence capteur/DAC, ligne d'état périodique |
| 14 | Sortie de sécurité | DAC en sortie sûre au démarrage avant régulation |
| 15 | Tensions | `V = output_pct / 10` (0 %→0 V … 100 %→10 V) |

> **Note** : les **bornes de config** (#7) et l'**AP permanent** (#1) **divergent** des
> valeurs OpenAPI/production. En Phase A on **garde celles du prototype** (no régression) ;
> tout resserrement (ex. 800–1400/50–100) devient une **décision produit explicite** en
> Phase B, pas un changement silencieux.

---

## 4. Arborescence cible `app/`

```
app/
├── platformio.ini            # env "esp32s2" (device) + env "native" (tests hôte)
├── partitions.csv            # 4 Mo : nvs + otadata + app0 + app1 (OTA A/B) + littlefs + coredump
├── sdkconfig.defaults        # options ESP-IDF sous-jacentes (task-wdt, brownout, nvs)
├── README.md                 # ★ README détaillé (voir §12)
├── .clang-format
├── .clang-tidy
├── .gitignore
│
├── src/                      # POINT D'ENTRÉE device (mince)
│   └── main.cpp              # setup() + loop() : uniquement le câblage (délègue à runtime)
│
├── lib/                      # bibliothèques modulaires (résolues par PlatformIO)
│   ├── core/                 # ★ PUR — aucun include Arduino/ESP-IDF — testé sur hôte
│   │   ├── control/          # machine à états MODE (startup/auto/manuel/test/force_open/fault)
│   │   │                     #   + loi de régulation (proportionnel puis PI) + sortie sûre
│   │   ├── config/           # modèle + validation (bornes prototype) + (dé)sérialisation + CRC
│   │   ├── history/          # journal circulaire mesures + événements (sans PII)
│   │   ├── auth/             # session + vérification mot de passe + anti-bruteforce
│   │   ├── api/              # ★ requête → réponse PURE (routage, validation, JSON)
│   │   └── protocol/         # trames SCD41 (CRC8) + DAC (12 bits) — logique pure
│   │
│   ├── ports/                # INTERFACES abstraites (le core parle à ça)
│   │   └── ports.hpp         # Clock, I2cBus, KeyValueStore, Random
│   │
│   ├── adapters/             # IMPLÉMENTATIONS matérielles (récoltées du prototype)
│   │   ├── i2c_bus.{hpp,cpp}       # Wire  → I2cBus
│   │   ├── scd41.{hpp,cpp}         # capteur CO2 (séquence éprouvée)
│   │   ├── dfr0971_dac.{hpp,cpp}   # DAC 0-10 V (registres, 0x5F)
│   │   ├── nvs_store.{hpp,cpp}     # Preferences → KeyValueStore
│   │   ├── wifi_ap.{hpp,cpp}       # WiFi.softAP + DNS captif
│   │   ├── http_server.{hpp,cpp}   # WebServer → transport (appelle core/api)
│   │   ├── esp_clock.{hpp,cpp}     # millis()/epoch → Clock
│   │   └── esp_random.{hpp,cpp}    # esp_random → Random
│   │
│   └── runtime/              # COMPOSITION + boucle temps réel (device uniquement)
│       ├── app.{hpp,cpp}           # composition root : instancie + injecte les ports
│       └── control_loop.{hpp,cpp}  # séquence capteur→régulation→DAC→historique
│
├── data/                     # ★ assets PWA servis via LittleFS (Phase B)
│
├── test/                     # ★ tests hôte (env native) + données
│   ├── test_control/
│   ├── test_config/
│   ├── test_history/
│   ├── test_auth/
│   ├── test_api/
│   └── vectors/              # vecteurs golden (données de parité, pas une suite de test)
│
└── scripts/                  # génération de vecteurs, embarquement des assets, helpers flash
```

**Notes de structure**
- `lib/core/**` **n'inclut jamais `Arduino.h`** → en env `native`, seul le `core` compile
  (tests sans carte). Adaptateurs et `main.cpp` compilent **uniquement** pour `esp32s2`.
- `runtime` (et non `app`) nomme la couche d'orchestration, pour **éviter la collision** avec
  le dossier racine `app/`.
- Assets PWA en **LittleFS `data/`** (`pio run -t uploadfs`) ; page minimale de secours en
  `PROGMEM` dans `http_server`.

---

## 5. Conventions de nommage (usage C++ / PlatformIO)

- **Dossiers de bibliothèque** (`lib/<nom>`) : **snake_case**, un nom **court et parlant**
  (`core`, `ports`, `adapters`, `runtime`).
- **Fichiers** : **snake_case**, extensions **`.hpp` / `.cpp`** (signale du C++ ; cohérent
  avec le code existant). En‑têtes protégés par **`#pragma once`**.
- **Types (classes/structs/enum)** : **PascalCase** (`Controller`, `SensorSample`,
  `ControlMode`).
- **Fonctions & variables** : **snake_case** (`read_measurement`, `output_pct`).
- **Constantes de compilation** : **`kPascalCase`** (`kScd41Address`, `kHistoryCapacity`).
- **Interfaces (ports)** : nom **direct sans préfixe `I`** (`Clock`, `I2cBus`,
  `KeyValueStore`, `Random`) — idiomatique C++ moderne.
- **Namespace projet** : **`vco2`** (ventilation CO₂), sous‑espaces optionnels
  (`vco2::core`, `vco2::adapters`).
- **Suites de test** : dossiers **`test_<module>`** (convention PlatformIO).
- **Macros** : évitées ; sinon `VCO2_UPPER_SNAKE`.

---

## 6. Les couches en détail

### 6.1 `core/` — noyau pur
- **`control`** — **une seule machine à états MODE** :
  `STARTUP → AUTO ⇄ MANUEL`, plus `TEST`, `FORCE_OPEN`, `FAULT`. Elle intègre :
  - **MANUEL** (persistant, **0–100 % continu**) — *corrige la régression #5* ;
  - **AUTO** via une **loi interchangeable** : **proportionnel du prototype** (Phase A,
    parité) puis **PI + filtre + rampe + anti‑windup** (Phase B, validé vecteurs + banc) ;
  - **sortie sûre 100 %** sur défaut/startup.
- **`config`** — modèle 5–7 paramètres, **validation aux bornes du prototype** (§3‑#7),
  (dé)sérialisation + **CRC32** + version de schéma (robustesse interne, sans changer les
  plages exposées).
- **`history`** — journal circulaire mesures + événements, **sans texte libre ni PII**.
- **`auth`** — session (jeton opaque), **vérification mot de passe hachée**, comparaison
  **temps constant**, verrou anti‑bruteforce. *(Phase B : durcit l'auth factice du prototype.)*
- **`api`** — **logique HTTP pure** : `handle(request) → response` (route, rôle, validation,
  corps JSON). *Corrige le couplage transport de la v1 ; testable hors réseau.*
- **`protocol`** — trames **SCD41 (CRC8)** et **DAC (12 bits)** : construction/validation pures.

### 6.2 `ports/` — interfaces minimales
`Clock`, `I2cBus`, `KeyValueStore`, `Random`. Le Wi‑Fi et le serveur HTTP restent des
adaptateurs concrets pilotés par `runtime` (un seul back‑end → on ne sur‑abstrait pas), **mais
la logique HTTP est pure dans `core/api`** (donc testable malgré tout).

### 6.3 `adapters/` — matériel (récolté du prototype)
`scd41` (start/read + CRC), `dfr0971_dac` (`0x5F`, range `0x11`, canaux `0x02/0x04`,
`code<<4`), `nvs_store` (Preferences + enrobage version/CRC), `wifi_ap` (`softAP` + DNS),
`http_server` (transport → appelle `core/api`), `esp_clock`, `esp_random`.

### 6.4 `runtime/` — composition + boucle
- **`app`** : instancie adaptateurs + core, **injecte les ports**, démarre Wi‑Fi/HTTP.
- **`control_loop`** : **super‑boucle coopérative** — capteur (~5 s) → régulation → DAC
  (~1 s) → historique (5 min) → `server.handle()`. Aucun verrou (D5).

### 6.5 `web/` + `data/`
Phase A : UI du prototype (HTML embarqué) — parité. Phase B : **PWA du dossier 07** en
LittleFS (contrat `/api/v1`), **à condition d'y ajouter le mode MANUEL** (absent du contrat
actuel) pour ne pas régresser #5.

---

## 7. Bonnes pratiques de code

- **C++17**, `-Wall -Wextra -Wpedantic -Werror`.
- **`-fno-exceptions -fno-rtti`** → erreurs **par valeurs** : un **type `Result` unique**
  (`enum class Status` + `std::optional`), jamais d'exception.
- **Une seule unité de temps dans le core : la milliseconde** (les adaptateurs convertissent).
- **Pas d'allocation dynamique dans la boucle** : `std::array`, buffers bornés,
  `std::span`/`std::string_view`. `String` Arduino tolérée **hors** chemin critique.
- **RAII**, **`const`‑correct**, fonctions courtes, un niveau d'abstraction par fonction.
- **`enum class`**, **`constexpr`**, **pas d'état global mutable** dispersé (encapsulé).
- **`clang-format`** + **`clang-tidy`** + **`cppcheck`** en CI ; **ASan/UBSan** en `native`.
- **Interdits** : secrets en clair (code/logs) ; mot de passe universel ; texte réseau dans
  les journaux ; `delay()` longs bloquants.

---

## 8. Sûreté & robustesse

- **État sûr = 100 %** sur : CO₂ invalide, capteur absent/hors‑plage/figé, CO₂ haut
  persistant, échec I²C, config absente, **démarrage**.
- **DAC sûr au démarrage** (plage + sortie sûre **avant** régulation) ; **jamais** de
  mémorisation de plage dans la boucle.
- **Task‑watchdog** + **brownout** activés ; **heartbeat GPIO** pour le futur watchdog
  matériel (10 V).
- **OTA A/B + rollback** (Phase B) ; **config versionnée + CRC** (refus corrompu → usine).
- **Débit minimal** = borne dure jamais franchie ; **redémarrages répétés** → mode dégradé sûr.

---

## 9. Sécurité (Phase B, prioritaire)

- **Auth serveur réelle** : jeton de session issu du **RNG matériel**, mot de passe
  **haché + sel** (PBKDF2/HMAC mbedTLS, coût mesuré sur S2), comparaison **temps constant**,
  expiration 15 min, verrou **5 échecs/30 s** + `Retry‑After`. → supprime l'auth **factice**
  du prototype.
- **En‑têtes durcis** (`no-store`, `nosniff`, `DENY`, **CSP stricte**), repris du mock 07.
- **Provisionnement** des identifiants en fabrication ; pas de mot de passe par défaut.
- **Alignement OpenAPI progressif** (CSRF, `If‑Match`, rôles).
- **Secrets** effacés après usage ; jamais journalisés.

---

## 10. Stratégie de test

1. **Tests unitaires hôte** (`env:native`, Unity ou GoogleTest) sur tout le `core`
   (control, config, history, auth, api, protocol).
2. **Parité** : rejouer les **vecteurs golden** du simulateur (`test/vectors/`) — Phase B,
   quand la PI est introduite.
3. **Analyse statique** + **sanitizers** en CI.
4. **Checklist de parité prototype (§3)** vérifiée en fin de Phase A.
5. **Smoke tests carte** : scan I²C (`0x62`/`0x5F`), boucle, endpoints, DAC au multimètre
   (0/2/5/8/10 V ±0,10 V).
6. **Protocole de réception du lot 1** (dossier 08) en validation d'acceptation.
7. **CI** : build `native` + tests + analyse statique + build `esp32s2` à chaque push.

---

## 11. Partitions, OTA & déploiement

- **`partitions.csv`** (4 Mo) : `nvs` + `otadata` + `app0` + `app1` + `littlefs` + `coredump`.
- **Build** : `pio run -e esp32s2` ; **tests** : `pio test -e native`.
- **Flash usine** : `pio run -e esp32s2 -t upload` + `pio run -t uploadfs`.
- **OTA terrain** (Phase B) : mise à jour **signée** depuis le navigateur (mode service),
  partition inactive, **bascule + rollback** automatique, version journalisée.
- **Reproductibilité** : versions PlatformIO/plateforme **figées**.

---

## 12. Livrable README détaillé (`app/README.md`)

Sections minimales :
1. **Synthèse projet** — fonction, cible matérielle, principe de sûreté.
2. **Architecture** — schéma des couches, règle de dépendance, où vit quoi (+ renvois docs).
3. **Prérequis** — VS Code + PlatformIO, drivers USB, matériel, câblage (GPIO/I²C).
4. **Installation du projet** — cloner, ouvrir `app/`, dépendances.
5. **Build** — `pio test -e native`, `pio run -e esp32s2` ; sorties (`firmware.bin`).
6. **Flash & déploiement** — `upload`, `uploadfs`, port série, moniteur, **OTA + rollback**.
7. **Configuration & utilisation** — Wi‑Fi `VENT‑CO2‑XXXX`, `192.168.4.1`, connexion
   installateur, AUTO/MANUEL, seuils, export CSV.
8. **Tests** — hôte, parité, analyse statique.
9. **Sécurité** — modèle d'auth, provisionnement, ce qu'on ne committe jamais.
10. **Dépannage** — carte non détectée, flash, capteur/DAC absents, sortie 0–10 V figée.
11. **Structure & conventions** — arborescence, nommage, contribution.

---

## 13. Plan d'exécution phasé

### Phase A — Parité prototype sur architecture propre *(zéro régression, build qui tourne)*
A1. **Échafauder `app/`** : `platformio.ini` (2 envs), arborescence, `README` initial,
   `.clang-format`/`.clang-tidy`, CI. « Hello » qui compile en `native` **et** `esp32s2`.
A2. **Découper le prototype** en `core` (control **avec MANUEL**, config **bornes proto**,
   history, api, protocol) + `ports` + `adapters` (récoltés) + `runtime`, **comportement
   identique**.
A3. **Tests hôte** sur le `core` (loi proportionnelle, validation config, ring buffer, api).
A4. **Premier flash** : reproduire le comportement connu‑bon (série, AP, mesures, DAC, UI, CSV).
A5. **Valider la checklist §3** → critère de sortie de Phase A.

### Phase B — Apports validés de la production *(chaque item derrière validation)*
B1. **Sécurité serveur réelle** (auth, hash, RNG, verrou, en‑têtes) — prioritaire.
B2. **Régulation PI** interchangeable, **validée vecteurs + banc** avant de devenir défaut.
B3. **Intégrité config** (version + CRC) et, si retenu, **redondance A/B**.
B4. **Migration API `/api/v1` + PWA 07** (avec **ajout du mode MANUEL** au contrat).
B5. **OTA A/B + rollback**, **task‑watchdog**, **heartbeat** watchdog matériel.
B6. **Décisions produit** : bornes de config (proto vs OpenAPI), mode service (bouton 3 s /
   AP 15 min) — **explicites**, pas silencieuses.
B7. **Durcissement** : zéro warning, sanitizers, README complet, protocole de réception.

---

## 14. Mapping « d'où vient quoi »

| Module `app/` | Phase A (parité) | Phase B (apport) |
|---|---|---|
| `core/control` | proportionnel + **MANUEL** (prototype) | **PI** validé (production/simulateur) |
| `core/config` | bornes **prototype** | version + CRC (production) |
| `core/history` | RAM 288/5 min + CSV (prototype) | format binaire/LittleFS (production) |
| `core/auth` | gate simple (prototype) | **auth réelle** (production) |
| `core/api` | endpoints prototype | contrat **OpenAPI** (production/07) |
| `core/protocol` | trames du prototype | contrats (production) |
| `adapters/*` | **prototype** (I²C/DAC/Wi‑Fi/HTTP/NVS) | — |
| `runtime/*` | boucle du prototype | — |
| `web` + `data` | UI prototype | **PWA 07** |
| `test/vectors` | — | **simulateur** (parité) |

---

## 15. Ce qu'on garde / ce qu'on abandonne

**Garde** : du **prototype** → l'intégration qui marche + le comportement (baseline de
parité) ; de la **production** → l'architecture, la PI validée, l'auth réelle, l'intégrité,
le contrat ; du **simulateur** → les vecteurs ; du **07** → la PWA.

**Abandonne** : le monolithe Arduino, l'auth factice, la régulation naïve *par défaut* (gardée
en repli), le `main` « à blanc » et les 20 micro‑composants de la production, l'adresse
`0x58`, les restes ESP32‑C3.

---

## 16. Risques & garde‑fous

| Risque | Garde‑fou |
|---|---|
| Régression fonctionnelle | **Checklist §3** vérifiée en fin de Phase A |
| Le `core` production ne compilait pas | Bug corrigé ; **CI build `native`** dès A1 |
| Changer un comportement en portant la PI | **Vecteurs golden** + validation banc avant de rendre la PI défaut (B2) |
| Perdre le mode MANUEL | **Modélisé** dans la machine à états `control` (A2) ; ajouté au contrat en B4 |
| Rétrécir les réglages | Bornes **prototype** en Phase A ; resserrement = **décision produit** (B6) |
| Retirer l'AP permanent | AP **toujours actif** conservé ; mode service = **option** (B6) |
| Concurrence/verrous | **Super‑boucle coopérative** (D5), aucun partage d'état |
| Sur‑ingénierie | Règle « pas de brique sans justification sûreté/sécurité/robustesse » |
| Dépendance Arduino | Ports/adapters isolent le matériel → migration ESP‑IDF possible |

---

## 17. Synthèse en une phrase

**Refactorer d'abord le prototype en architecture propre à comportement identique (Phase A,
zéro régression, prouvée par une checklist et des tests hôte), puis y greffer un à un les
apports validés de la production (PI, auth, intégrité, contrat, OTA) derrière validation
(Phase B) — sur une super‑boucle coopérative simple, un noyau pur testable, et des noms de
dossiers/fichiers conformes aux usages C++/PlatformIO.**

---

## 18. Point de reprise (handoff) — pour redémarrer sans contexte

### 18.1 État au moment du handoff
- **Rien n'est encore implémenté.** Le dossier `app/` **n'existe pas** ; aucune ligne de code
  de la refonte n'est écrite. Les analyses et ce plan sont faits.
- **Prochaine action concrète = Phase A1** (§13) : échafauder `app/` (`platformio.ini` à
  2 environnements, arborescence §4, `README` initial, `.clang-format`/`.clang-tidy`, CI),
  puis un « hello » qui compile en `native` **et** `esp32s2`.

### 18.2 Chemins sources exacts (racine = `sonde-co2/`)
- **Prototype (base Phase A)** :
  `06 - LOGICIEL EMBARQUE/firmware-esp32/tests-materiel/wifi_ap_web/{platformio.ini, src/main.cpp}`
- **Production (apports Phase B, modules purs à récolter)** :
  `06 - LOGICIEL EMBARQUE/firmware-esp32/components/{control_core, config_store, history_log,
  service_mode, local_auth, credential_store, hardware_contracts, lot1_drivers, api_*,
  http_*}`
- **Simulateur (oracle de parité)** : `06 - LOGICIEL EMBARQUE/simulateur/`
  et vecteurs générés : `06 - LOGICIEL EMBARQUE/firmware-esp32/test/vectors/*.json`
- **PWA + contrat OpenAPI** : `07 - INTERFACE WEB LOCALE/` (contrat `CONTRAT API LOCALE
  V0.1.json` → `info.version = 0.3.0`) + `maquette-web-locale/public/`
- **Procédure de flash de référence** : `install.md` (racine)

### 18.3 Corrections connues à porter (ne pas réintroduire)
- **Adresse DAC** : utiliser **`0x5F`** (prototype/banc). La production code `0x58`
  (`components/hardware_contracts/include/hardware_contracts.hpp`) — **faux pour le banc**.
- **Bug de build production** (pertinent seulement en B2, si on récolte les pilotes prod) :
  `components/lot1_drivers/lot1_drivers.cpp:66` — `I2cWrite::bytes` (`array<8>`) initialisé
  depuis `frame.bytes` (`array<4>`) → à corriger.
- **Cible** : **ESP32‑S2** (`board = lolin_s2_mini`) — retirer tout reste **ESP32‑C3**.
- **GPIO** : SDA=15 / SCL=21 (prototype, fonctionnels) mais **non figés matériellement** →
  garder configurables + scan I²C au boot.

### 18.4 Constantes de parité (valeurs exactes du prototype à conserver)
SSID `VENT-CO2-TEST` · mot de passe Wi‑Fi `ventco2test` · SCD41 `0x62` · DAC `0x5F`
(range reg `0x01`=`0x11`, canaux `0x02`/`0x04`, code 12 bits `<<4`) · historique 288 pts /
5 min · timings boucle : capteur 5 s, DAC 1 s, historique 5 min, série 5 s, Wi‑Fi 10 s ·
`V = output_pct/10` · CSV : BOM, `;`, décimales `,`, fichier `historique_co2_24h.csv`.
*(Détail complet dans `install.md` et `analyse-proto.md`.)*

### 18.5 Décisions encore ouvertes (à trancher au fil de l'eau)
- **Framework de test hôte** : **Unity** (recommandé, intégré PlatformIO) ou GoogleTest.
- **Jeu exact des paramètres de config** : reprendre les 5 du prototype (`target`, `min`,
  `max`, `manual`, `manualMode`) ; ajout éventuel de `highAlarm`/`historyPeriod` (production).
- **Redondance config A/B** (B3) : oui/non — non indispensable au prototype.
- **Bornes de config** (B6) : prototype (600–2000 / 20–100) **vs** OpenAPI (800–1400 / 50–100)
  — décision produit.
- **Mode service / bouton 3 s / AP 15 min** (B6) : option produit, GPIO bouton à figer.

### 18.6 Ordre de lecture recommandé pour reprendre
1. Ce fichier (`plan-refonte.md`) — le plan.
2. `analyse-proto.md` — prototype ↔ production (valeurs + écarts).
3. `install.md` — constantes prototype + procédure build/flash de référence.
4. `analyse-old.md` / `analyse-two.md` — détail production / projet global (au besoin).

### 18.7 Critère de « fait » de la première étape
Phase A terminée quand : `app/` compile en `native` **et** `esp32s2`, les tests hôte du
`core` passent, le firmware flashé reproduit le comportement du prototype, et **la checklist
§3 est intégralement cochée**.
