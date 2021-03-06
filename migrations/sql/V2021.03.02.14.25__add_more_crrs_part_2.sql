-- Pattern copied from previous migration script to add more CRRs: V2019.07.09.16.01__insert_mine_report_defintion_related_tabels

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

-- Look up compliance_article_id
UPDATE tmp_report_definition_compliance tmp_dr SET compliance_article_id = (
	SELECT compliance_article_id FROM compliance_article ca WHERE ca.section = tmp_dr.compliance_section AND COALESCE(ca.sub_section, '') = tmp_dr.compliance_sub_section AND COALESCE(ca.paragraph, '') = tmp_dr.compliance_paragraph
	LIMIT 1
);

-- Look up mine_report_definition_id
UPDATE tmp_report_definition_compliance tmp_dr SET mrd_id = (
	SELECT mine_report_definition_id FROM mine_report_definition mrd WHERE tmp_dr.report_name = mrd.report_name
	LIMIT 1
);

-- Insert into xref
INSERT INTO public.mine_report_definition_compliance_article_xref
(mine_report_definition_id,compliance_article_id)
SELECT mrd_id, compliance_article_id FROM tmp_report_definition_compliance WHERE compliance_article_id IS NOT NULL;

-- Tag documents
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id FROM mine_report_definition x WHERE report_name = 'Annual Summary of Placer Activities' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id FROM mine_report_definition x WHERE report_name = 'Annual Summary of Placer Activities' LIMIT 1), 'OTH') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id FROM mine_report_definition x WHERE report_name = 'Annual Summary of Placer Activities' LIMIT 1), 'GSE') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id FROM mine_report_definition x WHERE report_name = 'Annual Summary of Work and Reclamation Report' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id FROM mine_report_definition x WHERE report_name = 'Annual Summary of Work and Reclamation Report' LIMIT 1), 'OTH') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id FROM mine_report_definition x WHERE report_name = 'Annual Summary of Work and Reclamation Report' LIMIT 1), 'GSE') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id FROM mine_report_definition x WHERE report_name = 'Notification To Start' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id FROM mine_report_definition x WHERE report_name = 'Notification To Start' LIMIT 1), 'OTH') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id FROM mine_report_definition x WHERE report_name = 'Notification To Start' LIMIT 1), 'GSE') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id FROM mine_report_definition x WHERE report_name = 'Notification To Stop' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id FROM mine_report_definition x WHERE report_name = 'Notification To Stop' LIMIT 1), 'OTH') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id FROM mine_report_definition x WHERE report_name = 'Notification To Stop' LIMIT 1), 'GSE') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id FROM mine_report_definition x WHERE report_name = 'Application for Security Release' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id FROM mine_report_definition x WHERE report_name = 'Application for Security Release' LIMIT 1), 'OTH') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id FROM mine_report_definition x WHERE report_name = 'Application for Security Release' LIMIT 1), 'GSE') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id FROM mine_report_definition x WHERE report_name = 'Multi-Year Area Based Permit Updates' LIMIT 1), 'GTC') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id FROM mine_report_definition x WHERE report_name = 'Multi-Year Area Based Permit Updates' LIMIT 1), 'OTH') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id FROM mine_report_definition x WHERE report_name = 'Multi-Year Area Based Permit Updates' LIMIT 1), 'GSE') ON CONFLICT DO NOTHING;

DROP TABLE IF EXISTS tmp_report_definition_compliance;
