-- Unique Index
ALTER TABLE mine_status_xref
ADD UNIQUE (mine_operation_status_code, mine_operation_status_reason_code, mine_operation_status_sub_reason_code);

-- Unique Partial Indexes
CREATE UNIQUE INDEX unique_status_reason_idx
ON mine_status_xref (mine_operation_status_code, mine_operation_status_reason_code)
WHERE mine_operation_status_sub_reason_code IS NULL;

CREATE UNIQUE INDEX unique_status_idx
ON mine_status_xref (mine_operation_status_code)
WHERE
    mine_operation_status_reason_code IS NULL
    AND
    mine_operation_status_sub_reason_code IS NULL;
