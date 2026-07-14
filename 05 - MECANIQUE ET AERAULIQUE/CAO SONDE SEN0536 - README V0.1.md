# CAO sonde SEN0536 - README v0.1

## Objet

Premiere CAO exploitable pour integrer la sonde CO2 **DFRobot SEN0536 / SCD41** dans une piece imprimee 3D.

Contrairement au premier visuel conceptuel, cette version est pensee comme une piece fonctionnelle :

- boitier exterieur demontable ;
- carte SEN0536 fixee sur quatre entretoises ;
- chambre de mesure ventilee ;
- bride cote gaine avec joint mousse ;
- couvercle visse ;
- passage cable ;
- cotes parametriques modifiables dans Fusion 360.

## Cotes constructeur verifiees

Source DFRobot :

- produit SEN0536 : <https://wiki.dfrobot.com/sen0536/>
- plan dimensionnel : <https://dfimg.dfrobot.com/wiki/21100/SEN0536_scd41-co2-sensor_dimension_1.0.pdf>

| Element | Cote |
|---|---:|
| Carte SEN0536 | 32,00 x 27,00 mm |
| Hauteur produit annoncee | 8,00 mm |
| Epaisseur PCB | 1,60 mm |
| Entraxe trous horizontal | 25,00 mm |
| Entraxe trous vertical | 20,00 mm |

## Cotes non donnees par le constructeur

Le PDF dimensionnel ne cote pas explicitement :

- le diametre exact des trous de fixation ;
- le rayon exact des angles du PCB ;
- la position precise du connecteur par rapport au bord ;
- l'encombrement exact du cable Gravity branche.

La CAO utilise donc des parametres prudents :

- vis carte prevues M2.5, trou entretoise 2,7 mm ;
- jeu carte 1,0 mm autour du PCB ;
- hauteur libre interne superieure a 12 mm ;
- passe-cable dimensionne volontairement large.

Ces valeurs devront etre confirmees a reception avec un pied a coulisse.

## Fichiers

| Fichier | Role |
|---|---|
| `fusion360_sonde_sen0536_boitiers.py` | Script Fusion 360 pour generer le modele |
| `PARAMETRES CAO SONDE SEN0536 V0.1.json` | Parametres principaux de conception |

## Utilisation dans Fusion 360

1. Ouvrir Fusion 360.
2. Menu `Utilitaires` / `Scripts et compléments`.
3. Ajouter ou executer le script `fusion360_sonde_sen0536_boitiers.py`.
4. Le script cree deux composants :
   - `BASE_BOITIER_SEN0536`
   - `COUVERCLE_SEN0536`
5. Verifier les dimensions.
6. Exporter chaque composant en STL ou 3MF pour impression.

## Impression conseillee

- Matiere prototype : PETG.
- Buse : 0,4 mm.
- Hauteur couche : 0,20 mm.
- Parois : 4.
- Remplissage : 30 a 40 %.
- Orientation :
  - base posee sur la bride gaine ;
  - couvercle pose face exterieure sur le plateau.
- Inserts : optionnels, M3 thermiques pour le couvercle si iterations nombreuses.

## Points a verifier avant impression finale

1. Mesurer le diametre reel des trous SEN0536.
2. Brancher le cable Gravity et mesurer son encombrement.
3. Verifier que le capteur SCD41 n'est pas colle a une paroi.
4. Ajouter une mousse filtrante seulement si elle ne freine pas trop la diffusion du CO2.
5. Eviter d'exposer directement la carte au flux turbulent, a la poussiere ou a la condensation.

## Essai d'implantation

Après impression et validation électrique du lot 1, vérifier le montage avec :

`08 - PROTOTYPES ET ESSAIS\PROTOCOLE ESSAI IMPLANTATION SONDE CO2 EN GAINE V0.1.md`

## Statut

Version v0.1 : modele de depart serieux mais a valider apres reception de la sonde.
