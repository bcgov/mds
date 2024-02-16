ALTER TABLE compliance_article
ADD COLUMN IF NOT EXISTS help_reference_link varchar(400),
ADD COLUMN IF NOT EXISTS cim_or_cpo varchar(50);

UPDATE compliance_article
SET
    long_decription = 'Authority to Enter a Mine'
WHERE
    section = '1'
    AND sub_section = '3'
    and paragraph = '1';

UPDATE compliance_article
SET
    long_decription = 'Committee Members - Occupational Health and Safety Committee'
WHERE
    section = '1'
    AND sub_section = '6'
    and paragraph = '1';

UPDATE compliance_article
SET
    long_decription = 'Committee Members - Occupational Health and Safety Committee'
WHERE
    section = '1'
    AND sub_section = '6'
    and paragraph = '2';

UPDATE compliance_article
SET
    long_decription = 'Inspection - Occupational Health and Safety Committee'
WHERE
    section = '1'
    AND sub_section = '6'
    and paragraph = '3';

UPDATE compliance_article
SET
    description = 'OHSC Meeting Minutes',
    long_decription = 'Must be filed with the manager and forwarded to local union, posted at the mine and made available to an inspector upon request.
'
WHERE
    section = '1'
    AND sub_section = '6'
    and paragraph = '4';

INSERT INTO
    compliance_article (
        article_act_code,
        section,
        sub_section,
        paragraph,
        description,
        effective_date,
        expiry_date,
        create_user,
        create_timestamp,
        update_user,
        update_timestamp,
        long_description,
        cim_or_cpo
    )
VALUES
    (
        'HSRCM',
        '1',
        '6',
        '4',
        'Minutes of Meetings',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Minutes of Monthly Meetings - Occupational Health and Safety Committee (OHSC).  Minutes must include a description of conditions found during the monthly OHSC inspections.  Minutes must be signed by the OHSC chairpersons or their designates and be filed with the manager and forwarded to local union, posted at the mine and made available to an inspector upon request.
',
        'CIM'
    );

INSERT INTO
    compliance_article (
        article_act_code,
        section,
        sub_section,
        paragraph,
        sub_paragraph,
        description,
        effective_date,
        expiry_date,
        create_user,
        create_timestamp,
        update_user,
        update_timestamp,
        long_description,
        cim_or_cpo
    )
VALUES
    (
        'HSRCM',
        '1',
        '6',
        '9',
        'h',
        'Musculoskeletal Disorder Preventative Training Program',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Musculoskeletal Disorder (MSD) prevention training program for the Occupational Health and Safety Committee (OHSC).  Training must address the recognition, evaluation and control of MSD risks.  Submissions can also include training records, MSD Prevention programs, and ergonomic assessments.',
        'CIM'
    );

UPDATE compliance_article
SET
    long_decription = 'Minutes shall be kept for crew safety meetings and made available to an inspector upon request.',
    sub_paragraph = '(c)'
WHERE
    section = '1'
    AND sub_section = '6'
    and paragraph = '12';

UPDATE compliance_article
SET
    long_decription = 'Notification of serious injury or loss of life must be reported to the Mine Incident Reporting Line: 1-888-348-0299.  Once reported verbally, documents can be submitted through the incident reporting feature in MineSpace.',
    cim_or_cpo = 'CIM'
WHERE
    AND section = '1'
    AND sub_section = '7'
    and paragraph = '1'
    AND (
        sub_paragraph = '(1)(a)'
        OR sub_paragraph = '(1)(b)'
        OR sub_paragraph = '(2)(a)'
        OR sub_paragraph = '(2)(b)'
        OR sub_paragraph = '(2)(c)'
        OR sub_paragraph = '(2)(d)'
        OR sub_paragraph = '(2)(e)'
        OR sub_paragraph = '(2)(f)'
        OR sub_paragraph = '(2)(g)'
        OR sub_paragraph = '(2)(h)'
    );

UPDATE compliance_article
SET
    long_decription = 'Reportable Incidents should be reported through the Incident reporting feature in MineSpace.'
WHERE
    description = 'Reportable Incidents'
    AND section = '1'
    AND sub_section = '7'
    and paragraph = '1';

INSERT INTO
    compliance_article (
        article_act_code,
        section,
        sub_section,
        paragraph,
        sub_paragraph,
        description,
        effective_date,
        expiry_date,
        create_user,
        create_timestamp,
        update_user,
        update_timestamp,
        long_description,
        cim_or_cpo
    )
VALUES
    (
        'HSRCM',
        '1',
        '7',
        '2',
        '(1)(b)',
        'Notification of a Reportable Incident - Written Notice',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Submit written notices of an incident through the incident reporting feature in MineSpace.',
        'CIM'
    );

INSERT INTO
    compliance_article (
        article_act_code,
        section,
        sub_section,
        paragraph,
        sub_paragraph,
        description,
        effective_date,
        expiry_date,
        create_user,
        create_timestamp,
        update_user,
        update_timestamp,
        long_description,
        cim_or_cpo
    )
VALUES
    (
        'HSRCM',
        '1',
        '7',
        '2',
        '(1)(c)',
        'Incident Investigation Report',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Submit incident investigation reports through the incident reporting feature in MineSpace.  Select the relevant open incident file to add attachments.',
        'CIM'
    );

INSERT INTO
    compliance_article (
        article_act_code,
        section,
        sub_section,
        paragraph,
        description,
        effective_date,
        expiry_date,
        create_user,
        create_timestamp,
        update_user,
        update_timestamp,
        long_description,
        cim_or_cpo
    )
VALUES
    (
        'HSRCM',
        '1',
        '7',
        '3',
        'Release of a Scene of a Reportable Incident',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'OHSC approvals to release a scene of a reportable incident should be submitted through the incident reporting feature in MineSpace.  Select the relevant open incident file to add attachements.',
        'CIM'
    );

UPDATE compliance_article
SET
    long_decription = 'Submit incident investigation reports through the incident reporting feature in MineSpace.  Select the relevant open incident file to add attachments.',
    cim_or_cpo = 'CIM'
WHERE
    description = 'Investigation of a Reportable Incident'
    AND section = '1'
    AND sub_section = '7'
    and paragraph = '4';

INSERT INTO
    compliance_article (
        article_act_code,
        section,
        sub_section,
        paragraph,
        sub_paragraph,
        description,
        effective_date,
        expiry_date,
        create_user,
        create_timestamp,
        update_user,
        update_timestamp,
        long_description
    )
VALUES
    (
        'HSRCM',
        '1',
        '9',
        '2',
        '1',
        'Monthly First Aid Report',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'A monthly report of all reported first aid cases.'
    );

INSERT INTO
    compliance_article (
        article_act_code,
        section,
        sub_section,
        paragraph,
        sub_paragraph,
        description,
        effective_date,
        expiry_date,
        create_user,
        create_timestamp,
        update_user,
        update_timestamp,
        long_description,
        cim_or_cpo
    )
VALUES
    (
        'HSRCM',
        '1',
        '9',
        '2',
        '2',
        'Monthly Medical Aid Report',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'A monthly report of all reported medical aid cases.',
        'CIM'
    );