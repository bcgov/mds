COMMENT ON TABLE mine_required_document_category IS 'Business context that the required document is used in, type code is also used by document manager for folder name';

CREATE TABLE required_document_sub_category(
    req_document_sub_category_code character varying(3) PRIMARY KEY, 
    description character varying(200)
);
ALTER TABLE required_document_sub_category OWNER TO mds;
COMMENT ON TABLE required_document_sub_category IS 'This code can be used when additional behaviour is needed for required reports. e.g. sub category `INI` would be used to flag default documents for mines with TSFs';

INSERT INTO required_document_sub_category
(
    req_document_sub_category_code,
    description
)
VALUES
('INI', 'Used to identify documents that appear in the inital case')
ON CONFLICT DO NOTHING;

ALTER TABLE mds_required_document ADD COLUMN IF NOT EXISTS req_document_sub_category_code character varying(3);
ALTER TABLE mds_required_document ADD COLUMN hsrc_code character varying(15);
ALTER TABLE mds_required_document ADD CONSTRAINT required_document_sub_category_fkey FOREIGN KEY (req_document_sub_category_code) REFERENCES required_document_sub_category(req_document_sub_category_code) DEFERRABLE INITIALLY DEFERRED;

UPDATE mds_required_document SET req_document_sub_category_code = 'INI' where req_document_name in (
    'Annual TSF and Dam safety recommendations',
    'ITRB Activities (Annual)', 
    'Register of tailings storage facilities and dams',
    'Annual DSI',
    '5 year DSR',
    'As Built Reports');

UPDATE mds_required_document set req_document_description = null where req_document_name = 'OTHER_TEST_REPORT';
UPDATE mds_required_document set hsrc_code = req_document_description;
UPDATE mds_required_document set req_document_description = null;

ALTER TABLE mine_expected_document ADD COLUMN hsrc_code character varying(15);

ALTER TABLE mds_required_document RENAME COLUMN req_document_description TO description;
