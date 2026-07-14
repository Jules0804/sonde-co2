# Spécification des interfaces v0.1

## I-01 — Alimentation secteur

- Entrée : 230 V AC, 50 Hz.
- Raccordement : bornier protégé, accessible uniquement boîtier ouvert.
- Protection, section des conducteurs et classe électrique : à figer avec le schéma de sécurité.

## I-02 — Tête CO₂

- Tête déportée et remplaçable.
- Distance cible initiale : jusqu'à 5 m entre tête et contrôleur, à confirmer.
- Connecteur détrompé.
- Liaison robuste avec contrôle d'erreur ; RS-485 ou UART différentiel à comparer.
- Données minimales : CO₂, état capteur, température interne utile à la compensation, numéro/version et informations de calibration.

## I-03 — Servomoteurs

- Six connecteurs maximum.
- Alimentation : 24 V ou 230 V selon le résultat de la comparaison de phase 2.
- Commande commune : Y = 0–10 V.
- Affectation initiale : 0 V = ouverture minimale ; 10 V = ouverture maximale, sous réserve du paramétrage de l'actuateur.
- Courant, protections, isolation et connectique à définir après sélection de la tension.
- Retour de position U : optionnel ; ne doit pas être mis en parallèle. Prévoir au maximum une entrée de référence sur le prototype ou six entrées sur une variante future.

## I-04 — Capteur de débit optionnel

- Entrées de pression différentielle via tubes adaptés.
- Interface électrique du capteur : numérique ou analogique, à sélectionner.
- Paramètres : zéro, plage Pa, coefficient K, diamètre/section, unités.
- Valeurs produites : pression, débit calculé, état et défaut.

## I-05 — Affichage local

- L'afficheur est optionnel ; le QR Wi-Fi et l'adresse de secours sont gravés sur le boîtier. Un voyant d'état reste requis.
- Données minimales : CO₂, ouverture, état/défaut.
- En mode service : SSID, URL/IP et temps restant. Le QR Wi-Fi est gravé sur le boîtier.
- Voyants minimaux à étudier : alimentation, fonctionnement, défaut, service Wi-Fi.
- Aucun réglage courant par bouton en façade.
- Un dispositif physique encastré de service/récupération est recommandé.

## I-06 — Téléphone

- Wi-Fi local 2,4 GHz.
- Interface Web responsive.
- Authentification par secret unique.
- API locale non exposée sur Internet.
- Fonctions : lecture, réglages, test, diagnostic, export de journal, mise à jour.
- Protection contre les requêtes non authentifiées et limitation du nombre d'essais.
- Activation du point d'accès par appui physique de 3 secondes.
- SSID unique `VENT-CO2-XXXX`, secret unique et arrêt automatique après 15 minutes.
- Adresse de secours du mode AP : `http://192.168.4.1`.
- Portail captif souhaité mais URL/IP toujours disponible en secours.
- QR Wi-Fi unique gravé, associé au SSID et au secret programmés en fabrication.

## I-06B — Ethernet futur avec BACnet/IP

- Exclu de la version 1 et du prototype actuel.
- À réétudier uniquement avec la future variante BACnet/IP.
- DHCP avec affichage de l'adresse reçue.
- Nom local unique, avec adresse IP comme solution de secours.
- Interface Web identique au Wi-Fi.
- Réglages et tests protégés par authentification et, si nécessaire, présence physique locale.
- Protections CEM, surtension, isolement et connectique industrielle à étudier dans ce futur lot seulement.

## I-07 — Données persistantes

- Paramètres avec version de schéma et contrôle d'intégrité.
- Valeurs usine séparées des réglages utilisateur.
- Journal circulaire des défauts et événements.
- Historique de mesures désactivable ; durée initiale proposée de 7 jours avec pas agrégé, à confirmer par la capacité mémoire.
- Aucune donnée personnelle nécessaire au fonctionnement.

## I-08 — Interface GTB future

- RS-485 isolé recommandé pour Modbus RTU/BACnet MS/TP.
- Adressage, vitesse et parité configurables.
- Points minimaux futurs : CO₂, débit, ouverture, consigne, minimum, mode, défaut et version.
- Les commandes GTB ne doivent pas désactiver silencieusement le minimum hygiénique ou les replis de défaut.

## I-09 — Mise à jour

- Fichier signé par le fabricant.
- Vérification avant activation.
- Deux images ou mécanisme équivalent permettant un retour arrière.
- Mise à jour locale depuis le téléphone.
- Version et résultat de mise à jour consignés dans le journal.
