-- This file was generated by the generate_history_table_ddl command
-- The file contains the data migration to backfill history records for the {table} table
with transaction AS (insert into transaction(id) values(DEFAULT) RETURNING id)
insert into permit_conditions_version (transaction_id, operation_type, end_transaction_id, "create_user", "create_timestamp", "update_user", "update_timestamp", "deleted_ind", "permit_condition_id", "permit_amendment_id", "permit_condition_guid", "condition", "condition_category_code", "condition_type_code", "parent_permit_condition_id", "display_order")
select t.id, '0', null, "create_user", "create_timestamp", "update_user", "update_timestamp", "deleted_ind", "permit_condition_id", "permit_amendment_id", "permit_condition_guid", "condition", "condition_category_code", "condition_type_code", "parent_permit_condition_id", "display_order"
from permit_conditions,transaction t;
