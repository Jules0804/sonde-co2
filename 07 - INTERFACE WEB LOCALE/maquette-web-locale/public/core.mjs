export const CONFIG_LIMITS = Object.freeze({
  targetPpm: [800, 1400],
  minOutputPct: [0, 80],
  maxOutputPct: [50, 100],
  highAlarmPpm: [1200, 2500],
});

export function validateConfig(candidate, { strict = false } = {}) {
  const errors = {};
  const expectedKeys = Object.keys(CONFIG_LIMITS).sort();
  if (strict) {
    const actualKeys = candidate && typeof candidate === "object" && !Array.isArray(candidate) ? Object.keys(candidate).sort() : [];
    if (JSON.stringify(actualKeys) !== JSON.stringify(expectedKeys)) errors._schema = "Les champs de configuration ne correspondent pas au schéma attendu.";
  }
  for (const [key, [min, max]] of Object.entries(CONFIG_LIMITS)) {
    const raw = candidate?.[key];
    const value = strict ? raw : Number(raw);
    const integerRequired = key === "targetPpm" || key === "highAlarmPpm";
    const precisionValid = integerRequired ? Number.isInteger(value) : Math.abs(value * 10 - Math.round(value * 10)) < 1e-9;
    if (!Number.isFinite(value) || (strict && typeof raw !== "number") || !precisionValid || value < min || value > max) {
      errors[key] = `Valeur attendue entre ${min} et ${max}.`;
    }
  }
  if (!errors.minOutputPct && !errors.maxOutputPct &&
      Number(candidate.minOutputPct) >= Number(candidate.maxOutputPct)) {
    errors.minOutputPct = "Le minimum doit rester inférieur au maximum.";
  }
  if (!errors.targetPpm && !errors.highAlarmPpm &&
      Number(candidate.highAlarmPpm) <= Number(candidate.targetPpm)) {
    errors.highAlarmPpm = "L’alarme doit rester supérieure à la consigne.";
  }
  return { ok: Object.keys(errors).length === 0, errors };
}

export function airQualityStatus(ppm, alarmPpm = 1500) {
  if (ppm >= alarmPpm) return { label: "Alerte CO₂", tone: "danger" };
  if (ppm >= 1200) return { label: "Air à renouveler", tone: "warning" };
  if (ppm >= 900) return { label: "Qualité correcte", tone: "attention" };
  return { label: "Bonne qualité d’air", tone: "good" };
}

export function formatCountdown(seconds) {
  const safe = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

export function outputToVoltage(percent) {
  return Math.max(0, Math.min(10, Number(percent) / 10));
}

const EVENT_LABELS = Object.freeze({
  BOOT: "Démarrage du contrôleur",
  CONFIG_CHANGED: "Configuration modifiée",
  CONFIG_RECOVERY: "Configuration récupérée",
  SERVICE_OPENED: "Wi-Fi de service ouvert",
  SERVICE_CLOSED: "Wi-Fi de service fermé",
  LOGIN_FAILED: "Échec de connexion",
  SESSION_OPENED: "Session ouverte",
  SESSION_CLOSED: "Session fermée",
  TEST_STARTED: "Test actionneur démarré",
  TEST_STOPPED: "Test actionneur arrêté",
  HISTORY_CLEARED: "Historique effacé",
  FAULT_RAISED: "Défaut apparu",
  FAULT_CLEARED: "Défaut disparu",
  FIRMWARE_UPDATE: "Mise à jour du firmware",
  HISTORY_STORAGE_FAILED: "Stockage de l’historique indisponible",
});

const SOURCE_LABELS = Object.freeze({ SYSTEM: "Système", PHYSICAL: "Action physique", INSTALLER: "Installateur", ADMIN: "Administrateur", GTB: "GTB" });

export function presentEvent(event) {
  const code = typeof event?.code === "string" ? event.code : "";
  const label = EVENT_LABELS[code] || "Événement technique inconnu";
  const severity = ["INFO", "WARNING", "ERROR", "CRITICAL"].includes(event?.severity) ? event.severity : "WARNING";
  const source = SOURCE_LABELS[event?.source] || "Source inconnue";
  const count = Number.isInteger(event?.count) && event.count > 0 ? event.count : 1;
  let detail = "";
  if (code === "CONFIG_CHANGED" && Number.isInteger(event.detail0)) detail = `Révision ${event.detail0}`;
  else if (code === "TEST_STARTED" && Number.isInteger(event.detail0) && Number.isInteger(event.detail1)) detail = `${(event.detail0 / 10).toLocaleString("fr-FR")} % pendant ${event.detail1} s`;
  else if (code === "TEST_STOPPED" && event.detail0 === 1) detail = "Fin automatique";
  else if (code === "HISTORY_CLEARED" && Number.isInteger(event.detail0)) detail = `${event.detail0} échantillon${event.detail0 > 1 ? "s" : ""} supprimé${event.detail0 > 1 ? "s" : ""}`;
  else if (code === "LOGIN_FAILED" && count > 1) detail = `${count} tentatives regroupées`;
  else if (count > 1) detail = `${count} occurrences`;
  return { label, severity, source, detail };
}
