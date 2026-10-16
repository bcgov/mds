UPDATE mine_document
SET deleted_ind = true, update_user = 'system-mds', update_timestamp = now()
WHERE mine_document_guid IN (
    '635944cf-d2af-4633-b78a-ab8205d72ae8', -- .shp
    '3d5f8614-528e-467e-80b2-7a4da2569803', -- .shx
    'dfed1180-58f8-4243-9d01-0dd04594bbca', -- .prj
    '6b1cc297-2e53-4e36-8cbd-13d6ea2adee7'  -- .dbf
);

UPDATE now_application_document_xref
SET deleted_ind = true, update_user = 'system-mds', update_timestamp = now()
WHERE mine_document_guid IN (
    '635944cf-d2af-4633-b78a-ab8205d72ae8',
    '3d5f8614-528e-467e-80b2-7a4da2569803',
    'dfed1180-58f8-4243-9d01-0dd04594bbca',
    '6b1cc297-2e53-4e36-8cbd-13d6ea2adee7'
);
