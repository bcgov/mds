--Update ALL Closed- Orphan - sub_reasons to Abandoned
update mine_status 
set mine_status_xref_guid = (select msx.mine_status_xref_guid 
							 from mine_status_xref msx 
							 where mine_operation_status_code = 'ABN' and 
							       mine_operation_status_reason_code is null and 
							       mine_operation_status_sub_reason_code is null)
where mine_status_xref_guid in (
      select mine_status_xref_guid 
	  from mine_status_xref msx 
	  where mine_operation_status_code='CLD' AND 
		    mine_operation_status_reason_code='ORP');
		    
--Delete status_code Closed & status_reason_code Orphan
--Keeping mine_operation_status_sub_reason_code due previously used by Closed - Orphand because other status_reason_codes are using them.
delete
from mine_status_xref 
where mine_operation_status_code = 'CLD' and
      mine_operation_status_reason_code = 'ORP';
	  
	  
delete
from mine_operation_status_reason_code 
where mine_operation_status_reason_code = 'ORP';