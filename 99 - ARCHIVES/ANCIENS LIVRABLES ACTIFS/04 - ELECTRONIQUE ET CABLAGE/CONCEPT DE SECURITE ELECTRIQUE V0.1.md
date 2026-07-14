# Concept de sécurité électrique v0.1

## 1. Objectif

Définir les règles non négociables du prototype et du futur produit avant tout schéma détaillé. Ce document ne remplace pas la revue d'un électrotechnicien ni les essais d'un laboratoire.

## 2. Architecture retenue à ce stade

```text
230 V AC
   │
   ├─ protection entrée
   ├─ protection surtension/filtrage selon essais CEM
   ▼
Alimentation logique AC/DC isolée et certifiée
   ├─ départ logique protégé ─> 5 V ─> 3,3 V
   ├─ départ capteurs protégé
   └─ commande analogique 0–10 V

Alimentation moteurs à comparer :
   ├─ option A : alimentation 24 V interne ─> six départs TBTS protégés
   └─ option B : distribution 230 V ─> six départs secteur protégés
```

## 3. Choix de classe à confirmer

### Option privilégiée : classe II

- coffret isolant ;
- alimentation avec isolation renforcée/double ;
- aucune partie métallique accessible nécessitant une terre ;
- câblage et PCB respectant les distances de sécurité.

Avantage : raccordement L/N simple. Inconvénient : discipline de conception et preuve d'isolation renforcée indispensables.

### Option alternative : classe I

- conducteur de protection PE ;
- liaison fiable de toutes les parties métalliques accessibles ;
- essais de continuité de terre.

Cette option devient nécessaire si le coffret ou les parties accessibles métalliques ne peuvent pas être maintenus en classe II.

## 4. Règles pour le premier banc

- utiliser une alimentation industrielle fermée ou capotée, certifiée, montée dans un coffret ;
- ne jamais laisser de bornes 230 V nues accessibles ;
- protéger l'entrée par un dispositif adapté au banc ;
- séparer physiquement le secteur des câbles capteurs et USB ;
- prévoir un arrêt et une mise hors tension facilement identifiables ;
- réaliser les mesures hors tension avant chaque modification ;
- ne raccorder les volets qu'après contrôle de polarité et tension ;
- documenter chaque modification du câblage.

## 5. Dimensionnement provisoire

Pour l'option 24 V, la valeur de 60 W est uniquement une hypothèse de planification. Pour l'option 230 V, dimensionner la distribution, les protections et les borniers au courant total et aux défauts prévisibles.

Calcul à effectuer en phase 2 :

```text
P_alim >= somme des puissances maximales moteurs
       + puissance contrôleur/capteurs/afficheur
       + marge de démarrage et température
```

Les fiches techniques devront fournir la puissance ou le courant de dimensionnement, qui peut être supérieur à la consommation en régime établi.

## 6. Protections à étudier

- fusible ou protection d'entrée coordonnée avec l'alimentation ;
- limitation d'appel de courant si nécessaire ;
- protection surtension secteur adaptée au domaine d'installation ;
- fusibles réarmables ou électroniques sur les départs moteurs ;
- protection inversion/court-circuit des connecteurs basse tension ;
- limitation et protection de la sortie 0–10 V ;
- surveillance thermique du boîtier si l'échauffement le justifie.

## 7. Séparation et implantation

- zone secteur dédiée sur le PCB ou module séparé ;
- barrière d'isolement identifiable ;
- aucune piste, vis ou entretoise ne réduit les distances requises ;
- connecteurs secteur incompatibles avec les connecteurs TBTS ;
- capot interne éventuel sur la zone secteur ;
- cheminement des fils empêchant qu'un fil secteur détaché touche la basse tension ;
- matériaux de coffret et PCB avec caractéristiques feu adaptées.

Les distances exactes de fuite et d'isolement seront calculées après choix de la norme, catégorie de surtension, degré de pollution, altitude et matériaux.

## 8. Défauts à tester

- court-circuit de chaque départ moteur ;
- court-circuit de la sortie 0–10 V ;
- surcharge avec six moteurs ;
- perte de l'alimentation logique avec alimentation moteurs présente et inversement ;
- surtension/sous-tension raisonnablement prévisible ;
- échauffement à charge maximale dans le coffret fermé ;
- fil débranché ou erreur de bornier ;
- blocage d'un moteur.

## 9. Sortie de sécurité sous tension

Le watchdog matériel et le chemin de repli 10 V ne doivent pas dépendre du bon fonctionnement du microcontrôleur. Le chemin doit fonctionner avec la tension moteur finalement retenue tant que le secteur est présent. Il ne crée aucune garantie lors d'une coupure totale, conformément à D-004.

## 10. Informations manquantes avant schéma

- modèles de moteurs, tension et courant maximal ;
- alimentation retenue ;
- classe I ou II ;
- catégorie de surtension et environnement ;
- indice IP ;
- température ambiante maximale ;
- type et section des câbles chantier ;
- norme produit principale confirmée.
