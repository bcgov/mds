CREATE TABLE IF NOT EXISTS address (
    address_id        integer                   PRIMARY KEY,
    party_guid        uuid                      NOT NULL   ,
    suite_no          varchar(5)                           ,
    address_line_1    varchar(50)                          ,
    address_line_2    varchar(50)                          ,
    city              varchar(50)                          ,
    sub_division_code varchar(2)                           ,
    post_code         varchar(6)                           ,
    address_type_code varchar(3)  DEFAULT 'CAN' NOT NULL
);

ALTER TABLE address OWNER TO mds;

CREATE SEQUENCE address_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE address_id_seq OWNER TO mds;
ALTER SEQUENCE address_id_seq OWNED BY address.address_id;
ALTER TABLE ONLY address ALTER COLUMN address_id SET DEFAULT nextval('address_id_seq'::regclass);


-- Constraints
ALTER TABLE ONLY address
    ADD CONSTRAINT address_sub_division_code_fkey FOREIGN KEY (sub_division_code) REFERENCES sub_division_code(sub_division_code);
ALTER TABLE ONLY address
    ADD CONSTRAINT address_type_code_fkey FOREIGN KEY (address_type_code) REFERENCES address_type_code(address_type_code);

CREATE TABLE IF NOT EXISTS party_address_xref (
    address_id integer NOT NULL,
    party_guid uuid    NOT NULL,

    FOREIGN KEY (address_id) REFERENCES address(address_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (party_guid) REFERENCES party(party_guid) DEFERRABLE INITIALLY DEFERRED,
    PRIMARY KEY(address_id, party_guid)
);

ALTER TABLE party_address_xref OWNER TO mds;
COMMENT ON TABLE party_address_xref IS 'Associates a party with an address, supporting many-to-many relationships.';


-- Add addresses and associate each with its party
INSERT INTO address (
    party_guid,
    suite_no,
    address_line_1,
    address_line_2,
    city,
    sub_division_code,
    post_code
)
SELECT
    party_guid,
    suite_no,
    address_line_1,
    address_line_2,
    city,
    sub_division_code,
    post_code
FROM party;

INSERT INTO party_address_xref (
    address_id,
    party_guid
)
SELECT
    address_id,
    party_guid
FROM address;

ALTER TABLE address DROP COLUMN party_guid;


-- Remove address columns from party table
ALTER TABLE party
DROP COLUMN suite_no,
DROP COLUMN address_line_1,
DROP COLUMN address_line_2,
DROP COLUMN city,
DROP COLUMN sub_division_code,
DROP COLUMN post_code,
DROP COLUMN address_type_code;
