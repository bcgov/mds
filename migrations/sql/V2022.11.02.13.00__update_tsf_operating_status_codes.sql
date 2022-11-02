INSERT INTO tsf_operating_status (tsf_operating_status_code, description, active_ind, create_user, display_order, create_timestamp, update_user, update_timestamp)
VALUES
    ('CON', 'Construction', 'Y', 'system-mds', 15, now(), 'system-mds', now()),
    ('CLT', 'Closure - Transition', 'Y', 'system-mds', 40, now(), 'system-mds', now()),
    ('CLA', 'Closure - Active Care', 'Y', 'system-mds', 50, now(), 'system-mds', now()),
    ('CLP', 'Closure - Passive Care', 'Y', 'system-mds', 60, now(), 'system-mds', now())
    ON CONFLICT DO NOTHING;

UPDATE tsf_operating_status
SET description = 'Operation'
WHERE tsf_operating_status_code = 'OPT';

UPDATE tsf_operating_status
SET description = 'Care and Maintenance'
WHERE tsf_operating_status_code = 'CAM';