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
            reclamation_core_storage=s.expsurfacedrillreclcorestorage)

        a.exploration_surface_drilling = esd
    return


def _transmogrify_blasting_activities(a, s):
    blast_act = app_models.BlastingOperation(now_application=a)
    blast_act.explosive_permit_issued = s.bcexplosivespermitissued == 'Yes'
    blast_act.explosive_permit_number = s.bcexplosivespermitnumber
    blast_act.explosive_permit_expiry_date = s.bcexplosivespermitexpiry
    blast_act.has_storage_explosive_on_site = s.storeexplosivesonsite == 'Yes'
    return