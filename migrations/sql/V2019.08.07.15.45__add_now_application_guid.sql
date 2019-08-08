ALTER TABLE now_submissions.application
ADD COLUMN application_guid uuid DEFAULT gen_random_uuid() NOT NULL,
ADD COLUMN mine_guid        uuid                                   ;
