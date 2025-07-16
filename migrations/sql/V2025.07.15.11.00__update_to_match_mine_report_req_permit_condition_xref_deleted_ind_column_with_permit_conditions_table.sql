UPDATE mine_report_req_permit_condition_xref xref
SET deleted_ind = pc.deleted_ind
FROM permit_conditions pc
WHERE xref.permit_condition_id = pc.permit_condition_id;