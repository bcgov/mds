from app.api.now_applications import models as app_models
from app.api.now_submissions import models as sub_models
from app.api.mms_now_submissions import models as mms_sub_models

from flask import current_app

unit_type_map = {
    'm3': 'Meters cubed',
    'tonnes': 'Tonne (Metric Ton 1000Kg)',
    'm3/year': 'Meters cubed',
    'tonnes/year': 'Tonne (Metric Ton 1000Kg)',
    'Degrees': 'Degrees',
    'Percent': 'Grade (Percent)',
    None: None
}

def code_lookup(model, description, code_column_name):
    if description:
        row = model.query.filter_by(description=description).first()
        if not row:
            raise Exception(
                f'Code description "{description}" not found on table "{model.__name__}"')
        result = getattr(row, code_column_name)
    else:
        result = None
    return result


def transmogrify_now(now_application_identity):
    now_sub = sub_models.Application.find_by_messageid(
        now_application_identity.messageid) or sub_models.Application()
    mms_now_sub = mms_sub_models.MMSApplication.find_by_mms_cid(
        now_application_identity.mms_cid) or mms_sub_models.MMSApplication()

    now_app = app_models.NOWApplication(now_application_identity=now_application_identity)

    _transmogrify_now_details(now_app, now_sub, mms_now_sub)
    _transmogrify_blasting_activities(now_app, now_sub, mms_now_sub)
    _transmogrify_state_of_land(now_app, now_sub, mms_now_sub)

    #Activities
    _transmogrify_camp_activities(now_app, now_sub, mms_now_sub)
    _transmogrify_exploration_access(now_app, now_sub, mms_now_sub)
    _transmogrify_cut_lines_polarization_survey(now_app, now_sub, mms_now_sub)
    _transmogrify_exploration_surface_drilling(now_app, now_sub, mms_now_sub)
    _transmogrify_mechanical_trenching(now_app, now_sub, mms_now_sub)
    _transmogrify_placer_operations(now_app, now_sub, mms_now_sub)
    _transmogrify_sand_and_gravel_activities(now_app, now_sub, mms_now_sub)
    _transmogrify_settling_ponds(now_app, now_sub, mms_now_sub)
    _transmogrify_surface_bulk_sample(now_app, now_sub, mms_now_sub)
    _transmogrify_underground_exploration(now_app, now_sub, mms_now_sub)
    _transmogrify_water_supply(now_app, now_sub, mms_now_sub)

    return now_app


def _transmogrify_now_details(now_app, now_sub, mms_now_sub):
    now_app.now_tracking_number = now_sub.trackingnumber
    now_app.notice_of_work_type_code = code_lookup(
        app_models.NOWApplicationType, mms_now_sub.noticeofworktype or now_sub.noticeofworktype,
        'notice_of_work_type_code')
    now_app.now_application_status_code = code_lookup(app_models.NOWApplicationStatus,
                                                      now_sub.status, 'now_application_status_code')
    now_app.submitted_date = mms_now_sub.submitteddate or now_sub.submitteddate
    now_app.received_date = mms_now_sub.receiveddate or now_sub.receiveddate
    now_app.latitude = mms_now_sub.latitude or now_sub.latitude
    now_app.longitude = mms_now_sub.longitude or now_sub.longitude
    now_app.property_name = mms_now_sub.nameofproperty or now_sub.nameofproperty
    now_app.tenure_number = mms_now_sub.tenurenumbers or now_sub.tenurenumbers
    now_app.proposed_start_date = mms_now_sub.proposedstartdate or now_sub.proposedstartdate
    now_app.proposed_end_date = mms_now_sub.proposedenddate or now_sub.proposedenddate
    return


def _transmogrify_state_of_land(now_app, now_sub, mms_now_sub):
    landcommunitywatershed = mms_now_sub.landcommunitywatershed or now_sub.landcommunitywatershed
    archsitesaffected = mms_now_sub.archsitesaffected or now_sub.archsitesaffected
    if landcommunitywatershed or archsitesaffected:
        now_app.state_of_land = app_models.StateOfLand(
            has_community_water_shed=landcommunitywatershed == 'Yes',
            has_archaeology_sites_affected=archsitesaffected == 'Yes')
    return


#Activities
def _transmogrify_camp_activities(now_app, now_sub, mms_now_sub):
    cbsfreclamation = mms_now_sub.cbsfreclamation or now_sub.cbsfreclamation
    cbsfreclamationcost = mms_now_sub.cbsfreclamationcost or now_sub.cbsfreclamationcost
    campbuildstgetotaldistarea = now_sub.campbuildstgetotaldistarea
    fuellubstoreonsite = mms_now_sub.fuellubstoreonsite or now_sub.fuellubstoreonsite
    if cbsfreclamation or cbsfreclamationcost or campbuildstgetotaldistarea or fuellubstoreonsite:

        camp = app_models.Camp(
            reclamation_description=cbsfreclamation,
            reclamation_cost=cbsfreclamationcost,
            total_disturbed_area=campbuildstgetotaldistarea,
            total_disturbed_area_unit_type_code='HA',
            has_fuel_stored=fuellubstoreonsite == 'Yes',
        )

        campdisturbedarea = mms_now_sub.campdisturbedarea or now_sub.campdisturbedarea
        camptimbervolume = mms_now_sub.camptimbervolume or now_sub.camptimbervolume
        if campdisturbedarea or camptimbervolume:
            camp_detail = app_models.CampDetail(
                activity_type_description='Camps',
                disturbed_area=campdisturbedarea,
                timber_volume=camptimbervolume)
            camp.details.append(camp_detail)

        bldgdisturbedarea = mms_now_sub.bldgdisturbedarea or now_sub.bldgdisturbedarea
        bldgtimbervolume = mms_now_sub.bldgtimbervolume or now_sub.bldgtimbervolume
        if bldgdisturbedarea or bldgtimbervolume:
            camp_detail = app_models.CampDetail(
                activity_type_description='Buildings',
                disturbed_area=bldgdisturbedarea,
                timber_volume=bldgtimbervolume)
            camp.details.append(camp_detail)

        stgedisturbedarea = mms_now_sub.stgedisturbedarea or now_sub.stgedisturbedarea
        stgetimbervolume = mms_now_sub.stgetimbervolume or now_sub.stgetimbervolume
        if stgedisturbedarea or stgetimbervolume:
            camp_detail = app_models.CampDetail(
                activity_type_description='Staging Area',
                disturbed_area=stgedisturbedarea,
                timber_volume=stgetimbervolume)
            camp.details.append(camp_detail)

        now_app.camps = camp

    return

def _transmogrify_cut_lines_polarization_survey(now_app, now_sub, mms_now_sub):
    cutlinesreclamation = mms_now_sub.cutlinesreclamation or now_sub.cutlinesreclamation
    cutlinesreclamationcost = mms_now_sub.cutlinesreclamationcost or now_sub.cutlinesreclamationcost
    cutlinesexplgriddisturbedarea = mms_now_sub.cutlinesexplgriddisturbedarea or now_sub.cutlinesexplgriddisturbedarea
    cutlinesexplgridtotallinekms = mms_now_sub.cutlinesexplgridtotallinekms or now_sub.cutlinesexplgridtotallinekms
    cutlinesexplgridtimbervolume = mms_now_sub.cutlinesexplgridtimbervolume or now_sub.cutlinesexplgridtimbervolume
    if cutlinesreclamation or cutlinesreclamationcost or cutlinesexplgriddisturbedarea:

        clps = app_models.CutLinesPolarizationSurvey(
            reclamation_description=cutlinesreclamation,
            reclamation_cost=cutlinesreclamationcost,
            total_disturbed_area=cutlinesexplgriddisturbedarea,
            total_disturbed_area_unit_type_code='HA')
        if cutlinesexplgridtotallinekms or cutlinesexplgridtimbervolume:
            clps_detial = app_models.CutLinesPolarizationSurveyDetail(
                cut_line_length=cutlinesexplgridtotallinekms,
                timber_volume=cutlinesexplgridtimbervolume)
            clps.details.append(clps_detial)

        now_app.cut_lines_polarization_survey = clps

    return

def _transmogrify_exploration_surface_drilling(now_app, now_sub, mms_now_sub):
    expsurfacedrillreclcorestorage = mms_now_sub.expsurfacedrillreclcorestorage or now_sub.expsurfacedrillreclcorestorage
    expsurfacedrillreclamation = mms_now_sub.expsurfacedrillreclamation or now_sub.expsurfacedrillreclamation
    expsurfacedrillreclamationcost = mms_now_sub.expsurfacedrillreclamationcost or now_sub.expsurfacedrillreclamationcost
    expsurfacedrilltotaldistarea = now_sub.expsurfacedrilltotaldistarea
    if expsurfacedrillreclcorestorage or expsurfacedrillreclamation or expsurfacedrillreclamationcost or expsurfacedrilltotaldistarea:
        esd = app_models.ExplorationSurfaceDrilling(
            reclamation_description=expsurfacedrillreclamation,
            reclamation_cost=expsurfacedrillreclamationcost,
            total_disturbed_area=expsurfacedrilltotaldistarea,
            reclamation_core_storage=expsurfacedrillreclcorestorage,
            total_disturbed_area_unit_type_code='HA')

        if (len(mms_now_sub.exp_surface_drill_activity) > 0):
            exp_surface_drill_activity = mms_now_sub.exp_surface_drill_activity
        else:
            exp_surface_drill_activity = now_sub.exp_surface_drill_activity

        for sd in exp_surface_drill_activity:
            esd_detail = app_models.ExplorationSurfaceDrillingDetail(
                activity_type_description=sd.type,
                number_of_sites=sd.numberofsites,
                disturbed_area=sd.disturbedarea,
                timber_volume=sd.timbervolume)
            esd.details.append(esd_detail)

        now_app.exploration_surface_drilling = esd
    return

def _transmogrify_mechanical_trenching(now_app, now_sub, mms_now_sub):
    mechtrenchingreclamation = mms_now_sub.mechtrenchingreclamation or now_sub.mechtrenchingreclamation
    mechtrenchingreclamationcost = mms_now_sub.mechtrenchingreclamationcost or now_sub.mechtrenchingreclamationcost
    mechtrenchingtotaldistarea = now_sub.mechtrenchingtotaldistarea
    if mechtrenchingreclamation or mechtrenchingreclamationcost or mechtrenchingtotaldistarea:
        mech = app_models.MechanicalTrenching(
            reclamation_description=mechtrenchingreclamation,
            reclamation_cost=mechtrenchingreclamationcost,
            total_disturbed_area=mechtrenchingtotaldistarea,
            total_disturbed_area_unit_type_code='HA')

        if (len(mms_now_sub.mech_trenching_activity) > 0):
            mech_trenching_activity = mms_now_sub.mech_trenching_activity
        else:
            mech_trenching_activity = now_sub.mech_trenching_activity

        for sd in mech_trenching_activity:
            mech_detail = app_models.MechanicalTrenchingDetail(
                activity_type_description=sd.type,
                number_of_sites=sd.numberofsites,
                disturbed_area=sd.disturbedarea,
                timber_volume=sd.timbervolume)
            mech.details.append(mech_detail)

        for e in now_sub.mech_trenching_equip:
            equipment = _transmogrify_equipment(e)
            mech.equipment.append(equipment)

        now_app.mechanical_trenching = mech
    return


def _transmogrify_equipment(e):
    existing_etl = app_models.ETLEquipment.query.filter_by(equipmentid=e.equipmentid).first()
    if existing_etl:
        return existing_etl.equipment

    equipment = app_models.Equipment(
        description=e.type, quantity=e.quantity, capacity=e.sizecapacity)
    etl_equipment = app_models.ETLEquipment(equipmentid=e.equipmentid)
    equipment._etl_equipment.append(etl_equipment)

    return equipment


def _transmogrify_exploration_access(now_app, now_sub, mms_now_sub):
    expaccessreclamation = mms_now_sub.expaccessreclamation or now_sub.expaccessreclamation
    expaccessreclamationcost = mms_now_sub.expaccessreclamationcost or now_sub.expaccessreclamationcost
    expaccesstotaldistarea = now_sub.expaccesstotaldistarea
    if expaccessreclamation or expaccessreclamationcost or expaccesstotaldistarea:
        exploration_access = app_models.ExplorationAccess(
            reclamation_description=expaccessreclamation,
            reclamation_cost=expaccessreclamationcost,
            total_disturbed_area=expaccesstotaldistarea,
            total_disturbed_area_unit_type_code='HA')

        now_app.exploration_access = exploration_access

        now_app.exploration_access = exploration_access

def _transmogrify_placer_operations(now_app, now_sub, mms_now_sub):
    placerundergroundoperations = now_sub.placerundergroundoperations
    placerhandoperations = now_sub.placerhandoperations
    placerreclamationarea = now_sub.placerreclamationarea
    placerreclamation = mms_now_sub.placerreclamation or now_sub.placerreclamation
    placerreclamationcost = mms_now_sub.placerreclamationcost or now_sub.placerreclamationcost
    expaccesstotaldistarea = now_sub.expaccesstotaldistarea
    if placerundergroundoperations or placerhandoperations or placerreclamationarea or placerreclamation or placerreclamationcost:
        placer = app_models.PlacerOperation(
            reclamation_description=placerreclamation,
            reclamation_cost=placerreclamationcost,
            total_disturbed_area=placerreclamationarea,
            total_disturbed_area_unit_type_code='HA',
            is_underground=placerundergroundoperations == 'Yes',
            is_hand_operation=placerhandoperations == 'Yes')

        if (len(mms_now_sub.proposed_placer_activity) > 0):
            proposed_placer_activity = mms_now_sub.proposed_placer_activity
        else:
            proposed_placer_activity = now_sub.proposed_placer_activity

        for proposed in proposed_placer_activity:
            proposed_detail = app_models.PlacerOperationDetail(
                activity_type_description=proposed.type,
                disturbed_area=proposed.disturbedarea,
                timber_volume=proposed.timbervolume,
                width=proposed.width,
                length=proposed.length,
                depth=proposed.depth,
                quantity=proposed.quantity)

            etl_detail = app_models.ETLActivityDetail(placeractivityid=proposed.placeractivityid)
            proposed_detail._etl_activity_details.append(etl_detail)

            proposed_xref = app_models.ActivitySummaryDetailXref(summary=placer, detail=proposed_detail, is_existing=False)
            
        if(len(mms_now_sub.existing_placer_activity) > 0):
            existing_placer_activity = mms_now_sub.existing_placer_activity
        else:
            existing_placer_activity = now_sub.existing_placer_activity

        if (len(mms_now_sub.existing_placer_activity) > 0):
            existing_placer_activity = mms_now_sub.existing_placer_activity
        else:
            existing_placer_activity = now_sub.existing_placer_activity

        for existing in existing_placer_activity:
            existing_etl = app_models.ETLActivityDetail.query.filter_by(
                placeractivityid=existing.placeractivityid).first()

            if existing_etl:
                existing_detail = existing_etl.activity_detail
            else:
                existing_detail = app_models.PlacerOperationDetail(
                    activity_type_description=existing.type,
                    disturbed_area=existing.disturbedarea,
                    timber_volume=existing.timbervolume,
                    width=existing.width,
                    length=existing.length,
                    depth=existing.depth,
                    quantity=existing.quantity)

                etl_detail = app_models.ETLActivityDetail(
                    placeractivityid=existing.placeractivityid)
                existing_detail._etl_activity_details.append(etl_detail)

            existing_xref = app_models.ActivitySummaryDetailXref(
                summary=placer, detail=existing_detail, is_existing=True)

        for e in now_sub.placer_equip:
            equipment = _transmogrify_equipment(e)
            placer.equipment.append(equipment)

        now_app.placer_operation = placer
    return

def _transmogrify_settling_ponds(now_app, now_sub, mms_now_sub):
    pondsreclamation = mms_now_sub.pondsreclamation or now_sub.pondsreclamation
    pondsreclamationcost = mms_now_sub.pondsreclamationcost or now_sub.pondsreclamationcost
    pondstotaldistarea = now_sub.pondstotaldistarea
    pondsexfiltratedtoground = mms_now_sub.pondsexfiltratedtoground or now_sub.pondsexfiltratedtoground
    pondsrecycled = mms_now_sub.pondsrecycled or now_sub.pondsrecycled
    pondsdischargedtoenv = mms_now_sub.pondsdischargedtoenv or now_sub.pondsdischargedtoenv
    if pondsreclamation or pondsreclamationcost or pondstotaldistarea or pondsexfiltratedtoground or pondsrecycled or pondsdischargedtoenv:
        settling_pond = app_models.SettlingPond(
            reclamation_description=pondsreclamation,
            reclamation_cost=pondsreclamationcost,
            total_disturbed_area=pondstotaldistarea,
            total_disturbed_area_unit_type_code='HA',
            is_ponds_exfiltrated=pondsexfiltratedtoground == 'Yes',
            is_ponds_recycled=pondsrecycled == 'Yes',
            is_ponds_discharged=pondsdischargedtoenv == 'Yes')

        proposed_settling_pond = now_sub.proposed_settling_pond

        for proposed in proposed_settling_pond:
            proposed_detail = app_models.SettlingPondDetail(
                activity_type_description=proposed.pondid,
                water_source_description=proposed.watersource,
                construction_plan=proposed.constructionmethod,
                width=proposed.width,
                length=proposed.length,
                depth=proposed.depth,
                disturbed_area=proposed.disturbedarea,
                timber_volume=proposed.timbervolume)

            etl_detail = app_models.ETLActivityDetail(settlingpondid=proposed.settlingpondid)
            proposed_detail._etl_activity_details.append(etl_detail)

            proposed_xref = app_models.ActivitySummaryDetailXref(summary=settling_pond, detail=proposed_detail, is_existing=False)
            
        if(len(mms_now_sub.existing_settling_pond) > 0):
            existing_settling_pond = mms_now_sub.existing_settling_pond
        else:
            existing_settling_pond = now_sub.existing_settling_pond

        existing_settling_pond = now_sub.existing_settling_pond

        for existing in existing_settling_pond:
            existing_etl = app_models.ETLActivityDetail.query.filter_by(
                settlingpondid=existing.settlingpondid).first()

            if existing_etl:
                existing_detail = existing_etl.activity_detail
            else:
                existing_detail = app_models.SettlingPondDetail(
                    activity_type_description=existing.pondid,
                    water_source_description=existing.watersource,
                    construction_plan=existing.constructionmethod,
                    width=existing.width,
                    length=existing.length,
                    depth=existing.depth,
                    disturbed_area=existing.disturbedarea,
                    timber_volume=existing.timbervolume)

                etl_detail = app_models.ETLActivityDetail(settlingpondid=existing.settlingpondid)
                existing_detail._etl_activity_details.append(etl_detail)

            existing_xref = app_models.ActivitySummaryDetailXref(
                summary=settling_pond, detail=existing_detail, is_existing=True)

        now_app.settling_pond = settling_pond
    return


def _transmogrify_blasting_activities(now_app, now_sub, mms_now_sub):
    bcexplosivespermitissued = mms_now_sub.bcexplosivespermitissued or now_sub.bcexplosivespermitissued
    bcexplosivespermitnumber = mms_now_sub.bcexplosivespermitnumber or now_sub.bcexplosivespermitnumber
    bcexplosivespermitexpiry = mms_now_sub.bcexplosivespermitexpiry or now_sub.bcexplosivespermitexpiry
    storeexplosivesonsite = now_sub.storeexplosivesonsite
    if bcexplosivespermitissued or bcexplosivespermitnumber or bcexplosivespermitexpiry or storeexplosivesonsite:
        now_app.blasting = app_models.BlastingOperation(
            explosive_permit_issued=bcexplosivespermitissued == 'Yes',
            explosive_permit_number=bcexplosivespermitnumber,
            explosive_permit_expiry_date=bcexplosivespermitexpiry,
            has_storage_explosive_on_site=storeexplosivesonsite == 'Yes')
    return


def _transmogrify_sand_and_gravel_activities(now_app, now_sub, mms_now_sub):
    sandgrvqrydepthoverburden = now_sub.sandgrvqrydepthoverburden
    sandgrvqrydepthtopsoil = now_sub.sandgrvqrydepthtopsoil
    sandgrvqrystabilizemeasures = now_sub.sandgrvqrystabilizemeasures
    sandgrvqrywithinaglandres = mms_now_sub.sandgrvqrywithinaglandres or now_sub.sandgrvqrywithinaglandres
    sandgrvqryalrpermitnumber = now_sub.sandgrvqryalrpermitnumber
    sandgrvqrylocalgovsoilrembylaw = mms_now_sub.sandgrvqrylocalgovsoilrembylaw or now_sub.sandgrvqrylocalgovsoilrembylaw
    sandgrvqryofficialcommplan = now_sub.sandgrvqryofficialcommplan
    sandgrvqrylandusezoning = now_sub.sandgrvqrylandusezoning
    sandgrvqryendlanduse = now_sub.sandgrvqryendlanduse
    sandgrvqrytotalmineres = now_sub.sandgrvqrytotalmineres
    sandgrvqrytotalmineresunits = now_sub.sandgrvqrytotalmineresunits
    sandgrvqryannualextrest = now_sub.sandgrvqryannualextrest
    sandgrvqryannualextrestunits = now_sub.sandgrvqryannualextrestunits
    sandgrvqryreclamation = mms_now_sub.sandgrvqryreclamation or now_sub.sandgrvqryreclamation
    sandgrvqryreclamationbackfill = mms_now_sub.sandgrvqryreclamationbackfill or now_sub.sandgrvqryreclamationbackfill
    sandgrvqryreclamationcost = mms_now_sub.sandgrvqryreclamationcost or now_sub.sandgrvqryreclamationcost
    sandgrvqrygrdwtravgdepth = now_sub.sandgrvqrygrdwtravgdepth
    sandgrvqrygrdwtrexistingareas = now_sub.sandgrvqrygrdwtrexistingareas
    sandgrvqrygrdwtrtestpits = now_sub.sandgrvqrygrdwtrtestpits
    sandgrvqrygrdwtrtestwells = now_sub.sandgrvqrygrdwtrtestwells
    sandgrvqrygrdwtrother = now_sub.sandgrvqrygrdwtrother
    sandgrvqrygrdwtrmeasprotect = now_sub.sandgrvqrygrdwtrmeasprotect
    sandgrvqryimpactdistres = now_sub.sandgrvqryimpactdistres
    sandgrvqryimpactdistwater = now_sub.sandgrvqryimpactdistwater
    sandgrvqryimpactnoise = now_sub.sandgrvqryimpactnoise
    sandgrvqryimpactprvtaccess = now_sub.sandgrvqryimpactprvtaccess
    sandgrvqryimpactprevtdust = now_sub.sandgrvqryimpactprevtdust
    sandgrvqryimpactminvisual = now_sub.sandgrvqryimpactminvisual
    if (sandgrvqrydepthoverburden or sandgrvqrydepthtopsoil or sandgrvqrystabilizemeasures
            or sandgrvqrywithinaglandres or sandgrvqryalrpermitnumber
            or sandgrvqrylocalgovsoilrembylaw or sandgrvqryofficialcommplan
            or sandgrvqrylandusezoning or sandgrvqryendlanduse or sandgrvqrytotalmineres
            or sandgrvqrytotalmineresunits or sandgrvqryannualextrest
            or sandgrvqryannualextrestunits or sandgrvqryreclamation
            or sandgrvqryreclamationbackfill or sandgrvqryreclamationcost
            or sandgrvqrygrdwtravgdepth or sandgrvqrygrdwtrexistingareas or sandgrvqrygrdwtrtestpits
            or sandgrvqrygrdwtrtestwells or sandgrvqrygrdwtrother or sandgrvqrygrdwtrmeasprotect
            or sandgrvqryimpactdistres or sandgrvqryimpactdistwater or sandgrvqryimpactnoise
            or sandgrvqryimpactprvtaccess or sandgrvqryimpactprevtdust
            or sandgrvqryimpactminvisual):
        now_app.sand_and_gravel = app_models.SandGravelQuarryOperation(
            average_overburden_depth=sandgrvqrydepthoverburden,
            average_top_soil_depth=sandgrvqrydepthtopsoil,
            stability_measures_description=sandgrvqrystabilizemeasures,
            is_agricultural_land_reserve=sandgrvqrywithinaglandres == 'Yes',
            agri_lnd_rsrv_permit_application_number=sandgrvqryalrpermitnumber,
            has_local_soil_removal_bylaw=sandgrvqrylocalgovsoilrembylaw == 'Yes',
            community_plan=sandgrvqryofficialcommplan,
            land_use_zoning=sandgrvqrylandusezoning,
            proposed_land_use=sandgrvqryendlanduse,
            total_mineable_reserves=sandgrvqrytotalmineres,
            total_mineable_reserves_unit_type_code=code_lookup(
                app_models.UnitType, unit_type_map[now_sub.sandgrvqrytotalmineresunits],
                'unit_type_code'),
            total_annual_extraction=sandgrvqryannualextrest,
            total_annual_extraction_unit_type_code=code_lookup(
                app_models.UnitType, unit_type_map[now_sub.sandgrvqryannualextrestunits],
                'unit_type_code'),
            reclamation_description=sandgrvqryreclamation,
            reclamation_backfill_detail=sandgrvqryreclamationbackfill,
            reclamation_cost=sandgrvqryreclamationcost,
            average_groundwater_depth=sandgrvqrygrdwtravgdepth,
            has_groundwater_from_existing_area=sandgrvqrygrdwtrexistingareas == 'Yes',
            has_groundwater_from_test_pits=sandgrvqrygrdwtrtestpits == 'Yes',
            has_groundwater_from_test_wells=sandgrvqrygrdwtrtestwells == 'Yes',
            groundwater_from_other_description=sandgrvqrygrdwtrother,
            groundwater_protection_plan=sandgrvqrygrdwtrmeasprotect,
            nearest_residence_distance=sandgrvqryimpactdistres,
            nearest_water_source_distance=sandgrvqryimpactdistwater,
            noise_impact_plan=sandgrvqryimpactnoise,
            secure_access_plan=sandgrvqryimpactprvtaccess,
            dust_impact_plan=sandgrvqryimpactprevtdust,
            visual_impact_plan=sandgrvqryimpactminvisual)

        if (len(mms_now_sub.sand_grv_qry_activity) > 0):
            sand_grv_qry_activity = mms_now_sub.sand_grv_qry_activity
        else:
            sand_grv_qry_activity = now_sub.sand_grv_qry_activity

        for detail in sand_grv_qry_activity:
            now_app.sand_and_gravel.details.append(
                app_models.SandGravelQuarryOperationDetail(
                    disturbed_area=detail.disturbedarea,
                    timber_volume=detail.timbervolume,
                    activity_type_description=detail.type))

        for e in now_sub.sand_grv_qry_equip:
            equipment = _transmogrify_equipment(e)
            now_app.sand_and_gravel.equipment.append(equipment)

    return

def _transmogrify_surface_bulk_sample(now_app, now_sub, mms_now_sub):
    surfacebulksampleprocmethods = now_sub.surfacebulksampleprocmethods
    surfacebulksamplereclsephandl = mms_now_sub.surfacebulksamplereclsephandl or now_sub.surfacebulksamplereclsephandl
    surfacebulksamplereclamation = mms_now_sub.surfacebulksamplereclamation or now_sub.surfacebulksamplereclamation
    surfacebulksamplerecldrainmiti = mms_now_sub.surfacebulksamplerecldrainmiti or now_sub.surfacebulksamplerecldrainmiti
    surfacebulksamplereclcost = mms_now_sub.surfacebulksamplereclcost or now_sub.surfacebulksamplereclcost
    surfacebulksampletotaldistarea = now_sub.surfacebulksampletotaldistarea
    if (surfacebulksampleprocmethods or surfacebulksamplereclsephandl
            or surfacebulksamplereclamation or surfacebulksamplerecldrainmiti
            or surfacebulksamplereclcost or surfacebulksampletotaldistarea):
        now_app.surface_bulk_sample = app_models.SurfaceBulkSample(
            reclamation_description=surfacebulksamplereclamation,
            reclamation_cost=surfacebulksamplereclcost,
            total_disturbed_area=surfacebulksampletotaldistarea,
            total_disturbed_area_unit_type_code='HA',
            processing_method_description=surfacebulksampleprocmethods,
            handling_instructions=surfacebulksamplereclsephandl,
            drainage_mitigation_description=surfacebulksamplerecldrainmiti)

        if (len(mms_now_sub.surface_bulk_sample_activity) > 0):
            surface_bulk_sample_activity = mms_now_sub.surface_bulk_sample_activity
        else:
            surface_bulk_sample_activity = now_sub.surface_bulk_sample_activity

        for detail in surface_bulk_sample_activity:
            now_app.surface_bulk_sample.details.append(
                app_models.SurfaceBulkSampleDetail(
                    disturbed_area=detail.disturbedarea,
                    timber_volume=detail.timbervolume,
                    activity_type_description=detail.type))

        for e in now_sub.surface_bulk_sample_equip:
            equipment = _transmogrify_equipment(e)
            now_app.surface_bulk_sample.equipment.append(equipment)
    return

def _transmogrify_underground_exploration(now_app, now_sub, mms_now_sub):
    underexptotalore = now_sub.underexptotalore
    underexptotaloreunits = now_sub.underexptotaloreunits
    underexpreclamation = mms_now_sub.underexpreclamation or now_sub.underexpreclamation
    underexpreclamationcost = mms_now_sub.underexpreclamationcost or now_sub.underexpreclamationcost
    underexptotalwaste = now_sub.underexptotalwaste
    underexptotalwasteunits = now_sub.underexptotalwasteunits
    underexptotaldistarea = now_sub.underexptotaldistarea
    if (underexptotalore or underexptotaloreunits or underexpreclamation or underexpreclamationcost
            or underexptotalwaste or underexptotalwasteunits or underexptotaldistarea):
        now_app.underground_exploration = app_models.UndergroundExploration(
            reclamation_description=underexpreclamation,
            reclamation_cost=underexpreclamationcost,
            total_disturbed_area=underexptotaldistarea,
            total_disturbed_area_unit_type_code='HA',
            total_ore_amount=underexptotalore,
            total_ore_unit_type_code=code_lookup(app_models.UnitType,
                                                 unit_type_map[underexptotaloreunits],
                                                 'unit_type_code'),
            total_waste_amount=underexptotalwaste,
            total_waste_unit_type_code=code_lookup(app_models.UnitType,
                                                   unit_type_map[underexptotalwasteunits],
                                                   'unit_type_code'))

        if (len(mms_now_sub.under_exp_new_activity) > 0):
            under_exp_new_activity = mms_now_sub.under_exp_new_activity
        else:
            under_exp_new_activity = now_sub.under_exp_new_activity

        for new_uea in under_exp_new_activity:
            now_app.underground_exploration.details.append(
                app_models.UndergroundExplorationDetail(
                    activity_type_description=new_uea.type,
                    incline=new_uea.incline,
                    incline_unit_type_code=code_lookup(app_models.UnitType,
                                                       unit_type_map[new_uea.inclineunits],
                                                       'unit_type_code'),
                    quantity=new_uea.quantity,
                    length=new_uea.length,
                    width=new_uea.width,
                    height=new_uea.height,
                    underground_exploration_type_code='NEW'))

        if (len(mms_now_sub.under_exp_rehab_activity) > 0):
            under_exp_rehab_activity = mms_now_sub.under_exp_rehab_activity
        else:
            under_exp_rehab_activity = now_sub.under_exp_rehab_activity

        for rehab_uea in under_exp_rehab_activity:
            now_app.underground_exploration.details.append(
                app_models.UndergroundExplorationDetail(
                    activity_type_description=rehab_uea.type,
                    incline=rehab_uea.incline,
                    incline_unit_type_code=code_lookup(app_models.UnitType,
                                                       unit_type_map[rehab_uea.inclineunits],
                                                       'unit_type_code'),
                    quantity=rehab_uea.quantity,
                    length=rehab_uea.length,
                    width=rehab_uea.width,
                    height=rehab_uea.height,
                    underground_exploration_type_code='RHB'))

        if (len(mms_now_sub.under_exp_surface_activity) > 0):
            under_exp_surface_activity = mms_now_sub.under_exp_surface_activity
        else:
            under_exp_surface_activity = now_sub.under_exp_surface_activity

        for surface_uea in under_exp_surface_activity:
            now_app.underground_exploration.details.append(
                app_models.UndergroundExplorationDetail(
                    activity_type_description=surface_uea.type,
                    quantity=surface_uea.quantity,
                    disturbed_area=surface_uea.disturbedarea,
                    timber_volume=surface_uea.timbervolume,
                    underground_exploration_type_code='SUR'))

            total_ore_amount=underexptotalore,
            total_ore_unit_type_code=code_lookup(app_models.UnitType,unit_type_map[underexptotaloreunits], 'unit_type_code'),
            total_waste_amount=underexptotalwaste,
            total_waste_unit_type_code=code_lookup(app_models.UnitType,unit_type_map[underexptotalwasteunits],'unit_type_code')
        )

        if(len(mms_now_sub.under_exp_new_activity) > 0):
            under_exp_new_activity = mms_now_sub.under_exp_new_activity
        else:
            under_exp_new_activity = now_sub.under_exp_new_activity
    
        for new_uea in under_exp_new_activity:
            now_app.underground_exploration.details.append(app_models.UndergroundExplorationDetail(
                activity_type_description=new_uea.type,
                incline=new_uea.incline,
                incline_unit_type_code=code_lookup(app_models.UnitType,unit_type_map[new_uea.inclineunits],'unit_type_code'),
                quantity=new_uea.quantity,
                length=new_uea.length,
                width=new_uea.width,
                height=new_uea.height,
                underground_exploration_type_code='NEW'
                )
            )

        if(len(mms_now_sub.under_exp_rehab_activity) > 0):
            under_exp_rehab_activity = mms_now_sub.under_exp_rehab_activity
        else:
            under_exp_rehab_activity = now_sub.under_exp_rehab_activity

        for rehab_uea in under_exp_rehab_activity:
            now_app.underground_exploration.details.append(app_models.UndergroundExplorationDetail(
                activity_type_description=rehab_uea.type,
                incline=rehab_uea.incline,
                incline_unit_type_code=code_lookup(app_models.UnitType,unit_type_map[rehab_uea.inclineunits],'unit_type_code'),
                quantity=rehab_uea.quantity,
                length=rehab_uea.length,
                width=rehab_uea.width,
                height=rehab_uea.height,
                underground_exploration_type_code='RHB'
                )
            )

        if(len(mms_now_sub.under_exp_surface_activity) > 0):
            under_exp_surface_activity = mms_now_sub.under_exp_surface_activity
        else:
            under_exp_surface_activity = now_sub.under_exp_surface_activity

        for surface_uea in under_exp_surface_activity:
            now_app.underground_exploration.details.append(app_models.UndergroundExplorationDetail(
                activity_type_description=surface_uea.type,
                quantity=surface_uea.quantity,
                disturbed_area=surface_uea.disturbedarea,
                timber_volume=surface_uea.timbervolume,
                underground_exploration_type_code='SUR'
                )
            )
    
    return

def _transmogrify_water_supply(now_app, now_sub, mms_now_sub):
    if now_sub.water_source_activity or mms_now_sub.water_source_activity:
        water_supply = app_models.WaterSupply()

        if (len(mms_now_sub.water_source_activity) > 0):
            water_source_activity = mms_now_sub.water_source_activity
        else:
            water_source_activity = now_sub.water_source_activity

        for wsa in water_source_activity:
            water_supply.details.append(
                app_models.WaterSupplyDetail(
                    supply_source_description=wsa.sourcewatersupply,
                    supply_source_type=wsa.type,
                    water_use_description=wsa.useofwater,
                    estimate_rate=wsa.estimateratewater,
                    pump_size=wsa.pumpsizeinwater,
                    intake_location=wsa.locationwaterintake))

        now_app.water_supply = water_supply
    return