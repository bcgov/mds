ALTER TABLE now_submissions.application_nda
ADD COLUMN application_nda_guid uuid DEFAULT gen_random_uuid() NOT NULL,
ADD COLUMN mine_guid        uuid,
ADD COLUMN originating_system VARCHAR;