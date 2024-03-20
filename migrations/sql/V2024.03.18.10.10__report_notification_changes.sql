
-- Adding emails to emli_contacts which is used for report submission notifications

INSERT INTO emli_contact_type
    (
    emli_contact_type_code,
    description,
    display_order,
    active_ind,
    create_user,
    update_user
    )
VALUES
    ('RDC',  'Report Designated Contact', 90, false, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;


INSERT INTO emli_contact
  (
    emli_contact_type_code, mine_region_code, first_name, last_name,
    email, phone_number, fax_number, mailing_address_line_1, mailing_address_line_2, 
    is_major_mine, is_general_contact, deleted_ind,
    create_user, update_user
  )
  VALUES
  ('RDC', null, null, null, 'mines.inquiries@gov.bc.ca', null, null, null, null, false, false, false, 'system-mds', 'system-mds'),
  ('RDC', null, null, null, 'mine.ergonomics@gov.bc.ca', null, null, null, null, false, false, false, 'system-mds', 'system-mds'),
  ('RDC', null, null, null, 'mineincidents@gov.bc.ca', null, null, null, null, false, false, false, 'system-mds', 'system-mds'),
  ('RDC', null, null, null, 'minesdrg@victoria1.gov.bc.ca', null, null, null, null, false, false, false, 'system-mds', 'system-mds'),
  ('RDC', null, null, null, 'technicalcompliance@gov.bc.ca', null, null, null, null, false, false, false, 'system-mds', 'system-mds'),
  ('RDC', null, null, null, 'mine.occhealth@gov.bc.ca', null, null, null, null, false, false, false, 'system-mds', 'system-mds'),
  ('RDC', null, null, null, 'mine.safety@gov.bc.ca', null, null, null, null, false, false, false, 'system-mds', 'system-mds'),
  ('RDC', null, null, null, 'Abandoned.Mines@gov.bc.ca', null, null, null, null, false, false, false, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;
