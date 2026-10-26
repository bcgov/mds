"""Incident handling around the BC permanent UTC-7 change (no fall-back on 2026-11-01)."""
from datetime import datetime, timedelta
from datetime import timezone as dt_timezone
from unittest.mock import patch

import pytest
from app.api.incidents.models.mine_incident import MineIncident
from freezegun import freeze_time
from tests.factories import MineIncidentFactory
from tests.timezone.helpers import BC_TIME_MATRIX, assert_rows

FROZEN_AFTER_ALL_ROWS = "2027-06-01T00:00:00+00:00"


def _utc(iso):
    return datetime.fromisoformat(iso).astimezone(dt_timezone.utc)


class TestIncidentValidation:
    """Incident 'not in the future' validation"""

    @staticmethod
    def _outcome(incident_timestamp):
        try:
            MineIncident(
                incident_timestamp=incident_timestamp,
                incident_timezone="Canada/Pacific",
                incident_description="x")
            return "accepted"
        except AssertionError as error:
            return str(error)

    def test_future_check_around_old_fall_back(self):
        """Compares instants, so results are identical before and after the change"""
        with freeze_time("2026-11-01T09:30:00+00:00"):
            rows = [
                ("1 minute earlier", "2026-11-01T09:29:00Z", "accepted",
                 self._outcome(_utc("2026-11-01T09:29:00+00:00"))),
                ("1 minute later", "2026-11-01T09:31:00Z", "incident_timestamp must not be in the future",
                 self._outcome(_utc("2026-11-01T09:31:00+00:00"))),
            ]
        assert_rows(rows)


class TestIncidentEmails:
    """Incident notification emails"""

    @patch('app.api.services.email_service.EmailService.send_template_email_async')
    def test_ministry_email_shows_bc_time(self, mock_send_async, db_session):
        """Occurred-on and reported-on times in the ministry email"""
        rows = []
        for scenario, instant, _, local_text, abbreviation in BC_TIME_MATRIX:
            mock_send_async.reset_mock()
            with freeze_time(FROZEN_AFTER_ALL_ROWS):
                occurred = _utc(instant)
                incident = MineIncidentFactory(
                    incident_timestamp=occurred,
                    incident_timezone="Canada/Pacific",
                    reported_timestamp=occurred + timedelta(hours=1))
                incident.send_incidents_email()
            context = mock_send_async.call_args_list[0].kwargs['context']['incident']
            expected = local_text.replace(", ", " at ") + f" {abbreviation}"
            actual = context['incident_timestamp']
            rows.append((scenario, instant, expected, actual))
        assert_rows(rows)

    @patch('app.api.services.email_service.EmailService.send_template_email_async')
    def test_email_submitted_time_uses_the_correct_label_at_transition(self, mock_send_async, db_session):
        """The email's Submitted time changes from PDT to MST at the new boundary."""
        occurred = _utc("2026-11-01T08:30:00+00:00")
        reported = _utc("2026-11-01T09:30:00+00:00")
        with freeze_time(FROZEN_AFTER_ALL_ROWS):
            incident = MineIncidentFactory(
                incident_timestamp=occurred,
                incident_timezone="Canada/Pacific",
                reported_timestamp=reported)
            incident.send_incidents_email()

        incident_context = mock_send_async.call_args_list[0].kwargs['context']['incident']
        assert_rows([
            ("Incident Time remains before the transition", occurred.isoformat(),
             "Nov 01 2026 at 01:30 PDT", incident_context['incident_timestamp']),
            ("Submitted time is after the transition", reported.isoformat(),
             "Nov 01 2026 at 02:30 MST", incident_context['reported_timestamp']),
        ])
