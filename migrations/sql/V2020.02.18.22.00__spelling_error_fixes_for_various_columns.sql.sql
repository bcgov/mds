-- Fixes spelling errors: 'Access Roads, trails, Help Pads, Air Strips, Boat Ramps'
UPDATE activity_type
SET description = 'Access Roads, Trails, Helipads, Airstrips, Boat Ramps'
WHERE activity_type_code = 'exploration_access';

-- Fixes unit formatting: 'Tonne (Metric Ton 1000Kg)'
UPDATE unit_type
SET description = 'Tonne (Metric Ton 1,000 kg)'
WHERE unit_type_code = 'MTN';

-- Fixes spelling error and removes punctuation: 'Reports due on fiscal year end.'
UPDATE required_document_due_date_type
SET req_document_due_date_description = 'Reports due on fiscal year-end'
WHERE req_document_due_date_type = 'FIS';

-- Fixes spelling errors: 'Reports due on an aniversary of operation, permit, etc...'
UPDATE required_document_due_date_type
SET req_document_due_date_description = 'Reports due on an anniversary of an operation, permit, etc.'
WHERE req_document_due_date_type = 'ANV';

-- Fixes spelling error: 'Multi-Year, Area Based Permit'
UPDATE now_application_permit_type
SET description = 'Multi-Year, Area-Based Permit'
WHERE now_application_permit_type_code = 'MY-ABP';

-- Fixes spelling error: 'One Year Permit'
UPDATE now_application_permit_type
SET description = 'One-Year Permit'
WHERE now_application_permit_type_code = 'OYP';

-- Fixes spelling error and inconsistent punctuation: 'Reports due on fiscal year end.'
UPDATE mine_report_due_date_type
SET description = 'Reports due on fiscal year-end'
WHERE mine_report_due_date_type = 'FIS';

-- Fixes spelling errors: 'Reports due on an aniversary of operation, permit, etc...'
UPDATE mine_report_due_date_type
SET description = 'Reports due on an anniversary of an operation, permit, etc.'
WHERE mine_report_due_date_type = 'ANV';

-- Fixes inconsistent capitalization: 'Reports that are available on Request'
UPDATE mine_report_due_date_type
SET description = 'Reports that are available on request'
WHERE mine_report_due_date_type = 'AVA';

-- Fixes inconsistent capitalization: 'Reports that are indicated via Permit Requirements'
UPDATE mine_report_due_date_type
SET description = 'Reports that are indicated via permit requirements'
WHERE mine_report_due_date_type = 'PMT';

-- Fixes spelling error: 'Reports that are related to an event that occured'
UPDATE mine_report_due_date_type
SET description = 'Reports that are related to an event that occurred'
WHERE mine_report_due_date_type = 'EVT';

-- Fixes spelling error: 'GeoScience and Environmental'
UPDATE mine_report_category
SET description = 'Geoscience and Environmental'
WHERE mine_report_category = 'GSE';

-- Fixes spelling error: 'Tailings Storage Factility'
UPDATE mine_report_category
SET description = 'Tailings Storage Facility'
WHERE mine_report_category = 'TSF';

-- Fixes spelling error: 'Long Term Maintenance'
UPDATE mine_operation_status_sub_reason_code
SET description = 'Long-Term Maintenance'
WHERE mine_operation_status_sub_reason_code = 'LTM';

-- Fixes spelling error: 'Long Term Maintenance & Water Treatment'
UPDATE mine_operation_status_sub_reason_code
SET description = 'Long-Term Maintenance & Water Treatment'
WHERE mine_operation_status_sub_reason_code = 'LWT';

-- Fixes spelling error: 'Year round'
UPDATE mine_operation_status_reason_code
SET description = 'Year-Round'
WHERE mine_operation_status_reason_code = 'YR';