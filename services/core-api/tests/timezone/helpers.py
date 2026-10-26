"""Shared Scenario / Instant / Expected / Actual / Result table for the BC timezone backend tests."""

# (scenario, UTC instant, expected BC local text, expected timezone abbreviation)
LOCAL_TIME_MATRIX = [
    ("Past winter stays UTC-8", "2025-12-15T20:00:00+00:00", "Dec 15 2025, 12:00", "PST"),
    ("Past winter stays UTC-8", "2026-01-15T20:00:00+00:00", "Jan 15 2026, 12:00", "PST"),
    ("Summer unchanged", "2026-07-01T19:00:00+00:00", "Jul 01 2026, 12:00", "PDT"),
    ("Day before old fall-back", "2026-10-31T23:00:00+00:00", "Oct 31 2026, 16:00", "PDT"),
    ("Old fall-back date, before 2am", "2026-11-01T08:30:00+00:00", "Nov 01 2026, 01:30", "PDT"),
    ("Old fall-back date, after 2am", "2026-11-01T09:30:00+00:00", "Nov 01 2026, 02:30", "MST"),
    ("New winter behaviour", "2026-12-15T20:00:00+00:00", "Dec 15 2026, 13:00", "MST"),
    ("No spring-forward in 2027", "2027-03-15T20:00:00+00:00", "Mar 15 2027, 13:00", "MST"),
]


def table(rows):
    header = ("Scenario", "Instant", "Expected", "Actual", "Result")
    body = [(s, i, str(e), str(a), "PASS" if e == a else "FAIL") for s, i, e, a in rows]
    widths = [max(len(r[c]) for r in [header] + body) for c in range(len(header))]
    line = lambda r: " | ".join(v.ljust(widths[c]) for c, v in enumerate(r))
    return "\n".join([line(header), "-+-".join("-" * w for w in widths)] + [line(r) for r in body])


def assert_rows(rows):
    """Fail with the full table when any row's expected and actual values differ."""
    failed = [r for r in rows if r[2] != r[3]]
    assert not failed, "\n" + table(rows)
