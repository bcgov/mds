CREATE TABLE subscription
(
    subscription_id serial PRIMARY KEY,
    idir character varying(30) NOT NULL,
    mine_guid uuid NOT NULL,

    FOREIGN KEY (mine_guid) REFERENCES mine(mine_guid),
    CONSTRAINT unq_idir_mine_guid UNIQUE(idir,mine_guid)
);

COMMENT ON TABLE subscription IS 'A list of mds mines a given core user has subscribed to';