

CREATE TABLE IF NOT EXISTS document_template (
  document_template_code varchar PRIMARY KEY,
  form_spec_json varchar NOT NULL,
  template_file_path varchar NOT NULL,
  active_ind boolean DEFAULT true NOT NULL,
  create_user varchar NOT NULL,
  create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
  update_user varchar NOT NULL,
  update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE document_template OWNER TO mds;
COMMENT ON TABLE document_template IS 'Holds template data for documents that CORE can generate';


ALTER TABLE now_application_document_type ADD COLUMN document_template_code varchar; 
ALTER TABLE now_application_document_type
    ADD CONSTRAINT now_application_document_type_template_code
    FOREIGN KEY (document_template_code) REFERENCES document_template(document_template_code) ON UPDATE CASCADE ON DELETE SET NULL;
