from app.api.now_applications import models as app_models
from app.api.now_submissions import models as sub_models
from app.api.mms_now_submissions import models as mms_sub_models

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
    mms_now_sub = mms_sub_models.MMSApplication.query.get(now_submission_message_id)

    if not now_sub:
        raise Exception('No NOW Submission with message_id')

    now_app = app_models.NOWApplication(mine_guid=now_sub.mine_guid)
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
    now_app.now_message_id = now_sub.messageid
    now_app.now_tracking_number = now_sub.trackingnumber
    now_app.notice_of_work_type_code = code_lookup(app_models.NOWApplicationType,
                                             now_sub.noticeofworktype,'notice_of_work_type_code')
    now_app.now_application_status_code = code_lookup(app_models.NOWApplicationStatus,
                                                now_sub.status,'now_application_status_code')
    now_app.submitted_date = now_sub.submitteddate
    now_app.received_date = now_sub.receiveddate
    now_app.latitude = now_sub.latitude
    now_app.longitude = now_sub.longitude
    now_app.property_name = now_sub.nameofproperty
    now_app.tenure_number = now_sub.tenurenumbers
    now_app.proposed_start_date = now_sub.proposedstartdate
    now_app.proposed_end_date = now_sub.proposedenddate
    return

def _transmogrify_blasting_activities(now_app, now_sub, mms_now_sub):
    if now_sub.bcexplosivespermitissued or now_sub.bcexplosivespermitnumber or now_sub.bcexplosivespermitexpiry or now_sub.storeexplosivesonsite:
        now_app.blasting = app_models.BlastingOperation(
            explosive_permit_issued=now_sub.bcexplosivespermitissued == 'Yes',
            explosive_permit_number=now_sub.bcexplosivespermitnumber,
            explosive_permit_expiry_date=now_sub.bcexplosivespermitexpiry,
            has_storage_explosive_on_site=now_sub.storeexplosivesonsite == 'Yes')
    return

def _transmogrify_state_of_land(now_app, now_sub, mms_now_sub):
    if now_sub.landcommunitywatershed or now_sub.archsitesaffected:
        now_app.state_of_land = app_models.StateOfLand(
            has_community_water_shed=now_sub.landcommunitywatershed == 'Yes',
            has_archaeology_sites_affected=now_sub.archsitesaffected == 'Yes'
        )
    return


#Activities   
def _transmogrify_camp_activities(now_app, now_sub, mms_now_sub):
    if now_sub.cbsfreclamation or now_sub.cbsfreclamationcost or now_sub.campbuildstgetotaldistarea or now_sub.fuellubstoreonsite:

        camp = app_models.Camp(
            reclamation_description=now_sub.cbsfreclamation,
            reclamation_cost=now_sub.cbsfreclamationcost,
            total_disturbed_area=now_sub.campbuildstgetotaldistarea,
            total_disturbed_area_unit_type_code='HA',
            has_fuel_stored=now_sub.fuellubstoreonsite == 'Yes',
        )

        if now_sub.campdisturbedarea or now_sub.camptimbervolume:
            camp_detail = app_models.CampDetail(
                activity_type_description='Camps',
                disturbed_area=now_sub.campdisturbedarea,
                timber_volume=now_sub.camptimbervolume)
            camp.details.append(camp_detail)

        if now_sub.bldgdisturbedarea or now_sub.bldgtimbervolume:
            camp_detail = app_models.CampDetail(
                activity_type_description='Buildings',
                disturbed_area=now_sub.bldgdisturbedarea,
                timber_volume=now_sub.bldgtimbervolume)
            camp.details.append(camp_detail)

        if now_sub.stgedisturbedarea or now_sub.stgetimbervolume:
            camp_detail = app_models.CampDetail(
                activity_type_description='Staging Area',
                disturbed_area=now_sub.stgedisturbedarea,
                timber_volume=now_sub.stgetimbervolume)
            camp.details.append(camp_detail)

        now_app.camps = camp

    return

def _transmogrify_cut_lines_polarization_survey(now_app, now_sub, mms_now_sub):
    if now_sub.cutlinesreclamation or now_sub.cutlinesreclamationcost or now_sub.cutlinesexplgriddisturbedarea:

        clps = app_models.CutLinesPolarizationSurvey(
            reclamation_description=now_sub.cutlinesreclamation,
            reclamation_cost=now_sub.cutlinesreclamationcost,
            total_disturbed_area=now_sub.cutlinesexplgriddisturbedarea,
            total_disturbed_area_unit_type_code='HA')

        if now_sub.cutlinesexplgridtotallinekms or now_sub.cutlinesexplgridtimbervolume:
            clps_detial = app_models.CutLinesPolarizationSurveyDetail(
                cut_line_length=now_sub.cutlinesexplgridtotallinekms,
                timber_volume=now_sub.cutlinesexplgridtimbervolume)
            clpnow_sub.details.append(clps_detial)

        now_app.cut_lines_polarization_survey = clps

    return

def _transmogrify_exploration_surface_drilling(now_app, now_sub, mms_now_sub):
    if now_sub.expsurfacedrillreclcorestorage or now_sub.expsurfacedrillreclamation or now_sub.expsurfacedrillreclamationcost or now_sub.expsurfacedrilltotaldistarea:
        esd = app_models.ExplorationSurfaceDrilling(
            reclamation_description=now_sub.expsurfacedrillreclamation,
            reclamation_cost=now_sub.expsurfacedrillreclamationcost,
            total_disturbed_area=now_sub.expsurfacedrilltotaldistarea,
            reclamation_core_storage=now_sub.expsurfacedrillreclcorestorage,
            total_disturbed_area_unit_type_code='HA')

        for sd in now_sub.exp_surface_drill_activity:
            esd_detail = app_models.ExplorationSurfaceDrillingDetail(
                activity_type_description=sd.type,
                number_of_sites=sd.numberofsites,
                disturbed_area=sd.disturbedarea,
                timber_volume=sd.timbervolume)
            esd.details.append(esd_detail)

        now_app.exploration_surface_drilling = esd
    return

def _transmogrify_mechanical_trenching(now_app, now_sub, mms_now_sub):
    if now_sub.mechtrenchingreclamation or now_sub.mechtrenchingreclamationcost or now_sub.mechtrenchingtotaldistarea:
        mech = app_models.MechanicalTrenching(
            reclamation_description=now_sub.mechtrenchingreclamation,
            reclamation_cost=now_sub.mechtrenchingreclamationcost,
            total_disturbed_area=now_sub.mechtrenchingtotaldistarea,
            total_disturbed_area_unit_type_code='HA')

        for sd in now_sub.mech_trenching_activity:
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
    existing_etl = app_models.ETLEquipment.query.filter_by(
        equipmentid=e.equipmentid).first()
    if existing_etl:
        return existing_etl.equipment

    equipment = app_models.Equipment(description=e.type, quantity=e.quantity, capacity=e.sizecapacity)
    etl_equipment = app_models.ETLEquipment(equipmentid=e.equipmentid)
    equipment._etl_equipment.append(etl_equipment)

    return equipment


def _transmogrify_exploration_access(now_app, now_sub, mms_now_sub):
    if now_sub.expaccessreclamation or now_sub.expaccessreclamationcost or now_sub.expaccesstotaldistarea:
        exploration_access = app_models.ExplorationAccess(
            reclamation_description=now_sub.expaccessreclamation,
            reclamation_cost=now_sub.expaccessreclamationcost,
            total_disturbed_area=now_sub.expaccesstotaldistarea,
            total_disturbed_area_unit_type_code='HA'
        )

        now_app.exploration_access = exploration_access

def _transmogrify_placer_operations(now_app, now_sub, mms_now_sub):
    if now_sub.placerundergroundoperations or now_sub.placerhandoperations or now_sub.placerhandoperations or now_sub.placerreclamationarea or now_sub.placerreclamation or now_sub.placerreclamationcost:
        placer = app_models.PlacerOperation(
            reclamation_description=now_sub.placerreclamation,
            reclamation_cost=now_sub.placerreclamationcost,
            total_disturbed_area=now_sub.placerreclamationarea,
            total_disturbed_area_unit_type_code='HA',
            is_underground=now_sub.placerundergroundoperations == 'Yes',
            is_hand_operation=now_sub.placerhandoperations == 'Yes')

        for proposed in now_sub.proposed_placer_activity:
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
            

        for existing in now_sub.existing_placer_activity:
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

                etl_detail = app_models.ETLActivityDetail(placeractivityid=existing.placeractivityid)
                existing_detail._etl_activity_details.append(etl_detail)

            existing_xref = app_models.ActivitySummaryDetailXref(summary=placer, detail=existing_detail, is_existing=True)

        for e in now_sub.placer_equip:
            equipment = _transmogrify_equipment(e)
            placer.equipment.append(equipment)

        now_app.placer_operation = placer
    return

def _transmogrify_settling_ponds(now_app, now_sub, mms_now_sub):
    if now_sub.pondsreclamation or now_sub.pondsreclamationcost or now_sub.pondstotaldistarea or now_sub.pondsexfiltratedtoground or now_sub.pondsrecycled or now_sub.pondsdischargedtoenv:
        settling_pond = app_models.SettlingPond(
            reclamation_description=now_sub.pondsreclamation,
            reclamation_cost=now_sub.pondsreclamationcost,
            total_disturbed_area=now_sub.pondstotaldistarea,
            total_disturbed_area_unit_type_code='HA',
            is_ponds_exfiltrated=now_sub.pondsexfiltratedtoground == 'Yes',
            is_ponds_recycled=now_sub.pondsrecycled == 'Yes',
            is_ponds_discharged=now_sub.pondsdischargedtoenv == 'Yes')

        for proposed in now_sub.proposed_settling_pond:
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
            
        for existing in now_sub.existing_settling_pond:
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

            existing_xref = app_models.ActivitySummaryDetailXref(summary=settling_pond, detail=existing_detail, is_existing=True)

        now_app.settling_pond = settling_pond
    return


def _transmogrify_blasting_activities(now_app, now_sub, mms_now_sub):
    if now_sub.bcexplosivespermitissued or now_sub.bcexplosivespermitnumber or now_sub.bcexplosivespermitexpiry or now_sub.storeexplosivesonsite:
        now_app.blasting = app_models.BlastingOperation(
            explosive_permit_issued=now_sub.bcexplosivespermitissued == 'Yes',
            explosive_permit_number=now_sub.bcexplosivespermitnumber,
            explosive_permit_expiry_date=now_sub.bcexplosivespermitexpiry,
            has_storage_explosive_on_site=now_sub.storeexplosivesonsite == 'Yes')
    return


def _transmogrify_sand_and_gravel_activities(now_app, now_sub, mms_now_sub):

    if (now_sub.sandgrvqrydepthoverburden or now_sub.sandgrvqrydepthtopsoil or now_sub.sandgrvqrystabilizemeasures
            or now_sub.sandgrvqrywithinaglandres or now_sub.sandgrvqryalrpermitnumber
            or now_sub.sandgrvqrylocalgovsoilrembylaw or now_sub.sandgrvqryofficialcommplan
            or now_sub.sandgrvqrylandusezoning or now_sub.sandgrvqryendlanduse or now_sub.sandgrvqrytotalmineres
            or now_sub.sandgrvqrytotalmineresunits or now_sub.sandgrvqryannualextrest
            or now_sub.sandgrvqryannualextrestunits or now_sub.sandgrvqryreclamation
            or now_sub.sandgrvqryreclamationbackfill or now_sub.sandgrvqryreclamationcost
            or now_sub.sandgrvqrygrdwtravgdepth or now_sub.sandgrvqrygrdwtrexistingareas
            or now_sub.sandgrvqrygrdwtrtestpits or now_sub.sandgrvqrygrdwtrtestwells or now_sub.sandgrvqrygrdwtrother
            or now_sub.sandgrvqrygrdwtrmeasprotect or now_sub.sandgrvqryimpactdistres
            or now_sub.sandgrvqryimpactdistwater or now_sub.sandgrvqryimpactnoise
            or now_sub.sandgrvqryimpactprvtaccess or now_sub.sandgrvqryimpactprevtdust
            or now_sub.sandgrvqryimpactminvisual):
        now_app.sand_and_gravel = app_models.SandGravelQuarryOperation(
            average_overburden_depth=now_sub.sandgrvqrydepthoverburden,
            average_top_soil_depth=now_sub.sandgrvqrydepthtopsoil,
            stability_measures_description=now_sub.sandgrvqrystabilizemeasures,
            is_agricultural_land_reserve=now_sub.sandgrvqrywithinaglandres == 'Yes',
            agri_lnd_rsrv_permit_application_number=now_sub.sandgrvqryalrpermitnumber,
            has_local_soil_removal_bylaw=now_sub.sandgrvqrylocalgovsoilrembylaw == 'Yes',
            community_plan=now_sub.sandgrvqryofficialcommplan,
            land_use_zoning=now_sub.sandgrvqrylandusezoning,
            proposed_land_use=now_sub.sandgrvqryendlanduse,
            total_mineable_reserves=now_sub.sandgrvqrytotalmineres,
            total_mineable_reserves_unit_type_code=code_lookup(app_models.UnitType, unit_type_map[now_sub.sandgrvqrytotalmineresunits],'unit_type_code'),
            total_annual_extraction=now_sub.sandgrvqryannualextrest,
            total_annual_extraction_unit_type_code=code_lookup(app_models.UnitType,unit_type_map[now_sub.sandgrvqryannualextrestunits],'unit_type_code'),
            reclamation_description=now_sub.sandgrvqryreclamation,
            reclamation_backfill_detail=now_sub.sandgrvqryreclamationbackfill,
            reclamation_cost=now_sub.sandgrvqryreclamationcost,
            average_groundwater_depth=now_sub.sandgrvqrygrdwtravgdepth,
            has_groundwater_from_existing_area=now_sub.sandgrvqrygrdwtrexistingareas == 'Yes',
            has_groundwater_from_test_pits=now_sub.sandgrvqrygrdwtrtestpits == 'Yes',
            has_groundwater_from_test_wells=now_sub.sandgrvqrygrdwtrtestwells == 'Yes',
            groundwater_from_other_description=now_sub.sandgrvqrygrdwtrother,
            groundwater_protection_plan=now_sub.sandgrvqrygrdwtrmeasprotect,
            nearest_residence_distance=now_sub.sandgrvqryimpactdistres,
            nearest_water_source_distance=now_sub.sandgrvqryimpactdistwater,
            noise_impact_plan=now_sub.sandgrvqryimpactnoise,
            secure_access_plan=now_sub.sandgrvqryimpactprvtaccess,
            dust_impact_plan=now_sub.sandgrvqryimpactprevtdust,
            visual_impact_plan=now_sub.sandgrvqryimpactminvisual)

        for detail in now_sub.sand_grv_qry_activity:
            now_app.sand_and_gravel.details.append(app_models.SandGravelQuarryOperationDetail(
                disturbed_area=detail.disturbedarea, 
                timber_volume=detail.timbervolume,
                activity_type_description=detail.type)
            )

        for e in now_sub.sand_grv_qry_equip:
            equipment = _transmogrify_equipment(e)
            now_app.sand_and_gravel.equipment.append(equipment)

    return

def _transmogrify_surface_bulk_sample(now_app, now_sub, mms_now_sub):
    if (now_sub.surfacebulksampleprocmethods or now_sub.surfacebulksamplereclsephandl or now_sub.surfacebulksamplereclamation
            or now_sub.surfacebulksamplerecldrainmiti or now_sub.surfacebulksamplereclcost
            or now_sub.surfacebulksampletotaldistarea):
        now_app.surface_bulk_sample = app_models.SurfaceBulkSample(
            reclamation_description=now_sub.surfacebulksamplereclamation,
            reclamation_cost=now_sub.surfacebulksamplereclcost,
            total_disturbed_area=now_sub.surfacebulksampletotaldistarea,
            total_disturbed_area_unit_type_code='HA',
            processing_method_description=now_sub.surfacebulksampleprocmethods,
            handling_instructions=now_sub.surfacebulksamplereclsephandl,
            drainage_mitigation_description=now_sub.surfacebulksamplerecldrainmiti)

        for detail in now_sub.surface_bulk_sample_activity:
            now_app.surface_bulk_sample.details.append(app_models.SurfaceBulkSampleDetail(
                disturbed_area=detail.disturbedarea, 
                timber_volume=detail.timbervolume,
                activity_type_description=detail.type)
            )

        for e in now_sub.surface_bulk_sample_equip:
            equipment = _transmogrify_equipment(e)
            now_app.surface_bulk_sample.equipment.append(equipment)
    return

def _transmogrify_underground_exploration(now_app, now_sub, mms_now_sub):
    if (now_sub.underexptotalore or now_sub.underexptotaloreunits or now_sub.underexpreclamation
        or now_sub.underexpreclamationcost or now_sub.underexptotalwaste
        or now_sub.underexptotalwasteunits or now_sub.underexptotaldistarea):
        now_app.underground_exploration = app_models.UndergroundExploration(
            reclamation_description=now_sub.underexpreclamation,
            reclamation_cost=now_sub.underexpreclamationcost,
            total_disturbed_area=now_sub.underexptotaldistarea,
            total_disturbed_area_unit_type_code='HA',

            total_ore_amount=now_sub.underexptotalore,
            total_ore_unit_type_code=code_lookup(app_models.UnitType,unit_type_map[now_sub.underexptotaloreunits], 'unit_type_code'),
            total_waste_amount=now_sub.underexptotalwaste,
            total_waste_unit_type_code=code_lookup(app_models.UnitType,unit_type_map[now_sub.underexptotalwasteunits],'unit_type_code')
        )
    
        for new_uea in now_sub.under_exp_new_activity:
            now_app.underground_exploration.details.append(app_models.UndergroundExplorationDetail(
                activity_type_description=new_uenow_app.type,
                incline=new_uenow_app.incline,
                incline_unit_type_code=code_lookup(app_models.UnitType,unit_type_map[new_uenow_app.inclineunits],'unit_type_code'),
                quantity=new_uenow_app.quantity,
                length=new_uenow_app.length,
                width=new_uenow_app.width,
                height=new_uenow_app.height,
                underground_exploration_type_code='NEW'
                )
            )


        for rehab_uea in now_sub.under_exp_rehab_activity:
            now_app.underground_exploration.details.append(app_models.UndergroundExplorationDetail(
                activity_type_description=rehab_uenow_app.type,
                incline=rehab_uenow_app.incline,
                incline_unit_type_code=code_lookup(app_models.UnitType,unit_type_map[rehab_uenow_app.inclineunits],'unit_type_code'),
                quantity=rehab_uenow_app.quantity,
                length=rehab_uenow_app.length,
                width=rehab_uenow_app.width,
                height=rehab_uenow_app.height,
                underground_exploration_type_code='RHB'
                )
            )

        for surface_uea in now_sub.under_exp_surface_activity:
            now_app.underground_exploration.details.append(app_models.UndergroundExplorationDetail(
                activity_type_description=surface_uenow_app.type,
                quantity=surface_uenow_app.quantity,
                disturbed_area=surface_uenow_app.disturbedarea,
                timber_volume=surface_uenow_app.timbervolume,
                underground_exploration_type_code='SUR'
                )
            )
    
    return

def _transmogrify_water_supply(now_app, now_sub, mms_now_sub):
    if now_sub.water_source_activity:
        water_supply = app_models.WaterSupply()

        for wsa in now_sub.water_source_activity:
            water_supply.details.append(app_models.WaterSupplyDetail(
                supply_source_description=wsnow_app.sourcewatersupply,
                supply_source_type=wsnow_app.type, 
                water_use_description=wsnow_app.useofwater, 
                estimate_rate=wsnow_app.estimateratewater, 
                pump_size=wsnow_app.pumpsizeinwater, 
                intake_location=wsnow_app.locationwaterintake
            ))
        
        now_app.water_supply = water_supply
    return