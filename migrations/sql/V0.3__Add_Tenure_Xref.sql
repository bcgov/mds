/* There should be no edits from within MDS.  This table is populated from the
   official source (MTO) at https://www.mtonline.gov.bc.ca/mtov/home.do   */
CREATE TABLE mineral_tenure_xref (
  mineral_tenure_xref_guid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mine_guid uuid NOT NULL,
  tenure_number_id   numeric(10) NOT NULL,
  effective_date date NOT NULL DEFAULT now(),
  expiry_date    date NOT NULL DEFAULT '9999-12-31'::date,
  create_user      character varying(60) NOT NULL,
  create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
  update_user      character varying(60) NOT NULL,
  update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
FOREIGN KEY (mine_guid) REFERENCES mine_identity(mine_guid) DEFERRABLE INITIALLY DEFERRED
);


CREATE INDEX mineral_tenure_xref_tenure_no_idx ON mineral_tenure_xref (tenure_number_id);
CREATE INDEX mineral_tenure_xref_update_timestamp_idx ON mineral_tenure_xref (update_timestamp);


COMMENT ON TABLE mineral_tenure_xref IS 'A cross-reference to the official Mineral Tenure(s) associated with this mine, via the Owner.';
COMMENT ON COLUMN mineral_tenure_xref.effective_date IS 'Calendar date upon this cross-reference is accepted as true (time component implicitly 00:00:00.00).';
COMMENT ON COLUMN mineral_tenure_xref.expiry_date IS 'Calendar date after which this cross-reference is accepted as no longer true (time component implicitly 23:59:59.99).';
