UPDATE mine_document
  SET document_class = 'mine_document'
  WHERE document_class IS NULL;
ALTER TABLE mine_document
  ALTER COLUMN document_class SET DEFAULT 'mine_document',
  ALTER COLUMN document_class SET NOT NULL;
