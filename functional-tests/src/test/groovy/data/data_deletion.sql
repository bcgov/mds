--delete all the data generated in functional test
BEGIN;
DELETE FROM mgr_appointment WHERE create_user = 'IDIR\VZHANG';
DELETE FROM person WHERE create_user = 'IDIR\VZHANG';
DELETE FROM mine_location WHERE create_user = 'IDIR\VZHANG';
DELETE FROM mineral_tenure_xref WHERE create_user = 'IDIR\VZHANG';
DELETE FROM mine_detail WHERE create_user = 'IDIR\VZHANG';
DELETE FROM mine_identity WHERE create_user = 'IDIR\VZHANG';
COMMIT;
