--create test mine record 
WITH test_id AS (
    INSERT INTO mine_identity(
        mine_guid,create_user,create_timestamp,update_user,update_timestamp)
    VALUES ('9C1B63B6-CCFB-48B0-BE85-3CB3C5D1A276','idir\vzhang',now(),'idir\vzhang',now()+interval '23 days')
    RETURNING mine_guid
)
INSERT INTO mine_detail(
    mine_detail_guid,mine_guid,mine_no,mine_name,effective_date,expiry_date,create_user,create_timestamp,update_user,update_timestamp)
VALUES (DEFAULT,(SELECT mine_guid FROM test_id),'BLAH0000','MINETEST',now(),'9999-09-09','idir\vzhang',now(),'idir\vzhang',now()+interval '23 days');


INSERT INTO mine_location(mine_location_guid,mine_guid,latitude,longitude,effective_date,expiry_date,create_user,create_timestamp,update_user,update_timestamp)
VALUES (DEFAULT,'9C1B63B6-CCFB-48B0-BE85-3CB3C5D1A276','48','-125',now(),'9999-09-09','idir\vzhang',now(),'idir\vzhang',now()+interval '23 days');

