# Squelette firmware ESP32

Ce dossier prépare le portage du simulateur vers ESP-IDF. Il ne doit pas encore être chargé sur une installation réelle.

## État v0.1

- noyau C++ indépendant pour la régulation CO₂ ;
- repli à 100 % au démarrage et sur défaut sonde ;
- composant de bouton 3 secondes, temporisation du mode service à 15 minutes et génération d'invalidation de session ;
- partitions prévues pour configuration, historique, OTA A/B et récupération ;
- watchdog et rollback activés dans les valeurs de configuration proposées ;
- aucun pilote matériel tant que le modèle de carte et le brochage ne sont pas confirmés.
- vecteurs de référence générés depuis le simulateur pour vérifier la parité du portage C++.
- contrats matériels C++ pour les trames du DFR0971 et la classification des mesures SCD41.
- port I2C ESP-IDF préparé avec refus explicite des GPIO non assignés ; il n'est pas raccordé au `main` avant identification de la Wemos.
- cycle capteur SCD41 préparé : démarrage périodique, interrogation data-ready, lecture mesure, classification et conversion vers l'entrée du régulateur.
- cycle sortie actionneur préparé : configuration DFR0971 0-10 V, repli 100 % et suivi de la sortie régulateur après validation.
- orchestrateur interne préparé : capteur, régulation, actionneur, mode service et journaux sont reliés dans un composant testable hors matériel.
- contrat des routes HTTP embarquées préparé et aligné avec l'OpenAPI/PWA locale.
- authentification locale préparée : session opaque 256 bits, CSRF, rôles, expiration 15 min et limitation des tentatives.
- stockage des identifiants préparé : record versionné, rôle, sel, vérificateur 32 octets, CRC32 et comparaison constante.
- garde d'entrée API préparé : vérification route, type JSON, taille de corps, rôle et CSRF avant appel des handlers.
- réponses API préparées : en-têtes de sécurité, cache désactivé et corps JSON d'erreur alignés avec la PWA.
- payloads API préparés : état, configuration, session, historique et événements sont formatés en JSON borné, aligné avec l'OpenAPI locale.
- serveur HTTP embarqué préparé au niveau contrat : garde, dispatch des 11 handlers, headers, tailles de payload et protection `If-Match` sont reliés.
- handlers API préparés : lectures, session, configuration stricte, effacement historique et test actionneur sont validés avant branchement au serveur ESP-IDF réel.

## Environnement cible

- ESP-IDF ;
- cible ESP32-S2 ; carte Wemos S2 Mini V1.0.0 observée le 28 juin 2026 ;
- compilation reproductible et version d'ESP-IDF à figer avant le premier flash.

La cible sera initialisée avec `idf.py set-target esp32s2`. Le plan de partitions v0.1 tient dans 4 Mo avec factory, deux images OTA de 1,125 Mo, 384 ko d'historique et 128 ko de coredump. Il reste provisoire jusqu'à mesure de la taille réelle de flash, du firmware et de la PWA.

Le plan peut être contrôlé sans ESP-IDF avec `node test/validate-partitions.mjs`.

## À intégrer après réception du lot 1

1. raccorder l'orchestrateur au `app_main.cpp` lorsque les essais lot 1 autorisent l'usage réel du bus ;
2. raccorder le cycle SCD41 au bus I2C réel après identification SDA/SCL ;
3. raccorder le cycle DFR0971 au bus I2C réel avec sortie de sécurité au démarrage ;
4. lecture du bouton de service pendant 3 secondes ;
5. point d'accès `VENT-CO2-XXXX` limité à 15 minutes ;
6. implémenter les handlers du serveur HTTP derrière le garde API et les réponses standardisées, conformes à `07 - INTERFACE WEB LOCALE\CONTRAT API LOCALE V0.1.json` ;
7. choisir, mesurer et intégrer le mécanisme définitif de dérivation de mot de passe sur ESP32 ;
8. persister les identifiants en NVS avec procédure de provisionnement physique ;
9. stockage NVS versionné avec contrôle d'intégrité ;
10. interface PWA embarquée ;
11. voyant d'état ; le QR Wi-Fi et l'adresse de secours sont gravés sur le boîtier, l'afficheur reste optionnel.

## Limite de validation

Aucun compilateur ESP-IDF n'est actuellement disponible dans l'environnement du projet. Les sources sont donc un squelette de conception non compilé. Elles devront être compilées, analysées et testées sur la carte exacte avant de constituer une preuve de fonctionnement.
