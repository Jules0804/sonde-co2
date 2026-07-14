# Maquette interface web locale Ventilation CO₂

Maquette fonctionnelle locale de l'interface telephone. Elle n'agit sur aucun materiel et utilise uniquement des donnees simulees.

## Lancer

Le plus simple sous Windows est de double-cliquer sur `LANCER INTERFACE WEB.cmd`.

Sinon, depuis ce dossier avec Node.js :

```powershell
node server.mjs
```

Puis ouvrir `http://127.0.0.1:4173`.

Comptes de démonstration du simulateur uniquement :

- `installateur` / `installateur123` ;
- `administrateur` / `administrateur123`.

Ces mots de passe ne sont pas destinés au produit réel. Ils peuvent être remplacés avant le lancement avec les variables `VENT_CO2_INSTALLER_PASSWORD` et `VENT_CO2_ADMIN_PASSWORD`.

## Tester

```powershell
node --test --test-isolation=none
```

## Fonctions présentes

- tableau de bord CO₂ et ouverture 0–10 V simulés ;
- API locale simulant le futur contrôleur ESP32 ;
- historique 24 h et export CSV ;
- réglages contrôlés par les bornes du cahier des charges ;
- test actionneur 0/25/50/75/100 % avec retour automatique en AUTO ;
- session installateur temporaire, anti-CSRF et limitation des tentatives ;
- journal technique structuré accessible dans l'interface et par l'API à l'installateur ;
- traçabilité du démarrage, de l'arrêt manuel et de l'expiration automatique des tests ;
- mise en page responsive à partir de 320 px ;
- manifeste PWA et cache hors ligne.

## API simulée

Le serveur expose les endpoints définis dans `..\CONTRAT API LOCALE V0.1.json` :

- `GET /api/v1/status` ;
- `GET /api/v1/history` ;
- `GET` et `PUT /api/v1/config` ;
- `POST` et `DELETE /api/v1/output-test`.

Les tests d'intégration lancent le serveur sur un port temporaire et vérifient les réponses, les refus de valeurs dangereuses et le retour en AUTO.

## Limites v0.1

- authentification de démonstration uniquement, sans provisionnement matériel des comptes ;
- API simulee uniquement, pas encore portee dans l'ESP32 ;
- aucune signature de mise à jour ;
- durée de test ramenée à 1 minute dans la maquette pour faciliter la démonstration ;
- affichage iOS/Android a valider sur de vrais telephones.
