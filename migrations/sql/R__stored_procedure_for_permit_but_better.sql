CREATE OR REPLACE FUNCTION format_phone_number(tel_no varchar) RETURNS varchar AS $$
BEGIN
    SELECT RIGHT(NULLIF(regexp_replace(tel_no, '\D', '','g'),''),10) INTO tel_no;
    RETURN(SELECT CASE
        WHEN tel_no = '' THEN ''
        ELSE
            SUBSTRING(tel_no FROM 1 for 3)||'-'||
            SUBSTRING(tel_no FROM 4 for 3)||'-'||
            SUBSTRING(tel_no FROM 7 for 4)
        END
       );
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION format_permitee_email(email varchar) RETURNS varchar AS $$
BEGIN
    RETURN(SELECT NULLIF(regexp_replace(email,' ', '', 'g'),''));
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION transfer_permit_permitee_but_better() RETURNS void AS $$
BEGIN
DECLARE
		tmp_num_records integer;
        tmp1 integer;
        tmp2 integer;
        tmp3 integer;
  BEGIN
	CREATE TABLE IF NOT EXISTS ETL_PERMIT(
	    mine_party_appt_guid   uuid                  ,
	    --permit info
	    permit_amendment_guid  uuid                  ,
	    permit_guid            uuid                  ,
	    source                 numeric               ,
	    mine_guid              uuid                  ,
	    mine_no                character varying(12) ,
	    permit_no              character varying(12) ,
	    permit_cid             character varying(30) ,
	    received_date          date                  ,
	    issue_date             date                  ,
	    authorization_end_date date                  ,
	    permit_status_code     character varying(2)  ,
	    --permittee info
	    party_guid             uuid                  ,
	    party_combo_id         character varying(200),
	    first_name             character varying(100),
	    party_name             character varying(100),
	    party_type             character varying(3)  ,
	    phone_no               character varying(12) ,
	    email                  character varying(254),
	    effective_date         date
	);

	-- Add security adjustment
	ALTER TABLE ETL_PERMIT
    ADD COLUMN IF NOT EXISTS security_adjustment numeric;

	DROP TABLE IF EXISTS etl_valid_permits;
    CREATE TEMPORARY TABLE etl_valid_permits AS
	SELECT
	    mine_no||permit_no||recv_dt||COALESCE(iss_dt::varchar, appr_dt::varchar,
                                             ' null_issue_dt') AS combo_id,
	    max(cid) permit_cid
	FROM mms.mmspmt mmspmt
	WHERE
	    (sta_cd ~* 'z'  OR sta_cd ~* 'a' OR sta_cd ~* 'r' or sta_cd ~* 'c')
	    AND
	    ((permit_no !~ '^ *$' AND mmspmt.permit_no IS NOT NULL))
	GROUP BY combo_id;


	SELECT COUNT(*) FROM etl_valid_permits INTO tmp_num_records;
    RAISE NOTICE '# of valid permits found in mms: %', tmp_num_records;

--Open - 'A','C','N','S','X'
--Closed - 'R','Z'


    DROP TABLE IF EXISTS etl_permit_info;
    CREATE TEMPORARY TABLE etl_permit_info AS
    SELECT
        ETL_MINE.mine_guid                                       ,
        mmspmt.mine_no                                      ,
        mmspmt.permit_no                                    ,
        mmspmt.cid AS permit_cid                            ,
        mmspmt.recv_dt AS recv_dt                           ,
        mmspmt.iss_dt AS iss_dt                             ,
		mmspmt.appr_dt as appr_dt                           ,
        (SELECT end_dt
                FROM mms.mmsnow
                WHERE mms.mmsnow.cid = mmspmt.cid
        ) AS permit_expiry_dt                                    ,
        CASE mmspmt.sta_cd
            WHEN 'Z' THEN 'C' --closed
            WHEN 'R' THEN 'C' --closed
            ELSE 'O' --open
        END AS sta_cd                                            ,
        mmspmt.upd_no
    FROM mms.mmspmt mmspmt
    INNER JOIN ETL_MINE ON ETL_MINE.mine_no = mmspmt.mine_no
    WHERE mmspmt.cid IN (SELECT permit_cid FROM etl_valid_permits);

    SELECT COUNT(*) FROM etl_permit_info INTO tmp_num_records;
    RAISE NOTICE '# of valid permit info rows found in mms: %', tmp_num_records;

	-- ################################################################
	-- # Get three sources for Permittees
	-- # Includes records related to mines that are not brought in
	-- ################################################################

	  	DROP TABLE IF EXISTS etl_permit_permittees;
	    create TEMPORARY TABLE etl_permit_permittees as
	    WITH
	    most_recent_permittee AS (
	        SELECT
	            cid  AS permit_cid  ,
	            max(cid_ccn) AS contact_cid
	        FROM mms.mmsccc
	        WHERE
	            SUBSTRING(type_ind, 4, 1)='Y'
	            AND
	            cid in (select permit_cid from etl_permit_info)
	        GROUP BY cid
	    )
	    SELECT
	        most_recent_permittee.permit_cid                ,
	        contact_info.add_dt ::date AS effective_date    ,
	        company_info.cmp_nm  AS permittee_name            ,
	        company_info.tel_no                             ,
	        company_info.email                              ,
	        '1'::numeric AS source
	    FROM most_recent_permittee
	    INNER JOIN mms.mmsccn contact_info ON
	        most_recent_permittee.contact_cid=contact_info.cid
	    INNER JOIN mms.mmscmp company_info ON
	    contact_info.cmp_cd=company_info.cmp_cd;


	    DROP TABLE IF EXISTS etl_mine_update_screen_permittees;
	    CREATE TEMPORARY TABLE etl_mine_update_screen_permittees AS
	    SELECT
	        permit_info.cid as permit_cid       ,
	        CASE
	            WHEN mmsmin.entered_date ~ 'XXXX/XX/XX'
	            THEN current_date --psql built-in
	            ELSE to_date(mmsmin.entered_date, 'YYYY/MM/DD')
	        END AS effective_date,
	        mmscmp.cmp_nm AS permittee_name    ,
	        COALESCE(mmscmp.tel_no, mmscmp.ctel_no) AS tel_no,
	        mmscmp.cemail AS email           ,
	        '3'::numeric AS source
	    FROM mms.mmspmt permit_info
	    INNER JOIN mms.mmsmin mmsmin ON
	        mmsmin.mine_no = permit_info.mine_no
	    INNER JOIN mms.mmscmp mmscmp ON
	        mmscmp.cmp_cd=mmsmin.cmp_cd
	    WHERE permit_info.cid IN (
	        SELECT permit_cid
	        FROM etl_permit_info
        )--only use this if a mine has one permit by number
        group by mmsmin.mine_no,permit_info.cid,2,3,4,5,6
        having count(distinct permit_info.permit_no)<2;

	    SELECT COUNT(*) FROM etl_mine_update_screen_permittees INTO tmp_num_records;
	    RAISE NOTICE '# of permitees from valid permits with details from mmsmin: %', tmp_num_records;


	    DROP TABLE IF EXISTS etl_now_company_info_permittees;
	    CREATE TEMPORARY TABLE etl_now_company_info_permittees AS
	    SELECT
	        etl_permit_info.permit_cid              ,
	        now.str_dt ::date AS effective_date ,
	        company.cmp_nm AS permittee_name      ,
	        company.tel_no                      ,
	        company.email                       ,
	        '2'::numeric AS source
	    FROM etl_permit_info
	    INNER JOIN mms.mmsnow now ON
	        now.cid=etl_permit_info.permit_cid
	    INNER JOIN mms.mmscmp company ON
	        company.cmp_cd = now.cmp_cd;

	    SELECT COUNT(*) FROM etl_now_company_info_permittees INTO tmp_num_records;
	    RAISE NOTICE '# of permitees from valid permits with mmscmp connected through mmsnow: %', tmp_num_records;


	  	DROP TABLE IF EXISTS etl_permit_permittees;
	    create TEMPORARY TABLE etl_permit_permittees as
	    WITH
	    most_recent_permittee AS (
	        SELECT
	            cid  AS permit_cid  ,
	            max(cid_ccn) AS contact_cid
	        FROM mms.mmsccc
	        WHERE
	            SUBSTRING(type_ind, 4, 1)='Y'
	            AND
	            cid in (select permit_cid from etl_permit_info)
	        GROUP BY cid
	    )
	    SELECT
	        most_recent_permittee.permit_cid                ,
	        contact_info.add_dt ::date AS effective_date    ,
	        company_info.cmp_nm  AS permittee_name            ,
	        company_info.tel_no                             ,
	        company_info.email                              ,
	        '1'::numeric AS source
	    FROM most_recent_permittee
	    INNER JOIN mms.mmsccn contact_info ON
	        most_recent_permittee.contact_cid=contact_info.cid
	    INNER JOIN mms.mmscmp company_info ON
	    contact_info.cmp_cd=company_info.cmp_cd;



	    SELECT COUNT(*) FROM etl_permit_permittees INTO tmp_num_records;
	    RAISE NOTICE '# of permitees from valid permits with mmscmp connected through mmsccn: %', tmp_num_records;

	    DROP TABLE IF EXISTS all_permittee_info;
	    CREATE TEMPORARY TABLE all_permittee_info AS
	    SELECT * from etl_mine_update_screen_permittees
	    UNION
	    SELECT * from etl_now_company_info_permittees
	    UNION
	    SELECT * from etl_permit_permittees;
        --TODO not all permits will have permittees, should we revisit mmsmin table as last fall back?
	-- ################################################################
	-- # Determine which source is best and update permittee
	-- ################################################################

	    SELECT COUNT(*) FROM all_permittee_info INTO tmp_num_records;
	    RAISE NOTICE '# of permitees from valid permits from all sources: %', tmp_num_records;

	    DROP TABLE IF EXISTS preferred_permittee_info;
	    CREATE TEMPORARY TABLE preferred_permittee_info AS
	    SELECT DISTINCT ON (permit_cid)
	    permit_cid,
	    effective_date,
	    permittee_name,
        format_phone_number(tel_no) as tel_no,
        format_permitee_email(email) as email,
	    "source",
	    concat(permittee_name,tel_no) AS party_combo_id
	    from all_permittee_info
        where not (format_phone_number(tel_no) is null and format_permitee_email(email) is null)
	    order by permit_cid, "source" desc, effective_date desc;

	    -- Handle cases where there are multiple permits on a mine

	    SELECT COUNT(*) FROM preferred_permittee_info where source = 3 INTO tmp3;
	    SELECT COUNT(*) FROM preferred_permittee_info where source = 2 INTO tmp2;
	    SELECT COUNT(*) FROM preferred_permittee_info where source = 1 INTO tmp1;
	    RAISE NOTICE '# of prefered permittees for valid permits from mmsmin: %', tmp3;
	    RAISE NOTICE '# of prefered permittees for valid permits from mmscmp through mmsnow: %', tmp2;
	    RAISE NOTICE '# of prefered permittees for valid permits from mmsmin through mmsccn: %', tmp1;




	DROP TABLE IF EXISTS etl_all_permit_info;
	CREATE TEMPORARY TABLE etl_all_permit_info AS
	SELECT
	    gen_random_uuid() as mine_party_appt_guid,
	    --permit info
	    gen_random_uuid() as permit_amendment_guid,
	    gen_random_uuid() as permit_guid,
	    etl_permit_info.mine_guid,
	    etl_permit_info.mine_no,
	    etl_permit_info.permit_no,
	    etl_permit_info.permit_cid,
	    etl_permit_info.recv_dt as received_date,
	    COALESCE(etl_permit_info.iss_dt, etl_permit_info.appr_dt) as issue_date,
	    etl_permit_info.permit_expiry_dt as authorization_end_date,
	    etl_permit_info.sta_cd as permit_status_code,
	    --permittee info
	    ppi.source as source,
	    gen_random_uuid() as party_guid,
	    ppi.party_combo_id as party_combo_id,
	    format_permittee_first_name(ppi.permittee_name) as first_name,
	    format_permittee_party_name(ppi.permittee_name) as party_name,
	    permitee_party_type(ppi.permittee_name) as party_type,
	    ppi.tel_no as phone_no,
	    ppi.email as email,
	    ppi.effective_date as effective_date,
	    CASE
	        WHEN etl_permit_info.permit_cid NOT IN (
	            SELECT ETL_PERMIT.permit_cid
	            FROM ETL_PERMIT
	        )
	        THEN TRUE
	        ELSE FALSE
	    END AS new_permit,
	    CASE
	        WHEN ppi.party_combo_id NOT IN (
	            SELECT ETL_PERMIT.party_combo_id
	            FROM ETL_PERMIT
	        )
	        THEN TRUE
	        ELSE FALSE
	    END AS new_permittee
	FROM
	    etl_permit_info
	    LEFT JOIN preferred_permittee_info ppi
	        on etl_permit_info.permit_cid = ppi.permit_cid;

	   SELECT COUNT(*) into tmp1 FROM etl_all_permit_info;
	   SELECT COUNT(*) INTO tmp2 FROM etl_all_permit_info where new_permit = true;
	   SELECT COUNT(*) INTO tmp3 FROM etl_all_permit_info where new_permittee = true;
	   RAISE NOTICE '# of etl_all_permit_info records: %', tmp1;
	   RAISE NOTICE '# of etl_all_permit_info records tagged as new permits: %', tmp2;
	   RAISE NOTICE '# of etl_all_permit_info records tagged as new permittees: %', tmp3;

	  end;

	-- ################################################################
	-- # Update existing records in ETL_PERMIT
	-- ################################################################

	UPDATE ETL_PERMIT
	SET
	    --permit info
	    mine_no                = info.mine_no               ,
	    permit_no              = info.permit_no             ,
	    received_date          = info.received_date         ,
	    issue_date             = info.issue_date            ,
	    authorization_end_date = info.authorization_end_date,
	    permit_status_code     = info.permit_status_code    ,
	    --permittee info
	    source                 = info.source                ,
	    party_combo_id         = info.party_combo_id        ,
	    first_name             = info.first_name            ,
	    party_name             = info.party_name            ,
	    party_type             = info.party_type            ,
	    phone_no               = info.phone_no              ,
	    email                  = info.email                 ,
	    effective_date         = info.effective_date
	FROM etl_all_permit_info info
	    WHERE
	    ETL_PERMIT.mine_guid = info.mine_guid
	    AND
	    ETL_PERMIT.party_combo_id = info.party_combo_id
	    AND
	    ETL_PERMIT.permit_no = info.permit_no;

	-- ################################################################
	-- # Insert new records into ETL_PERMIT
	-- ################################################################

	INSERT INTO ETL_PERMIT(
	    mine_party_appt_guid,
	    --permit info
	    permit_guid           ,
	    permit_amendment_guid ,
	    source                ,
	    mine_guid             ,
	    mine_no               ,
	    permit_no             ,
	    permit_cid            ,
	    received_date         ,
	    issue_date            ,
	    authorization_end_date,
	    permit_status_code    ,
	    --permittee info
	    party_combo_id        ,
	    party_guid            ,
	    first_name            ,
	    party_name            ,
	    party_type            ,
	    phone_no              ,
	    email                 ,
	    effective_date
	)
	SELECT
	    gen_random_uuid()          ,
	    --permit info
	    info.permit_guid           ,
	    info.permit_amendment_guid ,
	    info.source                ,
	    info.mine_guid             ,
	    info.mine_no               ,
	    info.permit_no             ,
	    info.permit_cid            ,
	    info.received_date         ,
	    info.issue_date            ,
	    info.authorization_end_date,
	    info.permit_status_code    ,
	    --permittee info
	    info.party_combo_id        ,
	    info.party_guid            ,
	    info.first_name            ,
	    info.party_name            ,
	    info.party_type            ,
	    info.phone_no              ,
	    info.email                 ,
	    info.effective_date        
	FROM etl_all_permit_info info
	WHERE
	    info.new_permit = TRUE
	    OR
	    info.new_permittee = TRUE;


	-- ################################################################
	-- # Update permit records with the newest version in the MMS data
	-- ################################################################

	UPDATE permit
	SET
	    update_user            = 'mms_migration'       ,
	    update_timestamp       = now()                 ,
	    permit_status_code     = etl.permit_status_code
	FROM ETL_PERMIT etl
		INNER JOIN mine_permit_xref mpx on etl.mine_guid=mpx.mine_guid
	WHERE permit.permit_guid = etl.permit_guid
	AND
		(issue_date = (select max(issue_date) from ETL_PERMIT where etl.permit_no = ETL_PERMIT.permit_no)
		OR
		received_date = (select max(received_date) from ETL_PERMIT where etl.permit_no = ETL_PERMIT.permit_no));


	-- ################################################################
	-- # Update permit amendment records with the newest version in the MMS data
	-- ################################################################

	UPDATE permit_amendment
	SET
	    received_date          = etl.received_date         ,
	    issue_date             = etl.issue_date            ,
	    update_user            = 'mms_migration'           ,
	    update_timestamp       = now()                     ,
	    authorization_end_date = etl.authorization_end_date
	FROM ETL_PERMIT etl
	WHERE
	    permit_amendment.permit_amendment_guid = etl.permit_amendment_guid;


	-- ################################################################
	-- # Insert new permits
	-- ################################################################

	WITH
	new_permits AS (
	    SELECT DISTINCT permit_no, MIN(permit_status_code) as permit_status_code
	    FROM ETL_PERMIT etl
	    WHERE (permit_no) NOT IN (
	        SELECT permit_no
	        FROM permit
	    )
	    AND
		(issue_date = (select max(issue_date) from ETL_PERMIT where etl.permit_no = ETL_PERMIT.permit_no)
		OR
		received_date = (select max(received_date) from ETL_PERMIT where etl.permit_no = ETL_PERMIT.permit_no))

	    GROUP BY permit_no
	)
	INSERT INTO permit (
	    permit_guid         ,
	    permit_no           ,
	    permit_status_code  ,
	    create_user         ,
	    create_timestamp    ,
	    update_user         ,
	    update_timestamp
	)
	SELECT
	    gen_random_uuid() as permit_guid,
	    new_permits.permit_no           ,
	    new_permits.permit_status_code  ,
	    'mms_migration'                ,
	    now()                          ,
	    'mms_migration'                ,
	    now()
	FROM new_permits;



	-- # ################################################################
	-- # # Insert new permits into the mine permit xref
	-- # ################################################################

	INSERT INTO mine_permit_xref (
	    mine_guid, permit_id, create_user, create_timestamp , update_user, update_timestamp
	)
	SELECT distinct mine_guid		   ,
	    permit.permit_id 			   ,
	    'mms_migration'                ,
	    now()                          ,
	    'mms_migration'                ,
	    now()
	from permit LEFT JOIN ETL_PERMIT  on permit.permit_no = ETL_PERMIT.permit_no
	WHERE (mine_guid, permit_id) NOT IN (SELECT mine_guid, permit_id FROM mine_permit_xref);


	-- # ################################################################
	-- # # Update ETL_PERMIT permit_guids from the newly entered permits.
	-- # ################################################################

	UPDATE ETL_PERMIT SET permit_guid =
	(select permit_guid from permit
	inner join mine_permit_xref on permit.permit_id = mine_permit_xref.permit_id
	WHERE ETL_PERMIT.permit_no=permit.permit_no and ETL_PERMIT.mine_guid = mine_permit_xref.mine_guid limit 1)
	where permit_amendment_guid NOT IN (
	    SELECT permit_amendment_guid
	    FROM permit_amendment
	);


	-- ################################################################
	-- # Insert new permit amendments.
	-- ################################################################
	WITH
	new_permit_amendments AS (
		SELECT distinct ETL_PERMIT.*
	    FROM permit JOIN ETL_PERMIT on permit.permit_guid = ETL_PERMIT.permit_guid
	    WHERE permit_amendment_guid NOT IN (
	        SELECT permit_amendment_guid
	        FROM permit_amendment
	    )

	), original_permits AS (
	    SELECT
	        permit_amendment_guid
	    FROM
	        (SELECT
	            permit_no, mine_guid, MIN(issue_date) AS min_issue_date
	        FROM
	            ETL_PERMIT
	        GROUP BY
	            permit_no, mine_guid) AS tmp
	    INNER JOIN
	        ETL_PERMIT
	    ON
	        ETL_PERMIT.permit_no = tmp.permit_no AND
	        ETL_PERMIT.mine_guid = tmp.mine_guid AND
	        ETL_PERMIT.issue_date = tmp.min_issue_date
	)
	INSERT INTO permit_amendment (
	    permit_id              			,
	    permit_amendment_guid           ,
	    mine_guid						,
	    received_date          			,
	    issue_date             			,
	    authorization_end_date 			,
	    permit_amendment_type_code      ,
	    permit_amendment_status_code    ,
	    create_user            			,
	    create_timestamp       			,
	    update_user            			,
	    update_timestamp
	)
	SELECT
	    permit.permit_id				         	,
	    new_permit_amendments.permit_amendment_guid ,
	    new_permit_amendments.mine_guid 			,
	    new_permit_amendments.received_date       	,
	    new_permit_amendments.issue_date          	,
	    new_permit_amendments.authorization_end_date,
	    CASE WHEN original_permits.permit_amendment_guid IS NOT NULL THEN 'OGP' ELSE 'AMD' END,
	    'ACT'										,
	    'mms_migration'                				,
	    now()                          				,
	    'mms_migration'                				,
	    now()
	FROM new_permit_amendments
		JOIN permit ON new_permit_amendments.permit_guid = permit.permit_guid
		LEFT JOIN original_permits ON new_permit_amendments.permit_amendment_guid = original_permits.permit_amendment_guid;



	-- ################################################################
	-- # Update existing parties from ETL_PERMIT
	-- ################################################################

	UPDATE party
	SET
	    first_name       = etl.first_name            ,
	    party_name       = etl.party_name            ,
	    phone_no         = etl.phone_no              ,
	    email            = etl.email                 ,
	    update_user      = 'mms_migration'           ,
	    update_timestamp = now()                     ,
	    party_type_code  = etl.party_type
	FROM ETL_PERMIT etl
	WHERE party.party_guid = etl.party_guid
	AND (
	    party.first_name != etl.first_name
	    OR party.party_name != etl.party_name
	    OR party.phone_no != etl.phone_no
	    OR party.email != etl.email
	    OR party.party_type_code != etl.party_type
	   );


	-- ################################################################
	-- # Add new parties from ETL_PERMIT
	-- ################################################################


	WITH new_parties AS (
	    SELECT DISTINCT ON (party_guid)
	        party_guid            ,
	        first_name            ,
	        party_name            ,
	        phone_no              ,
	        email                 ,
	        effective_date        ,
	        authorization_end_date,
	        party_type
	    FROM ETL_PERMIT
	    WHERE party_guid NOT IN (
	        SELECT  party_guid
	        FROM    party
	    )
	)
	INSERT INTO party (
	    party_guid                          ,
	    first_name                          ,
	    party_name                          ,
	    phone_no                            ,
	    email                               ,
	    create_user                         ,
	    create_timestamp                    ,
	    update_user                         ,
	    update_timestamp                    ,
	    party_type_code
	)
	SELECT
	    party_guid                           ,
	    first_name                           ,
	    party_name                           ,
	    phone_no                             ,
	    email                                ,
	    'mms_migration'                      ,
	    now()                                ,
	    'mms_migration'                      ,
	    now()                                ,
	    party_type
	FROM new_parties
	where party_name is not null;


	-- ################################################################
	-- # Add new parties from ETL_PERMIT
	-- ################################################################

	-- Not ideal, but no point changing this logic at this point:
	DELETE FROM mine_party_appt
	WHERE
	    -- Only records known to ETL_PERMIT
	    mine_party_appt_type_code = 'PMT'
	    -- Only on mines in ETL process
	AND
	    permit_id IN (
	        SELECT p.permit_id
	        FROM permit p 
			inner join ETL_PERMIT etlp on p.permit_guid = etlp.permit_guid
			inner join ETL_MINE etlm on etlp.mine_guid = etlm.mine_guid
	        WHERE etlm.major_mine_ind = 'f'
	    );



	INSERT INTO mine_party_appt (
	    mine_party_appt_guid     ,
	    permit_id              ,
	    party_guid               ,
	    mine_guid                ,
	    mine_party_appt_type_code,
	    create_user              ,
	    create_timestamp         ,
	    update_user              ,
	    update_timestamp         ,
	    start_date               ,
	    end_date                 ,
	    processed_by             ,
	    processed_on
	)
	SELECT
	    ETL_PERMIT.mine_party_appt_guid,
	    mpx.permit_id                  ,
	    ETL_PERMIT.party_guid          ,
	    null		                   , --Permittees are not related to the mine.
	    'PMT'                          ,
	    'mms_migration'                ,
	    now()                          ,
	    'mms_migration'                ,
	    now()                          ,
	    issue_date                     ,
	    authorization_end_date         ,
	    'mms_migration'                ,
	    now()
	FROM ETL_PERMIT
	INNER JOIN ETL_MINE ON
	    ETL_PERMIT.mine_guid = ETL_MINE.mine_guid
	inner join permit p on
	    p.permit_guid = ETL_PERMIT.permit_guid
	inner join permit p2 on
	    p.permit_no = p2.permit_no
	inner join mine_permit_xref mpx on
	    p2.permit_id = mpx.permit_id
	WHERE EXISTS (
	    SELECT party_guid
	    FROM party
	    WHERE ETL_PERMIT.party_guid = party.party_guid
	);

END;
$$ LANGUAGE PLPGSQL;