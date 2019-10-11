CREATE TABLE IF NOT EXISTS core_user
(
    core_user_id 			serial 										PRIMARY KEY,
	core_user_guid			uuid DEFAULT gen_random_uuid()				NOT NULL,
    email 					character varying(254)						,
	phone_no  				character varying(64)						,
	last_logon 				timestamp with time zone					,
	active_ind 				boolean DEFAULT TRUE						NOT NULL,
    create_user           	character varying(60)						NOT NULL,
    create_timestamp      	timestamp with time zone DEFAULT now()		NOT NULL,
    update_user           	character varying(60)						NOT NULL,
    update_timestamp      	timestamp with time zone DEFAULT now()		NOT NULL
);
ALTER TABLE core_user OWNER TO mds;
COMMENT ON TABLE core_user IS 'A core user and some user details. Should not include details specific to any authentication provider.';


CREATE TABLE IF NOT EXISTS idir_user_detail
(
    idir_user_detail_id		serial 										PRIMARY KEY,
	core_user_id 			int4										NOT NULL,
    bcgov_guid 				uuid										NOT NULL,
	username 				character varying(128)						NOT NULL,
	title 					character varying(254)						,
	city 					character varying(128)						,
	department 				character varying(254)						,
    create_user           	character varying(60)                       NOT NULL,
    create_timestamp      	timestamp with time zone DEFAULT now()      NOT NULL,
    update_user           	character varying(60)                       NOT NULL,
    update_timestamp      	timestamp with time zone DEFAULT now()      NOT NULL,
	
    FOREIGN KEY (core_user_id) REFERENCES core_user(core_user_id) DEFERRABLE INITIALLY DEFERRED
);
ALTER TABLE idir_user_detail OWNER TO mds;
COMMENT ON TABLE idir_user_detail IS 'User details specific to IDIR users being imported or syncronized with Core.';


CREATE TABLE IF NOT EXISTS idir_membership
(
	idir_membership_id 		serial 										PRIMARY KEY,
	idir_membership_name 	character varying(254) 						NOT NULL,
	import_users_ind		boolean DEFAULT TRUE						NOT NULL,
    create_user           	character varying(60)                     	NOT NULL,
    create_timestamp      	timestamp with time zone DEFAULT now()		NOT NULL,
    update_user           	character varying(60)						NOT NULL,
    update_timestamp      	timestamp with time zone DEFAULT now()		NOT NULL
);
ALTER TABLE idir_membership OWNER TO mds;
COMMENT ON TABLE idir_membership IS 'Groups, Distribution Lists, or other IDIR memberships we are interested in when importing or synchronizing users with Core.';
COMMENT ON COLUMN idir_membership.import_users_ind IS 'Indicates that we would like to import the users from this group.';


CREATE TABLE IF NOT EXISTS idir_membership_xref 									
(
	core_user_id 			int4										NOT NULL,
	idir_membership_id 		int4										NOT NULL,
	
    FOREIGN KEY (core_user_id) REFERENCES core_user(core_user_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (idir_membership_id) REFERENCES idir_membership(idir_membership_id) DEFERRABLE INITIALLY DEFERRED,
    PRIMARY KEY(core_user_id, idir_membership_id)
);
ALTER TABLE idir_membership_xref OWNER TO mds;
COMMENT ON TABLE idir_membership_xref IS 'Records which core users relate to which IDIR memberships we are importing users from.';
