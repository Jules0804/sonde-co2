# Questionnaire — Projet de régulation de ventilation CO₂

## Comment répondre

Écris ta réponse sous chaque ligne **Réponse :**. Tu peux indiquer `Je ne sais pas encore` lorsqu'un point reste à étudier.

## 1. Destination du système

Le système est-il destiné uniquement à tes propres installations, à être vendu à tes clients, ou à devenir un véritable produit commercial ?

**Réponse :**
Je travail dans une entreprise de CVC donc au début j'aimerai les installer sur nos chantier et apres si c'est vraiment top les commercialiser oui 

## 2. Premier site pilote

Quel bâtiment servira de premier site pilote : bureaux, école, restaurant ou autre ? As-tu déjà une salle précise disponible ?

**Réponse :**
oui je l'essayerai dans la salle de reunion de mon entreprise 

## 3. Nombre de salles

Veux-tu piloter :

- une seule salle pour commencer ;
- plusieurs salles sur une même centrale de ventilation ;
- potentiellement un bâtiment complet ?

**Réponse :**
non chaque petit boitier gerera une seule salle mais potenttielement 2 4 ou 6 volet etc .. 

## 4. Configuration des gaines

Chaque salle possède-t-elle une gaine dédiée avec un volet accessible ? S'agit-il du soufflage, de l'extraction ou des deux ?

**Réponse :**
ben la sonde serait sur la gaine de reprise  et apres volet motorisé sur soufflage et reprise 

## 5. Centrale de ventilation

La centrale peut-elle faire varier sa vitesse ou maintenir une pression constante ? Connais-tu sa marque et son système de commande ?

**Réponse :**
Chaque centrale se gere toute seule on s'en fou 

## 6. Fonctionnement sans réseau

Le système doit-il continuer à fonctionner automatiquement et complètement si le Wi-Fi ou Internet tombe ?

**Réponse :**
Non il est totalement autonome et n'a besoin de rien par contre prise modbus et bacnet pour réglage depuis GTB pourquoi pas 

## 7. Utilisateurs de l'application

Qui utilisera l'application : installateur, technicien de maintenance, responsable du bâtiment ou occupants ? Les utilisateurs doivent-ils avoir des droits différents ?

**Réponse :**
Installateur et technicien de maintenance non je ne pense pas qu'il y ai besoin de droit different juste fabricant et utilisateur 

## 8. Fonctions souhaitées

Quelles fonctions veux-tu dans la première version, en plus de la mesure du CO₂ et de la commande des volets ?

- température et humidité ;
- mesure du débit ;
- programmation horaire ;
- détection de présence ;
- alarmes ;
- graphiques et historique ;
- commande manuelle ;
- connexion à une GTB ;
- gestion de plusieurs bâtiments ;
- autres fonctions.

**Réponse :**
oui j'aimerai bien mesurer le debit, connexion GTB en bacnet et modbus . et apres en fonctionnalité dont j'aimerai qu'on reparle plus tard : température humidité , detection presence
graphique etc... 

## 9. Technologies et matériel

As-tu déjà du matériel, des marques préférées ou une expérience avec les automates, ESP32, Modbus, KNX, BACnet ou Home Assistant ?

**Réponse :**
j'ai juste un esp32 pour le protypage apres tu me fera fabriquer notre propre carte je pense 

## 10. Budget du pilote

Quel budget approximatif acceptes-tu pour le premier système pilote complet, hors main-d'œuvre ?

**Réponse :**
aucune idée 

## 11. Compétences et fabrication

Souhaites-tu fabriquer toi-même les coffrets et réaliser le câblage ? Quel est ton niveau actuel en électricité, électronique et programmation ?

**Réponse :**
oui je fait tout , programation c'est toi moi j'y connais rien 

## 12. Finalité à long terme

À terme, veux-tu une installation professionnelle réalisée sur mesure ou un produit reproductible, certifiable et éventuellement commercialisable sous ta marque ?

**Réponse :**
non je veux un produit final tres simple d'utilisation plug and play reproductible facilement ( carte fabriquer sur mesure etc ... )
certifiable et commercialisable sous ma marque 

## Informations complémentaires

Ajoute ici tout élément, idée, contrainte ou fonction que tu juges utile pour le projet.

**Réponse :**
PRoduit final plug and play. 
Application visuel et simple pas de fioriture en trop 

---

# Deuxième entretien — Fonctionnement technique

## Synthèse provisoire

- Un boîtier autonome gère une seule salle.
- Un boîtier peut commander plusieurs volets, par exemple 2, 4 ou 6.
- Les volets peuvent être installés au soufflage et à la reprise.
- La mesure de CO₂ est envisagée dans la gaine de reprise dédiée à la salle.
- Le système continue à réguler sans Wi-Fi, Internet, application ou GTB.
- Une connexion Modbus et BACnet est souhaitée pour la GTB et la mise au point.
- La mesure du débit fait partie des fonctions principales.
- Le prototype utilisera un ESP32, puis une carte électronique dédiée sera étudiée.
- Le produit final doit être simple, reproductible, certifiable, commercialisable et plug-and-play.
- L'application doit rester visuelle et simple, sans fonctions inutiles.

## 13. Fonction des différents volets

Lorsqu'une salle possède 2, 4 ou 6 volets, doivent-ils tous suivre la même consigne d'ouverture ou veux-tu pouvoir régler chaque volet séparément ?

Exemple : deux volets de soufflage ouverts à 60 % et deux volets de reprise ouverts à 50 %.

**Réponse :**
non tous les volet reprise soufflage marche en parraléle 

## 14. Nombre maximal de sorties

Quel nombre maximal de volets un seul boîtier devrait-il pouvoir piloter dans sa version finale : 2, 4, 6, 8 ou davantage ?

**Réponse :**
on va dire 6 

## 15. Type de servomoteurs

Quels servomoteurs utilises-tu habituellement sur tes chantiers ? Si possible, indique une marque, une référence ou au moins le type de commande :

- 24 V tout-ou-rien ;
- 24 V trois points (ouvrir, arrêter, fermer) ;
- 0–10 V proportionnel ;
- servomoteur avec retour de position ;
- autre ou encore inconnu.

**Réponse :**
souvent Belimo ou siemens, mais je pense qu'il faut regarder ce qu'on trouve de mieux pendant notre projet ( j'aimerai que le projet soit plutot economique ) 


## 16. Synchronisation soufflage/reprise

Veux-tu maintenir automatiquement un équilibre entre le débit de soufflage et le débit de reprise ? Si oui, souhaites-tu un équilibre exact ou une légère surpression/dépression réglable dans la salle ?

**Réponse :**
l'ouverture est la meme entre les deux 

## 17. Mesure du débit

Comment imagines-tu la mesure du débit ?

- une mesure globale au soufflage et une à la reprise ;
- une mesure sur chaque gaine ou chaque volet ;
- des volets équipés d'une mesure de pression intégrée ;
- tu préfères que nous recherchions et comparions les solutions.

**Réponse :**
non juste un mesure sur la reprise histoire d'avoir l'info  mais oui comparer les solution c'est bien voir si on veut faire evoluer le produit en fonction du prix de chaque chose 


## 18. Plages de gaines et de débits

Quels diamètres ou dimensions de gaines souhaites-tu couvrir ? Quels sont approximativement les débits minimal et maximal d'une salle de réunion type ?

**Réponse :**
taille de gaine : de 125mm a 400 mm 
je dirai de 50m3h a plus de 2000

## 19. Emplacement de la sonde CO₂

La gaine de reprise mesurée sera-t-elle toujours dédiée à une seule salle, sans mélange avec l'air d'autres locaux avant la sonde ? La sonde devra-t-elle être démontable facilement pour son entretien ou son remplacement ?

**Réponse :**
Oui  dédié a une seule salle , facilement replacable en cas de soucis 

## 20. Alimentation du boîtier

Quelle alimentation préfères-tu sur chantier ?

- arrivée 230 V directement dans le boîtier ;
- alimentation externe 24 V AC ;
- alimentation externe 24 V DC ;
- compatibilité 24 V AC et DC ;
- tu souhaites que nous comparions les solutions.

**Réponse :**
Arrivé en 230 dans le boitier 

## 21. Connexion du téléphone

Comment l'installateur doit-il se connecter au boîtier avec son téléphone ?

- directement au Wi-Fi créé par le boîtier, sans Internet ;
- sur le réseau Wi-Fi du bâtiment ;
- par Bluetooth ;
- avec plusieurs méthodes possibles ;
- tu souhaites que nous choisissions la meilleure solution.

**Réponse :**
Je souhaite que nous choisissions la meilleure solution

## 22. Réglages accessibles

Quels réglages l'utilisateur doit-il pouvoir modifier ? Par exemple : consigne CO₂, débit minimal, débit maximal, nombre de volets, équilibrage soufflage/reprise, seuils d'alarme ou horaires.

**Réponse :**
Consigne Co2 débit minimal, les autres on verra plus tard 


## 23. Mise en service plug-and-play

Décris idéalement les étapes que l'installateur devrait suivre entre l'ouverture du carton et la fin de la mise en service.

**Réponse :**
tu fixe ton boitier au mur tu l'ouvre et la soit tu as des petite prise simple avec des cable déja fourni
ou alors bornier tres simple ou tu vois comment brancher 

## 24. Position en cas de panne

En cas de panne du boîtier, de perte de la sonde CO₂ ou de coupure d'alimentation, quelle position les volets doivent-ils prendre : ouverts, fermés, débit minimal ou dernière position connue ?

**Réponse :**
ouvert a fond 

## 25. Fonctionnement manuel

Faut-il prévoir sur le boîtier lui-même des boutons, un écran ou seulement des voyants ? Souhaites-tu pouvoir forcer les volets sans utiliser le téléphone ?

**Réponse :**
en fonction du prix juste mini ecran affichage d'information pas de bouton 

## 26. Connexion GTB

Pour la GTB, souhaites-tu prévoir dès la première version :

- Modbus RTU sur RS-485 ;
- Modbus TCP sur Ethernet ou Wi-Fi ;
- BACnet MS/TP sur RS-485 ;
- BACnet/IP sur Ethernet ou Wi-Fi ;
- plusieurs de ces possibilités ;
- tu souhaites que nous déterminions la meilleure combinaison.

**Réponse :**
non version suivante 

## 27. Format du produit

Où le boîtier sera-t-il généralement installé : faux plafond, gaine technique, local ventilation, mur de la salle ou autre ? As-tu une préférence pour un coffret sur rail DIN ou un coffret mural ?

**Réponse :**
faux plafond mural mais clipsable sur rail din qui fait les deux quoi  

## 28. Contraintes du premier pilote

Pour la salle de réunion de ton entreprise, peux-tu relever ou photographier ultérieurement :

- le nombre et le diamètre des gaines ;
- les volets existants ;
- les servomoteurs éventuels ;
- les débits de conception ;
- l'alimentation disponible ;
- la centrale et son mode de régulation ?

**Réponse :**
t'occupe on verra ca au fur a mesure pas encore de volet n'y rien je crée le systeme donc on choisi ce qu'on veut nous meme 

---

# Troisième entretien — Produit et première version

## Architecture provisoire retenue

- Le boîtier reçoit une alimentation 230 V et produit en interne l'alimentation basse tension nécessaire.
- Il commande jusqu'à six servomoteurs en parallèle avec la même consigne.
- Les volets de soufflage et de reprise suivent donc le même pourcentage d'ouverture.
- La technologie exacte des servomoteurs sera choisie après comparaison technique et économique.
- Une sonde CO₂ remplaçable mesure l'air dans la reprise dédiée à la salle.
- Une mesure de débit sur la reprise fournit une information et facilite la mise au point.
- Les deux premiers réglages utilisateur sont la consigne de CO₂ et le débit minimal.
- En cas de défaut critique, les volets doivent être commandés ou ramenés en ouverture maximale.
- Un petit écran d'information est souhaité si son coût reste raisonnable.
- Le coffret doit pouvoir être fixé sur une paroi ou clipsé sur un rail DIN.
- La première version ne comporte pas encore de connexion GTB.

## 29. Première configuration à construire

Pour le tout premier prototype sur établi, acceptes-tu que nous commencions avec un volet de soufflage et un volet de reprise, avant de vérifier ensuite le fonctionnement avec six servomoteurs ?

**Réponse :**
oui

## 30. Type de régulation

Préfères-tu que les volets prennent progressivement toutes les positions entre le minimum et 100 %, ou seulement quelques positions définies, par exemple 20 %, 50 % et 100 % ?

**Réponse :**
si c'est facile pour toi autant le faire proportionnel 

## 31. Consigne CO₂ initiale

Souhaites-tu que nous déterminions ensemble la consigne par défaut à partir des règles applicables et des essais, tout en la laissant modifiable dans l'application ?

**Réponse :**
non juste toi chosi en fonction de la réglementation 

## 32. Débit minimal

Quand l'utilisateur saisit un débit minimal en m³/h, souhaites-tu que le boîtier réalise une procédure de calibration afin de déterminer automatiquement
 la position minimale des volets ?

**Réponse :**
je sais pas 

## 33. Mesure de débit dans la première version

La mesure de débit doit-elle être présente dès le premier prototype, ou pouvons-nous d'abord valider la mesure CO₂ et la commande des volets, puis ajouter la mesure de débit dans une deuxième étape du prototype ?

**Réponse :**
non tu as raison on valide deja le CO2 c'est juste que je me disais que comme ca avec la mesure de débit pour les test tu le verra en direct au moins alors qu'avec 
simplement les volet tu doit attendre que je te dise si ca marche ou pas non ? 

## 34. Contenu de l'application initiale

Pour la première version de l'application, cette liste te convient-elle ?

- valeur CO₂ actuelle ;
- débit mesuré ;
- pourcentage d'ouverture des volets ;
- état normal ou défaut ;
- modification de la consigne CO₂ ;
- modification du débit minimal ;
- commande de test et ouverture forcée ;
- page de diagnostic réservée à l'installation.

Indique ce que tu veux ajouter ou retirer.

**Réponse :**
oui 

## 35. Historique des données

La première version doit-elle conserver un historique local du CO₂, du débit, de la position et des défauts ? Si oui, pendant combien de temps environ
 : 24 heures, 7 jours, 30 jours ou davantage ?

**Réponse :**
je sais pas 

## 36. Mise à jour du logiciel

Acceptes-tu que les premières mises à jour soient réalisées localement avec le téléphone ou un ordinateur connecté au boîtier, sans serveur Internet obligatoire ?

**Réponse :**
je veux que ca reste comme ca toujours depuis le telephone 

## 37. Objectif de coût

Même sans connaître encore le budget, dans quelle gamme aimerais-tu idéalement placer le prix de revient du boîtier final, hors volets et servomoteurs ?

- moins de 150 € ;
- entre 150 € et 300 € ;
- entre 300 € et 500 € ;
- le coût sera décidé après l'étude des solutions.

**Réponse :**
je ne saos pas en vrai le moins cher possible je pense 

## 38. Priorité principale

Classe ces critères du plus important au moins important : simplicité d'installation, prix, fiabilité, précision de régulation, apparence, évolutivité et facilité de fabrication.

**Réponse :**
simpliciter fiabilite prix 