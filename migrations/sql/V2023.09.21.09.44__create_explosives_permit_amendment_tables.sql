CREATE TABLE IF NOT EXISTS explosives_permit_amendment_magazine (
    explosives_permit_amendment_magazine_id serial PRIMARY KEY,
    explosives_permit_amendment_id integer NOT NULL,
    explosives_permit_amendment_magazine_type_code varchar(3) NOT NULL,

    type_no varchar NOT NULL,
    tag_no varchar NOT NULL,
    construction varchar,
    latitude numeric(9, 7), 
    longitude numeric(11, 7), 
    length numeric,
    width numeric,
    height numeric,
    quantity integer,
    distance_road numeric,
    distance_dwelling numeric,

    detonator_type varchar,

    deleted_ind boolean DEFAULT false NOT NULL,

    create_user varchar(60) NOT NULL,
    create_timestamp timestamptz DEFAULT now() NOT NULL,
    update_user varchar(60) NOT NULL,
    update_timestamp timestamptz DEFAULT now() NOT NULL,

    FOREIGN KEY (explosives_permit_amendment_id) REFERENCES explosives_permit_amendment(explosives_permit_amendment_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (explosives_permit_amendment_magazine_type_code) REFERENCES explosives_permit_magazine_type(explosives_permit_magazine_type_code) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE explosives_permit_amendment_magazine OWNER TO mds;

CREATE TABLE IF NOT EXISTS explosives_permit_amendment_document_xref (
    explosives_permit_amendment_document_xref_guid uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    mine_document_guid uuid UNIQUE NOT NULL,
    explosives_permit_amendment_id integer NOT NULL,
    explosives_permit_amendment_document_type_code varchar(3) NOT NULL,

    FOREIGN KEY (mine_document_guid) REFERENCES mine_document(mine_document_guid) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (explosives_permit_amendment_id) REFERENCES explosives_permit_amendment(explosives_permit_amendment_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (explosives_permit_amendment_document_type_code) REFERENCES explosives_permit_document_type(explosives_permit_document_type_code) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE explosives_permit_amendment_document_xref OWNER TO mds;
ALTER TABLE explosives_permit_amendment OWNER TO mds;