import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const scriptPath = 'fusion360_sonde_sen0536_boitiers.py';
const paramsPath = 'PARAMETRES CAO SONDE SEN0536 V0.1.json';
const versionedV01 = 'CAO SONDE SEN0536/V0.1 - boitier simple/fusion360_sonde_sen0536_V0_1_ARCHIVE.py';
const versionedV02 = 'CAO SONDE SEN0536/V0.2 - sonde de gaine/fusion360_sonde_sen0536_V0_2_ARCHIVE.py';
const versionedV03 = 'CAO SONDE SEN0536/V0.3 - tube demontable chicane/fusion360_sonde_sen0536_V0_3.py';
const versionedParamsV03 = 'CAO SONDE SEN0536/V0.3 - tube demontable chicane/PARAMETRES_CAO_SONDE_SEN0536_V0_3.json';

const script = readFileSync(scriptPath, 'utf8');
const params = JSON.parse(readFileSync(paramsPath, 'utf8'));
const duct = params.duct_probe_architecture_mm;
const chamber = params.protected_sensor_chamber_mm;
const cable = params.cable_and_mounting_mm;
const verified = params.verified_dimensions_mm;

for (const filePath of [versionedV01, versionedV02, versionedV03, versionedParamsV03]) {
  assert.ok(existsSync(filePath), `Fichier CAO versionne manquant : ${filePath}`);
}

const hash = (content) => createHash('sha256').update(content).digest('hex');
assert.equal(hash(script), hash(readFileSync(versionedV03, 'utf8')), 'La V0.3 versionnee doit correspondre au script courant.');

for (const marker of [
  'Architecture V0.3',
  'MANCHON_RECEPTION_TUBE_DEMONTABLE',
  'TUBE_PLONGEUR_DEMONTABLE_D16_L165',
  'COLLERETTE_BUTEE_TUBE_DEMONTABLE',
  'ergot_baionnette_tube',
  'CHICANE_PROTECTION_SCD41',
  'REFERENCE_MOUSSE_FILTRANTE_AMOVIBLE',
  'PRESSE_ETOUPE_REPRESENTATION_M16',
]) {
  assert.ok(script.includes(marker), `Marqueur CAO manquant : ${marker}`);
}

assert.equal(verified.sen0536_pcb_length, 32);
assert.equal(verified.sen0536_pcb_width, 27);
assert.equal(verified.sen0536_product_height, 8);

assert.ok(duct.probe_tube_outer_diameter >= 12 && duct.probe_tube_outer_diameter <= 22, 'Diametre tube sonde invraisemblable.');
assert.ok(duct.probe_tube_inserted_length >= 120 && duct.probe_tube_inserted_length <= 220, 'Longueur tube hors plage prototype DN200/DN250.');
assert.ok(duct.probe_tube_wall >= 1.2 && duct.probe_tube_wall <= 2.5, 'Epaisseur tube non imprimable ou trop epaisse.');
assert.ok(duct.probe_sampling_hole_count >= 6, 'Pas assez de trous de prelevement.');
assert.ok(duct.probe_sampling_hole_diameter > 0 && duct.probe_sampling_hole_diameter < duct.probe_tube_outer_diameter / 2, 'Trous tube trop grands.');
assert.ok(duct.socket_clearance_diameter > duct.probe_tube_outer_diameter, 'Le manchon doit avoir du jeu par rapport au tube.');
assert.ok(duct.socket_clearance_diameter - duct.probe_tube_outer_diameter >= 0.5, 'Jeu tube/manchon trop faible pour impression FDM.');
assert.ok(duct.detachable_tube_stop_collar_diameter > duct.socket_clearance_diameter, 'La collerette doit buter sur le manchon.');
assert.ok(duct.bayonet_lug_x > 0 && duct.bayonet_lug_y > 0 && duct.bayonet_lug_z > 0, 'Ergots baionnette incomplets.');
assert.ok(duct.foam_gasket_groove_diameter < duct.round_flange_diameter, 'La gorge de joint doit rester dans la bride.');

assert.ok(chamber.sensor_chamber_x >= verified.sen0536_pcb_length, 'Chambre trop courte pour la carte SEN0536.');
assert.ok(chamber.sensor_chamber_y >= verified.sen0536_pcb_width, 'Chambre trop etroite pour la carte SEN0536.');
assert.ok(chamber.baffle_thickness >= 1.2, 'Chicane trop fine.');
assert.ok(chamber.baffle_opening_y < chamber.sensor_chamber_y, 'Ouverture de chicane trop large.');
assert.ok(chamber.removable_filter_reference_thickness > 0, 'Reference de mousse filtrante absente.');

assert.ok(cable.cable_hole_diameter >= 6 && cable.cable_hole_diameter <= 10, 'Passage cable Gravity/presse-etoupe invraisemblable.');
assert.ok(cable.cable_gland_visual_outer_diameter > cable.cable_hole_diameter, 'Le presse-etoupe doit etre plus gros que le passage cable.');

console.log(`CAO sonde SEN0536 coherente : tube demontable ${duct.probe_tube_outer_diameter} mm x ${duct.probe_tube_inserted_length} mm, ${duct.probe_sampling_hole_count} trous, manchon ${duct.socket_clearance_diameter} mm, chicane ${chamber.baffle_thickness} mm.`);
