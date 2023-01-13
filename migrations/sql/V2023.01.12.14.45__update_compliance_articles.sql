UPDATE compliance_article
SET
    expiry_date = '2022-11-30'
WHERE
    section = '2'
    AND sub_section = '11'
    AND paragraph = '9'
    AND description = 'Toilet Facilities';

UPDATE
    compliance_article
SET
    expiry_date = '9999-12-31'
WHERE
    section = '6'
    AND sub_section = '19'
    AND paragraph = '1'
    AND description = 'Operator''s Responsibility';

DELETE from compliance_article
WHERE
    section = '6'
    AND sub_section = '19'
    AND paragraph = '1'
    AND description = 'Remote Control Operator''s Responsibility';