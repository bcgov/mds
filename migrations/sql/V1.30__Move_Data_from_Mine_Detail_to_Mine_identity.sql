UPDATE mine_identity
SET mine_no = mine_detail.mine_no,
    mine_name = mine_detail.mine_name,
    mine_note = mine_detail.mine_note,
    major_mine_ind = mine_detail.major_mine_ind,
    mine_region = mine_detail.mine_region
FROM mine_detail 
WHERE mine_detail.mine_guid = mine_identity.mine_guid 
AND mine_detail.expiry_date > NOW();
    