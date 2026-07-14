# Prompt de reprise Codex

Copier-coller ce prompt dans Codex si le projet est deplace sur un autre ordinateur ou si une nouvelle session doit reprendre le travail.

---

Tu reprends le projet `9 - PROJET REGULATION VENTILATION CO2`.

Objectif du projet : concevoir et realiser un systeme de regulation de ventilation pour salles de reunion. Le systeme mesure le CO2, pilote des volets motorises via signal 0-10 V, propose une interface web locale accessible depuis telephone, enregistre les donnees et gere les pannes.

Regles de travail importantes :

- Travaille uniquement dans le dossier du projet, sauf demande explicite.
- Ne cree pas beaucoup de documents. Priorite au code, aux essais, aux schemas utiles et aux notices courtes.
- Avance par petites parties concretes.
- Utilise Git proprement : une branche ou un commit par objectif limite.
- Avant un commit important, lance `00 - PILOTAGE DU PROJET\VERIFIER PROJET.cmd --no-pause`.
- Si un fichier ancien existe en archive, ne le remets pas dans le flux actif sauf vraie necessite.
- Ne pars pas dans une conception theorique longue : le projet doit rester comprehensible et testable.

Etat structurel actuel :

- Branche de rangement : `organisation/clarte-projet`.
- Derniers commits connus :
  - `a6d4a8c chore: rename application folder to local web interface`
  - `151e66c chore: clarify project structure and archive old deliverables`
  - `4736402 test: add installer login to embedded web prototype`
  - `95213b9 test: expand embedded wifi web interface`
  - `39ef4ab test: add permanent wifi ap web prototype`

Organisation a respecter :

- `00 - PILOTAGE DU PROJET` : suivi, decisions, verification globale.
- `04 - ELECTRONIQUE ET CABLAGE` : cablage Wemos, sonde CO2, DAC 0-10 V.
- `06 - LOGICIEL EMBARQUE` : firmware ESP32 / Wemos S2 Mini, essais PlatformIO, serveur web embarque.
- `07 - INTERFACE WEB LOCALE` : maquette des ecrans web cote telephone. Ce n'est pas une application App Store / Play Store.
- `08 - PROTOTYPES ET ESSAIS` : protocoles, mesures, depannage.
- `09 - ACHATS ET COUTS` : panier, nomenclature, budget.
- `99 - ARCHIVES` : anciens livrables conserves pour historique, a ne pas remettre en avant sans raison.

Choix techniques actuels :

- Carte actuellement utilisee : Wemos S2 Mini, ESP32-S2.
- Le Wi-Fi de service doit etre desactive par defaut dans le produit final et active par bouton.
- Pour les essais actuels, une interface web locale peut etre servie par la carte.
- L'interface telephone est une page web locale, pas une application mobile native.
- La maquette PC de l'interface est dans `07 - INTERFACE WEB LOCALE\maquette-web-locale`.
- Le firmware et les tests materiels sont dans `06 - LOGICIEL EMBARQUE\firmware-esp32`.
- La sonde CO2 prevue est une DFRobot SEN0536 / SCD41.
- Le DAC 0-10 V prevu est le DFRobot DFR0971.
- I2C prevu sur Wemos S2 Mini : GPIO33 en SDA, GPIO35 en SCL, avec 3V3 et GND.
- Une sortie DAC 0-10 V ne doit jamais etre raccordee directement a une broche ESP32.
- Pour 6 volets 0-10 V independants, il faudra probablement 3 modules DAC 2 voies ou une future carte dediee equivalente.

Etat materiel / essais :

- La Wemos S2 Mini a deja ete identifiee et flashee avec PlatformIO.
- Un test LED GPIO39 a fonctionne.
- Un firmware de test Wi-Fi AP + page web locale a ete flashe.
- Reseau de test connu : `VENT-CO2-TEST`.
- Mot de passe de test connu : `ventco2test`.
- Adresse habituelle AP ESP32 : `http://192.168.4.1`.
- Mot de passe installateur de prototype web embarque : `admin1234`.
- Ces identifiants sont uniquement pour le prototype, pas pour le produit final.

Commande materiel en cours / a verifier :

- Commander ou recevoir :
  - sonde CO2 DFRobot SEN0536 ;
  - DAC DFRobot DFR0971 0-10 V.
- Optionnel selon stock atelier : fils Dupont, breadboard, resistances 10 kOhm / 47 kOhm / 100 kOhm.
- Ne pas commander les moteurs, alimentations ou coffrets definitifs tant que les essais sonde + DAC ne sont pas valides.

Premiere action recommandee apres reprise :

1. Ouvrir `README.md` a la racine du projet.
2. Verifier l'etat Git avec `git status --short --branch`.
3. Lancer `00 - PILOTAGE DU PROJET\VERIFIER PROJET.cmd --no-pause`.
4. Demander a Jules ce qu'il veut attaquer maintenant entre :
   - reception et test de la sonde CO2 ;
   - test du DAC 0-10 V au multimetre ;
   - integration firmware I2C sonde + DAC ;
   - schema de cablage propre du banc d'essai.

Style attendu par Jules :

- Reponses courtes, directes, pratiques.
- Pas de blabla inutile.
- Ne pas generer plein de documents.
- Dire clairement ce qui est fait, ce qui reste a faire et quoi brancher/tester.
- Travailler comme un ingenieur senior : petites validations, Git propre, pas de travail dans le vide.

