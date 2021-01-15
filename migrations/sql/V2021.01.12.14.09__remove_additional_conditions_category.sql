DELETE from permit_conditions where condition_category_code = 'ADC';
DELETE FROM mine_report_submission WHERE mine_report_id IN (SELECT mine_report_id FROM mine_report where permit_condition_category_code = 'ADC');
DELETE from mine_report where permit_condition_category_code = 'ADC';
DELETE from permit_condition_category where condition_category_code = 'ADC';
