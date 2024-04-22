ALTER TABLE
    mine_report_definition_compliance_article_xref
ADD
    COLUMN IF NOT EXISTS create_user character varying(60),
ADD
    COLUMN IF NOT EXISTS update_user character varying(60),
ADD
    COLUMN IF NOT EXISTS create_timestamp timestamp with time zone DEFAULT now(),
ADD
    COLUMN IF NOT EXISTS update_timestamp timestamp with time zone DEFAULT now();