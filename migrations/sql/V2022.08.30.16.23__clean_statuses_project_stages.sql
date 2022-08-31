-- SUB (Submitted) in Project Summary the same as REC (Pending Review) in IRT
update information_requirements_table_status_code 
set information_requirements_table_status_code = 'SUB', description='Submitted'
where information_requirements_table_status_code = 'REC';

-- SUB (Submitted) in Project Summary the same as REC (Pending Review) in MMA
update major_mine_application_status_code 
set major_mine_application_status_code  = 'SUB', description = 'Submitted'
where major_mine_application_status_code = 'REC';

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

-- Draft in project description is the same as In Progress in IRT.
update information_requirements_table_status_code 
set information_requirements_table_status_code='DFT', description='Draft'
where information_requirements_table_status_code = 'PRG';

--Match description for Approved in MMA and IRT
update information_requirements_table_status_code 
set description = 'Approved'
where information_requirements_table_status_code= 'APV';

-- Under review with proponent not in used
delete 
from project_summary_status_code 
where project_summary_status_code = 'UNP';