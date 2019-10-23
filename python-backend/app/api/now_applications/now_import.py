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
    return now_app

def _transmogrify_camp_activities(a, s):
    

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