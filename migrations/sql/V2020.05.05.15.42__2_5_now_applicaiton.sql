---2--reassign now_application_identity parent to common permit record (one for each number)

UPDATE now_application_identity nai
set permit_id =
    (select p2.permit_id
     from permit p2
     where p2.permit_no = p.permit_no
     order by p2.permit_id
     limit 1)
from permit p
where p.permit_id = nai.permit_id;