"""
Fusion 360 script - sonde CO2 de gaine fonctionnelle pour DFRobot SEN0536 / SCD41.

Architecture V0.3 inspiree des vraies sondes de gaine CVC :
- boitier electronique exterieur a la gaine ;
- bride ronde + empreinte de joint contre la gaine ;
- manchon de reception cote bride ;
- tube plongeur demontable/interchangeable qui traverse la paroi de gaine ;
- trous d'echantillonnage dans le tube, dans le flux d'air ;
- collerette et ergots de type baionnette pour essais rapides de tubes ;
- chicane/grille interne pour proteger le SCD41 du jet d'air direct ;
- passage cable type presse-etoupe en dessous du boitier ;
- carte SEN0536 montee dans le boitier, cote sec, devant une chambre d'air ;
- couvercle separe, imprimable a plat.

Sources dimensionnelles utilisees :
- DFRobot SEN0536 : carte 32 x 27 x 8 mm, I2C 0x62.
- Les autres cotes sont des hypotheses mecaniques a verifier au pied a coulisse
  et a adapter apres impression test.

Important :
- Ce modele est un prototype imprimable, pas une piece certifiee etanche.
- Prevoir mousse/joint entre bride et gaine, et controle de condensation/poussieres.
- Le SCD41 ne doit pas etre expose a l'eau ni aux poussieres directes.
"""

import adsk.core
import adsk.fusion
import traceback


PARAMS = {
    # SEN0536 / SCD41
    "pcb_x": 32.0,
    "pcb_y": 27.0,
    "pcb_z": 1.6,
    "product_z": 8.0,
    "mount_pitch_x": 25.0,
    "mount_pitch_y": 20.0,

    # Boitier exterieur
    "box_depth_x": 46.0,
    "box_width_y": 74.0,
    "box_height_z": 58.0,
    "box_wall": 2.6,
    "box_floor": 2.6,
    "box_center_x": -38.0,
    "box_center_y": 0.0,
    "box_base_z": 0.0,

    # Couvercle
    "lid_offset_y": 105.0,
    "lid_z": 3.2,
    "lid_lip_z": 2.0,
    "lid_screw_clearance_d": 3.4,
    "lid_screw_pilot_d": 2.5,
    "lid_boss_d": 7.0,

    # Bride et tube de gaine
    "duct_wall_x": 0.0,
    "flange_d": 66.0,
    "flange_z": 5.0,
    "gasket_d": 56.0,
    "gasket_groove_z": 0.8,
    "probe_d": 16.0,
    "probe_length": 165.0,
    "probe_wall": 1.6,
    "probe_center_z": 31.0,
    "probe_center_y": 0.0,
    "probe_hole_d": 4.5,
    "probe_hole_count": 8,
    "probe_hole_pitch": 15.0,
    "probe_first_hole_x": 42.0,
    "probe_tip_closed_mm": 8.0,
    "socket_outer_d": 25.0,
    "socket_clearance_d": 16.8,
    "socket_length": 18.0,
    "tube_stop_collar_d": 25.0,
    "tube_stop_collar_length": 5.0,
    "bayonet_lug_x": 7.0,
    "bayonet_lug_y": 4.0,
    "bayonet_lug_z": 3.0,

    # Passage cable / presse-etoupe
    "cable_gland_outer_d": 16.0,
    "cable_gland_h": 15.0,
    "cable_hole_d": 8.0,
    "cable_x": -45.0,
    "cable_y": -28.0,

    # Chambre capteur et support PCB
    "sensor_chamber_x": 38.0,
    "sensor_chamber_y": 34.0,
    "sensor_chamber_z": 24.0,
    "baffle_thickness": 2.0,
    "baffle_opening_y": 20.0,
    "baffle_slot_z": 4.0,
    "standoff_d": 5.6,
    "standoff_h": 5.0,
    "standoff_hole_d": 2.7,
}


def mm(value):
    return value / 10.0  # Fusion API internal unit is cm


def point(x, y, z=0):
    return adsk.core.Point3D.create(mm(x), mm(y), mm(z))


def add_box(root, name, x, y, z, center_x=0, center_y=0, base_z=0, operation=None, participants=None):
    sketch = root.sketches.add(root.xYConstructionPlane)
    sketch.name = name + "_sketch"
    sketch.sketchCurves.sketchLines.addCenterPointRectangle(
        point(center_x, center_y, base_z),
        point(center_x + x / 2.0, center_y + y / 2.0, base_z),
    )
    prof = sketch.profiles.item(0)
    ext_input = root.features.extrudeFeatures.createInput(
        prof,
        operation or adsk.fusion.FeatureOperations.NewBodyFeatureOperation,
    )
    if participants:
        ext_input.participantBodies = participants
    ext_input.setDistanceExtent(False, adsk.core.ValueInput.createByReal(mm(z)))
    bodies = root.features.extrudeFeatures.add(ext_input).bodies
    body = bodies.item(0) if bodies.count else None
    if body:
        body.name = name
    return body


def cut_box(root, target_body, name, x, y, z, center_x=0, center_y=0, base_z=0):
    plane_input = root.constructionPlanes.createInput()
    plane_input.setByOffset(root.xYConstructionPlane, adsk.core.ValueInput.createByReal(mm(base_z)))
    plane = root.constructionPlanes.add(plane_input)
    sketch = root.sketches.add(plane)
    sketch.name = name + "_cut_sketch"
    sketch.sketchCurves.sketchLines.addCenterPointRectangle(
        point(center_x, center_y, base_z),
        point(center_x + x / 2.0, center_y + y / 2.0, base_z),
    )
    prof = sketch.profiles.item(0)
    ext_input = root.features.extrudeFeatures.createInput(prof, adsk.fusion.FeatureOperations.CutFeatureOperation)
    ext_input.participantBodies = [target_body]
    ext_input.setDistanceExtent(False, adsk.core.ValueInput.createByReal(mm(z)))
    root.features.extrudeFeatures.add(ext_input)


def add_cylinder_z(root, name, diameter, height, x, y, z, operation=None, participants=None):
    plane_input = root.constructionPlanes.createInput()
    plane_input.setByOffset(root.xYConstructionPlane, adsk.core.ValueInput.createByReal(mm(z)))
    plane = root.constructionPlanes.add(plane_input)
    sketch = root.sketches.add(plane)
    sketch.name = name + "_sketch"
    sketch.sketchCurves.sketchCircles.addByCenterRadius(point(x, y, z), mm(diameter / 2.0))
    prof = sketch.profiles.item(0)
    ext_input = root.features.extrudeFeatures.createInput(
        prof,
        operation or adsk.fusion.FeatureOperations.NewBodyFeatureOperation,
    )
    if participants:
        ext_input.participantBodies = participants
    ext_input.setDistanceExtent(False, adsk.core.ValueInput.createByReal(mm(height)))
    bodies = root.features.extrudeFeatures.add(ext_input).bodies
    body = bodies.item(0) if bodies.count else None
    if body:
        body.name = name
    return body


def add_cylinder_x(root, name, diameter, length, x_start, y, z, operation=None, participants=None):
    plane_input = root.constructionPlanes.createInput()
    plane_input.setByOffset(root.yZConstructionPlane, adsk.core.ValueInput.createByReal(mm(x_start)))
    plane = root.constructionPlanes.add(plane_input)
    sketch = root.sketches.add(plane)
    sketch.name = name + "_sketch"
    sketch.sketchCurves.sketchCircles.addByCenterRadius(point(x_start, y, z), mm(diameter / 2.0))
    prof = sketch.profiles.item(0)
    ext_input = root.features.extrudeFeatures.createInput(
        prof,
        operation or adsk.fusion.FeatureOperations.NewBodyFeatureOperation,
    )
    if participants:
        ext_input.participantBodies = participants
    ext_input.setDistanceExtent(False, adsk.core.ValueInput.createByReal(mm(length)))
    bodies = root.features.extrudeFeatures.add(ext_input).bodies
    body = bodies.item(0) if bodies.count else None
    if body:
        body.name = name
    return body


def add_text_label(root, text, x, y, z, size=3.0):
    plane_input = root.constructionPlanes.createInput()
    plane_input.setByOffset(root.xYConstructionPlane, adsk.core.ValueInput.createByReal(mm(z)))
    plane = root.constructionPlanes.add(plane_input)
    sketch = root.sketches.add(plane)
    text_input = sketch.sketchTexts.createInput2(text, mm(size))
    text_input.setAsMultiLine(
        point(x, y, z),
        point(x + 45, y + 8, z),
        adsk.core.HorizontalAlignments.LeftHorizontalAlignment,
        adsk.core.VerticalAlignments.MiddleVerticalAlignment,
        0,
    )
    sketch.sketchTexts.add(text_input)


def create_model():
    app = adsk.core.Application.get()
    ui = app.userInterface
    doc = app.documents.add(adsk.core.DocumentTypes.FusionDesignDocumentType)
    design = adsk.fusion.Design.cast(app.activeProduct)
    design.designType = adsk.fusion.DesignTypes.ParametricDesignType
    root = design.rootComponent
    p = PARAMS

    box_min_x = p["box_center_x"] - p["box_depth_x"] / 2.0
    box_max_x = p["box_center_x"] + p["box_depth_x"] / 2.0
    box_top_z = p["box_base_z"] + p["box_height_z"]

    # Boitier exterieur, imprime couvercle vers le haut.
    box = add_box(
        root,
        "BOITIER_EXTERIEUR_SONDE_GAINE",
        p["box_depth_x"],
        p["box_width_y"],
        p["box_height_z"],
        p["box_center_x"],
        p["box_center_y"],
        p["box_base_z"],
    )
    cut_box(
        root,
        box,
        "cavite_boitier",
        p["box_depth_x"] - 2 * p["box_wall"],
        p["box_width_y"] - 2 * p["box_wall"],
        p["box_height_z"] - p["box_floor"],
        p["box_center_x"],
        p["box_center_y"],
        p["box_base_z"] + p["box_floor"],
    )

    # Bride ronde cote gaine + gorge de joint mousse.
    flange = add_cylinder_x(
        root,
        "BRIDE_RONDE_APPUI_GAINE",
        p["flange_d"],
        p["flange_z"],
        p["duct_wall_x"] - p["flange_z"],
        p["probe_center_y"],
        p["probe_center_z"],
        adsk.fusion.FeatureOperations.JoinFeatureOperation,
        [box],
    )
    add_cylinder_x(
        root,
        "gorge_joint_mousse_bride",
        p["gasket_d"],
        p["gasket_groove_z"],
        p["duct_wall_x"] - p["flange_z"] - 0.05,
        p["probe_center_y"],
        p["probe_center_z"],
        adsk.fusion.FeatureOperations.CutFeatureOperation,
        [box],
    )

    # Manchon fixe : le boitier reste en place, le tube plongeur peut etre remplace.
    socket_start_x = box_max_x - p["socket_length"]
    add_cylinder_x(
        root,
        "MANCHON_RECEPTION_TUBE_DEMONTABLE",
        p["socket_outer_d"],
        p["socket_length"] + p["flange_z"],
        socket_start_x,
        p["probe_center_y"],
        p["probe_center_z"],
        adsk.fusion.FeatureOperations.JoinFeatureOperation,
        [box],
    )
    add_cylinder_x(
        root,
        "alesage_manchon_tube_jeu_0p8mm",
        p["socket_clearance_d"],
        p["socket_length"] + p["flange_z"] + 4.0,
        socket_start_x - 1.0,
        p["probe_center_y"],
        p["probe_center_z"],
        adsk.fusion.FeatureOperations.CutFeatureOperation,
        [box],
    )

    # Tube plongeur demontable : export separe possible, longueur interchangeable.
    tube_start_x = p["duct_wall_x"] - 3.0
    tube_length = p["probe_length"] + 3.0
    probe = add_cylinder_x(
        root,
        "TUBE_PLONGEUR_DEMONTABLE_D16_L165",
        p["probe_d"],
        tube_length,
        tube_start_x,
        p["probe_center_y"],
        p["probe_center_z"],
        adsk.fusion.FeatureOperations.NewBodyFeatureOperation,
    )

    # Allege le tube pour visualiser le conduit d'air, en gardant un nez ferme.
    add_cylinder_x(
        root,
        "conduit_interieur_tube_air",
        p["probe_d"] - 2 * p["probe_wall"],
        tube_length - p["probe_tip_closed_mm"],
        tube_start_x - 0.1,
        p["probe_center_y"],
        p["probe_center_z"],
        adsk.fusion.FeatureOperations.CutFeatureOperation,
        [probe],
    )

    # Collerette de butee et deux ergots de type baionnette : utile pour tester
    # plusieurs longueurs/embouts sans reimprimer tout le boitier.
    add_cylinder_x(
        root,
        "COLLERETTE_BUTEE_TUBE_DEMONTABLE",
        p["tube_stop_collar_d"],
        p["tube_stop_collar_length"],
        p["duct_wall_x"] - p["tube_stop_collar_length"] - 0.5,
        p["probe_center_y"],
        p["probe_center_z"],
        adsk.fusion.FeatureOperations.JoinFeatureOperation,
        [probe],
    )
    for index, y in enumerate([-p["probe_d"] / 2.0 - 1.0, p["probe_d"] / 2.0 + 1.0]):
        add_box(
            root,
            "ergot_baionnette_tube_%d" % (index + 1),
            p["bayonet_lug_x"],
            p["bayonet_lug_y"],
            p["bayonet_lug_z"],
            p["duct_wall_x"] - p["tube_stop_collar_length"] - 4.0,
            y,
            p["probe_center_z"] - p["bayonet_lug_z"] / 2.0,
            adsk.fusion.FeatureOperations.JoinFeatureOperation,
            [probe],
        )

    # Deux encoches de reception visibles dans le manchon, a reprendre finement
    # apres le premier essai d'impression.
    for index, y in enumerate([-p["probe_d"] / 2.0 - 1.0, p["probe_d"] / 2.0 + 1.0]):
        cut_box(
            root,
            box,
            "encoche_baionnette_manchon_%d" % (index + 1),
            p["bayonet_lug_x"] + 1.2,
            p["bayonet_lug_y"] + 1.0,
            p["socket_outer_d"] + 2.0,
            p["duct_wall_x"] - p["tube_stop_collar_length"] - 4.0,
            y,
            p["probe_center_z"] - p["socket_outer_d"] / 2.0,
        )

    # Passage d'air entre le manchon et la chambre interne.
    add_cylinder_x(
        root,
        "passage_air_manchon_vers_chambre",
        p["probe_d"] - 2 * p["probe_wall"],
        p["socket_length"] + 8.0,
        socket_start_x - 2.0,
        p["probe_center_y"],
        p["probe_center_z"],
        adsk.fusion.FeatureOperations.CutFeatureOperation,
        [box],
    )

    # Trous d'echantillonnage alternes dans la partie presente dans la gaine.
    for index in range(p["probe_hole_count"]):
        x = p["probe_first_hole_x"] + index * p["probe_hole_pitch"]
        add_cylinder_z(
            root,
            "trou_echantillonnage_air_%02d" % (index + 1),
            p["probe_hole_d"],
            p["probe_d"] + 4.0,
            x,
            p["probe_center_y"] + (3.0 if index % 2 else -3.0),
            p["probe_center_z"] - p["probe_d"] / 2.0 - 2.0,
            adsk.fusion.FeatureOperations.CutFeatureOperation,
            [probe],
        )

    # Quatre vis de bride autour de la penetration de gaine.
    for index, (dy, dz) in enumerate([(-24, -18), (24, -18), (-24, 18), (24, 18)]):
        add_cylinder_x(
            root,
            "trou_fixation_bride_M4_%d" % (index + 1),
            4.5,
            p["flange_z"] + 2.0,
            p["duct_wall_x"] - p["flange_z"] - 1.0,
            p["probe_center_y"] + dy,
            p["probe_center_z"] + dz,
            adsk.fusion.FeatureOperations.CutFeatureOperation,
            [box],
        )

    # Presse-etoupe sous boitier + vrai passage cable.
    gland = add_cylinder_z(
        root,
        "PRESSE_ETOUPE_REPRESENTATION_M16",
        p["cable_gland_outer_d"],
        p["cable_gland_h"],
        p["cable_x"],
        p["cable_y"],
        -p["cable_gland_h"],
        adsk.fusion.FeatureOperations.NewBodyFeatureOperation,
    )
    add_cylinder_z(
        root,
        "passage_cable_8mm",
        p["cable_hole_d"],
        p["cable_gland_h"] + p["box_floor"] + 2.0,
        p["cable_x"],
        p["cable_y"],
        -p["cable_gland_h"],
        adsk.fusion.FeatureOperations.CutFeatureOperation,
        [box, gland],
    )

    # Chambre d'air derriere le tube, face au SCD41.
    chamber_x = box_max_x - p["sensor_chamber_x"] / 2.0 - p["box_wall"]
    add_box(
        root,
        "CHAMBRE_AIR_INTERNE_REFERENCE",
        p["sensor_chamber_x"],
        p["sensor_chamber_y"],
        p["sensor_chamber_z"],
        chamber_x,
        p["probe_center_y"],
        p["probe_center_z"] - p["sensor_chamber_z"] / 2.0,
        adsk.fusion.FeatureOperations.NewBodyFeatureOperation,
    )

    # Chicane/grille imprimee : le SCD41 ne prend pas le flux de gaine en direct.
    # Les ouvertures hautes/basses creent un chemin d'air plus doux et laissent
    # de la place pour une petite mousse filtrante amovible lors des essais.
    baffle_x = chamber_x - p["sensor_chamber_x"] / 2.0 + 12.0
    add_box(
        root,
        "CHICANE_PROTECTION_SCD41",
        p["baffle_thickness"],
        p["sensor_chamber_y"] - 6.0,
        p["sensor_chamber_z"],
        baffle_x,
        p["probe_center_y"],
        p["probe_center_z"] - p["sensor_chamber_z"] / 2.0,
        adsk.fusion.FeatureOperations.JoinFeatureOperation,
        [box],
    )
    for index, z in enumerate([
        p["probe_center_z"] - p["sensor_chamber_z"] / 2.0 + 4.0,
        p["probe_center_z"] + p["sensor_chamber_z"] / 2.0 - 8.0,
    ]):
        cut_box(
            root,
            box,
            "ouverture_chicane_air_%d" % (index + 1),
            p["baffle_thickness"] + 1.0,
            p["baffle_opening_y"],
            p["baffle_slot_z"],
            baffle_x,
            p["probe_center_y"],
            z,
        )
    add_box(
        root,
        "REFERENCE_MOUSSE_FILTRANTE_AMOVIBLE",
        1.5,
        p["baffle_opening_y"],
        p["sensor_chamber_z"] - 6.0,
        baffle_x - 2.5,
        p["probe_center_y"],
        p["probe_center_z"] - p["sensor_chamber_z"] / 2.0 + 3.0,
        adsk.fusion.FeatureOperations.NewBodyFeatureOperation,
    )

    # Support PCB SEN0536 dans le boitier, avec entree cable separee du flux d'air.
    pcb_center_x = p["box_center_x"] - 5.0
    pcb_center_y = 0.0
    pcb_base_z = p["box_floor"] + p["standoff_h"]
    sx = p["mount_pitch_x"] / 2.0
    sy = p["mount_pitch_y"] / 2.0
    for ix, x in enumerate([pcb_center_x - sx, pcb_center_x + sx]):
        for iy, y in enumerate([pcb_center_y - sy, pcb_center_y + sy]):
            add_cylinder_z(
                root,
                "entretoise_sen0536_%d_%d" % (ix, iy),
                p["standoff_d"],
                p["standoff_h"],
                x,
                y,
                p["box_floor"],
                adsk.fusion.FeatureOperations.JoinFeatureOperation,
                [box],
            )
            add_cylinder_z(
                root,
                "avant_trou_sen0536_%d_%d" % (ix, iy),
                p["standoff_hole_d"],
                p["standoff_h"] + 0.8,
                x,
                y,
                p["box_floor"],
                adsk.fusion.FeatureOperations.CutFeatureOperation,
                [box],
            )

    add_box(root, "REFERENCE_PCB_SEN0536_32x27", p["pcb_x"], p["pcb_y"], p["pcb_z"], pcb_center_x, pcb_center_y, pcb_base_z)
    add_box(root, "REFERENCE_VOLUME_SCD41_8mm", 18.0, 18.0, p["product_z"] - p["pcb_z"], pcb_center_x + 5.0, pcb_center_y, pcb_base_z + p["pcb_z"])

    # Bossages de couvercle sur le boitier.
    screw_positions = [
        (box_min_x + 7.0, -p["box_width_y"] / 2.0 + 7.0),
        (box_max_x - 7.0, -p["box_width_y"] / 2.0 + 7.0),
        (box_min_x + 7.0, p["box_width_y"] / 2.0 - 7.0),
        (box_max_x - 7.0, p["box_width_y"] / 2.0 - 7.0),
    ]
    for index, (x, y) in enumerate(screw_positions):
        add_cylinder_z(root, "bossage_couvercle_%d" % (index + 1), p["lid_boss_d"], box_top_z - p["box_floor"] - 4.0, x, y, p["box_floor"], adsk.fusion.FeatureOperations.JoinFeatureOperation, [box])
        add_cylinder_z(root, "avant_trou_couvercle_%d" % (index + 1), p["lid_screw_pilot_d"], box_top_z, x, y, p["box_floor"], adsk.fusion.FeatureOperations.CutFeatureOperation, [box])

    # Couvercle separe, pose a cote pour export 3MF/STL.
    lid_y = p["lid_offset_y"]
    lid = add_box(root, "COUVERCLE_BOITIER_SONDE_GAINE", p["box_depth_x"], p["box_width_y"], p["lid_z"], p["box_center_x"], lid_y, 0.0)
    add_box(
        root,
        "levre_interne_couvercle",
        p["box_depth_x"] - 2 * p["box_wall"] - 0.6,
        p["box_width_y"] - 2 * p["box_wall"] - 0.6,
        p["lid_lip_z"],
        p["box_center_x"],
        lid_y,
        p["lid_z"],
        adsk.fusion.FeatureOperations.JoinFeatureOperation,
        [lid],
    )
    for index, (x, y) in enumerate(screw_positions):
        add_cylinder_z(
            root,
            "trou_passage_couvercle_M3_%d" % (index + 1),
            p["lid_screw_clearance_d"],
            p["lid_z"] + p["lid_lip_z"] + 1.0,
            x,
            lid_y + y,
            0.0,
            adsk.fusion.FeatureOperations.CutFeatureOperation,
            [lid],
        )

    add_text_label(root, "AIR FLOW ->  TUBE DEMONTABLE PERFORE", 38, -29, p["probe_center_z"] + 10, 3.0)
    add_text_label(root, "PRESSE-ETOUPE / CABLE", p["cable_x"] - 16, p["cable_y"] - 9, 2.0, 2.5)
    add_text_label(root, "SEN0536 SCD41 - V0.3 CHICANE + TUBE", p["box_center_x"] - 20, -22, box_top_z + 0.05, 2.5)

    ui.messageBox(
        "Modele V0.3 cree : boitier exterieur, bride gaine, tube demontable perfore, chicane SCD41, passage cable et couvercle separe.\n"
        "Exporter BOITIER_EXTERIEUR_SONDE_GAINE, TUBE_PLONGEUR_DEMONTABLE_D16_L165 puis COUVERCLE_BOITIER_SONDE_GAINE."
    )


def run(context):
    ui = None
    try:
        app = adsk.core.Application.get()
        ui = app.userInterface
        create_model()
    except Exception:
        if ui:
            ui.messageBox("Erreur script Fusion 360:\n{}".format(traceback.format_exc()))
