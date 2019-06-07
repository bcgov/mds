alter table variance add column inspector_party_guid uuid;

alter table variance 
ADD CONSTRAINT variance_inspector_party_fkey
    FOREIGN KEY (inspector_party_guid) REFERENCES party(party_guid) DEFERRABLE INITIALLY deferred;

alter table variance
drop constraint inspector_required_on_reviewed_application;
