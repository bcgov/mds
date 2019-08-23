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
);INSERT INTO tmp_report_definition_compliance
(report_name, due_date_type, due_date_period, compliance_act, compliance_section, compliance_sub_section, compliance_paragraph)
VALUES 
	('Medical Surveillance Program','AVA', null, 'HSRCM','2','12','1'),
	('Hearing Conservation Program','AVA',null, 'HSRCM','2','12','4'),
	('Heat and Cold Stress Program','AVA', null, 'HSRCM','2','10','1'),
	('Housekeeping Program','AVA', null, 'HSRCM','2','2','1')
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

INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Medical Surveillance Program' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Hearing Conservation Program' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Heat and Cold Stress Program' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Housekeeping Program' LIMIT 1), 'H&S') ON CONFLICT DO NOTHING;
