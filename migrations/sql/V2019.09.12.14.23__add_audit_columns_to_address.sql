ALTER TABLE public.address 
ADD COLUMN  deleted_ind        boolean DEFAULT false                NOT NULL,
ADD COLUMN  create_user        character varying(60)                  NOT NULL,
ADD COLUMN  create_timestamp   timestamp with time zone DEFAULT now() NOT NULL, 
ADD COLUMN  update_user        character varying(60)                  NOT NULL,
ADD COLUMN  update_timestamp   timestamp with time zone DEFAULT now() NOT NULL;