# Matrice de traçabilité v0.1

| ID | Exigence | Source | Conception prévue | Preuve attendue | État |
|---|---|---|---|---|---|
| E-001 | Un boîtier autonome par salle | Cahier §2 | Architecture A | Schéma + essai autonome | Conçue |
| E-002 | Jusqu'à six moteurs parallèles | Cahier §2/4.2 | Six départs 24 V, Y commun, charge équivalente ≥ 10 kΩ | Essai résistif 10 kΩ puis six moteurs | Modèle/protocole/analyseur créés ; matériel à tester |
| E-003 | Mesure CO₂ sur reprise dédiée | Cahier §2/4.1 | Tête déportée remplaçable | Comparaison mesure de référence | Conçue |
| E-004 | Régulation proportionnelle | Cahier §4.2 | 0–10 V et algorithme PI/segmenté | Courbes de banc | Algorithme vérifié en simulation ; netlist et points de mesure préparés ; banc à tester |
| E-005 | Débit minimal prioritaire | Code du travail R4222-6 + cahier §3 | Minimum protégé par mise en service | Rapport de débit | Conçue |
| E-006 | 30 m³/h/personne en local de réunion de travail | R4222-6 | Paramètre effectif/débit de projet | Fiche de salle | Vérifiée réglementairement |
| E-007 | Fonctionnement hors Internet/réseau | Cahier §3/4.4 | Régulation locale | Essai réseau coupé | Indépendance Wi-Fi/régulation testée en simulation ; matériel à tester |
| E-008 | Configuration téléphone | Cahier §4.4 | Web locale Wi-Fi | Essais Android/iOS | Prototype PWA/API réalisé ; appareils à tester |
| E-009 | Mise à jour depuis téléphone | Cahier §4.4 | Mise à jour signée + rollback | Essai de coupure | Conçue |
| E-010 | Défaut critique sous tension = 100 % | D-005 | Repli logiciel + watchdog matériel | Injection blocage/sonde | Repli logiciel testé en simulation ; ordre de démarrage et mesure 10 V documentés ; chemin matériel à réaliser |
| E-011 | Pas de rappel mécanique sur coupure totale | D-004 | Actuateurs standards autorisés | Revue nomenclature | Validée |
| E-012 | Mesure de débit reprise | Cahier §4.3 | ΔP + organe K connu | Étalonnage | Architecture conçue |
| E-013 | Entrée 230 V | Cahier §2 | Alimentation isolée intégrée | Essais sécurité | Architecture conçue |
| E-014 | Application simple | Entretien + cahier | Écrans essentiels uniquement | Test utilisateur | Prototype réalisé et direction visuelle validée ; essai utilisateur à faire |
| E-015 | Produit commercialisable | Objectif | Dossier de conformité complet | Rapports, déclaration UE | À réaliser |
| E-016 | Cybersécurité radio | RED/2022-30/CRA | Secrets uniques, secure boot, MAJ signées | Audit et essais | Session/CSRF/limitation testés en simulation ; firmware signé et matériel à réaliser |
| E-017 | Pas de clapet incendie/ATEX | Cahier §12 | Exclusions documentées | Notice et étiquette | Intégrée |
| E-018 | Installation mur/rail DIN | Cahier §2 | Boîtier compatible double fixation | Prototype mécanique | À concevoir |
| E-019 | Sonde remplaçable | Cahier §4.1 | Connecteur détrompé et identité capteur | Essai maintenance | Conçue |
| E-020 | Évolutivité GTB | D-006 | Réserve RS-485/logicielle | Revue PCB | Architecture prévue |
| E-021 | Conservation sûre des réglages après coupure | Cahier §3/11 | Deux copies versionnées, génération et CRC32 | Injection corruption + coupures réelles | Format et coupures testés en simulation ; C++/NVS et matériel à réaliser |
| E-022 | Historique local et journal de diagnostic | Cahier §4.4/7 | Anneaux compacts, rétention bornée, aucune donnée personnelle | Capacité, export, coupures et endurance | Formats/capacité/API testés en simulation ; flash matériel à réaliser |
