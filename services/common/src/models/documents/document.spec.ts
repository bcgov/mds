import { USER_ROLES } from "@mds/common/constants/environment";
import { FileOperations, NoWApplicationDocument } from "@mds/common/models/documents/document";

jest.mock("@mds/common/utils", () => ({
  ...jest.requireActual("@mds/common/utils"),
  isFeatureEnabled: () => true,
}));

describe("NoWApplicationDocument model", () => {
  const mockNoWDocumentData = {
    now_application_document_xref_guid: "5c6d3b2a-1f0e-4d9c-8b7a-6e5f4d3c2b1a",
    now_application_document_sub_type_code: "GDO",
    is_final_package: false,
    is_referral_package: false,
    is_consultation_package: false,
    is_system_generated: false,
    now_application_status_code: "REC",
    is_delayed: false,
    is_view_mode: false,
    user_roles: [USER_ROLES.role_edit_permits],
    mine_document_guid: "cb4194c0-0d5e-4288-9f32-efebb4707ee7",
    mine_guid: "0d11d34b-a6b1-4d01-a146-fd11970e06e9",
    document_manager_guid: "74c966b8-7823-48ab-af8e-cc653c0a8965",
    document_name: "report.pdf",
    upload_date: "2023-07-10 19:12:48.529892+00:00",
    create_user: "user@bceid",
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
    ],
  };

  const canViewActions = [FileOperations.View, FileOperations.Download];
  const canChangeActions = [...canViewActions, FileOperations.Replace, FileOperations.Archive];

  const allowedActions = (overrides = {}) =>
    new NoWApplicationDocument({ ...mockNoWDocumentData, ...overrides }).allowed_actions;

  it("allows view, download, replace and archive, but never delete", () => {
    expect(allowedActions()).toEqual(canChangeActions);
  });

  it("only allows previous versions to be downloaded", () => {
    const document = new NoWApplicationDocument(mockNoWDocumentData);

    expect(document.number_prev_versions).toEqual(1);
    expect(document.versions[0].allowed_actions).toEqual([FileOperations.Download]);
  });

  it("only allows view and download without the edit permits role or in view mode", () => {
    expect(allowedActions({ user_roles: [] })).toEqual(canViewActions);
    expect(allowedActions({ is_view_mode: true })).toEqual(canViewActions);
  });

  it("recalculates allowed actions when the user's roles change", () => {
    const document = new NoWApplicationDocument(mockNoWDocumentData);

    document.setAllowedActions([]);

    expect(document.allowed_actions).toEqual(canViewActions);
  });

  it("only allows pdfs to be opened in the document viewer", () => {
    expect(allowedActions({ document_name: "report.docx" })).toEqual([
      FileOperations.Download,
      FileOperations.Replace,
      FileOperations.Archive,
    ]);
  });

  describe("government documents", () => {
    it.each(["AIA", "REJ", "WDN", "NPR"])("can be changed once the application is %s", (status) => {
      expect(allowedActions({ now_application_status_code: status })).toEqual(canChangeActions);
    });

    it("cannot be changed while the application is delayed", () => {
      expect(allowedActions({ is_delayed: true })).toEqual(canViewActions);
    });
  });

  describe("permit package documents", () => {
    it("can be changed while the application is in progress", () => {
      expect(allowedActions({ is_final_package: true })).toEqual(canChangeActions);
    });

    it.each(["AIA", "REJ", "WDN", "NPR"])("cannot be changed once the application is %s", (status) => {
      expect(
        allowedActions({ is_final_package: true, now_application_status_code: status })
      ).toEqual(canViewActions);
    });

    it("cannot be changed while the application is delayed", () => {
      expect(allowedActions({ is_final_package: true, is_delayed: true })).toEqual(canViewActions);
    });
  });

  describe("application documents", () => {
    it.each(["AAF", "MDO", "SDO"])(
      "%s documents can be changed once the application is decided and delayed",
      (subTypeCode) => {
        expect(
          allowedActions({
            now_application_document_sub_type_code: subTypeCode,
            now_application_status_code: "AIA",
            is_delayed: true,
          })
        ).toEqual(canChangeActions);
      }
    );

    it("imported submission documents can be changed once the application is decided and delayed", () => {
      expect(
        allowedActions({
          now_application_document_sub_type_code: undefined,
          is_imported_submission_document: true,
          now_application_status_code: "AIA",
          is_delayed: true,
        })
      ).toEqual(canChangeActions);
    });
  });

  describe("documents that can never be changed", () => {
    it.each([
      ["system-generated", { is_system_generated: true }],
      ["in a referral package", { is_referral_package: true }],
      ["in a consultation package", { is_consultation_package: true }],
      ["in a referral and the permit package", { is_referral_package: true, is_final_package: true }],
      ["archived", { is_archived: true }],
      ["not yet imported", { mine_document_guid: undefined }],
      ["outside the Manage Documents tables", { now_application_document_sub_type_code: "AEF" }],
    ])("%s", (_description, overrides) => {
      expect(allowedActions(overrides)).toEqual(canViewActions);
    });
  });

  describe("spatial files", () => {
    it.each(["site.shp", "site.shp.xml", "SITE.KML"])("%s can be archived but not replaced", (documentName) => {
      expect(allowedActions({ document_name: documentName })).toEqual([
        FileOperations.Download,
        FileOperations.Archive,
      ]);
    });

    it("plain xml files can be replaced", () => {
      expect(allowedActions({ document_name: "metadata.xml" })).toEqual([
        FileOperations.Download,
        FileOperations.Replace,
        FileOperations.Archive,
      ]);
    });
  });
});
