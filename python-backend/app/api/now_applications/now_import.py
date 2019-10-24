from app.api.now_applications import models as app_models
from app.api.now_submissions import models as sub_models


def code_lookup(model, description):
    return model.query.filter_by(description=description).first()


def transmogrify_now(now_submission_message_id):
    now_sub = sub_models.Application.query.get(now_submission_message_id)
    if not now_sub:
        raise Exception('No NOW Submission with message_id')
    now_app = app_models.NOWApplication(mine_guid=now_sub.mine_guid)
    _transmogrify_camp_activities(now_app, now_sub)
    _transmogrify_blasting_activities(now_app, now_sub)
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
            camp_detail = app_models.CampDetail(
                activity_type_description='Camps',
                disturbed_area=s.campdisturbedarea,
                timber_volume=s.camptimbervolume)
            camp.details.append(camp_detail)

        if not s.bldgdisturbedarea or s.bldgtimbervolume is None:
            camp_detail = app_models.CampDetail(
                activity_type_description='Buildings',
                disturbed_area=s.bldgdisturbedarea,
                timber_volume=s.bldgtimbervolume)
            camp.details.append(camp_detail)

        if not s.stgedisturbedarea or s.stgetimbervolume is None:
            camp_detail = app_models.CampDetail(
                activity_type_description='Staging Area',
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
                timber_volume=sd.timbervolume
            )
            esd.details.append(esd_detail)

        a.exploration_surface_drilling = esd
    return

def _transmogrify_mechanical_trenching(a, s):
    if not s.mechtrenchingreclamation or s.mechtrenchingreclamationcost or s.mechtrenchingtotaldistarea is None:
        mech = app_models.MechanicalTrenching(
            reclamation_description=s.mechtrenchingreclamation,
            reclamation_cost=s.mechtrenchingreclamationcost,
            total_disturbed_area=s.mechtrenchingtotaldistarea,
            total_disturbed_area_unit_type_code='HA'
        )

        for sd in s.mech_trenching_activity:
            mech_detail = app_models.MechanicalTrenchingDetail(
                activity_type_description=sd.type,
                number_of_sites=sd.numberofsites,
                disturbed_area=sd.disturbedarea,
                timber_volume=sd.timbervolume
            )
            mech.details.append(mech_detail)

        a.mechanical_trenching.append(mech)
    return

def _transmogrify_placer_operations(a, s):
    if not s.placerundergroundoperations or s.placerhandoperations or s.placerhandoperations or s.placerreclamationarea or s.placerreclamation or s.placerreclamationcost is None:
        placer = app_models.PlacerOperation(
            reclamation_description=s.placerreclamation,
            reclamation_cost=s.placerreclamationcost,
            total_disturbed_area=s.placerreclamationarea,
            total_disturbed_area_unit_type_code='HA',
            is_underground_placer_operations=s.placerundergroundoperations == 'Yes',
            is_hand_operations=s.placerhandoperations == 'Yes'
        )
    
        for sd in s.proposed_placer_activity:
            placer_detail = app_models.PlacerOperationDetail(
                activity_type_description=s.type,
                disturbed_area=sd.disturbedarea,
                timber_volume=sd.timbervolume,
                width=sd.width,
                length=sd.length,
                depth = sd.depth,
                quantity = sd.quantity
            )
            placer.details.append(placer_detail)

        for s_detail in s.existing_placer_activity:
            # TODO: barf

        a.placer_operations.append(placer)
    return

def _transmogrify_blasting_activities(a, s):
    blast_act = app_models.BlastingOperation(now_application=a)
    blast_act.explosive_permit_issued = s.bcexplosivespermitissued == 'Yes'
    blast_act.explosive_permit_number = s.bcexplosivespermitnumber
    blast_act.explosive_permit_expiry_date = s.bcexplosivespermitexpiry
    blast_act.has_storage_explosive_on_site = s.storeexplosivesonsite == 'Yes'
    return