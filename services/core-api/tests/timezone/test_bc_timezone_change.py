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
from sqlalchemy import func
from sqlalchemy.dialects import postgresql

# (scenario, UTC instant, expected UTC offset in hours)
OFFSET_MATRIX = [
    ("Past winter stays UTC-8", "2025-12-15T20:00:00", -8),
    ("Past winter stays UTC-8", "2026-01-15T20:00:00", -8),
    ("Summer unchanged", "2026-07-01T19:00:00", -7),
    ("Day before old fall-back", "2026-10-31T23:00:00", -7),
    ("Old fall-back date, before 2am", "2026-11-01T08:30:00", -7),
    ("Old fall-back date, after 2am", "2026-11-01T09:30:00", -7),
    ("New winter behaviour", "2026-12-15T20:00:00", -7),
    ("No spring-forward in 2027", "2027-03-15T20:00:00", -7),
]


def _table(rows):
    header = ("Scenario", "Instant", "Expected", "Actual", "Result")
    body = [(s, i, str(e), str(a), "PASS" if e == a else "FAIL") for s, i, e, a in rows]
    widths = [max(len(r[c]) for r in [header] + body) for c in range(len(header))]
    line = lambda r: " | ".join(v.ljust(widths[c]) for c, v in enumerate(r))
    return "\n".join([line(header), "-+-".join("-" * w for w in widths)] + [line(r) for r in body])


def _assert_rows(rows):
    failed = [r for r in rows if r[2] != r[3]]
    assert not failed, "\n" + _table(rows)


def _offset_hours(zone_name, naive_utc_iso):
    utc = datetime.fromisoformat(naive_utc_iso)
    offset = pytz.timezone(zone_name).fromutc(utc).utcoffset()
    assert offset is not None
    return offset.total_seconds() / 3600


class TestTimezoneData:
    """Backend tz data"""

    @pytest.mark.parametrize("zone", ["Canada/Pacific", "America/Vancouver"])
    def test_pacific_offsets(self, zone):
        """BC offsets before and after 2026-11-01"""
        rows = [(f"{zone}: {s}", i, f"{e:+g}h", f"{_offset_hours(zone, i):+g}h")
                for s, i, e in OFFSET_MATRIX]
        _assert_rows(rows)

    def test_us_pacific_is_not_bc(self):
        """US/Pacific diverges from BC after 2026-11-01 (why it must not be used)"""
        assert _offset_hours("US/Pacific", "2026-12-15T20:00:00") == -8
        assert _offset_hours("America/Vancouver", "2026-12-15T20:00:00") == -7


class TestEmailTimeFormatting:
    """Email time formatting"""

    # (scenario, naive UTC value, expected local text and zone abbreviation)
    CASES = [
        ("Past winter", datetime(2025, 12, 15, 20, 0), "Dec 15 2025 at 12:00 PST"),
        ("Summer", datetime(2026, 7, 1, 19, 0), "Jul 01 2026 at 12:00 PDT"),
        ("Old fall-back date, before 2am", datetime(2026, 11, 1, 8, 30), "Nov 01 2026 at 01:30 PDT"),
        ("Old fall-back date, after 2am", datetime(2026, 11, 1, 9, 30), "Nov 01 2026 at 02:30 MST"),
        ("New winter", datetime(2026, 12, 15, 20, 0), "Dec 15 2026 at 13:00 MST"),
        ("2027 spring", datetime(2027, 3, 15, 20, 0), "Mar 15 2027 at 13:00 MST"),
    ]

    @pytest.mark.parametrize("zone", ["Canada/Pacific", "America/Vancouver"])
    def test_local_time_in_emails(self, zone):
        """Incident and report emails show the right BC hour"""
        rows = []
        for scenario, value, expected in self.CASES:
            actual = format_email_datetime_to_string(value, zone)
            rows.append((f"{zone}: {scenario}", value.isoformat(), expected, actual))
        _assert_rows(rows)


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
        _assert_rows(rows)

    def test_report_overdue_uses_bc_date(self):
        """Mine report overdue flag"""
        rows = [
            ("Control, UTC-8 winter: still Dec 9 in BC", "2025-12-10T07:30:00", False,
             self._is_overdue("2025-12-10T07:30:00", date(2025, 12, 9))),
            ("Due Nov 1, 00:30 BC on Nov 2 after the change", "2026-11-02T07:30:00", True,
             self._is_overdue("2026-11-02T07:30:00", date(2026, 11, 1))),
        ]
        _assert_rows(rows)

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
        _assert_rows(rows)

    def test_no_us_pacific_left_in_backend(self):
        """No US/Pacific references remain in app code"""
        app_dir = pathlib.Path(__file__).resolve().parents[2] / "app"
        hits = sorted(
            f"{p.relative_to(app_dir)}:{n}"
            for p in app_dir.rglob("*.py")
            for n, text in enumerate(p.read_text(errors="ignore").splitlines(), 1)
            if "US/Pacific" in text)
        _assert_rows([("US/Pacific references in app/", "n/a", "none", ", ".join(hits) or "none")])
