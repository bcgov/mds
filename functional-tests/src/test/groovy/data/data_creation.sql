--create a mine record 

WITH a AS (
    INSERT INTO mine_identity(mine_guid,create_user,create_timestamp,update_user,update_timestamp)
    VALUES ('9C1B63B6-CCFB-48B0-BE85-3CB3C5D1A276','IDIR\VZHANG',now(),'IDIR\VZHANG',now()+interval '23 days')
    RETURNING mine_guid
)
INSERT INTO mine_detail(mine_detail_guid,mine_guid,mine_no,mine_name,effective_date,expiry_date,create_user,create_timestamp,update_user,update_timestamp)
VALUES (DEFAULT,(SELECT mine_guid FROM a),'BLAH0000','MINETEST',now(),'9999-09-09','IDIR\VZHANG',now(),'IDIR\VZHANG',now()+interval '23 days');
WITH b AS(
    SELECT mine_guid FROM mine_identity WHERE mine_guid = '9C1B63B6-CCFB-48B0-BE85-3CB3C5D1A276'
)
INSERT INTO mine_location(mine_location_guid,mine_guid,latitude,longitude,effective_date,expiry_date,create_user,create_timestamp,update_user,update_timestamp)
VALUES (DEFAULT,(SELECT mine_guid FROM b),'48','-125',now(),'9999-09-09','IDIR\VZHANG',now(),'IDIR\VZHANG',now()+interval '23 days');

