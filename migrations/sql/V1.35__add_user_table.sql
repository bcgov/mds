CREATE TABLE minespace_users (
    id serial PRIMARY KEY,
    keycloak_guid uuid,
    email character varying(100) NOT NULL, 
    deleted_ind boolean NOT NULL DEFAULT FALSE,

    UNIQUE (email),
    UNIQUE (keycloak_guid)
);

CREATE TABLE minespace_users_mds_mine_access(
    user_id integer NOT NULL,
    mine_guid uuid NOT NULL, 

    PRIMARY KEY(user_id, mine_guid),
    FOREIGN KEY (user_id) REFERENCES minespace_users(id) DEFERRABLE INITIALLY DEFERRED
);
