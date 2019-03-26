CREATE TABLE IF NOT EXISTS variance
(
    variance_id           integer                  PRIMARY KEY                           ,
    compliance_article_id integer                                                NOT NULL,
    mine_guid             uuid                                                   NOT NULL,
    note                  character varying(300)   DEFAULT ''::character varying NOT NULL,
    issue_date            date                     DEFAULT '9999-12-31'::date    NOT NULL,
    received_date         date                     DEFAULT '9999-12-31'::date    NOT NULL,
    expiry_date           date                     DEFAULT '9999-12-31'::date    NOT NULL,
    create_user           character varying(60)                                  NOT NULL,
    create_timestamp      timestamp with time zone DEFAULT now()                 NOT NULL,
    update_user           character varying(60)                                  NOT NULL,
    update_timestamp      timestamp with time zone DEFAULT now()                 NOT NULL
);

CREATE SEQUENCE variance_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE variance_id_seq OWNER TO mds;
ALTER SEQUENCE variance_id_seq OWNED BY variance.variance_id;
ALTER TABLE ONLY variance ALTER COLUMN variance_id SET DEFAULT nextval('variance_id_seq'::regclass);


-- Constraints
ALTER TABLE ONLY variance
    ADD CONSTRAINT variance_compliance_article_id_fkey FOREIGN KEY (compliance_article_id) REFERENCES compliance_article(compliance_article_id);
ALTER TABLE ONLY variance
    ADD CONSTRAINT variance_mine_guid_fkey FOREIGN KEY (mine_guid) REFERENCES mine(mine_guid);


-- Comments
COMMENT ON TABLE variance IS 'A request to be exempt from the rules of an HSRC code.';
COMMENT ON COLUMN variance.expiry_date IS 'Expiry Date reflects the legal date a variance is no longer valid. 9999-12-31 implies the variance is still valid.';
