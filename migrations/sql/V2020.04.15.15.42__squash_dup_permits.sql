  
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
and m.mine_name = 'FOUR-J MINE'; -- or 'Lussier River'

--delete newly orphaned records
--none of these duplicate records have had their permittee's changed
delete from mine_party_appt where permit_guid in (select permit_guid from permit where permit_id not in (select permit_id from public.mine_permit_xref));
delete from permit_amendment where permit_id not in (select permit_id from mine_permit_xref);
DELETE FROM permit where permit_id not in (select permit_id from mine_permit_xref);
