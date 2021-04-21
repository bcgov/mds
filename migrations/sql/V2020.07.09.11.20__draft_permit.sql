INSERT INTO permit_amendment_status_code (permit_amendment_status_code, description, display_order , active_ind , create_user , create_timestamp , update_user , update_timestamp )
VALUES ('DFT', 'Draft', 30, true, 'system-mds', now(), 'system-mds', now());

ALTER TABLE permit_status_code ADD COLUMN active_ind boolean DEFAULT true NOT null;

INSERT INTO permit_status_code (permit_status_code, description, display_order, effective_date, create_user , create_timestamp , update_user , update_timestamp, active_ind)
VALUES ('D', 'Draft', 30, now(), 'system-mds', now(), 'system-mds', now(), false );

ALTER TABLE permit_amendment 
ADD COLUMN lead_inspector_title varchar;

ALTER TABLE permit_amendment 
ADD COLUMN regional_office varchar;
