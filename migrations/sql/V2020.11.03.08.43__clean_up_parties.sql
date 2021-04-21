DO $$                  
    BEGIN 
        IF EXISTS
            ( SELECT 1
              FROM   information_schema.tables 
              WHERE  table_schema = 'public'
              AND    table_name = 'etl_permit'
            )
        then
			UPDATE etl_permit SET party_guid=uuid(distinct_parties.party_guid) FROM (select DISTINCT count(*), party_combo_id, MAX(party_guid::text) as party_guid FROM etl_permit GROUP BY party_combo_id) AS distinct_parties
			WHERE etl_permit.party_combo_id IS NOT NULL AND etl_permit.party_combo_id != '' and etl_permit.party_combo_id = distinct_parties.party_combo_id;
			
			create temporary table parties_to_delete AS		
			with parties_in_use as (
				SELECT core_payer_party_guid as party_guid FROM ETL_BOND
				UNION
				SELECT party_guid FROM ETL_PERMIT
				UNION
				SELECT party_guid FROM ETL_MANAGER
				UNION
				SELECT party_guid FROM mine_party_appt
				UNION
				SELECT applicant_guid FROM variance
				UNION
				SELECT party_guid FROM party_business_role_appt
				UNION
				SELECT inspector_party_guid FROM variance
				UNION
				SELECT determination_inspector_party_guid FROM mine_incident
				UNION
				SELECT reported_to_inspector_party_guid FROM mine_incident
				UNION
				SELECT responsible_inspector_party_guid FROM mine_incident
				UNION
				SELECT party_guid FROM now_party_appointment
				UNION
				SELECT lead_inspector_party_guid FROM now_application
				UNION
				SELECT payer_party_guid FROM bond
				UNION
				SELECT party_guid FROM party_orgbook_entity
			)
			SELECT party_guid FROM party WHERE party_guid not IN (SELECT party_guid FROM parties_in_use where party_guid is not NULL);

			delete from address where party_guid in (select party_guid from parties_to_delete);
			delete from party where party_guid in (select party_guid from parties_to_delete);
        END IF ;
    END
   $$ ;
   
 