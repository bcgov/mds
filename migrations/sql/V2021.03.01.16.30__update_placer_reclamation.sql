-- UPDATE activity_detail
-- SET length_unit_type_code = 'MTR'
--     ,width_unit_type_code = 'MTR'
-- FROM (SELECT ad.activity_detail_id
--     FROM activity_detail ad
--         JOIN activity_summary_detail_xref asdx ON asdx.activity_detail_id = ad.activity_detail_id
--         JOIN activity_summary as2 ON as2.activity_summary_id = asdx.activity_summary_id
--     WHERE as2.activity_type_code = 'placer_operation') AS cut_lines
-- WHERE cut_lines.activity_detail_id = activity_detail.activity_detail_id;


-- UPDATE activity_summary WHERE activity_type_code =  'placer_operation' SET total_disturbed_area


-- UPDATE activity_summary
-- SET activity_summary.total_disturbed_area=(SELECT now_submissions.application.placertotaldistarea
--   FROM now_submissions.application
--   WHERE now_submissions.application.now_application_id=activity_summary.now_application_id AND activity_summary.activity_type_code='placer_operation');

--   UPDATE activity_summary
--   where activity_type_code='placer_operation'
--   update with value from now_submissions.application.placertotaldistarea
--   Where now_application.now_application_id === activity_summary.now_application_id and now_application_identity.now_application_id
--   and where now_submissions.application.messageid = now_application_identity.messageid