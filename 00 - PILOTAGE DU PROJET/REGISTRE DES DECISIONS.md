# Registre des décisions

## D-001 — Finalité du projet

**Décision :** développer un produit complet, reproductible, certifiable et commercialisable ; le prototype n'est qu'un jalon.  
**Statut :** validée.

## D-002 — Périmètre d'un boîtier

**Décision :** un boîtier autonome gère une salle et jusqu'à six servomoteurs commandés en parallèle.  
**Statut :** validée pour le cadrage, à confirmer par les essais électriques.

## D-003 — Fonctionnement hors réseau

**Décision :** la régulation ne dépend ni d'Internet, ni du téléphone, ni du réseau du bâtiment.  
**Statut :** validée.

## D-004 — Coupure totale de courant

**Décision :** aucune ouverture mécanique automatique n'est exigée lors d'une coupure totale de courant, la salle étant considérée comme inoccupée. Le rappel par ressort n'est pas imposé.  
**Statut :** validée par Jules.

## D-005 — Défaut critique sous tension

**Décision :** si le boîtier reste alimenté et détecte un défaut critique, il commande les volets à 100 % et signale le défaut.  
**Statut :** validée dans le cahier des charges v0.1.

## D-006 — GTB

**Décision :** Modbus et BACnet sont reportés à une version suivante, sans fermer la possibilité de les ajouter.  
**Statut :** validée.

## D-007 — Validation du plan directeur

**Décision :** le plan directeur v0.1 est approuvé et le projet définitif peut être créé.  
**Statut :** validée par Jules.

## D-008 — Débit minimal avant modulation CO₂

**Décision :** le produit ne descend jamais sous le débit minimal déterminé à la mise en service. Pour un local de réunion relevant du Code du travail, la base réglementaire actuelle est de 30 m³/h d'air neuf par occupant.  
**Statut :** exigence réglementaire intégrée au cahier des charges ; autres types de locaux à vérifier par chantier.

## D-009 — Consigne CO₂ usine

**Décision :** utiliser 1 000 ppm comme cible usine initiale, modifiable, sans la présenter comme un seuil légal universel.  
**Statut :** validée au jalon 1, à confirmer par les essais.

## D-010 — Interface téléphonique version 1

**Décision :** point d'accès Wi-Fi local et interface Web responsive sans cloud ; ne pas promettre l'installation PWA avant essais iOS/Android.  
**Statut :** validée au jalon 1.

## D-011 — Exclusions de sécurité

**Décision :** la version 1 ne commande pas de clapets coupe-feu/désenfumage et n'est ni un détecteur de gaz de sécurité, ni un dispositif ATEX ou médical.  
**Statut :** intégrée au cahier des charges.

## D-012 — Architecture de référence du boîtier

**Décision :** boîtier autonome tout-en-un avec entrée 230 V, tête CO₂ déportée, six départs moteurs, commande commune 0–10 V et interface Web locale en Wi-Fi. La tension d'alimentation des moteurs reste à départager entre 24 V et 230 V en phase 2.  
**Statut :** validée avec amendement par Jules.

## D-013 — Liaison de la tête CO₂

**Décision proposée :** liaison courte autorisée sur le premier banc ; liaison différentielle robuste, de préférence RS-485 ou UART différentiel, requise pour le produit.  
**Statut :** recommandation du jalon 1, choix final après comparaison des sondes.

## D-014 — Récupération locale

**Décision :** ajouter un bouton de service encastré ou inaccessible en usage normal afin de permettre une récupération sûre sans créer de commandes en façade.  
**Statut :** validée au jalon 1.

## D-015 — Mesure du débit minimal

**Décision :** sans capteur de débit, minimum exprimé en pourcentage et vérifié à l'équilibrage ; avec option débit, minimum exprimé en m³/h et associé à une calibration.  
**Statut :** validée au jalon 1.

## D-016 — Validation du jalon 1

**Décision :** J1-D1 à J1-D6 sont validées. J1-D1 est amendée pour laisser ouverte la tension des servomoteurs entre 24 V et 230 V jusqu'à la comparaison de phase 2.  
**Statut :** validée par Jules.

## D-017 — Tension des servomoteurs en phase 2

**Décision proposée :** retenir le 24 V proportionnel 0/2–10 V pour le banc et la version 1 standard. La mise à jour du 21 juin 2026 compare Siemens, Belimo, Gruner et Nenutec : le Siemens GDB161.1E reste la référence professionnelle au plus faible prix public vérifiable. Le comparable 230 V crée un surcoût calculé de 56,66 € TTC pour deux moteurs et 169,98 € TTC pour six, avant protections supplémentaires. Le calcul six moteurs exige 39,69 W / 1,65 A avec marge, donc l'alimentation 60 W / 2,5 A est suffisante sur papier.  
**Statut :** recommandation technique consolidée ; validation de Jules et tarif professionnel encore requis avant achat du lot 2.

## D-018 — Capteur CO₂ de phase 2

**Décision proposée :** utiliser provisoirement le Sensirion SCD41 sur breakout pour le premier banc, puis l'intégrer dans une tête sur mesure avec liaison différentielle si les essais de précision, dérive et implantation en gaine sont satisfaisants.  
**Statut :** recommandation de phase 2 ; à figer avec la nomenclature avant achat.

## D-019 — Nomenclature du premier banc

**Décision proposée :** budget principal estimé à 533,03 € TTC hors registres et hors afficheur, 586,33 € avec réserve de 10 %, et environ 760 € avec mécanique achetée.  
**Statut :** chiffrage provisoire corrigé le 21 juin 2026. L'afficheur est optionnel puisque le QR Wi-Fi unique sera gravé au laser ; il n'est plus inclus dans le coût de base. Prix à revérifier avant chaque lot.

## D-020 — Premier lot d'achat

**Décision proposée :** commencer uniquement par le SEN0536 SCD41 et le DFR0971, soit 64,50 € TTC observés et un plafond de 90 € TTC transport compris.  
**Statut :** validée par Jules avec un plafond de 90 € TTC.

## D-021 — Autorisation financière du lot 1

**Décision :** Jules autorise le lot SEN0536 + DFR0971 dans la limite de 90 € TTC, transport compris.  
**Statut :** validée.

## D-022 — Direction visuelle de l'interface locale

**Décision :** conserver la direction visuelle du prototype PWA v0.1 pour la suite : tableau de bord sobre, lecture CO₂ prioritaire, navigation inférieure et présentation adaptée au téléphone. L'application reste une interface Web locale sans dépendance à Internet.  
**Statut :** direction validée par Jules le 20 juin 2026 ; détails ergonomiques à affiner lors des essais sur téléphone.

## D-023 — Distribution mobile de la version commerciale

**Décision proposée :** conserver la PWA comme cœur partagé et interface locale de secours, puis créer pour la commercialisation une application hybride iOS/Android publiée sur l'App Store et Google Play avec de vraies fonctions natives d'appairage, découverte et sécurité. Éviter deux réécritures séparées en Swift et Kotlin tant qu'aucune contrainte technique ne l'impose.  
**Statut :** non retenue comme priorité de version 1 ; à réexaminer uniquement si les essais démontrent un besoin d'application native.

## D-024 — Accès local sans application

**Décision :** privilégier l'interface Web hébergée par le boîtier. Un appui physique active temporairement le Wi-Fi de service ; l'écran affiche le réseau, l'adresse simple et un QR code. Un portail captif facilite l'ouverture. Aucune application App Store/Play Store n'est nécessaire pour la version 1. L'Ethernet est exclu de cette version et sera réétudié uniquement avec BACnet/IP.  
**Statut :** direction validée par Jules le 20 juin 2026 ; afficheur à chiffrer avant achat.

## D-025 — Afficheur du premier banc

**Décision proposée :** ajouter au premier banc un IPS Joy-It SBC-LCD01 de 1,3″, 240 × 240, SPI 3,3 V, afin de tester le QR code et le parcours Wi-Fi. Prix observé : 7,20 € TTC ; total estimatif du lot 1 porté de 69,00 € à 76,20 € livré si le transport reste inchangé. Le 2″ DFR0664 reste un candidat ergonomique pour le produit.  
**Statut :** l'afficheur reste une option pour l'état et l'URL, mais n'est plus nécessaire au QR code ; ne pas l'ajouter au lot 1 sans décision séparée.

## D-026 — Carte du prototype et QR code

**Décision :** utiliser la carte disponible **Wemos S2 Mini V1.0.0 / ESP32-S2** pour le prototype sur table. Le QR code Wi-Fi sera unique et gravé au laser sur le plastique du boîtier ; le portail captif ouvrira l'interface et l'adresse `http://192.168.4.1` restera visible en secours. Le QR ne contiendra pas d'identifiant administrateur.  
**Statut :** direction corrigée après identification visuelle par Jules le 28 juin 2026 ; brochage SDA/SCL, flash réelle, port USB, bouton et LED restent à relever avant câblage.
