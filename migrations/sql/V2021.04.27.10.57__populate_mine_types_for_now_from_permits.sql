with now_to_permit_linkage as (
	select nai.now_application_guid, p.permit_guid 
	from now_application_identity nai 
	left join permit_amendment pa on pa.now_application_guid = nai.now_application_guid 
	left join permit p on p.permit_id = pa.permit_id 
	group by nai.now_application_guid,  p.permit_guid)

, grouped_mine_types_to_insert as (	
		select ntpl.now_application_guid, ntpl.permit_guid as nt_permit_guid, mt.permit_guid, mt.mine_guid, 
		row_number() over (partition by mt.permit_guid, mt.mine_guid, ntpl.now_application_guid order by update_timestamp desc) as rn
		from now_to_permit_linkage ntpl
		left join mine_type mt on mt.permit_guid = ntpl.permit_guid and active_ind = true
		group by ntpl.now_application_guid, ntpl.permit_guid,  mt.permit_guid, mt.mine_guid, update_timestamp)

insert into mine_type(mine_guid, mine_tenure_type_code, create_user, update_user, active_ind, permit_guid, now_application_guid)
 select mt.mine_guid, mt.mine_tenure_type_code, 'system-mds', 'system-mds', active_ind, null as permit_guid, gmt.now_application_guid 
 from grouped_mine_types_to_insert gmt
 join mine_type mt on mt.permit_guid = gmt.nt_permit_guid and mt.mine_guid = mt.mine_guid 
 group by mt.mine_guid, mt.mine_tenure_type_code, active_ind, mt.permit_guid, gmt.now_application_guid