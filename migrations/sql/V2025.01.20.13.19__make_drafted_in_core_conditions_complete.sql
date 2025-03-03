UPDATE permit_conditions 
	SET permit_condition_status_code = 'COM'
WHERE permit_amendment_id IN
(SELECT permit_amendment_id FROM permit_amendment 
    WHERE is_generated_in_core = TRUE
    AND permit_amendment_status_code != 'DFT'
);