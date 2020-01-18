ALTER TABLE now_application RENAME COLUMN review_closed_on_date TO referral_closed_on_date;
ALTER TABLE now_application ADD COLUMN consultation_closed_on_date timestamp with time zone;
ALTER TABLE now_application ADD COLUMN public_comment_closed_on_date timestamp with time zone;

UPDATE now_application_review_type SET description='First Nations Consultation' WHERE now_application_review_type_code='FNC';

INSERT INTO now_application_document_type
(now_application_document_type_code, description, active_ind, create_user, update_user)
VALUES
    ('PUB', 'Public Comment',true,'system-mds','system-mds')
on conflict do nothing;
