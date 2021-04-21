CREATE OR REPLACE VIEW bond_view AS
SELECT
    *
FROM
    (
    SELECT
        bond.bond_id,
        amount,
        bond_type_code,
        bond_status_code,
        issue_date,
        note,
        payer_party_guid,
        party_name AS "payer_name",
        institution_city,
        institution_name,
        institution_postal_code,
        institution_province,
        institution_street,        
        permit_guid,
        permit_no,
        project_id,
        reference_number,
        bond.update_timestamp,
        bond.update_user,
        'Yes' AS "is_current_record"
    FROM
        bond,
        party,
        permit,
        bond_permit_xref
    WHERE
        bond.payer_party_guid = party.party_guid
        AND permit.permit_id = bond_permit_xref.permit_id
        AND bond.bond_id = bond_permit_xref.bond_id
    UNION ALL 
    SELECT
        bond_id,
        amount,
        bond_type_code,
        bond_status_code,
        issue_date,
        note,
        payer_party_guid,
        payer_name,
        institution_city,
        institution_name,
        institution_postal_code,
        institution_province,
        institution_street,        
        permit_guid,
        permit_no,
        project_id,
        reference_number,
        bond_history.update_timestamp,
        bond_history.update_user,
        'No' AS "is_current_record"
    FROM
        bond_history
    ) AS bond_data
ORDER BY bond_id, is_current_record DESC;
