-- Updates the permit_amendments which have conditions with latest update_timestamp and update_user
UPDATE permit_amendment AS pa
SET permit_conditions_last_updated_by = gpa.update_user,
	permit_conditions_last_updated_date = gpa.update_timestamp
FROM
(SELECT a.*
FROM PERMIT_CONDITIONS A
	LEFT OUTER JOIN permit_conditions b
	ON a.permit_amendment_id = b.permit_amendment_id AND a.update_timestamp < b.update_timestamp
WHERE b.permit_amendment_id IS NULL) AS gpa
WHERE pa.permit_amendment_id = gpa.permit_amendment_id;