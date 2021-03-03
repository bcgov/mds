-- Pattern copied from previous migration script to add more CRRs: V2019.07.05.15.01__insert_code_required_reports.sql

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

INSERT INTO tmp_report_definition_compliance
    (report_name, due_date_type, due_date_period, compliance_act, compliance_section, compliance_sub_section, compliance_paragraph)
VALUES 
	('Annual Summary of Placer Activities', 'AVA', null, 'HSRCM', '10', '4', '4'),
	('Annual Summary of Work and Reclamation Report', 'AVA', null, 'HSRCM', '10', '4', '4'),
	('Notification To Start', 'AVA', null, 'HSRCM', '6', '2', '1'),
	('Notification To Stop', 'AVA', null, 'HSRCM', '6', '2', '2'),
	('Application for Security Release', 'AVA', null, 'HSRCM', '10', '6', '16'),
	('Multi-Year Area Based Permit Updates', 'PMT', null, 'HSRCM', '10', '4', '5')
ON CONFLICT DO NOTHING;

INSERT INTO public.mine_report_definition
    (report_name, description, due_date_period_months, mine_report_due_date_type, active_ind, create_user, create_timestamp, update_user, update_timestamp)
SELECT report_name, '', due_date_period, due_date_type, 'true', 'system-mds', now(), 'system-mds', now()
FROM tmp_report_definition_compliance;
