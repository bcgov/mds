delete from standard_permit_conditions;

UPDATE permit_condition_category set active_ind = false where condition_category_code = 'ADC';