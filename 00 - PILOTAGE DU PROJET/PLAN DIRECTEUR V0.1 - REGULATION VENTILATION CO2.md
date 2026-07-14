# Plan directeur v0.1 — Régulation de ventilation CO₂

**Statut :** validé par Jules ; exécution en cours  
**Méthode :** développement par jalons avec validation avant chaque engagement important

## Vue d'ensemble

Le projet sera conduit du besoin jusqu'à un produit reproductible et préparé pour la commercialisation. Le prototype est un jalon de réduction des risques, pas la finalité.

## Phase 0 — Cadrage

### Travaux

- Consolider les réponses de l'entretien.
- Valider le périmètre de la version 1 et les évolutions.
- Définir les termes, hypothèses et limites.
- Créer le registre des décisions et des risques.

### Livrables

- Cahier des charges v1.
- Plan directeur validé.
- Liste des décisions ouvertes.

### Validation

Accord de Jules sur le fonctionnement attendu, les priorités et les étapes.

## Phase 1 — Études réglementaires et architecture système

### Travaux

- Identifier les textes applicables à la ventilation des salles visées.
- Déterminer la stratégie et la consigne CO₂ par défaut.
- Étudier les exigences électriques, CEM, radio, cybersécurité, substances, déchets et marquage CE.
- Définir ce qui relève d'un prototype interne et ce qui relève du futur produit vendu.
- Comparer les architectures de commande, d'alimentation et de communication.
- Définir les états de panne et la position sûre des volets.

### Livrables

- Matrice réglementaire avec sources et preuves attendues.
- Architecture fonctionnelle et électrique de principe.
- Analyse préliminaire des risques.
- Spécification des interfaces.

### Validation

Aucune obligation critique oubliée et architecture de référence choisie.

## Phase 2 — Comparaison et sélection des composants

### Travaux

- Comparer plusieurs sondes CO₂ NDIR.
- Comparer servomoteurs économiques, Belimo et Siemens.
- Comparer commandes 0–10 V, trois points et autres solutions.
- Dimensionner l'alimentation pour six moteurs.
- Comparer les solutions de mesure de débit.
- Comparer afficheurs, coffrets, connecteurs et protections.
- Acheter uniquement le matériel nécessaire au premier banc après validation.

### Livrables

- Matrice de choix pondérée.
- Nomenclature du prototype.
- Nomenclature cible provisoire du produit.
- Budget et liste d'achats.

### Estimation provisoire

- Banc minimal CO₂ + commande : environ 250 à 700 € selon les servomoteurs et capteurs retenus.
- Ajout d'une mesure de débit instrumentée : environ 100 à 500 € supplémentaires.

Ces montants sont des enveloppes de planification, pas des devis. Les prix seront vérifiés avant achat.

### Validation

Compatibilité électrique démontrée sur papier, composants disponibles et budget accepté.

## Phase 3 — Schémas et banc d'essai

### Travaux

- Réaliser le schéma de câblage du banc.
- Définir les protections, fusibles et borniers.
- Concevoir un montage sûr séparant le 230 V de la basse tension.
- Préparer une gaine ou un dispositif de test CO₂.
- Installer un volet de soufflage et un volet de reprise.

### Livrables

- Schéma électrique du prototype.
- Plan d'implantation.
- Liste de câbles et repérage.
- Procédure de montage et contrôle avant mise sous tension.

### Validation

Relecture du schéma et contrôles électriques réalisés avant alimentation.

## Phase 4 — Logiciel embarqué minimal

### Travaux

- Lire et filtrer la mesure CO₂.
- Commander proportionnellement les volets.
- Gérer les paramètres persistants.
- Ajouter journal de diagnostic, watchdog et détection de sonde.
- Créer un simulateur logiciel pour tester sans matériel lorsque possible.

### Livrables

- Code source versionné.
- Tests automatisés de la logique de régulation.
- Documentation des paramètres.
- Procédure d'installation du firmware.

### Validation

La logique fonctionne en simulation puis sur table sans instabilité dangereuse.

## Phase 5 — Application téléphonique locale

### Travaux

- Créer une interface Web adaptative hébergée localement.
- Mettre au point la connexion initiale au produit.
- Afficher CO₂, ouverture, états et diagnostics.
- Permettre les réglages, tests et mise à jour locale.
- Protéger l'accès et prévoir la récupération en cas de perte d'identifiants.

### Livrables

- Maquettes d'écran.
- Application initiale.
- Parcours de mise en service.
- Tests sur Android et iPhone selon les appareils disponibles.

### Validation

Un installateur peut configurer le produit sans ordinateur ni Internet.

## Phase 6 — Essais CO₂ et volets

### Travaux

- Vérifier la précision et la stabilité du CO₂.
- Tester la régulation avec des variations contrôlées.
- Mesurer les temps de réaction.
- Tester pertes de sonde, coupures et redémarrages.
- Tester deux puis six servomoteurs.
- Vérifier l'échauffement et la puissance électrique.

### Livrables

- Protocole et rapport d'essais.
- Courbes CO₂/consigne/ouverture.
- Liste d'anomalies et corrections.

### Validation

Tous les essais critiques passent et les défauts conduisent à un état maîtrisé.

## Phase 7 — Mesure du débit

### Travaux

- Construire ou intégrer la solution sélectionnée.
- Étalonner sur plusieurs débits et diamètres.
- Afficher la mesure dans l'application.
- Décider si le débit reste informatif ou entre dans la régulation.
- Étudier la calibration automatique du débit minimal.

### Livrables

- Sous-ensemble de mesure.
- Courbes de calibration et incertitude.
- Procédure de mise en service.

### Validation

Précision et répétabilité suffisantes sur la plage retenue.

## Phase 8 — Pilote dans la salle de réunion

### Travaux

- Relever la salle et définir l'installation.
- Installer le système de manière réversible.
- Effectuer des essais hors occupation puis pendant des réunions surveillées.
- Mesurer CO₂, débit, ouverture, bruit et comportement du réseau.
- Recueillir le retour des installateurs et utilisateurs.

### Livrables

- Dossier d'installation pilote.
- Rapport de mise en service.
- Historique de fonctionnement.
- Liste d'améliorations.

### Validation

Fonctionnement stable et utile dans les conditions réelles du site pilote.

## Phase 9 — Carte électronique et produit alpha

### Travaux

- Transformer le prototype en schéma électronique industriel.
- Sélectionner les composants pérennes.
- Concevoir le circuit imprimé et le boîtier.
- Faire fabriquer une petite série de cartes.
- Réaliser les essais de mise au point et de préconformité.

### Livrables

- Schémas électroniques.
- PCB, fichiers de fabrication et nomenclature.
- Boîtier et documentation d'assemblage.
- Plusieurs unités alpha traçables.

### Estimation provisoire

- Première itération de cartes et assemblage en petite quantité : environ 500 à 2 500 €.
- Boîtier ou prototypes mécaniques : environ 100 à 1 000 € selon la méthode.

### Validation

Les unités alpha reproduisent les fonctions du banc et passent les essais internes.

## Phase 10 — Produit bêta et pré-industrialisation

### Travaux

- Installer plusieurs unités sur des chantiers pilotes.
- Améliorer fabricabilité, câblage, maintenance et diagnostic.
- Figer les composants et fournisseurs.
- Mettre en place numéros de série, versions et traçabilité.
- Préparer les procédures de production et de contrôle final.

### Livrables

- Série bêta.
- Dossier de définition produit.
- Instructions d'assemblage et de test.
- Manuel installateur et utilisateur.

### Validation

Produit reproductible avec un taux de réussite et un temps de pose acceptables.

## Phase 11 — Conformité et certification

### Travaux

- Finaliser l'analyse de risques.
- Réaliser les essais de sécurité électrique, CEM et radio applicables.
- Constituer le dossier technique et les déclarations nécessaires.
- Corriger le produit en cas d'échec d'essai.
- Faire valider les documents juridiques et réglementaires par les spécialistes appropriés.

### Estimation provisoire

Les essais et accompagnements peuvent représenter plusieurs milliers à plusieurs dizaines de milliers d'euros selon les fonctions radio, l'alimentation, les reprises de conception et les marchés visés. Un devis de laboratoire sera demandé avant de figer le produit.

### Validation

Toutes les preuves de conformité nécessaires à la mise sur le marché visée sont disponibles.

## Phase 12 — Lancement et cycle de vie

### Travaux

- Définir prix, garantie, support et pièces détachées.
- Créer les documents commerciaux sans promesses non démontrées.
- Organiser fabrication, contrôle, emballage et expédition.
- Prévoir maintenance, mises à jour, traitement des vulnérabilités et fin de vie.
- Suivre les retours terrain et les versions.

### Livrables

- Produit commercialisable.
- Dossier de fabrication.
- Documentation complète.
- Processus SAV et mises à jour.

### Validation

La production et le support peuvent être assurés durablement.

## Principaux risques à suivre

| Risque | Effet possible | Réduction prévue |
|---|---|---|
| Mesure CO₂ peu représentative dans la gaine | Mauvaise régulation | Positionnement, essais comparatifs et procédure d'installation |
| Fermeture des volets perturbant le réseau | Débits imprévus et bruit | Exiger une centrale compatible et vérifier la pression au pilote |
| Six moteurs dépassant la puissance disponible | Panne ou échauffement | Dimensionnement au pire cas et protections par branche |
| Défaut de sonde pendant que le boîtier reste alimenté | Régulation incorrecte | Détection du défaut, ouverture commandée à 100 % et alarme |
| Mesure universelle 50–2 000 m³/h irréaliste | Coût ou précision insuffisante | Gammes mécaniques et calibrations distinctes |
| Accès Wi-Fi non protégé | Modification malveillante | Appairage local, identifiants uniques et mises à jour sûres |
| Carte sur mesure lancée trop tôt | Coûts et reprises | Valider les fonctions sur banc avant le PCB |
| Certification abordée trop tard | Refonte coûteuse | Étude réglementaire et préconformité dès l'architecture |
| Dépendance à un composant | Rupture de production | Secondes sources et composants pérennes |

## Décisions proposées pour validation immédiate

1. Utiliser un ESP32 pour le prototype, sans préjuger du microcontrôleur final.
2. Comparer les servomoteurs 24 V et 230 V proportionnels avant de figer l'alimentation des moteurs.
3. Commencer avec deux volets, puis valider six moteurs.
4. Développer une application Web locale installable sur téléphone, sans cloud.
5. Reporter Modbus et BACnet après la version 1, tout en préparant leur ajout.
6. Ajouter la mesure de débit juste après la validation du contrôle CO₂/volets.
7. Ne pas fixer encore le seuil CO₂, le coût cible ou la technologie de débit avant les études correspondantes.
8. Ne pas imposer de rappel à l'ouverture lors d'une coupure totale de courant ; la salle est considérée comme inoccupée.

## Projet définitif

Le dossier `9 - PROJET REGULATION VENTILATION CO2` a été créé après validation. Les phases sont désormais exécutées dans ce dossier.
