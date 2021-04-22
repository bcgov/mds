DROP VIEW IF EXISTS public.core_activity_subscription_view;

CREATE VIEW core_activity_subscription_view AS
SELECT 
cas.target_guid,
cas.core_activity_object_type_code,
cas.core_user_guid,
CASE WHEN nai.now_application_guid IS NOT NULL THEN nai.now_number 
	 WHEN m.mine_guid IS NOT NULL THEN m.mine_name 
	 WHEN p.permit_guid IS NOT NULL THEN p.permit_no 
	 WHEN pr.party_guid IS NOT NULL THEN pr.first_name || ' ' || pr.party_name
	 WHEN mr.mine_report_guid IS NOT NULL THEN mrd.report_name
	 ELSE ''
END AS target_title
FROM core_activity_subscription cas 
LEFT JOIN now_application_identity nai ON nai.now_application_guid = cas.target_guid 
LEFT JOIN mine m ON m.mine_guid = cas.target_guid 
LEFT JOIN permit p ON p.permit_guid = cas.target_guid
LEFT JOIN party pr ON pr.party_guid = cas.target_guid
LEFT JOIN mine_report mr ON mr.mine_report_guid = cas.target_guid 
LEFT JOIN mine_report_definition mrd ON mrd.mine_report_definition_id = mr.mine_report_definition_id;