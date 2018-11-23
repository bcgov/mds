-- 3. Migrate mine permit and permittee info

DO $$
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
    old_row         integer;
    new_row         integer;
BEGIN
    RAISE NOTICE 'Start updating mine permit info:';
    RAISE NOTICE '.. Step 1 of 4: Scan new permit info in MMS';
    -- This is the intermediary table that will be used to store mine permit and permittee info from the MMS database.
    CREATE TABLE IF NOT EXISTS ETL_PERMIT(
        permittee_guid      uuid                    ,
        --permit info
        permit_guid         uuid                    ,
        source              numeric                 ,
        mine_guid           uuid                    ,
        mine_no             character varying(12)   ,
        permit_no           character varying(12)   ,
        received_date       date                    ,
        issue_date          date                    ,
        expiry_date         date                    ,
        permit_status_code  character varying(2)    ,
        --permittee info
        party_guid          uuid                    ,
        party_combo_id      character varying(200)  ,
        first_name character varying(100)           ,
        party_name character varying(100)           ,
        party_type character varying(3)             ,
        phone_no character varying(12)              ,
        email character varying(254)                ,
        effective_date date
    );
    SELECT count(*) FROM ETL_PERMIT into old_row;
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
    new_permit_list AS (
        SELECT permit_cid
        FROM permit_list
        WHERE permit_cid NOT IN (
            SELECT permit_cid
            FROM ETL_PERMIT
        )
    ),
    permit_info AS (
        SELECT
            mine_detail.mine_guid   ,
            permit_info.mine_no     ,
            permit_info.permit_no   ,
            permit_info.cid AS permit_cid   ,
            COALESCE(permit_info.recv_dt,'9999-12-31'::date)  recv_dt   ,
            COALESCE(permit_info.iss_dt ,  '9999-12-31'::date) iss_dt   ,
            COALESCE(permit_info.permit_expiry_dt,'9999-12-31'::date) permit_expiry_dt,
            CASE permit_info.sta_cd
                WHEN 'Z' THEN 'C' --closed
                ELSE 'O' --open
            END AS sta_cd           ,
            permit_info.upd_no
        FROM mms.mmspmt permit_info
        INNER JOIN mine_detail ON
            mine_detail.mine_no=permit_info.mine_no
        WHERE permit_info.cid IN (
            SELECT permit_cid
            FROM new_permit_list
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
            FROM new_permit_list
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
        FROM new_permit_list
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
        FROM new_permit_list
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
            mine_info.mine_no=permit_info.mine_no
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
    permittee_new_record AS (
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
        WHERE party_combo_id NOT IN (
            SELECT party_combo_id
            FROM ETL_PERMIT
        )
    ),
    --Formatting permittee name
    permittee_org AS (
        SELECT
            party_combo_id            ,
            party_guid                ,
            NULL AS first_name        ,
            permittee_nm AS party_name,
            'ORG' ::text AS party_type
        FROM permittee_new_record
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
        FROM permittee_new_record
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
        FROM permittee_new_record
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
    --Combine the formatted contact info for new records
    permittee_new_wContact AS (

        SELECT
            new_permittee.permit_cid    ,
            new_permittee.party_combo_id,
            new_permittee.source        ,
            name_and_type.party_guid    ,
            name_and_type.first_name    ,
            name_and_type.party_name    ,
            name_and_type.party_type    ,
            contact.phone_no            ,
            contact.email               ,
            COALESCE(new_permittee.effective_date , now()) AS effective_date
        FROM permittee_info_wCombo new_permittee
        INNER JOIN permittee_name_and_type name_and_type ON
            name_and_type.party_combo_id=new_permittee.party_combo_id
        INNER JOIN permittee_contact contact ON
            contact.party_combo_id=new_permittee.party_combo_id
    )
    INSERT INTO ETL_PERMIT(
        permittee_guid      ,
        --permit info
        permit_guid         ,
        source              ,
        mine_guid           ,
        mine_no             ,
        permit_no           ,
        received_date       ,
        issue_date          ,
        expiry_date         ,
        permit_status_code  ,
        --permittee info
        party_combo_id      ,
        party_guid          ,
        first_name          ,
        party_name          ,
        party_type          ,
        phone_no            ,
        email               ,
        effective_date
    )
    SELECT
        gen_random_uuid()       ,--permittee_guid
        --permit info
        gen_random_uuid()       ,--permit_guid
        permittee_info.source   ,
        permit_info.mine_guid   ,
        permit_info.mine_no     ,
        permit_info.permit_no   ,
        permit_info.recv_dt     ,
        permit_info.iss_dt      ,
        permit_info.permit_expiry_dt    ,
        permit_info.sta_cd              ,
        --permittee info
        permittee_info.party_combo_id   ,
        permittee_info.party_guid       ,
        permittee_info.first_name       ,
        permittee_info.party_name       ,
        permittee_info.party_type       ,
        permittee_info.phone_no         ,
        permittee_info.email            ,
        permittee_info.effective_date
    FROM permit_info
    INNER JOIN permittee_new_wContact permittee_info ON
        permittee_info.permit_cid=permit_info.permit_cid;
    SELECT count(*) FROM ETL_PERMIT INTO new_row;
    RAISE NOTICE '.... # of new permittee records loaded into MDS: %', (new_row-old_row);
    RAISE NOTICE '.... # of total permittee records in MDS: %', new_row;
END $$;



DO $$
DECLARE
    old_row  integer;
    new_row  integer;
BEGIN
    RAISE NOTICE '.. Step 2 of 4: Update permit info';
    SELECT count(*) FROM permit INTO old_row;
    WITH
    --Select only new entry in ETL_PERMIT table
    new_permit AS (
        SELECT *
        FROM ETL_PERMIT
        WHERE permit_guid NOT IN (
            SELECT permit_guid
            FROM permit
        )
    )
    INSERT INTO permit (
        permit_guid         ,
        mine_guid           ,
        permit_no           ,
        received_date       ,
        issue_date          ,
        permit_status_code  ,
        create_user         ,
        create_timestamp    ,
        update_user         ,
        update_timestamp    ,
        expiry_date
    )
    SELECT
        permit_guid         ,
        mine_guid           ,
        permit_no           ,
        received_date       ,
        issue_date          ,
        permit_status_code  ,
        'mms_migration'     ,
        now()               ,
        'mms_migration'     ,
        now()               ,
        expiry_date
    FROM new_permit;
    SELECT COUNT(*) FROM permit INTO new_row;
    RAISE NOTICE '.... # of new permit records loaded into MDS: %', (new_row-old_row);
    RAISE NOTICE '.... # of total permit records in MDS: %', new_row;
END $$;


DO $$
DECLARE
    old_row  integer;
    new_row  integer;
BEGIN
    RAISE NOTICE '.. Step 3 of 4: Update party info';
    SELECT count(*) FROM party INTO old_row;
    WITH
    --Select only new entry in ETL_PERMIT table
    new_party AS (
        SELECT DISTINCT ON (party_guid)
            party_guid      ,
            first_name      ,
            party_name      ,
            phone_no        ,
            email           ,
            effective_date  ,
            expiry_date     ,
            party_type
        FROM ETL_PERMIT
        WHERE party_guid NOT IN (
            SELECT  party_guid
            FROM    party
        )
    )
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
        party_guid      ,
        first_name      ,
        party_name      ,
        phone_no        ,
        email           ,
        effective_date  ,
        expiry_date     ,
        'mms_migration' ,
        now()           ,
        'mms_migration' ,
        now()           ,
        party_type
    FROM new_party;
    SELECT count(*) FROM party INTO new_row;
    RAISE NOTICE '.... # of new party records loaded into MDS: %', (new_row-old_row);
END $$;

DO $$
DECLARE
    old_row integer;
    new_row integer;
BEGIN
    RAISE NOTICE '.. Step 4 of 4: Update permittee info';
    SELECT count(*) FROM permittee INTO old_row;
    --select only new record
    WITH new_permittee AS (
        SELECT *
        FROM ETL_PERMIT
        WHERE permittee_guid NOT IN (
            SELECT permittee_guid
            FROM permittee
        )
    )
    INSERT INTO permittee (
        permittee_guid   ,
        permit_guid      ,
        party_guid       ,
        create_user      ,
        create_timestamp ,
        update_user      ,
        update_timestamp ,
        effective_date   ,
        expiry_date
    )
    SELECT
        permittee_guid  ,
        permit_guid     ,
        party_guid      ,
        'mms_migration' ,
        now()           ,
        'mms_migration' ,
        now()           ,
        issue_date      ,
        expiry_date
    FROM new_permittee;
    SELECT count(*) FROM permittee INTO new_row;
    RAISE NOTICE '.... # of new permittee records loaded into MDS: %', (new_row-old_row);
    RAISE NOTICE '.... # of total permittee records in MDS: %', new_row;
END $$;
