# Modèle de menaces v0.1

## 1. Périmètre

Le produit assure une régulation locale et expose temporairement une interface Wi-Fi de mise en service. Il ne dépend pas d'un cloud et ne doit pas être joignable directement depuis Internet dans la version 1.

Actifs à protéger :

- consigne CO₂ et débit minimal ;
- commande des volets ;
- firmware et mécanisme de mise à jour ;
- identifiants uniques du produit ;
- journaux de diagnostic ;
- disponibilité de la régulation ;
- intégrité des données de la sonde CO₂ et du capteur de débit.

## 2. Frontières de confiance

```text
[Téléphone installateur]
          │ Wi-Fi local non fiable par nature
          ▼
[Serveur Web/API du contrôleur] ──> [Réglages persistants]
          │                               │
          ▼                               ▼
[Logique de régulation] ─────────> [Sortie 0–10 V]
          ▲
          │ liaison capteur exposée au câblage chantier
[Tête CO₂ / capteur débit]
```

Le réseau radio, le téléphone, les câbles de capteur et tout fichier de mise à jour sont considérés comme non fiables tant qu'ils ne sont pas authentifiés et validés.

## 3. Menaces et traitements

| ID | Menace | Effet | Mesures de conception | Preuve attendue |
|---|---|---|---|---|
| M-01 | Mot de passe usine identique sur tous les produits | Prise de contrôle en série | Secret unique aléatoire par unité, QR code sous contrôle de l'installateur | Contrôle de production |
| M-02 | Point d'accès actif en permanence | Surface d'attaque inutile | Wi-Fi désactivé hors mise en service ou fenêtre de service limitée | Essai temporel |
| M-03 | Rejeu ou falsification d'une requête | Modification de consigne | Session authentifiée, jeton anti-CSRF, contrôle d'autorisation sur chaque commande | Tests API |
| M-04 | Essais massifs de connexion | Accès par force brute ou déni de service | Limitation, temporisation progressive, journalisation | Test automatisé |
| M-05 | Firmware modifié | Comportement malveillant ou dangereux | Signature du firmware, secure boot sur le produit final | Essai image invalide |
| M-06 | Coupure pendant mise à jour | Produit bloqué | Double partition et retour arrière | Essai de coupure |
| M-07 | Downgrade vers version vulnérable | Réintroduction de faille | Version minimale autorisée et politique de récupération contrôlée | Essai downgrade |
| M-08 | Paramètres corrompus | Débit minimum perdu | CRC/version, copie de secours, valeurs sûres | Injection corruption |
| M-09 | Trame capteur falsifiée ou câble perturbé | Mesure CO₂ incorrecte | CRC, compteur/timeout, plausibilité, ouverture 100 % en défaut | Injection de trames |
| M-10 | Interface de débogage accessible | Extraction secrets/firmware | Désactivation ou protection en production, pads non accessibles sans ouverture | Inspection produit |
| M-11 | Secret présent dans les journaux | Divulgation d'accès | Filtrage des journaux, aucune clé en clair exportée | Revue logiciel |
| M-12 | Bibliothèque Web vulnérable | Compromission locale | Dépendances minimales, inventaire SBOM, suivi CVE | Revue de version |
| M-13 | Produit rejoint le réseau du bâtiment par erreur | Exposition plus large | Version 1 en mode point d'accès local uniquement ; pas de mode routeur | Test réseau |
| M-14 | Réinitialisation distante non autorisée | Perte de service | Réinitialisation usine exigeant une action physique locale | Essai de sécurité |
| M-15 | Aucune politique de support | Vulnérabilités non corrigées | Durée de support annoncée, canal de signalement et processus de publication | Documentation CRA |

État au 21 juin 2026 : M-03 et M-04 sont démontrées dans l'API simulée (session, CSRF et limitation) ; M-08 dispose d'un format A/B avec CRC32, génération, bornes et coupures simulées à chaque octet. Les preuves ESP32/NVS et les coupures électriques réelles restent à produire.

## 4. Architecture de sécurité recommandée

- Wi-Fi SoftAP local uniquement pour la version 1.
- Activation du mode service par bouton encastré ou séquence physique documentée.
- Arrêt automatique du point d'accès après une durée configurable, proposée à 15 minutes.
- SSID non sensible et secret unique de longueur suffisante.
- HTTPS local à étudier, mais ne pas créer une fausse confiance avec un certificat générique partagé. Si HTTP local est retenu au prototype, aucune donnée personnelle et fenêtre de service physique limitée.
- API séparant lecture, réglages et opérations critiques.
- Secure boot, chiffrement flash et mises à jour signées sur la carte produit.
- Journal des modifications de paramètres et mises à jour.
- Nomenclature logicielle SBOM et versions figées à chaque livraison.

## 5. Données personnelles

La version 1 ne nécessite pas de nom, adresse électronique, géolocalisation, compte cloud ni historique nominatif. Elle ne doit pas enregistrer les adresses MAC des téléphones plus longtemps que nécessaire au fonctionnement de la session.

Les courbes CO₂ et débit peuvent indirectement révéler des périodes d'occupation. Leur conservation doit donc être limitée, locale, documentée et effaçable.

## 6. Décisions ouvertes

- durée exacte de la fenêtre Wi-Fi ;
- durée d'historique local ;
- HTTPS local avec certificat par appareil ou HTTP limité au mode service ;
- durée de support logiciel commercial ;
- canal public de signalement des vulnérabilités.
