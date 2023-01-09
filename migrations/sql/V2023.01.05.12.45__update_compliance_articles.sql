-- Expire the following articles so they can be replaced with new articles containing updated language
UPDATE
    compliance_article
SET
    expiry_date = '2022-11-30'
WHERE
    section = '6'
    AND sub_section = '19'
    AND paragraph = '1'
    AND description = 'Operator''s Responsibility';

UPDATE compliance_article
SET
    expiry_date = '2022-11-30'
WHERE
    section = '1'
    AND sub_section = '7'
    AND paragraph = '1'
    AND description = 'Manager''s Responsibility';

UPDATE compliance_article
SET
    expiry_date = '2022-11-30'
WHERE
    section = '1'
    AND sub_section = '7'
    AND paragraph = '2'
    AND description = 'Accident Investigation';

UPDATE compliance_article
SET
    expiry_date = '2022-11-30'
WHERE
    section = '1'
    AND sub_section = '7'
    AND paragraph = '3'
    AND description = 'Dangerous Occurrences';

UPDATE compliance_article
SET
    expiry_date = '2022-11-30'
WHERE
    section = '1'
    AND sub_section = '9'
    AND paragraph = '2'
    AND description = 'General';

UPDATE compliance_article
SET
    expiry_date = '2022-11-30'
WHERE
    section = '1'
    AND sub_section = '11'
    AND paragraph = '9'
    AND description = 'Toilet Facilities';

-- Add new entries with updated language for the articles expired above
INSERT INTO compliance_article
(
    article_act_code,
    section,
    sub_section,
    paragraph,
    sub_paragraph,
    description,
    effective_date,
    expiry_date,
    create_user,
    update_user
)
VALUES

    ('HSRCM','6','19','1',NULL,'Remote Control Operator''s Responsibility','2022-11-30','9999-12-31','system-mds','system-mds'),
    ('HSRCM','1','7','1',NULL,'Reportable Incidents','2022-11-30','9999-12-31','system-mds','system-mds'),
    ('HSRCM','1','7','2',NULL,'Notification of a Reportable Incident','2022-11-30','9999-12-31','system-mds','system-mds'),
    ('HSRCM','1','7','3',NULL,'Release of a Scene of a Reportable Incident','2022-11-30','9999-12-31','system-mds','system-mds'),
    ('HSRCM','1','9','2',NULL,'Monthly Reporting','2022-11-30','9999-12-31','system-mds','system-mds'),
    ('HSRCM','2','11','9',NULL,'Washroom Facilities','2022-11-30','9999-12-31','system-mds','system-mds'),

    -- Add new articles

    ('HSRCM','6','18','3',NULL,'Autonomous and Semi-Autonomous Machines','2022-11-30','9999-12-31','system-mds','system-mds'),
    ('HSRCM','1','7','4',NULL, 'Investigation of a Reportable Incident','2022-11-30','9999-12-31','system-mds','system-mds');


-- Expire (repeal) the following sections

UPDATE compliance_article
SET
    expiry_date = '2022-11-30'
WHERE
    section = '1'
    AND sub_section = '6'
    AND paragraph = '5'
    AND description = 'Accident Investigation';

UPDATE compliance_article
SET
    expiry_date = '2022-11-30'
WHERE
    section = '1'
    AND sub_section = '6'
    AND paragraph = '6'
    AND description = 'Accident Investigation';