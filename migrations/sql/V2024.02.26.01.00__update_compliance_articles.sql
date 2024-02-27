UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    cim_or_cpo = 'CIM',
    description = 'Annual Safety Statistics Report',
    long_description = 'By January 31 of each year, the mine manager is required to submit a report to the chief inspector, detailing the previous calendar year''s statistics. This report includes: the total hours worked by all mine employees, the number of lost time injuries, the number of occasions where employees received medical aid, the number of days lost, and all values must inlcude or report separately the values for contract workers.'
WHERE
    section = '1'
    AND sub_section = '9'
    AND paragraph = '3';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    description = 'Defective Explosives Report',
    long_description = ''
WHERE
    section = '8'
    AND description = 'Defective Explosives'
    AND sub_section = '3'
    AND paragraph = '4';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    description = 'Terrain Stability Remediation Plan',
    long_description = 'Terrain Stability Remediation Plan'
WHERE
    section = '9'
    AND description = 'Terrain'
    AND sub_section = '7'
    AND paragraph = '1';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    cim_or_cpo = 'CPO',
    sub_paragraph = 'a',
    long_description = 'Applications for proposed coal and mineral mines, major modifications to existing mines and major exploration and development should be submitted through the Applications reporting feature in MineSpace.'
WHERE
    section = '10'
    AND description = 'Map'
    AND sub_section = '1'
    AND paragraph = '3';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    cim_or_cpo = 'CPO',
    description = 'Breach and Inundation Study/Failure Runout Assessment',
    long_description = 'A tailings storage facility shall have a breach and inundation study or a failure runout assessment prior to commencing operation, or as required by the chief permitting officer.'
WHERE
    section = '10'
    AND sub_section = '1'
    AND paragraph = '11';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    cim_or_cpo = 'CPO',
    long_description = 'This section of the Code does not trigger a report submission requirement. Documents related to Metal Leaching and Acid Rock Drainage should be submitted through the Applications feature on MineSpace, or as a permit required report in MineSpace.'
WHERE
    section = '10'
    AND sub_section = '1'
    AND paragraph = '16';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    description = 'Updated Plans',
    help_reference_link = 'https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/permitting',
    cim_or_cpo = 'Both',
    long_description = 'Updated Plans - Permitted Sites For regionally operated sand and gravel pits and construction aggregate quarries, refer to the Mine Plan Update Policy.'
WHERE
    section = '10'
    AND description = 'Permit'
    AND sub_section = '4'
    AND paragraph = '1';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    description = 'OMS Manual',
    long_description = 'Operations, Maintenance and Surveillance (OMS) Manual'
WHERE
    section = '10'
    AND sub_section = '5'
    AND paragraph = '2';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    cim_or_cpo = 'Both',
    description = 'Construction of Tailings and Water Management Facilities',
    long_description = 'Construction of Tailings and Water Management Facilities'
WHERE
    section = '10'
    AND description = 'Impoundments'
    AND sub_section = '5'
    AND paragraph = '1';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    description = 'Closure of a Tailings Storage Facility or Dam',
    long_description = 'Closure of a Tailings Storage Facility or Dam'
WHERE
    section = '10'
    AND sub_section = '6'
    AND paragraph = '7';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    description = 'TSF Closure OMS',
    long_description = 'Tailings Storage Facility Closure OMS Manual'
WHERE
    section = '10'
    AND sub_section = '6'
    AND paragraph = '8';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    long_description = 'On-going Management Requirements: Where a mine requires on-going mitigation, monitoring or maintenance, the owner, agent, or manager shall submit a closure management manual that:
(a) describes and documents key aspects of the ongoing mitigation, monitoring and maintenance requirements, and
(b) tracks important changes to components of the system that effect long-term mitigation, monitoring and maintenance requirements.
'
WHERE
    section = '10'
    AND description = 'On-going Management Requirements'
    AND sub_section = '6'
    AND paragraph = '9';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    cim_or_cpo = 'CIM',
    description = 'Monitoring Contaminants - Workplace Monitoring Program',
    long_description = 'Workplace Monitoring Programs include the recognition, evaluation and control of occupational hazards that can adversely affect a worker''s health.  They must specify the substances and locations to be monitored by a qualified person.  Submissions may also include monitoring results for the program.'
WHERE
    section = '2'
    AND sub_section = '1'
    AND paragraph = '3';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    cim_or_cpo = 'CIM',
    description = 'Report of Emergency Warning System Test',
    long_description = 'Report of Emergency Warning System Test'
WHERE
    section = '3'
    AND sub_section = '13'
    AND paragraph = '4';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    cim_or_cpo = 'CPO',
    long_description = 'Applications for proposed coal and mineral mines, major modifications to existing mines and major exploration and development should be submitted through the Applications reporting feature in MineSpace.'
WHERE
    section = '10'
    AND description = 'Application Requirements'
    AND sub_section = '1'
    AND paragraph = '3';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    cim_or_cpo = 'CPO',
    long_description = 'For regional mines, an application for a permit amendment for an acquisition of a mine should be submitted through vFCBC. For major mines, please submit an application for an amendment through the Applications feature in MineSpace.'
WHERE
    section = '11'
    AND sub_section = '1';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    long_description = 'An inspector may order the owner, agent, or manager of a mine to provide an independent study prepared by an engineer or licensed professional acceptable to the inspector. This study can address health and safety concerns, the safety of equipment, buildings, workings, or structures at the mine, or actual or potential environmental damage resulting from mining activity. It can also be requested in connection with an incident that the inspector is investigating. The cost of the study is to be borne by the owner.'
WHERE
    section = '18';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    cim_or_cpo = 'CIM',
    description = 'Confined Space Safe Work Procedures',
    long_description = 'Confined Space Safe Work Procedures'
WHERE
    section = '3'
    AND sub_section = '4'
    AND paragraph = '2';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    cim_or_cpo = 'CIM',
    description = 'Medical Surveillance Program Requirements',
    long_description = 'Medical Surveillance Programs are required for persons in a dust exposure occupation, exposed to excessive noise or exposed to any chemical, physical or radiation agent to ensure that adequate controls are in place to prevent workers from developing adverse health effects from their workplace exposure.'
WHERE
    section = '2'
    AND sub_section = '12'
    AND paragraph = '1';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    cim_or_cpo = 'CIM',
    description = 'Ionizing Radiation',
    long_description = 'Ionizing Radiation'
WHERE
    section = '2'
    AND description = 'Radiation'
    AND sub_section = '3'
    AND paragraph = '11';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    cim_or_cpo = 'CIM',
    long_description = 'Procedure for Assessment and Maintenance of Cap Lamps'
WHERE
    section = '2'
    AND sub_section = '8'
    AND paragraph = '6';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    cim_or_cpo = 'CIM',
    sub_paragraph = '1',
    long_description = 'Trackless diesel-powered equipment for use in
(1) Underground coal mines shall comply with CSA Standard CAN/
CSA-M424. 1-88, “Flame-Proof Non-Rail Bound Diesel-Powered
Machine for Use in Gassy Underground Coal Mines” except where
such equipment is not used for cutting, digging and loading of coal
the manager shall provide procedures submitted to the chief inspector.'
WHERE
    section = '4'
    AND sub_section = '7'
    AND paragraph = '1';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    cim_or_cpo = 'CIM',
    description = 'Electrical Plan',
    long_description = 'Plan approved by a registered electrical engineer for the use of electrical energy at any mine and submitted prior to the introduction of electricity at the mine.  A plan is also required for any increases in capacity of an exisitng installation by more than 500 kva.  The plan must show the areas of the mine where the electrical energy is to be transmitted and used, including schematic drawings.'
WHERE
    section = '5'
    AND sub_section = '2'
    AND paragraph = '1';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    description = 'Safety Fuse Assemblies Procedure'
WHERE
    section = '8'
    AND sub_section = '3'
    AND paragraph = '5';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    cim_or_cpo = 'CPO',
    description = 'Minimum Static Factor of Safety',
    long_description = 'Minimum Static Factor of Safety'
WHERE
    section = '10'
    AND sub_section = '1'
    AND paragraph = '10';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    cim_or_cpo = 'CIM',
    description = 'Monitoring',
    long_description = 'Any reports submitted under this Section should be identified as a permit required report.'
WHERE
    section = '10'
    AND sub_section = '7'
    AND paragraph = '21';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    long_description = 'Supply systems for mobile electrical equipment shall be tested before
being put into service, and at least once a year thereafter, in order to prove
the effectiveness of the ground fault tripping and the ground conductor
monitoring circuits.  A record of these tests shall be kept.'
WHERE
    section = '5'
    AND sub_section = '7'
    AND paragraph = '2';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    long_description = 'Written summary of procedure and layout of system must be submitted to an inspector for approval before a central blasting system is used or modified.'
WHERE
    section = '8'
    AND sub_section = '6'
    AND paragraph = '23';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    cim_or_cpo = 'CIM'
WHERE
    section = '10'
    AND sub_section = '6'
    AND paragraph = '16';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    cim_or_cpo = 'CIM',
    description = 'Terrain Stability Remediation Plan',
    long_description = 'Terrain Stability Remediation Plan'
WHERE
    section = '9'
    AND description = 'Terrain'
    AND sub_section = '7'
    AND paragraph = '1';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    cim_or_cpo = 'CIM',
    description = 'Duty to Report Safety Issues at Tailings Storage Facilities',
    long_description = 'Duty to Report Safety Issues at Tailings Storage Facilities'
WHERE
    section = '10'
    AND sub_section = '1'
    AND paragraph = '6';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    cim_or_cpo = 'CPO',
    description = 'Breach and Inundation Study/Failure Runout Assessment',
    long_description = 'A tailings storage facility shall have a breach and inundation study or a failure runout assessment prior to commencing operation, or as required by the chief permitting officer.'
WHERE
    section = '10'
    AND sub_section = '1'
    AND paragraph = '11';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    cim_or_cpo = 'CPO',
    long_description = 'This section of the Code does not trigger a report submission requirement. Documents related to Metal Leaching and Acid Rock Drainage should be submitted through the Applications feature on MineSpace, or as a permit required report in MineSpace.'
WHERE
    section = '10'
    AND sub_section = '1'
    AND paragraph = '16';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    help_reference_link = 'https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/permitting/mines-act-permits/mines-act-departures-from-approval',
    cim_or_cpo = 'CPO',
    long_description = 'Departure from approval process must be submitted through the Notice of Departure feature in MineSpace.'
WHERE
    section = '10'
    AND sub_section = '1'
    AND paragraph = '18';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    description = 'Materials Inventory Report',
    cim_or_cpo = 'CIM',
    sub_paragraph = '2'
WHERE
    section = '10'
    AND sub_section = '5'
    AND paragraph = '7';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    long_description = 'For regional mines, an application for a permit amendment for an acquisition of a mine should be submitted through vFCBC. For major mines, please submit an application for an amendment through the Applications feature in MineSpace.',
    cim_or_cpo = 'CPO'
WHERE
    section = '11'
    AND sub_section = '1';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    long_description = 'Housekeeping Program',
    cim_or_cpo = 'CIM'
WHERE
    section = '2'
    AND sub_section = '2'
    AND paragraph = '1';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    description = 'Duty to Keep Plans - Surface Mine Plans',
    long_description = 'Accurate mine plans that are updated in accordance with good engineering practices and are prepared on a scale that accords with good engineering practice.'
WHERE
    section = '6'
    AND sub_section = '8'
    AND paragraph = '1';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    description = 'Haul Roads Plan',
    long_description = 'Haul Roads Plan'
WHERE
    section = '6'
    AND sub_section = '9'
    AND paragraph = '1';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    cim_or_cpo = 'CIM',
    sub_paragraph = '2',
    description = 'Hearing Conservation Program',
    long_description = 'A program that includes the recogntiion, evaluation and control of noise risks to prevent hearing loss.'
WHERE
    section = '2'
    AND sub_section = '12'
    AND paragraph = '4';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    cim_or_cpo = 'CIM',
    description = 'Thermal Environment (Heat or Cold Stress Program)',
    long_description = 'A thermal stress program or a heat and/or cold stress program.  Submissions can also include training material and records for employees on thermal stress, monitoring results of thermal conditions and controls or protective measures.'
WHERE
    section = '2'
    AND sub_section = '10'
    AND paragraph = '1';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    cim_or_cpo = 'CIM',
    sub_paragraph = '5',
    long_description = 'Industrial Hygiene Standards for use at uranium drill sites'
WHERE
    section = '2'
    AND sub_section = '3'
    AND paragraph = '11';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    sub_paragraph = '7',
    description = 'Dump Runout Zone Procedure',
    long_description = 'A procedure for controlling access to areas within the
potential run-out zone of all dumps; this procedure will prohibit
extended activities below active dumps and provide for a program
of monitoring to allow work below inactive and dormant dumps, the
procedure will include provisions for signage, work under adverse
conditions and shall be reviewed annually.
'
WHERE
    section = '6'
    AND sub_section = '10'
    AND paragraph = '1';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    description = 'Construction of Tailings and Water Management Facilities - IFC drawing package',
    cim_or_cpo = 'Both',
    sub_paragraph = '1',
    long_description = 'Also known as Issued for Constructon (IFC) drawing package. The manager shall submit issued for construction drawings, specifications and quality assurance/quality control plans as well as a summary construction schedule to the chief inspector prior to commencing construction of a tailings storage or water management facility.'
WHERE
    section = '10'
    AND sub_section = '5'
    AND paragraph = '1';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    description = 'Site Monitoring and Maintenance Program',
    cim_or_cpo = 'CPO',
    sub_paragraph = '(2)(a)',
    long_description = 'If a mine ceases operation for a period longer than one year, the owner, agent, or manager shall shall apply for an amendment to the permit. For regional mines, a Notice of Work application must be submitted through vFCBC. For major mines, please submit an application for an amendment through the Applications feature on MineSpace.'
WHERE
    section = '10'
    AND sub_section = '6'
    AND paragraph = '2';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    sub_paragraph = '(c)',
    long_description = 'Minutes shall be kept for crew safety meetings and made available to an inspector upon request.'
WHERE
    section = '1'
    AND sub_section = '6'
    AND paragraph = '12';

UPDATE compliance_article
SET
    cim_or_cpo = 'CIM',
    update_timestamp = current_timestamp,
    sub_paragraph = '2',
    description = 'Reversal Procedure for Trains',
    long_description = 'If trains are required to reverse frequently and for lengthy distances, a procedure must be followed that is acceptable to the inspector.'
WHERE
    section = '4'
    AND sub_section = '10'
    AND paragraph = '1';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    sub_paragraph = '2',
    description = 'Equipment Around Surface Misfires Procedure',
    long_description = 'Use of equipment restricted within 8m distance around the collar of misfired hole except as provided in s.8.7.1 or under a procedure approved by the inspector.'
WHERE
    section = '8'
    AND sub_section = '8'
    AND paragraph = '1';

UPDATE compliance_article
SET
    cim_or_cpo = 'CIM',
    update_timestamp = current_timestamp,
    sub_paragraph = '4',
    long_description = 'Report of MERP Test'
WHERE
    section = '3'
    AND sub_section = '7'
    AND paragraph = '1';

UPDATE compliance_article
SET
    cim_or_cpo = 'CIM',
    update_timestamp = current_timestamp,
    sub_paragraph = '1',
    description = 'Underground Fueling Station Notification',
    long_description = 'Notification of the intention to construct an underground fueling station.'
WHERE
    section = '4'
    AND sub_section = '3'
    AND paragraph = '3';

UPDATE compliance_article
SET
    cim_or_cpo = 'CIM',
    update_timestamp = current_timestamp,
    sub_paragraph = '1',
    description = 'Underground Oil and Grease Storage Area Notification',
    long_description = 'Notification of the intention to construct an underground oil and grease storge enclosure for quantities in excess of those outlined in section 4.8.1(2)(b).'
WHERE
    section = '4'
    AND sub_section = '3'
    AND paragraph = '4';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    sub_paragraph = '2',
    long_description = 'Careless Acts Report (Explosives)'
WHERE
    section = '8'
    AND sub_section = '3'
    AND paragraph = '9';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    sub_paragraph = '2',
    description = 'Drilling Precaution Procedures Report',
    long_description = ''
WHERE
    section = '8'
    AND sub_section = '7'
    AND paragraph = '2';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    sub_paragraph = '3',
    description = 'Annual Summary of Exploration Activities OR ASEA',
    long_description = 'As required by the Code, the permittee is responsible for submitting an annual report of the exploration and reclamation activities completed on site. The form specified by the chief inspector can be found online and is called “ASEA”. These reports must be submitted by March 31 of the following year, as long as the permit is open.'
WHERE
    section = '9'
    AND sub_section = '2'
    AND paragraph = '1';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    sub_paragraph = '3',
    description = 'Management Plan for Riparian Area OR Drilling in Stream/Lake/Wetland Management Plan',
    long_description = 'Management Plan for Riparian Area OR Drilling in Stream/Lake/Wetland Management Plan'
WHERE
    section = '9'
    AND sub_section = '5'
    AND paragraph = '1';

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    sub_paragraph = '3',
    description = 'ARD Surface Material Request',
    long_description = 'Material known to be capable of generating acid rock drainage shall not be used for exploration access surfacing or ballasting unless approved by an inspector.'
WHERE
    section = '9'
    AND sub_section = '10'
    AND paragraph = '1'
    AND (
        sub_paragraph IS NULL
        OR sub_paragraph = '3'
    );

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    sub_paragraph = '1',
    description = 'Cessation of Exploration Reclamation Report',
    long_description = ''
WHERE
    section = '9'
    AND sub_section = '13'
    AND paragraph = '1'
    AND (
        sub_paragraph IS NULL
        OR sub_paragraph = '1'
    );

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    sub_paragraph = '3',
    description = 'ITRB Terms of Reference',
    long_description = ''
WHERE
    section = '10'
    AND sub_section = '4'
    AND paragraph = '2'
    AND (
        sub_paragraph IS NULL
        OR sub_paragraph = '3'
    );

UPDATE compliance_article
SET
    update_timestamp = current_timestamp,
    cim_or_cpo = 'CIM',
    description = 'Mine Manager''s Right to Refuse Unsafe Work Report',
    sub_paragraph = '2',
    long_description = 'Mine Manager''s report that describes the incident, shows compliance with the code and describes any remedial actions taken.
'
WHERE
    section = '1'
    AND sub_section = '10'
    AND paragraph = '7';