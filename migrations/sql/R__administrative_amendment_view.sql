DROP VIEW IF EXISTS public.administrative_amendment_view;

CREATE OR REPLACE VIEW public.administrative_amendment_view
AS
SELECT nid.now_application_guid,
m.mine_guid,
m.mine_no,
nid.now_number as administrative_amendment_number,
app.lead_inspector_party_guid,
concat_ws (' ', p.first_name, p.party_name) AS lead_inspector_name,
atc.description as application_entity_type_description,
app.received_date,
app.create_timestamp as import_timestamp,
app.update_timestamp as update_timestamp,
nows.description as application_status_description,
nowt.description as application_type_description
FROM now_application_identity nid 
JOIN mine m on nid.mine_guid = m.mine_guid
LEFT JOIN now_application app on nid.now_application_id=app.now_application_id
LEFT JOIN party p on app.lead_inspector_party_guid=p.party_guid
LEFT JOIN application_type_code atc ON atc.application_type_code = nid.application_type_code
LEFT JOIN notice_of_work_type nowt on app.notice_of_work_type_code=nowt.notice_of_work_type_code
LEFT JOIN now_application_status nows on app.now_application_status_code=nows.now_application_status_code
where nid.application_type_code = 'ADA';