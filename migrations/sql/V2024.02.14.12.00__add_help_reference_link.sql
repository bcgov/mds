ALTER TABLE compliance_article
ADD COLUMN IF NOT EXISTS help_reference_link TEXT,
ADD COLUMN IF NOT EXISTS help_reference_text varchar(400),
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
    section = '1'
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
        '9',
        '3',
        'Annual Safety Statistics Report',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'By January 31 of each year, the mine manager is required to submit a report to the chief inspector, detailing the previous calendar year''s statistics. This report includes: the total hours worked by all mine employees, the number of lost time injuries, the number of occasions where employees received medical aid, the number of days lost, and all values must inlcude or report separately the values for contract workers.',
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
        '10',
        '7',
        '2',
        'Mine Manager''s Right to Refuse Unsafe Work Report',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Mine Manager''s report that describes the incident, shows compliance with the code and describes any remedial actions taken.',
        'CIM'
    );

UPDATE compliance_article
SET
    long_decription = 'Training - Employee training and education, general and adequate training to do their job',
    cim_or_cpo = 'CIM'
WHERE
    section = '1'
    AND sub_section = '11'
    and paragraph = '1';

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
        '11',
        '2',
        'Training',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Manager shall maintain a record and make it available to an inspector upon request.',
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
        '2',
        '1',
        '3',
        'Monitoring Contaminants - Workplace Monitoring Program',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Workplace Monitoring Programs include the recognition, evaluation and control of occupational hazards that can adversely affect a worker''s health.  They must specify the substances and locations to be monitored by a qualified person.  Submissions may also include monitoring results for the program.',
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
        '2',
        '2',
        '1',
        'Workplace to Be Hazard Free',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Housekeeping Program',
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
        '2',
        '3',
        '2',
        'Procedures for the Use, Handling and Disposal of Asbestos or Materials Containing Asbestos',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Notification of work and safe work procedures must be submitted for any work that involves the use, handling, or disposal or asbestos or materials containing asbestos.  Submitted procedures must follow the procedures outlined in WorkSafeBC''s manual "Safework Practices for Handling Asbestos".',
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
        '2',
        '3',
        '11',
        '5',
        'Ionizing Radiation',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Industrial Hygiene Standards for use at uranium drill sites',
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
        '2',
        '8',
        '6',
        'Cap Lamps Specifications',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Procedure for Assessment and Maintenance of Cap Lamps',
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
        '2',
        '10',
        '1',
        'Thermal Environment (Heat or Cold Stress Program)',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'A thermal stress program or a heat and/or cold stress program.  Submissions can also include training material and records for employees on thermal stress, monitoring results of thermal conditions and controls or protective measures.',
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
        '2',
        '12',
        '1',
        'Medical Surveillance Program Requirements',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Medical Surveillance Programs are required for persons in a dust exposure occupation, exposed to excessive noise or exposed to any chemical, physical or radiation agent to ensure that adequate controls are in place to prevent workers from developing adverse health effects from their workplace exposure.',
        'CIM'
    );

UPDATE compliance_article
SET
    long_decription = 'Audiometric testing shall be carried out by a certified audiometric technician.'
WHERE
    section = '2'
    AND sub_section = '12'
    and paragraph = '2';

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
        '2',
        '12',
        '4',
        '2',
        'Hearing Conservation Program',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'A program that includes the recognition, evaluation and control of noise risks to prevent hearing loss.',
        'CIM'
    );

UPDATE compliance_article
SET
    description = 'Application - WHMIS',
    long_decription = 'Application - Workplace Hazardous Materials Information Systems (WHMIS)'
WHERE
    section = '2'
    AND sub_section = '13'
    and paragraph = '1';

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
        '3',
        '4',
        '2',
        'Confined Space Safe Work Procedures',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Confined Space Safe Work Procedures',
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
        '3',
        '7',
        '1',
        '1',
        'Mine Emergency Response Plan (MERP)',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        '',
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
        '3',
        '7',
        '1',
        '4',
        'Mine Emergency Response Plan',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Report of MERP Test',
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
        '3',
        '13',
        '4',
        'Report of Emergency Warning System Test',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Report of Emergency Warning System Test',
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
        '4',
        '3',
        '3',
        '1',
        'Underground Fueling Station Notification',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Notification of the intention to construct an underground fueling station.',
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
        '4',
        '3',
        '4',
        '1',
        'Underground Oil and Grease Storage Area Notification',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Notification of the intention to construct an underground oil and grease storge enclosure for quantities in excess of those outlined in section 4.8.1(2)(b).',
        'CIM'
    );

UPDATE compliance_article
SET
    long_decription = 'Elevator Maintenance Record'
WHERE
    section = '4'
    AND sub_section = '4'
    and paragraph = '15';

UPDATE compliance_article
SET
    long_decription = 'Conveyor Belt Safe Work Procedures: Manager must develop safe work procedures for work or cleanup near moving conveyors.'
WHERE
    section = '4'
    AND sub_section = '4'
    and paragraph = '16';

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
        '4',
        '7',
        '1',
        '1',
        'Trackless Diesel Powered Equipment',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Trackless diesel-powered equipment for use in
(1) Underground coal mines shall comply with CSA Standard CAN/
CSA-M424. 1-88, “Flame-Proof Non-Rail Bound Diesel-Powered
Machine for Use in Gassy Underground Coal Mines” except where
such equipment is not used for cutting, digging and loading of coal
the manager shall provide procedures submitted to the chief inspector.
',
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
        '4',
        '9',
        '1',
        'Rubber-tired and Tracked Mobile Equipment Maintenance',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Rubber-tired and Tracked Mobile Equipment Maintenance',
        'CIM'
    );

UPDATE compliance_article
SET
    long_decription = 'Fire Extinguisher - Mobile Equipment'
WHERE
    section = '4'
    AND sub_section = '9'
    and paragraph = '3';

UPDATE compliance_article
SET
    long_decription = 'Vehicle Requirements - Required Equipment'
WHERE
    section = '4'
    AND sub_section = '9'
    and paragraph = '4';

UPDATE compliance_article
SET
    long_decription = 'Vehicle Requirements - Vehicle Warning Flang and Light'
WHERE
    section = '4'
    AND sub_section = '9'
    and paragraph = '5';

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
        '4',
        '10',
        '1',
        '2',
        'Reversal Procedure for Trains',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'If trains are required to reverse frequently and for lengthy distances, a procedure must be followed that is acceptable to the inspector.',
        'CIM'
    );

UPDATE compliance_article
SET
    long_decription = 'Manager must develop a procedure and a written copy must be provided to trained persons.'
WHERE
    section = '4'
    AND sub_section = '11'
    and paragraph = '1';

UPDATE compliance_article
SET
    long_decription = 'Controls - Building, Machinery, and Equipment'
WHERE
    section = '4'
    AND sub_section = '13'
    and paragraph = '5';

UPDATE compliance_article
SET
    long_decription = 'Fire Extinguisher - Raise Climbers'
WHERE
    section = '4'
    AND sub_section = '13'
    and paragraph = '15';

UPDATE compliance_article
SET
    long_decription = 'Requirements - Guardrails'
WHERE
    section = '4'
    AND sub_section = '14'
    and paragraph = '3';

UPDATE compliance_article
SET
    long_decription = 'Requirements - Suspension Slings'
WHERE
    section = '4'
    AND sub_section = '14'
    and paragraph = '4';

UPDATE compliance_article
SET
    long_decription = 'Inspection - Suspended Work Platform'
WHERE
    section = '4'
    AND sub_section = '14'
    and paragraph = '7';

UPDATE compliance_article
SET
    long_decription = 'Controls - Building, Machinery, and Equipment'
WHERE
    section = '4'
    AND sub_section = '18'
    and paragraph = '10';

UPDATE compliance_article
SET
    long_decription = 'Requirements - Slings'
WHERE
    section = '4'
    AND sub_section = '21'
    and paragraph = '1';

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
        '5',
        '2',
        '1',
        'Electrical Plan',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Plan approved by a registered electrical engineer for the use of electrical energy at any mine and submitted prior to the introduction of electricity at the mine.  A plan is also required for any increases in capacity of an exisitng installation by more than 500 kva.  The plan must show the areas of the mine where the electrical energy is to be transmitted and used, including schematic drawings.',
        'CIM'
    );

UPDATE compliance_article
SET
    long_decription = 'The manager shall give 10 days'' notice to an inspector of intention to start work in, at, or about a mine, including seasonal reactivation.',
    cim_or_cpo = 'CIM'
WHERE
    section = '6'
    AND sub_section = '2'
    and paragraph = '1';

UPDATE compliance_article
SET
    long_decription = 'The manager shall give notice to an inspector of intention to stop work in, at, or about a mine, permanently, indefinitely, or for a definite period exceeding 30 days, and except in an emergency, the notice shall be not less than seven days.',
    cim_or_cpo = 'CIM'
WHERE
    section = '6'
    AND sub_section = '2'
    and paragraph = '2';

UPDATE compliance_article
SET
    long_decription = 'Record of flammable refuse/waste timber underground'
WHERE
    section = '6'
    AND sub_section = '6'
    and paragraph = '1';

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
        '6',
        '8',
        '1',
        'Duty to Keep Plans - Surface Mine Plans',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Accurate mine plans that are updated in accordance with good engineering practices and are prepared on a scale that accords with good engineering practice.',
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
        'MA',
        '6',
        '9',
        '1',
        'Haul Roads Plan',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Haul Roads Plan',
        'Both'
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
        long_description
    )
VALUES
    (
        'MA',
        '6',
        '10',
        '1',
        '7',
        'Dump Runout Zone Procedure',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'A procedure for controlling access to areas within the
potential run-out zone of all dumps; this procedure will prohibit
extended activities below active dumps and provide for a program
of monitoring to allow work below inactive and dormant dumps, the
procedure will include provisions for signage, work under adverse
conditions and shall be reviewed annually.
'
    );

UPDATE compliance_article
SET
    long_decription = 'Exceptions - Mine Design and Procedures'
WHERE
    section = '6'
    AND sub_section = '14'
    and paragraph = '2';

UPDATE compliance_article
SET
    cim_or_cpo = 'CIM',
    long_decription = 'Required to provide plan to CIM and have plan approved by CIM.'
WHERE
    section = '6'
    AND sub_section = '18'
    and paragraph = '1';

UPDATE compliance_article
SET
    long_decription = 'No water must be introduced without following an operating procedure approved by Chief Inspector.'
WHERE
    section = '6'
    AND sub_section = '26'
    and paragraph = '1';

UPDATE compliance_article
SET
    long_decription = 'Requirements - Stairways in Passageways'
WHERE
    section = '6'
    AND sub_section = '27'
    and paragraph = '1';

UPDATE compliance_article
SET
    long_decription = 'Recording - Ventillation Monitoring'
WHERE
    section = '6'
    AND sub_section = '37'
    and paragraph = '3';

UPDATE compliance_article
SET
    long_decription = 'Recording: Quantities, Slips, Measurement for Coal Mines'
WHERE
    section = '6'
    AND sub_section = '39'
    and paragraph = '3';

UPDATE compliance_article
SET
    long_decription = 'Flammable Gas Report'
WHERE
    section = '6'
    AND sub_section = '42'
    and paragraph = '3';

INSERT INTO
    compliance_article (
        article_act_code,
        section,
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
        'MA',
        '6',
        'Chief Inspector''s Authority to Delegate',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Chief Inspector''s Authority to Delegate'
    );

UPDATE compliance_article
SET
    long_decription = 'Mine Hoist Letter of Certification'
WHERE
    section = '7'
    AND sub_section = '2'
    and paragraph = '1';

UPDATE compliance_article
SET
    long_decription = '(1) Commissioning tests shall be conducted on a new or reactivated mine
hoisting plant to ensure compliance with the code.
(2) The results of such tests shall be recorded and a copy sent to an inspector'
WHERE
    section = '7'
    AND sub_section = '2'
    and paragraph = '4';

UPDATE compliance_article
SET
    long_decription = 'Records - Ropes'
WHERE
    section = '7'
    AND sub_section = '4'
    and paragraph = '7';

UPDATE compliance_article
SET
    long_decription = 'Testing required annually. Inspectors may request these records.'
WHERE
    section = '7'
    AND sub_section = '6'
    and paragraph = '6';

UPDATE compliance_article
SET
    long_decription = 'If used, special signals must be posted in at the mine and approved by an inspector'
WHERE
    section = '7'
    AND sub_section = '7'
    and paragraph = '9';

UPDATE compliance_article
SET
    description = 'Hoisting Equipment Non-destructive Tests',
    long_decription = 'Without limiting section 7.4.6, every part of a hoist and hoisting equipment
the failure of which could endanger persons, shall be subjected to an
annual non-destructive test conducted by a certified person, and a copy of
the test results shall be forwarded to an inspector.'
WHERE
    section = '7'
    AND sub_section = '9'
    and paragraph = '7';

UPDATE compliance_article
SET
    long_decription = 'Annual Inspection - Hoists and Shafts'
WHERE
    section = '7'
    AND sub_section = '9'
    and paragraph = '13';

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
        update_timestamp
    )
VALUES
    (
        'HSRCM',
        '8',
        '3',
        '4',
        'Defective Explosives Report',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp
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
        update_timestamp
    )
VALUES
    (
        'HSRCM',
        '8',
        '3',
        '4',
        'Defective Explosives Report',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp
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
        long_description
    )
VALUES
    (
        'HSRCM',
        '8',
        '3',
        '5',
        'Safety Fuse Assemblies Procedure',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Safety Fuse Assemblies'
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
        long_description
    )
VALUES
    (
        'HSRCM',
        '8',
        '3',
        '9',
        '2',
        'Careless Acts',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Careless Acts Report (Explosives)'
    );

UPDATE compliance_article
SET
    long_decription = 'Careless Acts - Explosives'
WHERE
    section = '8'
    AND sub_section = '3'
    and paragraph = '9';

UPDATE compliance_article
SET
    long_decription = 'Blasters that are continually handling nitro-glycerine based explosives
shall have a medical examination on a frequency of less than 3 year intervals to determine sensitivity to and any harmful health effects from the continued exposure to nitroglycerine.'
WHERE
    section = '8'
    AND sub_section = '3'
    and paragraph = '10';

UPDATE compliance_article
SET
    long_decription = 'Vehicle Requirements - Engine shut off while loading or unloading explosives'
WHERE
    section = '8'
    AND sub_section = '4'
    and paragraph = '2';

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
        update_timestamp
    )
VALUES
    (
        'HSRCM',
        '8',
        '7',
        '2',
        '2',
        'Drilling Precaution Procedures Report',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp
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
        long_description
    )
VALUES
    (
        'HSRCM',
        '8',
        '8',
        '1',
        '2',
        'Equipment Around Surface Misfires Procedure',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Use of equipment restricted within 8m distance around the collar of misfired hole except as provided in s.8.7.1 or under a procedure approved by the inspector.'
    );

UPDATE compliance_article
SET
    cim_or_cpo = 'CPO',
    help_reference_link = 'https://j200.gov.bc.ca/pub/vfcbc/Default.aspx?PossePresentation=VFStartApplication&PosseObjectId=62225171',
    help_reference_text = 'vFCBC - Notice of Work (gov.bc.ca)',
    long_decription = 'Applications for parties engaging in mineral and coal exploration activities should apply through virtual Front Counter BC.'
WHERE
    section = '9'
    AND sub_section = '1'
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
        help_reference_text,
        help_reference_link
    )
VALUES
    (
        'HSRCM',
        '9',
        '2',
        '1',
        '3',
        'Annual Summary of Exploration Activities OR ASEA',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'As required by the Code, the permittee is responsible for submitting an annual report of the exploration and reclamation activities completed on site. The form specified by the chief inspector can be found online and is called “ASEA”. These reports must be submitted by March 31 of the following year, as long as the permit is open.',
        'Annual Reporting Forms',
        'https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/permitting/reclamation-closure/annual-reporting-forms'
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
        help_reference_text,
        help_reference_link,
        cim_or_cpo
    )
VALUES
    (
        'HSRCM',
        '9',
        '2',
        '1',
        '3',
        'Multi-Year Area Based Permit Updates OR MYAB Update',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'As a condition of a permit, the permittee is responsible for submitting an annual update report of proposed exploration and reclamation activities to be completed in the next year. The form specified by the permit can be found online and is called “MYAB update”. These reports must be submitted prior to start of work each year, or as required in the permit condition as long as the permit is open, and the condition is in effect.',
        'Multi-year area-based (MYAB) authorization',
        'https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/permitting/reclamation-closure/annual-reporting-forms',
        'CPO'
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
        long_description
    )
VALUES
    (
        'HSRCM',
        '9',
        '5',
        '1',
        '3',
        'Management Plan for Riparian Area OR Drilling in Stream/Lake/Wetland Management Plan',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Management Plan for Riparian Area OR Drilling in Stream/Lake/Wetland Management Plan'
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
        long_description
    )
VALUES
    (
        'HSRCM',
        '9',
        '7',
        '1',
        '2',
        'Terrain Incident Report',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Reporting to an inspector that a terrain instability event occurred, which was caused by an exploration activity.'
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
        long_description
    )
VALUES
    (
        'HSRCM',
        '9',
        '7',
        '1',
        'Terrain Stability Remediation Plan',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Terrain Stability Remediation Plan'
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
        long_description
    )
VALUES
    (
        'HSRCM',
        '9',
        '10',
        '1',
        '3',
        'ARD Surface Material Request',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Material known to be capable of generating acid rock drainage shall not be used for exploration access surfacing or ballasting unless approved by an inspector.'
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
        update_timestamp
    )
VALUES
    (
        'HSRCM',
        '9',
        '13',
        '1',
        '1',
        'Cessation of Exploration Reclamation Report',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp
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
        '9',
        '13',
        '1',
        '5',
        'Reclamation Results Report',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Reported results of reclamation measures for submission to an inspector upon completion of reclamation work, this should be included with the final ASEA report (9.2.1(3)).' 'CPO'
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
        long_description
    )
VALUES
    (
        'HSRCM',
        '9',
        '13',
        '1',
        '6',
        'Application for Security Release',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Application to an inspector by the owner, agent or manager for a refund of the security deposit when the reclamation program has met the requirements of the Code. This should be included with the final ASEA report (9.2.1(3)), and report for 9.13.1(5).'
    );

UPDATE compliance_article
SET
    cim_or_cpo = 'CPO',
    long_decription = 'Applications for proposed coal and mineral mines, major modifications to existing mines and major exploration and development should be submitted through the Applications reporting feature in MineSpace.'
WHERE
    section = '10'
    AND sub_section = '1'
    and paragraph = '2'
    and description = 'Application Requirements';

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
        '10',
        '1',
        '3',
        'a',
        'Map',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Applications for proposed coal and mineral mines, major modifications to existing mines and major exploration and development should be submitted through the Applications reporting feature in MineSpace.',
        'CPO'
    );

UPDATE compliance_article
SET
    cim_or_cpo = 'CPO',
    long_decription = 'Applications for proposed coal and mineral mines, major modifications to existing mines and major exploration and development should be submitted through the Applications reporting feature in MineSpace.'
WHERE
    section = '10'
    AND sub_section = '1'
    and paragraph = '3'
    and description = 'Application Requirements';

UPDATE compliance_article
SET
    cim_or_cpo = 'CIM'
WHERE
    section = '10'
    AND sub_section = '1'
    and paragraph = '6'
    and description = 'Duty to Report Safety Issues at Tailings Storage Facilities';

UPDATE compliance_article
SET
    cim_or_cpo = 'CPO',
    long_decription = 'Design Slopes Justification'
WHERE
    section = '10'
    AND sub_section = '1'
    and paragraph = '9'
    and description = 'Design Slopes';

UPDATE compliance_article
SET
    cim_or_cpo = 'CPO',
    long_decription = 'A tailings storage facility shall have a breach and inundation study or a failure runout assessment prior to commencing operation, or as required by the chief permitting officer.'
WHERE
    section = '10'
    AND sub_section = '1'
    and paragraph = '11'
    and description = 'Breach and Inundation Study/Failure Runout Assessment';

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
        '10',
        '1',
        '12',
        'Water Balance and Water Management Plan',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'This section of the Code does not trigger a report submission requirement.  The reconciled Water Balance and Water Management Plan for Tailings Storage Facilities can be submitted under 10.4.5(a) of the Code. Water Balance and Water Quality Models and Water Management and Monitoring  Plans for mine sites should be submitted  through the Applications feature in MineSpace, or as a permit required report in MineSpace.',
        'CIM'
    );

UPDATE compliance_article
SET
    cim_or_cpo = 'CPO',
    long_decription = 'This section of the Code does not trigger a report submission requirement. Information related to Major Dumps should be submitted through the Applications feature in MineSpace.'
WHERE
    section = '10'
    AND sub_section = '1'
    and paragraph = '15';

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
        '10',
        '1',
        '16',
        'Metal Leaching and Acid Rock Drainage',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'This section of the Code does not trigger a report submission requirement. Documents related to Metal Leaching and Acid Rock Drainage should be submitted through the Applications feature on MineSpace, or as a permit required report in MineSpace.',
        'CPO'
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
        '10',
        '4',
        '1',
        '3',
        'Updated Plans',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'This section of the Code does not trigger a report submission requirement. The reconciled Water Balance and Water Management Plan for Tailings Storage Facilities can be submitted under 10.4.5(a) of the Code. Water Balance and Water Quality Models and Water Management and Monitoring Plans for mine sites should be submitted through the Applications feature in MineSpace, or as a permit required report in MineSpace.',
        'Both'
    );

UPDATE compliance_article
SET
    help_reference_text = 'https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/permitting',
    help_reference_link = 'https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/permitting',
    long_decription = 'Updated Plans - Permitted Sites
For regionally operated sand and gravel pits and construction aggregate quarries, refer to the Mine Plan Update Policy.'
WHERE
    section = '10'
    and description = 'Updated Plans'
    AND sub_section = '4'
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
        update_timestamp
    )
VALUES
    (
        'HSRCM',
        '10',
        '4',
        '2',
        '3',
        'ITRB Terms of Reference',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp
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
        update_timestamp
    )
VALUES
    (
        'HSRCM',
        '10',
        '4',
        '2',
        '(1)a',
        'Tailings Management System',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp
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
        update_timestamp
    )
VALUES
    (
        'HSRCM',
        '10',
        '4',
        '2',
        '(1)d',
        'TSF Risk Assessment',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp
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
        update_timestamp
    )
VALUES
    (
        'HSRCM',
        '10',
        '4',
        '2',
        '(1)e',
        'TSF Emergency Preparedness and Response Plan',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp
    );

UPDATE compliance_article
SET
    help_reference_text = 'Annual Reporting Forms',
    help_reference_link = 'https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/permitting/reclamation-closure/annual-reporting-forms',
    long_decription = 'As a condition of a permit, the permittee is responsible for submitting an annual report of the placer and reclamation activities completed on site. The form specified by the chief inspector can be found online and is called "ASPA." These reports must be submitted by March 31 of the following year as long as the permit is open.'
WHERE
    section = '10'
    and description = 'Annual Reporting'
    AND sub_section = '4'
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
        long_description,
        cim_or_cpo,
        help_reference_text,
        help_reference_link
    )
VALUES
    (
        'HSRCM',
        '10',
        '4',
        '4',
        '(a)',
        'Annual Reclamation and Environmental Monitoring Work Report',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Permittees must submit Annual Reclamation Reports in compliance with the conditions of Mines Act permits and the Health, Safety, and Reclamation Code for Mines in British Columbia. These reports provide a summary of activities conducted on the mine property, including mine development, environmental protection programs, and reclamation programs. Geospatial files and specific tables must also be included, along with a detailed estimate of reclamation costs. Hardcover copies are no longer required for submission.',
        'Both',
        'Annual Reclamation Reports',
        'https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/permitting/reclamation-closure/annual-reclamation-reports'
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
        cim_or_cpo,
        help_reference_text,
        help_reference_link
    )
VALUES
    (
        'HSRCM',
        '10',
        '4',
        '4',
        '(b)',
        'Annual Dam Safety Inspection',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'According to Part 10.5.3 of the Health, Safety and Reclamation Code for Mines in British Columbia, permitted mines must submit annual Dam Safety Inspections (DSIs). These inspections involve visits to the mines, interviews with inspectors and operators, visual inspections of facilities, and reviews of monitoring data.',
        'CIM',
        'Dam Safety Inspections',
        'https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/permitting/geotechnical-information/dam-safety-inspections'
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
        cim_or_cpo,
        help_reference_text,
        help_reference_link
    )
VALUES
    (
        'HSRCM',
        '10',
        '4',
        '4',
        '(c)',
        'Independent Tailings Review Board Activities Report',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'The owner, agent, or manager is required to submit an annual report in a specified summary form by March 31 of the following year. This report should provide details on the activities of the Independent Tailings Review Board, including a summary of the reviews conducted, an assessment of whether the work reviewed meets the Board''s expectations, any conditions that compromise the integrity of the tailings storage facility or non-compliance with recommendations from the engineer of record, and a signed acknowledgement by the Board members confirming the accuracy of the report.',
        'CIM',
        'Part 10 - HSRC Guidance Document (2016)',
        'https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/mineral-exploration-mining/documents/health-and-safety/part_10_guidance_doc_10_20july_2016.pdf'
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
        cim_or_cpo,
        help_reference_text,
        help_reference_link
    )
VALUES
    (
        'HSRCM',
        '10',
        '4',
        '4',
        '(d)',
        'Summary of Tailings Storage Facility or Dam Safety Recommendations',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'As part of the annual reporting requirements, the owner, agent, or manager of a mine is required to submit annual reports summarizing the tailings storage facility and dam safety recommendations, including a scheduled completion date. These reports must be submitted in a summary form specified by the chief inspector or the permit conditions by March 31 of the following year.',
        'CIM',
        'Dam Safety Inspections',
        'https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/permitting/geotechnical-information/dam-safety-inspections'
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
        cim_or_cpo,
        help_reference_text,
        help_reference_link
    )
VALUES
    (
        'HSRCM',
        '10',
        '4',
        '4',
        '(e)',
        'Performance of High Risk Dumps',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'As part of the annual reporting requirements, the owner, agent, or manager of a mine must submit one or more annual reports summarizing the performance of high-risk dumps under section 10.5.5 of the code. These reports need to be submitted in a summary form determined by the chief inspector or the permit conditions by March 31 of the following year.',
        'CIM',
        'Geotechnical Information - Mined Rock and Overburden Piles',
        'https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/permitting/geotechnical-information'
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
        cim_or_cpo,
        help_reference_text,
        help_reference_link
    )
VALUES
    (
        'HSRCM',
        '10',
        '4',
        '4',
        '(f)',
        'Tailings Storage Facility and Dam Registry',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'As part of the annual reporting requirements, the owner, agent, or manager of a mine is required to submit one or more annual reports summarizing updates to the tailings storage facilities register. These reports must be submitted in a specified summary form determined by the chief inspector or the permit conditions by March 31 of the following year.',
        'CIM',
        'Register of Tailings Storage Facilities and Dams Excel File User Guide',
        'https://minespace.gov.bc.ca/src/assets/downloads/User%20Guide%20-%20Register%20of%20Tailings%20Storage%20Facilities%20and%20Dams.pdf'
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
        cim_or_cpo,
        help_reference_text,
        help_reference_link
    )
VALUES
    (
        'HSRCM',
        '10',
        '4',
        '4',
        'g',
        'Annual Summary of Work and Reclamation Report',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'An annually completed PDF fillable form called "Annual Summary of Work and Reclamation" and required maps for Sand and Gravel/Quarry Operations where required by permit condition.',
        'CPO',
        'Annual Reporting Forms',
        'https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/permitting/reclamation-closure/annual-reporting-forms'
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
        cim_or_cpo,
        help_reference_text,
        help_reference_link
    )
VALUES
    (
        'HSRCM',
        '10',
        '4',
        '5',
        'a(major mine)',
        'Mine Plan, Reclamation and Closure Plan Updates',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'The owner, agent, or manager of a mine is required to submit periodic reports as part of the annual reporting process. These reports, which must be submitted by March 31 of the following year, include updates on mine plans, reclamation plans, and closure plans as outlined in section 10.4.1 of the code. According to this section, mine plans need to be updated every 5 years, while reclamation plans should outline progressive reclamation activities for the subsequent 5 years.',
        'Both',
        'Reclamation and Closure',
        'https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/permitting/reclamation-closure'
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
        cim_or_cpo,
        help_reference_text,
        help_reference_link
    )
VALUES
    (
        'HSRCM',
        '10',
        '4',
        '5',
        'a(regional mine)',
        'Mine Plan, Reclamation and Closure Plan Updates',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'The owner, agent, or manager of a mine is required to submit periodic reports as part of the annual reporting process. These reports, which must be submitted by March 31 of the following year, include updates on mine plans, reclamation plans, and closure plans as outlined in section 10.4.1 of the code. According to this section, mine plans need to be updated every 5 years, while reclamation plans should outline progressive reclamation activities for the subsequent 5 years.',
        'Both',
        'Mines Act Permit: Mine Plan Update Policy',
        'https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/mineral-exploration-mining/documents/permitting/mine_plan_update_policy_-_july_2022.pdf'
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
        cim_or_cpo,
        help_reference_text,
        help_reference_link
    )
VALUES
    (
        'HSRCM',
        '10',
        '4',
        '5',
        'b',
        'Dam Safety Review',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'As part of the annual reporting requirements, the owner, agent, or manager of a mine must submit dam safety review reports performed under section 10.5.4 of the Health, Safety, and Reclamation Code for Mines in British Columbia. These reports need to be submitted by March 31 of the year following their completion and in a form specified by the chief inspector or the permit conditions.',
        'Both',
        'Geotechnical Information - Dam and Water Management Infrastructure',
        'https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/permitting/geotechnical-information'
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
        '10',
        '5',
        '1',
        '1',
        'Construction of Tailings and Water Management Facilities - IFC drawing package',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Also known as Issued for Constructon (IFC) drawing package. The manager shall submit issued for construction drawings, specifications and quality assurance/quality control plans as well as a summary construction schedule to the chief inspector prior to commencing construction of a tailings storage or water management facility.',
        'Both'
    );

UPDATE compliance_article
SET
    description = 'OMS Manual'
WHERE
    section = '10'
    and description = 'Operations, Maintenance and Surveillance (OMS) Manual'
    AND sub_section = '5'
    and paragraph = '2';

UPDATE compliance_article
SET
    description = 'Annual Dam Safety Inspection'
WHERE
    section = '10'
    and description = 'Annual Tailings Facility and Dam Safety Inspection'
    AND sub_section = '5'
    and paragraph = '3';

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
        '10',
        '5',
        '7',
        '2',
        'Materials Inventory Report',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Materials Inventory',
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
        '10',
        '6',
        '2',
        '(2)(a)',
        'Site Monitoring and Maintenance Program',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'If a mine ceases operation for a period longer than one year, the owner, agent, or manager shall shall apply for an amendment to the permit. For regional mines, a Notice of Work application must be submitted through vFCBC. For major mines, please submit an application for an amendment through the Applications feature on MineSpace.',
        'CPO'
    );

UPDATE compliance_article
SET
    description = 'TSF Closure OMS'
WHERE
    section = '10'
    and description = 'Tailings Storage Facility Closure OMS Manual'
    AND sub_section = '6'
    and paragraph = '8';

UPDATE compliance_article
SET
    cim_or_cpo = 'CIM',
    long_decription = 'On-going Management Requirements: Where a mine requires on-going mitigation, monitoring or maintenance, the owner, agent, or manager shall submit a closure management manual that:
(a) describes and documents key aspects of the ongoing mitigation, monitoring and maintenance requirements, and
(b) tracks important changes to components of the system that effect long-term mitigation, monitoring and maintenance requirements.'
WHERE
    section = '10'
    and description = 'On-going Management Requirements'
    AND sub_section = '6'
    and paragraph = '9';

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
        '10',
        '7',
        '17',
        'Metal Uptake',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'When required by the chief inspector, vegetation shall be monitored for metal uptake.',
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
        '10',
        '7',
        '18',
        'Ecological Risk Assessment',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Ecological Risk Assessment',
        'CIM'
    );

UPDATE compliance_article
SET
    cim_or_cpo = 'CIM',
    long_decription = 'Any reports submitted under this Section should be identified as a permit required report.'
WHERE
    section = '10'
    and description = 'Monitoring'
    AND sub_section = '7'
    and paragraph = '21';

UPDATE compliance_article
SET
    long_decription = 'An inspector may order the owner, agent, or manager of a mine to provide an independent study prepared by an engineer or licensed professional acceptable to the inspector. This study can address health and safety concerns, the safety of equipment, buildings, workings, or structures at the mine, or actual or potential environmental damage resulting from mining activity. It can also be requested in connection with an incident that the inspector is investigating. The cost of the study is to be borne by the owner.'
WHERE
    and description = 'Engineering report'
    AND section = '18';

UPDATE compliance_article
SET
    cim_or_cpo = 'CIM',
    long_decription = 'A person who is adversely affected by a decision or order of an inspector or an order of the chief auditor may, within 30 days of its issue, appeal the decision or order to the chief inspector.'
WHERE
    section = '33'
    and description = 'Appeal to the Chief Inspector'
    AND sub_section = '1';

INSERT INTO
    compliance_article (
        article_act_code,
        section,
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
        'MA',
        '17',
        'Chief Inspector''s authority to cause work to be done',
        '2024-02-15',
        '9999-12-31',
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp,
        'Chief Inspector''s authority to cause work to be done',
        'CIM'
    );