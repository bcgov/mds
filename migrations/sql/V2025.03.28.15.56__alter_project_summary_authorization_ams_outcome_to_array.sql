ALTER TABLE project_summary_authorization
  ALTER COLUMN ams_outcome SET DATA TYPE TEXT[] 
  USING CASE
    WHEN ams_outcome IS NULL THEN NULL
    ELSE string_to_array(ams_outcome, '')
  END;