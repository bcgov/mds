from app.api.now_applications import models as app_models
from app.api.now_submissions import models as sub_models


def code_lookup(model, description):
    return model.query.filter_by(description=description).first()


def Import(now_submission_message_id):
    now_sub = sub_models.Application.query.get(now_submission_message_id)
    if not now_sub:
        raise Exception('No NOW Submission with message_id')
    now_app = app_models.NOWApplication(mine_guid=now_sub.mine_guid)
    import_now_details(now_app, now_sub)
    return now_app


def import_now_details(na, ns):
    na.now_message_id = ns.messageid
    na.now_tracking_number = ns.trackingnumber

    na.notice_of_work_type_code = code_lookup(app_models.NOWApplicationType,
                                              ns.noticeofworktype).notice_of_work_type_code

    na.now_application_status_code = code_lookup(app_models.NOWApplicationStatus,
                                                 ns.status).now_application_status_code
    na.submitted_date = ns.submitteddate
    na.received_date = ns.receiveddate
    na.latitude = ns.latitude
    na.longitude = ns.longitude
    na.property_name = ns.nameofproperty
    na.tenure_number = ns.tenurenumbers
    na.proposed_start_date = ns.proposedstartdate
    na.proposed_end_date = ns.proposedenddate
    na.save()