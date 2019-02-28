select *
into temporary
table temp_old_permit from permit;

DO $$                  
BEGIN
	IF (SELECT to_regclass('public.permit_amendment') is null) THEN


	alter table permit drop constraint permit_pkey;
	ALTER TABLE permit ADD COLUMN permit_id SERIAL PRIMARY KEY;
	alter table mine_party_appt drop constraint mine_party_appt_permit_party_fk;


	CREATE TABLE permit_amendment_type_code
	(
		permit_amendment_type_code character varying(3) NOT NULL,
		description character varying(100) NOT NULL,
		display_order smallint,
		active_ind boolean DEFAULT true NOT null,
		create_user character varying(60) NOT NULL,
		create_timestamp timestamp
		with time zone DEFAULT now
		() NOT NULL,
				update_user character varying
		(60) NOT NULL,
				update_timestamp timestamp
		with time zone DEFAULT now
		() NOT NULL
			);

		ALTER TABLE permit_amendment_type_code OWNER TO mds;
	ALTER TABLE ONLY permit_amendment_type_code

	ADD CONSTRAINT permit_amendment_type_code_pkey PRIMARY KEY
	(permit_amendment_type_code);

	INSERT INTO permit_amendment_type_code
		(
		permit_amendment_type_code,
		description,
		display_order,
		create_user,
		update_user
		)
	VALUES
		('OGP', 'Original Permit', 10, 'system-mds', 'system-mds'),
		('AMD', 'Permit Amendment', 20, 'system-mds', 'system-mds'),
		('ALG', 'Amalgamated Permit', 30, 'system-mds', 'system-mds')
	ON CONFLICT DO NOTHING;

	CREATE TABLE permit_amendment_status_code
	(
		permit_amendment_status_code character varying(3) NOT NULL,
		description character varying(100) NOT NULL,
		display_order smallint,
		active_ind boolean DEFAULT true NOT null,
		create_user character varying(60) NOT NULL,
		create_timestamp timestamp
		with time zone DEFAULT now
		() NOT NULL,
				update_user character varying
		(60) NOT NULL,
				update_timestamp timestamp
		with time zone DEFAULT now
		() NOT NULL
			);

		ALTER TABLE permit_amendment_status_code OWNER TO mds;
		ALTER TABLE ONLY permit_amendment_status_code
		ADD CONSTRAINT permit_amendment_status_code_pkey PRIMARY KEY
		(permit_amendment_status_code);

		INSERT INTO permit_amendment_status_code
			(
			permit_amendment_status_code,
			description,
			display_order,
			create_user,
			update_user
			)
		VALUES
			('ACT', 'Active', 10, 'system-mds', 'system-mds'),
			('RMT', 'Remitted', 20, 'system-mds', 'system-mds')
		ON CONFLICT DO NOTHING;

		CREATE TABLE permit_amendment
		(
			permit_amendment_id serial PRIMARY KEY,
			permit_amendment_guid uuid DEFAULT gen_random_uuid() NOT NULL,
			permit_id integer NOT NULL,
			received_date date,
			issue_date date,
			authorization_end_date date,
			permit_amendment_type_code character varying(3) DEFAULT 'AMD' NOT NULL ,
			permit_amendment_status_code character varying(3) DEFAULT 'ACT' NOT NULL,
			deleted_ind boolean DEFAULT false NOT NULL,
			create_user character varying(60) NOT NULL,
			create_timestamp timestamp
			with time zone DEFAULT now
			() NOT NULL,
				update_user character varying
			(60) NOT NULL,
				update_timestamp timestamp
			with time zone DEFAULT now
			() NOT NULL
			);

			ALTER TABLE permit_amendment OWNER TO mds;




			-- Migrate permit and amendments to new structure
			create temporary table temp_permits
			(
				mine_guid              uuid                  ,
				permit_no              character varying
			(12) ,
				permit_status_code     character varying
			(2)  
			);

			WITH
				open_permits
				as
				(
					select distinct mine_guid, permit_no, permit_status_code
					from permit
					where permit_status_code='O'
				)
			insert into temp_permits
			select mine_guid, permit_no, permit_status_code
			from open_permits;

			with
				closed_permits
				as
				(
					select *
					from permit
					where permit_no not in (select permit_no
					from temp_permits)
				)
			insert into temp_permits
			select mine_guid, permit_no, permit_status_code
			from closed_permits;

			truncate table permit
			cascade;

			insert into permit
				(mine_guid, permit_no, permit_status_code, create_user, update_user)
			select *, 'system-mds' as create_user, 'system-mds' as update_user
			from temp_permits;

			insert into permit_amendment
				(permit_id, received_date, issue_date, authorization_end_date, create_user, update_user)
			select p.permit_id, a.received_date, a.issue_Date, a.authorization_end_date, 'system-mds' as create_user, 'system-mds' as update_user
			from temp_old_permit a join permit p on a.permit_no=p.permit_no;



			-- Update permittee references to parent permit
			update mine_party_appt set permit_guid = 
			(select permit_guid
			from permit
			where permit_no = (select permit_no
				from temp_old_permit
				where mine_party_appt.permit_guid=temp_old_permit.permit_guid) and mine_guid=mine_party_appt.mine_guid limit 1
			)
			where permit_guid is not null;



			DROP TABLE temp_permits;
			DROP TABLE temp_old_permit;


			-- Add constraints after migration
			ALTER TABLE ONLY permit_amendment
			ADD CONSTRAINT permit_amendment_permit_fkey FOREIGN KEY
			(permit_id) REFERENCES permit
			(permit_id);
			ALTER TABLE ONLY permit_amendment
			ADD CONSTRAINT permit_amendment_type_code_fkey FOREIGN KEY
			(permit_amendment_type_code) REFERENCES permit_amendment_type_code
			(permit_amendment_type_code);
			ALTER TABLE ONLY permit_amendment
			ADD CONSTRAINT permit_amendment_status_code_fkey FOREIGN KEY
			(permit_amendment_status_code) REFERENCES permit_amendment_status_code
			(permit_amendment_status_code);
			ALTER TABLE ONLY mine_party_appt
			ADD CONSTRAINT mine_party_appt_permit_party_fk FOREIGN KEY
			(permit_guid, mine_guid) REFERENCES permit
			(permit_guid, mine_guid);
			END
			IF;
    END
   $$ ;
   
