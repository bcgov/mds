DELETE FROM mine_report_definition_compliance_article_xref WHERE mine_report_definition_id =
(SELECT mine_report_definition_id from mine_report_definition mrd where report_name = 'Dump OMS Manual');
DELETE FROM mine_report_category_xref WHERE mine_report_definition_id =
(SELECT mine_report_definition_id from mine_report_definition mrd where report_name = 'Dump OMS Manual');
DELETE FROM mine_report_definition WHERE mine_report_definition_id =
(SELECT mine_report_definition_id from mine_report_definition mrd where report_name = 'Dump OMS Manual');




INSERT INTO public.mine_report_definition
(report_name, description, due_date_period_months, mine_report_due_date_type, active_ind, create_user, create_timestamp, update_user, update_timestamp)
VALUES ('OHSC Meeting Minutes', 'Must be filed with the manager and forwarded to local union, posted at the mine and made available to an inspector upon request.', 
null, 'AVA', true, 'system-mds', now(), 'system-mds', now());

INSERT INTO public.mine_report_definition_compliance_article_xref (mine_report_definition_id,compliance_article_id)
SELECT mine_report_definition_id, compliance_article_id
FROM mine_report_definition, compliance_article where report_name ='OHSC Meeting Minutes' 
AND article_act_code ='HSRCM' AND "section" = '1' AND sub_section = '6' and paragraph = '4';

INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category)
SELECT mine_report_definition_id, 'H&S' as mine_report_category 
FROM mine_report_definition WHERE report_name ='OHSC Meeting Minutes' ;



INSERT INTO public.mine_report_definition
(report_name, description, due_date_period_months, mine_report_due_date_type, active_ind, create_user, create_timestamp, update_user, update_timestamp)
VALUES ('Crew Safety Meeting Minutes', 'Minutes shall be kept and made available to an inspector upon request.', 
null, 'AVA', true, 'system-mds', now(), 'system-mds', now());

INSERT INTO public.mine_report_definition_compliance_article_xref (mine_report_definition_id,compliance_article_id)
SELECT mine_report_definition_id, compliance_article_id
FROM mine_report_definition, compliance_article where report_name ='Crew Safety Meeting Minutes' 
AND article_act_code ='HSRCM' AND "section" = '1' AND sub_section = '6' and paragraph = '12';

INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category)
SELECT mine_report_definition_id, 'H&S' as mine_report_category 
FROM mine_report_definition WHERE report_name ='Crew Safety Meeting Minutes' ;



INSERT INTO public.mine_report_definition
(report_name, description, due_date_period_months, mine_report_due_date_type, active_ind, create_user, create_timestamp, update_user, update_timestamp)
VALUES ('Training Records', 'Manager shall maintain a record and make it available to an inspector upon request.', 
null, 'AVA', true, 'system-mds', now(), 'system-mds', now());

INSERT INTO public.mine_report_definition_compliance_article_xref (mine_report_definition_id,compliance_article_id)
SELECT mine_report_definition_id, compliance_article_id
FROM mine_report_definition, compliance_article where report_name ='Training Records' 
AND article_act_code ='HSRCM' AND "section" = '1' AND sub_section = '11' and paragraph = '2';

INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category)
SELECT mine_report_definition_id, 'H&S' as mine_report_category 
FROM mine_report_definition WHERE report_name ='Training Records' ;



INSERT INTO public.mine_report_definition
(report_name, description, due_date_period_months, mine_report_due_date_type, active_ind, create_user, create_timestamp, update_user, update_timestamp)
VALUES ('Conveyor Belt Safe Work Procedures', 'Manager must develop safe work procedures for work or cleanup near moving conveyors. ', 
null, 'AVA', true, 'system-mds', now(), 'system-mds', now());

INSERT INTO public.mine_report_definition_compliance_article_xref (mine_report_definition_id,compliance_article_id)
SELECT mine_report_definition_id, compliance_article_id
FROM mine_report_definition, compliance_article where report_name ='Conveyor Belt Safe Work Procedures' 
AND article_act_code ='HSRCM' AND "section" = '4' AND sub_section = '4' and paragraph = '16';

INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category)
SELECT mine_report_definition_id, 'H&S' as mine_report_category 
FROM mine_report_definition WHERE report_name ='Conveyor Belt Safe Work Procedures' ;



INSERT INTO public.mine_report_definition
(report_name, description, due_date_period_months, mine_report_due_date_type, active_ind, create_user, create_timestamp, update_user, update_timestamp)
VALUES ('Annual Brake Tests', 'Testing required annually but Code doesn’t specify a record must be kept available at the mine. Inspectors do request these records though.', 
null, 'AVA', true, 'system-mds', now(), 'system-mds', now());

INSERT INTO public.mine_report_definition_compliance_article_xref (mine_report_definition_id,compliance_article_id)
SELECT mine_report_definition_id, compliance_article_id
FROM mine_report_definition, compliance_article where report_name ='Annual Brake Tests' 
AND article_act_code ='HSRCM' AND "section" = '4' AND sub_section = '9' and paragraph = '19';

INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category)
SELECT mine_report_definition_id, 'H&S' as mine_report_category 
FROM mine_report_definition WHERE report_name ='Annual Brake Tests' ;




INSERT INTO public.mine_report_definition
(report_name, description, due_date_period_months, mine_report_due_date_type, active_ind, create_user, create_timestamp, update_user, update_timestamp)
VALUES ('Reversal Procedure for Trains', 'If trains are required to reverse frequently and for lengthy distances, a procedure must be followed that is acceptable to the inspector.', 
null, 'AVA', true, 'system-mds', now(), 'system-mds', now());

INSERT INTO public.mine_report_definition_compliance_article_xref (mine_report_definition_id,compliance_article_id)
SELECT mine_report_definition_id, compliance_article_id
FROM mine_report_definition, compliance_article where report_name ='Reversal Procedure for Trains' 
AND article_act_code ='HSRCM' AND "section" = '4' AND sub_section = '10' and paragraph = '1';

INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category)
SELECT mine_report_definition_id, 'H&S' as mine_report_category 
FROM mine_report_definition WHERE report_name ='Reversal Procedure for Trains' ;




INSERT INTO public.mine_report_definition
(report_name, description, due_date_period_months, mine_report_due_date_type, active_ind, create_user, create_timestamp, update_user, update_timestamp)
VALUES ('Lock-out Procedures', 'Manager must develop a procedure and a written copy must be provided to trained persons.', 
null, 'AVA', true, 'system-mds', now(), 'system-mds', now());

INSERT INTO public.mine_report_definition_compliance_article_xref (mine_report_definition_id,compliance_article_id)
SELECT mine_report_definition_id, compliance_article_id
FROM mine_report_definition, compliance_article where report_name ='Lock-out Procedures' 
AND article_act_code ='HSRCM' AND "section" = '4' AND sub_section = '11' and paragraph = '1';

INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category)
SELECT mine_report_definition_id, 'H&S' as mine_report_category 
FROM mine_report_definition WHERE report_name ='Lock-out Procedures' ;




INSERT INTO public.mine_report_definition
(report_name, description, due_date_period_months, mine_report_due_date_type, active_ind, create_user, create_timestamp, update_user, update_timestamp)
VALUES ('Mobile Electrical Equipment Supply System Tests', '', 
null, 'AVA', true, 'system-mds', now(), 'system-mds', now());

INSERT INTO public.mine_report_definition_compliance_article_xref (mine_report_definition_id,compliance_article_id)
SELECT mine_report_definition_id, compliance_article_id
FROM mine_report_definition, compliance_article where report_name ='Mobile Electrical Equipment Supply System Tests' 
AND article_act_code ='HSRCM' AND "section" = '5' AND sub_section = '7' and paragraph = '2';

INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category)
SELECT mine_report_definition_id, 'H&S' as mine_report_category 
FROM mine_report_definition WHERE report_name ='Mobile Electrical Equipment Supply System Tests' ;




INSERT INTO public.mine_report_definition
(report_name, description, due_date_period_months, mine_report_due_date_type, active_ind, create_user, create_timestamp, update_user, update_timestamp)
VALUES ('Remote Control Operations Plan', 'Required to provide plan to CIM and have plan approved by CIM.', 
null, 'AVA', true, 'system-mds', now(), 'system-mds', now());

INSERT INTO public.mine_report_definition_compliance_article_xref (mine_report_definition_id,compliance_article_id)
SELECT mine_report_definition_id, compliance_article_id
FROM mine_report_definition, compliance_article where report_name ='Remote Control Operations Plan' 
AND article_act_code ='HSRCM' AND "section" = '6' AND sub_section = '18' and paragraph = '1';

INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category)
SELECT mine_report_definition_id, 'H&S' as mine_report_category 
FROM mine_report_definition WHERE report_name ='Remote Control Operations Plan' ;




INSERT INTO public.mine_report_definition
(report_name, description, due_date_period_months, mine_report_due_date_type, active_ind, create_user, create_timestamp, update_user, update_timestamp)
VALUES ('Water in Rock Passes Operating Procedure', 'No water must be introduced without following an operating procedure approved by Chief Inspector.', 
null, 'AVA', true, 'system-mds', now(), 'system-mds', now());

INSERT INTO public.mine_report_definition_compliance_article_xref (mine_report_definition_id,compliance_article_id)
SELECT mine_report_definition_id, compliance_article_id
FROM mine_report_definition, compliance_article where report_name ='Water in Rock Passes Operating Procedure' 
AND article_act_code ='HSRCM' AND "section" = '6' AND sub_section = '26' and paragraph = '1';

INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category)
SELECT mine_report_definition_id, 'H&S' as mine_report_category 
FROM mine_report_definition WHERE report_name ='Water in Rock Passes Operating Procedure' ;




INSERT INTO public.mine_report_definition
(report_name, description, due_date_period_months, mine_report_due_date_type, active_ind, create_user, create_timestamp, update_user, update_timestamp)
VALUES ('Special Signal Code', 'If used, special signals must be posted in at the mine and approved by an inspector', 
null, 'AVA', true, 'system-mds', now(), 'system-mds', now());

INSERT INTO public.mine_report_definition_compliance_article_xref (mine_report_definition_id,compliance_article_id)
SELECT mine_report_definition_id, compliance_article_id
FROM mine_report_definition, compliance_article where report_name ='Special Signal Code' 
AND article_act_code ='HSRCM' AND "section" = '7' AND sub_section = '7' and paragraph = '9';

INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category)
SELECT mine_report_definition_id, 'H&S' as mine_report_category 
FROM mine_report_definition WHERE report_name ='Special Signal Code' ;




INSERT INTO public.mine_report_definition
(report_name, description, due_date_period_months, mine_report_due_date_type, active_ind, create_user, create_timestamp, update_user, update_timestamp)
VALUES ('Procedures for Explosives and Accessories', 'Written procedures shall be established for the use of all explosives accessories and blasting machines.', 
null, 'AVA', true, 'system-mds', now(), 'system-mds', now());

INSERT INTO public.mine_report_definition_compliance_article_xref (mine_report_definition_id,compliance_article_id)
SELECT mine_report_definition_id, compliance_article_id
FROM mine_report_definition, compliance_article where report_name ='Procedures for Explosives and Accessories' 
AND article_act_code ='HSRCM' AND "section" = '8' AND sub_section = '6' and paragraph = '8';

INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category)
SELECT mine_report_definition_id, 'H&S' as mine_report_category 
FROM mine_report_definition WHERE report_name ='Procedures for Explosives and Accessories' ;




INSERT INTO public.mine_report_definition
(report_name, description, due_date_period_months, mine_report_due_date_type, active_ind, create_user, create_timestamp, update_user, update_timestamp)
VALUES ('Central Blasting System Procedure', 'Written summary of procedure and layout of system must be submitted to an inspector for approval before a central blasting system is used or modified.', 
null, 'AVA', true, 'system-mds', now(), 'system-mds', now());

INSERT INTO public.mine_report_definition_compliance_article_xref (mine_report_definition_id,compliance_article_id)
SELECT mine_report_definition_id, compliance_article_id
FROM mine_report_definition, compliance_article where report_name ='Central Blasting System Procedure' 
AND article_act_code ='HSRCM' AND "section" = '8' AND sub_section = '6' and paragraph = '23';

INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category)
SELECT mine_report_definition_id, 'H&S' as mine_report_category 
FROM mine_report_definition WHERE report_name ='Central Blasting System Procedure' ;




INSERT INTO public.mine_report_definition
(report_name, description, due_date_period_months, mine_report_due_date_type, active_ind, create_user, create_timestamp, update_user, update_timestamp)
VALUES ('Equipment Around Surface Misfires Procedure', 'Use of equipment restricted within 8m distance around the collar of misfired hole except as provided in s.8.7.1 or under a procedure approved by the inspector.', 
null, 'AVA', true, 'system-mds', now(), 'system-mds', now());

INSERT INTO public.mine_report_definition_compliance_article_xref (mine_report_definition_id,compliance_article_id)
SELECT mine_report_definition_id, compliance_article_id
FROM mine_report_definition, compliance_article where report_name ='Equipment Around Surface Misfires Procedure' 
AND article_act_code ='HSRCM' AND "section" = '8' AND sub_section = '8' and paragraph = '1';

INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category)
SELECT mine_report_definition_id, 'H&S' as mine_report_category 
FROM mine_report_definition WHERE report_name = 'Equipment Around Surface Misfires Procedure' ;




INSERT INTO public.mine_report_definition
(report_name, description, due_date_period_months, mine_report_due_date_type, active_ind, create_user, create_timestamp, update_user, update_timestamp)
VALUES ('Lifting Devices Records', 'If an inspector asks for it.', 
null, 'AVA', true, 'system-mds', now(), 'system-mds', now());

INSERT INTO public.mine_report_definition_compliance_article_xref (mine_report_definition_id,compliance_article_id)
SELECT mine_report_definition_id, compliance_article_id
FROM mine_report_definition, compliance_article where report_name ='Lifting Devices Records' 
AND article_act_code ='HSRCM' AND "section" = '4' AND sub_section = '4' and paragraph = '9';

INSERT INTO mine_report_category_xref (mine_report_definition_id, mine_report_category)
SELECT mine_report_definition_id, 'H&S' as mine_report_category 
FROM mine_report_definition WHERE report_name ='Lifting Devices Records' ;

























