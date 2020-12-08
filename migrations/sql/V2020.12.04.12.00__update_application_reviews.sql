-- ALTER TABLE now_application_document_xref ADD COLUMN is_referral_package BOOLEAN NOT NULL DEFAULT false;
-- ALTER TABLE now_application_document_xref ADD COLUMN is_consultation_package BOOLEAN NOT NULL DEFAULT false;


-- ALTER TABLE now_application_document_identity_xref ADD COLUMN is_consultation_package BOOLEAN NOT NULL DEFAULT false;
-- ALTER TABLE now_application_document_identity_xref ADD COLUMN is_referral_package BOOLEAN NOT NULL DEFAULT false;


INSERT INTO now_application_review_type(
    now_application_review_type_code,
    description,
    create_user,
    update_user
    )
VALUES
    ('ADV', 'Advertisements', 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;


-- ALTER TABLE now_application_review
-- ALTER COLUMN referee_name DROP NOT NULL;

-- ALTER TABLE now_application_review ADD COLUMN due_date;