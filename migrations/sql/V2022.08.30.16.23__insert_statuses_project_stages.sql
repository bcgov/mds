insert into information_requirements_table_status_code(information_requirements_table_status_code, description, create_user, update_user)
   values
   ('DFT','Draft', 'system-mds','system-mds'),
   ('SUB','Submitted', 'system-mds','system-mds');

--status_code='REC' is replaced by new status_code='DFT' to match project_description status_codes
insert into major_mine_application_status_code (major_mine_application_status_code, description, active_ind, create_user, update_user, display_order)
values ('SUB', 'Submitted', true, 'system-mds', 'system-mds', 60);


-- Match description used in three stages
update project_summary_status_code 
set description = 'Under review'
where project_summary_status_code = 'UNR';

-- Match description used in three stages
update information_requirements_table_status_code 
set description = 'Under review'
where information_requirements_table_status_code = 'UNR';

-- Match description used in three stages
update major_mine_application_status_code 
set description = 'Under review'
where major_mine_application_status_code = 'UNR';

--Match description for Approved in MMA and IRT
update information_requirements_table_status_code 
set description = 'Approved'
where information_requirements_table_status_code= 'APV';


--Update data with old status_codes
update information_requirements_table
set status_code= 'SUB'
where status_code='REC';

update information_requirements_table
set status_code = 'DFT'
where status_code= 'PRG';

update major_mine_application
set status_code='SUB'
where status_code='REC';
