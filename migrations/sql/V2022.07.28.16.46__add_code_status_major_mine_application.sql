ALTER TABLE major_mine_application_status_code
ADD display_order  smallint;

insert into major_mine_application_status_code(major_mine_application_status_code, description, display_order, create_user, update_user)
   values
   ('DFT','Draft', 40, 'system-mds','system-mds');

update major_mine_application_status_code
set display_order= 10
where major_mine_application_status_code = 'REC';

update major_mine_application_status_code
set display_order= 20
where major_mine_application_status_code = 'UNR';

update major_mine_application_status_code
set display_order= 30
where major_mine_application_status_code = 'APV';

ALTER TABLE major_mine_application_status_code ALTER COLUMN display_order set NOT NULL;
