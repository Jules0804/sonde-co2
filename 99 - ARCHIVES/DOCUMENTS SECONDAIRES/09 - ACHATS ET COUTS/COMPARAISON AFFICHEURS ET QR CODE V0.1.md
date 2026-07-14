# Comparaison afficheurs et QR code v0.1

**Date de vérification :** 20 juin 2026  
**Objet :** étude initiale d'un afficheur pour le CO₂, l'état et l'URL. Le QR code est désormais prévu gravé au laser sur le boîtier.

## 1. Exigences

- QR code lisible par Android et iPhone ;
- affichage du CO₂, de l'état et de l'ouverture hors mode service ;
- affichage SSID, adresse et compte à rebours en mode service ;
- interface logique 3,3 V compatible ESP32 ;
- température de service adaptée à un local technique ;
- consommation et coût contenus ;
- disponibilité suffisante pour le prototype ;
- aucun écran tactile nécessaire.

## 2. Comparaison

| Solution observée | Résolution | Interface | Consommation | Température | Prix TTC | Stock observé | Analyse |
|---|---:|---|---:|---|---:|---:|---|
| [IPS 1,3″ Joy-It SBC-LCD01](https://www.gotronic.fr/art-ecran-lcd-1-44-27-27-spi-48839.htm) | 240 × 240 | SPI 3,3 V | 8 à 10 mA | -20 à 70 °C | **7,20 €** | 23 | Meilleur rapport coût/résolution pour le banc |
| [IPS 2″ DFRobot DFR0664](https://www.gotronic.fr/art-module-afficheur-ips-2-dfr0664-32642.htm) | 240 × 320 | SPI, 3,3 à 5 V | 29 mA | -30 à 70 °C | 19,50 € | 10 | Plus lisible, candidat produit à comparer ergonomiquement |
| [OLED 1,5″ Waveshare 13992](https://www.gotronic.fr/art-module-afficheur-oled-1-5-13992-36261.htm) | 128 × 128 | I²C ou SPI | Non précisée sur la page | Non précisée sur la page | 15,60 € | 37 | Résolution inférieure et risque de marquage avec affichage statique |
| E-paper compact | Variable | SPI | Très faible hors rafraîchissement | Selon modèle | À chiffrer | Non vérifié | Très bon pour une image fixe, mais mal adapté au CO₂ et au compte à rebours |

Le DFRobot DFR0649 1,54″ 240 × 240 a également été étudié, mais il est retiré de la gamme GoTronic ; il n'est donc pas retenu comme référence d'achat.

## 3. Faisabilité du QR code

Un écran 240 × 240 permet de réserver presque toute la surface au QR code pendant la mise en service. Un QR de 37 modules avec une zone calme de 4 modules tient sur 225 pixels avec des modules de 5 pixels. Un QR plus dense de 41 modules tient sur 196 pixels avec des modules de 4 pixels.

Conditions :

- garder le SSID et le secret suffisamment courts ;
- ne jamais redimensionner avec interpolation ;
- conserver la zone blanche autour du code ;
- afficher le QR en noir et blanc avec luminosité suffisante ;
- vérifier la lecture sur de vrais téléphones et derrière la vitre du coffret.

## 4. Recommandation

### Premier banc

Le **SBC-LCD01 1,3″ 240 × 240 à 7,20 € TTC** reste un candidat d'essai, mais son achat n'est plus nécessaire au lot 1 puisque le QR sera gravé. Il permettrait plus tard de tester à faible coût :

- la lisibilité du QR ;
- l'ergonomie de l'écran ;
- le pilote ST7789VW ;
- l'intégration SPI avec le SCD41 et le DAC sur I²C.

### Version produit

Ne pas figer encore la dimension. Comparer physiquement le 1,3″ et un 2″ avant la conception du coffret. Le 2″ DFR0664 est plus lisible et offre une plage de température plus large, mais augmente le coût, la consommation et la découpe en façade.

## 5. Impact budgétaire du lot 1

| Élément | Montant TTC |
|---|---:|
| Panier GoTronic actuel livré | **69,00 €** |
| Afficheur SBC-LCD01 différé | Non inclus |
| Total maintenu du lot 1 | **69,00 €** |
| Marge restante sous le plafond de 90 € | **21,00 €** |

L'afficheur n'est pas ajouté au panier dans cette étude. Le stock, les frais de port et le total devront être revérifiés au moment de la commande.

## 6. Critères d'essai

- lecture du QR à 20, 40 et 80 cm ;
- lecture sous éclairage faible et fort ;
- lecture derrière la façade transparente envisagée ;
- affichage alterné CO₂ / service sans image résiduelle ;
- température du module après 24 h ;
- comportement au redémarrage et écran débranché ;
- absence d'effet d'une panne d'affichage sur la régulation.
