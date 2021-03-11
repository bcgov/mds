UPDATE activity_summary
SET total_disturbed_area = (
SELECT now_submissions.application.placertotaldistarea
FROM now_submissions.application, now_application_identity
WHERE now_submissions.application.messageid = now_application_identity.messageid
AND now_application_identity.now_application_id = activity_summary.now_application_id
AND now_application_identity.messageid IS NOT NULL
)
WHERE activity_type_code='placer_operation';