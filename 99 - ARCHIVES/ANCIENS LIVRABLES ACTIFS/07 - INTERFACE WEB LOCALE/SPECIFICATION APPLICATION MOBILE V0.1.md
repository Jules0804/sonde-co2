# Spécification application mobile v0.1

## 1. Choix proposé

La première application sera une **application web locale installable (PWA)** servie directement par le contrôleur. Elle fonctionnera dans le navigateur du téléphone et pourra être ajoutée à l'écran d'accueil. Ce choix évite un cloud, un abonnement et deux applications natives séparées pendant le prototypage.

Une application native restera possible après validation du produit si Bluetooth, notifications système ou déploiement par magasin deviennent indispensables.

## 2. Utilisateurs

| Rôle | Droits |
|---|---|
| Utilisateur | Consulter CO₂, état, ouverture et alarmes |
| Installateur | Modifier consigne et minimum, lancer les tests, étalonner l'installation |
| Administrateur | Gérer les comptes, sauvegarder/restaurer, mettre à jour le firmware |

Le premier compte administrateur est créé lors de la mise en service. Aucun mot de passe usine commun ne sera conservé.

## 3. Écrans de la version 0.1

1. **Tableau de bord** : CO₂ actuel, tendance, consigne, ouverture, état et défaut actif.
2. **Historique** : courbe CO₂ et ouverture sur 24 h, 7 jours et période exportable.
3. **Réglages ventilation** : consigne, minimum, maximum et seuil d'alarme avec bornes.
4. **Mise en service** : test 0/25/50/75/100 %, identification des voies et saisie du réglage d'équilibrage.
5. **Diagnostic** : état des capteurs, version, redémarrages, réseau et journal des défauts.
6. **Utilisateurs et sécurité** : comptes, changement de mot de passe et sessions actives.
7. **Maintenance** : export, sauvegarde, restauration et mise à jour locale.

## 4. Principes d'interface

- La valeur CO₂ et l'état de fonctionnement restent visibles sans faire défiler.
- Une couleur ne sera jamais le seul moyen de comprendre une alarme.
- Toute commande de test affiche sa durée restante et un bouton d'arrêt immédiat.
- Les réglages critiques présentent l'ancienne valeur, la nouvelle valeur et leur plage autorisée.
- Une perte de liaison indique clairement que le contrôleur continue de fonctionner localement.
- L'application doit rester utilisable sur un écran de 360 px de large.

## 5. Échanges avec le contrôleur

| Fonction | Méthode proposée | Accès |
|---|---|---|
| État instantané | `GET /api/v1/status` | Tous les rôles |
| Historique | `GET /api/v1/history` | Tous les rôles |
| Lecture configuration | `GET /api/v1/config` | Installateur + |
| Modification configuration | `PUT /api/v1/config` | Installateur + |
| Test de sortie | `POST /api/v1/output-test` | Installateur + |
| Arrêt de test | `DELETE /api/v1/output-test` | Installateur + |
| Journal des défauts | `GET /api/v1/events` | Installateur + |
| Gestion des comptes | `/api/v1/users` | Administrateur |
| Mise à jour | `POST /api/v1/firmware` | Administrateur |

Toutes les écritures doivent être authentifiées, contrôlées côté contrôleur et journalisées. L'interface ne peut jamais contourner les limites de sécurité du firmware.

## 6. Cybersécurité minimale du prototype

- Wi-Fi de service désactivé hors besoin ou arrêté automatiquement ;
- mot de passe unique choisi à la mise en service ;
- sessions temporisées et invalidées après changement de mot de passe ;
- limitation des tentatives de connexion ;
- protection CSRF des écritures et validation stricte des entrées ;
- aucune dépendance à Internet pour réguler ou consulter localement ;
- mise à jour acceptée seulement si le fichier est authentique et compatible.

## 7. Critères de validation de la version 0.1

- installation depuis Android et iPhone via le navigateur ;
- affichage du tableau de bord en moins de 2 secondes sur le réseau local ;
- déconnexion du téléphone sans effet sur la régulation ;
- test actionneur limité dans le temps et retour automatique en AUTO ;
- réglage invalide refusé côté contrôleur ;
- historique de 24 h consultable et exportable ;
- changement du mot de passe initial obligatoire.

## 8. Ordre de réalisation

1. Maquette statique avec données simulées.
2. Contrat d'API et tests automatisés.
3. Tableau de bord connecté au simulateur.
4. Intégration au firmware ESP32.
5. Gestion des comptes et réglages.
6. Historique, export et mise à jour.
7. Essais téléphone, perte réseau et sécurité.
