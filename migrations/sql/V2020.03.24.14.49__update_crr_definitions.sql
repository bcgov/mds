
DROP TABLE IF EXISTS tmp_report_definition_compliance;
CREATE TEMPORARY TABLE tmp_report_definition_compliance(
	tmp_id serial primary key, 
	mrd_id integer, 
	report_name character varying(100),
	due_date_type character varying(3),
	due_date_period integer,
	compliance_act character varying(5), 
	compliance_section character varying(2),
	compliance_sub_section character varying(2),
	compliance_paragraph character varying(2),
	compliance_article_id integer
);

--see jira mds-2661 for original requirements document
INSERT INTO tmp_report_definition_compliance
(report_name, due_date_type, due_date_period, compliance_act, compliance_section, compliance_sub_section, compliance_paragraph)
VALUES 
	('Monthly Medical Aid Report','EVT',1, 'HSRCM','1','7','1'), -- H&S
	('Monthly First Aid Report','EVT',1, 'HSRCM','1','9','3'),-- H&S
	('Procedures for the Use, Handling and Disposal of Asbestos or Materials Containing Asbestos','AVA',null, 'HSRCM','2','3','1'),-- H&S CIM?
	('Industrial Hygiene Standards for Uranium Drill Sites','AVA',null, 'HSRCM','2','3','11'), --H&S CIM?
	('Procedure for Assessment and Maintenance of Cap Lamps','AVA',null, 'HSRCM','2','8','6'), -- H&S
	('Building Design and Construction Drawings','AVA',null, 'HSRCM','4','1','1'), -- H&S, GTC
	('Underground Coal Mines Trackless Diesel Powered Equipment Procedures','AVA',null, 'HSRCM','4','7','1'), -- H&S, CIM?
	--ALREADY EXISTS UNDER 2.12.1 ('Medical Surveillance Program','AVA',null, 'HSRCM','4','4','9','4'), --H&S
	('Electrical Plan','AVA',null, 'HSRCM','5','2','1'), --H&S, CIM?
	('Dumps, Roads and Ramps Plan','AVA',null, 'HSRCM','6','10','1'), -- H&S, GTC
	('Dump Runout Zone Procedure','FIS',null, 'HSRCM','6','10','1'), -- H&S
	('Plan for Removal of Water or Saturated Material','AVA',null, 'HSRCM','6','26','2'), -- H&S
	('Duty to Keep Plans - Surface Plan','AVA',null, 'HSRCM','6','8','1'), --H&S
	('Haul Roads Plan','AVA', null, 'HSRCM','6','9','1'), -- H&S
	('Mine Hoist Letter of Certification','EVT',null, 'HSRCM','7','2','2'), --H&S/GTC
	('Hoisting Plant Commissioning Tests','EVT',null, 'HSRCM','7','2','4'),
	('Rope Test Certificate','AVA',null, 'HSRCM','7','4','4'), -- H&S
	('Rope Destructive Test','AVA',null, 'HSRCM','7','4','5'), -- H&S
	('Rope Electromagnetic Test','AVA',null, 'HSRCM','7','4','6'),
	('Shaft Rope Record','AVA',null, 'HSRCM','7','4','13'), -- H&S
	('Rope Certificate','AVA',null, 'HSRCM','7','9','4'), -- H&S
	('Hoisting Equipment Non-destructive Tests','AVA',null, 'HSRCM','7','9','7'), -- H&S
	('Safety Fuse Procedure','AVA',null, 'HSRCM','8','3','5'), -- H&S
	('Drilling in Stream/Lake/Wetland Management Plan','AVA',null, 'HSRCM','9','11','1'), -- H&S
	('Factor of Safety Justification','EVT',null, 'HSRCM','10','1','10'), -- GTC/TSF --PRIVATE, NOT MINESPACE --CIM   
	('Design Slopes Justification','EVT',null, 'HSRCM','10','1','9'), -- GTC/TSF --PRIVATE, NOT MINESPACE --CIM
	('Issued for Construction Drawings and Quality Assurance/Quality Control Plans','EVT',null, 'HSRCM','10','5','1'), -- GTC/TSF  CIM?
	('Site Monitoring and Maintenance Program','AVA',null, 'HSRCM','10','6','2'), -- H&S 
	('Reclamation and Environmental Protection Program','AVA',null, 'HSRCM','10','7','21') -- H&S, GSC, GTC
ON CONFLICT DO NOTHING;

INSERT INTO public.mine_report_definition
(report_name, description, due_date_period_months, mine_report_due_date_type, active_ind, create_user, create_timestamp, update_user, update_timestamp)
select report_name, '', due_date_period, due_date_type, 'true', 'system-mds', now(), 'system-mds', now() from tmp_report_definition_compliance;

--Look up compliance_article_id
UPDATE tmp_report_definition_compliance tmp_dr set compliance_article_id = (
	SELECT compliance_article_id from compliance_article ca where ca.section = tmp_dr.compliance_section AND COALESCE(ca.sub_section, '') = tmp_dr.compliance_sub_section AND COALESCE(ca.paragraph, '') = tmp_dr.compliance_paragraph
	LIMIT 1
);
--Look up mine_report_definition_id
UPDATE tmp_report_definition_compliance tmp_dr set mrd_id = (
	SELECT mine_report_definition_id from mine_report_definition mrd where tmp_dr.report_name = mrd.report_name
	LIMIT 1
);

--Insert into xref
INSERT INTO public.mine_report_definition_compliance_article_xref
(mine_report_definition_id,compliance_article_id)
select mrd_id, compliance_article_id from tmp_report_definition_compliance where compliance_article_id is not null;
