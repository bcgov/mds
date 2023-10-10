ALTER TABLE
    now_application_document_identity_xref
ADD
    COLUMN IF NOT EXISTS deleted_ind boolean DEFAULT false NOT NULL;

UPDATE
    now_application_document_identity_xref as x
SET deleted_ind = d.deleted_ind
FROM mine_document d
WHERE
    d.mine_document_guid = x.mine_document_guid;