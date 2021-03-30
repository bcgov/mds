DELETE FROM application_reason_code_xref
WHERE application_reason_code in ('INR', 'TRP');

DELETE FROM application_reason_code
WHERE application_reason_code in ('INR', 'TRP');