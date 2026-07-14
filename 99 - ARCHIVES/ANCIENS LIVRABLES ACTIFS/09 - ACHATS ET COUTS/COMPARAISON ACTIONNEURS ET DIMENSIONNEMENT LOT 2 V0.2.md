# Comparaison des actionneurs et dimensionnement du lot 2 v0.2

**Date de vérification :** 21 juin 2026  
**Périmètre :** six actionneurs maximum, 5 Nm, sans rappel ressort, commande proportionnelle 0/2–10 V.  
**Statut :** architecture 24 V confirmée ; achat de moteurs toujours non autorisé avant validation du lot 1 et du registre mécanique.

## 1. Besoin de référence

Le produit doit commander de un à six moteurs avec une même consigne analogique. Le banc initial utilisera deux moteurs. La classe 5 Nm reste une hypothèse de banc : le couple final dépend du registre, des joints, de la pression différentielle et du montage. Il est interdit de transformer l'indication commerciale « surface de volet » en garantie universelle.

## 2. Comparaison actualisée

| Référence | Alimentation | Commande | Couple | Dimensionnement électrique | Prix public observé | Conclusion |
|---|---|---|---:|---:|---:|---|
| Siemens GDB161.1E | AC/DC 24 V | DC 0/2–10 V | 5 Nm | 1,3 VA ; 1,0 W | 118,66 € HT chez Bola, soit 142,39 € TTC à 20 % ; 169,74 € prix public Siemens affiché | **Référence économique documentée actuelle** |
| Belimo LM24A-SR | AC/DC 24 V | DC 2–10 V, retour 2–10 V | 5 Nm | 2 VA pour câblage ; 1 W en marche | 220 € prix catalogue Belimo affiché ; fiscalité à confirmer | Alternative pérenne, plus chère publiquement |
| Gruner 227CS-024-05 | AC/DC 24 V | continue 0–10 V | 5 Nm | fiche de consommation à revalider sur la version réellement livrée | 160,17 € TTC chez Buschek | Plus cher que Siemens et fiche fabricant signalée « old version » ; non retenu pour achat |
| Nenutec NACM 5 Nm | AC/DC 24 V | 0/2–10 V selon variante | 5 Nm | à confirmer sur référence exacte | prix sur demande | Candidat professionnel à chiffrer, pas encore une économie démontrée |
| Générique sans fabricant traçable | 24 V | annoncé 0–10 V | annoncé 5 Nm | non prouvé | environ 24 € sur place de marché | Rejeté pour le prototype professionnel |

L'option « économique » n'est donc pas le moteur au prix facial le plus bas : elle doit conserver une fiche fabricant, une référence stable, la conformité applicable, une source d'approvisionnement et une garantie. Avec les offres publiques vérifiables, le Siemens GDB161.1E reste le meilleur coût documenté.

## 3. Sources vérifiées

- [Siemens GDB161.1E — catalogue fabricant](https://hit.sbt.siemens.com/RWD/app.aspx?rc=FR&lang=fr&module=Catalog&action=ShowProduct&key=S55499-D266)
- [Siemens GDB161.1E — Bola Systems](https://www.bolasystems.com/siemens-actuator-gdb-161-1e-24-v-gdb161-1e)
- [Belimo LM24A-SR — catalogue fabricant](https://www.belimo.com/fr/shop/fr_FR/p?code=LM24A-SR)
- [Belimo LM24A-SR — Bola Systems](https://www.bolasystems.com/belimo-lm-24-a-sr-actuator-lm24a-sr)
- [Gruner 227CS-024-05 — fiche fabricant ancienne version](https://www.gruner.de/rest/Products/downloaddblt?file=4AAFD4634D165377CFBA8EE0&bereich=1&lang=en)
- [Gruner 227CS-024-05 — Buschek](https://www.buschek-shop.de/en/gru-227cs-024-05.html)
- [Nenutec NACM — fiche de gamme](https://www.techritecontrols.com.au/cms/uploads/Techrite-Controls-Nenutec-Nenutec-Nacm-Series-Modulating-Motor-1593.pdf)
- [Siemens GDB361.1E 230 V — catalogue fabricant](https://hit.sbt.siemens.com/RWD/app.aspx?rc=GR&lang=en&module=Catalog&action=ShowProduct&key=S55499-D189)
- [Siemens GDB361.1E 230 V — Bola Systems](https://www.bolasystems.fr/servomoteur-siemens-gdb-361-1e-230-v-gdb361-1e)

Les prix sont des observations ponctuelles, hors éventuelles remises professionnelles et frais de port. Ils doivent être reconfirmés au moment de l'achat.

## 4. Comparaison 24 V / 230 V confirmée

Le comparable Siemens 230 V GDB361.1E est affiché à 142,27 € HT, soit 170,72 € TTC à 20 %, chez Bola et épuisé lors de la vérification. Le GDB161.1E 24 V est affiché à 118,66 € HT, soit 142,39 € TTC à 20 %. La version 230 V consomme 2,1 VA et impose la distribution du secteur vers chaque moteur.

Pour deux moteurs, l'écart calculé est de 56,66 € TTC. Il finance déjà une alimentation 24 V de la classe retenue. Pour six moteurs, l'écart atteint 169,98 € TTC avant les protections et contraintes supplémentaires du 230 V.

La version 1 retient donc le **24 V proportionnel**. Une variante 230 V ne sera étudiée que pour adaptation à un existant ou exigence chantier spécifique ; elle ne doit pas compliquer le produit standard.

## 5. Dimensionnement de l'alimentation six moteurs

Le calcul utilise le candidat accepté le plus exigeant pour le câblage, soit 2 VA par moteur :

```text
six moteurs                   6 × 2 VA       = 12,00 VA
convertisseur logique 15 W    15 / 0,80      = 18,75 W
auxiliaires directs 24 V                       1,00 W
sous-total                                    31,75 W
marge de conception 25 %      × 1,25         = 39,69 W
courant de calcul à 24 V      39,69 / 24     = 1,65 A
```

Le Mean Well HDR-60-24 fournit 60 W et 2,5 A. Il laisse environ 20,31 W de réserve par rapport au cas de calcul. Il est donc suffisant sur papier pour six GDB161.1E ou six LM24A-SR et la logique alimentée par un convertisseur 15 W.

Cette conclusion ne dispense pas de mesurer :

- le courant de démarrage simultané ;
- la tension 24 V au moteur le plus éloigné ;
- l'échauffement en coffret fermé ;
- le comportement en court-circuit d'un départ ;
- la consommation réelle du convertisseur logique.

Le fichier `DONNEES DIMENSIONNEMENT ALIMENTATION LOT 2 V0.1.json` et son calculateur rendent l'hypothèse vérifiable et évitent les erreurs de tableur.

## 6. Protections encore à figer

Les valeurs des six protections de départ ne sont pas choisies dans cette version. Une valeur de fusible ne peut pas être déduite de la seule puissance nominale : il faut le courant d'appel, la section, la longueur, le mode de pose et la courbe de la protection. Le schéma conservera F2 à F7 comme références `À DIMENSIONNER` jusqu'aux essais sur le moteur acheté.

Chaque départ doit néanmoins être séparé afin qu'un court-circuit de câble ou moteur n'arrête pas silencieusement toutes les branches sans diagnostic.

## 7. Charge de la commande 0–10 V

La capacité à mettre six entrées Y en parallèle n'est pas encore prouvée par le seul calcul d'alimentation. Avant le lot 2 complet :

1. relever l'impédance d'entrée Y de la référence commandée ;
2. vérifier le courant maximal garanti du DFR0971 ;
3. reproduire la charge équivalente avec des résistances ;
4. mesurer 0, 2, 5, 8 et 10 V avec l'équivalent de six entrées ;
5. accepter uniquement une erreur absolue inférieure ou égale à 0,10 V ;
6. si la marge est insuffisante, ajouter un buffer 0–10 V industriel ou séparer les canaux.

Le protocole v0.1 fixe désormais une charge résistive de qualification à 10 kΩ, correspondant à six entrées de 60 kΩ. À 10 V, l'essai demande 1 mA et dissipe 10 mW. Il impose une erreur chargée ≤ 0,10 V et une chute vide/charge ≤ 0,05 V sur les deux canaux. Cette règle est une exigence de banc mesurable, pas une caractéristique fabricant inventée.

Les retours U restent individuels et ne doivent jamais être mis en parallèle.

## 8. Décision et reste à faire

- architecture moteur V1 : **24 V proportionnel validé** ;
- référence économique de comparaison : **Siemens GDB161.1E** ;
- alimentation 60 W : **suffisante sur calcul avec marge de 25 %** ;
- commande de deux moteurs : **non autorisée avant réussite du lot 1 et choix mécanique du registre** ;
- extension à six moteurs : **à valider par charge analogique, courant, chute de tension et échauffement** ;
- Nenutec : demander un devis professionnel seulement si l'entreprise souhaite rechercher une économie de volume.
