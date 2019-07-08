
INSERT INTO public.mine_report_category
(mine_report_category, description, display_order, active_ind, create_user, create_timestamp, update_user, update_timestamp)
VALUES 
	('H&S', 'Health and Safety', 10, true, 'system-mds', now(), 'system-mds', now()),
	('GSE', 'GeoScience and Environmental', 20, true, 'system-mds', now(), 'system-mds', now()),
	('GTC', 'Geotechnical', 30, true, 'system-mds', now(), 'system-mds', now())
on conflict do nothing;

INSERT INTO public.mine_report_due_date_type
(mine_report_due_date_type, description, active_ind, create_user, create_timestamp, update_user, update_timestamp)
VALUES
	('REG', 'Regular Intervals', true, 'system-mds', now(), 'system-mds', now()),
	('REQ', 'Available on Request', true, 'system-mds', now(), 'system-mds', now()),
	('PMT', 'Permit Requirement', true, 'system-mds', now(), 'system-mds', now()),
	('EVT', 'An Event Occured', true, 'system-mds', now(), 'system-mds', now())
on conflict do nothing;


ALTER TABLE public.mine_report_definition ALTER COLUMN due_date_period_months DROP NOT NULL;
ALTER TABLE public.mine_report_definition ALTER COLUMN mine_report_due_date_type DROP NOT NULL;
ALTER TABLE public.mine_report_definition ALTER COLUMN mine_report_definition_guid set DEFAULT gen_random_uuid();
ALTER TABLE public.mine_report_definition ALTER COLUMN report_name TYPE character varying(100);



DROP TABLE tmp_report_definition_compliance;

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
INSERT INTO tmp_report_definition_compliance
(report_name, due_date_type, due_date_period, compliance_act, compliance_section, compliance_sub_section, compliance_paragraph)
VALUES 
	('OHSC Annual Report','REG',12, 'HSRCM','1','9','3'),
	('Right to Refuse Report','EVT',null, 'HSRCM','1','10','7'),
	('Report of MERP Test','REG',12, 'HSRCM','3','7','1'),
	('Underground Fueling Station Report','PMT',null, 'HSRCM','4','3','3'),
	('Underground Oil and Grease Storage Area Report','PMT',null, 'HSRCM','4','3','4'),
	('Flammable Gas Report','EVT',null, 'HSRCM','6','42','3'),
	('Free Fall Tests Report','EVT',null, 'HSRCM','7','5','13'),
	('Defective Explosives Report','EVT',null, 'HSRCM','8','3','4'),
	('Careless Acts Report','EVT',null, 'HSRCM','8','3','9'),
	('Drilling Precaution Procedures Report','PMT',null, 'HSRCM','8','7','2'),
	('Annual Summary of Exploration Activities','REG',12, 'HSRCM','9','2','1'),
	('Management Plan for Riparian Area','PMT',null,'HSRCM','9','5','1'),
	('Terrain Stability Remediation Plan','EVT',null,'HSRCM','9','7','1'),
	('Terrain Incident Report','EVT',null, 'HSRCM','9','7','1'),
	('ARD Surface Material Request','PMT',null, 'HSRCM','9','10','1'),
	('Cessation of Exploration Reclamation Report','EVT',null, 'HSRCM','9','13','1'),
	('ML/ARD Management Plan','REG',null, 'HSRCM','10','1','3'),
	('Duty to Report Safety Issue at TSF','EVT',null, 'HSRCM','10','1','6'),
	('Breach and Inundation Study/Failure Runout Assessment','REQ',null, 'HSRCM','10','1','11'),
	('ML/ARD Management Plan','REG',null, 'HSRCM','10','1','16'),
	('Departure from Approval for Reclamation Program or Mine Plan','PMT',null, 'HSRCM','10','1','18'),
	('5-year Mine Plan','REG',60, 'HSRCM','10','4','1'),
	('ITRB Terms of Reference','PMT',null, 'HSRCM','10','4','2'),
	('TSF Emergency Preparedness and Response Plan','PMT',null, 'HSRCM','10','4','2'),
	('Annual Reclamation Report','REG',12, 'HSRCM','10','4','4'),
	('Annual DSI','REG',12, 'HSRCM','10','4','4'),
	('ITRB Activities Report','REG',12, 'HSRCM','10','4','4'),
	('Summary of TSF or Dam Safety Recommendations','REG',12, 'HSRCM','10','4','4'),
	('Performance of high risk dumps','REG',12, 'HSRCM','10','4','4'),
	('Mine Plan Update','REG',60, 'HSRCM','10','4','5'),
	('DSR','REG',60, 'HSRCM','10','4','5'),
	('TSF, WSF or Dam As-built Report','REG',null, 'HSRCM','10','4','5'),
	('As-Built reports','REG',60, 'HSRCM','10','4','5'),
	('TSF, WSF or Dam As-built Report','REG',null, 'HSRCM','10','5','1'),
	('OMS Manual','PMT',null, 'HSRCM','10','5','2'),
	('Materials Inventory Report','EVT',null, 'HSRCM','10','5','7'),
	('Closure Drawings and Plans','REG',null, 'HSRCM','10','6','3'),
	('Closure of TSF or Dam Report','PMT',null, 'HSRCM','10','6','7'),
	('TSF Closure OMS','PMT',null, 'HSRCM','10','6','8'),
	('Closure Management Manual','REG',null, 'HSRCM','10','6','9'),
	('Appeal to CIM Report','EVT',null, 'MA','33','1',''),
	('Workplace Monitoring Program','REQ',null, '',' ',' ',''),
	('Report of Test','REQ',null, 'HSRCM','3','13','4'),
	('Maintenance Record','REQ',null, 'HSRCM','4','4','15'),
	('Water Management Plan','PMT',null, 'HSRCM','10','1','3'),
	('Annual reconciliation of water balance and water management plans','REQ',null, 'HSRCM','10','4','1'),
	('Tailings Management System','REQ',null, 'HSRCM','10','4','2'),
	('TSF Risk Assessment','REQ',null, 'HSRCM','10','4','2'),
	('TSF and Dam Registry','REQ',null, 'HSRCM','10','4','3'),
	('TSF and Dam Registry Updates',null,null, 'HSRCM','10','4','4'),
	('Term Extension (request?)','EVT',null, 'MA','10','6',''),
	('Acquisition of a Mine (new operator/permittee)','EVT',null, 'MA','11','1',''),
	('Engineering Report','EVT',null, 'MA','18',' ',''),
	('DO Investigation Report','EVT',null, '','','',''),
	('ITRB Qualifications','PMT',null, '','','',''),
	('Work Under Notice of Deemed Authorization ','PMT',null, '','','',''),
	('Health and Safety Program','REQ',null, '','','',''),
	('Annual Pit Slope Report','REG',null, '','','',''),
	('Annual Dump Report','REG',null, '','','',''),
	('Advice of Geotechnical Incident Report','EVT',null, '','','',''),
	('Dump OMS Manual','REQ',null, '','','',''),
	('Open Pit GCMP','REQ',null, '','','',''),
	('Compliance Report','PMT',null, '','','',''),
	('Standard Operating Procedures or Safe Work Procedures','REQ',null, '','','',''),
	('Nitrogen Management Plan','PMT',null, '','','',''),
	('Corporate Name Change','EVT',null, '','','',''),
	('Archaeological Assessment','PMT',null, '','','',''),
	('MYAB Annual Update','REG',null, '','','',''),
	('Mine Emergency Response Plan','REG',null, '','','','')
ON CONFLICT DO NOTHING;

UPDATE tmp_report_definition_compliance tmp_dr set compliance_article_id = (
	SELECT compliance_article_id from compliance_article ca where ca.section = tmp_dr.compliance_section AND ca.sub_section = tmp_dr.compliance_sub_section AND ca.paragraph = tmp_dr.compliance_paragraph
	LIMIT 1
);


UPDATE tmp_report_definition_compliance tmp_dr set mrd_id = (
	SELECT mine_report_definition_id from mine_report_definition mrd where tmp_dr.report_name = mrd.report_name
	LIMIT 1
);


INSERT INTO public.mine_report_definition
(report_name, description, due_date_period_months, mine_report_due_date_type, active_ind, create_user, create_timestamp, update_user, update_timestamp)
select report_name, '', due_date_period, due_date_type, 'true', 'system-mds', now(), 'system-mds', now() from tmp_report_definition_compliance;

INSERT INTO public.mine_report_definition_compliance_article_xref
(mine_report_definition_id,compliance_article_id)
select mrd_id, compliance_article_id from tmp_report_definition_compliance where compliance_article_id is not null;