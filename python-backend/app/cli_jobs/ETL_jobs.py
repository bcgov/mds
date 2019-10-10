from app.extensions import db
from app.api.utils.apm import register_apm


@register_apm()
def run_ETL():
    db.session.execute('select transfer_mine_information();')
    db.session.execute('commit;')
    db.session.execute('select transfer_mine_manager_information();')
    db.session.execute('commit;')
    db.session.execute('select transfer_permit_permitee_information();')
    db.session.execute('commit;')
    db.session.execute('select transfer_mine_status_information();')
    db.session.execute('commit;')


@register_apm()
def run_address_etl():
    print('update existing address for contacts originating from permitee etl')
    #update records where parties in ETL_PERMIT have addresses in address and were created by this migration
    db.session.execute(
        r"update address set address_line_1 = m.addr1, city = m.city, sub_division_code = UPPER(NULLIF((select sub_division_code from sub_division_code where m.prov = sub_division_code),'')), post_code = UPPER(CASE WHEN (replace(replace(m.post_cd, ' ',''),'-','')) ~ '0+' THEN null WHEN LEFT( (replace(replace(m.post_cd, ' ',''),'-','')),5) ~ '^[0-9]+' THEN LEFT( (replace(replace(m.post_cd, ' ',''),'-','')),5) ELSE null END), update_user = 'mms-migration' from mms.mmscmp m right join ETL_PERMIT etl on concat(m.cmp_nm,m.tel_no) = etl.party_combo_id left join party p on p.party_guid = etl.party_guid where address.party_guid = p.party_guid and address.create_user = 'mms-migration';"
    )

    print('create addresses for contacts originating from permitee etl')
    #create address where the ETL_PERMIT table has a party but that party doesn't have an address
    db.session.execute(
        r"insert into address (party_guid, address_line_1, city, sub_division_code, post_code, create_user, update_user) select DISTINCT p.party_guid, addr1, city, UPPER(NULLIF((select sub_division_code from sub_division_code where m.prov = sub_division_code),'')), UPPER(CASE WHEN (replace(replace(m.post_cd, ' ',''),'-','')) ~ '0+' THEN null WHEN LEFT( (replace(replace(m.post_cd, ' ',''),'-','')),5) ~ '^[0-9]+' THEN LEFT( (replace(replace(m.post_cd, ' ',''),'-','')),5) ELSE null END) , 'mms-migration','mms-migration' from mms.mmscmp m right join ETL_PERMIT etl on concat(m.cmp_nm,m.tel_no) = etl.party_combo_id inner join party p on p.party_guid = etl.party_guid where p.party_guid not in (select party_guid from address) and (addr1 is not null or city is not null or post_cd is not null);"
    )

    print('create addresses for contacts originating from mine manager etl')
    #update records where parties in ETL_MANAGER have addresses in address and were created by this migration
    db.session.execute(
        r"update address set address_line_1 = m.street, city = m.city, sub_division_code = UPPER(NULLIF((select sub_division_code from sub_division_code where m.prov = sub_division_code),'')), post_code = UPPER(CASE WHEN (replace(replace(m.post_cd, ' ',''),'-','')) ~ '0+' THEN null WHEN LEFT( (replace(replace(m.post_cd, ' ',''),'-','')),5) ~ '^[0-9]+' THEN LEFT( (replace(replace(m.post_cd, ' ',''),'-','')),5) ELSE null END), update_user = 'mms-migration' from ETL_MANAGER e left join mms.mmsccn m on e.person_combo_id = m.cid left join party p on p.party_guid = e.party_guid left join mine on mine.mine_guid = e.mine_guid where address.party_guid = p.party_guid and address.create_user = 'mms-migration';"
    )

    print('create addresses for contacts originating from mine manager etl')
    #create address where the ETL_PERMIT table has a party but that party doesn't have an address
    db.session.execute(
        r"insert into address (party_guid, address_line_1, city, sub_division_code, post_code, create_user, update_user) select DISTINCT p.party_guid,  trim(m.street), trim(m.city), UPPER(NULLIF((select sub_division_code from sub_division_code where prov = sub_division_code),'')), UPPER(CASE WHEN (replace(replace(m.post_cd, ' ',''),'-','')) ~ '0+' THEN null WHEN LEFT( (replace(replace(m.post_cd, ' ',''),'-','')),5) ~ '^[0-9]+' THEN LEFT( (replace(replace(m.post_cd, ' ',''),'-','')),5) ELSE null END) , 'mms-migration','mms-migration' from ETL_MANAGER e left join mms.mmsccn m on e.person_combo_id = m.cid left join party p on p.party_guid = e.party_guid left join mine on mine.mine_guid = e.mine_guid where p.party_guid not in (select party_guid from address) and (street is not null or city is not null or post_cd is not null);"
    )
