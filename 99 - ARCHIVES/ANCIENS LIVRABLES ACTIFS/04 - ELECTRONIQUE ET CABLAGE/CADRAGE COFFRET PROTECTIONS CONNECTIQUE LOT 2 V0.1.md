# Cadrage coffret protections connectique lot 2 v0.1

## 1. Objet

Définir le besoin minimal du lot 2 côté coffret, protections et connectique avant achat des moteurs et de l'alimentation 24 V. Ce document ne constitue pas encore un schéma d'exécution secteur : il sert à préparer une sélection propre et à éviter un coffret trop petit ou dangereux.

## 2. Architecture retenue pour le lot 2

La direction actuelle reste :

- entrée 230 V AC ;
- alimentation 24 V DC pour les servomoteurs ;
- convertisseur 24 V vers 5 V pour la logique ;
- six départs moteurs 24 V possibles à terme ;
- commande commune 0/2-10 V ;
- séparation physique entre zone secteur, zone 24 V puissance et zone logique/capteurs.

Le lot 2 ne doit pas mélanger cette architecture avec une distribution moteurs 230 V tant que la décision 24 V n'est pas réouverte.

## 3. Fonctions à intégrer dans le coffret

| Fonction | Élément à prévoir | Statut |
|---|---|---|
| Arrivée secteur | Bornier L/N/PE ou L/N selon classe retenue | À choisir |
| Sectionnement local | Interrupteur ou sectionneur accessible | À choisir |
| Protection entrée | Fusible/disjoncteur adapté à l'alimentation | À dimensionner |
| Alimentation moteurs | 24 V DC, 60 W pressentie | Papier OK, essai réel requis |
| Alimentation logique | 24 V -> 5 V puis 3,3 V | À intégrer |
| Départs moteurs | 6 départs G/G0/Y, éventuellement U retour | À prévoir même si banc 2 moteurs |
| Protection départs 24 V | Fusible par départ ou distribution protégée | À choisir |
| Signal 0-10 V | Bornier séparé, référence 0 V commune | À protéger |
| Service | Bouton service et LED état | À implanter |
| Maintenance | Repérage, accès bornes, dégagement fils | À prévoir |

## 4. Dimension de coffret à viser

Pour un premier banc propre, éviter le mini-coffret. Le coffret doit laisser de la place pour :

- alimentation 24 V rail DIN ;
- convertisseur 5 V ;
- borniers secteur ;
- borniers six moteurs ;
- protections ;
- contrôleur basse tension ;
- presse-étoupes ;
- rayon de courbure des câbles ;
- séparation entre secteur et basse tension.

Recommandation papier : **coffret rail DIN isolant, environ 12 modules minimum**, ou volume équivalent si boîtier non modulaire.

À ne pas retenir pour le lot 2 :

- boîtier imprimé 3D contenant du 230 V ;
- boîte sans rail ni maintien mécanique ;
- borniers volants ;
- secteur et logique dans le même faisceau ;
- sorties 0-10 V accessibles sans repérage.

## 5. Connectique provisoire

| Connecteur | Usage | Contraintes |
|---|---|---|
| X1 | Arrivée secteur | Incompatible physiquement avec basse tension |
| X2 à X7 | Départs moteurs 1 à 6 | 24 V, 0 V, Y 0-10 V, éventuellement U |
| X8 | Tête CO2 / capteur | Basse tension uniquement, repéré |
| X9 | Service / LED / bouton | Basse tension uniquement |
| TP0/TP1/TP2 | Mesures GND, VOUT0, VOUT1 | Accessibles multimètre, non accessibles utilisateur final |

Les borniers moteurs doivent être repérés pour éviter d'envoyer le 24 V sur l'entrée Y 0-10 V.

## 6. Protections à trancher avant achat

| Point | Choix provisoire | Preuve attendue |
|---|---|---|
| Protection entrée 230 V | Fusible ou disjoncteur adapté à PS1 | Fiche alimentation + courant d'appel |
| Protection 24 V globale | Selon alimentation et câblage | Essai court-circuit contrôlé ou fiche |
| Protection par moteur | Préférable pour isoler un défaut câble/moteur | Courant moteur réel + section câble |
| Protection 0-10 V | Résistance série / limitation / buffer futur PCB | Essai court-circuit sortie |
| Protection inversion | Repérage + connecteur détrompé si possible | Revue câblage |
| Terre / classe | Classe II privilégiée si coffret isolant, classe I si métal | Choix coffret et alimentation |

## 7. Critères de sélection du coffret

| Critère | Minimum lot 2 |
|---|---|
| Matière | Isolante, adaptée usage électrique |
| Montage | Rail DIN ou platine interne |
| Fermeture | Capot vissé ou porte, pas d'accès direct aux bornes secteur |
| Indice IP | À choisir selon lieu d'essai, IP20 atelier minimum, plus si local technique poussiéreux |
| Entrées câbles | Presse-étoupes ou passe-câbles serrés |
| Séparation interne | Secteur éloigné logique/capteurs |
| Repérage | Étiquettes X1, X2... et avertissement secteur |
| Évolutivité | Place pour six départs même si seulement deux moteurs au banc |

## 8. Critères d'autorisation du lot 2

Le lot 2 peut être soumis à validation seulement quand :

1. le registre réel ou le diamètre retenu est confirmé ;
2. le couple moteur est cohérent avec le registre ;
3. le tarif moteur professionnel est connu ;
4. l'alimentation 24 V est confirmée ;
5. le coffret a assez de volume pour les six départs ;
6. la protection entrée et les protections 24 V sont choisies ;
7. le schéma de principe est mis à jour avec repères X/F/PS/M ;
8. la mise sous tension 230 V est relue avant essai.

## 9. Décision provisoire

Ne pas acheter le coffret en même temps que les moteurs si ses dimensions ne sont pas confirmées. Le bon ordre est :

1. recevoir et qualifier le lot 1 ;
2. choisir le registre DN200/DN250 ;
3. confirmer moteur/alimentation ;
4. dimensionner le coffret avec les vraies pièces ;
5. acheter le lot 2 complet.

Avant toute mise sous tension secteur du lot 2, utiliser :

`04 - ELECTRONIQUE ET CABLAGE\REVUE SECURITE AVANT MISE SOUS TENSION 230V LOT 2.md`
