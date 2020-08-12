CREATE OR REPLACE FUNCTION mms_etl_bond_data() RETURNS void AS $$
BEGIN
declare

		tmp_num_records integer;
        tmp1 integer;
        tmp2 integer;
        tmp3 integer;
  begin
	CREATE TABLE IF NOT EXISTS ETL_BOND(
		core_permit_id integer,
		core_bond_id integer,
		cmp_nm varchar,
		core_first_name varchar,
		core_party_name varchar,
		core_party_type varchar,
		core_payer_party_guid uuid,

		etl_create_date TIMESTAMP,
		etl_update_date TIMESTAMP,
		-------Source columns we care about
		sec_cid varchar NOT null unique , --save for reverse lookups
		permit_no varchar NULL, -- used to lookup permit_id
		mms_address varchar NULL, --preserving, but can't be converted.
	--?? ignore bond.payer_party.address
--		address varchar NULL,--?? Payer address
--		city varchar NULL,--?? Street, Ciry, Prov are all mixed between addr1,2,3
--		prov varchar NULL,
--		post_cd varchar NULL,--?? Payer post
		note1 varchar NULL,--?? Payer Contact Name
		sec_amt numeric(12,2) NOT NULL, --bond.amount
		core_bond_type_code varchar null,
		sec_typ varchar NULL, -- mapped to bond.bond_type_code
		descript varchar NULL,--bond.reference_number
		"comment" varchar NULL, --bond.comment (joine secsec.comment1 and secsec.comment2)
		invloc varchar NULL, --bond.institution_name
		iaddr1 varchar NULL,-- bond.institution_street
		iaddr2 varchar NULL,-- ?? usually empty
		iaddr3 varchar NULL,-- city/prov to be split for bond.institution_city, bond.institution_prov
		ipost_cd varchar NULL, --bond.institution_postal_code
		project_no varchar null,-- bond.project_id
		"status" varchar null,--?? ["",E,C]
		cnt_dt timestamp NULL,-- bond.issue_date, originially Contract Date. 
		return_dt timestamp NULL -- bond.closed_date

		-- --IGNORED FIELDS Confirmed with Eva
		-- mat_dt timestamp NULL,--?? Some date? maturity date?
		-- pre_exp_dt timestamp NULL,--?? Some date?
		-- exp_dt timestamp NULL,--?? Some date?last
		-- rrlink varchar NULL,--?? ["",A]
		-- xchng_amt numeric(12,2) NULL,--?? 16 records have non-zero, all negative. (return_dt ~1991/1992, status=C)
		-- dep_dt timestamp NULL,--??
		-- add_dt timestamp NULL,--?? mms Entry date
		-- last_dt timestamp NULL,--??
		-- action_dt timestamp NULL, --??
		-- sec_group varchar NULL,--?? ["","1","3"]
		-- cmp_sal varchar NULL,--?? ["","Mrs.","Mr."] 'Salutation?
		-- ident_cd varchar NULL, --?? FName LastNAme. Sometimes?
		-- property varchar NULL,--?? on permit_details, probably ignore
		-- ipostal varchar NULL,--?? empty column? accidental_dup of ipost_cd
		-- permit varchar NULL,--?? Breakdown of permit number
		-- district varchar NULL,--?? Breakdown of permit number
		-- "temp" varchar NULL,--?? Breakdown of permit number
);
-- columns with no source
-- bond.closed_note


	------------------- UPSERT RECORDS
	--SELECT count(*) FROM ETL_BOND into tmp1;

	with upserted_etl_bond as (
	INSERT INTO ETL_BOND (
		sec_cid,
		permit_no ,
		mms_address,
		cmp_nm,
		note1,
		sec_amt ,
		core_bond_type_code,
		sec_typ,
		descript ,
		"comment",
		invloc ,
		iaddr1 ,
		iaddr2 ,
		iaddr3 ,
		ipost_cd ,
		project_no ,
		"status",
		return_dt,
		cnt_dt,
		etl_create_date,
		etl_update_date)
	SELECT
		sec_cid,
		replace(REPLACE(permit_no,' ',''),'--','-'),
		CONCAT_WS(' ', TRIM(addr1),TRIM(addr2),TRIM(addr3), TRIM(post_cd)),
		RTRIM(coalesce(nullif(TRIM(cmp_nm),''),TRIM(last_nm)),','),-- 1 record ends with a comma
		TRIM(note1),
		sec_amt,
		case
			when TRIM(sec_typ) = 'Asset Security Agreement' then 'ASA'
			when TRIM(sec_typ) = 'Cash' then 'CAS'
			when TRIM(sec_typ) = 'Confiscation' then 'CAS'
			when TRIM(sec_typ) = 'Letter of Credit' then 'ILC'
			when TRIM(sec_typ) = 'Qualified Env. Trust' then 'QET'
			when TRIM(sec_typ) = 'Safekeeping Agreement' then 'SAG'
			when TRIM(sec_typ) = 'Receipt and Agreement' then 'SAG'
			when TRIM(sec_typ) = 'Surety Bond' then 'SBO'
			when TRIM(sec_typ) = 'Recl. Fund' then 'STR'
			when TRIM(sec_typ) = 'Performance Bond' then 'PFB'
		end as core_bond_type_code,
		TRIM(sec_typ),
		TRIM(descript),
		CONCAT(TRIM(comment1),' ', TRIM(comment2)),
		TRIM(invloc),
		TRIM(iaddr1),
		TRIM(iaddr2),
		TRIM(iaddr3),
		TRIM(ipost_cd),
		TRIM(project_no),
		"status",
		return_dt,
		cnt_dt,
		now(),
		now()
	from mms.secsec sec
	where TRIM(sec.sec_cid) != ''
	and replace(REPLACE(permit_no,' ',''),'--','-') in (select permit_no from permit)
	and sec_typ not in ('ALC', '')
	ON CONFLICT (sec_cid)
	DO
		UPDATE
			SET
				sec_amt=excluded.sec_amt,
				core_payer_party_guid = case
					when ETL_BOND.cmp_nm != EXCLUDED.cmp_nm then null
					else ETL_BOND.core_payer_party_guid
					end,
				core_bond_type_code=excluded.core_bond_type_code,
				descript= TRIM(excluded.descript),
				etl_update_date=excluded.etl_update_date,
				invloc=excluded.invloc,
				iaddr1=excluded.iaddr1,
				iaddr2=excluded.iaddr2,
				iaddr3=excluded.iaddr3,
				ipost_cd=excluded.ipost_cd,
				note1=excluded.note1,
				"status"=excluded.status,
				cnt_dt=excluded.cnt_dt,
				project_no=excluded.project_no,
				return_dt=excluded.return_dt
	returning *
	)
	SELECT count(*) FROM upserted_etl_bond into tmp3;

	SELECT count(*) FROM ETL_BOND into tmp2;

	RAISE NOTICE '....# of ETL_BOND record before.. %', tmp1;
	RAISE NOTICE '....# of ETL_BOND records after.. %', tmp2;
	RAISE NOTICE '....# of ETL_BOND records upserted. %', tmp3;

	--try using classifcation function
	update ETL_BOND set
	core_party_type = permitee_party_type(cmp_nm)--permittee_party_type defined in R__stored_procedure_for_permit_but_better.sql
	where core_payer_party_guid is null;
	--parse person firstname, lastname
	update ETL_BOND set
	core_first_name = format_permittee_first_name(cmp_nm),
	core_party_name = format_permitee_party_name(cmp_nm)
	where core_payer_party_guid is null
	and core_party_type='PER';

	update ETL_BOND set
	core_party_name = cmp_nm
	where core_party_type = 'ORG';

	--revert failed parsings to organizations 1
	update ETL_BOND set
	core_party_type = 'ORG',
	core_party_name = cmp_nm,
	core_first_name = null
	where core_party_type = 'PER'
	and (core_party_name = '' or core_party_name is null);




	----------------- PAYERS AS PARTIES

	with inserted_org_parties as (
	INSERT INTO party (
	    party_name         ,
	    effective_date     ,
	    party_type_code,
	    create_user,
	    update_user
	 )
	select distinct
	    core_party_name,
		now(),
	    core_party_type	  ,
	   	'bond_etl'        ,
	   	'bond_etl'
	FROM ETL_BOND
	where core_party_type = 'ORG'
	and core_payer_party_guid is null
	returning null::varchar as first_name, party_name, party_type_code, party_guid),

	inserted_per_parties as (
	INSERT INTO party (
		first_name,
	    party_name,
	    effective_date,
	    party_type_code,
	    create_user,
	    update_user
	 )
	select distinct
		core_first_name,
	    core_party_name,
		now()    ,
	    core_party_type	  ,
	   	'bond_etl'        ,
	   	'bond_etl'
	FROM ETL_BOND
	where core_party_type = 'PER'
	and core_payer_party_guid is null
	returning first_name, party_name, party_type_code, party_guid),
	inserted_parties as(
		select * from inserted_per_parties
		UNION
		select * from inserted_org_parties
	),
	bond_party_updates as (
	update ETL_BOND e
	set
		core_payer_party_guid =up.party_guid
	from
		inserted_parties up
	where
		up.party_name = e.core_party_name
		and (up.first_name = e.core_first_name or up.first_name is null and e.core_first_name is null)
		and up.party_type_code = e.core_party_type
		and e.core_payer_party_guid is null
	returning 1)
	SELECT count(*) FROM inserted_parties into tmp2;

	SELECT count(distinct core_payer_party_guid) FROM ETL_BOND into tmp3;

	RAISE NOTICE '....# of party records created.. %', (tmp2);
	RAISE NOTICE '....# of distinct parties used by ETL_BOND.. %', tmp3;

	----------------------GET PERMIT ID's

	update ETL_BOND e
	set core_permit_id = p.permit_id
	from permit p
	where p.permit_no = e.permit_no;
	--initial fetch filtered out missing permit_no's

	---------------------- INSERT BONDS

	with upserted_bonds as (
	INSERT INTO bond (
		mms_sec_cid,
		amount,
		bond_type_code,
		payer_party_guid,
		bond_status_code,
		reference_number,
		create_user,
		update_timestamp,
		update_user,
		institution_name,
		institution_street,
		institution_city,
		institution_province,
		institution_postal_code,
		note,
		issue_date,
		project_id,
		closed_date,
		closed_note
	)
	select
		sec_cid,
		sec_amt,
		core_bond_type_code,
		core_payer_party_guid,
		CASE
			WHEN "status" = 'E' THEN 'REL'
			when "status" = 'C' then 'CON'
			ELSE 'ACT'
		end as bond_status_code,
		descript,
		'bond_etl',
		etl_update_date,
		'bond_etl',
		invloc,
		iaddr1,
		CONCAT(iaddr2,iaddr3),
		null,
		ipost_cd,
		note1,
		cnt_dt,
		project_no,
		return_dt,
		null
	from ETL_BOND
	ON CONFLICT (mms_sec_cid)
	DO
		UPDATE
			SET
				amount=excluded.amount,
				bond_type_code=excluded.bond_type_code,
				payer_party_guid=excluded.payer_party_guid,
				bond_status_code=excluded.bond_status_code,
				reference_number=excluded.reference_number,
				update_timestamp=excluded.update_timestamp,
				update_user=excluded.update_user,
				institution_name=excluded.institution_name,
				institution_street=excluded.institution_street,
				institution_city=excluded.institution_city,
				institution_province=excluded.institution_province,
				institution_postal_code=excluded.institution_postal_code,
				note=excluded.note,
				issue_date=excluded.issue_date,
				project_id=excluded.project_id,
				closed_date=excluded.closed_date
	returning *
	)

	update ETL_BOND e
	set
		core_bond_id =ub.bond_id
	from
		upserted_bonds ub
	where
		ub.mms_sec_cid = e.sec_cid
	and e.core_bond_id is null;


	---------------------- INSERT BOND_permit_xref

	insert into bond_permit_xref
		(
			bond_id,
			permit_id
		)
	select
			core_bond_id,
			core_permit_id
	from ETL_BOND
	where core_bond_id is not null
	on conflict do nothing;

END;
END;
$$ LANGUAGE PLPGSQL;