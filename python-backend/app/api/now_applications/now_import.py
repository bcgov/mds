from app.api.now_applications import models as app_models
from app.api.now_submissions import models as sub_models

from flask import current_app

unit_type_map = {'m3' : 'Meters cubed',
'tonnes': 'Tonne (Metric Ton 1000Kg)',
'm3/year' : 'Meters cubed',
'tonnes/year' :'Tonne (Metric Ton 1000Kg)',
'Degrees':'Degrees',
'Percent':'Grade (Percent)'}


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

def transmogrify_now(now_submission_message_id):
    now_sub = sub_models.Application.query.get(now_submission_message_id)
    if not now_sub:
        raise Exception('No NOW Submission with message_id')
    now_app = app_models.NOWApplication(mine_guid=now_sub.mine_guid)
    _transmogrify_now_details(now_app, now_sub)
    _transmogrify_blasting_activities(now_app, now_sub)
    _transmogrify_state_of_lane(now_app,now_sub)
    #Activities   
    _transmogrify_camp_activities(now_app, now_sub)
    _transmogrify_cut_lines_polarization_survey(now_app,now_sub)
    _transmogrify_exploration_surface_drilling(now_app,now_sub)
    _transmogrify_mechanical_trenching(now_app, now_sub)
    _transmogrify_placer_operations(now_app,now_sub)
    _transmogrify_sand_and_gravel_activities(now_app,now_sub)
    _transmogrify_surface_bulk_sample(now_app,now_sub)
    _transmogrify_underground_exploration(now_app,now_sub)
    _transmogrify_water_supply(now_app, now_sub)

    return now_app


def _transmogrify_now_details(a, s):
    a.now_message_id = s.messageid
    a.now_tracking_number = s.trackingnumber
    a.notice_of_work_type_code = code_lookup(app_models.NOWApplicationType,
                                             s.noticeofworktype,'notice_of_work_type_code')
    a.now_application_status_code = code_lookup(app_models.NOWApplicationStatus,
                                                s.status,'now_application_status_code')
    a.submitted_date = s.submitteddate
    a.received_date = s.receiveddate
    a.latitude = s.latitude
    a.longitude = s.longitude
    a.property_name = s.nameofproperty
    a.tenure_number = s.tenurenumbers
    a.proposed_start_date = s.proposedstartdate
    a.proposed_end_date = s.proposedenddate
    return

def _transmogrify_blasting_activities(a, s):
    if s.bcexplosivespermitissued or s.bcexplosivespermitnumber or s.bcexplosivespermitexpiry or s.storeexplosivesonsite:
        a.blasting = app_models.BlastingOperation(
            explosive_permit_issued=s.bcexplosivespermitissued == 'Yes',
            explosive_permit_number=s.bcexplosivespermitnumber,
            explosive_permit_expiry_date=s.bcexplosivespermitexpiry,
            has_storage_explosive_on_site=s.storeexplosivesonsite == 'Yes')
    return

def _transmogrify_state_of_lane(a, s):
    if s.landcommunitywatershed or s.archsitesaffected:
        a.state_of_land = app_models.StateOfLand(
            has_community_water_shed=s.landcommunitywatershed == 'Yes',
            arch_sites_affected=s.archsitesaffected == 'Yes'
        )
    return



#Activities   

def _transmogrify_camp_activities(a, s):
    if s.cbsfreclamation or s.cbsfreclamationcost or s.campbuildstgetotaldistarea or s.fuellubstoreonsite:

        camp = app_models.Camp(
            reclamation_description=s.cbsfreclamation,
            reclamation_cost=s.cbsfreclamationcost,
            total_disturbed_area=s.campbuildstgetotaldistarea,
            total_disturbed_area_unit_type_code='HA',
            has_fuel_stored=s.fuellubstoreonsite == 'Yes',
        )

        if s.campdisturbedarea or s.camptimbervolume:
            camp_detail = app_models.CampDetail(
                activity_type_description='Camps',
                disturbed_area=s.campdisturbedarea,
                timber_volume=s.camptimbervolume)
            camp.details.append(camp_detail)

        if s.bldgdisturbedarea or s.bldgtimbervolume:
            camp_detail = app_models.CampDetail(
                activity_type_description='Buildings',
                disturbed_area=s.bldgdisturbedarea,
                timber_volume=s.bldgtimbervolume)
            camp.details.append(camp_detail)

        if s.stgedisturbedarea or s.stgetimbervolume:
            camp_detail = app_models.CampDetail(
                activity_type_description='Staging Area',
                disturbed_area=s.stgedisturbedarea,
                timber_volume=s.stgetimbervolume)
            camp.details.append(camp_detail)

        a.camps = camp

    return

def _transmogrify_cut_lines_polarization_survey(a, s):
    if s.cutlinesreclamation or s.cutlinesreclamationcost or s.cutlinesexplgriddisturbedarea:

        clps = app_models.CutLinesPolarizationSurvey(
            reclamation_description=s.cutlinesreclamation,
            reclamation_cost=s.cutlinesreclamationcost,
            total_disturbed_area=s.cutlinesexplgriddisturbedarea,
            total_disturbed_area_unit_type_code='HA')

        if s.cutlinesexplgridtotallinekms or s.cutlinesexplgridtimbervolume:
            clps_detial = app_models.CutLinesPolarizationSurveyDetail(
                cut_line_length=s.cutlinesexplgridtotallinekms,
                timber_volume=s.cutlinesexplgridtimbervolume)
            clps.details.append(clps_detial)

        a.cut_lines_polarization_survey = clps

    return

def _transmogrify_exploration_surface_drilling(a, s):
    if s.expsurfacedrillreclcorestorage or s.expsurfacedrillreclamation or s.expsurfacedrillreclamationcost or s.expsurfacedrilltotaldistarea:
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
    if s.mechtrenchingreclamation or s.mechtrenchingreclamationcost or s.mechtrenchingtotaldistarea:
        mech = app_models.MechanicalTrenching(
            reclamation_description=s.mechtrenchingreclamation,
            reclamation_cost=s.mechtrenchingreclamationcost,
            total_disturbed_area=s.mechtrenchingtotaldistarea,
            total_disturbed_area_unit_type_code='HA')

        for sd in s.mech_trenching_activity:
            mech_detail = app_models.MechanicalTrenchingDetail(
                activity_type_description=sd.type,
                number_of_sites=sd.numberofsites,
                disturbed_area=sd.disturbedarea,
                timber_volume=sd.timbervolume)
            mech.details.append(mech_detail)

        a.mechanical_trenching = mech
    return

def _transmogrify_placer_operations(a, s):
    if s.placerundergroundoperations or s.placerhandoperations or s.placerhandoperations or s.placerreclamationarea or s.placerreclamation or s.placerreclamationcost:
        placer = app_models.PlacerOperation(
            reclamation_description=s.placerreclamation,
            reclamation_cost=s.placerreclamationcost,
            total_disturbed_area=s.placerreclamationarea,
            total_disturbed_area_unit_type_code='HA',
            is_underground=s.placerundergroundoperations == 'Yes',
            is_hand_operation=s.placerhandoperations == 'Yes')

        for proposed_placer_activity in s.proposed_placer_activity:
            proposed_placer_detail = app_models.PlacerOperationDetail(
                activity_type_description=proposed_placer_activity.type,
                disturbed_area=proposed_placer_activity.disturbedarea,
                timber_volume=proposed_placer_activity.timbervolume,
                width=proposed_placer_activity.width,
                length=proposed_placer_activity.length,
                depth=proposed_placer_activity.depth,
                quantity=proposed_placer_activity.quantity)
            
            etl_activity_detail = app_models.ETLActivityDetail(placeractivityid=proposed_placer_activity.placeractivityid)
            proposed_placer_detail._etl_activity_details.append(etl_activity_detail)

            proposed_placer_xref = app_models.ActivitySummaryDetailXref(summary=placer, detail=proposed_placer_detail, is_existing=False)
            

        for existing_placer_activity in s.existing_placer_activity:
            existing_placer_detail_etl = app_models.ETLActivityDetail.query.filter_by(
                placeractivityid=existing_placer_activity.placeractivityid).first()

            if existing_placer_detail_etl:
                existing_placer_detail = existing_placer_detail_etl.activity_detail
            else:
                existing_placer_detail = app_models.PlacerOperationDetail(
                    activity_type_description=existing_placer_activity.type,
                    disturbed_area=existing_placer_activity.disturbedarea,
                    timber_volume=existing_placer_activity.timbervolume,
                    width=existing_placer_activity.width,
                    length=existing_placer_activity.length,
                    depth=existing_placer_activity.depth,
                    quantity=existing_placer_activity.quantity)

            etl_activity_detail = app_models.ETLActivityDetail(placeractivityid=existing_placer_activity.placeractivityid)
            existing_placer_detail._etl_activity_details.append(etl_activity_detail)

            existing_placer_xref = app_models.ActivitySummaryDetailXref(summary=placer, detail=existing_placer_detail, is_existing=True)

        a.placer_operation = placer
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
            total_minable_reserves_unit_type_code=code_lookup(app_models.UnitType, unit_type_map[s.sandgrvqrytotalmineresunits],'unit_type_code'),
            total_annual_extraction=s.sandgrvqryannualextrest,
            total_annual_extraction_unit_type_code=code_lookup(app_models.UnitType,unit_type_map[s.sandgrvqryannualextrestunits],'unit_type_code'),
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

        for detail in s.sand_grv_qry_activity:
            a.sand_and_gravel.details.append(app_models.SandGravelQuarryOperationDetail(
                disturbed_area=detail.disturbedarea, 
                timber_volume=detail.timbervolume,
                activity_type_description=detail.type)
            )

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

        for detail in s.surface_bulk_sample_activity:
            a.surface_bulk_sample.details.append(app_models.SurfaceBulkSampleDetail(
                disturbed_area=detail.disturbedarea, 
                timber_volume=detail.timbervolume,
                activity_type_description=detail.type)
            )
    return

def _transmogrify_underground_exploration(a, s):
    if (s.underexptotalore or s.underexptotaloreunits or s.underexpreclamation
        or s.underexpreclamationcost or s.underexptotalwaste
        or s.underexptotalwasteunits or s.underexptotaldistarea):
        a.underground_exploration = app_models.UndergroundExploration(
            reclamation_description=s.underexpreclamation,
            reclamation_cost=s.underexpreclamationcost,
            total_disturbed_area=s.underexptotaldistarea,
            total_disturbed_area_unit_type_code='HA',

            total_ore_amount=s.underexptotalore,
            total_ore_unit_type_code=code_lookup(app_models.UnitType,unit_type_map[s.underexptotaloreunits], 'unit_type_code'),
            total_waste_amount=s.underexptotalwaste,
            total_waste_unit_type_code=code_lookup(app_models.UnitType,unit_type_map[s.underexptotalwasteunits],'unit_type_code')
        )
    
    for new_uea in s.under_exp_new_activity:
        a.underground_exploration.details.append(app_models.UndergroundExplorationDetail(
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


    for rehab_uea in s.under_exp_rehab_activity:
        a.underground_exploration.details.append(app_models.UndergroundExplorationDetail(
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

    for surface_uea in s.under_exp_surface_activity:
        a.underground_exploration.details.append(app_models.UndergroundExplorationDetail(
            activity_type_description=surface_uea.type,
            quantity=surface_uea.quantity,
            disturbed_area=surface_uea.disturbedarea,
            timber_volume=surface_uea.timbervolume,
            underground_exploration_type_code='SUR'
            )
        )
    
    return

def _transmogrify_water_supply(a, s):
    for wsa in s.water_source_activity:
        a.water_source_activites.details.append(app_models.WaterSupplyDetail(
            supply_source_description=wsa.sourcewatersupply,
            supply_source_type=wsa.type, 
            water_use_description=wsa.useofwater, 
            estimate_rate=wsa.estimateratewater, 
            pump_size=wsa.pumpsizeinwater, 
            intake_location=wsa.locationwaterintake
        ))
    return
