import { USER_ROLES } from "@mds/common/constants/environment";
import {
  FileOperations,
  MajorMineApplicationDocument,
  MineDocument,
} from "@mds/common/models/documents/document";

// Document model testing

const mockDocumentData = {
  archived_by: null,
  archived_date: null,
  create_user: "user@bceid",
  document_manager_guid: "74c966b8-7823-48ab-af8e-cc653c0a8965",
  document_name: "pdf1.PDF",
  is_archived: null,
  major_mine_application_document_type_code: "PRM",
  major_mine_application_id: 1,
  mine_document_guid: "cb4194c0-0d5e-4288-9f32-efebb4707ee7",
  mine_guid: "0d11d34b-a6b1-4d01-a146-fd11970e06e9",
  update_timestamp: "2023-07-10 19:12:48.529889+00:00",
  upload_date: "2023-07-10 19:12:48.529892+00:00",
  versions: [
    {
      create_user: "user@bceid",
      document_manager_guid: "74c966b8-7823-48ab-af8e-cc653c0a8965",
      document_manager_version_guid: "8bfeb983-a9cd-4f14-af29-f85ee83e1630",
      document_name: "pdf1.PDF",
      mine_document_guid: "cb4194c0-0d5e-4288-9f32-efebb4707ee7",
      mine_document_version_guid: "427d1539-0d49-4c8f-b9c4-33bc9e5a6e67",
      mine_guid: "0d11d34b-a6b1-4d01-a146-fd11970e06e9",
      update_timestamp: "2023-07-10T19:12:48.529889+00:00",
      upload_date: "2023-07-10 19:12:48.529892+00:00",
    },
    {
      create_user: "test2@idir",
      document_manager_guid: "74c966b8-7823-48ab-af8e-cc653c0a8965",
      document_manager_version_guid: "132de7e5-b97c-4f97-b019-81c42edc4fb9",
      document_name: "pdf1.PDF",
      mine_document_guid: "cb4194c0-0d5e-4288-9f32-efebb4707ee7",
      mine_document_version_guid: "9db600e2-be47-4c59-bff7-999fde20365e",
      mine_guid: "0d11d34b-a6b1-4d01-a146-fd11970e06e9",
      update_timestamp: "2023-07-10T19:12:48.529889+00:00",
      upload_date: "2023-07-10 19:12:48.529892+00:00",
    },
  ],
};

jest.mock("@mds/common", () => ({
  ...jest.requireActual("@mds/common"),
  isFeatureEnabled: () => true,
}));

describe("MineDocument model", () => {
  it("Base document model versions", () => {
    const mineDocumentRecord = new MineDocument(mockDocumentData);

    const expectedNumPreviousVersions = mockDocumentData.versions.length;
    expect(mineDocumentRecord.number_prev_versions).toEqual(expectedNumPreviousVersions);
    expect(mineDocumentRecord.versions.length).toEqual(expectedNumPreviousVersions);
    expect(typeof mineDocumentRecord).toEqual(typeof mineDocumentRecord.versions[0]);

    const latestVersionKey = mineDocumentRecord.document_manager_version_guid;
    const childKeys = mineDocumentRecord.versions.map(
      (version) => version.document_manager_version_guid
    );
    expect(childKeys).not.toContain(latestVersionKey);
  });
  it("Base document model with no previous versions", () => {
    const docData = { ...mockDocumentData };
    delete docData.versions;

    const mineDocumentRecord = new MineDocument(docData);
    expect(mineDocumentRecord.number_prev_versions).toEqual(0);
    expect(mineDocumentRecord.is_latest_version).toEqual(true);
  });
  it("Base document model with versions: methods & setters", () => {
    const mineDocumentRecord = new MineDocument(mockDocumentData);

    expect(mineDocumentRecord.file_type).toEqual(".pdf");
    expect(mineDocumentRecord.is_latest_version).toEqual(true);
    expect(mineDocumentRecord.is_archived).toEqual(false);
  });
  it("Base document model permissions", () => {
    const mineDocumentRecord = new MineDocument(mockDocumentData);

    const permissions = mineDocumentRecord.allowed_actions;
    const expectedPermissions = [
      FileOperations.View,
      FileOperations.Download,
      FileOperations.Replace,
      FileOperations.Archive,
      FileOperations.Delete,
    ];
    expect(permissions).toEqual(expectedPermissions);

    // previous versions can only be viewed or downloaded
    const previousVersionPermissions = mineDocumentRecord.versions[0].allowed_actions;
    const expectedPrevPermissions = [FileOperations.View, FileOperations.Download];
    expect(previousVersionPermissions).toEqual(expectedPrevPermissions);
  });
});

describe("MajorMineApplicationDocument model", () => {
  it("MajorMineApplicationDocument permissions", () => {
    const appDocRecord = new MajorMineApplicationDocument(mockDocumentData);

    const canViewActions = [FileOperations.View, FileOperations.Download].sort();
    const canModifyActions = [
      FileOperations.Replace,
      FileOperations.Archive,
      FileOperations.Delete,
      ...canViewActions,
    ].sort();

    appDocRecord.setAllowedActions([USER_ROLES.role_minespace_proponent]);
    expect(canModifyActions).toEqual(appDocRecord.allowed_actions.sort());

    appDocRecord.setAllowedActions([USER_ROLES.role_edit_major_mine_applications]);
    expect(canModifyActions).toEqual(appDocRecord.allowed_actions.sort());

    appDocRecord.setAllowedActions([]);
    expect(canViewActions).toEqual(appDocRecord.allowed_actions.sort());
  });
});
