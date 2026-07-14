# Refonte du firmware `sonde-co2` — dossier de préparation

> Ce document réunit trois choses :
> 1. **l'architecture actuelle** (résultat de l'analyse visuelle) ;
> 2. le **plan de refonte cible**, précédé d'une **revue critique** confrontant le plan
>    initial aux bonnes pratiques d'architecture et de code pour un firmware embarqué de
>    sûreté, débouchant sur un **plan révisé** ;
> 3. trois **points de clarification** (PWA, simulateur JS de référence, notion de « code
>    compilé / fichier flashable »).
>
> Complément : `analyse-old.md` contient l'analyse détaillée de l'existant.

---

# Partie 1 — Architecture actuelle

## Vocation

Firmware d'un **régulateur de ventilation piloté par le CO₂**, cible **ESP32-S2 (Wemos S2
Mini)**. Un capteur `SCD41` mesure le CO₂ ; un cœur de régulation **PI** en déduit un taux
d'ouverture (0–100 %) pour tenir une cible (défaut 1000 ppm) ; un DAC `DFR0971` (0–10 V)
commande le variateur. Une interface web locale (PWA sur Wi-Fi, à rôles) permet
configuration et supervision. Mode service par appui long, historique/événements en flash.

## Chiffres clés

| | |
|---|---|
| Cible | ESP32-S2 (Wemos S2 Mini) |
| Code | ~3 700 lignes C++ |
| Composants | 20 modules ESP-IDF |
| Build | **✗ ne compile pas** |
| État sûr | **100 % ventilation** |

## Un « ports & adapters » fait main

Séparation stricte **logique pure / effets de bord**. Le noyau *calcule quoi faire*
(trames I²C, actions, plans HTTP, JSON) sans jamais toucher au matériel ; un fin shell
d'adaptateurs exécute l'I/O réelle. C'est ce qui rend le noyau testable sur PC.

```
┌──────────────────────────────────────────────────────────────┐
│  SHELL / ADAPTATEURS (I/O réelle, ESP-IDF)                   │
│  • app_main.cpp   • esp32_i2c_port (seul I/O réel)          │
│  • tests-materiel/* (sketches Arduino, séparés)             │
└──────────────────────────────────────────────────────────────┘
                      ▲  intentions : trames · actions · plans
┌──────────────────────────────────────────────────────────────┐
│  NOYAU PUR (déterministe · sans I/O · testable sur hôte)    │
│  Contrôle-commande : control_core · sensor_cycle ·           │
│                      actuator_output · firmware_app          │
│  HTTP/API : http_api_contract · api_request_guard ·          │
│             http_server_app · api_handlers ·                 │
│             api_payloads · api_response                       │
│  Contrats & pilotes : hardware_contracts · lot1_drivers      │
│  Sécurité : local_auth · credential_store                    │
│  Persistance & transverse : config_store · history_log ·     │
│                             service_mode                      │
└──────────────────────────────────────────────────────────────┘
```

## Les deux flux

**Temps réel** (`firmware_app::update`, à chaque tick) :
`sensor_cycle` → `control_core` → `actuator_output` → `history_log`
(le `service_mode` tourne en parallèle).

**HTTP** (par requête, 11 routes `/api/v1`) :
`api_request_guard` (auth/CSRF/taille) → `http_server_app` (plan) → `api_handlers`
(parse/valide/exécute) → `api_payloads` / `api_response`.

## Principe de sûreté — `FAIL → 100 %`

L'état sûr est la **ventilation à plein débit**. Au démarrage, sur défaut capteur, CO₂ trop
haut, échec I²C, ou tant que le matériel n'est pas validé → sortie **forcée à 100 %**. Ce
repli est câblé dans presque chaque branche des machines à états.

## Défauts concrets relevés

- **NE COMPILE PAS** — `lot1_drivers.cpp:66` : `I2cWrite::bytes` (`array<8>`) initialisé
  depuis `frame.bytes` (`array<4>`). Interdit en C++ standard.
- **INCOHÉRENCE** — adresse I²C du DAC : `0x58` dans le code vs `0x5F` dans le test matériel.
- **DONNÉES** — `boot_id` / séquences non persistés (repartent de 0) ; `epoch_seconds`
  toujours 0 → historique sans datation.
- **COUPLAGE** — la couche « matériel » (`sensor_cycle`, `actuator_output`) dépend de la
  couche « contrôle ». À inverser.

## Ce qui manque pour fonctionner (résumé)

- **Référentiel absent** : simulateur JS `controller.js`, contrat OpenAPI, maquette PWA,
  assets web.
- **Couches non implémentées** : serveur HTTP réel, orchestration Wi-Fi, persistance
  NVS/LittleFS, aléa (tokens/CSRF), source de temps, KDF mot de passe.
- **Intégration « lot 1 »** : identification carte, gel des GPIO, câblage pilotes + boucle
  FreeRTOS dans `main`.
- **Build** : bug de type à corriger, chaîne ESP-IDF à installer/figer, vrais tests C++
  inexistants.

*(Détail complet dans `analyse-old.md`, §9.)*

---

# Partie 2 — Plan de refonte

## 2.1 Rappel du plan initial

- Séparer un **`core/` C++20 portable** (testé sur PC) d'une **app ESP-IDF mince**
  d'adaptateurs (ports & adapters).
- Consolider les 20 micro-composants en ~7 modules cohésifs.
- Introduire des **ports** (interfaces) : `I2cBus`, `Clock`, `Rng`, `KeyValue`, `BlobLog`,
  `HttpServer`.
- Moderniser : `std::expected` / `std::optional` / `std::span`, une lib JSON, mbedTLS,
  RAII.
- Séquencement : débloquer → extraire → ports → combler → moderniser.

## 2.2 Revue critique du plan initial

Confrontation aux exigences propres à un **firmware embarqué de sûreté** sur MCU
contraint. Le plan initial est bon sur la structure, mais **trop “C++ de bureau”** sur
plusieurs points. Corrections :

**C1 — Ne pas jeter la discipline « zéro allocation dynamique ».**
Le style initial (buffers fixes, `std::array`, pas de tas) était **correct** pour
l'embarqué et je l'avais trop vite remplacé par `std::string` + lib JSON généraliste.
Sur ESP32-S2 (~320 Ko RAM), l'allocation heap dans le chemin temps réel et HTTP est un
risque (fragmentation, non-déterminisme, OOM). **Décision : le noyau reste à allocation
nulle ou bornée** (capacités fixes, `std::span`, conteneurs à capacité statique type
`etl`/`std::array`). On modernise les *types de retour* (`expected`/`optional`/`span`)
sans introduire d'allocations.

**C2 — Exceptions et RTTI désactivées.**
ESP-IDF les désactive par défaut (coût flash/déterminisme). Le plan doit l'assumer :
gestion d'erreur par **valeurs** (`expected`-like), pas d'exceptions, pas de `dynamic_cast`.
`std::expected` convient (il n'exige pas les exceptions).

**C3 — Minimiser les ports (interfaces virtuelles).**
Six interfaces, c'est trop pour « le plus simple possible ». Seuls les appels que le noyau
émet **réellement vers l'extérieur** justifient un port :
`Clock`, `I2cBus`, `Rng`, `Storage` (NVS + journal). **Le domaine HTTP est déjà composé de
fonctions pures** qui *retournent* un plan/JSON ; l'adaptateur `esp_http_server` les
appelle — **aucune interface `HttpServer` n'est nécessaire**. On passe de 6 ports à **4**.

**C4 — Dispatch dynamique : choix conscient, acceptable ici.**
La boucle de régulation tourne à ~0,2 Hz (mesure SCD41 toutes les 5 s). Le coût d'un appel
`virtual` y est **totalement négligeable**. On garde donc des interfaces virtuelles simples
(lisibles, faciles à mocker) plutôt que du polymorphisme par templates (zéro-coût mais
verbeux, tout en header). Décision documentée, pas subie.

**C5 — JSON adapté à l'embarqué.**
`nlohmann`/`glaze` allouent massivement → inadaptés. **Décision :** parseur/sérialiseur
**borné** — soit ArduinoJson avec document à taille fixe, soit un petit sérialiseur maison
mais **avec échappement JSON correct** (le manque actuel). L'objectif est de tuer le
parsing par `strstr` et la sérialisation `%s` sans échappement, sans importer un moteur
JSON de serveur.

**C6 — La sûreté doit être un souci transverse de premier plan, pas « préservée ».**
Pour une fonction de sûreté, il faut : état sûr **explicite et indépendant** (sortie 100 %
même si le firmware plante), **watchdog matériel** (déjà activé dans `sdkconfig`),
détection **brownout**, et — si le matériel le permet — un **niveau par défaut sûr câblé**
(pull sur l'entrée du variateur) pour couvrir le cas « MCU muet ». À spécifier comme
exigence, avec tests dédiés.

**C7 — Ne pas sur-fusionner les composants.**
Passer de 20 à ~7 modules simplifie le build, mais la granularité fine était un **atout de
testabilité**. On garde des **frontières internes nettes** (namespaces + entêtes par
responsabilité) à l'intérieur de chaque module, pour ne pas ré-introduire du couplage.

**C8 — Flottant émulé sur S2.**
L'ESP32-S2 **n'a pas de FPU** : les calculs `float` de la régulation sont émulés en
logiciel. À 0,2 Hz c'est acceptable ; on **garde le float** (simplicité, parité avec le
simulateur) mais on le **note** et on évite le float hors du cœur de calcul.

**C9 — Qualité outillée, pas seulement « des tests ».**
Ajouter au plan : **analyse statique** (clang-tidy, cppcheck), **sanitizers** sur build
hôte (ASan/UBSan), un **standard de codage** léger (sous-ensemble type MISRA/C++ Core
Guidelines adapté), et les **vecteurs de parité JS** comme tests d'or. Build **reproductible**,
version ESP-IDF **figée**.

## 2.3 Plan de refonte révisé

### Principe directeur
**Le noyau est déjà pur et portable — ne pas le réécrire, le libérer.** Le séparer en une
bibliothèque testable sur PC, à **allocation nulle/bornée, sans exceptions**, et lui fournir
le « shell » d'exécution qui lui manque via **4 ports** seulement.

> **Mise à jour importante** : il existe **un prototype Arduino fonctionnel**
> (`tests-materiel/wifi_ap_web`) qui **fait déjà tourner la carte** (I²C SCD41, DAC `0x5F`,
> Wi‑Fi `softAP`, serveur HTTP, NVS). Le « shell » d'exécution manquant **ne doit pas être
> écrit de zéro** : on **récolte le code d'intégration éprouvé du prototype** pour
> implémenter les adaptateurs (I²C/Wi‑Fi/HTTP/NVS) et le câblage `app_main` + boucle
> FreeRTOS. Voir la stratégie complète dans **`doc/analyse-proto.md`** (recommandation :
> synthèse hybride — architecture/cœur de la production + intégration du prototype).

### Structure cible

```
sonde-co2/
├─ CMakeLists.txt          # build hôte : lib + tests (sans ESP-IDF)
├─ core/                   # bibliothèque C++20 PURE — 0 dépendance ESP-IDF
│  ├─ include/co2/         # entêtes publics, groupés par domaine
│  ├─ src/
│  └─ CMakeLists.txt       # cible : libco2core (no-exceptions, no-rtti)
├─ tests/                  # tests hôte (doctest) + vecteurs de parité JS
├─ firmware/               # app ESP-IDF MINCE = adaptateurs + câblage
│  ├─ main/app_main.cpp    # composition + boucle de tâche FreeRTOS
│  ├─ components/          # i2c · wifi · httpd · nvs · fs · clock · rng
│  ├─ sdkconfig.defaults · partitions.csv
└─ tools/parity/           # récup + vérif des vecteurs vs simulateur JS
```

### Regroupement en modules cohésifs (frontières internes conservées)

| Module `core/` | Regroupe | Rôle |
|---|---|---|
| `co2::control` | control_core, sensor_cycle, actuator_output | régulation, cycles capteur/sortie |
| `co2::app` | firmware_app | orchestrateur temps réel |
| `co2::hw` | hardware_contracts, lot1_drivers | protocoles SCD41 / DFR0971 (purs) |
| `co2::http` | les 6 modules api_* | contrat, garde, plan, handlers, JSON |
| `co2::auth` | local_auth, credential_store | sessions, rôles, identifiants |
| `co2::store` | config_store, history_log | (dé)sérialisation config/historique |
| `co2::service` | service_mode | machine à états mode maintenance |

### Les 4 ports (uniquement ce que le noyau appelle vers l'extérieur)

```cpp
struct Clock   { virtual uint64_t nowMs() const = 0; virtual uint64_t epoch() const = 0; };
struct I2cBus  { virtual Status write(...) = 0; virtual Status writeRead(...) = 0; };
struct Rng     { virtual void fill(std::span<std::byte>) = 0; };
struct Storage { virtual Status load(Key, std::span<std::byte>) = 0;   // NVS + journal
                 virtual Status save(Key, std::span<const std::byte>) = 0;
                 virtual Status append(...) = 0; };
```

Le **HTTP reste des fonctions pures** (`plan_http_server_request`, handlers) ; l'adaptateur
`esp_http_server` les appelle — **pas d'interface HTTP**.

### Règles de code du noyau
- **Pas d'allocation dynamique** (ou bornée/statique) ; `std::array`, `std::span`,
  capacités fixes.
- **Pas d'exceptions, pas de RTTI** ; erreurs par `std::expected`-like.
- `enum class` + opérateurs de flags pour les bitmasks ; `std::optional`/`span` à la place
  des pointeurs nus.
- **Une** brique de (dé)sérialisation binaire typée (remplace les 3 copies de helpers
  `*_le`) ; JSON borné **avec échappement**.
- Crypto/intégrité : `mbedtls_ct_memcmp` + `esp_rom_crc*` sur cible, équivalents portables
  côté hôte ; secrets **effacés** (`zeroize`).
- RAII sur `I2cBus` (destructeur = `i2c_driver_delete`, non copiable) ; pilote `i2c_master`.

### Sûreté (exigences de premier plan)
- État sûr = sortie **100 %** garanti sur toute faute, y compris crash firmware.
- **Watchdog** matériel actif ; **rollback OTA** ; **brownout** géré.
- Niveau **par défaut sûr câblé** en entrée variateur si le matériel le permet.
- Tests dédiés « fault → 100 % » (déjà présents dans les vecteurs, à porter en tests C++).

### Qualité & CI
- Tests unitaires **hôte** (doctest) rapides + **vecteurs de parité** JS en tests d'or.
- **clang-tidy** + **cppcheck** ; **ASan/UBSan** sur build hôte.
- Standard de codage léger (C++ Core Guidelines) ; build **reproductible**, ESP-IDF **figé**.
- Smoke tests **sur cible** après flash (scan I²C, boucle, endpoints).

### Séquencement (incrémental, chaque étape testable)
1. **Débloquer** : corriger le bug `array<4>→array<8>` **et l'adresse DAC (`0x5F`)** ;
   installer + figer ESP-IDF.
2. **Extraire** `core/` en lib portable (déplacer, ne pas réécrire) + **vrais tests hôte**
   alimentés par les vecteurs JS → garde la parité.
3. **Ports & adaptateurs** : implémenter les 4 ports réels (I²C, clock, rng, storage) et
   **câbler `app_main` + boucle FreeRTOS**, **en récoltant le code éprouvé du prototype
   `wifi_ap_web`** (séquences I²C SCD41, écriture DAC `0x5F`, `softAP`, serveur HTTP, NVS).
4. **Combler les manques** : NVS + LittleFS, serveur HTTP branché, orchestration Wi-Fi,
   KDF (PBKDF2 mbedTLS), horodatage (SNTP/RTC), compteurs persistés.
5. **Moderniser** module par module (types, sérialisation, JSON, RAII), sous couverture de
   tests.

### Dépendances minimales
CMake · doctest (header-only) · un JSON **embarqué borné** (ArduinoJson ou sérialiseur
maison) · mbedTLS (déjà dans l'IDF). Rien de plus.

---

# Partie 3 — Clarifications

## 3.1 Le code de la PWA est-il manquant ?

**Oui, totalement.** Aucun fichier web dans le dépôt (0 `.html`, `.css`, `manifest.json`,
service worker). Le firmware ne référence l'interface qu'en creux : le README la liste dans
« à intégrer », et les tests pointent vers une maquette hébergée **ailleurs**
(`07 - INTERFACE WEB LOCALE/maquette-web-locale/server.mjs`), dossier **absent** de ce
dépôt. Côté firmware on a le **contrat des routes** et le **formatage JSON**, mais **ni les
pages, ni le serveur HTTP qui les sert**. La PWA est à récupérer (projet complet, dossier
`07`) ou à recréer.

## 3.2 « Simulateur JS de référence — source de vérité » : rôle de `controller.js` et de l'OpenAPI

Avant le firmware, le comportement a été modélisé dans deux artefacts « papier vivant » :

- **`controller.js`** = **implémentation de référence de l'algorithme de régulation** en
  JavaScript (prototype/simulateur). C'est l'origine des valeurs (cible 1000 ppm, gains PI,
  rampes, seuils, états). *Fait vérifié* : `validate-control-core-contract.mjs` lit
  `controller.js`, en extrait `targetPpm: 1000`, `kpPctPerPpm: 0.08`, etc., et impose au
  C++ **les mêmes valeurs**.
- **`CONTRAT API LOCALE V0.1.json`** (OpenAPI) = **spécification de l'API HTTP locale**
  (11 routes, méthodes, rôles), confrontée au C++ **et** à la maquette PWA.

**« Source de vérité »** signifie : en cas de désaccord, **c'est le JS/OpenAPI qui fait
foi**, pas le C++ — qui n'est qu'un **portage** censé rester **à parité**.

**Uniquement aux tests ?** Dans *ce* dépôt, le seul lien mécanique est les tests `.mjs`.
Mais leur rôle réel dépasse le test : ils sont la **spécification exécutable**, le
simulateur sert aussi à valider la régulation **sans matériel**, et l'OpenAPI sert à
générer/valider la PWA. **À récupérer en priorité** pour garder la parité et alimenter les
futurs tests C++.

## 3.3 « Le code doit être compilé pour créer un `.ini` flashable » — vrai ?

**Non — confusion de vocabulaire sur deux points.**

**a) Un `.ini` n'est pas un produit de compilation, c'est une config d'entrée.** Les 3
`.ini` du dépôt sont des `platformio.ini`, **écrits à la main**, décrivant *comment*
compiler les petits sketches Arduino. Ils ne sont **jamais générés** par le build.

**b) Ce qu'on flashe, c'est un `.bin` (image firmware), pas un `.ini` :**

```
sources (.cpp) ──[compilation]──► .elf ──[esptool]──► .bin ──[flash USB]──► carte ESP32
```

Deux systèmes de build distincts :

| Cible | Build | Commande | Sortie flashable |
|---|---|---|---|
| **Firmware produit** (`firmware-esp32/`) | ESP-IDF + CMake | `idf.py build` → `idf.py flash` | `build/*.bin` |
| **Sketches test carte** (`tests-materiel/`) | PlatformIO + Arduino | `pio run` → `pio run -t upload` | `.pio/build/.../firmware.bin` |

**État actuel :** le dépôt ne contient **aucun `.bin`, `.elf`, ni dossier `build/`** — rien
n'a jamais été compilé, et le firmware principal **ne peut pas l'être aujourd'hui** (bug de
type + pas de toolchain). **Il n'existe donc actuellement aucun fichier flashable.**

À retenir : le firmware **doit** être compilé pour être flashé, mais le produit s'appelle
**`.bin`**, pas `.ini` ; le `.ini` ne concerne que les sketches de mise au point. Il faut
d'abord corriger le build et installer ESP-IDF pour que `idf.py build` produise l'image.
