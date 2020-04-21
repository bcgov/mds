  
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
set permit_id = (select permit_id from simple_duplicates_mine_permit sdmp where p.permit_no = sdmp.permit_no order by permit_id LIMIT 1)
from permit p
inner join simple_duplicates_mine_permit sdmp on p.permit_id = sdmp.permit_id
where p.permit_id = mpx.permit_id; 


--documents have been uplodaded to these ones
update mine_permit_xref mpx 
set permit_id = p.permit_id
from permit p 
inner join mine m on p.mine_guid = m.mine_guid
where p.permit_id = mpx.permit_id
and p.permit_no = 'M-183'
and m.mine_name = 'CANDORADO';

update mine_permit_xref mpx 
set permit_id = p.permit_id
from permit p 
inner join mine m on p.mine_guid = m.mine_guid
where p.permit_id = mpx.permit_id
and p.permit_no = 'Q-20'
and m.mine_name = 'Windermere Mining Operation';

-- documents have been uploaded to multiple, but are identical
update mine_permit_xref mpx 
set permit_id = p.permit_id
from permit p 
inner join mine m on p.mine_guid = m.mine_guid
where p.permit_id = mpx.permit_id
and p.permit_no = 'Q-36'
and m.mine_name = 'Sidar/Crawford Bay';

-- documents have been uploaded to multipl, this is was curated
update mine_permit_xref mpx 
set permit_id = p.permit_id
from permit p 
inner join mine m on p.mine_guid = m.mine_guid
where p.permit_id = mpx.permit_id
and p.permit_no = 'M-162'
and m.mine_name = 'Lussier River'; -- instead of 'FOUR-J MINE'



--TRANSFER Permit GUID FK
ALTER TABLE public.mine_party_appt ADD COLUMN permit_id integer;
UPDATE public.mine_party_appt mpa
set permit_id = p.permit_id
from permit p 
where mpa.permit_guid = p.permit_guid;
ALTER TABLE public.mine_party_appt ADD CONSTRAINT mine_party_appt_permit_party_xref_fk FOREIGN KEY (permit_id, mine_guid) REFERENCES mine_permit_xref(permit_id, mine_guid);



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

-- Permissions
ALTER TABLE public.mine_summary_view OWNER TO mds;


--clean up 
ALTER TABLE public.mine_party_appt DROP CONSTRAINT mine_party_appt_permit_party_fk; 
ALTER TABLE public.mine_party_appt DROP COLUMN permit_guid;
--delete newly orphaned records
--none of these duplicate records have had their permittee's changed
ALTER TABLE permit DROP CONSTRAINT if exists permit_mine_guid_fkey;
delete from mine_party_appt where permit_id not in (select permit_id from public.mine_permit_xref);
delete from permit_amendment where permit_id not in (select permit_id from mine_permit_xref);
DELETE FROM permit where permit_id not in (select permit_id from mine_permit_xref);

ALTER TABLE permit DROP COLUMN mine_guid