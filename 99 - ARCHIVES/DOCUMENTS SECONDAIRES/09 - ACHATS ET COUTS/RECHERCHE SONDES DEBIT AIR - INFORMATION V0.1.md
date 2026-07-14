# Recherche de solutions de mesure du débit d'air en gaine — information V0.1

**Projet :** Régulation de ventilation CO₂  
**Date de recherche :** 21 juin 2026  
**Statut :** étude informative, sans autorisation ni recommandation d'achat  
**Besoin exploratoire :** débits d'environ 50 à 2 000 m³/h, avec plusieurs diamètres de gaine possibles

## 1. Résumé utile

Pour une régulation professionnelle du débit d'une salle de réunion, la piste la plus cohérente à étudier est une **prise de pression différentielle multipoint ou une station de mesure calibrée**, associée à un transmetteur capable d'appliquer le facteur K. Elle mesure mieux la moyenne de la section qu'une sonde ponctuelle et permet de conserver une chaîne de mesure indépendante du volet.

Une **sonde thermique de vitesse** est intéressante pour un prototype ou lorsque la perte de charge doit être quasi nulle. Elle ne mesure toutefois qu'un point : le débit calculé dépend fortement du profil de vitesse, du diamètre, des perturbations amont et de l'emplacement exact de la sonde.

Un **VAV avec mesure et actionneur intégrés** est la solution industrielle la plus compacte. Il réduit fortement le développement de la boucle de débit, mais il transforme le projet : le fabricant du terminal VAV calibre l'ensemble capteur–volet–actionneur, et le contrôleur ESP32 devient plutôt un superviseur/coordinateur.

Point fondamental : **une seule chaîne dimensionnée pour 50 à 2 000 m³/h ne peut pas être supposée précise sur tout ce rapport 40:1**. Avec une mesure différentielle, Δp varie comme le carré du débit. Entre 50 et 2 000 m³/h, le rapport de pression est donc théoriquement de 1 à 1 600. Il faudra définir plusieurs tailles ou plages, et non une référence universelle.

## 2. Relations de calcul

### 2.1 Mesure par pression différentielle

Pour une station ou une sonde dont le fabricant donne un facteur K :

```text
Q = K × √Δp
```

avec les unités imposées par le fabricant de l'organe de mesure. Le facteur K n'est pas interchangeable entre diamètres, géométries ou marques.

Conséquence sur l'incertitude :

```text
erreur relative sur Q ≈ 0,5 × erreur relative sur Δp
```

Cette approximation ne couvre pas les erreurs du facteur K, du profil de vitesse, des tuyaux, de la pose et de la densité de l'air.

### 2.2 Mesure de vitesse

```text
Q [m³/h] = vitesse moyenne [m/s] × section [m²] × 3 600
```

Une sonde ponctuelle fournit une vitesse locale, pas automatiquement la vitesse moyenne. Un coefficient de profil, un emplacement reproductible ou un étalonnage sur banc est donc nécessaire.

Exemples de vitesses théoriques dans une gaine ronde :

| Débit | Ø 200 mm | Ø 250 mm | Ø 315 mm | Ø 400 mm |
|---:|---:|---:|---:|---:|
| 50 m³/h | 0,44 m/s | 0,28 m/s | 0,18 m/s | 0,11 m/s |
| 500 m³/h | 4,42 m/s | 2,83 m/s | 1,78 m/s | 1,11 m/s |
| 2 000 m³/h | 17,68 m/s | 11,32 m/s | 7,13 m/s | 4,42 m/s |

Ces valeurs montrent qu'une sonde 0,2–20 m/s peut couvrir plusieurs cas, mais pas 50 m³/h dans les grands diamètres avec une marge suffisante.

## 3. Comparaison synthétique

| Famille | Référence étudiée | Grandeur/plage annoncée | Sorties | Atout principal | Limite principale | Ordre de prix constaté ou budgétaire* |
|---|---|---|---|---|---|---:|
| Transmetteur Δp + Pitot/facteur K | Sentera **DPS-F-1K0-2** + PSET ou organe K | 0–1 000 Pa ; calcul débit, vitesse ou pression | 0–10 V / 0–20 mA / PWM et Modbus RTU | Intégration simple, affichage, IP65 | La précision du débit dépend d'abord de l'organe K et du faible Δp | enveloppe à vérifier : 150–350 € l'ensemble |
| Transmetteur Δp Modbus | HK Instruments **DPT-MOD-2500-D** | plages jusqu'à 2 500 Pa selon modèle ; débit, vitesse, pression | Modbus RTU | Auto-zéro disponible selon variante, fonctions HVAC | Plage 2 500 Pa trop large si le signal utile est de quelques pascals | devis ; enveloppe à vérifier : 200–400 € |
| Sonde multipoint + transmetteur | HK Instruments **FloXact** + DPT-Flow/DPT-MOD | vitesse minimale annoncée 1,0 m/s ; tailles rondes 100–1 200 mm | dépend du transmetteur associé | moyenne multipoint, signal Δp amplifié 2,5× | ne couvre pas correctement les très faibles vitesses ; nécessite deux tubes | sonde R10 : 48,93 USD hors transport ; chaîne complète à chiffrer |
| Sonde thermique ponctuelle | E+E **EE650** | 0,2–10/15/20 m/s sélectionnable | 0–10 V, 4–20 mA ou Modbus RTU selon configuration | très faible perte de charge, large dynamique | mesure locale, sensible au profil et à l'encrassement | 560,17 € TTC, configuration distribuée consultée |
| Station de mesure calibrée | TROX **VMR** + transducteur XTD/XTS/BTD selon version | Ø 100–400 mm ; 34–6 279 m³/h selon tailles/versions | manuel ou signal électrique selon transducteur ; 0–10/2–10 V pour XTD | organe de mesure industriel prêt à intégrer | coût, encombrement, perte de charge, précision variable à faible débit | sur devis ; enveloppe à vérifier : 500–1 500 € |
| VAV intégré | Belimo **LMV-D3-MOD**, monté/calibré sur terminal VAV | plage définie par le fabricant du caisson VAV | BACnet MS/TP, Modbus RTU, MP-Bus, 0/2–10 V | capteur Δp + régulateur + actionneur 5 Nm intégrés | vendu aux fabricants de caissons VAV ; pas une sonde indépendante | actionneur/régulateur seul : 441,49 € TTC ; caisson en plus |

\* Les prix sont seulement des points de repère observés le 21 juin 2026. Ils ne comprennent pas nécessairement livraison, accessoires, étalonnage, alimentation, câbles ou organe de mesure. Ils ne constituent ni un devis ni une sélection d'achat.

## 4. Analyse détaillée des solutions

### 4.1 Sentera DPS-F-1K0-2 avec organe de mesure

Le DPS-F-1K0-2 mesure une pression différentielle de 0 à 1 000 Pa. Le fabricant indique qu'il peut calculer le débit volumique à partir d'un facteur K, ou la vitesse/débit à partir d'une section de gaine et d'un tube de Pitot. Il dispose d'un afficheur, d'une sortie analogique configurable et de Modbus RTU.

**Données fabricant vérifiées :**

- alimentation 24 VDC ;
- sortie configurable 0–10 VDC, 0–20 mA ou PWM ;
- Modbus RTU ;
- affichage pression, débit ou vitesse ;
- boîtier IP65 ;
- montage mural, avec deux tubes vers l'organe de mesure ;
- accessoires cités : PSET-PTS-200 (Pitot 150 mm), PSET-PTL-200 (250 mm), PSET-PVC-200 et PSET-QF-200.

**Intérêt pour le projet :** interface immédiatement exploitable par automate ou ESP32 via un convertisseur RS-485 isolé. La sortie 0–10 V est aussi compatible avec une entrée analogique protégée.

**Réserves :**

- la fiche publique consultée ne permet pas encore de valider l'incertitude totale à bas Δp ;
- 0–1 000 Pa est probablement surdimensionné pour une station de petite gaine ;
- un simple Pitot ponctuel ne constitue pas une moyenne de section ;
- le K et la plage doivent être définis avec la géométrie réelle.

### 4.2 HK Instruments DPT-MOD

Le DPT-MOD est un transmetteur multifonction pour pression différentielle/statique, vitesse et débit. Le modèle 2 500 Pa peut recevoir un K et expose les mesures par Modbus. La documentation fabricant annonce pour le modèle 2500, sur la pression appliquée :

- sous 125 Pa : 1 % + ±2 Pa ;
- au-dessus de 125 Pa : 1 % + ±1 Pa.

Cette erreur absolue est importante lorsque le signal utile est inférieur à quelques pascals. La variante avec auto-zéro doit être étudiée si une mesure basse pression continue est retenue.

**Réserves :** le produit peut convenir à une CTA ou un ventilateur, mais sa plage nominale ne garantit pas une bonne mesure au débit minimal d'une petite salle. Une référence plus basse pression, ou une station amplifiant le Δp, serait préférable.

### 4.3 HK Instruments FloXact, sonde multipoint

FloXact est une sonde différentielle multipoint mesurant pressions totale et statique. Le fabricant annonce :

- précision de la sonde : ±2 % ;
- amplification du signal de pression dynamique : 2,5× ;
- vitesse minimale annoncée : 1,0 m/s ;
- tailles rondes standard de 100 à 1 200 mm ;
- versions rectangulaires de 250 à 1 200 mm par pas de 50 mm ;
- température de fonctionnement 5 à 95 °C ;
- humidité 0–95 % HR sans condensation ;
- raccordement par tube 1/4 pouce ;
- maintien du côté opposé pour les longueurs de 350 mm ou plus.

Un distributeur américain identifié, Alps Controls, affichait la FloXact-R10 à 48,93 USD l'unité et 62,39 USD prix catalogue. Ce prix ne couvre ni le transmetteur ni l'importation.

**Intérêt :** bon compromis entre une grille/station complète et un Pitot ponctuel. La moyenne multipoint est plus défendable pour la régulation.

**Limite majeure :** à moins de 1 m/s, la performance annoncée n'est plus acquise. Par exemple, 50 m³/h correspond à moins de 1 m/s dès que le diamètre dépasse environ 133 mm.

### 4.4 E+E EE650, anémomètre thermique

Le EE650 utilise un élément thermique et vise les applications HVAC. Les plages sélectionnables sont 0,2–10, 0,2–15 ou 0,2–20 m/s. Les données sont disponibles en tension, courant ou Modbus RTU suivant la configuration.

**Données vérifiées :**

- principe anémométrique thermique ;
- version à montage direct en gaine ou sonde déportée ;
- 0–10 V et 4–20 mA sélectionnables sur la configuration analogique ;
- RS-485 Modbus RTU disponible ;
- boîtier IP65 sur la configuration distribuée consultée ;
- prix observé chez BOLA Systems : 560,17 € TTC pour EE650-T3A6L300K5, en stock lors de la consultation.

**Atouts :** faible perte de charge, pas de tubes de pression, bonne dynamique.

**Limites :**

- une mesure ponctuelle peut être très différente de la moyenne de section après un coude, un té, un registre ou une réduction ;
- le résultat en m³/h n'est valable qu'après saisie exacte de la section et validation du profil ;
- la limite 0,2 m/s est déjà dépassée vers le bas pour 50 m³/h dans une gaine Ø315 ou Ø400 ;
- il faut vérifier dans la fiche commandable la précision exacte, la longueur d'insertion et les longueurs droites imposées.

### 4.5 TROX VMR, station de mesure circulaire

Le VMR est une unité circulaire de mesure de débit avec capteur de pression effective intégré. La mesure peut être manuelle ou convertie en signal électrique par un transducteur assemblé en usine.

**Données fabricant vérifiées :**

- diamètres nominaux 100 à 400 mm ;
- plage globale publiée 34 à 6 279 m³/h, selon diamètre et composant ;
- plage de pression effective d'environ 2 à 260 Pa pour la version XTS publiée ;
- pression différentielle maximale 1 000 Pa ;
- précision publiée de 5 à 16 % selon point de fonctionnement/version ;
- classe d'étanchéité du caisson C selon EN 15727 ;
- options de transducteurs dynamiques ou statiques ;
- signal 0–10 V ou 2–10 V disponible sur le transducteur XTD.

**Interprétation :** la plage globale ne signifie pas qu'un seul diamètre couvre 34 à 6 279 m³/h. Chaque diamètre possède sa plage. Le VMR est une solution industrielle solide, mais la précision au bas de plage doit être vérifiée sur le tableau exact de la taille retenue.

### 4.6 Belimo LMV-D3-MOD, VAV-Compact intégré

Le LMV-D3-MOD réunit un capteur Δp dynamique, un régulateur VAV et un actionneur de registre 5 Nm. Il prend en charge VAV/CAV et la commande de position.

**Interfaces vérifiées :**

- BACnet MS/TP ;
- Modbus RTU ;
- MP-Bus ;
- 0/2–10 V.

Belimo précise que ce produit est offert par les fabricants de caissons de débit d'air variable. Il doit donc être monté sur un terminal VAV caractérisé et configuré, pas simplement vissé sur un volet quelconque.

Un distributeur européen identifié, Buschek Lufttechnik, affichait l'appareil à 441,49 € TTC hors livraison. Ce montant n'inclut pas le caisson VAV, la croix de mesure, l'étalonnage du débit, ni les accessoires.

**Intérêt :** architecture industrielle et communications déjà prévues pour une future supervision BACnet/Modbus.

**Limite :** cette voie réduit la part de régulation bas niveau développée dans l'ESP32 et nécessite un partenariat ou un achat de terminal VAV complet.

## 5. Conditions de montage à imposer dans la future étude

Quel que soit le principe retenu, le dossier de sélection devra fixer :

1. diamètre ou dimensions de chaque gaine ;
2. débit minimal, nominal et maximal par taille ;
3. nombre et type de perturbations amont : coude, té, réduction, ventilateur, registre ;
4. longueurs droites réellement disponibles en diamètres hydrauliques ;
5. pression disponible et perte de charge acceptable ;
6. qualité de l'air, poussières, condensation et accès au nettoyage ;
7. température, humidité et altitude ;
8. tolérance de débit nécessaire pour la fonction de régulation ;
9. besoin d'une mesure bidirectionnelle ou uniquement soufflage/extraction ;
10. stratégie d'étalonnage sur banc et de contrôle périodique sur site.

Ne pas retenir une règle générique de longueur droite sans lire la notice de la référence et du diamètre retenus. Une pose immédiatement après le volet motorisé est défavorable : la station de débit devrait être placée dans une zone plus stable ou être qualifiée sur l'ensemble réel.

## 6. Compatibilité avec l'ESP32-C3

### Modbus RTU

Modbus RTU est la voie numérique la plus intéressante pour le prototype professionnel, mais l'ESP32-C3 exige :

- un transceiver RS-485 3,3 V adapté ;
- isolation galvanique recommandée entre électronique basse tension et réseau terrain ;
- polarisation et terminaison configurables ;
- protection ESD/surtensions ;
- masse et blindage définis ;
- alimentation 24 V séparée avec conversion isolée ou correctement référencée.

### 0–10 V

Une entrée 0–10 V ne peut jamais être raccordée directement à l'ADC 3,3 V de l'ESP32-C3. Il faut au minimum un diviseur de précision, protection, filtrage, référence stable et idéalement une entrée analogique externe calibrée.

### 4–20 mA

Le 4–20 mA est robuste pour une gaine distante et permet de détecter une rupture de boucle. Il nécessite une résistance de mesure de précision et une protection adaptées. Une boucle 4–20 mA est souvent préférable au 0–10 V pour un produit professionnel, mais elle augmente le matériel.

## 7. Orientation provisoire, sans décision d'achat

Pour la suite des études, conserver trois branches :

1. **branche prioritaire à tester :** FloXact ou station équivalente + transmetteur basse pression/Modbus adapté à chaque diamètre ;
2. **branche prototype comparatif :** EE650 ou sonde thermique équivalente, afin de quantifier l'erreur de profil et la facilité de pose ;
3. **branche industrialisation :** terminal VAV complet avec LMV-D3-MOD ou équivalent, à comparer au développement d'une chaîne propriétaire.

La Sentera DPS-F-1K0-2 est une référence fonctionnellement intéressante pour le banc, mais sa plage 0–1 000 Pa semble trop large tant que le Δp réel de l'organe de mesure n'est pas calculé. Aucun achat ne doit être lancé avant cette vérification.

## 8. Essais nécessaires avant sélection

Le banc devra permettre de comparer la solution candidate à un instrument de référence traçable :

- au moins 8 points de débit répartis sur la plage utile de chaque taille ;
- montée et descente pour observer l'hystérésis ;
- répétabilité à trois reprises ;
- essais après coude, après volet et avec longueur droite nominale ;
- essai de tubes pincés, inversés, débranchés ou condensés pour la solution Δp ;
- essai d'encrassement léger pour la sonde thermique ;
- dérive du zéro à chaud et après coupure ;
- plausibilité débit/position volet/CO₂ ;
- détection de panne et comportement de repli ;
- calcul de l'incertitude totale, pas seulement lecture de la précision du capteur.

Critère de présélection proposé pour discussion ultérieure : erreur totale ≤ ±10 % du débit mesuré sur la plage de régulation utile, avec une cible de ±5 % aux points nominaux. Ces chiffres ne sont pas encore une exigence validée du cahier des charges.

## 9. Informations restant impérativement à vérifier

- diamètres et formes de gaine réellement visés par le produit ;
- débit minimal/maximal par diamètre, et non plage globale du projet ;
- perte de charge admissible ;
- précision réglementaire ou contractuelle exigée ;
- tableau K/Δp complet de chaque organe ;
- longueurs droites exigées par chaque fabricant ;
- plage et précision du transmetteur au Δp minimal calculé ;
- compensation de densité/température ;
- tarif France, disponibilité, délai, accessoires et étalonnage ;
- statut de conformité CE/EMC/RoHS de la référence exacte ;
- disponibilité des registres Modbus et droit d'intégration documentaire ;
- essais comparatifs sur notre banc.

## 10. Sources consultées

### Fabricants — caractéristiques techniques

- Sentera, DPS-F-1K0-2 : <https://www.sentera.eu/en/productdetails/pressure-transmitter-display-0-1000-pa-24-vdc/124872>
- Sentera, fiche DPS-F-1K0-2 : <https://www.sentera.eu/en/files/article/document/ds-en/dps-f-1k0-2-datasheet.pdf>
- HK Instruments / Produal, DPT-MOD : <https://hkinstruments.fi/products/differential-pressure-transmitters/dpt-mod/>
- HK Instruments / Produal, fiche DPT-MOD : <https://hkinstruments.fi/wp-content/uploads/2017/08/DPT-MOD_Series_Datasheet-7.0.pdf>
- HK Instruments / Produal, FloXact : <https://hkinstruments.fi/products/air-flow-velocity-transmitters/floxact/>
- E+E Elektronik, EE650 : <https://www.epluse.com/products/air-velocity-instrumentation/air-flow-transmitters-and-probes/ee650/>
- E+E Elektronik, fiche EE650 : <https://www.epluse.com/fileadmin/data/product/ee650/datasheet_EE650.pdf>
- TROX, VMR : <https://www.trox.de/en/volume-flow-rate-measuring-units/vmr-522f794ca41858a6>
- TROX, fiche VMR : <https://cdn.trox.de/adf57eb2c507d9bf/da0ce714e489/VMR_PD_2026_01_22_DE_en.pdf>
- Belimo, LMV-D3-MOD : <https://www.belimo.com/fr/shop/fr_FR/p?code=LMV-D3-MOD>
- Belimo, fiche LMV-D3-MOD : <https://www.belimo.com/mam/general-documents/datasheets/fr-fr/belimo_LMV-D3-MOD_datasheet_fr-fr.pdf>

### Distributeurs — points de prix uniquement

- BOLA Systems, EE650-T3A6L300K5 : <https://www.bolasystems.com/air-flow-velocity-sensor-e-e-elektronik-ee650>
- Alps Controls, FloXact-R10 : <https://alpscontrols.com/Product/Details/80633>
- Buschek Lufttechnik, LMV-D3-MOD : <https://www.buschek-shop.de/en/belimo-lmv-d3-mod.html>
- SmartOne, références HK Instruments, prix sur connexion/devis : <https://www.smartone.ee/hk-instruments/differential-pressure-transmitter/>

## 11. Conclusion de l'étude informative

La mesure de débit n'est pas seulement le choix d'une « sonde ». C'est une chaîne comprenant l'organe aéraulique, le transmetteur, la pose, la conversion, le câblage et l'étalonnage. Pour ce projet, une mesure multipoint ou une station calibrée est a priori plus défendable qu'une sonde thermique ponctuelle. Le choix ne pourra toutefois être arrêté qu'après avoir découpé les 50–2 000 m³/h en familles de diamètres et calculé le Δp disponible aux extrêmes.

**Aucune référence de ce document n'est validée pour achat.**
