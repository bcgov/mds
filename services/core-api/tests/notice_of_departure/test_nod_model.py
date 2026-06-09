from unittest.mock import patch

from app.api.ministry_contacts.models.distribution_list import DistributionListNames
from tests.factories import NoticeOfDepartureFactory


@patch('app.api.services.email_service.EmailService.send_email_async')
def test_nod_submission_email(mock_send_async, db_session):
    nod = NoticeOfDepartureFactory()
    nod.nod_submission_email()

    mock_send_async.assert_called_once()
    call = mock_send_async.call_args
    assert call.kwargs['distribution_list'] == DistributionListNames.NOTICE_OF_DEPARTURE
    assert call.kwargs['reference_table'] == 'notice_of_departure'
    assert call.kwargs['reference_email_type'] == 'nod_submission'
    assert call.kwargs['recipients'] == []
