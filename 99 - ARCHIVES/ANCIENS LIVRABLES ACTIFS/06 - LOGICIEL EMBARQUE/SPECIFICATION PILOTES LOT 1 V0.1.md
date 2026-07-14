# Spécification des pilotes du lot 1 v0.1

## 1. Bus commun

- bus I²C à 3,3 V côté Wemos ESP32-C3 ;
- fréquence initiale : 100 kHz pour le premier démarrage, puis essai à 400 kHz ;
- câbles courts sur le banc ;
- masse commune entre Wemos, SCD41 et DFR0971 ;
- scan I²C obligatoire avant activation de la sortie ;
- aucun GPIO figé avant identification de la variante Wemos.

## 2. SCD41 — SEN0536

### Paramètres vérifiés

- adresse I²C : `0x62` ;
- mode périodique normal : nouvelle mesure toutes les 5 secondes ;
- avant une commande de configuration, arrêter le mode périodique et attendre au moins 500 ms ;
- lire uniquement lorsque l'indicateur « data ready » est vrai ;
- vérifier le CRC des mots reçus ;
- conserver un horodatage de la dernière trame valide, indépendant de la valeur CO₂.

### Classification proposée

| Condition | État pilote | Effet régulation |
|---|---|---|
| Trame valide, CRC correct, 350–5000 ppm | VALID | Mesure utilisée |
| Pas de nouvelle trame avant 30 s | STALE | Ouverture 100 % |
| Erreur I²C répétée ou capteur absent | MISSING | Ouverture 100 % |
| CRC faux | CRC_ERROR | Échantillon rejeté ; défaut après temporisation |
| Valeur hors 350–5000 ppm | RANGE | Ouverture 100 % |

La plage 350–5000 ppm est une règle de plausibilité du produit, pas la plage numérique maximale annoncée par le fabricant.

## 3. DFR0971 — GP8403

### Paramètres vérifiés

- adresse par défaut : `0x58` ;
- huit adresses réglables par interrupteurs ;
- registre plage : `0x01` ;
- valeur plage 10 V : `0x11` ;
- registre voie 0 : `0x02` ;
- registre voie 1 : `0x04` ;
- conversion 12 bits de 0 à 4095, décalée de 4 bits avant transmission ;
- ordre transmis : octet faible puis octet fort.

Conversion de la consigne :

```text
mV = limitation(pourcentage, 0, 100) × 100
code12 = partie_entière(mV / 10000 × 4095)
mot_transmis = code12 << 4
```

### Stratégie de démarrage sûre

Le module peut mémoriser une configuration de sortie. La bibliothèque officielle précise que la valeur est sinon perdue à la coupure.

Stratégie à vérifier sur établi :

1. configurer la plage 10 V ;
2. commander 10 V sur les deux voies ;
3. mémoriser cette valeur une seule fois lors du provisionnement du banc ;
4. couper puis rétablir l'alimentation et mesurer la tension avant le démarrage du firmware ;
5. ne jamais utiliser la fonction de mémorisation dans la boucle de régulation ;
6. à chaque démarrage, imposer 10 V avant toute autre tâche non critique.

Si le module ne restitue pas 10 V de façon sûre au redémarrage, ajouter une solution matérielle ou inverser la convention actionneur afin que la valeur de démarrage ne provoque pas une fermeture dangereuse.

### Gestion des erreurs

- toute erreur d'écriture I²C place la commande logique à 100 % et déclenche plusieurs tentatives bornées ;
- après échec persistant, défaut `OUTPUT_WRITE_FAILED` journalisé ;
- l'absence de retour analogique empêche de prouver la tension réelle : validation périodique au multimètre sur le banc ;
- la voie 1 ne doit pas recevoir une valeur différente sans fonction explicitement validée.

## 4. Ordre de démarrage du lot 1

1. Démarrer le watchdog.
2. Initialiser les GPIO sans commander de moteur.
3. Initialiser I²C à 100 kHz.
4. Détecter le DFR0971 et écrire immédiatement 10 V.
5. Détecter le SCD41 et démarrer le mode périodique.
6. Attendre plusieurs mesures valides pendant au moins 15 secondes.
7. Passer en AUTO ; sinon rester à 100 %.
8. N'activer le Wi-Fi de service que sur appui physique.

## 5. Sources techniques

- [DFRobot — DFR0971](https://wiki.dfrobot.com/DFR0971)
- [DFRobot — bibliothèque GP8403](https://github.com/DFRobot/DFRobot_GP8403)
- [DFRobot — SEN0536](https://wiki.dfrobot.com/SEN0536)
- [DFRobot — référence SCD4X](https://wiki.dfrobot.com/sen0536/docs/21655)

## 6. Critères avant raccordement d'un moteur

- adresses `0x58` et `0x62` détectées sans collision ;
- 100 lectures SCD41 consécutives avec CRC correct ;
- fraîcheur correctement déclarée en débranchant la sonde ;
- sorties mesurées à 0, 2, 5, 8 et 10 V ;
- erreur absolue inférieure à 0,1 V sur le banc initial ;
- 10 V observé au redémarrage avant la fin du boot ;
- aucun appel à la mémorisation pendant 24 h d'endurance.
