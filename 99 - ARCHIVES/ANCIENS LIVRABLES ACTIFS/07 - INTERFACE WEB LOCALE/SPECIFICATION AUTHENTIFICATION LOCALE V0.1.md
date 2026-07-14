# Spécification d'authentification locale v0.1

## 1. Objectif

Le fait d'avoir rejoint le Wi-Fi du boîtier ne doit pas autoriser la modification des paramètres ou le pilotage des volets. Deux secrets indépendants sont donc exigés :

1. le **secret Wi-Fi**, unique par boîtier et encodé dans le QR gravé ;
2. le **mot de passe du compte installateur/administrateur**, absent du QR et choisi lors de la mise en service.

Le secret Wi-Fi protège l'accès au réseau local temporaire. Le compte applicatif protège les fonctions du produit.

## 2. Droits

| Fonction | Sans session | Installateur | Administrateur |
|---|---:|---:|---:|
| Lire CO₂, état et alarmes | Oui | Oui | Oui |
| Lire/exporter l'historique local | Oui sur le point d'accès physique | Oui | Oui |
| Lire/modifier la configuration | Non | Oui | Oui |
| Lancer/arrêter un test actionneur | Non | Oui | Oui |
| Consulter le journal technique détaillé | Non | Oui | Oui |
| Gérer les comptes et mises à jour | Non | Non | Oui |

L'accès public à l'historique devra être réévalué si les essais montrent qu'il révèle trop précisément l'occupation. Il est limité par le Wi-Fi de service physiquement activé et temporaire.

## 3. Session

- ouverture par `POST /api/v1/session` ;
- jeton opaque aléatoire d'au moins 256 bits ;
- jeton conservé uniquement en mémoire vive du navigateur, jamais dans l'URL ni dans le stockage persistant ;
- expiration initiale : 15 minutes ;
- destruction à la déconnexion, au changement de mot de passe, à l'arrêt du mode service ou au redémarrage ;
- toutes les opérations d'écriture exigent le jeton de session et un jeton anti-CSRF distinct ;
- contrôle du rôle effectué par le contrôleur sur chaque requête.

## 4. Identifiants

- aucun mot de passe usine commun sur un produit vendu ;
- mot de passe initial créé pendant un parcours physiquement autorisé ;
- longueur minimale cible : 12 caractères ;
- stockage sous forme de vérificateur salé avec algorithme et coût mesurés sur le matériel final ;
- comparaison en temps constant ;
- aucun secret dans les journaux, exports, messages d'erreur ou sauvegardes non chiffrées ;
- identifiant inconnu et mauvais mot de passe produisent le même message.

Le simulateur Node utilise `scrypt` et des mots de passe de démonstration. Ce mécanisme prouve le contrat d'API, pas le stockage définitif dans l'ESP32. Le firmware devra sélectionner un mécanisme disponible et suffisamment coûteux après mesure du temps, de la RAM et du watchdog.

## 5. Limitation des tentatives

- cinq échecs consécutifs au maximum avant temporisation ;
- blocage initial de 30 secondes, à rendre progressif dans le firmware final ;
- réponse HTTP `429` avec durée d'attente ;
- journalisation sans enregistrer le mot de passe ;
- une session déjà valide ne doit pas être supprimée par une attaque de connexion, mais les ressources doivent rester bornées.

## 6. Transport et navigateur

Le prototype peut utiliser HTTP uniquement sur le point d'accès isolé, temporaire et activé physiquement. Cette tolérance ne vaut pas pour un raccordement à un réseau partagé.

En complément :

- politique CSP sans script tiers ni `eval` ;
- interdiction d'affichage dans une iframe ;
- aucune permission caméra, micro ou géolocalisation ;
- cache désactivé pour l'API et les réponses sensibles ;
- taille des corps JSON limitée ;
- validation du type et des bornes côté serveur.

La directive `style-src 'unsafe-inline'` reste temporairement nécessaire à la maquette pour les indicateurs dynamiques. Elle devra être supprimée ou remplacée par des classes/styles prévalidés avant le produit.

## 7. Récupération

La récupération d'un compte ne doit jamais être disponible à distance. Le produit final devra exiger une action physique distincte de l'appui de 3 secondes ouvrant le Wi-Fi. La durée/séquence de remise à zéro, l'effet sur l'historique et l'obligation de reprovisionner les secrets restent une décision de conception à valider avant le firmware matériel.

## 8. État du prototype

Implémenté et testé dans le simulateur :

- lectures publiques limitées à l'état et l'historique ;
- configuration et tests protégés par rôle ;
- jetons de session et anti-CSRF ;
- expiration en mémoire ;
- comparaison de mot de passe via `scrypt` ;
- limitation après cinq échecs ;
- en-têtes de sécurité navigateur ;
- déconnexion et invalidation immédiate.
- journal technique structuré des sessions, échecs, configurations et tests, sans identité nominative.

Non encore implémenté : gestion des comptes, changement de mot de passe initial, récupération physique, persistance réelle du journal sur ESP32 et mise à jour signée.
