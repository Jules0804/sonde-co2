# Cahier des charges fonctionnel v0.1

## Système professionnel de régulation de ventilation CO₂

**Statut :** cadrage validé, consolidation réglementaire en cours  
**Finalité :** développement complet d'un produit reproductible, certifiable et commercialisable  
**Priorités :** simplicité d'installation, fiabilité, puis maîtrise du prix

## 1. Objet

Le produit régule automatiquement la ventilation d'une salle de réunion en fonction de sa concentration en CO₂. Il pilote proportionnellement les volets motorisés du soufflage et de la reprise, affiche l'état du système et permet sa configuration depuis un téléphone, sans dépendre d'Internet ni d'un service cloud.

Le premier usage est l'installation sur les chantiers de l'entreprise de CVC de Jules. L'objectif à terme est un produit plug-and-play commercialisé sous sa propre marque.

## 2. Périmètre d'un système

- Un boîtier autonome par salle.
- Une sonde CO₂ sur la reprise dédiée à cette salle.
- De un à six servomoteurs commandés en parallèle.
- Volets de soufflage et de reprise utilisant la même consigne d'ouverture.
- Diamètres de gaine visés : 125 à 400 mm.
- Plage indicative de débit : 50 à plus de 2 000 m³/h.
- Alimentation du boîtier en 230 V.
- Installation possible en faux plafond, sur une paroi ou sur rail DIN.

## 3. Fonctionnement principal

1. Mesurer périodiquement la concentration en CO₂ dans la reprise dédiée.
2. Vérifier la validité et la cohérence de la mesure.
3. Calculer une consigne proportionnelle d'ouverture entre un minimum réglable et 100 %.
4. Transmettre la même consigne à tous les servomoteurs raccordés.
5. Afficher l'état localement et dans l'application.
6. Conserver les réglages après une coupure d'alimentation.
7. Continuer à réguler sans téléphone, Wi-Fi de bâtiment, Internet ou GTB.

Le débit minimal de ventilation reste prioritaire sur la réduction demandée par le CO₂. Pour un local de réunion relevant du Code du travail français, la base actuelle est de 30 m³/h d'air neuf par occupant. Le débit de conception doit néanmoins être vérifié pour chaque type de bâtiment et chaque chantier.

La commande devra être stable, progressive et insensible aux petites oscillations de CO₂. Une temporisation, un filtrage et une hystérésis ou une régulation PI seront étudiés et validés expérimentalement.

## 4. Exigences prioritaires de la version 1

### 4.1 Mesure CO₂

- Technologie NDIR adaptée à une mesure durable.
- Sonde installable dans une gaine de reprise dédiée.
- Élément facilement remplaçable en maintenance.
- Détection d'absence, d'incohérence, de valeur figée ou hors plage.
- Procédure de vérification et de calibration à définir.
- Consigne usine initiale proposée à 1 000 ppm, modifiable dans l'application. Cette valeur est un choix d'ingénierie et non un seuil légal universel.

### 4.2 Commande des volets

- Régulation proportionnelle.
- Jusqu'à six servomoteurs utilisant la même consigne.
- Tension d'alimentation des servomoteurs à comparer entre 24 V et 230 V selon le coût total installé, la sécurité, la disponibilité et la compatibilité avec une commande proportionnelle 0–10 V.
- Alimentation et connectique dimensionnées pour le courant cumulé de six servomoteurs.
- Possibilité d'une ouverture forcée à 100 % depuis l'application.
- Stratégie de commande à l'ouverture maximale lors des défauts critiques détectés pendant que le système reste alimenté.
- Aucune exigence d'ouverture automatique lors d'une coupure totale de courant : la salle est considérée comme inoccupée dans cette situation.

### 4.3 Mesure du débit

- Mesure informative sur la reprise.
- Ajoutée après la validation du premier ensemble CO₂/commande, mais intégrée au prototype complet.
- Solutions à comparer selon le coût et la précision : pression différentielle avec organe de mesure, grille de mesure, volet à mesure intégrée ou capteur de vitesse.
- La très grande plage 50–2 000 m³/h et les diamètres 125–400 mm nécessiteront probablement plusieurs configurations mécaniques ou coefficients de calibration.

### 4.4 Interface téléphonique

- Application visuelle, simple et sans fonctions superflues.
- Fonctionnement local sans cloud.
- Technologie candidate : interface Web locale adaptée au téléphone et hébergée par le boîtier. Son installation comme PWA ne sera annoncée qu'après validation sur iOS et Android.
- Méthode de connexion à comparer : point d'accès Wi-Fi local, Bluetooth pour l'appairage, ou combinaison des deux.
- Mise à jour locale du logiciel depuis le téléphone.

Informations et commandes initiales :

- valeur CO₂ actuelle ;
- débit mesuré ;
- pourcentage d'ouverture ;
- état normal ou défaut ;
- réglage de la consigne CO₂ ;
- réglage du débit minimal ;
- test des sorties ;
- ouverture forcée ;
- diagnostic d'installation.

### 4.5 Interface locale

- Petit afficheur envisagé si son coût, sa durée de vie et son intégration restent acceptables.
- Aucun bouton n'est demandé dans la définition actuelle.
- Des voyants d'état et une méthode physique de remise à zéro sécurisée devront néanmoins être étudiés.

## 5. Modes de fonctionnement

- Démarrage et autotest.
- Régulation automatique.
- Mise en service et calibration.
- Test des servomoteurs.
- Ouverture forcée.
- Fonctionnement dégradé.
- Mise à jour du logiciel.
- Retour aux paramètres d'usine.

## 6. Défauts à gérer

- Sonde CO₂ absente ou défaillante.
- Mesure CO₂ incohérente ou figée.
- Capteur de débit absent ou défaillant.
- Sortie de commande en défaut.
- Surcharge ou court-circuit d'une alimentation auxiliaire.
- Mémoire ou paramètres invalides.
- Échec d'une mise à jour.
- Redémarrages répétés.
- Température interne excessive, si la mesure est retenue.

Le principe retenu est de favoriser la ventilation : lorsqu'un défaut critique est détecté et que le boîtier reste alimenté, demander l'ouverture maximale et signaler clairement le défaut. Une coupure totale de courant ne nécessite pas de rappel mécanique à l'ouverture.

## 7. Architecture évolutive

La version suivante pourra ajouter :

- température et humidité ;
- détection de présence ;
- historique et graphiques ;
- Modbus RTU/TCP ;
- BACnet MS/TP ou BACnet/IP ;
- connexion à une GTB ;
- retour individuel de position ou détection de défaut de chaque volet ;
- pilotage ou information de la centrale de traitement d'air ;
- gestion de plusieurs produits depuis une interface commune.

La carte de première génération doit éviter de bloquer inutilement ces évolutions, sans augmenter excessivement le coût de la version 1.

## 8. Contraintes produit

- Installation rapide par un professionnel CVC.
- Bornes clairement repérées ou connecteurs détrompés.
- Câblage compréhensible sans formation longue.
- Boîtier maintenable, sonde remplaçable et pièces accessibles.
- Réglages protégés contre les modifications accidentelles.
- Fonctionnement local autonome.
- Absence de mot de passe universel fixe.
- Mise à jour signée et mécanisme de retour à une version fonctionnelle à étudier.
- Séparation sûre entre le 230 V et la très basse tension.

## 9. Première preuve de fonctionnement

Le premier montage sur établi comportera :

- un contrôleur de développement ESP32 ;
- une sonde CO₂ NDIR ;
- un volet de soufflage et un volet de reprise ;
- deux servomoteurs proportionnels ;
- une alimentation protégée ;
- une interface téléphonique locale minimale ;
- l'enregistrement des mesures de test.

La capacité à commander six moteurs sera vérifiée après validation avec deux moteurs.

## 10. Critères de réussite initiaux

- Lecture CO₂ stable et plausible pendant un essai prolongé.
- Réaction progressive et reproductible à une hausse ou baisse de CO₂.
- Commande cohérente des deux premiers volets.
- Conservation des paramètres après coupure.
- Régulation maintenue sans téléphone ni réseau externe.
- Détection de la déconnexion de la sonde.
- Ouverture de sécurité conforme à la stratégie retenue.
- Interface utilisable depuis un téléphone sans application propriétaire téléchargée.
- Aucun accès dangereux au 230 V lors d'une utilisation normale.

## 11. Éléments non figés

- Référence et implantation exactes de la sonde CO₂.
- Validation par essais de la consigne CO₂ usine proposée à 1 000 ppm.
- Technologie et référence des servomoteurs.
- Technologie de mesure du débit.
- Méthode de connexion au téléphone.
- Présence et type de l'afficheur.
- Durée de conservation de l'historique.
- Prix de revient cible.
- Indice de protection et dimensions du coffret.
- Protocoles GTB de la version suivante.
- Normes et procédures de conformité applicables au produit final.

## 12. Exclusions de la version 1

Le produit n'est pas destiné à être utilisé comme :

- détecteur de gaz de sécurité ;
- système de sécurité incendie ;
- commande de clapet coupe-feu ou de désenfumage ;
- équipement ATEX ;
- dispositif médical ;
- preuve autonome de conformité du bâtiment sans mesure et mise en service aéraulique.
