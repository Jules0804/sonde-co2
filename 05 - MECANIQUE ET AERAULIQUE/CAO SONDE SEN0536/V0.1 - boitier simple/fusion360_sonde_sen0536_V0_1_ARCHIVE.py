"""
Archive CAO V0.1 - boitier simple SEN0536.

Version NON RETENUE : elle sert seulement a visualiser l'etape initiale.
Defauts connus : pas de vrai tube de gaine, pas de chambre protegee,
passage cable trop simplifie, prelevement d'air insuffisant.

Utiliser la V0.3 pour impression/prototype.
"""

import adsk.core
import adsk.fusion
import traceback


def mm(value):
    return value / 10.0


def point(x, y, z=0):
    return adsk.core.Point3D.create(mm(x), mm(y), mm(z))


def add_box(root, name, x, y, z, cx, cy, base_z):
    sketch = root.sketches.add(root.xYConstructionPlane)
    sketch.name = name + "_sketch"
    sketch.sketchCurves.sketchLines.addCenterPointRectangle(point(cx, cy, base_z), point(cx + x / 2, cy + y / 2, base_z))
    prof = sketch.profiles.item(0)
    ext_input = root.features.extrudeFeatures.createInput(prof, adsk.fusion.FeatureOperations.NewBodyFeatureOperation)
    ext_input.setDistanceExtent(False, adsk.core.ValueInput.createByReal(mm(z)))
    body = root.features.extrudeFeatures.add(ext_input).bodies.item(0)
    body.name = name
    return body


def add_cylinder_z(root, name, diameter, height, x, y, z, operation, participants):
    plane_input = root.constructionPlanes.createInput()
    plane_input.setByOffset(root.xYConstructionPlane, adsk.core.ValueInput.createByReal(mm(z)))
    plane = root.constructionPlanes.add(plane_input)
    sketch = root.sketches.add(plane)
    sketch.name = name + "_sketch"
    sketch.sketchCurves.sketchCircles.addByCenterRadius(point(x, y, z), mm(diameter / 2))
    prof = sketch.profiles.item(0)
    ext_input = root.features.extrudeFeatures.createInput(prof, operation)
    ext_input.participantBodies = participants
    ext_input.setDistanceExtent(False, adsk.core.ValueInput.createByReal(mm(height)))
    bodies = root.features.extrudeFeatures.add(ext_input).bodies
    return bodies.item(0) if bodies.count else None


def run(context):
    ui = None
    try:
        app = adsk.core.Application.get()
        ui = app.userInterface
        app.documents.add(adsk.core.DocumentTypes.FusionDesignDocumentType)
        design = adsk.fusion.Design.cast(app.activeProduct)
        root = design.rootComponent

        base = add_box(root, "ARCHIVE_V0_1_BOITIER_SIMPLE_NON_RETENU", 58, 46, 18, 0, 0, 0)
        lid = add_box(root, "ARCHIVE_V0_1_COUVERCLE_SIMPLE", 58, 46, 3, 80, 0, 0)
        pcb = add_box(root, "REFERENCE_PCB_SEN0536_32x27", 32, 27, 1.6, 0, 0, 5)
        add_cylinder_z(root, "ARCHIVE_PASSAGE_CABLE_SIMPLIFIE", 8, 20, -23, 0, 0, adsk.fusion.FeatureOperations.CutFeatureOperation, [base])

        ui.messageBox("Archive V0.1 generee. Version non retenue : utiliser la V0.3 pour le prototype.")
    except Exception:
        if ui:
            ui.messageBox("Erreur script Fusion 360 V0.1:\n{}".format(traceback.format_exc()))
