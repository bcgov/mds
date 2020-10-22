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
		mms_address varchar NULL, --preserving, but can't be converted
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