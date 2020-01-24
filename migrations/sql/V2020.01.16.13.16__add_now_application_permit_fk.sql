ALTER TABLE now_application_identity ADD COLUMN permit_id integer; 
ALTER TABLE now_application_identity ADD FOREIGN KEY (permit_id) REFERENCES permit(permit_id) DEFERRABLE INITIALLY DEFERRED;