import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pilotageDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.dirname(pilotageDir);
const purchasesDir = path.join(projectDir, '09 - ACHATS ET COUTS');
const mechanicsDir = path.join(projectDir, '05 - MECANIQUE ET AERAULIQUE');
const wiringDir = path.join(projectDir, '04 - ELECTRONIQUE ET CABLAGE');
const testsDir = path.join(projectDir, '08 - PROTOTYPES ET ESSAIS');
const firmwareDir = path.join(projectDir, '06 - LOGICIEL EMBARQUE');
const archiveActiveDir = path.join(projectDir, '99 - ARCHIVES', 'ANCIENS LIVRABLES ACTIFS');

const resolveProjectFile = (...segments) => {
  const activePath = path.join(projectDir, ...segments);
  if (fs.existsSync(activePath)) return activePath;
  const archivedPath = path.join(archiveActiveDir, ...segments);
  if (fs.existsSync(archivedPath)) return archivedPath;
  return activePath;
};

const requiredFiles = [
  resolveProjectFile('09 - ACHATS ET COUTS', 'MATRICE DE CHOIX PONDEREE PHASE 2 V0.1.md'),
  path.join(purchasesDir, 'NOMENCLATURE DU PREMIER BANC V0.1.md'),
  resolveProjectFile('09 - ACHATS ET COUTS', 'NOMENCLATURE CIBLE PROVISOIRE PRODUIT V0.1.md'),
  path.join(purchasesDir, 'BUDGET DU PREMIER BANC V0.1.md'),
  resolveProjectFile('09 - ACHATS ET COUTS', 'COMPARAISON ACTIONNEURS ET DIMENSIONNEMENT LOT 2 V0.2.md'),
  resolveProjectFile('09 - ACHATS ET COUTS', 'MODELE DEMANDE DEVIS LOT 2.md'),
  path.join(purchasesDir, 'TABLEAU COMPARAISON DEVIS LOT 2.csv'),
  resolveProjectFile('09 - ACHATS ET COUTS', 'README COMPARAISON DEVIS LOT 2.md'),
  path.join(purchasesDir, 'LISTE D ACHAT LOT 1 A VALIDER.md'),
  resolveProjectFile('09 - ACHATS ET COUTS', 'FICHE RECEPTION COMMANDE LOT 1.md'),
  resolveProjectFile('00 - PILOTAGE DU PROJET', 'AUDIT PHASE 2 V0.1.md'),
  resolveProjectFile('00 - PILOTAGE DU PROJET', 'ORDRE EXECUTION RECEPTION ET ESSAIS LOT 1.md'),
  resolveProjectFile('00 - PILOTAGE DU PROJET', 'CHECKLIST GO NO-GO LOT 2 AVANT ACHAT.md'),
  resolveProjectFile('00 - PILOTAGE DU PROJET', 'REVUE FIN LOT 1 - PASSAGE LOT 2.md'),
  resolveProjectFile('00 - PILOTAGE DU PROJET', 'FEUILLE DE ROUTE POST LOT 1 VERS LOT 2.md'),
  resolveProjectFile('05 - MECANIQUE ET AERAULIQUE', 'SELECTION REGISTRE ET GAINE DU BANC V0.1.md'),
  resolveProjectFile('05 - MECANIQUE ET AERAULIQUE', 'FICHE RELEVE REGISTRE ET GAINE V0.1.md'),
  path.join(mechanicsDir, 'CAO SONDE SEN0536 - README V0.1.md'),
  resolveProjectFile('04 - ELECTRONIQUE ET CABLAGE', 'CADRAGE COFFRET PROTECTIONS CONNECTIQUE LOT 2 V0.1.md'),
  resolveProjectFile('08 - PROTOTYPES ET ESSAIS', 'PLAN PREMIER ALLUMAGE LOT 1 V0.1.md'),
  resolveProjectFile('08 - PROTOTYPES ET ESSAIS', 'PROTOCOLE ESSAI COURT SCD41 30 MIN V0.1.md'),
  resolveProjectFile('08 - PROTOTYPES ET ESSAIS', 'PROTOCOLE ESSAI IMPLANTATION SONDE CO2 EN GAINE V0.1.md'),
  resolveProjectFile('08 - PROTOTYPES ET ESSAIS', 'MODELE RAPPORT ESSAI IMPLANTATION SONDE CO2 EN GAINE.md'),
  resolveProjectFile('08 - PROTOTYPES ET ESSAIS', 'PROTOCOLE ESSAI DAC DFR0971 A VIDE V0.1.md'),
  resolveProjectFile('08 - PROTOTYPES ET ESSAIS', 'MODELE RAPPORT RECEPTION LOT 1.md'),
  path.join(testsDir, 'GUIDE DEPANNAGE LOT 1.md'),
  path.join(testsDir, 'capturer-serie-csv.ps1'),
  path.join(testsDir, 'lister-ports-serie.ps1'),
  resolveProjectFile('08 - PROTOTYPES ET ESSAIS', 'README CAPTURE SERIE CSV LOT 1.md'),
  resolveProjectFile('06 - LOGICIEL EMBARQUE', 'arduino-outils', 'README OUTILS ARDUINO LOT 1.md'),
  path.join(firmwareDir, 'arduino-outils', 'scan_i2c_lot1', 'scan_i2c_lot1.ino'),
  path.join(firmwareDir, 'arduino-outils', 'lecture_scd41_csv', 'lecture_scd41_csv.ino'),
  path.join(firmwareDir, 'arduino-outils', 'test_dfr0971_csv', 'test_dfr0971_csv.ino'),
];

const missing = requiredFiles.filter((filePath) => !fs.existsSync(filePath));
if (missing.length > 0) {
  throw new Error(`Livrables manquants :\n${missing.join('\n')}`);
}

const matrix = fs.readFileSync(requiredFiles[0], 'utf8');
const weights = [20, 20, 15, 15, 10, 10, 10];
const checkedRows = [];

for (const line of matrix.split(/\r?\n/)) {
  const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
  if (cells.length !== 10) continue;
  const notes = cells.slice(1, 8).map((cell) => Number(cell));
  const displayed = Number(cells[8].replaceAll('*', ''));
  if (!notes.every((note) => Number.isInteger(note) && note >= 0 && note <= 5)) continue;
  if (!Number.isFinite(displayed)) continue;
  const calculated = notes.reduce((sum, note, index) => sum + (note / 5) * weights[index], 0);
  if (Math.abs(calculated - displayed) > 0.001) {
    throw new Error(`${cells[0]} : score affiché ${displayed}, score calculé ${calculated}.`);
  }
  checkedRows.push(cells[0]);
}

if (checkedRows.length < 10) {
  throw new Error(`Seulement ${checkedRows.length} solutions pondérées reconnues ; matrice probablement incomplète.`);
}

const prototypeBom = fs.readFileSync(path.join(purchasesDir, 'NOMENCLATURE DU PREMIER BANC V0.1.md'), 'utf8');
const budget = fs.readFileSync(path.join(purchasesDir, 'BUDGET DU PREMIER BANC V0.1.md'), 'utf8');
const decisionRegister = fs.readFileSync(path.join(pilotageDir, 'REGISTRE DES DECISIONS.md'), 'utf8');

for (const [name, content] of [['nomenclature', prototypeBom], ['budget', budget], ['registre', decisionRegister]]) {
  if (!content.includes('533,03 €')) throw new Error(`${name} : total de base 533,03 € absent.`);
  if (content.includes('540,23 €') || content.includes('594,25 €')) {
    throw new Error(`${name} : ancien total incluant l'afficheur encore présent.`);
  }
}

if (!prototypeBom.includes('Option non incluse')) {
  throw new Error("La nomenclature ne marque pas clairement l'afficheur comme option non incluse.");
}

const contentChecks = [
  {
    file: resolveProjectFile('05 - MECANIQUE ET AERAULIQUE', 'SELECTION REGISTRE ET GAINE DU BANC V0.1.md'),
    label: 'selection registre',
    tokens: ['DN200', 'DN250', '300 m3/h', 'couple'],
  },
  {
    file: resolveProjectFile('04 - ELECTRONIQUE ET CABLAGE', 'CADRAGE COFFRET PROTECTIONS CONNECTIQUE LOT 2 V0.1.md'),
    label: 'cadrage coffret',
    tokens: ['X1', 'X9', '24 V', '230 V', 'protection'],
  },
  {
    file: resolveProjectFile('08 - PROTOTYPES ET ESSAIS', 'PLAN PREMIER ALLUMAGE LOT 1 V0.1.md'),
    label: 'premier allumage',
    tokens: ['0x62', '0x58', 'sans moteur', 'sans 24 V'],
  },
  {
    file: resolveProjectFile('08 - PROTOTYPES ET ESSAIS', 'MODELE RAPPORT RECEPTION LOT 1.md'),
    label: 'rapport reception',
    tokens: ['Port COM', 'SDA/SCL', 'Premier scan', '10 kΩ'],
  },
  {
    file: path.join(firmwareDir, 'arduino-outils', 'scan_i2c_lot1', 'scan_i2c_lot1.ino'),
    label: 'scanner i2c',
    tokens: ['ADDR_DFR0971', '0x58', 'ADDR_SCD41', '0x62'],
  },
  {
    file: path.join(firmwareDir, 'arduino-outils', 'lecture_scd41_csv', 'lecture_scd41_csv.ino'),
    label: 'lecture scd41 csv',
    tokens: ['CMD_START_PERIODIC_MEASUREMENT', 'CMD_READ_MEASUREMENT', 'timestamp_iso,uptime_s,sequence,co2_ppm', 'crc_co2'],
  },
  {
    file: resolveProjectFile('08 - PROTOTYPES ET ESSAIS', 'PROTOCOLE ESSAI COURT SCD41 30 MIN V0.1.md'),
    label: 'protocole court scd41',
    tokens: ['30 minutes', '0x62', 'respiration', 'mesures_scd41_30min.csv'],
  },
  {
    file: resolveProjectFile('08 - PROTOTYPES ET ESSAIS', 'PROTOCOLE ESSAI IMPLANTATION SONDE CO2 EN GAINE V0.1.md'),
    label: 'protocole implantation sonde co2 gaine',
    tokens: ['gaine', 'Référence hors gaine', 'mesures_scd41_gaine_30min.csv', 'ACCEPTÉE POUR BANC'],
  },
  {
    file: resolveProjectFile('08 - PROTOTYPES ET ESSAIS', 'MODELE RAPPORT ESSAI IMPLANTATION SONDE CO2 EN GAINE.md'),
    label: 'modele rapport implantation sonde co2 gaine',
    tokens: ['Photos à joindre', 'Fichiers CSV', 'Observations mécaniques', 'Écarts et actions CAO', 'ACCEPTÉE POUR BANC'],
  },
  {
    file: path.join(testsDir, 'GUIDE DEPANNAGE LOT 1.md'),
    label: 'guide depannage lot 1',
    tokens: ['Aucun port COM visible', 'Scan I²C', 'Lecture SCD41', 'DAC DFR0971', 'Capture CSV vide'],
  },
  {
    file: path.join(firmwareDir, 'arduino-outils', 'test_dfr0971_csv', 'test_dfr0971_csv.ino'),
    label: 'test dfr0971 csv',
    tokens: ['DFR0971_ADDR', 'RANGE_10V', 'REG_CH0', 'REG_CH1', 'timestamp_iso,channel,command_percent'],
  },
  {
    file: resolveProjectFile('06 - LOGICIEL EMBARQUE', 'arduino-outils', 'README OUTILS ARDUINO LOT 1.md'),
    label: 'readme outils arduino lot 1',
    tokens: ['scan_i2c_lot1', 'lecture_scd41_csv', 'test_dfr0971_csv', 'Aucun moteur', 'Aucun 24 V'],
  },
  {
    file: resolveProjectFile('08 - PROTOTYPES ET ESSAIS', 'PROTOCOLE ESSAI DAC DFR0971 A VIDE V0.1.md'),
    label: 'protocole dac vide',
    tokens: ['0, 2, 5, 8, 10 V', 'mesures_dac.csv', '≤ 0,10 V', 'aucun moteur'],
  },
  {
    file: path.join(testsDir, 'capturer-serie-csv.ps1'),
    label: 'capture serie csv',
    tokens: ['SerialPort', 'DurationMinutes', 'ReadLine', 'StreamWriter'],
  },
  {
    file: path.join(testsDir, 'lister-ports-serie.ps1'),
    label: 'liste ports serie',
    tokens: ['SerialPort', 'GetPortNames', 'Wemos', 'capturer-serie-csv.ps1'],
  },
  {
    file: resolveProjectFile('08 - PROTOTYPES ET ESSAIS', 'README CAPTURE SERIE CSV LOT 1.md'),
    label: 'readme capture serie',
    tokens: ['mesures_scd41_30min.csv', 'mesures_scd41_24h.csv', 'mesures_dac.csv', 'COM5'],
  },
  {
    file: resolveProjectFile('00 - PILOTAGE DU PROJET', 'CHECKLIST GO NO-GO LOT 2 AVANT ACHAT.md'),
    label: 'checklist go no-go lot 2',
    tokens: ['NO-GO', 'lot 1', 'registre', '10 kΩ', 'coffret', 'validation finale de Jules', 'REVUE FIN LOT 1'],
  },
  {
    file: resolveProjectFile('00 - PILOTAGE DU PROJET', 'REVUE FIN LOT 1 - PASSAGE LOT 2.md'),
    label: 'revue fin lot 1',
    tokens: ['PASSAGE LOT 2', 'Scan I²C', 'DAC à vide', 'charge 10 kΩ', 'validation finale de Jules'],
  },
  {
    file: resolveProjectFile('00 - PILOTAGE DU PROJET', 'ORDRE EXECUTION RECEPTION ET ESSAIS LOT 1.md'),
    label: 'ordre execution lot 1',
    tokens: ['Réceptionner le colis', 'Premier scan I²C', 'Essai CO₂ court', 'Essai DAC à vide', 'REVUE FIN LOT 1'],
  },
  {
    file: resolveProjectFile('00 - PILOTAGE DU PROJET', 'FEUILLE DE ROUTE POST LOT 1 VERS LOT 2.md'),
    label: 'feuille de route post lot 1',
    tokens: ['P2B-01', 'P2B-10', 'registre', 'devis', 'validation finale de Jules'],
  },
  {
    file: resolveProjectFile('09 - ACHATS ET COUTS', 'FICHE RECEPTION COMMANDE LOT 1.md'),
    label: 'fiche reception commande lot 1',
    tokens: ['SEN0536', 'DFR0971', 'PHOTOS LOT 1', 'CONFORME', 'SOUS RÉSERVE', 'REFUSÉ'],
  },
  {
    file: resolveProjectFile('09 - ACHATS ET COUTS', 'MODELE DEMANDE DEVIS LOT 2.md'),
    label: 'modele demande devis lot 2',
    tokens: ['GDB161.1E', '24 V', '0/2-10 V', 'coffret', 'validation finale de Jules'],
  },
  {
    file: path.join(purchasesDir, 'TABLEAU COMPARAISON DEVIS LOT 2.csv'),
    label: 'tableau comparaison devis lot 2',
    tokens: ['fournisseur', 'famille', 'prix_total_ttc', 'compatibilite_24v', 'decision'],
  },
  {
    file: resolveProjectFile('09 - ACHATS ET COUTS', 'README COMPARAISON DEVIS LOT 2.md'),
    label: 'readme comparaison devis lot 2',
    tokens: ['moteur', 'alimentation_24v', 'retenu_pour_budget', 'validation finale de Jules'],
  },
];

for (const check of contentChecks) {
  const content = fs.readFileSync(check.file, 'utf8');
  const missingTokens = check.tokens.filter((token) => !content.includes(token));
  if (missingTokens.length) {
    throw new Error(`${check.label} : marqueurs manquants (${missingTokens.join(', ')}).`);
  }
}

console.log(`Phase 2 cohérente : ${requiredFiles.length} livrables présents, ${checkedRows.length} scores vérifiés, budget de base 533,03 € hors afficheur, cadrages lot 2 et réception lot 1 présents.`);
