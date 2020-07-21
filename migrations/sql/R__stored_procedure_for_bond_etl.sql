CREATE OR REPLACE FUNCTION mms_etl_bond_data() RETURNS void AS $$
BEGIN
declare

		tmp_num_records integer;
        tmp1 integer;
        tmp2 integer;
        tmp3 integer;
  begin
	drop table if exists ETL_BOND;
	CREATE TABLE IF NOT EXISTS ETL_BOND(
		core_permit_id integer,
		core_bond_id integer,
		core_party_name varchar, --local coalese
		core_payer_party_guid uuid,
		etl_update_date TIMESTAMP,
		--Source columns we care about
		sec_cid varchar NOT NULL, --save for reverse lookups
		permit_no varchar NULL, -- used to lookup permit_id
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
		invloc varchar NULL, --bond.institution_name
		iaddr1 varchar NULL,-- bond.institution_street
		iaddr2 varchar NULL,-- ?? usually empty
		iaddr3 varchar NULL,-- city/prov to be split for bond.institution_city, bond.institution_prov
		ipost_cd varchar NULL, --bond.institution_postal_code
		int_rt numeric(8,2) NULL, --?? 2 decimale place ? Interest Return??
		first_nm varchar NULL,-- bond.payer_party.first_name
		cnt_title varchar NULL,-- bond.payer_party.job_title
		iss_dt timestamp NULL,-- bond.issue_date
		project_no varchar null,-- bond.project_id

		--UNKNOWN FIELDS
		-- cnt_dt timestamp NULL,--?? Some date?
		-- exp_dt timestamp NULL,--?? Some date?last
		-- mat_dt timestamp NULL,--?? Some date? maturity date?
		-- pre_exp_dt timestamp NULL,--?? Some date?
		"status" varchar NULL--?? ["",E,C]
		-- rrlink varchar NULL,--?? ["",A]
		-- xchng_amt numeric(12,2) NULL,--?? 16 records have non-zero, all negative. (return_dt ~1991/1992, status=C)
		-- comment2 varchar NULL, --?? almost all null/white string
		-- dep_dt timestamp NULL,--??
		-- add_dt timestamp NULL,--??
		-- last_dt timestamp NULL,--??
		-- return_dt timestamp NULL, --?? 200 non-null records
		-- action_dt timestamp NULL, --??

		-- --IGNORED FIELDS
		-- comment1 varchar(2000) NULL,--?? 'Entered By NAME' OR /ea
		-- sec_group varchar NULL,--?? ["","1","3"]
		-- cmp_sal varchar NULL,--?? ["","Mrs.","Mr."] 'Salutation?
		-- ident_cd varchar NULL, --?? FName LastNAme. Sometimes?
		-- property varchar NULL,--?? on permit_details, probably ignore
		-- ipostal varchar NULL,--?? empty column? accidental_dup of ipost_cd
		-- permit varchar NULL,--?? Breakdown of permit number
		-- district varchar NULL,--?? Breakdown of permit number
		-- "temp" varchar NULL,--?? Breakdown of permit number
);
-- unmapped columns
-- bond.closed_date
-- bond.closed_note


	------------------- FETCH NEW RECORDS
	SELECT count(*) FROM ETL_BOND into tmp1;

	INSERT INTO ETL_BOND (
		sec_cid,
		permit_no ,
		core_party_name,
		note1 ,
		sec_amt ,
		sec_typ,
		descript ,
		invloc ,
		iaddr1 ,
		iaddr2 ,
		iaddr3 ,
		ipost_cd ,
		int_rt,
		first_nm ,
		cnt_title ,
		project_no ,
		etl_update_date)
	SELECT
		sec_cid,
		replace(REPLACE(permit_no,' ',''),'--','-'),
		coalesce(nullif(TRIM(last_nm),''),TRIM(cmp_nm)),
		TRIM(note1),
		sec_amt,
		TRIM(sec_typ),
		TRIM(descript),
		TRIM(invloc),
		TRIM(iaddr1),
		TRIM(iaddr2),
		TRIM(iaddr3),
		TRIM(ipost_cd),
		int_rt,
		TRIM(first_nm),
		TRIM(cnt_title),
		TRIM(project_no),
		now()
	from mms.secsec
	where mms.secsec.sec_cid not in (select sec_cid from ETL_BOND) 
	and TRIM(mms.secsec.sec_cid) != ''
	and replace(REPLACE(permit_no,' ',''),'--','-') in (select permit_no from permit);


	SELECT count(*) FROM ETL_BOND into tmp2;
	RAISE NOTICE '....# of ETL_BOND record before.. %', tmp1;
	RAISE NOTICE '....# of ETL_BOND records after.. %', tmp2;

	----------------- PAYERS AS PARTIES
	drop table if exists etl_new_bond_payer; 
	CREATE TEMPORARY TABLE etl_new_bond_payer AS
	SELECT 
		first_nm as first_nm,
		core_party_name,
		now() as effective_date,
		CASE
			WHEN first_nm is null
			or TRIM(first_nm) ='' THEN 'ORG'
			ELSE 'PER'
		end as party_type_code
	FROM ETL_BOND
	where ETL_BOND.core_payer_party_guid is null;
	 --upsert parties
	 --upsert bonds
	 
	SELECT count(*) FROM ETL_BOND where core_payer_party_guid is not null into tmp1;

	with inserted_parties as ( 
	INSERT INTO party (
	    first_name         ,
	    party_name         ,
	    effective_date     ,
	    party_type_code,
	    create_user, 
	    update_user
	 )
	select distinct
	    first_nm          ,
	    core_party_name as party_name,
		effective_date    ,
	    party_type_code	  , 
	   	'bond_etl'        ,
	   	'bond_etl'
	FROM etl_new_bond_payer
	returning first_name, party_name, party_guid)
	
	update ETL_BOND e 
	set 
		core_payer_party_guid =up.party_guid 
	from 
		inserted_parties up
	where 
		(up.first_name = e.first_nm or (up.first_name is null and e.first_nm is null))
		and up.party_name = e.core_party_name;

	SELECT count(*) FROM ETL_BOND where core_payer_party_guid is not null into tmp2;
	SELECT count(distinct core_payer_party_guid) FROM ETL_BOND into tmp3;

	RAISE NOTICE '....# of ETL_BOND records with party_guid before.. %', tmp1;
	RAISE NOTICE '....# of ETL_BOND records with party_guid after.. %', tmp2;
	RAISE NOTICE '....# of distinct parties used by ETL_BOND.. %', tmp3;

	----------------------GET PERMIT ID's

	update ETL_BOND e
	set core_permit_id = p.permit_id
	from permit p
	where p.permit_no = e.permit_no;
	--initial fetch filtered out missing permit_no's
	
	---------------------- INSERT BONDS
		
	with inserted_bonds as ( 
	INSERT INTO bond (
		sec_cid,
		amount, 
		bond_type_code,
		payer_party_guid, 
		bond_status_code, 
		reference_number, 
		create_user, 
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
		case
			when sec_typ = 'Asset Security Agreement' then 'ASA'
			when sec_typ = 'Cash' then 'CAS'
			when sec_typ = 'Letter of Credit' then 'ILC'
			when sec_typ = 'Qualified Env. Trust' then 'QET'
			when sec_typ = 'Safekeeping Agreement' then 'SAG'
			when sec_typ = 'Surety Bond' then 'SBO'
			else 'STR' 
			--TODO HANDLE MISSING CASES
		end as bond_type_code,	
		core_payer_party_guid,
		CASE
			WHEN "status" = 'E' THEN 'REL'
			when "status" = 'C' then 'CON'
			ELSE 'ACT'
		end as bond_status_code,
		descript,
		'bond_etl',
		'bond_etl',
		invloc,
		iaddr1,
		CONCAT(iaddr2,iaddr3),
		null,
		ipost_cd,
		note1,
		iss_dt,
		project_no,
		null,
		null
	from ETL_BOND
	returning *)

	update ETL_BOND e
	set
		core_bond_id =ub.bond_id
	from
		inserted_bonds ub
	where
		ub.sec_cid = e.sec_cid;
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
	on conflict do nothing;

END;
END;
$$ LANGUAGE PLPGSQL;


select mms_etl_bond_data();
