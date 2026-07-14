# Schéma électrique de principe du banc v0.1

**Statut :** conception de phase 2, non autorisée à être mise sous tension avant revue finale  
**Architecture :** deux actionneurs 24 V proportionnels, extensible à six

## 1. Synoptique électrique

```text
RÉSEAU 230 V AC
 L ───── Q1/F1 ───────────────┐
 N ───────────────────────────┤ PS1 Mean Well HDR-60-24
 PE ──────────────────────────┘ selon coffret/classe
                                  │
                                  ├── +24 V BUS_MOTEURS
                                  └── 0 V  GND_24V

BUS_MOTEURS +24 V
  ├── F2 ── X2.1 ──> M1 Siemens GDB161.1E borne G
  ├── F3 ── X3.1 ──> M2 Siemens GDB161.1E borne G
  ├── réserve M3
  ├── réserve M4
  ├── réserve M5
  ├── réserve M6
  └── PS2 Mean Well DDR-15G-5 ──> +5 V LOGIQUE

GND_24V
  ├── X2.2 ──> M1 borne G0
  ├── X3.2 ──> M2 borne G0
  ├── PS2 entrée 0 V
  └── référence commune de la sortie 0–10 V

+5 V LOGIQUE
  ├── ESP32 DevKit VIN/5V
  ├── DAC DFR0971 VCC
  └── Breakout SCD41 VCC selon carte retenue

BUS I²C COURT
 ESP32 SDA/SCL
  ├── DFR0971 DAC 0–10 V
  └── SCD41 breakout

SORTIE COMMUNE
 DFR0971 VOUT0 0–10 V
  ├── X2.3 ──> M1 borne Y
  └── X3.3 ──> M2 borne Y

OPTION RETOUR
 M1 borne U 2–10 V ──> diviseur/protection ──> ADC ESP32
```

## 2. Repérage proposé

| Repère | Élément | Fonction |
|---|---|---|
| Q1/F1 | sectionnement/protection du banc | Protection entrée 230 V |
| PS1 | HDR-60-24 | 230 V AC vers 24 V DC / 60 W |
| PS2 | DDR-15G-5 | 24 V DC vers 5 V DC / 15 W |
| U1 | ESP32 DevKit existant | Contrôleur du prototype |
| U2 | DFR0971 | Deux sorties DAC 0–10 V par I²C |
| U3 | SEN0536 ou breakout SCD41 équivalent | CO₂/température/humidité |
| M1 | GDB161.1E | Volet soufflage, 24 V, 0–10 V |
| M2 | GDB161.1E | Volet reprise, 24 V, 0–10 V |
| F2/F3 | protections 24 V individuelles | Limitation défaut câble/moteur |
| X1 | bornier secteur | L/N/PE selon classe du coffret |
| X2/X3 | borniers moteurs | G, G0, Y et éventuellement U |
| S1 | bouton de service encastré | Activation mise en service/récupération |
| H1/H2 | voyants | alimentation/état-défaut |

## 3. Dimensionnement initial

- PS1 : 60 W / 2,5 A à 24 V.
- M1/M2 : consommation exacte à confirmer dans la fiche GDB161.1E.
- Extension six moteurs : somme des puissances de dimensionnement + logique + marge minimale de 25 %.
- Protections F2/F3 : valeur à choisir d'après le courant moteur, le câble et le pouvoir de coupure.
- Conducteurs moteurs : section à définir selon longueur, courant et chute de tension.

## 4. Sortie 0–10 V

Le DFR0971 fournit deux canaux 12 bits 0–10 V sur bornier et fonctionne sous 3,3 à 5 V. Le canal 0 commande les moteurs ; le canal 1 pourra servir aux essais, au doublage ou à une future séparation soufflage/reprise.

Avant raccordement :

- mesurer 0 V, 5 V et 10 V au multimètre ;
- confirmer le sens de déplacement du moteur ;
- paramétrer 0/2–10 V selon la fiche et le comportement voulu ;
- ne pas paralléliser les sorties de retour U des moteurs.

## 5. Tête CO₂ du premier banc

Le breakout SCD41 reste à proximité de l'ESP32 avec un câble I²C court. Il sera placé dans une petite chambre de test ventilée, sans flux d'air violent directement sur le module.

La tête RS-485 sur mesure appartient au produit alpha, après validation du capteur.

## 6. Étapes de mise sous tension future

1. Inspection visuelle et continuité hors tension.
2. Essai de PS1 seule, moteurs et logique débranchés.
3. Vérification 24 V et polarité.
4. Raccordement de PS2, puis vérification 5 V.
5. Alimentation de l'ESP32 et lecture du capteur sans moteur.
6. Vérification DAC au multimètre avec charge débranchée.
7. Raccordement d'un seul moteur.
8. Essais 0 %, 50 %, 100 %.
9. Raccordement du deuxième moteur.
10. Essais de défaut et d'échauffement.

## 7. Éléments non encore inclus

- watchdog matériel et relais/commutateur de repli 10 V ;
- mesure de courant des moteurs ;
- entrée retour U conditionnée ;
- mesure de débit ;
- tête CO₂ différentielle ;
- carte électronique définitive ;
- essais CEM et sécurité produit.

Ces fonctions seront ajoutées après la preuve de fonctionnement minimale.

