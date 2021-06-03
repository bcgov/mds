CREATE OR REPLACE FUNCTION make_into_serial(db_schema_name TEXT, db_table_name TEXT, column_name TEXT) RETURNS INTEGER AS $$
DECLARE
    start_with INTEGER;
    sequence_name TEXT;
    table_name TEXT;
BEGIN
    sequence_name := db_schema_name || '.' || db_table_name || '_' || column_name || '_seq';
    table_name := db_schema_name || '.' || db_table_name;
    EXECUTE 'SELECT coalesce(max(' || column_name || '), 0) + 1 FROM ' || table_name
            INTO start_with;
    EXECUTE 'CREATE SEQUENCE ' || sequence_name ||
            ' START WITH ' || start_with ||
            ' OWNED BY ' || table_name || '.' || column_name;
    EXECUTE 'ALTER TABLE ' || table_name || ' ALTER COLUMN ' || column_name ||
            ' SET DEFAULT nextVal(''' || sequence_name || ''')';
    RETURN start_with;
END;
$$ LANGUAGE plpgsql VOLATILE;

SELECT make_into_serial('now_submissions','equipment', 'equipmentid');