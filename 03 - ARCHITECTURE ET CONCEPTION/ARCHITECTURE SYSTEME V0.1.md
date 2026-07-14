# Architecture système v0.1

## 1. Décision d'architecture recommandée

Le système est constitué d'un contrôleur autonome alimenté en 230 V, d'une tête de mesure CO₂ déportée dans la reprise dédiée, d'une sortie proportionnelle commune 0–10 V et de six départs protégés pour les servomoteurs. L'alimentation des moteurs, 24 V ou 230 V, sera choisie après comparaison technique et économique.

Le contrôleur héberge une interface Web locale accessible par téléphone. Il ne dépend ni du cloud, ni du Wi-Fi du bâtiment, ni d'une GTB pour assurer la régulation.

## 2. Schéma fonctionnel

```text
              GAINE DE REPRISE DÉDIÉE
                       │
              [Tête CO₂ déportée]
                       │ liaison basse tension
                       ▼
┌────────────────────────────────────────────────────────────┐
│                    BOÎTIER DE SALLE                         │
│                                                            │
│  230 V ─ protections ─ alimentation logique isolée         │
│                             │                              │
│                             ├─ alimentation logique 5/3,3 V│
│                             ├─ référence/sortie 0–10 V     │
│                             └─ 6 départs moteurs 24/230 V   │
│                                                            │
│  Capteurs ──> microcontrôleur ──> régulation ──> 0–10 V    │
│                    │                 │                      │
│                    │                 └─ repli défaut 100 %  │
│                    ├─ journal/paramètres                    │
│                    ├─ afficheur/voyants                     │
│                    └─ Wi-Fi local de maintenance            │
└────────────────────────────────────────────────────────────┘
             │ même consigne Y 0–10 V
             ├── moteur 1 soufflage
             ├── moteur 2 reprise
             ├── moteur 3
             ├── moteur 4
             ├── moteur 5
             └── moteur 6

Option débit : prise de pression/reprise ─> capteur ΔP ─> contrôleur
```

## 3. Architecture électrique de principe

### 3.1 Entrée secteur

- 230 V AC, 50 Hz.
- Bornier L/N et éventuellement PE selon la classe électrique finale.
- Protection contre surintensités et surtensions à dimensionner.
- Alimentation AC/DC isolée et certifiée, intégrée dans le boîtier.
- Séparation physique et distances d'isolement entre secteur et TBTS.
- Enveloppe empêchant l'accès au secteur sans outil.

### 3.2 Distribution moteurs à comparer

- Variante 24 V : alimentation interne dimensionnée pour six actuateurs, câblage TBTS plus sûr mais alimentation plus puissante et coûteuse.
- Variante 230 V : distribution secteur vers six actuateurs, alimentation logique plus petite mais exigences de câblage, protection, isolation et maintenance nettement renforcées.
- Le coût comparé doit inclure les moteurs, l'alimentation, les protections, les borniers, le coffret, le câblage et l'impact de conformité, pas seulement le prix unitaire du moteur.
- Six départs identifiés et protégés individuellement ou par petits groupes.
- Un défaut sur un câble moteur ne doit pas détruire la logique ni masquer les autres fonctions.

### 3.3 Commande 0–10 V

- Une consigne commune distribuée aux six connecteurs.
- Convertisseur numérique/analogique ou PWM filtré avec étage analogique ; la solution DAC est préférée pour la reproductibilité.
- Sortie protégée contre les courts-circuits et erreurs de câblage raisonnablement prévisibles.
- Mesure interne de la tension de sortie pour diagnostic.
- Référence 0 V commune clairement identifiée.

### 3.4 Repli matériel sous tension

Le logiciel demande 100 % lorsqu'il détecte un défaut critique. Pour couvrir également le blocage du logiciel, l'architecture produit devra prévoir un watchdog matériel indépendant.

Solution recommandée à étudier :

- un circuit de surveillance attend un signal périodique du microcontrôleur ;
- en l'absence de signal, un relais ou commutateur analogique revient par défaut vers une référence 10 V ;
- ce repli ne s'applique que tant que l'alimentation des moteurs et la référence 10 V restent présentes ;
- aucune réserve d'énergie ni rappel par ressort n'est exigé lors d'une coupure totale.

## 4. Mesure CO₂

### Prototype

- module NDIR ou photoacoustique NDIR de développement ;
- liaison numérique courte et protégée ;
- tête placée dans un boîtier/probe permettant le contact avec l'air repris sans exposer directement l'électronique à la poussière ou à la condensation ;
- comparaison temporaire avec un appareil de référence lors des essais.

### Produit

- tête déportée remplaçable sans remplacer le contrôleur ;
- connecteur détrompé ;
- identification/calibration associée à la tête ;
- surveillance de communication, plage, dérive et valeur figée ;
- implantation empêchant l'influence thermique du contrôleur et de l'alimentation.

Un bus I²C brut sur plusieurs mètres n'est pas recommandé. Pour le produit, préférer une liaison robuste telle que RS-485, UART différentiel ou une sortie analogique conditionnée, après comparaison des coûts.

## 5. Mesure du débit

La solution de référence à étudier est une mesure de pression différentielle associée à un organe aéraulique possédant un coefficient K connu :

```text
Débit = K × √(pression différentielle)
```

Avantages :

- méthode courante en CVC ;
- adaptation aux diamètres 125–400 mm par le coefficient K et l'organe de mesure ;
- capteur électronique commun à plusieurs tailles ;
- possibilité de calibration et diagnostic depuis l'application.

La mesure du débit est d'abord informative. Deux modes de réglage seront prévus :

- sans option débit : minimum exprimé en pourcentage d'ouverture, réglé lors de l'équilibrage ;
- avec option débit : minimum exprimé en m³/h et procédure de calibration pour associer débit et position.

La fermeture de boucle directement sur le débit sera une fonction ultérieure, après validation de la stabilité aéraulique.

## 6. Régulation CO₂

### Contraintes

- le débit minimal réglementaire ou de conception reste prioritaire ;
- la mesure dans la reprise est retardée et filtrée par le réseau ;
- le CO₂ varie lentement, donc une commande trop rapide provoquerait des oscillations inutiles ;
- l'autorité réelle du volet dépend de la pression fournie par la centrale.

### Stratégie initiale

- cible usine : 1 000 ppm, modifiable ;
- sortie minimale issue de la mise en service ;
- filtrage de la mesure et détection des valeurs aberrantes ;
- rampe de sortie limitant la vitesse de mouvement ;
- régulateur PI lent avec anti-saturation, ou loi proportionnelle segmentée si les essais démontrent une meilleure robustesse ;
- ouverture à 100 % si la mesure dépasse un seuil d'alarme persistant ou si la sonde est déclarée en défaut ;
- limitation des manœuvres pour préserver les actuateurs.

Les paramètres définitifs seront déterminés avec le simulateur puis le banc.

## 7. Interface téléphonique

### Solution recommandée pour la version 1

- point d'accès Wi-Fi créé par le boîtier uniquement pendant la mise en service ou sur demande locale ;
- interface Web responsive servie par le boîtier ;
- aucune connexion Internet requise ;
- SSID et secret uniques par produit, fournis sur une étiquette/QR code ;
- session d'installation limitée dans le temps ;
- mise à jour du firmware depuis le navigateur du téléphone ;
- image de secours et retour automatique si la mise à jour échoue.

Parcours utilisateur retenu : appui physique de 3 secondes sur le bouton de service, création d'un réseau `VENT-CO2-XXXX`, affichage du SSID, du QR code, de l'adresse `http://192.168.4.1` et d'un compte à rebours de 15 minutes. Le portail captif tente d'ouvrir automatiquement l'interface, avec l'adresse affichée comme solution de secours.

L'Ethernet est exclu de la version 1. Il sera réétudié uniquement avec une future variante BACnet/IP ; aucun composant Ethernet n'est ajouté au prototype ou à la nomenclature actuelle.

Le terme « application installable » ne doit pas être promis avant vérification sur iOS et Android : l'installation d'une PWA locale sans certificat HTTPS fiable comporte des limitations. La version 1 garantit une interface Web utilisable depuis le navigateur.

### Accès de récupération

Malgré le souhait initial de ne pas ajouter de bouton, un moyen physique de récupération est nécessaire pour éviter qu'un produit devienne inutilisable ou qu'un tiers réinitialise le produit à distance. Solution économique recommandée : bouton de service encastré, accessible seulement boîtier ouvert ou par un orifice avec outil.

## 8. Calculateur

### Prototype

- ESP32 déjà disponible ou ESP32-S3 selon la carte exacte détenue ;
- séparation claire entre logique de régulation et pilotes matériels ;
- simulateur compilable sur ordinateur pour tester la machine d'états et la régulation.

### Produit

La famille finale ne sera choisie qu'après validation du prototype. Les critères incluront :

- durée de disponibilité ;
- radio certifiable ;
- secure boot et chiffrement du firmware ;
- double partition de mise à jour ;
- watchdogs ;
- nombre d'entrées/sorties ;
- coût et seconde source.

## 9. Compatibilité avec l'installation de ventilation

Même si le boîtier ne pilote pas la centrale, le produit doit imposer dans sa notice que :

- la centrale et le réseau supportent la variation de position des volets ;
- une régulation de pression, un bypass ou une stratégie équivalente empêche les surpressions ;
- le débit minimal est mesuré lors de la mise en service ;
- le produit ne commande jamais un clapet coupe-feu ou de désenfumage ;
- le débit total demandé reste compatible avec la centrale.

## 10. Variante évolutive GTB

Prévoir sans équiper nécessairement la version 1 :

- empreinte ou connecteur interne pour transceiver RS-485 isolé ;
- espace logiciel pour Modbus RTU et BACnet MS/TP ;
- éventuelle variante Ethernet pour Modbus TCP/BACnet IP ;
- accès futur à l'interface Web locale par Ethernet uniquement avec la variante BACnet/IP ;
- dictionnaire de points stable et versionné.

## 11. Décisions encore ouvertes pour le jalon 1

- radio active en permanence ou seulement en mode service ;
- méthode robuste de liaison avec la tête CO₂ ;
- classe II sans terre ou classe I avec terre ;
- tension et puissance d'alimentation après comparaison des moteurs 24 V/230 V ;
- présence de l'écran dans le produit final ;
- méthode exacte de repli matériel vers 10 V ;
- mesure de débit standard et plages de capteur ΔP ;
- indice IP cible.
