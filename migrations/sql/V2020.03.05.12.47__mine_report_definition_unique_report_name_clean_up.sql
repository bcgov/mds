--One time FIX from seed data bug inserting duplicate records. is fixed now.
DELETE FROM mine_report_definition where mine_report_definition_id > 61;