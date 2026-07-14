# Parcours d'accès local Wi-Fi et Ethernet v0.1

## 1. Principe retenu

Le boîtier reste autonome et ne nécessite ni application mobile, ni compte cloud, ni accès Internet. L'utilisateur ouvre l'interface Web locale avec le navigateur de son téléphone ou de son ordinateur.

La version 1 utilise un seul chemin :

1. **Wi-Fi de service temporaire**, activé physiquement sur le boîtier.

L'Ethernet est explicitement reporté à une future étude BACnet/IP. Il ne doit pas influencer le prototype, la carte électronique ou le budget de la version 1.

## 2. Parcours Wi-Fi recommandé

1. Maintenir le bouton de service pendant 3 secondes.
2. Le voyant ou l'écran confirme « Wi-Fi service actif ».
3. Le boîtier crée le réseau `VENT-CO2-XXXX`.
4. Le QR code gravé sur le boîtier permet de rejoindre le réseau. L'adresse de secours `http://192.168.4.1` est gravée ou imprimée lisiblement à proximité. Un afficheur, s'il est ajouté plus tard, peut montrer le nom du réseau et le temps restant.
5. Après connexion, le portail captif tente d'ouvrir automatiquement l'interface.
6. Si le portail ne s'ouvre pas, l'utilisateur saisit l'adresse affichée ou scanne le QR code d'accès.
7. Après 15 minutes, ou après fermeture volontaire, le point d'accès s'arrête automatiquement.

La régulation CO₂ continue normalement pendant toute la session. Une coupure du téléphone ou du Wi-Fi n'a aucun effet sur les volets.

## 3. QR codes

Un QR code unique ne doit pas être supposé capable de connecter au Wi-Fi et d'ouvrir l'URL de manière identique sur tous les téléphones.

Solution robuste retenue :

- QR Wi-Fi unique gravé au laser pour rejoindre le réseau ;
- ouverture automatique par portail captif ;
- URL lisible toujours affichée en secours ;
- aucun mot de passe administrateur dans le QR.

Le QR code de connexion utilisera le format Wi-Fi standard avec SSID et secret uniques. Aucun mot de passe commun à tous les produits n'est autorisé. La gravure et les identifiants programmés devront être contrôlés ensemble en fabrication.

## 4. Ethernet futur avec BACnet/IP

L'Ethernet n'est pas prévu dans la version 1. Lors de l'étude d'une future variante BACnet/IP, le parcours envisagé sera :

1. le boîtier demande une adresse par DHCP ;
2. l'écran affiche l'adresse IP et un nom local, par exemple `http://vent-co2-XXXX.local` ;
3. un QR code d'URL permet l'ouverture directe depuis un téléphone présent sur le même réseau ;
4. l'adresse IP reste affichable si la résolution du nom local échoue.

Pour éviter qu'un utilisateur du réseau modifie l'installation sans présence locale :

- la consultation peut rester disponible avec authentification ;
- les réglages, tests et mises à jour nécessitent une session installateur ;
- l'ouverture d'une session de mise en service peut exiger l'appui physique sur le bouton.

L'Ethernet augmente le coût, l'encombrement, les protections CEM/surtension et les essais de conformité. Il sera étudié uniquement avec BACnet/IP et ne doit être ajouté ni au lot 1, ni à la nomenclature de la version 1.

## 5. Indication locale

La version 1 n'exige pas d'afficheur pour le QR ou l'adresse : ils sont portés par le boîtier. Un voyant doit au minimum distinguer l'état du service Wi-Fi et le défaut général.

Un afficheur reste une option à évaluer pour montrer :

- CO₂ et état normal/défaut ;
- ouverture demandée ;
- état du Wi-Fi de service ;
- SSID, URL/IP et compte à rebours pendant la mise en service ;
- temps restant de la fenêtre Wi-Fi.

Il ne doit pas être ajouté au budget de base avant essai de lisibilité, consommation, température, durée de vie et disponibilité industrielle.

## 6. Sécurité minimale

- activation du Wi-Fi par présence physique ;
- WPA2 ou mieux selon la cible matérielle ;
- secret unique par boîtier ;
- durée de service limitée et visible ;
- limitation des tentatives d'authentification ;
- aucune API accessible depuis Internet ;
- journalisation des ouvertures de session et des modifications ;
- retour automatique en AUTO à la fin d'un test ;
- bouton de service incapable de désactiver la régulation.

HTTP peut être toléré sur le point d'accès isolé du prototype. Pour le produit professionnel, la protection des identifiants et des commandes sur un réseau Ethernet ou Wi-Fi partagé doit être résolue par une étude TLS/authentification dédiée.

## 7. Cas de panne

| Panne | Comportement attendu |
|---|---|
| Téléphone déconnecté | Régulation inchangée, test temporisé |
| Portail captif non ouvert | URL/IP et QR disponibles |
| DHCP Ethernet absent — variante BACnet/IP future | Adresse de secours ou diagnostic affiché |
| Résolution `.local` absente — variante future | Utiliser l'adresse IP |
| Afficheur absent ou défaillant | QR gravé et adresse IP fixe du mode AP en secours |
| Wi-Fi bloqué | Réessai contrôlé, puis défaut non critique ; régulation maintenue |

## 8. Validation à réaliser

- essais Android et iPhone avec QR Wi-Fi ;
- essais du portail captif sur plusieurs navigateurs ;
- mesure du temps d'activation et d'arrêt ;
- vérification du délai de 15 minutes ;
- test perte téléphone pendant un test actionneur ;
- aucune validation Ethernet pendant la version 1 ; étude reportée au lot d'évolution BACnet/IP ;
- essai de lisibilité de la gravure QR et de l'adresse de secours sur le boîtier.

## 9. Sources techniques

- [Espressif — pilote Wi-Fi ESP32](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-guides/wifi.html)
- [Espressif — API Ethernet ESP32](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/network/esp_eth.html)
