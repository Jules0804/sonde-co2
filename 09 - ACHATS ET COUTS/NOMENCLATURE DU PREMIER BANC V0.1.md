# Nomenclature du premier banc v0.1

**Date de chiffrage :** 20 juin 2026  
**Statut :** proposition à vérifier et valider avant achat  
**Prix :** indicatifs TTC lorsque connus, hors frais de port et remises professionnelles

## 1. Nomenclature principale — preuve CO₂ et deux volets

| Ligne | Qté | Désignation | Référence proposée | Prix unitaire indicatif | Total | Source/statut |
|---:|---:|---|---|---:|---:|---|
| 1 | 1 | Contrôleur ESP32 | Carte déjà possédée par Jules | 0,00 € | 0,00 € | Référence exacte à relever avant câblage |
| 2 | 1 | Breakout CO₂/temp./hum. SCD41 | DFRobot SEN0536 | 49,90 € | 49,90 € | [GoTronic](https://www.gotronic.fr/art-capteur-de-co2-scd41-ir-gravity-sen0536-38819.htm), observé en stock |
| 3 | 1 | DAC I²C deux canaux 0–10 V | DFRobot DFR0971 | 14,60 € | 14,60 € | [GoTronic](https://www.gotronic.fr/art-module-dac-i2c-dfr0971-35877.htm), observé en stock |
| 4 | 1 | Alimentation rail DIN 230/24 V, 60 W | Mean Well HDR-60-24 | 28,00 € | 28,00 € | Prix TTC observé, plusieurs fournisseurs |
| 5 | 1 | Convertisseur rail DIN 24/5 V, 15 W | Mean Well DDR-15G-5 | 20,75 € | 20,75 € | [Mouser](https://www.mouser.fr/ProductDetail/MEAN-WELL/DDR-15G-5), prix indicatif |
| 6 | 2 | Servomoteur 5 Nm, 24 V, 0/2–10 V | Siemens GDB161.1E | 142,39 € | 284,78 € | [Bola Systems](https://www.bolasystems.fr/servomoteur-siemens-gdb-161-1e-24-v-gdb161-1e) |
| 7 | 1 | Coffret prototype avec rail DIN | ABS ou petit coffret modulaire | 50,00 € | 50,00 € | Enveloppe à préciser après implantation |
| 8 | 1 lot | Protection entrée, fusibles 24 V, borniers, rail, goulotte | Composants industriels | 60,00 € | 60,00 € | Enveloppe prudente |
| 9 | 1 lot | Fils, embouts, presse-étoupes, connecteurs | — | 20,00 € | 20,00 € | Enveloppe |
| 10 | 1 lot | Bouton service, voyants, résistances | — | 5,00 € | 5,00 € | Enveloppe |
| 11 | 1 | Afficheur IPS 1,3″ 240 × 240 SPI | Joy-It SBC-LCD01 | 7,20 € | **Option non incluse** | État/URL seulement ; le QR Wi-Fi sera gravé sur le boîtier |

**Total principal estimé hors afficheur : 533,03 € TTC**, hors transport et registres.

Une réserve de 10 % pour petites fournitures porte l'enveloppe à environ **586,33 € TTC**.

## 2. Partie mécanique optionnelle

| Qté | Désignation | Estimation unitaire | Total estimé | Remarque |
|---:|---|---:|---:|---|
| 2 | Registre circulaire avec axe accessible, diamètre pilote à choisir | 60,00 € | 120,00 € | Peut être fabriqué/récupéré par l'entreprise CVC |
| 1 lot | Gaines/manchettes/supports de banc | 50,00 € | 50,00 € | Très variable selon récupération atelier |

Avec matériel mécanique acheté neuf, enveloppe totale prudente : **environ 760 € TTC**, transport inclus à confirmer.

## 3. Variante économique par étapes

### Étape A — Électronique sans volet

- ESP32 existant ;
- SCD41 ;
- DAC 0–10 V ;
- alimentation 24/5 V ;
- multimètre et petites fournitures.

Budget estimé : **150 à 220 € TTC** selon ce qui existe déjà dans l'atelier.

### Étape B — Un moteur

Ajouter un GDB161.1E : budget cumulé approximatif **290 à 370 € TTC**.

### Étape C — Deux moteurs et coffret complet

Budget principal calculé : environ **533 € TTC**, puis mécanique éventuelle.

Cette méthode réduit le risque financier mais la commande finale groupée peut réduire les frais de port.

## 4. Éléments volontairement reportés

- capteur de débit et organe K ;
- moteur 3 à 6 ;
- tête CO₂ RS-485 ;
- watchdog matériel ;
- PCB sur mesure ;
- essais de laboratoire ;
- appareil CO₂ de référence si l'entreprise n'en possède pas.

## 5. Substitutions autorisées avant achat

- GDB161.1E par Belimo LM24A-SR si le tarif professionnel est inférieur et les caractéristiques validées ;
- breakout SCD41 DFRobot par Seeed Grove SCD41 si moins cher et disponible ;
- alimentation HDR-60-24 par équivalent industriel certifié 24 V/60 W ;
- DDR-15G-5 par convertisseur 24/5 V industriel de puissance équivalente ;
- coffret par matériel atelier compatible avec les règles de sécurité.

Toute substitution doit conserver la référence dans le registre d'achats et être vérifiée électriquement.

## 6. Informations à relever avant commande

1. Référence exacte de l'ESP32 déjà possédé.
2. Matériel récupérable dans l'atelier : coffret, alimentations, borniers, registres, câbles.
3. Tarifs professionnels Siemens/Belimo de l'entreprise.
4. Appareil CO₂ de référence disponible ou non.
5. Diamètre retenu pour les deux registres du banc.
