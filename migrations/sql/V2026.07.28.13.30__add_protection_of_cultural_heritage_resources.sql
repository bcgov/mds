ALTER TABLE now_submissions.application ADD COLUMN IF NOT EXISTS
    protectionofculturalheritageresources varchar;

ALTER TABLE state_of_land ADD COLUMN IF NOT EXISTS
    protection_of_cultural_heritage_resources varchar;
