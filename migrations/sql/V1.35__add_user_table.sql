CREATE TABLE minespace_user (
    user_id serial PRIMARY KEY,
    keycloak_guid uuid,
    email character varying(100) NOT NULL, 
    deleted_ind boolean NOT NULL DEFAULT FALSE,

    UNIQUE (email),
    UNIQUE (keycloak_guid)
);


COMMENT ON TABLE minespace_user IS 'A list of public mine proponents email addresses that can log into minespace and update mds information on mines listed in minespace_user_mds_mine_access';

CREATE TABLE minespace_user_mds_mine_access(
    user_id integer NOT NULL,
    mine_guid uuid NOT NULL, 

    PRIMARY KEY(user_id, mine_guid),
    FOREIGN KEY (user_id) REFERENCES minespace_user(id) DEFERRABLE INITIALLY DEFERRED
);
