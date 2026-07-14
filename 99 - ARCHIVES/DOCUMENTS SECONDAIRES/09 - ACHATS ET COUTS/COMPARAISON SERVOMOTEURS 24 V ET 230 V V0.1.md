# Comparaison servomoteurs 24 V et 230 V v0.1

> Document historique remplacé pour les décisions courantes par `COMPARAISON ACTIONNEURS ET DIMENSIONNEMENT LOT 2 V0.2.md`.

**Date des prix observés :** 20 juin 2026  
**Statut :** étude de phase 2, aucun achat autorisé  
**Base de comparaison :** actionneurs rotatifs 5 Nm, sans rappel ressort, commande proportionnelle 0/2–10 V

## 1. Références comparables

### Siemens GDB161.1E — 24 V

- alimentation AC/DC 24 V ;
- commande proportionnelle 0/2–10 V ;
- couple 5 Nm ;
- registre annoncé jusqu'à 0,8 m² selon la gamme Siemens ;
- prix observé chez le même distributeur de comparaison : 118,66 € HT / 142,39 € TTC.

Sources :

- [Siemens — gamme GDB..1E](https://hit.sbt.siemens.com/RWD/app.aspx?rc=FR&lang=fr&module=Catalog&action=ShowProduct&key=BPZ:GDB..1E)
- [Bola Systems — GDB161.1E](https://www.bolasystems.fr/servomoteur-siemens-gdb-161-1e-24-v-gdb161-1e)

### Siemens GDB361.1E — 230 V

- alimentation AC 230 V ;
- commande proportionnelle 0/2–10 V ;
- couple 5 Nm ;
- consommation annoncée 2,1 VA sur la fiche produit Siemens observée ;
- prix observé chez le même distributeur : 141,92 € HT / environ 170,30 € TTC ;
- disponibilité indiquée épuisée lors de l'observation du distributeur, à revérifier avant commande.

Sources :

- [Siemens — GDB361.1E](https://hit.sbt.siemens.com/RWD/app.aspx?rc=BE&lang=fr&module=Catalog&action=ShowProduct&key=S55499-D189)
- [Bola Systems — GDB361.1E](https://www.bolasystems.fr/servomoteur-siemens-gdb-361-1e-230-v-gdb361-1e)

### Exemple Belimo

Le Belimo LM24A-SR confirme que l'offre 24 V proportionnelle 2–10 V avec retour 2–10 V est une solution standard en 5 Nm.

Le catalogue Belimo comporte des actionneurs 230 V proportionnels sur certaines gammes, mais l'offre 5 Nm courante trouvée est davantage orientée tout-ou-rien/trois points ; les anciennes références LM230ASR ne doivent pas être retenues sans vérification de pérennité.

Source : [Belimo — fiche LM24A-SR](https://www.belimo.com/mam/general-documents/datasheets/en-gb/belimo_LM24A-SR_datasheet_en-gb.pdf).

## 2. Coût de l'alimentation 24 V

Exemple de banc : Mean Well HDR-60-24, 24 V DC, 2,5 A, 60 W, rail DIN.

- prix unitaire observé chez Mouser : environ 17,29 € hors frais et taxes ;
- autres prix observés : environ 28 € TTC à 38 € TTC selon le distributeur ;
- le dimensionnement de 60 W offre une marge confortable pour six actionneurs 5 Nm de faible consommation, mais doit être confirmé par les fiches finales et les courants de pointe.

Sources :

- [Mouser — Mean Well HDR-60-24](https://www.mouser.fr/ProductDetail/MEAN-WELL/HDR-60-24)
- [Mean Well — HDR-60-24](https://www.meanwell.fr/fr/mean-well-hdr-60-24-hdr-60-24)

## 3. Comparaison économique directe

Calcul indicatif HT utilisant les prix Bola Systems et une alimentation 24 V à 17,29 € HT. Il exclut les frais de port et remises professionnelles.

| Configuration | Moteurs 24 V | Alimentation 24 V | Total 24 V | Moteurs 230 V | Total 230 V avant protections supplémentaires | Avantage 24 V minimal |
|---|---:|---:|---:|---:|---:|---:|
| 2 moteurs | 237,32 € | 17,29 € | **254,61 €** | 283,84 € | **283,84 €** | **29,23 €** |
| 6 moteurs | 711,96 € | 17,29 € | **729,25 €** | 851,52 € | **851,52 €** | **122,27 €** |

Le total 230 V est volontairement favorable : il n'inclut pas encore le surcoût des protections, séparations, borniers secteur, presse-étoupes/câbles adaptés et contraintes de coffret. Une petite alimentation basse tension reste également nécessaire pour le contrôleur et la sortie 0–10 V.

## 4. Comparaison technique

| Critère | Moteurs 24 V | Moteurs 230 V |
|---|---|---|
| Commande 0–10 V | Très courante | Disponible mais choix plus restreint selon gamme |
| Sécurité des six sorties | TBTS, risque réduit | Six départs secteur à protéger et isoler |
| Installation/maintenance | Plus tolérante | Personnel et câblage secteur requis jusqu'à chaque moteur |
| Alimentation interne | 24 V de puissance nécessaire | Petite alimentation logique seulement |
| Coût observé moteurs Siemens | Plus faible | Plus élevé sur la paire comparable |
| Compatibilité capteurs/électronique | Référence 0 V simple | Isolation et référence de commande à vérifier soigneusement |
| Évolutivité Modbus/retour position | Offre large en 24 V | Offre généralement plus restreinte |
| Conformité du boîtier | Secteur limité à l'entrée/alimentation | Secteur distribué vers six sorties |
| Échauffement interne | Alimentation 24 V dissipe dans le boîtier | Moins de puissance convertie dans le boîtier |

## 5. Coût total installé

Le prix du moteur seul n'est pas le bon critère. Le coût total doit inclure :

- moteurs ;
- alimentation ;
- protections ;
- borniers/connecteurs ;
- câbles et presse-étoupes ;
- taille du coffret ;
- temps de câblage ;
- essais électriques ;
- contraintes de certification ;
- maintenance et risque d'erreur chantier.

Sur cette base, le 24 V conserve un avantage économique et technique pour la version 1.

## 6. Couple de référence

Le Siemens GDB 5 Nm est annoncé pour un registre allant jusqu'à environ 0,8 m². Une gaine ronde de diamètre 400 mm présente une section d'environ 0,126 m². Le couple réel dépend toutefois du registre, des joints, de la pression et du montage.

Décision proposée : utiliser la classe 5 Nm pour le premier banc et définir dans le produit une liste de moteurs compatibles plutôt que promettre la compatibilité avec n'importe quel actionneur.

## 7. Recommandation de phase 2

### Recommandation principale

Retenir provisoirement les **servomoteurs 24 V proportionnels 0/2–10 V** pour la version 1 et le premier banc.

Motifs :

1. prix unitaire observé inférieur sur une paire Siemens comparable ;
2. l'écart sur deux moteurs finance déjà l'alimentation 24 V ;
3. économie plus importante avec six moteurs ;
4. sorties TBTS plus sûres et plus simples ;
5. choix de références proportionnelles plus large ;
6. meilleure préparation aux retours de position et communications futures.

### Maintien de l'étude 230 V

Ne pas supprimer définitivement la variante 230 V. La réexaminer si :

- un fournisseur propose un moteur 230 V proportionnel nettement moins cher en volume ;
- un chantier impose des moteurs 230 V existants ;
- une variante trois points est développée ;
- l'alimentation 24 V devient limitante pour une gamme de couples supérieure.

## 8. Points à vérifier avant nomenclature finale

- obtenir les tarifs professionnels réels de l'entreprise ;
- confirmer la disponibilité et la pérennité des références ;
- relever le courant de dimensionnement exact de chaque moteur ;
- vérifier le type de signal 0–10 V, le retour U et l'isolation ;
- choisir le registre correspondant au couple ;
- comparer au moins une référence Belimo et une troisième marque économique fiable.
