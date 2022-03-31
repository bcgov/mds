CREATE TABLE IF NOT EXISTS nod ( 
  nod_guid UUID DEFAULT gen_random_uuid() NOT NULL,
  mine_guid UUID NOT NULL,
  permit_guid UUID NOT NULL,
  nod_title character varying(50) NOT NULL,
  deleted_ind BOOLEAN NOT NULL DEFAULT false,
  create_user character varying(60) NOT NULL,
  create_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  update_user character varying(60) NOT NULL,
  update_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  PRIMARY KEY (nod_guid),
  FOREIGN KEY(mine_guid) REFERENCES mine (mine_guid),
  FOREIGN KEY(permit_guid) REFERENCES permit (permit_guid)

);
  
COMMENT ON TABLE nod is 'Notice of departure';

ALTER TABLE nod OWNER TO mds;
