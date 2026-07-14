# Interface web locale

Ce dossier contient la maquette de l'interface web locale utilisee depuis un telephone.

Decision actuelle : pas d'application App Store / Play Store au debut. Le boitier generera un Wi-Fi de service sur demande et servira une page web locale depuis l'ESP32.

Actif :

- `maquette-web-locale` : maquette web cote PC pour tester l'ergonomie.
- interface embarquee finale : reprise dans `06 - LOGICIEL EMBARQUE/firmware-esp32/tests-materiel/wifi_ap_web`, puis dans le firmware produit.

Regle simple : ce dossier sert a dessiner et tester les ecrans. Le code qui pilote vraiment le materiel reste dans `06 - LOGICIEL EMBARQUE`.
