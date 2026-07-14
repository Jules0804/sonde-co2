# Protocole de réception du lot 1

## Objet

Contrôler les modules SEN0536 et DFR0971 avant de les intégrer au banc.

## 1. Réception documentaire

- photographier l'emballage et chaque module ;
- relever la référence exacte, la révision et les marquages ;
- conserver facture et fournisseur dans `09 - ACHATS ET COUTS` ;
- vérifier que les câbles Gravity/I²C annoncés sont présents ;
- enregistrer la date de réception.

## 2. Inspection hors tension

- absence de PCB fissuré, composant déplacé ou broche tordue ;
- soudures et connecteurs visuellement corrects ;
- aucun corps étranger sur le SCD41 ;
- orifices du capteur non obstrués ;
- borniers du DAC correctement serrés et repérés ;
- absence de court-circuit visible entre VCC et GND.

## 3. Contrôles électriques avant ESP32

- relever au multimètre la résistance apparente VCC/GND sans conclure à un défaut sur la seule valeur transitoire ;
- vérifier la tension de l'alimentation USB ;
- ne jamais alimenter les modules par le 24 V ;
- utiliser uniquement 3,3 V ou 5 V selon la documentation du breakout.

## 4. Scan I²C

Pour un premier essai simple sous Arduino, utiliser :

`06 - LOGICIEL EMBARQUE\arduino-outils\scan_i2c_lot1\scan_i2c_lot1.ino`

1. Brancher uniquement le SCD41.
2. Scanner le bus et enregistrer l'adresse trouvée.
3. Débrancher hors tension.
4. Brancher uniquement le DFR0971.
5. Scanner et enregistrer son adresse.
6. Brancher les deux et confirmer qu'ils apparaissent simultanément.

Adresses attendues à confirmer par la mesure :

- SEN0536/SCD41 : `0x62` ;
- DFR0971/GP8403 : `0x5F` dans la configuration d'adresse actuellement conservée sur le banc.

Toute autre adresse, absence de module ou collision doit être enregistrée comme un écart avant de poursuivre.

## 5. Essai SCD41

Avant l'essai 24 heures, réaliser l'essai court :

`PROTOCOLE ESSAI COURT SCD41 30 MIN V0.1.md`

- attendre le temps de stabilisation prévu par la bibliothèque ;
- enregistrer CO₂, température et humidité toutes les cinq secondes ;
- vérifier l'absence de valeur impossible ;
- souffler à distance raisonnable dans l'environnement du capteur sans condensation directe et vérifier la hausse du CO₂ ;
- aérer et vérifier la baisse progressive ;
- laisser fonctionner 24 heures ;
- compter les erreurs de lecture, redémarrages et valeurs hors plage.

Critères chiffrés du banc :

- cadence nominale : une mesure exploitable toutes les 5 secondes ;
- aucune interruption inexpliquée supérieure à 15 secondes ;
- aucune valeur CO₂ inférieure à 0 ppm ou supérieure à 10 000 ppm acceptée comme mesure valide ;
- taux de lectures invalides inférieur à 0,1 % sur 24 heures, sans série de plus de deux lectures invalides ;
- aucun redémarrage spontané de l'ESP32.

Ces seuils valident le prototype de banc ; ils ne constituent pas encore une déclaration de précision métrologique du produit final.

## 6. Essai DAC DFR0971

Pour l'essai à vide, utiliser d'abord :

`PROTOCOLE ESSAI DAC DFR0971 A VIDE V0.1.md`

Avec aucun moteur raccordé :

| Consigne logicielle | Tension attendue approximative | Mesure réelle |
|---:|---:|---:|
| 0 % | 0,0 V | À relever |
| 20 % | 2,0 V | À relever |
| 50 % | 5,0 V | À relever |
| 80 % | 8,0 V | À relever |
| 100 % | 10,0 V | À relever |

- effectuer chaque mesure au multimètre ;
- calculer l'erreur absolue et relative ;
- répéter après redémarrage ;
- relever la sortie pendant le démarrage avant initialisation ;
- vérifier le comportement si le câble I²C est débranché.

Pour chaque point, effectuer au moins trois mesures espacées de deux secondes. La moyenne doit être monotone et se situer à ±0,10 V de la tension demandée. Refaire la séquence sur les deux canaux du module.

Avant tout futur raccordement d'un servomoteur, vérifier séparément au multimètre que la stratégie de secours fournit bien la tension correspondant à l'ouverture maximale après :

1. mise sous tension normale ;
2. redémarrage logiciel ;
3. perte de communication I²C ;
4. redémarrage après mémorisation unique de la plage 0–10 V.

Ne jamais exécuter une commande de mémorisation dans la boucle normale du firmware.

Après acceptation des mesures à vide, exécuter également `PROTOCOLE ESSAI CHARGE 0-10V SIX ENTREES V0.1.md` avec une résistance de 10 kΩ. Cet essai est obligatoire avant de considérer le module comme candidat au pilotage parallèle de six entrées.

## 7. Critères d'acceptation

- les deux modules sont détectés simultanément ;
- aucune erreur persistante pendant 24 heures ;
- CO₂ réagit dans le bon sens et revient vers une valeur ambiante plausible ;
- sortie DAC monotone ;
- erreur de tension compatible avec le pilotage d'un volet ;
- comportement au démarrage connu et documenté ;
- aucune surchauffe ni odeur anormale.

La réception est déclarée `REFUSÉE` si un défaut physique est observé, si un module n'est pas détecté seul, si une sortie dépasse 10,2 V, si la tension n'est pas monotone ou si une surchauffe apparaît. Tout résultat intermédiaire est classé `SOUS RÉSERVE` avec analyse d'écart.

## 8. Fichiers de résultats

Créer lors de l'essai :

- `RAPPORT RECEPTION LOT 1.md` ;
- `mesures_scd41_24h.csv` ;
- `mesures_dac.csv` ;
- dossier `PHOTOS LOT 1`.

Utiliser les modèles déjà préparés dans ce dossier. Ne jamais écraser les données brutes après un essai ; toute correction doit être faite dans une nouvelle colonne ou une nouvelle version du fichier.

Après remplissage, analyser chaque CSV avec :

```powershell
node .\analyser-reception.mjs .\mesures_scd41_24h.csv
node .\analyser-reception.mjs .\mesures_dac.csv
```

Le code de retour `0` indique que les critères automatiques sont satisfaits, `1` qu'au moins un critère est refusé et `2` que le fichier ou son format est invalide. Le verdict automatique doit être joint au rapport, puis complété par l'inspection visuelle et la décision humaine.
