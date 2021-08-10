ALTER TABLE now_application_document_xref ADD COLUMN IF NOT EXISTS final_package_order integer;
ALTER TABLE now_application_document_identity_xref ADD COLUMN IF NOT EXISTS final_package_order integer;

-- Use the sorting logic the application currently uses for permit package documents to determine the initial value for each permit package document's "final package order".
UPDATE now_application_document_xref
SET final_package_order = current_order
FROM (
	SELECT
		now_application_id,
		now_application_document_xref_guid,
		row_number() OVER (PARTITION BY now_application_id ORDER BY create_timestamp DESC) AS current_order
	FROM now_application_document_xref nadx
	WHERE is_final_package = true
) AS current_orders
WHERE now_application_document_xref.now_application_document_xref_guid = current_orders.now_application_document_xref_guid;

WITH max_document_orders AS (
	SELECT
		now_application_id,
		max(final_package_order) as max_order
	FROM now_application_document_xref
	GROUP BY now_application_id
)

UPDATE now_application_document_identity_xref
SET final_package_order = current_order
FROM (
	SELECT
		now_application_id,
		now_application_document_xref_guid,
		coalesce((SELECT max_order FROM max_document_orders mdo WHERE mdo.now_application_id = nadix.now_application_id), 0) + row_number() OVER (PARTITION BY now_application_id ORDER BY create_timestamp ASC) AS current_order
		FROM now_application_document_identity_xref nadix
		WHERE is_final_package = true
) AS current_identity_orders
WHERE now_application_document_identity_xref.now_application_document_xref_guid = current_identity_orders.now_application_document_xref_guid;
