
DROP TABLE IF EXISTS tmp_report_definition_compliance;
CREATE TEMPORARY TABLE IF NOT EXISTS tmp_report_definition_compliance(
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
INSERT INTO tmp_report_definition_compliance
(report_name, due_date_type, due_date_period, compliance_act, compliance_section, compliance_sub_section, compliance_paragraph)
VALUES 
('OHSC Annual Report','FIS',12, 'HSRCM','1','9','3'),
	('Right to Refuse Report','EVT',null, 'HSRCM','1','10','7'),
	('Report of MERP Test','FIS',12, 'HSRCM','3','7','1'),
	('Underground Fueling Station Report','PMT',null, 'HSRCM','4','3','3'),
	('Underground Oil and Grease Storage Area Report','PMT',null, 'HSRCM','4','3','4'),
	('Flammable Gas Report','EVT',null, 'HSRCM','6','42','3'),
	('Free Fall Tests Report','EVT',null, 'HSRCM','7','5','13'),
	('Defective Explosives Report','EVT',null, 'HSRCM','8','3','4'),
	('Careless Acts Report','EVT',null, 'HSRCM','8','3','9'),
	('Drilling Precaution Procedures Report','PMT',null, 'HSRCM','8','7','2'),
	('Annual Summary of Exploration Activities','FIS',12, 'HSRCM','9','2','1'),
	('Management Plan for Riparian Area','PMT',null,'HSRCM','9','5','1'),
	('Terrain Stability Remediation Plan','EVT',null,'HSRCM','9','7','1'),
	('Terrain Incident Report','EVT',null, 'HSRCM','9','7','1'),
	('ARD Surface Material Request','PMT',null, 'HSRCM','9','10','1'),
	('Cessation of Exploration Reclamation Report','EVT',null, 'HSRCM','9','13','1'),
	('Permit Application: ML/ARD Management Plan','ANV',60, 'HSRCM','10','1','3'),
	('Duty to Report Safety Issue at TSF','EVT',null, 'HSRCM','10','1','6'),
	('Breach and Inundation Study/Failure Runout Assessment','AVA',null, 'HSRCM','10','1','11'),
	('ML/ARD Management Plan','ANV',60, 'HSRCM','10','1','16'),
	('Departure from Approval for Reclamation Program or Mine Plan','PMT',null, 'HSRCM','10','1','18'),
	('5-year Mine Plan','FIS',60, 'HSRCM','10','4','1'),
	('ITRB Terms of Reference','PMT',null, 'HSRCM','10','4','2'),
	('TSF Emergency Preparedness and Response Plan','PMT',null, 'HSRCM','10','4','2'),
	('Annual Reclamation Report','FIS',12, 'HSRCM','10','4','4'),
	('Annual DSI','FIS',12, 'HSRCM','10','4','4'),
	('ITRB Activities Report','FIS',12, 'HSRCM','10','4','4'),
	('Summary of TSF or Dam Safety Recommendations','FIS',12, 'HSRCM','10','4','4'),
	('Performance of High Risk Dumps','FIS',12, 'HSRCM','10','4','4'),
	('Mine Plan Update','FIS',60, 'HSRCM','10','4','5'),
	('Dam Safety Review','FIS',60, 'HSRCM','10','4','5'),
	('TSF, WSF or Dam As-built Report','FIS',12, 'HSRCM','10','5','1'),
	('OMS Manual','PMT',null, 'HSRCM','10','5','2'),
	('Materials Inventory Report','EVT',null, 'HSRCM','10','5','7'),
	('Closure Drawings and Plans','EVT',null, 'HSRCM','10','6','3'),
	('Closure of TSF or Dam Report','PMT',null, 'HSRCM','10','6','7'),
	('TSF Closure OMS','PMT',null, 'HSRCM','10','6','8'),
	('Closure Management Manual','EVT',null, 'HSRCM','10','6','9'),
	('Appeal to CIM Report','EVT',null, 'MA','33','1',''),
	('Workplace Monitoring Program','AVA',null, 'HSRCM','2','1','3'),
	('Report of Emergency Warning System Test','AVA',null, 'HSRCM','3','13','4'),
	('Maintenance Record','AVA',null, 'HSRCM','4','4','15'),
	('Water Management Plan','PMT',null, 'HSRCM','10','1','3'),
	('Annual Reconciliation of Water Balance and Water Management Plans','AVA',null, 'HSRCM','10','4','1'),
	('Tailings Management System','AVA',null, 'HSRCM','10','4','2'),
	('TSF Risk Assessment','AVA',null, 'HSRCM','10','4','2'),
	('TSF and Dam Registry','AVA',null, 'HSRCM','10','4','3'),
	('TSF and Dam Registry Updates','AVA',null, 'HSRCM','10','4','4'),
	('Term Extension','EVT',null, 'MA','10','6',''),
	('Acquisition of a Mine','EVT',null, 'MA','11','1',''),
	('Engineering Report','EVT',null, 'MA','18','',''),
	('ITRB Qualifications','PMT',null, 'HSRCM','10','4','2'),
	('Health and Safety Program','AVA',null, 'HSRCM','1','6','9'),
	('Dump OMS Manual','AVA',null, 'HSRCM','10','5','2'),
	('Standard Operating Procedures or Safe Work Procedures','AVA',null, 'HSRCM','3','4','2'),
	('Mine Emergency Response Plan','FIS',null, 'HSRCM','3','7','1'),
	('Musculoskeletal Disorder Prevention Program', 'AVA', null, 'HSRCM', '1','6','9')
ON CONFLICT DO NOTHING;

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

--Tag documents
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'OHSC Annual Report' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Right to Refuse Report' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Report of MERP Test' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Underground Fueling Station Report' LIMIT 1),  'GSE') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Underground Fueling Station Report' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Underground Oil and Grease Storage Area Report' LIMIT 1), 'GSE') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Underground Oil and Grease Storage Area Report' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Flammable Gas Report' LIMIT 1),  'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Free Fall Tests Report' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Defective Explosives Report' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Careless Acts Report' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Drilling Precaution Procedures Report' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Annual Summary of Exploration Activities' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Annual Summary of Exploration Activities' LIMIT 1), 'GSE') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Annual Summary of Exploration Activities' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Management Plan for Riparian Area' LIMIT 1), 'GSE') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Terrain Stability Remediation Plan' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Terrain Stability Remediation Plan' LIMIT 1), 'GSE') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Terrain Incident Report' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Terrain Incident Report' LIMIT 1), 'GSE') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'ARD Surface Material Request' LIMIT 1), 'GSE') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Cessation of Exploration Reclamation Report' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Cessation of Exploration Reclamation Report' LIMIT 1), 'GSE') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Cessation of Exploration Reclamation Report' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Permit Application: ML/ARD Management Plan' LIMIT 1), 'GSE') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Duty to Report Safety Issue at TSF' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Duty to Report Safety Issue at TSF' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Breach and Inundation Study/Failure Runout Assessment' LIMIT 1),  'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'ML/ARD Management Plan' LIMIT 1), 'GSE') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Departure from Approval for Reclamation Program or Mine Plan' LIMIT 1),  'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Departure from Approval for Reclamation Program or Mine Plan' LIMIT 1),  'GSE') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Departure from Approval for Reclamation Program or Mine Plan' LIMIT 1),  'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = '5-year Mine Plan' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = '5-year Mine Plan' LIMIT 1), 'GSE') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = '5-year Mine Plan' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'ITRB Terms of Reference' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'TSF Emergency Preparedness and Response Plan' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'TSF Emergency Preparedness and Response Plan' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Annual Reclamation Report' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Annual Reclamation Report' LIMIT 1), 'GSE') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Annual Reclamation Report' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Annual DSI' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'ITRB Activities Report' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Summary of TSF or Dam Safety Recommendations' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Summary of TSF or Dam Safety Recommendations' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Performance of High Risk Dumps' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Mine Plan Update' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Mine Plan Update' LIMIT 1), 'GSE') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Mine Plan Update' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Dam Safety Review' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Dam Safety Review' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'TSF, WSF or Dam As-built Report' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'OMS Manual' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Materials Inventory Report' LIMIT 1), 'GSE') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Materials Inventory Report' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Closure Drawings and Plans' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Closure Drawings and Plans' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Closure of TSF or Dam Report' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'TSF Closure OMS' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Closure Management Manual' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Closure Management Manual' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Appeal to CIM Report' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Workplace Monitoring Program' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Report of Emergency Warning System Test' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Maintenance Record' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Water Management Plan' LIMIT 1), 'GSE') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Annual Reconciliation of Water Balance and Water Management Plans' LIMIT 1), 'GSE') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Tailings Management System' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'TSF Risk Assessment' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'TSF and Dam Registry' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'TSF and Dam Registry Updates' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Term Extension' LIMIT 1), 'OTH') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Acquisition of a Mine' LIMIT 1), 'OTH') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Engineering Report' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Dump OMS Manual' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'ITRB Qualifications' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Health and Safety Program' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Standard Operating Procedures or Safe Work Procedures' LIMIT 1),  'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Mine Emergency Response Plan' LIMIT 1),'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Musculoskeletal Disorder Prevention Program' LIMIT 1),'H&S') ON CONFLICT DO NOTHING;
DROP TABLE IF EXISTS tmp_report_definition_compliance;