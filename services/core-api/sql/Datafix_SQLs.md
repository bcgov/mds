# Datafixes

## Purpose

Purpose of this document is to add any important details related to the data fixes. You may add information as comments in the SQL files, but it's good to update the tabale with the basic information.

## Summary

|  No | Fix                                  | Details                                                      | References                                                                                                                                                             |
| --: | :----------------------------------- | :----------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Delete Mine Permit Xref Record       | Refer sql file                                               | [delete_mine_permit_xref_record.sql](delete_mine_permit_xref_record.sql)                                                                                               |
|   2 | Delete Mine Party Appt Record        | Refer sql file                                               | [delete_mine_party_appt_record.sql](delete_mine_party_appt_record.sql)                                                                                                 |
|   3 | Delete Now Record                    | Refer sql file                                               | [delete_now_record.sql](delete_now_record.sql)                                                                                                                         |
|   4 | Transfer Mine Permit Xref Record     | Refer sql file                                               | [transfer_mine_permit_xref_record.sql](transfer_mine_permit_xref_record.sql)                                                                                           |
|   5 | Delete TSF Record                    | Refer sql file                                               | [delete_tsf_record.sql](delete_tsf_record.sql)                                                                                                                         |
|   6 | Delete document from the Application | Refer [here](#6-delete-imported-document-in-now-application) | [delete_imported_document_in_NOW_Application.sql](delete_imported_document_in_NOW_Application.sql)<br/>JIRA: [MDS-5039](https://bcmines.atlassian.net/browse/MDS-5039) |
|     |

## Detailed Section

### 6. Delete imported document in NOW Application

Related to the `'NoneType' object has no attribute 'now_application'` error.

JIRA: https://bcmines.atlassian.net/browse/MDS-5039

This error is caused when trying to delete imported files. The files added directly are not facing this error. Because the data relevant to the imported-files and directly-uploaded-files are added to two different sets of tables.

- There are two tables now_application_document_identity_xref and now_application_document_xref ( I'll refer to these as id_xref and xref ) which have duplicated columns.
- For new file uploads a record created in the mine_document table and the xref table.
- The existing files (imported), there's a record in mine_document table and id_xref table but not in the xref table.
- When a newly uploaded file get deleted, deleted_ind columns in both mine_document table and the xref table get updated to true and the file won't appear in the UI (API-EPGET: /api/now-applications/{application_guid})
- To delete the imported file from database, relevant record should be deleted from `now_submissions.document`, `now_application_document_identity_xref` and update the relevant record in `mine_document`.

So [this sql](delete_imported_document_in_NOW_Application.sql) file remove/update the relevant records from the above mentioned tables.

#### How to run

`SELECT delete_imported_document_in_NOW_Application(file_name, mine_document_guid)`

Note: extract the file_name from the UI, and mine_document_guid by inspecting the failed call
