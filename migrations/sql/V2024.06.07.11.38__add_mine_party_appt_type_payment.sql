ALTER TABLE
    project_summary
ADD
    COLUMN IF NOT EXISTS payment_contact_party_guid UUID NULL,
ADD
    CONSTRAINT payment_contact_party_guid_fkey FOREIGN KEY (payment_contact_party_guid) REFERENCES party(party_guid);

INSERT INTO
    mine_party_appt_type_code (
        mine_party_appt_type_code,
        description,
        display_order,
        create_user,
        update_user,
        person,
        organization,
        grouping_level
    )
VALUES
    (
        'PAY',
        'Payment Contact',
        300,
        'system-mds',
        'system-mds',
        'true',
        'true',
        1
    )