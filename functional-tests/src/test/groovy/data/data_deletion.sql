--delete all the data generated in functional test
BEGIN;
DELETE FROM mgr_appointment WHERE create_user = 'idir\vzhang';
DELETE FROM permit WHERE create_user = 'idir\vzhang';
DELETE FROM permittee WHERE create_user = 'idir\vzhang';
DELETE FROM party WHERE create_user = 'idir\vzhang';
DELETE FROM mine_location WHERE create_user = 'idir\vzhang';
DELETE FROM mine_status_xref WHERE create_user = 'idir\vzhang';
DELETE FROM mineral_tenure_xref WHERE create_user = 'idir\vzhang';
DELETE FROM mine_status WHERE create_user = 'idir\vzhang';
DELETE FROM mine_detail WHERE create_user = 'idir\vzhang';
DELETE FROM mine_identity WHERE create_user = 'idir\vzhang';
COMMIT;

 