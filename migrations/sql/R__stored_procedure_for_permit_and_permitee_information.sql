CREATE OR REPLACE FUNCTION transfer_permit_permitee_information() RETURNS void AS $$
    BEGIN
        DECLARE
            company_keyword_special varchar := '[-!0-9@#$&()`+/\"]
                |Mining|Mineral|Resources|National|Regional|Energy|Products
                | and | of |Pacific|Metal|Canada|Canadian|Engineering|Mountain|Lake';
            --case sensitive keyword
            company_keyword_cs  varchar :='Corp|Inc|Expl|Mine|INC|South|North|West';
            --case insensitive keyword
            company_keyword_ci  varchar :='ltd|limited|co.|holdings
                |Contracting|llp|Consultants|Enterprise|service|city
                |ulc|Association|Partnership|Trucking|Property|Division|Industries|Developments';
            old_row    integer;
            insert_row integer;
            update_row integer;
            total_row  integer;
        BEGIN
            RAISE NOTICE 'Start updating mine permit info:';
            RAISE NOTICE '.. Step 1 of 4: Scan permit info in MMS';
            -- This is the intermediary table that will be used to store mine permit and permittee info from the MMS database.
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
            SELECT count(*) FROM ETL_PERMIT into old_row;

            CREATE TEMP TABLE IF NOT EXISTS all_permit_info (
                mine_party_appt_guid uuid                    ,
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
                effective_date         date                  ,
                new_permit             boolean               ,
                new_permittee          boolean
            );

            CREATE INDEX ON all_permit_info (permit_cid);
            CREATE INDEX ON all_permit_info (party_combo_id);

            -- Populate temp table
            RAISE NOTICE '.. Aggregate all permit info';
            WITH
            -- Filter on permit records; Select only the records:
            ---- with valid permit status (closed:z or approved: a)
            ---- AND with non-empty permit number
            permit_list AS (
                SELECT
                    mine_no||permit_no||recv_dt||iss_dt AS combo_id,
                    max(cid) permit_cid
                FROM mms.mmspmt permit_info
                WHERE
                    (sta_cd ~* 'z'  OR sta_cd ~* 'a')
                    AND
                    ((permit_no !~ '^ *$' AND  permit_no IS NOT NULL))
                GROUP BY combo_id
            ),
            permit_info AS (
                SELECT
                    ETL_MINE.mine_guid                                       ,
                    permit_info.mine_no                                      ,
                    permit_info.permit_no                                    ,
                    permit_info.cid AS permit_cid                            ,
                    permit_info.recv_dt as recv_dt                           ,
                    permit_info.iss_dt as iss_dt                             ,
                    (SELECT end_dt
                            FROM mms.mmsnow
                            WHERE mms.mmsnow.cid = permit_info.cid
                    ) as permit_expiry_dt                                    ,
                    CASE permit_info.sta_cd
                        WHEN 'Z' THEN 'C' --closed
                        ELSE 'O' --open
                    END AS sta_cd                                           ,
                    permit_info.upd_no
                FROM mms.mmspmt permit_info
                INNER JOIN ETL_MINE ON ETL_MINE.mine_no = permit_info.mine_no
                WHERE permit_info.cid IN (
                    SELECT permit_cid
                    FROM permit_list
                )
            ),
            --Permittee source 1: From company info documented in attached contact in NoW
            --Number of attached contact for each record in permit_list
            permit_contact_list AS(
                SELECT
                    id_ref.cid AS permit_cid    ,
                    count(cid_ccn) AS contact_number
                FROM mms.mmsccc id_ref
                WHERE cid IN (
                    SELECT permit_cid
                    FROM permit_list
                )
                GROUP BY id_ref.cid
            ),
            --For permit record with more than 1 attached contact
            --Select the contact indicated as Permittee
            --If more than 1 contact is indicated as permittee
            --Select the one with maximum contact id (cid_ccn)
            permit_with_multi_contact AS (
                SELECT permit_cid
                FROM  permit_contact_list
                WHERE permit_contact_list.contact_number>1
            ),
            permittee_selection AS (
                SELECT
                    cid  AS permit_cid  ,
                    max(cid_ccn) AS contact_cid
                FROM mms.mmsccc id_ref
                WHERE
                    SUBSTRING(id_ref.type_ind, 4, 1)='Y'
                    AND
                    cid IN (
                        SELECT permit_cid
                        FROM  permit_contact_list
                        WHERE permit_contact_list.contact_number>1
                    )
                GROUP BY cid
            ),
            --The rest are either with multiple attached contact but non of them
            --are marked as permittee, or with only one attached contact.
            permittee_default_list AS (
                SELECT permit_cid
                FROM permit_contact_list
                WHERE permit_cid NOT IN (
                    SELECT permit_cid
                    FROM permittee_selection
                )
            ),
            permittee_default AS (
                SELECT
                    id_ref.cid AS permit_cid    ,
                    max(id_ref.cid_ccn) AS contact_cid
                FROM mms.mmsccc id_ref
                WHERE cid IN (
                    SELECT permit_cid
                    FROM permittee_default_list
                )
                GROUP BY id_ref.cid
            ),
            --List of permit-permittee id reference
            permit_attached_permittee_list AS (
                SELECT *
                FROM permittee_selection
                UNION
                SELECT *
                FROM permittee_default
            ),
            --List of permittee info from attached contact
            permittee_from_attached_contact AS (
                SELECT
                    permittee_list.permit_cid                       ,
                    contact_info.add_dt ::date AS effective_date    ,
                    company_info.cmp_nm  AS permittee_nm            ,
                    company_info.tel_no                             ,
                    company_info.email                              ,
                    '1'::numeric AS source
                FROM permit_attached_permittee_list permittee_list
                INNER JOIN mms.mmsccn contact_info ON
                    permittee_list.contact_cid=contact_info.cid
                INNER JOIN mms.mmscmp company_info ON
                    contact_info.cmp_cd=company_info.cmp_cd
            ),
            -- Permittee source 2: From company info documented in NoW
            -- Use source 2 for permit record with no permittee contact attached
            permit_list_no_attached_permittee AS (
                SELECT
                    permit_cid
                FROM permit_list
                WHERE permit_cid NOT IN (
                    SELECT permit_cid
                    FROM  permittee_from_attached_contact
                )
            ),
            permittee_from_now_company_info AS (
                SELECT
                    permit_list.permit_cid              ,
                    now.str_dt ::date AS effective_date ,
                    company.cmp_nm AS permittee_nm      ,
                    company.tel_no                      ,
                    company.email                       ,
                    '2'::numeric AS source
                FROM permit_list_no_attached_permittee permit_list
                INNER JOIN mms.mmsnow now ON
                    now.cid=permit_list.permit_cid
                INNER JOIN mms.mmscmp company ON
                    company.cmp_cd = now.cmp_cd
            ),
            -- Permittee source 3: Current permittee from mine_info (mms.mmsmin)
            -- If permit record has no permittee attached or cmp_name in its Now
            -- Use current permittee by default extracted from the mine_info
            permit_list_others AS (
                SELECT permit_cid
                FROM permit_list
                EXCEPT
                (
                    SELECT permit_cid
                    FROM permittee_from_now_company_info
                    UNION
                    SELECT permit_cid
                    FROM permittee_from_attached_contact
                )
            ),
            permittee_from_mine_info AS (
                SELECT
                    permit_info.permit_cid  ,
                    CASE
                        WHEN mine_info.entered_date ~ 'XXXX/XX/XX'
                        THEN current_date
                        ELSE to_date(mine_info.entered_date, 'YYYY/MM/DD')
                    END AS effective_date,
                    mine_info.cmp_nm AS permittee_nm    ,
                    mine_info.ctel_no AS tel_no         ,
                    mine_info.cemail AS email           ,
                    '3'::numeric AS source
                FROM permit_info
                INNER JOIN mms.mmsmin mine_info ON
                    mine_info.mine_no = permit_info.mine_no
                WHERE permit_info.permit_cid IN
                    (
                        SELECT permit_cid
                        FROM  permit_list_others
                    )
            ),
            --Combine permittee info extracted from all 3 source
            permittee_info AS (
                SELECT * FROM permittee_from_attached_contact
                UNION
                SELECT * FROM permittee_from_now_company_info
                UNION
                SELECT * FROM permittee_from_mine_info
            ),
            --Add party_combo_id
            permittee_info_wCombo AS (
                SELECT
                    permit_cid      ,
                    effective_date  ,
                    permittee_nm    ,
                    tel_no          ,
                    email           ,
                    source          ,
                    concat(permittee_nm,tel_no) AS party_combo_id
                FROM permittee_info
            ),
            --New record in MMS that does not exist in MDS ETL table
            permittee_record AS (
                SELECT
                    DISTINCT ON (party_combo_id)
                    gen_random_uuid() AS party_guid,
                    party_combo_id  ,
                    effective_date  ,
                    permittee_nm    ,
                    tel_no          ,
                    email           ,
                    source
                FROM permittee_info_wCombo

            ),
            --Formatting permittee name
            permittee_org AS (
                SELECT
                    party_combo_id            ,
                    party_guid                ,
                    NULL AS first_name        ,
                    permittee_nm AS party_name,
                    'ORG' ::text AS party_type
                FROM permittee_record
                WHERE
                    permittee_nm ~* company_keyword_special
                    OR
                    permittee_nm ~ company_keyword_cs
                    OR
                    permittee_nm ~* company_keyword_ci
            ),
            permittee_person AS (
                SELECT
                    party_combo_id  ,
                    party_guid      ,
                    CASE
                        WHEN permittee_nm ~ ','
                        THEN split_part(permittee_nm,', ',1 )
                        WHEN permittee_nm ~ ' '
                        THEN split_part(permittee_nm,' ', 1 )
                        ELSE NULL
                    END AS first_name,
                    CASE
                        WHEN permittee_nm ~ ','
                        THEN COALESCE(NULLIF(regexp_replace
                        (
                            trim(leading from permittee_nm, split_part(permittee_nm,',', 1 )||', '),
                            ' ', '', 'b'),''),'N/A'
                        )
                        WHEN permittee_nm ~ ' '
                        THEN COALESCE(NULLIF(regexp_replace
                        (
                            trim(leading from permittee_nm, split_part(permittee_nm,' ',1 )||' '),
                            ' ', '', 'b'),''),'N/A'
                        )
                        ELSE permittee_nm
                    END AS party_name,
                    'PER' ::text AS party_type
                FROM permittee_record
                WHERE party_combo_id NOT IN (
                    SELECT party_combo_id
                    FROM permittee_org
                )
            ),
            permittee_name_and_type AS (
                SELECT
                    party_combo_id     ,
                    party_guid         ,
                    first_name::varchar,
                    party_name         ,
                    party_type
                FROM permittee_org
                UNION
                SELECT * FROM permittee_person

            ),
            --Extract only the numbers in phone info field, get rid of special char such as '()'
            permittee_contact_phone_format AS(
                SELECT
                    party_combo_id,
                    NULLIF(regexp_replace(tel_no, '\D', '','g'),'')::numeric phone_no,
                    email
                FROM permittee_record
            ),
            --Format bad phone data, get rid of country code, filter out invalid phone number such as 999999999
            permittee_contact_filter AS(
                SELECT
                    party_combo_id,
                    CASE
                        WHEN phone_no>=10^10 AND phone_no<2*10^10 THEN (phone_no-10^10 )::varchar
                        WHEN phone_no>10^9 AND phone_no<10^10 THEN (phone_no)::varchar
                        ELSE 'Unknown'
                    END AS phone_no,
                    email
                FROM permittee_contact_phone_format
            ),
            --Format phone and email in MDS syntax
            permittee_contact AS (
                SELECT
                    party_combo_id,
                    CASE
                        WHEN filtered.phone_no = 'Unknown' THEN filtered.phone_no
                        ELSE
                            SUBSTRING(filtered.phone_no from 1 for 3)||'-'||
                            SUBSTRING(filtered.phone_no from 4 for 3)||'-'||
                            SUBSTRING(filtered.phone_no from 7 for 4)
                    END AS phone_no,
                    COALESCE(NULLIF(regexp_replace(filtered.email,' ', '', 'g'),''),'Unknown') email
                FROM permittee_contact_filter filtered
            ),
            --Combine the formatted contact info for records
            permittee_wContact AS (
                SELECT
                    permittee.permit_cid             ,
                    permittee.party_combo_id         ,
                    permittee.source                 ,
                    name_and_type.party_guid         ,
                    name_and_type.first_name         ,
                    name_and_type.party_name         ,
                    name_and_type.party_type         ,
                    contact.phone_no                 ,
                    contact.email                    ,
                    COALESCE(permittee.effective_date , now()) AS effective_date
                FROM permittee_info_wCombo permittee
                INNER JOIN permittee_name_and_type name_and_type ON
                    name_and_type.party_combo_id=permittee.party_combo_id
                INNER JOIN permittee_contact contact ON
                    contact.party_combo_id=permittee.party_combo_id
            )
            INSERT INTO all_permit_info (
                mine_party_appt_guid  ,
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
                party_guid            ,
                party_combo_id        ,
                first_name            ,
                party_name            ,
                party_type            ,
                phone_no              ,
                email                 ,
                effective_date        ,
                new_permit            ,
                new_permittee
            )
            SELECT
                gen_random_uuid()            ,
                --permit info
                gen_random_uuid()            ,
                gen_random_uuid()            ,
                permittee_info.source        ,
                permit_info.mine_guid        ,
                permit_info.mine_no          ,
                permit_info.permit_no        ,
                permit_info.permit_cid       ,
                permit_info.recv_dt          ,
                permit_info.iss_dt           ,
                permit_info.permit_expiry_dt ,
                permit_info.sta_cd           ,
                --permittee info
                permittee_info.party_guid    ,
                permittee_info.party_combo_id,
                permittee_info.first_name    ,
                permittee_info.party_name    ,
                permittee_info.party_type    ,
                permittee_info.phone_no      ,
                permittee_info.email         ,
                permittee_info.effective_date,
                CASE
                    WHEN permit_info.permit_cid NOT IN (
                        SELECT ETL_PERMIT.permit_cid
                        FROM ETL_PERMIT
                    )
                    THEN TRUE
                    ELSE FALSE
                END AS new_permit           ,
                CASE
                    WHEN permittee_info.party_combo_id NOT IN (
                        SELECT ETL_PERMIT.party_combo_id
                        FROM ETL_PERMIT
                    )
                    THEN TRUE
                    ELSE FALSE
                END AS new_permittee
            FROM permit_info
            INNER JOIN permittee_wContact permittee_info ON
                permittee_info.permit_cid = permit_info.permit_cid
            WHERE permit_info.permit_no not in (
                select permit_no from permit p
                join mine m on p.mine_guid=m.mine_guid
                where m.major_mine_ind = true
                );


            -- Update existing records
            RAISE NOTICE '.. Update existing ETL_PERMIT records';
            WITH updated_rows AS (
                UPDATE ETL_PERMIT
                SET
                    --permit info
                    source                 = info.source                ,
                    mine_no                = info.mine_no               ,
                    permit_no              = info.permit_no             ,
                    received_date          = info.received_date         ,
                    issue_date             = info.issue_date            ,
                    authorization_end_date = info.authorization_end_date,
                    permit_status_code     = info.permit_status_code    ,
                    --permittee info
                    party_combo_id         = info.party_combo_id        ,
                    first_name             = info.first_name            ,
                    party_name             = info.party_name            ,
                    party_type             = info.party_type            ,
                    phone_no               = info.phone_no              ,
                    email                  = info.email                 ,
                    effective_date         = info.effective_date
                FROM all_permit_info info
                WHERE
                    ETL_PERMIT.mine_guid = info.mine_guid
                    AND
                    ETL_PERMIT.party_guid = info.party_guid
                    AND
                    ETL_PERMIT.permit_guid = info.permit_guid
                RETURNING 1
            )
            SELECT COUNT(*) FROM updated_rows INTO update_row;
            RAISE NOTICE '....# of records in ETL_PERMIT: %', old_row;
            RAISE NOTICE '....# of records updated in ETL_PERMIT: %', update_row;

            RAISE NOTICE '.. Insert new records into ETL_PERMIT';
            WITH inserted_rows AS (
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
                FROM all_permit_info info
                WHERE
                    info.new_permit = TRUE
                    AND
                    info.new_permittee = TRUE
                RETURNING 1
            )
            SELECT count(*) FROM inserted_rows INTO insert_row;
            SELECT count(*) FROM ETL_PERMIT INTO total_row;
            RAISE NOTICE '.... # of new permit records loaded into ETL_PERMIT: %', insert_row;
            RAISE NOTICE '....Total records in ETL_PERMIT: %.', total_row;

            DROP TABLE IF EXISTS all_permit_info;
        END;

        DECLARE
            old_row  integer;
            update_row integer;
            insert_row integer;
            total_row  integer;
            old_amendment_row  integer;
            update_amendment_row integer;
            insert_amendment_row integer;
            total_amendment_row  integer;
        BEGIN
            RAISE NOTICE '.. Step 2 of 4: Update permit info in MDS';
            SELECT count(*) FROM permit INTO old_row;
            SELECT count(*) FROM permit_amendment INTO old_amendment_row;
			
            RAISE NOTICE '.. Update ETL_PERMIT and all_permit_info with permit_guids for new amendments that may be for an existing permit';
			UPDATE ETL_PERMIT SET permit_guid = (select permit_guid from permit WHERE ETL_PERMIT.permit_no=permit.permit_no and ETL_PERMIT.mine_guid = permit.mine_guid limit 1)
			where permit_amendment_guid NOT IN (
				SELECT permit_amendment_guid
				FROM permit_amendment
				);

            -- Upsert permit data from ETL_PERMIT
            RAISE NOTICE '.. Update existing permit records with latest MMS data';
            WITH updated_rows AS (
            UPDATE permit
            SET
                update_user            = 'mms_migration'           ,
                update_timestamp       = now()                     ,
                permit_status_code     = etl.permit_status_code
            FROM ETL_PERMIT etl
            WHERE
                permit.mine_guid = etl.mine_guid
                AND
                permit.permit_guid = etl.permit_guid
				AND
				issue_date = (select max(issue_date) from ETL_PERMIT where etl.permit_no = ETL_PERMIT.permit_no)
            RETURNING 1
            )
            SELECT COUNT(*) FROM updated_rows INTO update_row;
            RAISE NOTICE '....# of records in permit: %', old_row;
            RAISE NOTICE '....# of records updated in permit: %', update_row;

            -- Upsert permit amendment data from ETL_PERMIT
            RAISE NOTICE '.. Update existing permit amendment records with latest MMS data';
            WITH updated_rows AS (
            UPDATE permit_amendment
            SET
                received_date          = etl.received_date         ,
                issue_date             = etl.issue_date            ,
                update_user            = 'mms_migration'           ,
                update_timestamp       = now()                     ,
                authorization_end_date = etl.authorization_end_date
            FROM ETL_PERMIT etl
            WHERE
                permit_amendment.permit_amendment_guid = etl.permit_amendment_guid
            RETURNING 1
            )
            SELECT COUNT(*) FROM updated_rows INTO update_amendment_row;
            RAISE NOTICE '....# of records in permit: %', old_amendment_row;
            RAISE NOTICE '....# of records updated in permit: %', update_amendment_row;

            RAISE NOTICE '.. Insert new MMS ETL_PERMIT records into permit';
            WITH
            --Select only new entry in ETL_PERMIT table
            new_permit AS (
                SELECT DISTINCT mine_guid, permit_no, permit_status_code
                FROM ETL_PERMIT etl
                WHERE permit_guid NOT IN (
                    SELECT permit_guid
                    FROM permit
                )
				AND issue_date = (select max(issue_date) from ETL_PERMIT where etl.permit_no = ETL_PERMIT.permit_no and etl.mine_guid = ETL_PERMIT.mine_guid)
            ), inserted_rows AS (
                INSERT INTO permit (
                    permit_guid         ,
                    mine_guid           ,
                    permit_no           ,
                    permit_status_code  ,
                    create_user         ,
                    create_timestamp    ,
                    update_user         ,
                    update_timestamp
                )
                SELECT
                    gen_random_uuid() as permit_guid,
                    new_permit.mine_guid           ,
                    new_permit.permit_no           ,
                    new_permit.permit_status_code  ,
                    'mms_migration'                ,
                    now()                          ,
                    'mms_migration'                ,
                    now()
                FROM new_permit
                INNER JOIN ETL_MINE ON
                    new_permit.mine_guid = ETL_MINE.mine_guid
                RETURNING 1
            )
            SELECT COUNT(*) FROM inserted_rows INTO insert_row;

            RAISE NOTICE '.. Update ETL_PERMIT and all_permit_info with newly inserted permit_guids for new amendments';
			UPDATE ETL_PERMIT SET permit_guid = (select permit_guid from permit WHERE ETL_PERMIT.permit_no=permit.permit_no and ETL_PERMIT.mine_guid = permit.mine_guid limit 1)
			where permit_amendment_guid NOT IN (
				SELECT permit_amendment_guid
				FROM permit_amendment
				);


            RAISE NOTICE '.. Insert new MMS ETL_PERMIT records into permit amendment';
            WITH
            --Select only new entry in ETL_PERMIT table
            new_permit_amendment AS (
                SELECT *
                FROM ETL_PERMIT
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
					 permit_no, mine_guid) AS original_permits
				INNER JOIN
				  ETL_PERMIT
				ON
				  ETL_PERMIT.permit_no = original_permits.permit_no AND
				  ETL_PERMIT.mine_guid = original_permits.mine_guid AND
				  ETL_PERMIT.issue_date = original_permits.min_issue_date
			), inserted_rows AS (
                INSERT INTO permit_amendment (
                    permit_id              			,
                    permit_amendment_guid           ,
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
                    new_permit_amendment.permit_amendment_guid  ,
                    new_permit_amendment.received_date       	,
                    new_permit_amendment.issue_date          	,
                    new_permit_amendment.authorization_end_date	,
					CASE WHEN original_permits.permit_amendment_guid IS NOT NULL THEN 'OGP' ELSE 'AMD' END,
					'ACT'										,
                    'mms_migration'                				,
                    now()                          				,
                    'mms_migration'                				,
                    now()
                FROM new_permit_amendment
                INNER JOIN permit ON
                    new_permit_amendment.permit_guid = permit.permit_guid
				LEFT JOIN original_permits ON new_permit_amendment.permit_amendment_guid = original_permits.permit_amendment_guid
                RETURNING 1
            )
            SELECT COUNT(*) FROM inserted_rows INTO insert_amendment_row;


            SELECT COUNT(*) FROM permit INTO total_row;
            SELECT COUNT(*) FROM permit_amendment INTO total_amendment_row;
            RAISE NOTICE '.... # of new permit records loaded into MDS: %', insert_row;
            RAISE NOTICE '.... # of total permit records in MDS: %', total_row;
            RAISE NOTICE '.... # of new permit amendment records loaded into MDS: %', insert_amendment_row;
            RAISE NOTICE '.... # of total permit amendment records in MDS: %', total_amendment_row;
        END;

        DECLARE
            old_row  integer;
            update_row integer;
            insert_row integer;
            total_row  integer;
        BEGIN
            RAISE NOTICE '.. Step 3 of 4: Update party info';
            SELECT count(*) FROM party INTO old_row;


            -- Upsert permit data from ETL_PERMIT
            RAISE NOTICE '.. Update existing records with latest MMS data';
            WITH updated_rows AS (
            UPDATE party
            SET
                first_name       = etl.first_name            ,
                party_name       = etl.party_name            ,
                phone_no         = etl.phone_no              ,
                email            = etl.email                 ,
                effective_date   = etl.effective_date        ,
                expiry_date      = authorization_end_date    ,
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
                OR party.effective_date != etl.effective_date
                OR party.party_type_code != etl.party_type
            )
            RETURNING 1
            )
            SELECT COUNT(*) FROM updated_rows INTO update_row;
            RAISE NOTICE '....# of records in party: %', old_row;
            RAISE NOTICE '....# of records updated in party: %', update_row;

            RAISE NOTICE '.. Insert new MMS ETL_PERMIT records into party';
            WITH
            --Select only new entry in ETL_PERMIT table
            new_party AS (
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
            ), inserted_rows AS (
                INSERT INTO party (
                    party_guid       ,
                    first_name       ,
                    party_name       ,
                    phone_no         ,
                    email            ,
                    effective_date   ,
                    expiry_date      ,
                    create_user      ,
                    create_timestamp ,
                    update_user      ,
                    update_timestamp ,
                    -- ignore middle name as such info does not exist in MMS
                    party_type_code
                )
                SELECT
                    party_guid                           ,
                    first_name                           ,
                    party_name                           ,
                    phone_no                             ,
                    email                                ,
                    effective_date                       ,
                    authorization_end_date as expiry_date,
                    'mms_migration'                      ,
                    now()                                ,
                    'mms_migration'                      ,
                    now()                                ,
                    party_type
                FROM new_party
                RETURNING 1
            )
            SELECT COUNT(*) FROM inserted_rows INTO insert_row;
            SELECT COUNT(*) FROM party INTO total_row;
            RAISE NOTICE '.... # of new party records loaded into MDS: %', insert_row;
            RAISE NOTICE '.... # of total party records in MDS: %', total_row;
        END;

        DECLARE
            old_row    integer;
            update_row integer;
            insert_row integer;
            delete_row integer;
            total_row  integer;
        BEGIN
            RAISE NOTICE '.. Step 4 of 4: Update party_appt info';
            SELECT count(*) FROM mine_party_appt INTO old_row;

            RAISE NOTICE '..Purge mine_party_appts from ETL mines';
            RAISE NOTICE '....# of records in mine_party_appt: %', old_row;
            WITH deleted_rows AS (
                DELETE FROM mine_party_appt
                WHERE
                    -- Only records known to ETL_PERMIT
                    mine_party_appt_type_code = 'PMT'
                    -- Only on mines in ETL process
                    AND
                    mine_guid IN (
                        SELECT mine_guid
                        FROM ETL_MINE
                        WHERE major_mine_ind = 'f'
                        AND mine_guid in (select mine_guid from ETL_PERMIT)
                    )
                RETURNING 1
            )
            SELECT COUNT(*) FROM deleted_rows INTO delete_row;
            SELECT count(*) FROM mine_party_appt INTO old_row;
            RAISE NOTICE '....# of records removed from mine_party_appt: %', delete_row;
            RAISE NOTICE '....# of records remaining in mine_party_appt: %', old_row;

            RAISE NOTICE '.. Insert latest MMS records from ETL_PERMIT into mine_party_appt';
            WITH inserted_rows AS (
                INSERT INTO mine_party_appt (
                    mine_party_appt_guid     ,
                    permit_guid              ,
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
                    ETL_PERMIT.permit_guid         ,
                    ETL_PERMIT.party_guid          ,
                    ETL_PERMIT.mine_guid           ,
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
				WHERE ETL_PERMIT.permit_guid IS NOT NULL
                RETURNING 1
            )
            SELECT count(*) FROM inserted_rows INTO insert_row;
            SELECT count(*) FROM mine_party_appt INTO total_row;
            RAISE NOTICE '.... # new permittee records loaded into MDS: %', insert_row;
            RAISE NOTICE '.... Total permittee records in MDS: %', total_row;
            RAISE NOTICE 'Finish updating permits and permittees.';
        END;
    END;
$$LANGUAGE plpgsql;
