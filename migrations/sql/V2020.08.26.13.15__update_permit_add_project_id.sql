ALTER TABLE permit ADD COLUMN project_id varchar;

ALTER TABLE bond drop column project_id;
ALTER TABLE reclamation_invoice drop column project_id;
