# README capture série CSV lot 1

## Objet

Capturer automatiquement les lignes CSV envoyées par la Wemos ESP32-C3 pendant les essais du lot 1.

Outils :

- `lister-ports-serie.ps1` : identifier le port COM de la Wemos ;
- `capturer-serie-csv.ps1` : enregistrer les lignes série dans un fichier CSV.

Ces outils évitent le copier-coller depuis le moniteur série Arduino et conservent une trace brute directement exploitable par les analyseurs.

## Préparation

1. Charger le sketch Arduino voulu.
2. Fermer le moniteur série Arduino, sinon le port COM sera déjà utilisé.
3. Ouvrir PowerShell dans :

   `08 - PROTOTYPES ET ESSAIS`

4. Identifier le port COM.

## Identifier le port COM

Lancer :

```powershell
.\lister-ports-serie.ps1
```

Méthode simple :

1. lancer le script Wemos débranchée ;
2. brancher la Wemos ;
3. relancer le script ;
4. le nouveau port apparu est celui à utiliser.

Exemple : si `COM5` apparaît après branchement, utiliser `-Port COM5` dans les captures.

## Capture essai court SCD41 30 min

Exemple :

```powershell
.\capturer-serie-csv.ps1 -Port COM5 -Output .\mesures_scd41_30min.csv -DurationMinutes 30
```

Après capture, ouvrir le CSV et vérifier :

- présence de l'en-tête ;
- une ligne toutes les 5 secondes environ ;
- `read_ok` majoritairement à `1` ;
- pas de redémarrage évident.

## Capture essai SCD41 24 h

Exemple :

```powershell
.\capturer-serie-csv.ps1 -Port COM5 -Output .\mesures_scd41_24h.csv -DurationMinutes 1440
```

Analyse ensuite :

```powershell
node .\analyser-reception.mjs .\mesures_scd41_24h.csv
```

## Capture essai DAC DFR0971

Exemple :

```powershell
.\capturer-serie-csv.ps1 -Port COM5 -Output .\mesures_dac.csv -DurationMinutes 10
```

Le fichier généré contient les consignes. Il faut ensuite compléter au multimètre :

- `measured_v` ;
- `absolute_error_v` ;
- `relative_error_percent` si utile ;
- modèle du multimètre.

Analyse ensuite :

```powershell
node .\analyser-reception.mjs .\mesures_dac.csv
```

## Points d'attention

- Un seul logiciel peut ouvrir le port COM à la fois.
- Si aucune ligne n'est capturée, vérifier le port COM, le baudrate 115200 et le sketch chargé.
- Ne pas modifier les fichiers CSV bruts après essai sans garder une copie originale.
- Pour un essai officiel, noter le nom du fichier dans `MODELE RAPPORT RECEPTION LOT 1.md`.
