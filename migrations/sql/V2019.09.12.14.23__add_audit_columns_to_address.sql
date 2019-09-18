ALTER TABLE public.address 
ADD COLUMN  deleted_ind        boolean DEFAULT false                NOT NULL,
ADD COLUMN  create_user        character varying(60) DEFAULT 'migration'         NOT NULL,
ADD COLUMN  create_timestamp   timestamp with time zone DEFAULT now() NOT NULL, 
ADD COLUMN  update_user        character varying(60) DEFAULT 'migration'         NOT NULL,
ADD COLUMN  update_timestamp   timestamp with time zone DEFAULT now() NOT NULL;


ALTER TABLE public.address
ALTER COLUMN create_user DROP DEFAULT,
ALTER COLUMN update_user DROP DEFAULT;