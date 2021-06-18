-- The new camp_detail table has an FK to activity_detail table. Populate the new table with exisiting activity_detail data
INSERT INTO camp_detail
(select activity_detail_id from ((activity_summary_detail_xref asdx inner join activity_summary ast on asdx.activity_summary_id = ast.activity_summary_id)
 inner join now_application_identity nai on nai.now_application_id = ast.now_application_id) where ast.activity_type_code = 'camp'
) on conflict do nothing;