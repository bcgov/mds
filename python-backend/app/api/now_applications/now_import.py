from app.api.now_applications import models as app_models
from app.api.now_submissions import models as sub_models

from flask import current_app

unit_type_map = {'m3' : 'Meters cubed',
'tonnes': 'Tonne (Metric Ton 1000Kg)',
'm3/year' : 'Meters cubed',
'tonnes/year' :'Tonne (Metric Ton 1000Kg)'}


def code_lookup(model, description):
    row = model.query.filter_by(description=description).first()
    if not row:
        raise Exception(
            f'Code description "{description}" not found on table "{model.__name__}"')
    return row


def transmogrify_now(now_submission_message_id):
    now_sub = sub_models.Application.query.get(now_submission_message_id)
    if not now_sub:
        raise Exception('No NOW Submission with message_id')
    now_app = app_models.NOWApplication(mine_guid=now_sub.mine_guid)
    _transmogrify_now_details(now_app, now_sub)
    _transmogrify_camp_activities(now_app, now_sub)
    _transmogrify_blasting_activities(now_app, now_sub)
    _transmogrify_sand_and_gravel_activities(now_app,now_sub)
    _transmogrify_surface_bulk_sample(now_app,now_sub)
    return now_app


def _transmogrify_now_details(a, s):
    a.now_message_id = s.messageid
    a.now_tracking_number = s.trackingnumber
    a.notice_of_work_type_code = code_lookup(app_models.NOWApplicationType,
                                             s.noticeofworktype).notice_of_work_type_code
    a.now_application_status_code = code_lookup(app_models.NOWApplicationStatus,
                                                s.status).now_application_status_code
    a.submitted_date = s.submitteddate
    a.received_date = s.receiveddate
    a.latitude = s.latitude
    a.longitude = s.longitude
    a.property_name = s.nameofproperty
    a.tenure_number = s.tenurenumbers
    a.proposed_start_date = s.proposedstartdate
    a.proposed_end_date = s.proposedenddate
    return


def _transmogrify_camp_activities(a, s):
    if not s.cbsfreclamation or s.cbsfreclamationcost or s.campbuildstgetotaldistarea or s.fuellubstoreonsite is None:

        camp = app_models.Camp(
            reclamation_description=s.cbsfreclamation,
            reclamation_cost=s.cbsfreclamationcost,
            total_disturbed_area=s.campbuildstgetotaldistarea,
            total_disturbed_area_unit_type_code='HA',
            has_fuel_stored=s.fuellubstoreonsite == 'Yes',
        )

        if not s.campdisturbedarea or s.camptimbervolume is None:
            camp_detail = app_models.CampDetail(activity_type_description='Camps',
                                                disturbed_area=s.campdisturbedarea,
                                                timber_volume=s.camptimbervolume)
            camp.details.append(camp_detail)

        if not s.bldgdisturbedarea or s.bldgtimbervolume is None:
            camp_detail = app_models.CampDetail(activity_type_description='Buildings',
                                                disturbed_area=s.bldgdisturbedarea,
                                                timber_volume=s.bldgtimbervolume)
            camp.details.append(camp_detail)

        if not s.stgedisturbedarea or s.stgetimbervolume is None:
            camp_detail = app_models.CampDetail(activity_type_description='Staging Area',
                                                disturbed_area=s.stgedisturbedarea,
                                                timber_volume=s.stgetimbervolume)
            camp.details.append(camp_detail)

        a.camps.append(camp)

    return


def _transmogrify_cut_lines_polarization_survey(a, s):
    if not s.cutlinesreclamation or s.cutlinesreclamationcost or s.cutlinesexplgriddisturbedarea is None:

        clps = app_models.CutLinesPolarizationSurvey(
            reclamation_description=s.cutlinesreclamation,
            reclamation_cost=s.cutlinesreclamationcost,
            total_disturbed_area=s.cutlinesexplgriddisturbedarea,
            total_disturbed_area_unit_type_code='HA')

        if not s.cutlinesexplgridtotallinekms or s.cutlinesexplgridtimbervolume is None:
            clps_detial = app_models.CutLinesPolarizationSurveyDetail(
                cut_line_length=s.cutlinesexplgridtotallinekms,
                timber_volume=s.cutlinesexplgridtimbervolume)
            clps.details.append(clps_detial)

        a.cut_lines_polarization_survey.append(clps)

    return


def _transmogrify_exploration_surface_drilling(a, s):
    if not s.expsurfacedrillreclcorestorage or s.expsurfacedrillreclamation or s.expsurfacedrillreclamationcost or s.expsurfacedrilltotaldistarea is None:
        esd = app_models.ExplorationSurfaceDrilling(
            reclamation_description=s.expsurfacedrillreclamation,
            reclamation_cost=s.expsurfacedrillreclamationcost,
            total_disturbed_area=s.expsurfacedrilltotaldistarea,
            reclamation_core_storage=s.expsurfacedrillreclcorestorage,
            total_disturbed_area_unit_type_code='HA')

        for sd in s.exp_surface_drill_activity:
            esd_detail = app_models.ExplorationSurfaceDrillingDetail(
                activity_type_description=sd.type,
                number_of_sites=sd.numberofsites,
                disturbed_area=sd.disturbedarea,
                timber_volume=sd.timbervolume)
            esd.details.append(esd_detail)

        a.exploration_surface_drilling = esd
    return


def _transmogrify_mechanical_trenching(a, s):
    if not s.mechtrenchingreclamation or s.mechtrenchingreclamationcost or s.mechtrenchingtotaldistarea is None:
        mech = app_models.MechanicalTrenching(reclamation_description=s.mechtrenchingreclamation,
                                              reclamation_cost=s.mechtrenchingreclamationcost,
                                              total_disturbed_area=s.mechtrenchingtotaldistarea,
                                              total_disturbed_area_unit_type_code='HA')

        for sd in s.mech_trenching_activity:
            mech_detail = app_models.MechanicalTrenchingDetail(activity_type_description=sd.type,
                                                               number_of_sites=sd.numberofsites,
                                                               disturbed_area=sd.disturbedarea,
                                                               timber_volume=sd.timbervolume)
            mech.details.append(mech_detail)

        a.mechanical_trenching.append(mech)
    return


def _transmogrify_placer_operations(a, s):
    if s.placerundergroundoperations or s.placerhandoperations or s.placerhandoperations or s.placerreclamationarea or s.placerreclamation or s.placerreclamationcost:
        placer = app_models.PlacerOperation(
            reclamation_description=s.placerreclamation,
            reclamation_cost=s.placerreclamationcost,
            total_disturbed_area=s.placerreclamationarea,
            total_disturbed_area_unit_type_code='HA',
            is_underground_placer_operations=s.placerundergroundoperations == 'Yes',
            is_hand_operations=s.placerhandoperations == 'Yes')

        for sd in s.proposed_placer_activity:
            placer_detail = app_models.PlacerOperationDetail(activity_type_description=s.type,
                                                             disturbed_area=sd.disturbedarea,
                                                             timber_volume=sd.timbervolume,
                                                             width=sd.width,
                                                             length=sd.length,
                                                             depth=sd.depth,
                                                             quantity=sd.quantity)
            placer.details.append(placer_detail)

        for s_detail in s.existing_placer_activity:
            # TODO: barf
            pass

        a.placer_operation = placer
    return


def _transmogrify_blasting_activities(a, s):
    if s.bcexplosivespermitissued or s.bcexplosivespermitnumber or s.bcexplosivespermitexpiry or s.storeexplosivesonsite:
        a.blasting = app_models.BlastingOperation(
            explosive_permit_issued=s.bcexplosivespermitissued == 'Yes',
            explosive_permit_number=s.bcexplosivespermitnumber,
            explosive_permit_expiry_date=s.bcexplosivespermitexpiry,
            has_storage_explosive_on_site=s.storeexplosivesonsite == 'Yes')
    return


def _transmogrify_sand_and_gravel_activities(a, s):

    if (s.sandgrvqrydepthoverburden or s.sandgrvqrydepthtopsoil or s.sandgrvqrystabilizemeasures
            or s.sandgrvqrywithinaglandres or s.sandgrvqryalrpermitnumber
            or s.sandgrvqrylocalgovsoilrembylaw or s.sandgrvqryofficialcommplan
            or s.sandgrvqrylandusezoning or s.sandgrvqryendlanduse or s.sandgrvqrytotalmineres
            or s.sandgrvqrytotalmineresunits or s.sandgrvqryannualextrest
            or s.sandgrvqryannualextrestunits or s.sandgrvqryreclamation
            or s.sandgrvqryreclamationbackfill or s.sandgrvqryreclamationcost
            or s.sandgrvqrygrdwtravgdepth or s.sandgrvqrygrdwtrexistingareas
            or s.sandgrvqrygrdwtrtestpits or s.sandgrvqrygrdwtrtestwells or s.sandgrvqrygrdwtrother
            or s.sandgrvqrygrdwtrmeasprotect or s.sandgrvqryimpactdistres
            or s.sandgrvqryimpactdistwater or s.sandgrvqryimpactnoise
            or s.sandgrvqryimpactprvtaccess or s.sandgrvqryimpactprevtdust
            or s.sandgrvqryimpactminvisual):
        a.sand_and_gravel = app_models.SandGravelQuarryOperation(
            average_overburden_depth=s.sandgrvqrydepthoverburden,
            average_top_soil_depth=s.sandgrvqrydepthtopsoil,
            stability_measures_description=s.sandgrvqrystabilizemeasures,
            is_agricultural_land_reserve=s.sandgrvqrywithinaglandres == 'Yes',
            agri_lnd_rsrv_permit_application_number=s.sandgrvqryalrpermitnumber,
            has_local_soil_removal_bylaw=s.sandgrvqrylocalgovsoilrembylaw == 'Yes',
            community_plan=s.sandgrvqryofficialcommplan,
            land_use_zoning=s.sandgrvqrylandusezoning,
            proposed_land_use=s.sandgrvqryendlanduse,
            total_minable_reserves=s.sandgrvqrytotalmineres,
            total_minable_reserves_unit_type_code=code_lookup(app_models.UnitType, unit_type_map[s.sandgrvqrytotalmineresunits]).unit_type_code,
            total_annual_extraction=s.sandgrvqryannualextrest,
            total_annual_extraction_unit_type_code=code_lookup(app_models.UnitType,unit_type_map[s.sandgrvqryannualextrestunits]).unit_type_code,
            reclamation_description=s.sandgrvqryreclamation,
            reclamation_backfill_detail=s.sandgrvqryreclamationbackfill,
            reclamation_cost=s.sandgrvqryreclamationcost,
            average_groundwater_depth=s.sandgrvqrygrdwtravgdepth,
            has_groundwater_from_existing_area=s.sandgrvqrygrdwtrexistingareas == 'Yes',
            has_groundwater_from_test_pits=s.sandgrvqrygrdwtrtestpits == 'Yes',
            has_groundwater_from_test_wells=s.sandgrvqrygrdwtrtestwells == 'Yes',
            groundwater_from_other_description=s.sandgrvqrygrdwtrother,
            groundwater_protection_plan=s.sandgrvqrygrdwtrmeasprotect,
            nearest_residence_distance=s.sandgrvqryimpactdistres,
            nearest_water_source_distance=s.sandgrvqryimpactdistwater,
            noise_impact_plan=s.sandgrvqryimpactnoise,
            secure_access_plan=s.sandgrvqryimpactprvtaccess,
            dust_impact_plan=s.sandgrvqryimpactprevtdust,
            visual_impact_plan=s.sandgrvqryimpactminvisual)

    return

def _transmogrify_surface_bulk_sample(a, s):
    if (s.surfacebulksampleprocmethods or s.surfacebulksamplereclsephandl or s.surfacebulksamplereclamation
            or s.surfacebulksamplerecldrainmiti or s.surfacebulksamplereclcost
            or s.surfacebulksampletotaldistarea):
        a.surface_bulk_sample = app_models.SurfaceBulkSample(
            reclamation_description=s.surfacebulksamplereclamation,
            reclamation_cost=s.surfacebulksamplereclcost,
            total_disturbed_area=s.surfacebulksampletotaldistarea,
            total_disturbed_area_unit_type_code='HA',
            processing_method_description=s.surfacebulksampleprocmethods,
            handling_instructions=s.surfacebulksamplereclsephandl,
            drainage_mitigation_description=s.surfacebulksamplerecldrainmiti)
    return
