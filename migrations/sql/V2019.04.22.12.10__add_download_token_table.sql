CREATE TABLE download_token
(
    download_token_guid uuid PRIMARY KEY,
    document_guid uuid NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    redeemed_ind boolean DEFAULT false NOT NULL,

    FOREIGN KEY (document_guid) REFERENCES document_manager(document_guid),
);

ALTER TABLE download_token OWNER TO mds;

COMMENT ON TABLE download_token IS 'One-use tokens for downloading files without auth headers';