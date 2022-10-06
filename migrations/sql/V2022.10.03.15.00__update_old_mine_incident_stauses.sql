update mine_incident
set status_code = 'IRS'
where status_code = 'PRE';

update mine_incident
set status_code = 'CLD'
where status_code = 'FIN';


delete
from mine_incident_status_code 
where mine_incident_status_code = 'PRE';

delete
from mine_incident_status_code 
where mine_incident_status_code = 'FIN';