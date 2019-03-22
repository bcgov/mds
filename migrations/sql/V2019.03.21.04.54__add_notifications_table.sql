CREATE TABLE notification
(
    user_id serial PRIMARY KEY,
    idir character varying(30) NOT NULL,
    mine_guid uuid NOT NULL,

    FOREIGN KEY (mine_guid) REFERENCES mine(mine_guid)
);

COMMENT ON TABLE notification IS 'A list of mds mines a given core user has subscribed to';