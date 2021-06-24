CREATE TABLE IF NOT EXISTS explosives_permit_status (
    explosives_permit_status_code varchar(3) PRIMARY KEY,
    description varchar NOT NULL,

    active_ind boolean DEFAULT true NOT NULL,
    display_order integer NOT NULL,

    create_user varchar(60) NOT NULL,
    create_timestamp timestamptz DEFAULT now() NOT NULL,
    update_user varchar(60) NOT NULL,
    update_timestamp timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE explosives_permit_status OWNER TO mds;

CREATE TABLE IF NOT EXISTS explosives_permit (
    explosives_permit_id serial PRIMARY KEY,
    explosives_permit_guid uuid UNIQUE DEFAULT gen_random_uuid() NOT NULL,
    mine_guid uuid NOT NULL,
    permit_guid uuid NOT NULL,
    now_application_guid uuid,
    mine_operator_party_guid uuid,
    issuing_inspector_party_guid uuid,
    application_status varchar NOT NULL,

    permit_number varchar UNIQUE,
    issue_date date,
    expiry_date date,

    application_number varchar UNIQUE NOT NULL,
    application_date date NOT NULL,
    originating_system varchar NOT NULL,
    received_timestamp timestamptz DEFAULT now() NOT NULL,
    decision_timestamp timestamptz,
    decision_reason varchar,

    latitude numeric(9, 7) NOT NULL,
    longitude numeric(11, 7) NOT NULL,

    is_closed boolean,
    closed_timestamp timestamptz,
    closed_reason varchar,

    deleted_ind boolean DEFAULT false NOT NULL,

    create_user varchar(60) NOT NULL,
    create_timestamp timestamptz DEFAULT now() NOT NULL,
    update_user varchar(60) NOT NULL,
    update_timestamp timestamptz DEFAULT now() NOT NULL,

    FOREIGN KEY (mine_guid) REFERENCES mine(mine_guid) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (permit_guid) REFERENCES permit(permit_guid) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (now_application_guid) REFERENCES now_application_identity(now_application_guid) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (mine_operator_party_guid) REFERENCES party(party_guid) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (issuing_inspector_party_guid) REFERENCES party(party_guid) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (application_status) REFERENCES explosives_permit_status(explosives_permit_status_code) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE explosives_permit OWNER TO mds;

CREATE TABLE IF NOT EXISTS explosives_permit_magazine_type (
    explosives_permit_magazine_type_code varchar(3) PRIMARY KEY,
    description varchar NOT NULL,

    create_user varchar(60) NOT NULL,
    create_timestamp timestamptz DEFAULT now() NOT NULL,
    update_user varchar(60) NOT NULL,
    update_timestamp timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE explosives_permit_magazine_type OWNER TO mds;

CREATE TABLE IF NOT EXISTS explosives_permit_magazine (
    explosives_permit_magazine_id serial PRIMARY KEY,
    explosives_permit_id integer NOT NULL,
    explosives_permit_magazine_type_code varchar(3) NOT NULL,

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

    deleted_ind boolean DEFAULT false NOT NULL,

    create_user varchar(60) NOT NULL,
    create_timestamp timestamptz DEFAULT now() NOT NULL,
    update_user varchar(60) NOT NULL,
    update_timestamp timestamptz DEFAULT now() NOT NULL,

    FOREIGN KEY (explosives_permit_id) REFERENCES explosives_permit(explosives_permit_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (explosives_permit_magazine_type_code) REFERENCES explosives_permit_magazine_type(explosives_permit_magazine_type_code) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE explosives_permit_magazine OWNER TO mds;

CREATE TABLE IF NOT EXISTS explosives_permit_document_type (
    explosives_permit_document_type_code varchar(3) PRIMARY KEY,
    description varchar NOT NULL,

    document_template_code varchar,

    active_ind boolean DEFAULT true NOT NULL,
    display_order integer NOT NULL,

    create_user varchar(60) NOT NULL,
    create_timestamp timestamptz DEFAULT now() NOT NULL,
    update_user varchar(60) NOT NULL,
    update_timestamp timestamptz DEFAULT now() NOT NULL,
    
    FOREIGN KEY (document_template_code) REFERENCES document_template(document_template_code) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE explosives_permit_document_type OWNER TO mds;

CREATE TABLE IF NOT EXISTS explosives_permit_document_xref (
    explosives_permit_document_xref_guid uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    mine_document_guid uuid UNIQUE NOT NULL,
    explosives_permit_id integer NOT NULL,
    explosives_permit_document_type_code varchar(3) NOT NULL,

    FOREIGN KEY (mine_document_guid) REFERENCES mine_document(mine_document_guid) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (explosives_permit_id) REFERENCES explosives_permit(explosives_permit_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (explosives_permit_document_type_code) REFERENCES explosives_permit_document_type(explosives_permit_document_type_code) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE explosives_permit_document_xref OWNER TO mds;
