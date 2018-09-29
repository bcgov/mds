WITH
permit_list AS (
    SELECT
        mine_no||permit_no||recv_dt||appr_dt as combo_id,
        max(cid) permit_cid
    FROM mms.mmspmt permit_info 
    WHERE 
        (sta_cd ~* 'z' 
        OR 
        sta_cd ~* 'a')
        AND 
        (permit_no is not null)
    GROUP BY combo_id 
),
permit_info AS (
    SELECT 
        permit_info.mine_no,
        permit_info.permit_no,
        permit_info.cid AS permit_cid,
        permit_info.recv_dt,
        permit_info.appr_dt,
        permit_info.permit_expiry_dt,
        permit_info.sta_cd
    FROM mms.mmspmt permit_info 
    WHERE EXISTS(
        SELECT 1 
        FROM permit_list 
        WHERE permit_list.permit_cid=permit_info.cid)
    ORDER BY mine_no
)

