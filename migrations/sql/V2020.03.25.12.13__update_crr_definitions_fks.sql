
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
	('Monthly Medical Aid Report','AVA',1, 'HSRCM','1','97','1'), -- H&S
	('Monthly First Aid Report','AVA',1, 'HSRCM','1','9','3'),-- H&S
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


--Add Categories
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Monthly Medical Aid Report' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Monthly First Aid Report' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Procedures for the Use, Handling and Disposal of Asbestos or Materials Containing Asbestos' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Industrial Hygiene Standards for Uranium Drill Sites' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Procedure for Assessment and Maintenance of Cap Lamps' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Building Design and Construction Drawings' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Building Design and Construction Drawings' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Medical Surveillance Program' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Underground Coal Mines Trackless Diesel Powered Equipment Procedures' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Electrical Plan' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Dumps, Roads and Ramps Plan' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Dumps, Roads and Ramps Plan' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Dump Runout Zone Procedure' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Plan for Removal of Water or Saturated Material' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Duty to Keep Plans - Surface Plan' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Haul Roads Plan' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Mine Hoist Letter of Certification' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Mine Hoist Letter of Certification' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Hoisting Plant Commissioning Tests' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Hoisting Plant Commissioning Tests' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Rope Test Certificate' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Rope Destructive Test' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Rope Electromagnetic Test' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Shaft Rope Record' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Rope Certificate' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Hoisting Equipment Non-destructive Tests' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Safety Fuse Procedure' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Drilling in Stream/Lake/Wetland Management Plan' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Factor of Safety Justification' LIMIT 1), 'TSF') ON CONFLICT DO NOTHING; --PRIVATE, NOT MINESPACE
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Factor of Safety Justification' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING; --PRIVATE, NOT MINESPACE
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Design Slopes Justification' LIMIT 1), 'TSF') ON CONFLICT DO NOTHING; --PRIVATE, NOT MINESPACE
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Design Slopes Justification' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING; --PRIVATE, NOT MINESPACE
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Issued for Construction Drawings and Quality Assurance/Quality Control Plans' LIMIT 1), 'TSF') ON CONFLICT DO NOTHING; --PRIVATE, NOT MINESPACE
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Issued for Construction Drawings and Quality Assurance/Quality Control Plans' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING; --PRIVATE, NOT MINESPACE
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Site Monitoring and Maintenance Program' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING; 
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Site Monitoring and Maintenance Program' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING; 
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Site Monitoring and Maintenance Program' LIMIT 1), 'GSE') ON CONFLICT DO NOTHING; 
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Reclamation and Environmental Protection Program' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING; 
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Reclamation and Environmental Protection Program' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING; 
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Reclamation and Environmental Protection Program' LIMIT 1), 'GSE') ON CONFLICT DO NOTHING; 




----report_name updates
UPDATE public.mine_report_definition SET
report_name = 'Musculoskeletal Disorder Preventative Training Program'
where report_name = 'Musculoskeletal Disorder Prevention Program';

UPDATE public.mine_report_definition SET
report_name = 'Annual Safety Statistics Report'
where report_name = 'OHSC Annual Report';

UPDATE public.mine_report_definition SET
report_name = 'Confined Spaces Safe Work Procedures'
where report_name = 'Standard Operating Procedures or Safe Work Procedures';

UPDATE public.mine_report_definition SET
report_name = 'Elevator Maintenance Record'
where report_name = 'Maintenance Record';

----'remove' these report types
UPDATE public.mine_report_definition SET
active_ind = 'false'
where report_name = 'Permit Application: ML/ARD Management Plan';

UPDATE public.mine_report_definition SET
active_ind = 'false'
where report_name = 'Dump OMS Manual';
