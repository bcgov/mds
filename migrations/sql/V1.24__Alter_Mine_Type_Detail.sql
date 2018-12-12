ALTER TABLE mine_type_detail_xref
    DROP CONSTRAINT mine_type_guid_mine_disturbance_code_uniqeness,
    ADD active_ind boolean NOT NULL DEFAULT TRUE;

CREATE UNIQUE INDEX mine_type_guid_mine_disturbance_code_active_uniqeness on mine_type_detail_xref (mine_type_guid, mine_disturbance_code, active_ind) WHERE (active_ind = TRUE);
