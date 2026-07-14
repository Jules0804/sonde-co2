# Matrice réglementaire v0.1

## Objet et limites

Cette matrice identifie les textes et familles de normes susceptibles de s'appliquer au produit envisagé en France et dans l'Union européenne.

Elle constitue une base de conception, pas un certificat ni un avis juridique. L'applicabilité finale dépendra du produit figé, des marchés visés, de l'usage déclaré, de la présence effective de fonctions radio et du schéma électrique final. Elle devra être revue avec un laboratoire de préconformité avant le gel de la carte électronique.

**Date de vérification initiale :** 20 juin 2026.

## 1. Ventilation des salles de réunion en France

| Référence | Exigence ou conséquence | Application au projet | Preuve à conserver | Statut |
|---|---|---|---|---|
| Code du travail, articles R4222-1 à R4222-9 | Aération des locaux à pollution non spécifique | Le produit ne doit pas dégrader les débits hygiéniques exigés | Note de dimensionnement et notice installateur | Applicable aux lieux de travail |
| Code du travail, article R4222-6 | En ventilation mécanique, débit minimal d'air neuf de **30 m³/h par occupant** pour les locaux de réunion | Le débit minimal de la salle doit être déterminé à la mise en service d'après l'effectif et l'usage ; la régulation CO₂ ne peut pas descendre sous ce minimum | Paramètre de mise en service, rapport de mesure et fiche de salle | Applicable au premier pilote en entreprise |
| Règlement sanitaire départemental applicable au site | Peut compléter les exigences d'aération selon les locaux | Vérification à effectuer pour chaque installation | Référence du département et contrôle du dossier chantier | À vérifier par chantier |
| Règles particulières ERP, enseignement, santé, restauration, etc. | Des débits ou surveillances supplémentaires peuvent s'appliquer | Le produit devra demander le type de local ou renvoyer au dimensionnement du bureau d'études | Notice de sélection et domaines d'emploi | Hors premier pilote, à traiter avant extension du marché |

Source principale : [Code du travail, article R4222-6](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018532328/).

## 2. CO₂ et stratégie de régulation

Le CO₂ est ici un indicateur d'occupation et de confinement, pas un substitut à la conception aéraulique. Il n'existe pas, pour tous les locaux et tous les usages, une consigne légale universelle imposant exactement la même concentration.

Décisions de conception proposées :

- débit minimal prioritaire, calculé selon le local et l'effectif ;
- consigne usine CO₂ initiale : **1 000 ppm**, valeur d'ingénierie modifiable et non présentée comme un seuil légal universel ;
- plage de réglage envisagée : 800 à 1 500 ppm, à confirmer lors de l'analyse de risques ;
- alarme de confinement distincte de la consigne de régulation ;
- la notice précisera que la conformité du débit reste sous la responsabilité du dimensionnement et de la mise en service ;
- pour les marchés où une exigence relative à l'écart intérieur/extérieur est retenue, prévoir ultérieurement une entrée ou une valeur de CO₂ extérieur.

Référence informative officielle : [Surveillance réglementaire du confinement de l'air](https://www.ecologie.gouv.fr/sites/default/files/kits_communication/QAI_Plaquette%20confinement%20de%20l'air_vf.pdf). Cette publication concerne un cadre de surveillance spécifique et ne doit pas être transformée en seuil légal universel pour tous les bureaux.

## 3. Mise sur le marché du boîtier électronique

| Texte | Déclencheur | Conséquence de conception | Statut initial |
|---|---|---|---|
| Directive 2014/53/UE dite RED | Présence de Wi-Fi ou Bluetooth | Sécurité, CEM, utilisation efficace du spectre, documentation, évaluation de conformité, déclaration UE et marquage CE | Applicable si la radio est conservée |
| Règlement délégué (UE) 2022/30 modifié | Équipement radio connecté à Internet et, selon les cas, traitement de données personnelles ou financières | Exigences RED supplémentaires de cybersécurité ; application depuis le 1er août 2025 | Applicabilité exacte à confirmer selon le mode réseau final |
| Règlement (UE) 2024/2847, Cyber Resilience Act | Produit comportant des éléments numériques, mis sur le marché et connecté directement ou indirectement | Sécurité dès la conception, gestion des vulnérabilités, mises à jour, support, documentation et signalements ; application générale à partir du 11 décembre 2027, certaines obligations plus tôt | À intégrer dès maintenant puisque la commercialisation visée peut être postérieure à 2027 |
| Directive 2014/35/UE dite basse tension | Équipement alimenté entre 50 et 1 000 V AC lorsque la RED ne couvre pas le produit | Objectifs de sécurité électrique | Applicable si variante sans radio ; objectifs de sécurité repris par la RED pour la variante radio |
| Directive 2014/30/UE dite CEM | Équipement électrique/électronique lorsque la RED ne couvre pas le produit | Émissions et immunité électromagnétiques | Applicable si variante sans radio ; exigences CEM intégrées à la RED pour la variante radio |
| Directive 2011/65/UE RoHS, modifiée notamment par (UE) 2015/863 | Équipement électrique/électronique | Restriction de substances dans les composants et assemblages | Probablement applicable |
| Directive 2012/19/UE DEEE et transposition française | Équipement électrique/électronique mis sur le marché | Enregistrement, financement et marquage de fin de vie selon le rôle de producteur | Probablement applicable à la commercialisation |
| Règlement (CE) 1907/2006 REACH | Articles et substances mis sur le marché | Informations fournisseurs et substances extrêmement préoccupantes | Applicable à la chaîne d'approvisionnement |
| Règlement (UE) 2023/988 relatif à la sécurité générale des produits | Produit destiné ou susceptible d'être utilisé par des consommateurs, en complément des législations sectorielles | Traçabilité, sécurité et obligations opérateur | À confirmer selon canal de vente et utilisateurs |
| RGPD (UE) 2016/679 | Traitement de données permettant d'identifier directement ou indirectement une personne | Minimisation, information, sécurité et droits | Évitable ou fortement limité si aucune donnée personnelle ni cloud n'est utilisé |

Sources officielles :

- [Directive RED 2014/53/UE](https://eur-lex.europa.eu/eli/dir/2014/53/oj)
- [Règlement délégué (UE) 2022/30, version consolidée](https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:02022R0030-20231027)
- [Cyber Resilience Act — règlement (UE) 2024/2847](https://eur-lex.europa.eu/eli/reg/2024/2847/oj)
- [Directive basse tension 2014/35/UE](https://eur-lex.europa.eu/eli/dir/2014/35/oj)
- [Directive CEM 2014/30/UE](https://eur-lex.europa.eu/eli/dir/2014/30/oj)
- [Directive RoHS 2011/65/UE](https://eur-lex.europa.eu/eli/dir/2011/65/oj)
- [Directive DEEE 2012/19/UE](https://eur-lex.europa.eu/eli/dir/2012/19/oj)

## 4. Familles de normes à évaluer

Les éditions et amendements devront être vérifiés au moment de l'évaluation de conformité. Les normes ci-dessous sont des candidates techniques, pas encore une liste figée de normes harmonisées.

| Domaine | Normes candidates | Utilité |
|---|---|---|
| Commandes automatiques | EN IEC 60730-1 et parties particulières pertinentes | Sécurité des dispositifs de commande électrique automatiques |
| Équipements de mesure/commande | EN IEC 61010-1, si retenue comme famille produit par le laboratoire | Alternative ou complément selon classification du produit |
| Radio 2,4 GHz | ETSI EN 300 328 | Utilisation du spectre Wi-Fi/Bluetooth |
| CEM radio | ETSI EN 301 489-1 et EN 301 489-17 | Compatibilité électromagnétique des équipements radio |
| Exposition humaine | EN IEC 62311 ou norme radio harmonisée équivalente | Évaluation de l'exposition aux champs électromagnétiques |
| Cybersécurité radio | EN 18031-1/-2/-3 selon applicabilité | Présomption de conformité potentielle aux exigences RED cybersécurité, sous réserve des restrictions publiées et de la configuration finale |
| Enveloppes | EN 60529 | Indice de protection IP annoncé |
| Environnement | EN IEC 60068, essais sélectionnés | Température, humidité, vibrations et transport selon le domaine d'emploi |
| Ventilation non résidentielle | EN 16798-1 et EN 16798-3 | Paramètres d'ambiance, ventilation et performance des systèmes |
| Réception des installations | EN 12599 | Mesures, essais et réception des systèmes de ventilation |

## 5. Exclusions de domaine d'emploi à inscrire

La version 1 ne doit pas être présentée ni utilisée comme :

- dispositif de détection de gaz destiné à protéger contre une atmosphère dangereuse ;
- système de sécurité incendie ;
- commande de clapets coupe-feu ou de désenfumage ;
- équipement ATEX ;
- dispositif médical ;
- garantie autonome de conformité de la ventilation d'un bâtiment sans étude et mesure de mise en service.

Ces exclusions devront apparaître dans le cahier des charges, la notice et l'analyse de risques.

## 6. Dossier de conformité à préparer dès la conception

- description générale et usage prévu ;
- variantes et identification du produit ;
- schémas électriques, PCB et nomenclature ;
- plans du coffret et matériaux ;
- analyse de risques ;
- architecture logicielle et mesures de cybersécurité ;
- rapports de calcul et de tests ;
- liste des normes appliquées ;
- rapports de préconformité et de laboratoire ;
- notices installateur/utilisateur ;
- étiquetage et traçabilité ;
- déclaration UE de conformité ;
- politique de support, mises à jour et vulnérabilités ;
- preuves RoHS/REACH des fournisseurs ;
- obligations françaises de producteur DEEE et emballages avant commercialisation.

## 7. Décisions à confirmer avant gel matériel

1. Radio permanente dans chaque produit ou accessoire de mise en service amovible.
2. Wi-Fi limité au point d'accès local ou possibilité de rejoindre Internet.
3. Classe électrique et stratégie d'isolation du 230 V.
4. Famille de norme de sécurité principale retenue avec le laboratoire.
5. Indice IP et environnement annoncé.
6. Durée de support logiciel et processus de traitement des vulnérabilités.
7. Marchés exacts : France uniquement ou Union européenne.

