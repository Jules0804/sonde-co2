# Suivi du projet

## État global

**Phase active :** phase 2 — comparaison et sélection des composants.  
**Dernière mise à jour :** 20 juin 2026.  
**Objectif du jalon :** composants compatibles sélectionnés, nomenclature chiffrée et budget soumis à validation avant achat.

**État de passage :** jalon 1 validé avec amendement ; comparaison 24 V/230 V obligatoire en phase 2.

## Livrables du jalon 1

| Livrable | État | Emplacement |
|---|---|---|
| Matrice réglementaire v0.1 | Réalisée, revue laboratoire ultérieure requise | `02 - REGLEMENTATION ET CONFORMITE` |
| Architecture système v0.1 | Réalisée | `03 - ARCHITECTURE ET CONCEPTION` |
| Spécification des interfaces v0.1 | Réalisée | `03 - ARCHITECTURE ET CONCEPTION` |
| Analyse de risques préliminaire v0.1 | Réalisée | `02 - REGLEMENTATION ET CONFORMITE` |
| Mise à jour du cahier des charges | Réalisée | `01 - CAHIER DES CHARGES` |
| Comparaison des architectures et décision finale | En cours | `03 - ARCHITECTURE ET CONCEPTION` |
| Revue de cohérence du jalon | Réalisée, validation Jules attendue | `00 - PILOTAGE DU PROJET` |
| Audit de complétude du jalon | Réalisé, 9 contrôles réussis | `00 - PILOTAGE DU PROJET` |
| Modèle de menaces v0.1 | Réalisé | `02 - REGLEMENTATION ET CONFORMITE` |
| Concept de sécurité électrique v0.1 | Réalisé | `04 - ELECTRONIQUE ET CABLAGE` |
| Machine d'états fonctionnelle v0.1 | Réalisée | `03 - ARCHITECTURE ET CONCEPTION` |

## Constats structurants

- Une salle de réunion relevant du Code du travail requiert actuellement 30 m³/h d'air neuf par occupant.
- La consigne CO₂ ne remplace pas le débit minimal réglementaire.
- La mesure de débit optionnelle permet d'exprimer le minimum en m³/h ; sans elle, le minimum reste une position réglée lors de l'équilibrage.
- La radio entraîne l'application de la RED et impose une démarche de cybersécurité.
- La commercialisation après 2027 doit être préparée pour le Cyber Resilience Act.
- L'entrée 230 V impose une architecture de sécurité électrique étudiée dès le prototype.
- La compatibilité de la centrale et du réseau aéraulique reste une condition d'installation, même si le produit ne pilote pas la centrale.

## Prochain travail autonome

1. Comparer les moteurs 24 V et 230 V sur le coût total installé.
2. Comparer les sondes CO₂ et les autres composants du banc.
3. Produire la nomenclature et le budget sans effectuer d'achat.

## Contrôle du panier — 21 juin 2026

Le panier GoTronic a été recontrôlé : SEN0536 à 49,90 € TTC (14 en stock), DFR0971 à 14,60 € TTC (18 en stock), livraison estimée à 4,50 €, soit **69,00 € TTC livré**. Le panier ne contient aucun ajout optionnel. La commande n'est pas encore effectuée et attend la confirmation finale avant de cliquer sur `Suivant`.

Le protocole de réception est désormais assorti de seuils chiffrés, d'un modèle de rapport, de modèles CSV pour les mesures SCD41 et DAC et d'une fiche d'identification de la Wemos ESP32-C3. Les vérifications locales du 21 juin 2026 confirment 54/54 tests du simulateur/contrats/service/stockage/journaux, 30/30 tests de la PWA/API et la validité du plan de partitions 4 Mo. Ces résultats portent sur le logiciel simulé ; ils ne remplacent ni la compilation ESP-IDF ni les essais sur matériel réel.

Le câblage logique du lot 1 dispose maintenant d'une netlist fil à fil de 17 raccordements, d'un dossier de mise sous tension progressive et de cinq tests de cohérence. Le banc reste limité à l'USB/3,3 V, sans 24 V ni moteur. Les règles empêchent notamment de relier une sortie 0–10 V à l'ESP32 et imposent la mesure de SDA/SCL entre 3,0 et 3,6 V avant réunion des modules. Deux GPIO restent volontairement non affectés jusqu'à l'identification exacte de la Wemos.

Le verrou moteur de phase 2 a été resserré par une comparaison actualisée de Siemens, Belimo, Gruner, Nenutec et des offres génériques. Le Siemens GDB161.1E reste le candidat professionnel au plus faible prix public vérifiable ; l'offre générique à environ 24 € est rejetée faute de fabricant et de preuves. Le calcul reproductible dimensionne six moteurs sur le pire candidat accepté à 2 VA : 39,69 W et 1,65 A avec 25 % de marge. Le HDR-60-24 de 60 W / 2,5 A passe les six nouveaux tests. Le lot 2 reste non autorisé tant que le couple du registre, la charge de six entrées 0–10 V, les protections et le tarif professionnel ne sont pas validés.

La qualification de la charge analogique est maintenant définie sans supposer une capacité fabricant absente du dossier : six entrées doivent présenter au moins 10 kΩ au total, soit 60 kΩ par moteur identique. Le DFR0971 sera testé sous 10 kΩ à 0/2/5/8/10 V, trois fois sur deux canaux. Sept tests vérifient l'analyseur, notamment erreur ≤ 0,10 V, chute en charge ≤ 0,05 V, maximum 10,20 V et monotonie. Les mesures physiques restent à réaliser après réception.

Un analyseur local des CSV de réception a été ajouté. Il calcule les interruptions, erreurs de lecture, redémarrages, monotonie et erreur des deux voies 0–10 V, puis produit un verdict exploitable dans le rapport. Ses 5/5 tests automatisés passent.

L'audit du périmètre complet de phase 2 distingue désormais le sous-jalon P2A autorisé de la phase entière, encore ouverte. La matrice de choix pondérée et la nomenclature cible provisoire du produit sont créées. Le total du banc a été corrigé à **533,03 € TTC hors afficheur**, soit **586,33 € avec réserve de 10 %**, car le QR Wi-Fi sera gravé et l'écran reste optionnel.

Un lanceur de vérification unique est disponible dans `00 - PILOTAGE DU PROJET\VERIFIER PROJET.cmd`. Son exécution du 21 juin 2026 réussit les groupes disponibles : 54 tests simulateur/contrats/service/stockage/journaux, 30 tests PWA/API, 12 tests d'analyse des essais (réception + charge analogique), 5 tests de netlist, 6 tests de dimensionnement moteur, validation des 8 partitions sur 4 Mo et vérification de 7 livrables/15 scores pondérés de phase 2.

La sécurité de l'interface locale est portée dans le simulateur : état/historique consultables sur le Wi-Fi physique, configuration et test réservés à une session installateur, journal technique protégé, jeton anti-CSRF, expiration, déconnexion, comparaison `scrypt`, limitation après cinq échecs, schéma JSON strict, contrôle de révision et en-têtes navigateur. La suite PWA/API passe désormais **30/30 tests**. Un essai visuel à 390 px a validé connexion, réglages, test 25 %, arrêt, déconnexion, verrouillage et consultation du journal. Il a permis de corriger deux défauts : fermeture de la fenêtre après connexion et absence d'événement lors de l'expiration automatique. Le journal affiche maintenant la fin automatique comme événement système ; la console reste sans avertissement ni erreur.

Une recherche informative multi-fabricants sur la mesure de débit est ajoutée. Elle recommande d'étudier en priorité une station multipoint ou un organe à facteur K avec transmetteur basse pression, tout en concluant qu'une référence universelle 50–2 000 m³/h ne serait pas crédible : les plages devront être définies par familles de diamètres. Aucun achat de débit n'est autorisé.

Le cadrage aéraulique du banc est amorcé dans `05 - MECANIQUE ET AERAULIQUE` : base 30 m³/h/personne, tableau de vitesses pour DN160 à DN400, recommandation papier DN200 et alternative DN250. Une fiche de relevé registre/gaine est prête pour confirmer le couple et l'adaptation moteur avant le lot 2. Le vérificateur projet exécute désormais aussi les tests de ce calcul.

Une première CAO paramétrique Fusion 360 pour l'intégration de la sonde SEN0536 est créée dans `05 - MECANIQUE ET AERAULIQUE`. Elle utilise les cotes constructeur vérifiées 32 x 27 x 8 mm, PCB 1,6 mm et entraxes 25 x 20 mm. Les cotes non publiées par DFRobot, notamment le diamètre exact des trous et l'encombrement du câble Gravity branché, restent à mesurer à réception avant impression finale.

## Point de validation actuel

Le lot 1 est validé : SCD41 + DAC 0–10 V, plafond autorisé de 90 € TTC. Aucun achat n'a encore été effectué.

L'audit avant achat est terminé et l'autorisation financière est reçue.

Le panier préparatoire GoTronic contient les deux références validées pour 69,00 € TTC livré. Le paiement n'est pas effectué. Le simulateur de régulation v0.1 est créé et ses 7 tests passent.

La comparaison multi-fournisseurs du 20 juin 2026 confirme que GoTronic reste le meilleur choix immédiatement disponible. La commande est volontairement reportée au 21 juin 2026 ; le panier est conservé sans paiement.

La maquette d'interface web locale v0.1 est créée dans `07 - INTERFACE WEB LOCALE\maquette-web-locale`. Elle comprend le tableau de bord, l'historique simulé avec export CSV, les réglages bornés, le test actionneur temporisé, une session installateur et le journal de diagnostic visible. Elle est connectée à une API locale simulant le futur ESP32 ; le contrat API est rangé dans `07 - INTERFACE WEB LOCALE`. Ses tests automatisés passent, y compris le journal protégé sans identité, l'expiration automatique tracée, les refus sans session/CSRF, la limitation des tentatives, le schéma strict et les conflits de révision. L'essai visuel local à 390 px passe ; l'essai réel sur Android et iPhone reste ouvert.

Jules valide la direction visuelle générale de l'interface locale. Cette base graphique est conservée pour la suite du développement.

Le parcours d'accès version 1 est maintenant orienté sans application native : bouton physique, Wi-Fi temporaire, portail captif, URL/IP et QR code affichés. L'Ethernet est exclu de la version 1 et reporté à la future étude BACnet/IP. La spécification détaillée est rangée dans `03 - ARCHITECTURE ET CONCEPTION`.

Le squelette du firmware ESP-IDF est créé dans `06 - LOGICIEL EMBARQUE\firmware-esp32`. Le noyau C++ reprend la régulation simulée et le repli à 100 %, avec un composant de temporisation du mode service. Le projet n'est pas encore compilé : aucun compilateur ESP-IDF n'est disponible dans l'environnement et la référence exacte de la carte possédée reste à relever avant le premier flash.

Les scénarios de régulation, service Wi-Fi, configuration et journaux sont générés. Avec les contrats SCD41/DFR0971, le comportement de référence est couvert par 54 tests JavaScript réussis. Ils serviront de critères objectifs au futur test hôte du noyau C++.

L'historique et le journal disposent maintenant de formats compacts avec CRC16, rétention circulaire et interdiction des secrets/textes libres. Sept jours à une minute plus 512 événements occupent 258 304 octets, laissant 134 912 octets bruts dans la partition de 384 Kio. L'API `/events` est réservée à l'installateur et testée sans identifiant personnel. Le pilote flash et l'endurance restent ouverts.

Le stockage de configuration est spécifié sur deux copies NVS de 32 octets avec schéma, génération, sept paramètres et CRC32. Le modèle refuse les conflits/corruptions complètes, conserve l'ancienne copie lors de chaque coupure partielle et évite les écritures inutiles. L'API refuse aussi une modification fondée sur une ancienne révision. Le portage C++/NVS et les coupures électriques réelles restent ouverts.

Le mode service dispose maintenant d'une spécification séparée et d'un modèle exécutable : appui continu 3 s, démarrage radio confirmé, fenêtre 15 min, fermeture, invalidation des sessions, un seul réessai et défaut Wi-Fi non critique. Les tests prouvent que ce cycle ne modifie pas la régulation. Le composant C++ prépare le bouton et la génération de session mais reste non compilé tant qu'ESP-IDF n'est pas disponible.

La spécification des pilotes du lot 1 est créée. Elle fixe les adresses I²C, le rythme de lecture SCD41, les trames 12 bits du DFR0971 et la stratégie de démarrage sûre à 10 V. La mémorisation de la sortie de secours devra être validée au multimètre avant raccordement d'un moteur.

L'étude d'affichage identifie un IPS 1,3″ 240 × 240 à 7,20 € TTC pour un futur essai d'état/URL. Le QR étant désormais gravé, cet afficheur n'est pas ajouté au lot 1.

Jules retient une carte Wemos ESP32-C3 pour le prototype et préfère un QR Wi-Fi unique gravé au laser sur le boîtier. L'afficheur n'est donc plus nécessaire pour présenter le QR et reste optionnel pour l'état/URL ; le lot 1 reste inchangé à 69,00 € livré. La référence Wemos exacte doit encore être relevée avant le brochage.

Un plan de premier allumage du lot 1 est ajouté avec un sketch Arduino minimal de scan I²C. Il permettra de tester la Wemos seule, puis le SEN0536 seul, le DFR0971 seul et enfin les deux modules ensemble, avant toute écriture de firmware lourd et sans raccorder ni moteur ni 24 V.

Le modèle de rapport de réception du lot 1 est remis au propre et aligné sur cette séquence : identification Wemos, port COM, broches SDA/SCL, tensions 3,3 V, captures de scan I²C, essai SCD41 24 h, essai DAC à vide et essai de charge analogique 10 kΩ.

Le point coffret/protections/connectique du lot 2 passe de manquant à cadré : un document v0.1 fixe les fonctions à intégrer, la séparation secteur/24 V/logique, les connecteurs X1 à X9, les protections à trancher et les critères d'autorisation avant achat. Il ne valide pas encore de référence réelle ni la mise sous tension secteur.

Le vérificateur documentaire de phase 2 contrôle maintenant 33 livrables, dont les cadrages registre/gaine, CAO SEN0536, protocole et modèle de rapport d'implantation sonde CO₂ en gaine, coffret/protections, ordre d'exécution lot 1, premier allumage, fiche colis, README outils Arduino, capture série CSV, liste ports série, guide dépannage lot 1, lecture SCD41 CSV, essai court CO₂, test DFR0971 CSV, essai DAC à vide, rapport de réception lot 1, revue fin lot 1, feuille de route post lot 1 vers lot 2, modèle de demande de devis lot 2, tableau de comparaison devis lot 2 et checklist go/no-go lot 2. Son exécution ciblée réussit : 33 livrables présents, 15 scores pondérés vérifiés et budget 533,03 € hors afficheur cohérent.

Une checklist go/no-go lot 2 est créée dans le pilotage projet. Elle rassemble les conditions d'achat des moteurs, de l'alimentation 24 V, du coffret et des protections. Le verdict actuel est volontairement **NO-GO** : lot 1 non reçu, registre non confirmé, charge 0-10 V non testée, coffret/protections non référencés et budget lot 2 non soumis.

Une fiche de réception de commande lot 1 est ajoutée côté achats/coûts. Elle fixe les photos à prendre, les références attendues, le rangement de la facture et la décision colis `CONFORME`, `SOUS RÉSERVE` ou `REFUSÉ` avant toute mise sous tension.

Un sketch Arduino de lecture SCD41 vers CSV et un protocole d'essai court 30 minutes sont ajoutés. Cette étape intermédiaire permet de vérifier rapidement la mesure CO₂, la réaction à la respiration et le retour progressif avant de mobiliser un essai 24 h.

Un sketch Arduino de test du DFR0971 et un protocole d'essai DAC à vide sont ajoutés. Le sketch configure la plage 10 V, commande CH0/CH1 à 0, 2, 5, 8 et 10 V, imprime un CSV compatible avec `MODELE MESURES DAC.csv` et laisse les mesures réelles au multimètre comme preuve physique.

Un README central des outils Arduino lot 1 est créé. Il fixe l'ordre d'utilisation des trois sketches, les règles de sécurité, les sorties CSV attendues et le rappel des broches SDA/SCL à adapter après identification exacte de la Wemos.

Un outil PowerShell de capture série CSV est ajouté pour enregistrer directement les mesures depuis la Wemos vers `mesures_scd41_30min.csv`, `mesures_scd41_24h.csv` ou `mesures_dac.csv`, sans copier-coller depuis le moniteur série Arduino.

Une revue de fin lot 1 est ajoutée pour décider formellement du passage vers la préparation du lot 2. Elle demande les preuves de réception, identification Wemos, scan I²C, essais CO₂, DAC à vide et charge 10 kΩ avant toute évolution vers moteurs/coffret.

Un ordre d'exécution unique de réception et essais lot 1 est ajouté. Il enchaîne les fiches dans l'ordre terrain, du colis jusqu'à la revue fin lot 1, avec les fichiers de résultats à créer et les points d'arrêt.

Le README de capture série et l'ordre d'exécution lot 1 sont remis au propre en UTF-8 lisible. Les scripts `lister-ports-serie.ps1` et `capturer-serie-csv.ps1` passent le contrôle syntaxique PowerShell.

Le README racine du projet est remis au propre en UTF-8 et ajoute un parcours rapide "quand le lot 1 arrive" pointant vers l'ordre d'exécution, le guide de dépannage, les outils Arduino, la capture série et la revue fin lot 1. Le lanceur global `VERIFIER PROJET.cmd --no-pause` réussit entièrement : 54 tests simulateur/contrats/service/stockage/journaux, 30 tests PWA/API, 12 tests analyseurs, 5 tests netlist, 6 tests alimentation, 7 tests aéraulique, partitions ESP32-C3 valides et 29 livrables de phase 2 vérifiés.

Un modèle de demande de devis lot 2 est ajouté côté achats/coûts pour collecter de façon comparable les prix, délais, fiches techniques et garanties des moteurs, alimentations, coffrets, protections et connectiques. Il ne vaut pas autorisation d'achat.

Un tableau CSV de comparaison des devis lot 2 et son README sont ajoutés. Ils permettront de classer les réponses fournisseurs par famille, prix, délai, documentation, compatibilité 24 V, commande 0/2-10 V, traçabilité et décision.

Une feuille de route post lot 1 vers lot 2 est ajoutée. Elle décrit les étapes entre la revue fin lot 1 et la soumission du lot 2 : registre, couple, devis, comparaison, budget, coffret/protections, schéma révisé, revue sécurité et validation finale.

Une revue sécurité avant mise sous tension 230 V lot 2 est ajoutée côté électronique/câblage. Elle impose les contrôles coffret, classe électrique, protections, continuités hors tension et limite la première mise sous tension à l'alimentation 24 V seule, moteurs débranchés.

Un guide de dépannage lot 1 est ajouté pour diagnostiquer les blocages courants : port COM absent, téléversement Arduino, scan I²C, erreurs SCD41, tensions DAC incorrectes, capture CSV vide et refus des analyseurs.

Un protocole d'essai d'implantation de la sonde CO₂ en gaine est ajouté. Il relie la CAO de la tête SEN0536 aux essais réels : référence hors gaine, montage, capture en gaine, réponse à une variation CO₂, retour hors gaine et décision `ACCEPTÉE POUR BANC`, `SOUS RÉSERVE` ou `REFUSÉE`.

Le modèle de rapport correspondant à l'essai d'implantation CO₂ en gaine est ajouté. Il prévoit les photos, fichiers CSV, observations mécaniques, observations de mesure CO₂, écarts CAO et verdict d'implantation.

Le `main` ESP32-C3 n'est plus un simple appel isolé du contrôleur : il raccorde maintenant les composants `config_store`, `control_core`, `service_mode` et `history_log` en mode sûr. Au démarrage, il part de la configuration usine, met à jour le mode service, force l'entrée CO₂ invalide tant que les pilotes matériels ne sont pas raccordés, encode un échantillon historique et un événement `BOOT`. Le nouveau contrôle `validate-app-main-contract.mjs` est intégré au vérificateur global.

Le composant firmware `lot1_drivers` est ajouté pour préparer l'intégration réelle du SCD41 et du DFR0971 : commandes SCD41 périodiques, lecture du statut data-ready, CRC8 Sensirion, décodage mesure CO₂/température/humidité et écritures DFR0971 0-10 V. Il reste volontairement non raccordé au `main` tant que la Wemos exacte, le brochage SDA/SCL et les essais lot 1 ne sont pas validés.

Un port I2C ESP32-C3 est préparé dans un composant séparé `esp32_i2c_port`. Il refuse les GPIO non assignés, configure le bus à 100 kHz et expose les écritures/lectures nécessaires aux pilotes lot 1. Il n'est pas activé dans `app_main.cpp` avant identification physique de la carte Wemos.

Le composant `sensor_cycle` prépare le cycle de mesure SCD41 : démarrage périodique, attente du délai capteur, interrogation `data-ready`, lecture de mesure, classification par fraîcheur/CRC/plage et génération d'une `ControlInput` pour le noyau de régulation. Il reste testable hors matériel et non raccordé au bus réel avant validation du lot 1.

Le composant `actuator_output` prépare la sortie actionneur DFR0971 : configuration 0-10 V, commande de tous les canaux, repli 100 % si matériel désactivé, configuration absente, écriture échouée, démarrage, forçage ou défaut régulateur. Il fournit la trame I2C à écrire mais reste non raccordé au bus réel avant validation du lot 1.

Le composant `firmware_app` relie maintenant les briques internes hors matériel : `sensor_cycle`, `control_core`, `actuator_output`, `service_mode` et `history_log`. À chaque cycle, il transforme la mesure capteur en entrée régulation, prépare la sortie actionneur, met à jour le mode service et encode un échantillon historique plus un événement système. Il reste volontairement non appelé par `app_main.cpp` tant que les essais lot 1 n'autorisent pas l'usage réel du bus.

Le composant `http_api_contract` fixe côté firmware les 11 routes HTTP de l'API locale `/api/v1` : état, historique, événements, session, configuration et test actionneur. Le validateur compare ces routes avec le contrat OpenAPI v0.3.0 et le serveur PWA prototype, afin d'éviter une divergence entre application téléphone et futur serveur ESP32.

Le composant `local_auth` prépare la sécurité applicative côté firmware : jeton de session opaque 256 bits, jeton CSRF 192 bits, rôles installateur/administrateur, expiration 15 minutes, invalidation globale, fermeture de session, comparaison en temps constant et limitation à cinq échecs avec verrouillage 30 secondes. Le stockage définitif des mots de passe et son coût cryptographique restent à mesurer sur l'ESP32 réel.

Le composant `credential_store` prépare le format persistant des comptes applicatifs : record `AUTH` versionné de 80 octets, rôle installateur/administrateur, algorithme identifié, sel 16 octets, vérificateur 32 octets, longueur minimale de mot de passe et CRC32. Il ne choisit pas encore la dérivation finale du mot de passe : celle-ci devra être mesurée sur ESP32 pour respecter RAM, temps de calcul et watchdog.

Le composant `api_request_guard` prépare le contrôle d'entrée du futur serveur HTTP ESP32. Il résout la route, refuse les endpoints inconnus, impose `application/json` sur les corps JSON, limite la taille de requête, applique rôle minimal et jeton CSRF via `local_auth`, puis retourne le handler autorisé ou le code d'erreur HTTP à sérialiser.

Le composant `api_response` centralise les réponses HTTP/API du futur serveur ESP32 : `Content-Type` JSON, `Cache-Control: no-store`, protections navigateur (`nosniff`, `DENY`, CSP, permissions, referrer) et corps JSON d'erreur alignés sur la PWA prototype. Les handlers applicatifs pourront ainsi se concentrer sur le contenu métier.

Le composant `api_payloads` prépare les corps JSON métier du futur serveur ESP32 : statut instantané, configuration, session, échantillon d'historique et événement technique. Les sorties sont bornées par `snprintf`, sans allocation dynamique imposée, et contrôlées contre le contrat OpenAPI v0.3.0 pour maintenir l'alignement avec l'application locale.

Le composant `http_server_app` prépare le dispatch du futur serveur HTTP ESP32 : chaque route validée passe d'abord par `api_request_guard`, reçoit les en-têtes de sécurité `api_response`, réserve la bonne taille de payload `api_payloads` et applique le verrou `If-Match` avant modification de configuration. Il reste un contrat de liaison, pas encore le serveur ESP-IDF réel.

Le composant `api_handlers` prépare les handlers métier de l'API embarquée : statut, configuration, session, historique, événements et test actionneur. La configuration est relue avec `If-Match`, refuse les champs inconnus et repasse par `validate_persistent_config`; le test actionneur reste limité à 0/25/50/75/100 % et 5 à 600 secondes.

Le projet est maintenant placé sous Git local. La carte réellement disponible pour le prototype est corrigée en Wemos S2 Mini V1.0.0 / ESP32-S2, avec cible provisoire `esp32s2`. Cette correction ne valide pas encore les GPIO : le port USB, la flash réelle, SDA/SCL, bouton et LED restent à relever sur banc avant tout câblage.
