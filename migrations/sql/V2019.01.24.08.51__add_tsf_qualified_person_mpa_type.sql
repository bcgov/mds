
INSERT INTO mine_party_appt_type_code (
    mine_party_appt_type_code,
    description,
    display_order,
    create_user,
    update_user,
    person,
    organization,
    grouping_level
    )
VALUES
    ('TQP', 'TSF Qualified Person', 110, 'system-mds', 'system-mds', 'true', 'false', 2);

UPDATE mine_party_appt_type_code SET person = 'true' WHERE mine_party_appt_type_code = 'EOR';

UPDATE mine_party_appt_type_code SET display_order = 100 WHERE mine_party_appt_type_code = 'EOR';
UPDATE mine_party_appt_type_code SET display_order = 120 WHERE mine_party_appt_type_code = 'EVS';
UPDATE mine_party_appt_type_code SET display_order = 130 WHERE mine_party_appt_type_code = 'EMM';
UPDATE mine_party_appt_type_code SET display_order = 200 WHERE mine_party_appt_type_code = 'SVR';
UPDATE mine_party_appt_type_code SET display_order = 210 WHERE mine_party_appt_type_code = 'SHB';
UPDATE mine_party_appt_type_code SET display_order = 220 WHERE mine_party_appt_type_code = 'FRB';
UPDATE mine_party_appt_type_code SET display_order = 230 WHERE mine_party_appt_type_code = 'BLA';
UPDATE mine_party_appt_type_code SET display_order = 240 WHERE mine_party_appt_type_code = 'MRC';
--type codes now chunked into 110's for easier inserts in the future