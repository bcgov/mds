from app.extensions import db
from app.api.utils.apm import register_apm


@register_apm()
def run_ETL():
    db.session.execute('select transfer_mine_information();')
    db.session.commit()
    db.session.execute('select transfer_mine_manager_information();')
    db.session.commit()
    db.session.execute('select transfer_permit_permitee_information();')
    db.session.commit()
    db.session.execute('select transfer_mine_status_information();')
    db.session.commit()


@register_apm()
def run_address_etl():
    processed_permitee_address_table_variable_sql = r"""
    with processed_address AS (
        select DISTINCT
            p.party_guid as party_guid,
            NULLIF(trim(m.addr1), '') as address_line_1,
            NULLIF(trim(m.city), '') as city, 
            UPPER(NULLIF((select sub_division_code from sub_division_code where prov = sub_division_code),'')) as sub_division_code, 
            UPPER(CASE 
                WHEN (replace(replace(m.post_cd, ' ',''),'-','')) ~ '^0+$' THEN null 
                WHEN LEFT((replace(replace(m.post_cd, ' ',''),'-','')),5) ~ '^[0-9]+$' THEN LEFT( (replace(replace(m.post_cd, ' ',''),'-','')),5) 
                WHEN char_length(replace(replace(m.post_cd, ' ',''),'-','')) = 6 THEN replace(replace(m.post_cd, ' ',''),'-','')
            ELSE null END) as post_code,
            'mms-migration' as create_user,
            'mms-migration' as update_user
                from 
                    mms.mmscmp m 
                    right join ETL_PERMIT etl on concat(m.cmp_nm,m.tel_no) = etl.party_combo_id 
                    left join party p on p.party_guid = etl.party_guid
    ),"""

    processed_manager_address_table_variable_sql = r"""
        with processed_address AS (
            select DISTINCT
                p.party_guid as party_guid,
                NULLIF(trim(m.street), '') as address_line_1,
                NULLIF(trim(m.city), '') as city, 
                UPPER(NULLIF((select sub_division_code from sub_division_code where prov = sub_division_code),'')) as sub_division_code, 
                UPPER(CASE 
                    WHEN (replace(replace(m.post_cd, ' ',''),'-','')) ~ '^0+$' THEN null 
                    WHEN LEFT((replace(replace(m.post_cd, ' ',''),'-','')),5) ~ '^[0-9]+$' THEN LEFT( (replace(replace(m.post_cd, ' ',''),'-','')),5) 
                    WHEN char_length(replace(replace(m.post_cd, ' ',''),'-','')) = 6 THEN replace(replace(m.post_cd, ' ',''),'-','')
                ELSE null END) as post_code,
                'mms-migration' as create_user,
                'mms-migration' as update_user
                    from 
                        ETL_MANAGER e left join mms.mmsccn m on e.person_combo_id = m.cid 
                        left join party p on p.party_guid = e.party_guid
                        left join mine on mine.mine_guid = e.mine_guid 
        ),"""

    update_address_from_processed_address_variable = r"""
        updated_rows as (update address set 
            address_line_1 = pa.address_line_1,
            city = pa.city, 
            sub_division_code = pa.sub_division_code,
            post_code = pa.post_code
        FROM processed_address pa
        WHERE pa.party_guid = address.party_guid returning 1)
        SELECT count(*) from updated_rows;
        """

    insert_new_addresses_from_processed_address_variable = r"""
        inserted_rows as (insert into address (party_guid, address_line_1, city, sub_division_code, post_code, create_user, update_user) SELECT pa.party_guid, pa.address_line_1, pa.city, pa.sub_division_code, pa.post_code, pa.create_user, pa.update_user from processed_address pa where
              pa.party_guid not in (select party_guid from address) and
              (address_line_1 is not null or city is not null or post_code is not null) returning 1)
              SELECT count(*) from inserted_rows;
        """

    print('update existing address for contacts originating from permitee etl')
    #update records where parties in ETL_PERMIT have addresses in address and were created by this migration
    num_updated_permitee_addresses = db.session.execute(
        processed_permitee_address_table_variable_sql +
        update_address_from_processed_address_variable).fetchone()['count']
    print('Number of updated permitee addresses: ' + str(num_updated_permitee_addresses))
    db.session.commit()

    print('create addresses for contacts originating from permitee etl')
    #create address where the ETL_PERMIT table has a party but that party doesn't have an address
    num_created_permitee_addresses = db.session.execute(
        processed_permitee_address_table_variable_sql +
        insert_new_addresses_from_processed_address_variable).fetchone()['count']
    print('Number of created permitee addresses: ' + str(num_created_permitee_addresses))
    db.session.commit()

    print('Update existing addresses for contacts originating from mine manager etl')
    #update records where parties in ETL_MANAGER have addresses in address and were created by this migration
    num_updated_manager_addresses = db.session.execute(
        processed_manager_address_table_variable_sql +
        update_address_from_processed_address_variable).fetchone()['count']
    print('Number of updated manager addresses: ' + str(num_updated_manager_addresses))
    db.session.commit()

    print('create addresses for contacts originating from mine manager etl')
    #create address where the ETL_PERMIT table has a party but that party doesn't have an address
    num_updated_manager_addresses = db.session.execute(
        processed_manager_address_table_variable_sql +
        insert_new_addresses_from_processed_address_variable).fetchone()['count']
    print('Number of created manager addresses: ' + str(num_updated_manager_addresses))
    db.session.commit()
