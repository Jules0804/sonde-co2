import assert from 'node:assert/strict';
import test from 'node:test';
import { analyseDac, analyseScd41, parseCsv } from './analyser-reception.mjs';

test('lit les champs CSV entre guillemets', () => {
  const rows = parseCsv('a,b\n1,"texte, avec virgule"\n');
  assert.deepEqual(rows, [{ a: '1', b: 'texte, avec virgule' }]);
});

test('accepte une serie SCD41 continue et valide', () => {
  const rows = Array.from({ length: 1001 }, (_, index) => ({
    uptime_s: String(index * 5),
    co2_ppm: '750',
    read_ok: '1',
    reboot_count: '0',
  }));
  const result = analyseScd41(rows);
  assert.equal(result.accepted, true);
  assert.equal(result.longestGapSeconds, 5);
  assert.deepEqual(result.diagnostics, []);
});

test('refuse une serie SCD41 avec redemarrage ou trou', () => {
  const rows = [
    { uptime_s: '0', co2_ppm: '750', read_ok: '1', reboot_count: '0' },
    { uptime_s: '20', co2_ppm: '750', read_ok: '1', reboot_count: '1' },
  ];
  const result = analyseScd41(rows);
  assert.equal(result.accepted, false);
  assert.equal(result.criteria.longestGap, false);
  assert.equal(result.criteria.noReboot, false);
  assert.match(result.diagnostics.join('\n'), /trou de mesure trop long/);
  assert.match(result.diagnostics.join('\n'), /redemarrage detecte|redémarrage détecté/);
});

test('explique une serie SCD41 vide', () => {
  const result = analyseScd41([]);
  assert.equal(result.accepted, false);
  assert.match(result.diagnostics.join('\n'), /aucune ligne SCD41 exploitable/);
});

function dacRows(error = 0.02) {
  return ['0', '1'].flatMap((channel) => [0, 2, 5, 8, 10].flatMap((target) =>
    [1, 2, 3].map(() => ({ channel, target_v: String(target), measured_v: String(target + error) }))));
}

test('accepte cinq points repetes sur les deux canaux DAC', () => {
  const result = analyseDac(dacRows());
  assert.equal(result.accepted, true);
  assert.equal(result.channels['0'].samples, 15);
  assert.deepEqual(result.diagnostics, []);
});

test('refuse un DAC hors tolerance', () => {
  const result = analyseDac(dacRows(0.2));
  assert.equal(result.accepted, false);
  assert.match(result.diagnostics.join('\n'), /erreur max trop/);
});

test('explique un fichier DAC avec mesures manuelles absentes', () => {
  const rows = ['0', '1'].flatMap((channel) => [0, 2, 5, 8, 10].map((target) => ({
    channel,
    target_v: String(target),
    measured_v: '',
  })));
  const result = analyseDac(rows);
  assert.equal(result.accepted, false);
  assert.equal(result.channels['0'].missingMeasurementCount, 5);
  assert.match(result.diagnostics.join('\n'), /canal 0: aucune mesure exploitable/);
  assert.match(result.diagnostics.join('\n'), /canal 1: aucune mesure exploitable/);
});
