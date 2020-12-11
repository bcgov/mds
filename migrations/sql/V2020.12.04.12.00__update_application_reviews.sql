ALTER TABLE now_application_document_xref ADD COLUMN is_referral_package BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE now_application_document_xref ADD COLUMN is_consultation_package BOOLEAN NOT NULL DEFAULT false;


ALTER TABLE now_application_document_identity_xref ADD COLUMN is_consultation_package BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE now_application_document_identity_xref ADD COLUMN is_referral_package BOOLEAN NOT NULL DEFAULT false;


INSERT INTO now_application_review_type(
    now_application_review_type_code,
    description,
    create_user,
    update_user
    )
VALUES
    ('ADV', 'Advertisements', 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

INSERT INTO now_application_document_sub_type
(now_application_document_sub_type_code, description, active_ind, create_user, update_user)
values
('CDO', 'Consultation Documents', true, 'system-mds', 'system-mds'),
('RDO', 'Referral Documents', true, 'system-mds', 'system-mds'),
('PDO', 'Public Comment Documents', true, 'system-mds', 'system-mds')
on conflict do nothing;

INSERT INTO now_application_document_type
(now_application_document_type_code, description, active_ind, now_application_document_sub_type_code, create_user, update_user)
VALUES
    ('CRS', 'Consultation Report/Summary', true, 'CDO', 'system-mds', 'system-mds'),
    ('BCR', 'Begin Consultation Request', true, 'CDO', 'system-mds', 'system-mds'),
    ('CCC', 'Consultation Correspondence (not in CRTS)', true, 'CDO', 'system-mds', 'system-mds'),
    ('CSD', 'Consultation Support for Decision', true, 'CDO', 'system-mds', 'system-mds'),

    ('BRR', 'Begin Referral Request', true, 'RDO', 'system-mds', 'system-mds'),
    ('RSR', 'Referral Summary Roll Up', true, 'RDO', 'system-mds', 'system-mds'),
    ('RLE', 'Referral Letter (outside of E-Referral)', true, 'RDO', 'system-mds', 'system-mds'),
    ('RRE', 'Referral Response (outside of E-Referral)', true, 'RDO', 'system-mds', 'system-mds'),

    ('PCA', 'Advertisement', true, 'PDO', 'system-mds', 'system-mds'),
    ('PCC', 'Public Comment', true, 'PDO', 'system-mds', 'system-mds'),
    ('PCM', 'Ministry Response', true, 'PDO', 'system-mds', 'system-mds')
on conflict do nothing;


ALTER TABLE now_application_review ALTER COLUMN referee_name DROP NOT NULL;
ALTER TABLE now_application_review ADD COLUMN referral_number character varying(16);
ALTER TABLE now_application_review ADD COLUMN response_url character varying(100);