

INSERT INTO public.mine_report_category
(mine_report_category, description, display_order, active_ind, create_user, create_timestamp, update_user, update_timestamp)
VALUES 
	('TSF', 'Tailings Storage Factility', 31, true, 'system-mds', now(), 'system-mds', now())
on conflict do nothing;

--Tag documents
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Summary of TSF or Dam Safety Recommendations' LIMIT 1), 'TSF') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'ITRB Activities Report' LIMIT 1), 'TSF') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'TSF and Dam Registry' LIMIT 1), 'TSF') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Annual DSI' LIMIT 1),  'TSF') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Dam Safety Review' LIMIT 1), 'TSF') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'TSF, WSF or Dam As-built Report' LIMIT 1), 'TSF') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Annual Reclamation Report' LIMIT 1), 'TSF') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'OMS Manual' LIMIT 1), 'TSF') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Annual Reconciliation of Water Balance and Water Management Plans' LIMIT 1), 'TSF') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'TSF Risk Assessment' LIMIT 1), 'TSF') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'TSF Emergency Preparedness and Response Plan' LIMIT 1), 'TSF') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Tailings Management System' LIMIT 1), 'TSF') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Closure of TSF or Dam Report' LIMIT 1), 'TSF') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'TSF Closure OMS' LIMIT 1), 'TSF') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'TSF and Dam Registry Updates' LIMIT 1), 'TSF') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'ITRB Terms of Reference' LIMIT 1), 'TSF') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'ITRB Qualifications' LIMIT 1), 'TSF') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'TSF and Dam Registry Updates' LIMIT 1), 'TSF') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Breach and Inundation Study/Failure Runout Assessment' LIMIT 1), 'TSF') ON CONFLICT DO NOTHING;
INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category) values ((SELECT x.mine_report_definition_id from mine_report_definition x where report_name = 'Duty to Report Safety Issue at TSF' LIMIT 1), 'TSF') ON CONFLICT DO NOTHING;
