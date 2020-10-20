-- 'E' records shoud be active (no history)

delete
from bond_history
where bond_id in
        (select core_bond_id
         from etl_bond
         where status = 'E');

-- 'E' records were set to 'REL' should be 'ACT'

update bond
set bond_status_code = 'ACT'
where bond_status_code = 'REL'
    and sec_cid in
        (select sec_cid
         from etl_bond
         where "status" = 'E')