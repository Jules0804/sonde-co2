# Protocole d'essai de charge 0–10 V pour six entrées v0.1

## 1. Objectif

Prouver sur le module DFR0971 reçu qu'une sortie conserve sa précision lorsqu'elle alimente une charge plus sévère que six entrées moteur admissibles. Cet essai qualifie le module de banc particulier ; il ne remplace pas une valeur garantie de courant de sortie pour le futur PCB produit.

La capacité de sortie garantie du DFR0971 et l'impédance officielle du moteur exact ne sont pas encore établies par une source primaire disponible dans le dossier. Elles restent donc des informations obligatoires avant la nomenclature produit.

## 2. Règle de compatibilité créée

Sans buffer analogique, chaque moteur déclaré compatible avec six sorties parallèles doit présenter une résistance d'entrée de commande d'au moins **60 kΩ** :

```text
R équivalente de six entrées = 60 kΩ / 6 = 10 kΩ
courant à 10 V               = 10 V / 10 kΩ = 1,00 mA
puissance dans la charge     = 10² / 10 kΩ = 10 mW
```

Une résistance de charge de 10 kΩ simule donc la limite d'acceptation. Si la fiche ou la mesure d'un moteur donne moins de 60 kΩ, six moteurs ne sont pas autorisés sur une sortie unique sans nouvel essai et, probablement, sans buffer.

## 3. Matériel

- DFR0971 reçu et accepté lors du lot 1 ;
- alimentation logique conforme au dossier de câblage ;
- résistance 10 kΩ, tolérance 1 % ou meilleure, puissance 0,25 W minimum ;
- multimètre étalonné ou vérifié ;
- thermomètre recommandé ;
- aucune entrée ESP32 ni aucun moteur raccordé à VOUT pendant l'essai résistif.

## 4. Sécurité et câblage

1. Couper l'USB avant chaque changement.
2. Relier la résistance 10 kΩ entre VOUTx et GND du DAC.
3. Placer le voltmètre en parallèle sur la résistance.
4. Ne jamais appliquer la sortie 0–10 V à un GPIO.
5. La résistance dissipe seulement 10 mW à 10 V, mais sa valeur doit être vérifiée hors tension avant branchement.

## 5. Séquence

Pour chaque canal 0 puis 1, et pour 0, 2, 5, 8 et 10 V :

1. mesurer trois fois la tension à vide `open_v` ;
2. raccorder 10 kΩ hors tension ;
3. mesurer trois fois la tension chargée `loaded_v` ;
4. attendre deux secondes entre mesures ;
5. relever la température et toute instabilité ;
6. reporter les données dans `MODELE ESSAI CHARGE 0-10V SIX ENTREES.csv`.

En pratique, la colonne `open_v` de chaque ligne reçoit la mesure à vide associée à la répétition correspondante.

## 6. Critères automatiques

- 3 répétitions pour chaque point et chaque canal ;
- charge exactement 10 kΩ pour l'acceptation initiale ;
- erreur absolue chargée ≤ 0,10 V ;
- différence absolue vide/charge ≤ 0,05 V pour toute consigne non nulle ;
- tension maximale ≤ 10,20 V ;
- sortie strictement monotone en moyenne ;
- aucune tension négative inférieure à −0,05 V.

Analyser le fichier rempli avec :

```powershell
node .\analyser-charge-analogique.mjs ".\mesures_charge_0_10v.csv"
```

Un résultat automatique positif ne suffit pas si le module chauffe, oscille ou redémarre.

## 7. Essai final avec moteurs

Après l'essai résistif et avant d'autoriser six moteurs :

1. mesurer ou confirmer par fiche primaire la résistance Y–G0 de chaque moteur hors tension selon la méthode fabricant ;
2. refuser la mise en parallèle si l'équivalent des six entrées est inférieur à 10 kΩ ;
3. raccorder d'abord un moteur, puis deux ;
4. comparer la tension au DAC et au moteur le plus éloigné ;
5. reproduire 0/20/50/80/100 % ;
6. réaliser l'essai six moteurs avec protections et câbles définitifs ;
7. confirmer sens, synchronisme, chute de tension et retour en ouverture maximale sur défaut.

## 8. Décision de conception

- DFR0971 : solution de banc uniquement ;
- compatibilité six moteurs : non acquise avant réussite des essais résistif et réel ;
- produit commercial : sortie 0–10 V spécifiée par calcul, protégée contre court-circuit/surtension et, si nécessaire, bufferisée ;
- retours U : toujours individuels, jamais parallélisés.
