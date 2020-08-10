ALTER TABLE bond ADD COLUMN mms_sec_cid varchar;


alter table bond add constraint sec_cid_unique unique (sec_cid);
