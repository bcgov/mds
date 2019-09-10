ALTER TABLE mine_report_definition 
ADD COLUMN IF NOT EXISTS required bool;

update mine_report_definition set required=true where mine_report_definition_id in (28, 47, 27, 31, 26, 32);