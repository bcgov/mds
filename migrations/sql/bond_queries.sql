drop table if exists etl_valid_permits;


CREATE
TEMPORARY TABLE etl_valid_permits AS
SELECT mine_no||permit_no||recv_dt||COALESCE(iss_dt::varchar,
                                             ' null_issue_dt') AS combo_id,
       max(cid) permit_cid,
          sta_cd
FROM mms.mmspmt mmspmt
WHERE (sta_cd ~* 'z'
       OR sta_cd ~* 'a')
    AND ((permit_no !~ '^ *$'
          AND mmspmt.permit_no IS NOT NULL))
GROUP BY combo_id,
         sta_cd;


select *
from mms.mmspmt
order by recv_dt desc
limit 5;


select cid,
       mine_no,
       recv_dt,
       iss_dt,
       permit_no,
       sta_cd --permit_no, count(*)
from mms.mmspmt p
where permit_no not in
        (select permit_no
         from permit)
    and bond_confiscated_ind = 'Y'
    and not exists
        (select *
         from mms.mmsmin
         where mine_no = p.mine_no
             and min_lnk = 'Y'
             AND min_lnk IS NOT NULL
         limit 1)--group by permit_no;
order by recv_dt desc;

-- drop table if exists etl_valid_permits;
-- CREATE TEMPORARY TABLE etl_valid_permits AS
-- 	SELECT
-- 	    mine_no||permit_no||recv_dt||iss_dt AS combo_id,
-- 	    max(cid) permit_cid,
-- 	    sta_cd
-- 	FROM mms.mmspmt mmspmt
-- 	WHERE
-- 	    (sta_cd ~* 'z'  OR sta_cd ~* 'a' or sta_cd ~* 'r' or sta_cd ~* 'c')
-- 	    AND
-- 	    ((permit_no !~ '^ *$' AND mmspmt.permit_no IS NOT NULL))
-- 	GROUP BY combo_id, sta_cd;

select *
from etl_valid_permits
where sta_cd ~*'r';


select mine_no,
       permit_no,
       recv_dt,
       iss_dt
from mms.mmspmt
where sta_cd ~*'r'
    and permit_no !~ '^ *$';


select 1=null;
