-- Read-only check that the database tz rules match BC's permanent UTC-7 from 2026-11-01.
-- Run with psql or any SQL client; nothing is modified. Every FAIL row means stale tz data.

-- 1) Server facts (informational)
SELECT version() AS server_version,
       current_setting('TimeZone') AS session_timezone,
       (SELECT setting FROM pg_settings WHERE name = 'timezone_abbreviations') AS abbreviation_set;

-- 2) Offsets and local times for each scenario, both zone names the app uses
WITH scenarios(scenario, instant, expected_offset, expected_local) AS (
    VALUES
    ('Past winter stays UTC-8',        TIMESTAMPTZ '2025-12-15 20:00:00+00', INTERVAL '-08:00', 'Dec 15 2025, 12:00'),
    ('Past winter stays UTC-8',        TIMESTAMPTZ '2026-01-15 20:00:00+00', INTERVAL '-08:00', 'Jan 15 2026, 12:00'),
    ('Summer unchanged',               TIMESTAMPTZ '2026-07-01 19:00:00+00', INTERVAL '-07:00', 'Jul 01 2026, 12:00'),
    ('Day before old fall-back',       TIMESTAMPTZ '2026-10-31 23:00:00+00', INTERVAL '-07:00', 'Oct 31 2026, 16:00'),
    ('Old fall-back date, before 2am', TIMESTAMPTZ '2026-11-01 08:30:00+00', INTERVAL '-07:00', 'Nov 01 2026, 01:30'),
    ('Old fall-back date, after 2am',  TIMESTAMPTZ '2026-11-01 09:30:00+00', INTERVAL '-07:00', 'Nov 01 2026, 02:30'),
    ('New winter behaviour',           TIMESTAMPTZ '2026-12-15 20:00:00+00', INTERVAL '-07:00', 'Dec 15 2026, 13:00'),
    ('No spring-forward in 2027',      TIMESTAMPTZ '2027-03-15 20:00:00+00', INTERVAL '-07:00', 'Mar 15 2027, 13:00')
),
zones(zone) AS (
    VALUES ('America/Vancouver'), ('Canada/Pacific')
),
actual AS (
    SELECT s.scenario,
           z.zone,
           s.instant,
           s.expected_offset,
           s.expected_local,
           (s.instant AT TIME ZONE z.zone) - (s.instant AT TIME ZONE 'UTC') AS actual_offset,
           to_char(s.instant AT TIME ZONE z.zone, 'Mon DD YYYY, HH24:MI')   AS actual_local
    FROM scenarios s CROSS JOIN zones z
)
SELECT zone,
       scenario,
       to_char(instant AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI"Z"') AS instant_utc,
       expected_offset,
       actual_offset,
       expected_local,
       actual_local,
       CASE WHEN expected_offset = actual_offset AND expected_local = actual_local
            THEN 'PASS' ELSE 'FAIL' END AS result
FROM actual
ORDER BY zone, instant;

-- 3) One-line verdict
WITH checks(instant, expected_offset) AS (
    VALUES (TIMESTAMPTZ '2025-12-15 20:00:00+00', INTERVAL '-08:00'),
           (TIMESTAMPTZ '2026-11-01 09:30:00+00', INTERVAL '-07:00'),
           (TIMESTAMPTZ '2026-12-15 20:00:00+00', INTERVAL '-07:00'),
           (TIMESTAMPTZ '2027-03-15 20:00:00+00', INTERVAL '-07:00')
)
SELECT CASE WHEN bool_and((instant AT TIME ZONE 'America/Vancouver') - (instant AT TIME ZONE 'UTC') = expected_offset)
            THEN 'PASS: database tz data includes the BC change'
            ELSE 'FAIL: database tz data is stale (rebuild/upgrade the Postgres image)'
       END AS verdict
FROM checks;

-- 3b) The session should stay UTC (backend principle)
SELECT CASE WHEN current_setting('TimeZone') IN ('UTC', 'Etc/UTC') THEN 'PASS' ELSE 'FAIL' END AS session_timezone_is_utc,
       current_setting('TimeZone') AS actual;

-- 4) For contrast: US/Pacific still falls back, which is why it must not be used for BC
SELECT 'US/Pacific on 2026-12-15 20:00Z' AS scenario,
       (TIMESTAMPTZ '2026-12-15 20:00:00+00' AT TIME ZONE 'US/Pacific') - (TIMESTAMPTZ '2026-12-15 20:00:00+00' AT TIME ZONE 'UTC') AS offset_should_differ_from_BC;
