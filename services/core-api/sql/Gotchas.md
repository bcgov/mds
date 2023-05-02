# Gotchas

## Purpose

Purpose of this document is to add any important points related to database while fixing bugs.

## 'NoneType' object has no attribute 'now_application' Error

Details: https://bcmines.atlassian.net/browse/MDS-5039

This error is caused when trying to delete imported files. When deleting files which are add directly are not facing this error. The data relevant to the files imported and uploaded directly are added to two different sets of tables.

- There are two tables now_application_document_identity_xref and now_application_document_xref ( I'll refer to these as id_xref and xref ) which have duplicated columns.

- For new file uploads a record created in the mine_document table and the xref table.

- The existing files (imported), there's a record in mine_document table and id_xref table but not in the xref table.

- When a newly uploaded file get deleted, deleted_ind columns in both mine_document table and the xref table get updated to true and the file won't appear in the UI (API-EPGET: /api/now-applications/{application_guid})

- To delete the imported file from database, relevant record should be deleted from `now_submissions.document`, `now_application_document_identity_xref` and update the relevant record in `mine_document`
