ALTER TABLE now_application_identity ADD CONSTRAINT now_application_identity_messageid_unique UNIQUE (messageid);
ALTER TABLE now_application_identity ADD CONSTRAINT now_application_identity_mms_cid_unique UNIQUE (mms_cid);
ALTER TABLE now_application_identity ADD CONSTRAINT now_application_identity_now_application_id_unique UNIQUE (now_application_id);
ALTER TABLE now_application_identity ADD CONSTRAINT now_application_identity_now_number_unique UNIQUE (now_number);