# Dossier de câblage et mise sous tension du lot 1 v0.1

**Périmètre :** Wemos ESP32-C3 + SEN0536/SCD41 + DFR0971, sans moteur et sans 24 V.  
**Statut :** prêt pour revue à réception ; GPIO et capacité 3,3 V encore à renseigner sur la carte exacte.

## 1. Principe retenu pour le premier démarrage

Le premier banc est volontairement limité à la très basse tension USB. Les deux modules I²C sont initialement alimentés en 3,3 V afin que leurs résistances de tirage ne puissent pas porter SDA ou SCL à 5 V. Cette alimentation n'est autorisée qu'après confirmation que le régulateur 3,3 V de la Wemos peut fournir le courant cumulé. Sinon, employer une alimentation 3,3 V régulée séparée, avec masse commune.

Il est interdit pendant cette étape de raccorder :

- une alimentation 24 V ;
- un servomoteur ;
- VOUT0 ou VOUT1 à une entrée de l'ESP32 ;
- un module alimenté en 5 V au bus I²C sans preuve du niveau logique ou convertisseur adapté.

## 2. Repères et fonctions

| Repère | Matériel | Fonction |
|---|---|---|
| U1 | Wemos ESP32-C3 exacte à identifier | Contrôleur et maître I²C |
| U2 | DFR0971 / GP8403 | Deux sorties analogiques 0–10 V |
| U3 | SEN0536 / SCD41 | Mesure CO₂, température et humidité |
| TP0 | point COM | Masse commune du voltmètre |
| TP1 | point VOUT0 | Mesure du canal DAC 0 |
| TP2 | point VOUT1 | Mesure du canal DAC 1 |

La liste fil à fil normative du banc est `NETLIST LOT 1 V0.1.csv`. Elle reste indépendante des numéros de GPIO jusqu'à l'identification de U1.

## 3. Affectation fonctionnelle provisoire

| Net | Depuis | Vers | Couleur conseillée | Contrôle avant branchement |
|---|---|---|---|---|
| LOGIC_3V3 | U1-3V3 | U2-VCC, U3-VCC | rouge | 3,0 à 3,6 V |
| LOGIC_GND | U1-GND | U2-GND, U3-GND, TP0 | noir | continuité hors tension |
| I2C_SDA | U1-GPIO_SDA | U2-SDA, U3-SDA | bleu | repos 3,0 à 3,6 V |
| I2C_SCL | U1-GPIO_SCL | U2-SCL, U3-SCL | jaune | repos 3,0 à 3,6 V |
| AO_0_10V | U2-VOUT0 | TP1 uniquement | violet | jamais vers U1 |
| AO2_0_10V | U2-VOUT1 | TP2 uniquement | gris | jamais vers U1 |

Les couleurs sont une convention d'établi, pas encore une règle de fabrication.

## 4. Qualification des résistances de tirage I²C

Avant de réunir les modules :

1. carte hors tension, relever pour chaque module la résistance apparente SDA–VCC et SCL–VCC ;
2. alimenter U2 seul en 3,3 V, mesurer SDA et SCL au repos ;
3. répéter avec U3 seul ;
4. réunir U2 et U3, puis mesurer de nouveau ;
5. accepter uniquement un niveau haut compris entre 3,0 et 3,6 V ;
6. si une ligne dépasse 3,6 V, couper immédiatement et corriger l'alimentation ou ajouter un convertisseur de niveau bidirectionnel ;
7. si la résistance équivalente des tirages est inférieure à 1,5 kΩ, retirer une paire de résistances de tirage ou isoler le bus avant de poursuivre.

À 100 kHz et avec des fils courts, une résistance équivalente comprise entre 1,5 et 10 kΩ constitue la fenêtre initiale du banc. Le front réel devra être observé à l'oscilloscope avant d'augmenter la fréquence ou la longueur.

## 5. Séquence de câblage contrôlée

Chaque changement est réalisé USB débranché.

1. Identifier U1 avec la fiche dédiée et reporter SDA/SCL dans le tableau du document de câblage basse tension.
2. Contrôler l'absence de continuité franche entre LOGIC_3V3 et LOGIC_GND.
3. Alimenter U1 seule par USB et mesurer 3,3 V.
4. Débrancher, raccorder U3 seul, puis lancer le scan I²C à 100 kHz : seule l'adresse `0x62` est attendue.
5. Débrancher, remplacer U3 par U2 : seule l'adresse `0x58` est attendue.
6. Débrancher, raccorder U2 et U3 : `0x58` et `0x62` doivent être présentes, sans autre adresse inconnue.
7. Laisser les deux sorties analogiques sur TP1/TP2 et le multimètre uniquement.
8. Imposer 10 V au démarrage, puis réaliser 0/20/50/80/100 % sur chaque canal.
9. Ne raccorder aucun moteur avant acceptation du rapport de réception du lot 1.

## 6. Points d'arrêt obligatoires

Classer l'essai `REFUSÉ` ou `SOUS RÉSERVE` sans poursuivre si :

- la variante Wemos ou ses broches ne sont pas identifiées ;
- le 3,3 V sort de 3,0–3,6 V ou s'effondre avec les modules ;
- SDA/SCL dépassent 3,6 V ;
- une adresse attendue manque ou une collision apparaît ;
- VOUT dépasse 10,2 V ;
- un composant chauffe, redémarre ou dégage une odeur ;
- la tension de sortie n'est pas monotone.

## 7. Mesures à consigner

| Mesure | Instrument | Critère |
|---|---|---|
| U1-3V3 à vide et chargé | multimètre | 3,0–3,6 V, sans instabilité |
| SDA/SCL au repos | multimètre puis oscilloscope | 3,0–3,6 V |
| Adresses U2/U3 | scan firmware | `0x58` et `0x62` |
| VOUT0/VOUT1 | multimètre | erreur absolue ≤ 0,10 V |
| courant USB du banc | wattmètre USB si disponible | à relever, sans seuil produit à ce stade |
| température des modules | sonde/thermomètre | pas d'échauffement anormal |

Les résultats sont reportés dans les modèles du dossier `08 - PROTOTYPES ET ESSAIS` et analysés avec l'outil déjà fourni.

## 8. Vérification documentaire

Depuis la racine du projet :

```powershell
node "04 - ELECTRONIQUE ET CABLAGE\verifier-netlist-lot1.mjs"
```

Le résultat nominal attend 17 raccordements et indique deux GPIO en attente. Après identification de la Wemos, les deux lignes U1 doivent être remplacées par les vrais numéros de broche, puis le document, la netlist et le firmware doivent recevoir la même révision.
