"""BC permanent UTC-7 (no fall-back on 2026-11-01) readiness checks.

Each test builds a Scenario / Instant / Expected / Actual / Result table and fails with the
full table, so the output can be pasted into a report.
"""
import pathlib
from datetime import date, datetime

import pytest
import pytz
from app.api.mines.explosives_permit.models.explosives_permit import ExplosivesPermit
from app.api.mines.explosives_permit_amendment.models.explosives_permit_amendment import (
    ExplosivesPermitAmendment,
)
from app.api.mines.reports.models.mine_report import MineReport
from app.api.mines.work_information.models.mine_work_information import (
    MineWorkInformation,
)
from app.api.utils.helpers import format_email_datetime_to_string
from freezegun import freeze_time
from sqlalchemy.dialects import postgresql
from tests.timezone.helpers import BC_TIME_MATRIX, BC_TIMEZONES, assert_rows


def _offset_hours(zone_name, naive_utc_iso):
    utc = datetime.fromisoformat(naive_utc_iso)
    if utc.tzinfo is not None:
        utc = utc.astimezone(pytz.UTC).replace(tzinfo=None)
    offset = pytz.timezone(zone_name).fromutc(utc).utcoffset()
    assert offset is not None
    return offset.total_seconds() / 3600


class TestTimezoneData:
    """Backend tz data"""

    @pytest.mark.parametrize("zone", BC_TIMEZONES)
    def test_pacific_offsets(self, zone):
        """BC offsets before and after 2026-11-01"""
        rows = [
            (f"{zone}: {scenario}", instant, f"{expected:+g}h", f"{_offset_hours(zone, instant):+g}h")
            for scenario, instant, expected, _, _ in BC_TIME_MATRIX
        ]
        assert_rows(rows)

    def test_us_pacific_is_not_bc(self):
        """US/Pacific diverges from BC after 2026-11-01 (why it must not be used)"""
        assert _offset_hours("US/Pacific", "2026-12-15T20:00:00+00:00") == -8
        assert _offset_hours("America/Vancouver", "2026-12-15T20:00:00+00:00") == -7


class TestEmailTimeFormatting:
    """Email time formatting"""

    @pytest.mark.parametrize("zone", BC_TIMEZONES)
    def test_local_time_in_emails(self, zone):
        """Incident and report emails show the right BC hour"""
        rows = []
        for scenario, instant, _, local_text, abbreviation in BC_TIME_MATRIX:
            value = datetime.fromisoformat(instant).replace(tzinfo=None)
            actual = format_email_datetime_to_string(value, zone)
            expected = local_text.replace(", ", " at ") + f" {abbreviation}"
            rows.append((f"{zone}: {scenario}", value.isoformat(), expected, actual))
        assert_rows(rows)


class TestExplicitPacificCode:
    """Code that names a Pacific zone"""

    @staticmethod
    def _work_status(frozen_utc, start):
        with freeze_time(frozen_utc):
            return MineWorkInformation(work_start_date=start).work_status

    @staticmethod
    def _is_overdue(frozen_utc, due):
        with freeze_time(frozen_utc):
            return MineReport(due_date=due).is_overdue

    @staticmethod
    def _application_suffix(model, frozen_utc):
        with freeze_time(frozen_utc):
            expr = model.get_next_application_number()
        sql = str(expr.compile(dialect=postgresql.dialect(), compile_kwargs={"literal_binds": True}))
        return sql.split("'-")[1].rstrip("')")

    def test_work_status_uses_bc_date(self):
        """Mine work status 'today'"""
        rows = [
            ("Control, UTC-8 winter: 23:30 BC on Dec 9", "2025-12-10T07:30:00", "Unknown",
             self._work_status("2025-12-10T07:30:00", date(2025, 12, 10))),
            ("00:30 BC on Nov 2 after the change", "2026-11-02T07:30:00", "Working",
             self._work_status("2026-11-02T07:30:00", date(2026, 11, 2))),
        ]
        assert_rows(rows)

    def test_report_overdue_uses_bc_date(self):
        """Mine report overdue flag"""
        rows = [
            ("Control, UTC-8 winter: still Dec 9 in BC", "2025-12-10T07:30:00", False,
             self._is_overdue("2025-12-10T07:30:00", date(2025, 12, 9))),
            ("Due Nov 1, 00:30 BC on Nov 2 after the change", "2026-11-02T07:30:00", True,
             self._is_overdue("2026-11-02T07:30:00", date(2026, 11, 1))),
        ]
        assert_rows(rows)

    @pytest.mark.parametrize("model", [ExplosivesPermit, ExplosivesPermitAmendment])
    def test_application_number_uses_bc_month(self, model):
        """Explosives application number year-month"""
        name = model.__name__
        rows = [
            (f"{name} control, UTC-8: 23:30 BC on Nov 30", "2025-12-01T07:30:00", "2025-11",
             self._application_suffix(model, "2025-12-01T07:30:00")),
            (f"{name} 00:30 BC on Dec 1 after the change", "2026-12-01T07:30:00", "2026-12",
             self._application_suffix(model, "2026-12-01T07:30:00")),
        ]
        assert_rows(rows)

    def test_no_us_pacific_left_in_backend(self):
        """No US/Pacific references remain in app code"""
        app_dir = pathlib.Path(__file__).resolve().parents[2] / "app"
        hits = sorted(
            f"{p.relative_to(app_dir)}:{n}"
            for p in app_dir.rglob("*.py")
            for n, text in enumerate(p.read_text(errors="ignore").splitlines(), 1)
            if "US/Pacific" in text)
        assert_rows([("US/Pacific references in app/", "n/a", "none", ", ".join(hits) or "none")])
