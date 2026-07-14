# Comparaison des capteurs CO₂ v0.1

**Date des prix observés :** 20 juin 2026  
**Statut :** étude de phase 2, aucun achat autorisé

## 1. Critères

| Critère | Importance |
|---|---:|
| Stabilité et précision dans la plage 400–2 000 ppm | Très élevée |
| Prix en petite série puis en volume | Très élevée |
| Disponibilité et pérennité | Élevée |
| Taille et intégration dans une tête de gaine | Élevée |
| Calibration/compensation pression | Élevée |
| Robustesse de la liaison au contrôleur | Élevée |
| Température/humidité intégrées | Utile, non prioritaire |

## 2. Sensirion SCD41

- technologie photoacoustique NDIR ;
- plage de précision étendue annoncée 400 à 5 000 ppm ;
- précision typique spécifiée de l'ordre de ±(40 ppm + 5 % de la mesure) dans les conditions prévues par la fiche ;
- température et humidité intégrées ;
- compensation d'altitude/pression disponible ;
- très compact : environ 10,1 × 10,1 × 6,5 mm ;
- interface I²C ;
- prix composant observé chez Mouser : environ 17,66 € à l'unité, hors taxes/frais selon affichage ;
- carte d'évaluation officielle beaucoup plus chère, environ 64,45 € hors taxes.

Sources :

- [Sensirion — SCD41](https://sensirion.com/products/catalog/SCD41)
- [Sensirion — fiche SCD4x](https://sensirion.com/media/documents/48C4B7FB/64C134E7/Sensirion_SCD4x_Datasheet.pdf)
- [Mouser — SCD41-D-R2](https://www.mouser.fr/ProductDetail/Sensirion/SCD41-D-R2)

### Appréciation

Meilleur compromis coût/taille/performance pour la future tête sur mesure. La conception mécanique de la prise d'air et la stratégie de calibration devront être sérieusement testées.

## 3. Sensirion SCD40

- même famille compacte photoacoustique NDIR ;
- version plus économique ;
- précision et plage garanties plus limitées que le SCD41 ;
- interface et intégration proches du SCD41.

### Appréciation

Intéressant si les tarifs en volume créent un écart significatif. Pour le prototype, l'économie de quelques euros ne compense pas la moindre performance : le SCD41 est préféré.

Source : [Sensirion — famille SCD4x](https://sensirion.com/products/catalog/SCD40).

## 4. Sensirion SCD30

- NDIR transmissif ;
- plage annoncée 400 à 10 000 ppm ;
- précision annoncée ±(30 ppm + 3 % de la mesure) dans les conditions prévues ;
- température et humidité intégrées ;
- module nettement plus volumineux ;
- prix observé chez Mouser : environ 35,37 € à l'unité ;
- technologie éprouvée et plus précise, mais coût environ double du SCD41 brut.

Sources :

- [Sensirion — SCD30](https://sensirion.com/products/catalog/SCD30)
- [Mouser — SCD30](https://www.mouser.fr/ProductDetail/Sensirion/SCD30)

### Appréciation

Excellent candidat de référence ou de comparaison sur banc. Moins favorable pour un produit compact et économique.

## 5. Sonde de gaine industrielle 0–10 V/Modbus

Exemples de familles Siemens, Belimo ou autres fabricants CVC : boîtier, probe, compensation et sortie industrielle déjà intégrés.

### Avantages

- installation immédiatement adaptée à la gaine ;
- câblage robuste ;
- documentation CVC ;
- moins de développement mécanique et électronique.

### Limites

- prix généralement très supérieur au module brut ;
- encombrement ;
- dépendance à une référence extérieure ;
- ne permet pas d'atteindre l'objectif de carte/tête sur mesure économique.

### Appréciation

À utiliser éventuellement comme appareil de comparaison ou comme variante premium, pas comme cœur économique de la version 1.

## 6. Problème de liaison

Le SCD41 et le SCD30 exposent des interfaces prévues pour une liaison locale. Faire circuler directement l'I²C sur plusieurs mètres dans un faux plafond serait fragile.

Architecture recommandée pour le produit :

```text
SCD41 ─ I²C très court ─ petit microcontrôleur de tête
                              │
                         liaison différentielle
                         RS-485 ou UART robuste
                              │
                         boîtier principal
```

Cette tête pourra porter son numéro de série, ses coefficients de calibration et ses diagnostics. Le coût du microcontrôleur et du transceiver devra être ajouté à la nomenclature.

Pour le premier banc, un breakout SCD41 raccordé par un câble I²C court à l'ESP32 est acceptable.

## 7. Calibration et implantation en gaine

- protéger le capteur contre poussière, condensation et impact direct du flux ;
- concevoir une chambre diffusante ou une probe plutôt que placer le module nu face au courant d'air ;
- fournir la pression/altitude pour la compensation si nécessaire ;
- vérifier l'influence de la température interne ;
- tester l'auto-calibration dans le scénario réel de salle de réunion ;
- permettre de désactiver l'auto-calibration et d'effectuer une calibration forcée documentée ;
- comparer temporairement la mesure à un instrument de référence traçable.

## 8. Recommandation

### Premier banc

- SCD41 monté sur breakout fiable ;
- liaison I²C courte ;
- comparaison avec un appareil CO₂ de référence disponible dans l'entreprise ou loué/emprunté ;
- enregistrement simultané des valeurs.

### Produit

- SCD41 brut dans une tête déportée sur mesure ;
- petit microcontrôleur et liaison différentielle ;
- tête remplaçable et identifiable ;
- stratégie de calibration validée par essais prolongés.

### Alternative

Conserver le SCD30 comme référence de comparaison et solution premium si les essais du SCD41 révèlent une dérive ou une sensibilité mécanique insuffisante.

## 9. Décision proposée

Retenir provisoirement le **Sensirion SCD41** comme capteur du banc et cible produit, sous réserve :

- d'une carte breakout adaptée pour le prototype ;
- d'une comparaison avec un instrument de référence ;
- des essais en gaine ;
- d'une validation de la calibration et de la dérive.

