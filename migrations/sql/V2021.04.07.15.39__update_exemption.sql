with query as (
select 
	p2.permit_guid
	, case 
		when (mt.mine_tenure_type_code = 'PLR' and substring(TRIM(both from p2.permit_no), 1, 1)='P' and substring(p2.permit_no, 2, 1)<>'X') or p2.permit_status_code = 'C' then 'Y'
		when (p2.is_exploration or substring(TRIM(both from p2.permit_no), 2, 1)='X') and (select count(*) from mine_type_detail_xref as mtdx where mtdx.mine_type_guid = mt.mine_type_guid and mtdx.mine_disturbance_code <> 'SUR') = 0 then 'Y'
		when (p2.is_exploration or substring(TRIM(both from p2.permit_no), 2, 1)='X') and ((select count(*) from mine_type_detail_xref as mtdx where mtdx.mine_type_guid = mt.mine_type_guid and mtdx.mine_disturbance_code <> 'SUR') > 0 
									or (select count(*) from mine_type_detail_xref as mtdx where mtdx.mine_type_guid = mt.mine_type_guid)=0 ) then 'MIM'
		when substring(TRIM(both from p2.permit_no), 1, 1) in ('M', 'C') and substring(TRIM(both from p2.permit_no), 2, 1)<>'X' and mt.mine_tenure_type_code in ('MIN', 'COL') then 'MIM'
		when substring(TRIM(both from p2.permit_no), 1, 1) in ('Q', 'G') and substring(TRIM(both from p2.permit_no), 2, 1)<>'X' and mt.mine_tenure_type_code in ('BCL', 'MIN', 'PRL') then 'MIP'
		else 'NaN'
	end "exemption_status"
	, p2.permit_status_code
	, mt.mine_tenure_type_code
	, p2.is_exploration 
from permit p2 
join mine_type mt on mt.permit_guid = p2.permit_guid 
where p2.permit_status_code <> 'D'
)
update permit
set exemption_fee_status_code=query.exemption_status
from query
WHERE permit.permit_guid = query.permit_guid and query.exemption_status <> 'NaN';


update permit
set exemption_fee_status_code = 'Y'
where permit.permit_status_code in ('C', 'D');