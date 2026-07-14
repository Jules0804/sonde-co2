# Selection registre et gaine du banc v0.1

## 1. Objet

Ce document cadre le choix du troncon de gaine et du registre motorisable du premier banc. Il ne valide pas encore l'achat du lot 2 : il prepare les criteres pour eviter un choix de moteur ou de registre incoherent.

## 2. Base de debit

Hypothese de travail issue du cahier des charges : **30 m3/h par occupant**.

| Occupation representee | Debit d'air neuf |
|---:|---:|
| 4 personnes | 120 m3/h |
| 6 personnes | 180 m3/h |
| 10 personnes | 300 m3/h |
| 12 personnes | 360 m3/h |

Le banc vise prioritairement **300 m3/h**, representatif d'une salle de reunion d'environ dix personnes. Le minimum reglementaire ne sera pas remplace par la mesure CO2 : la regulation CO2 modulera au-dessus d'un minimum regle et verifie.

## 3. Vitesses calculees en gaine circulaire

Formule utilisee : `v = Q / (3600 x A)` avec `A = pi x D2 / 4`.

| Diametre | Aire | 120 m3/h | 180 m3/h | 300 m3/h | 360 m3/h |
|---:|---:|---:|---:|---:|---:|
| DN160 | 0,0201 m2 | 1,66 m/s | 2,49 m/s | 4,15 m/s | 4,97 m/s |
| DN200 | 0,0314 m2 | 1,06 m/s | 1,59 m/s | 2,65 m/s | 3,18 m/s |
| DN250 | 0,0491 m2 | 0,68 m/s | 1,02 m/s | 1,70 m/s | 2,04 m/s |
| DN315 | 0,0779 m2 | 0,43 m/s | 0,64 m/s | 1,07 m/s | 1,28 m/s |
| DN400 | 0,1257 m2 | 0,27 m/s | 0,40 m/s | 0,66 m/s | 0,80 m/s |

## 4. Critere de choix pour le banc

Pour le banc, je retiens une plage pratique de **1,5 a 4,5 m/s** au debit nominal. C'est un critere de confort et d'essai, pas une exigence reglementaire figee.

Lecture rapide :

- DN160 : compact, mais deja rapide a 300 m3/h et trop rapide a 360 m3/h.
- DN200 : meilleur compromis pour banc compact, debit 180 a 360 m3/h exploitable.
- DN250 : alternative confortable, plus volumineuse, plus lente et potentiellement plus silencieuse.
- DN315/DN400 : trop lents et encombrants pour un premier banc de table ou d'atelier.

## 5. Recommendation actuelle

**Choix papier recommande : DN200 circulaire.**

Alternative acceptable : **DN250** si l'encombrement est moins critique ou si l'on veut reduire les vitesses/bruits.

Le registre devra etre choisi avec :

- axe motorisable compatible servomoteur CVC ;
- rotation 90 degres ;
- commande progressive compatible 0/2-10 V via moteur ;
- possibilite de blocage mecanique et repere de position ;
- effort manuel faible, sans point dur ;
- documentation ou estimation du couple necessaire.

## 6. Precontrole moteur

Un servomoteur professionnel 5 Nm est plausible pour un registre rond DN200 ou DN250, mais ce n'est pas une validation finale. Le couple reel depend du registre, des joints, de la pression differentielle, de l'alignement de l'axe et de la qualite de montage.

Avant achat du lot 2, il faut donc confirmer :

1. reference ou type exact du registre ;
2. diametre et surface ;
3. type d'axe et adaptation possible ;
4. couple constructeur ou essai manuel compare ;
5. presence de ressort de rappel ou non ;
6. pression differentielle prevue sur le banc ;
7. place disponible pour le servomoteur.

## 7. Decision provisoire

Le lot 2 reste bloque tant que le registre reel n'est pas choisi ou releve. La prochaine action terrain consiste a remplir la fiche `FICHE RELEVE REGISTRE ET GAINE V0.1.md`.
