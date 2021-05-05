WITH now_to_permit_linkage AS (
	SELECT nai.now_applicatiON_guid, p.permit_guid 
	FROM now_applicatiON_identity nai 
	LEFT JOIN permit_amendment pa ON pa.now_applicatiON_guid = nai.now_applicatiON_guid 
	LEFT JOIN permit p ON p.permit_id = pa.permit_id 
	GROUP BY nai.now_applicatiON_guid,  p.permit_guid)

, grouped_mine_types_to_insert AS (	
		SELECT ntpl.now_applicatiON_guid, ntpl.permit_guid AS nt_permit_guid, mt.permit_guid, mt.mine_guid, 
		row_number() OVER (PARTITION BY mt.permit_guid, mt.mine_guid, ntpl.now_applicatiON_guid ORDER BY update_timestamp DESC) AS rn
		FROM now_to_permit_linkage ntpl
		LEFT JOIN mine_type mt ON mt.permit_guid = ntpl.permit_guid AND active_ind = true
		GROUP BY ntpl.now_applicatiON_guid, ntpl.permit_guid,  mt.permit_guid, mt.mine_guid, update_timestamp)

INSERT INTO mine_type(mine_guid, mine_tenure_type_code, create_user, update_user, active_ind, permit_guid, now_applicatiON_guid)
 SELECT mt.mine_guid, mt.mine_tenure_type_code, 'system-mds', 'system-mds', active_ind, NULL AS permit_guid, gmt.now_applicatiON_guid 
 FROM grouped_mine_types_to_insert gmt
 JOIN mine_type mt ON mt.permit_guid = gmt.nt_permit_guid AND mt.mine_guid = mt.mine_guid 
 GROUP BY mt.mine_guid, mt.mine_tenure_type_code, active_ind, mt.permit_guid, gmt.now_applicatiON_guid