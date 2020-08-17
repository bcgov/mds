ALTER TABLE permit_condition_category ADD COLUMN step varchar;

UPDATE permit_condition_category SET step='A.' WHERE condition_category_code = 'GEC';
UPDATE permit_condition_category SET step='B.' WHERE condition_category_code = 'HSC';
UPDATE permit_condition_category SET step='C.' WHERE condition_category_code = 'GOC';
UPDATE permit_condition_category SET step='D.' WHERE condition_category_code = 'ELC';
UPDATE permit_condition_category SET step='E.' WHERE condition_category_code = 'RCC';
UPDATE permit_condition_category SET step='F.' WHERE condition_category_code = 'ADC';