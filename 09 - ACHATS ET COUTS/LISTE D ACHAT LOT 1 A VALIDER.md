# Liste d'achat — Lot 1 validé

**Statut :** validé par Jules, plafond de 90 € TTC

## Objectif du lot

Valider avec l'ESP32 déjà possédé :

1. la lecture stable du CO₂ ;
2. la communication I²C ;
3. la génération mesurable d'une consigne 0–10 V ;
4. le début du logiciel et de l'interface sans immobiliser le coût des moteurs.

## Articles

| Qté | Article | Référence | Prix TTC observé | Source |
|---:|---|---|---:|---|
| 1 | Module CO₂/température/humidité SCD41 Gravity | DFRobot SEN0536 | 49,90 € | [GoTronic](https://www.gotronic.fr/art-capteur-de-co2-scd41-ir-gravity-sen0536-38819.htm) |
| 1 | Module DAC I²C deux sorties 0–10 V | DFRobot DFR0971 | 14,60 € | [GoTronic](https://www.gotronic.fr/art-module-dac-i2c-dfr0971-35877.htm) |

**Sous-total articles : 64,50 € TTC.**

Budget maximal conseillé avec transport et petit imprévu : **90 € TTC**.

## Matériel supposé déjà disponible

- ESP32 ;
- câble USB et alimentation USB ;
- ordinateur ;
- multimètre ;
- fils de prototypage/breadboard.

Si un de ces éléments manque, ne pas commander avant mise à jour de la liste.

## Articles non achetés dans ce lot

- servomoteurs ;
- alimentations 24 V et 5 V ;
- coffret et protections secteur ;
- registres/gaines ;
- mesure de débit ;
- afficheur.

## Critères de validation du lot 1

- SCD41 détecté sur le bus I²C ;
- lecture CO₂ enregistrée pendant au moins 24 heures sans blocage ;
- valeurs plausibles comparées à l'air extérieur et à une pièce occupée ;
- DAC réglable et mesuré à environ 0, 2, 5, 8 et 10 V ;
- redémarrage ESP32 sans sortie incontrôlée prolongée ;
- journaux de test conservés dans le projet.

## Autorisation

Jules a validé le lot 1 avec un budget maximal de 90 € TTC. Cette validation autorise la préparation de la commande dans cette limite. Le paiement final et la vérification du panier restent à effectuer au moment de l'achat.

## Comparaison fournisseurs

La comparaison du 20 juin 2026 confirme GoTronic comme meilleur choix disponible : **69,00 € TTC livré**. Farnell atteint déjà 70,79 € TTC hors transport et annonce une disponibilité à partir du 14 août 2026 ; TME affiche le SEN0536 hors stock. Les autres distributeurs professionnels n'apportent pas d'économie démontrée.

Voir `COMPARAISON FOURNISSEURS LOT 1 V0.1.md`.

## Recontrôle avant commande — 21 juin 2026

- SEN0536 : 49,90 € TTC, 14 unités annoncées en stock ;
- DFR0971 : 14,60 € TTC, 18 unités annoncées en stock ;
- sous-total : 64,50 € TTC ;
- livraison estimée : 4,50 € TTC ;
- total du panier : **69,00 € TTC livré** ;
- marge sous le plafond autorisé : **21,00 € TTC**.

Le panier GoTronic contient exactement une unité de chaque référence. Aucun afficheur, moteur ou accessoire supplémentaire n'a été ajouté. La commande et le paiement ne sont pas encore effectués.
