CREATE OR REPLACE FUNCTION make_into_serial(db_schema_name TEXT, table_name TEXT, column_name TEXT) RETURNS INTEGER AS $$
DECLARE
    start_with INTEGER;
    sequence_name TEXT;
BEGIN
    sequence_name := table_name || '_' || column_name || '_seq';

    EXECUTE 'SELECT coalesce(max(' || column_name || '), 0) + 1 FROM ' || db_schema_name || '.' || table_name
            INTO start_with;
    EXECUTE 'CREATE SEQUENCE ' || sequence_name ||
            ' START WITH ' || start_with ||
            'INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1';
           
    EXECUTE 'ALTER TABLE ' || sequence_name || ' OWNER TO mds';
   
    EXECUTE 'ALTER SEQUENCE ' || sequence_name || ' SET SCHEMA ' || db_schema_name;
    
    EXECUTE 'ALTER SEQUENCE ' || db_schema_name || '.' || sequence_name || ' OWNED BY ' || db_schema_name || '.' || table_name || '.' || column_name;
    
    EXECUTE 'ALTER TABLE ' || db_schema_name || '.' || table_name || ' ALTER COLUMN ' || column_name ||
            ' SET DEFAULT nextVal(''' || db_schema_name || '.' || sequence_name || ''')';
    RETURN start_with;
END;
$$ LANGUAGE plpgsql VOLATILE;

SELECT make_into_serial('now_submissions','equipment', 'equipmentid');