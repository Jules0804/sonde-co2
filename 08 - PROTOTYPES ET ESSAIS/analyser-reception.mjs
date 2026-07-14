import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function parseLine(line) {
  const values = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === ',' && !quoted) {
      values.push(value);
      value = '';
    } else {
      value += character;
    }
  }
  values.push(value);
  return values;
}

export function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.length === 0) return [];
  const headers = parseLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
  });
}

function number(value) {
  const normalized = String(value ?? '').trim().replace(',', '.');
  if (normalized === '') return null;
  const result = Number(normalized);
  return Number.isFinite(result) ? result : null;
}

export function analyseScd41(rows) {
  const validRows = rows.filter((row) => row.read_ok === '1' || row.read_ok?.toLowerCase() === 'true');
  const invalidCount = rows.length - validRows.length;
  const invalidRatePercent = rows.length === 0 ? 100 : (invalidCount / rows.length) * 100;
  let longestGapSeconds = 0;
  let longestInvalidSeries = 0;
  let currentInvalidSeries = 0;

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const isValid = row.read_ok === '1' || row.read_ok?.toLowerCase() === 'true';
    currentInvalidSeries = isValid ? 0 : currentInvalidSeries + 1;
    longestInvalidSeries = Math.max(longestInvalidSeries, currentInvalidSeries);
    if (index > 0) {
      const previous = number(rows[index - 1].uptime_s);
      const current = number(row.uptime_s);
      if (previous !== null && current !== null) longestGapSeconds = Math.max(longestGapSeconds, current - previous);
    }
  }

  const valuesInRange = validRows.every((row) => {
    const co2 = number(row.co2_ppm);
    return co2 !== null && co2 >= 0 && co2 <= 10000;
  });
  const rebootCount = Math.max(0, ...rows.map((row) => number(row.reboot_count) ?? 0));
  const criteria = {
    hasData: rows.length > 0,
    invalidRate: invalidRatePercent < 0.1,
    longestGap: longestGapSeconds <= 15,
    invalidSeries: longestInvalidSeries <= 2,
    valuesInRange,
    noReboot: rebootCount === 0,
  };
  const diagnostics = [];
  if (!criteria.hasData) diagnostics.push('aucune ligne SCD41 exploitable');
  if (!criteria.invalidRate) diagnostics.push(`taux de lectures invalides trop haut : ${invalidRatePercent.toFixed(3)} %`);
  if (!criteria.longestGap) diagnostics.push(`trou de mesure trop long : ${longestGapSeconds.toFixed(1)} s`);
  if (!criteria.invalidSeries) diagnostics.push(`trop de lectures invalides consécutives : ${longestInvalidSeries}`);
  if (!criteria.valuesInRange) diagnostics.push('au moins une valeur CO2 est absente ou hors plage 0-10000 ppm');
  if (!criteria.noReboot) diagnostics.push(`redémarrage détecté : reboot_count=${rebootCount}`);

  return {
    type: 'SCD41',
    samples: rows.length,
    validSamples: validRows.length,
    invalidCount,
    invalidRatePercent,
    longestGapSeconds,
    longestInvalidSeries,
    rebootCount,
    criteria,
    diagnostics,
    accepted: Object.values(criteria).every(Boolean),
  };
}

export function analyseDac(rows) {
  const channels = {};
  for (const channel of [...new Set(rows.map((row) => row.channel))].sort()) {
    const channelRows = rows.filter((row) => row.channel === channel);
    const measurements = channelRows.map((row) => ({
      target: number(row.target_v),
      measured: number(row.measured_v),
    })).filter((item) => item.target !== null && item.measured !== null);
    const missingMeasurementCount = channelRows.length - measurements.length;
    const maxAbsoluteErrorV = measurements.length === 0
      ? null
      : Math.max(...measurements.map((item) => Math.abs(item.measured - item.target)));
    const meansByTarget = [...new Set(measurements.map((item) => item.target))]
      .sort((a, b) => a - b)
      .map((target) => {
        const values = measurements.filter((item) => item.target === target).map((item) => item.measured);
        return values.reduce((sum, value) => sum + value, 0) / values.length;
      });
    const monotonic = meansByTarget.every((value, index) => index === 0 || value >= meansByTarget[index - 1]);
    const maxVoltageV = measurements.length === 0 ? null : Math.max(...measurements.map((item) => item.measured));
    const channelDiagnostics = [];
    if (measurements.length === 0) channelDiagnostics.push(`canal ${channel}: aucune mesure exploitable`);
    if (measurements.length < 15) channelDiagnostics.push(`canal ${channel}: pas assez de mesures (${measurements.length}/15)`);
    if (meansByTarget.length < 5) channelDiagnostics.push(`canal ${channel}: pas assez de consignes distinctes (${meansByTarget.length}/5)`);
    if (missingMeasurementCount > 0) channelDiagnostics.push(`canal ${channel}: ${missingMeasurementCount} ligne(s) sans target_v ou measured_v exploitable`);
    if (maxAbsoluteErrorV !== null && maxAbsoluteErrorV > 0.1) channelDiagnostics.push(`canal ${channel}: erreur max trop élevée (${maxAbsoluteErrorV.toFixed(3)} V)`);
    if (maxVoltageV !== null && maxVoltageV > 10.2) channelDiagnostics.push(`canal ${channel}: tension max trop élevée (${maxVoltageV.toFixed(3)} V)`);
    if (!monotonic) channelDiagnostics.push(`canal ${channel}: réponse non monotone`);
    channels[channel] = {
      samples: measurements.length,
      distinctTargets: meansByTarget.length,
      missingMeasurementCount,
      maxAbsoluteErrorV,
      maxVoltageV,
      monotonic,
      diagnostics: channelDiagnostics,
      accepted: measurements.length >= 15
        && meansByTarget.length >= 5
        && maxAbsoluteErrorV <= 0.1
        && maxVoltageV <= 10.2
        && monotonic,
    };
  }
  const diagnostics = ['0', '1'].flatMap((channel) => {
    if (!channels[channel]) return [`canal ${channel}: absent du fichier`];
    return channels[channel].diagnostics;
  });
  return {
    type: 'DFR0971',
    channels,
    diagnostics,
    accepted: ['0', '1'].every((channel) => channels[channel]?.accepted === true),
  };
}

export function analyseFile(filePath) {
  const rows = parseCsv(fs.readFileSync(filePath, 'utf8'));
  const headers = rows[0] ? Object.keys(rows[0]) : [];
  if (headers.includes('co2_ppm')) return analyseScd41(rows);
  if (headers.includes('measured_v')) return analyseDac(rows);
  throw new Error('Type de fichier inconnu : colonnes co2_ppm ou measured_v absentes.');
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  if (!process.argv[2]) {
    console.error('Usage : node analyser-reception.mjs <fichier.csv>');
    process.exitCode = 2;
  } else {
    try {
      const result = analyseFile(process.argv[2]);
      console.log(JSON.stringify(result, null, 2));
      process.exitCode = result.accepted ? 0 : 1;
    } catch (error) {
      console.error(error.message);
      process.exitCode = 2;
    }
  }
}
