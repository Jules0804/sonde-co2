"""
Archive CAO V0.2 - premiere sonde de gaine SEN0536.

Version NON RETENUE : elle introduit boitier exterieur, bride, tube fixe
et presse-etoupe, mais le tube n'est pas demontable et la chambre capteur
n'est pas assez protegee.

Utiliser la V0.3 pour impression/prototype.
"""

import adsk.core
import adsk.fusion
import traceback


def mm(value):
    return value / 10.0


def point(x, y, z=0):
    return adsk.core.Point3D.create(mm(x), mm(y), mm(z))


def add_box(root, name, x, y, z, cx, cy, base_z, operation=None, participants=None):
    sketch = root.sketches.add(root.xYConstructionPlane)
    sketch.name = name + "_sketch"
    sketch.sketchCurves.sketchLines.addCenterPointRectangle(point(cx, cy, base_z), point(cx + x / 2, cy + y / 2, base_z))
    prof = sketch.profiles.item(0)
    ext_input = root.features.extrudeFeatures.createInput(prof, operation or adsk.fusion.FeatureOperations.NewBodyFeatureOperation)
    if participants:
        ext_input.participantBodies = participants
    ext_input.setDistanceExtent(False, adsk.core.ValueInput.createByReal(mm(z)))
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
    sketch.sketchCurves.sketchCircles.addByCenterRadius(point(x_start, y, z), mm(diameter / 2))
    prof = sketch.profiles.item(0)
    ext_input = root.features.extrudeFeatures.createInput(prof, operation or adsk.fusion.FeatureOperations.NewBodyFeatureOperation)
    if participants:
        ext_input.participantBodies = participants
    ext_input.setDistanceExtent(False, adsk.core.ValueInput.createByReal(mm(length)))
    bodies = root.features.extrudeFeatures.add(ext_input).bodies
    body = bodies.item(0) if bodies.count else None
    if body:
        body.name = name
    return body


def add_cylinder_z(root, name, diameter, height, x, y, z, operation=None, participants=None):
    plane_input = root.constructionPlanes.createInput()
    plane_input.setByOffset(root.xYConstructionPlane, adsk.core.ValueInput.createByReal(mm(z)))
    plane = root.constructionPlanes.add(plane_input)
    sketch = root.sketches.add(plane)
    sketch.name = name + "_sketch"
    sketch.sketchCurves.sketchCircles.addByCenterRadius(point(x, y, z), mm(diameter / 2))
    prof = sketch.profiles.item(0)
    ext_input = root.features.extrudeFeatures.createInput(prof, operation or adsk.fusion.FeatureOperations.NewBodyFeatureOperation)
    if participants:
        ext_input.participantBodies = participants
    ext_input.setDistanceExtent(False, adsk.core.ValueInput.createByReal(mm(height)))
    bodies = root.features.extrudeFeatures.add(ext_input).bodies
    body = bodies.item(0) if bodies.count else None
    if body:
        body.name = name
    return body


def run(context):
    ui = None
    try:
        app = adsk.core.Application.get()
        ui = app.userInterface
        app.documents.add(adsk.core.DocumentTypes.FusionDesignDocumentType)
        design = adsk.fusion.Design.cast(app.activeProduct)
        root = design.rootComponent

        box = add_box(root, "ARCHIVE_V0_2_BOITIER_EXTERIEUR", 46, 74, 58, -38, 0, 0)
        add_cylinder_x(root, "ARCHIVE_V0_2_BRIDE_RONDE_GAINE", 66, 5, -5, 0, 31, adsk.fusion.FeatureOperations.JoinFeatureOperation, [box])
        tube = add_cylinder_x(root, "ARCHIVE_V0_2_TUBE_FIXE_NON_DEMONTABLE", 16, 165, -17, 0, 31, adsk.fusion.FeatureOperations.JoinFeatureOperation, [box])
        for index in range(8):
            add_cylinder_z(root, "ARCHIVE_V0_2_TROU_ECHANTILLON_%02d" % (index + 1), 4.5, 20, 42 + index * 15, -3 if index % 2 == 0 else 3, 21, adsk.fusion.FeatureOperations.CutFeatureOperation, [tube])
        add_cylinder_z(root, "ARCHIVE_V0_2_PRESSE_ETOUPE_REPRESENTATION", 16, 15, -45, -28, -15)
        add_box(root, "REFERENCE_PCB_SEN0536_32x27", 32, 27, 1.6, -43, 0, 8)
        add_box(root, "ARCHIVE_V0_2_COUVERCLE", 46, 74, 3.2, -38, 105, 0)

        ui.messageBox("Archive V0.2 generee. Version non retenue : utiliser la V0.3 pour le prototype.")
    except Exception:
        if ui:
            ui.messageBox("Erreur script Fusion 360 V0.2:\n{}".format(traceback.format_exc()))
