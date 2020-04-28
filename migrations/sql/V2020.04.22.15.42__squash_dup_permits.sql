  
--PERMIT_NUMBERS That exist on multiple mines, the duplicates that need to squashed
drop table if exists duplicate_permits;
select permit_no, count(distinct p.mine_guid) mine_cnt
INTO duplicate_permits
from permit p 
    inner join permit_amendment pa on p.permit_id = pa.permit_id
    left join permit_amendment_document pad on pad.permit_amendment_id = pa.permit_amendment_id
group by permit_no
having count(distinct p.mine_guid) > 1
order by mine_cnt desc;

--PERMITS THAT HAVE MULTIPLE COPIES EXCLUDING numbers that have been changed by users
drop table if exists simple_duplicates_mine_permit;
SELECT p.mine_guid, p.permit_id, p.permit_no
INTO simple_duplicates_mine_permit
    from permit p
    where p.permit_no in 
        (select permit_no from duplicate_permits where permit_no not in ('M-162','M-183','Q-20','Q-36'));

       
--MOVE PERMIT RELATIONSHIP to first permit 
update mine_permit_xref mpx
set permit_id = (
    select sdmp.permit_id from simple_duplicates_mine_permit sdmp inner join permit_amendment pa on pa.permit_id = sdmp.permit_id where p.permit_no = sdmp.permit_no order by permit_id LIMIT 1)--make sure you pick a permit with amendments 
from permit p
where p.permit_id = mpx.permit_id
and p.permit_id in (select permit_id from simple_duplicates_mine_permit where permit_id is not null); 


--merge all permit_amendments to the used ones
update permit_amendment pa 
set permit_id = (select distinct mpx.permit_id from permit p2 inner join mine_permit_xref mpx on p2.permit_id = mpx.permit_id where p2.permit_no = p.permit_no)
from permit p
where pa.permit_id = p.permit_id

--orphan leftover permits that have no amendments
delete from mine_permit_xref mpx where mpx.permit_id not in (select permit_id from permit_amendment);


--documents have been uplodaded to these ones
update mine_permit_xref mpx
set permit_id = (select permit_id from permit p2
	inner join mine m on p2.mine_guid= m.mine_guid
	where p2.permit_no= 'M-183' and m.mine_name ='CANDORADO')
from permit p where p.permit_id = mpx.permit_id and 
p.permit_no  = 'M-183';


update mine_permit_xref mpx
set permit_id = (select permit_id from permit p2
	inner join mine m on p2.mine_guid= m.mine_guid
	where p2.permit_no= 'Q-20' and m.mine_name ='Windermere Mining Operation')
from permit p where p.permit_id = mpx.permit_id and 
p.permit_no  = 'Q-20';

-- documents have been uploaded to multiple, but are identical
update mine_permit_xref mpx
set permit_id = (select permit_id from permit p2
	inner join mine m on p2.mine_guid= m.mine_guid
	where p2.permit_no= 'Q-36' and m.mine_name ='Sidar/Crawford Bay')
from permit p where p.permit_id = mpx.permit_id and 
p.permit_no  = 'Q-36';

-- documents have been uploaded to multipl, this is was curated
update mine_permit_xref mpx
set permit_id = (select permit_id from permit p2
	inner join mine m on p2.mine_guid= m.mine_guid
	where p2.permit_no= 'M-162' and m.mine_name ='Lussier River')
from permit p where p.permit_id = mpx.permit_id and 
p.permit_no  = 'M-162';


--TRANSFER Permit GUID FK
ALTER TABLE public.mine_party_appt ADD COLUMN permit_id integer;
UPDATE public.mine_party_appt mpa
set permit_id = mpx.permit_id
from permit p
 	inner join mine_party_appt mpa2 on mpa2.permit_guid = p.permit_guid
 	inner join permit p2 on p.permit_no  = p2.permit_no
 	inner join mine_permit_xref mpx on mpx.permit_id = p2.permit_id
    inner join permit_amendment pa on pa.permit_id = p2.permit_id
where mpa.mine_party_appt_guid = mpa2.mine_party_appt_guid
and mpa.permit_guid = p.permit_guid
and mpx.permit_id is not null;


--update this view to use the new join
CREATE OR REPLACE VIEW public.mine_summary_view
AS SELECT m.mine_guid::character varying AS mine_guid,
    p.permit_guid::character varying AS permit_guid,
    m.mine_name,
    m.mine_no AS mine_number,
    m.latitude::character varying AS mine_latitude,
    m.longitude::character varying AS mine_longitude,
    concat(mos.description, ',', mosr.description, ',', mossr.description) AS operation_status,
    concat(mos.mine_operation_status_code, ',', mosr.mine_operation_status_reason_code, ',', mossr.mine_operation_status_sub_reason_code) AS operation_status_code,
    mos.mine_operation_status_code,
    mosr.mine_operation_status_reason_code,
    mossr.mine_operation_status_sub_reason_code,
    mos.description AS mine_operation_status_d,
    mosr.description AS mine_operation_status_reason_d,
    mossr.description AS mine_operation_status_sub_reason_d,
    ms.effective_date::character varying AS status_date,
    array_to_string(array_agg(DISTINCT mttc.description), ','::text) AS tenure,
    array_to_string(array_agg(DISTINCT mttc.mine_tenure_type_code), ','::text) AS tenure_type_code,
    array_to_string(array_agg(DISTINCT mcc.description), ','::text) AS commodity,
    array_to_string(array_agg(DISTINCT mcc.mine_commodity_code), ','::text) AS commodity_type_code,
    array_to_string(array_agg(DISTINCT mdc.description), ','::text) AS disturbance,
    array_to_string(array_agg(DISTINCT mdc.mine_disturbance_code), ','::text) AS disturbance_type_code,
    m.major_mine_ind::character varying AS major_mine_ind,
    m.mine_region,
    p.permit_no,
    pt.first_name AS permittee_first_name,
    pt.party_name AS permittee_name,
    '' AS bcmi_url,
        CASE
            WHEN m.major_mine_ind IS TRUE THEN 'Major Mine'::text
            ELSE 'Regional Mine'::text
        END AS major_mine_d
   FROM mine m
   	 left join mine_permit_xref mpx on m.mine_guid = mpx.mine_guid 
     LEFT JOIN permit p ON mpx.permit_id = p.permit_id
     LEFT JOIN mine_party_appt mpa ON mpx.permit_id = mpa.permit_id AND mpa.end_date IS NULL
     LEFT JOIN party pt ON mpa.party_guid = pt.party_guid
     LEFT JOIN ( SELECT DISTINCT ON (mine_status.mine_guid) mine_status.mine_guid,
            mine_status.mine_status_xref_guid,
            mine_status.effective_date
           FROM mine_status
          ORDER BY mine_status.mine_guid, mine_status.effective_date DESC) ms ON m.mine_guid = ms.mine_guid
     LEFT JOIN mine_status_xref msx ON ms.mine_status_xref_guid = msx.mine_status_xref_guid
     LEFT JOIN mine_operation_status_code mos ON msx.mine_operation_status_code::text = mos.mine_operation_status_code::text
     LEFT JOIN mine_operation_status_reason_code mosr ON msx.mine_operation_status_reason_code::text = mosr.mine_operation_status_reason_code::text
     LEFT JOIN mine_operation_status_sub_reason_code mossr ON msx.mine_operation_status_sub_reason_code::text = mossr.mine_operation_status_sub_reason_code::text
     LEFT JOIN mine_type mt ON m.mine_guid = mt.mine_guid AND mt.active_ind = true
     LEFT JOIN mine_tenure_type_code mttc ON mt.mine_tenure_type_code::text = mttc.mine_tenure_type_code::text
     LEFT JOIN mine_type_detail_xref mtdx ON mt.mine_type_guid = mtdx.mine_type_guid AND mtdx.active_ind = true
     LEFT JOIN mine_disturbance_code mdc ON mtdx.mine_disturbance_code::text = mdc.mine_disturbance_code::text
     LEFT JOIN mine_commodity_code mcc ON mtdx.mine_commodity_code::text = mcc.mine_commodity_code::text
  WHERE m.deleted_ind = false
  GROUP BY p.permit_no, p.permit_guid, m.mine_guid, m.mine_name, m.mine_no, m.deleted_ind, mos.description, mosr.description, mossr.description, mos.mine_operation_status_code, mosr.mine_operation_status_reason_code, mossr.mine_operation_status_sub_reason_code, ms.effective_date, pt.first_name, pt.party_name;
