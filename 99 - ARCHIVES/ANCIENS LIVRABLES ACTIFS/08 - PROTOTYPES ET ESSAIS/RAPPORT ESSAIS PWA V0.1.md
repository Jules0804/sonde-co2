# Rapport d'essais PWA v0.1

**Date :** 21 juin 2026  
**Objet :** prototype local de l'application téléphone, données simulées.

## 1. Périmètre testé

- validation des bornes de configuration ;
- cohérence minimum/maximum ;
- cohérence consigne/seuil d'alarme ;
- classification du niveau de CO₂ ;
- conversion pour l'affichage 0–10 V ;
- compte à rebours du mode test ;
- disponibilité HTTP des ressources PWA.
- séparation entre consultation et session installateur ;
- authentification, jeton anti-CSRF, déconnexion et limitation des tentatives ;
- en-têtes de sécurité navigateur.

## 2. Résultats automatisés

Commande :

```powershell
node --test --test-isolation=none
```

Résultat après intégration de l'authentification, du journal, du schéma strict, du contrôle de révision et de l'expiration automatique des tests : **30 tests réussis sur 30**, aucun échec.

| Essai | Résultat |
|---|---|
| Configuration nominale acceptée | Réussi |
| Consigne hors plage refusée | Réussi |
| Minimum supérieur au maximum refusé | Réussi |
| Alarme inférieure ou égale à la consigne refusée | Réussi |
| Niveaux CO₂ classés en quatre états | Réussi |
| Compte à rebours borné et formaté | Réussi |
| Conversion 0–100 % vers 0–10 V bornée | Réussi |
| Ressources PWA servies par HTTP | Réussi |
| État instantané cohérent | Réussi |
| Historique de 24 heures disponible | Réussi |
| Configuration valide enregistrée et relue | Réussi |
| Configuration dangereuse refusée par l'API | Réussi |
| Test actionneur démarré puis arrêté | Réussi |
| Test actionneur hors bornes refusé | Réussi |
| Contrat OpenAPI lisible et endpoints présents | Réussi |
| Configuration inaccessible sans session | Réussi |
| Mauvais mot de passe refusé sans révéler le compte | Réussi |
| Session installateur temporaire créée | Réussi |
| Écriture sans jeton anti-CSRF refusée | Réussi |
| Déconnexion et invalidation immédiate | Réussi |
| Blocage après tentatives répétées | Réussi |
| CSP, anti-iframe et autres en-têtes présents | Réussi |
| Écriture sans révision préalable refusée | Réussi |
| Écriture fondée sur une ancienne révision refusée | Réussi |
| Chaînes numériques refusées par le serveur strict | Réussi |
| Champ JSON supplémentaire refusé | Réussi |
| Journal technique refusé sans session | Réussi |
| Journal structuré sans identité ni texte libre | Réussi |
| Présentation sûre des codes d'événements dans l'interface | Réussi |
| Expiration du test : retour en AUTO et événement système | Réussi |
| Motif « fin automatique » affiché sans texte libre serveur | Réussi |

## 3. Vérification du serveur local

Les cinq ressources principales ont répondu en HTTP 200 :

- page d'accueil ;
- feuille de style ;
- logique d'application ;
- manifeste PWA ;
- service worker.

Les types MIME retournés sont cohérents avec chaque ressource.

## 4. Essai visuel

L'interface a été ouverte le 21 juin 2026 dans le navigateur intégré avec une largeur mobile de 390 px. Les parcours suivants ont été vérifiés : consultation sans compte, ouverture de la fenêtre de connexion, session installateur, accès aux réglages, test 25 %, arrêt et retour en AUTO, déconnexion puis désactivation des commandes. Le journal de diagnostic a aussi été contrôlé avec un test de 5 s : il affiche le démarrage, puis `Test actionneur arrêté · Système · Fin automatique`. Aucun avertissement ni erreur de console n'a été observé.

Cet essai a révélé puis permis de corriger un défaut d'intégration : après une authentification réussie, la fenêtre restait ouverte en affichant un faux échec parce que le formulaire était référencé après une attente asynchrone. Le parcours corrigé a été rejoué avec succès.

La seconde passe visuelle a révélé que l'expiration ramenait bien le contrôleur en AUTO mais n'inscrivait pas la fin du test dans le journal. Le simulateur journalise désormais cette transition avec la source `SYSTEM` et le motif numérique versionné `detail0 = 1`. Un essai automatisé avec horloge contrôlée et une nouvelle vérification visuelle confirment la correction.

L'installation réelle sur Android et iPhone reste à effectuer sur les appareils disponibles.

## 5. Conclusion

La PWA v0.1 est fonctionnelle comme maquette connectée à une API locale simulant le contrôleur. L'authentification et les protections d'écriture sont désormais démontrées dans le simulateur. Elle ne peut pas encore être considérée comme application validée pour le produit : le portage de l'API dans l'ESP32, le provisionnement réel des comptes, la récupération physique, les mises à jour signées et les essais Android/iPhone restent à réaliser.
