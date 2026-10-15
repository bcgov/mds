import {
  getArchivePermitPackageWarning,
  getFileManagementContext,
  getFileNameOffset,
  openArchiveFileModal,
  toFileManagementRow,
} from "@/components/noticeOfWork/applications/nowFileManagement";
import { FileOperations } from "@mds/common/models/documents/document";
import { USER_ROLES } from "@mds/common/constants/environment";

describe("nowFileManagement", () => {
  const XREF_GUID = "xref-guid";
  const referencingConditions = [
    { condition: `See {permit_package_file:${XREF_GUID}}`, sub_conditions: [] },
  ];

  describe("openArchiveFileModal", () => {
    const archiveModalProps = (record) => {
      const openModal = jest.fn();
      openArchiveFileModal({
        record,
        applicationGuid: "application-guid",
        conditions: [],
        openModal,
        closeModal: jest.fn(),
        archiveNoticeOfWorkDocuments: jest.fn(),
        onArchived: jest.fn(),
      });
      return openModal.mock.calls[0][0].props;
    };

    it("tells the user a government document leaves Government Documents", () => {
      expect(
        archiveModalProps({ now_application_document_sub_type_code: "GDO" }).alertDescription
      ).toContain("removes this file from Government Documents");
    });

    it.each(["AAF", "MDO", "SDO", undefined])(
      "tells the user a %s document leaves Application Documents",
      (subTypeCode) => {
        expect(
          archiveModalProps({ now_application_document_sub_type_code: subTypeCode })
            .alertDescription
        ).toContain("removes this file from Application Documents");
      }
    );
  });

  describe("getArchivePermitPackageWarning", () => {
    it("doesn't warn for a file outside the permit package", () => {
      expect(
        getArchivePermitPackageWarning(
          { is_final_package: false, now_application_document_xref_guid: XREF_GUID },
          referencingConditions
        )
      ).toBeUndefined();
    });

    it("warns that a permit package file will be removed from the package", () => {
      expect(
        getArchivePermitPackageWarning(
          { is_final_package: true, now_application_document_xref_guid: XREF_GUID },
          []
        )
      ).toBe(
        "This file is in the permit package. Archiving it will remove it from the permit package."
      );
    });

    it("also warns about a broken reference when a permit condition references the file", () => {
      expect(
        getArchivePermitPackageWarning(
          { is_final_package: true, now_application_document_xref_guid: XREF_GUID },
          referencingConditions
        )
      ).toContain("break that reference");
    });
  });

  describe("toFileManagementRow", () => {
    it("keeps the model's version rows when the row also has the raw versions from the API", () => {
      const row = toFileManagementRow(
        {
          filename: "replaced.pdf",
          mine_document_guid: "mine-doc-guid",
          document_manager_guid: "doc-mgr-guid",
          is_imported_submission_document: true,
          // vFCBC rows have their versions at the top level, without allowed actions or a document_manager_guid
          versions: [
            {
              mine_document_version_guid: "version-guid",
              document_manager_version_guid: "doc-mgr-version-guid",
              document_name: "original.pdf",
              document_manager_guid: null,
            },
          ],
        },
        getFileManagementContext({
          noticeOfWork: { now_application_status_code: "REC" },
          applicationDelay: undefined,
          isViewMode: false,
          userRoles: [USER_ROLES.role_edit_permits],
        })
      );

      expect(row.versions[0].allowed_actions).toEqual([
        FileOperations.View,
        FileOperations.Download,
      ]);
      expect(row.versions[0].document_manager_guid).toBe("doc-mgr-guid");
    });
  });

  describe("getFileNameOffset", () => {
    // Like Major Projects, names line up whether or not the expand icon sits beside them
    it("offsets a file with versions past the expand icon beside it", () => {
      expect(getFileNameOffset({ number_prev_versions: 2 })).toEqual({ marginLeft: "14px" });
    });

    it("offsets a previous version to line up with the file names above it", () => {
      expect(getFileNameOffset({ mine_document_version_guid: "version-guid" })).toEqual({
        marginLeft: "38px",
      });
    });

    it("leaves a file without versions to documentWithTag, which already offsets it", () => {
      expect(getFileNameOffset({ number_prev_versions: 0 })).toEqual({});
    });
  });

  describe("getFileManagementContext", () => {
    it("treats the application as delayed only when there's an active delay", () => {
      const context = (applicationDelay) =>
        getFileManagementContext({
          noticeOfWork: { now_application_status_code: "REC" },
          applicationDelay,
          isViewMode: false,
          userRoles: ["role"],
        });

      expect(context({}).is_delayed).toBe(false);
      expect(context({ delay_type_code: "OAB" })).toEqual({
        now_application_status_code: "REC",
        is_delayed: true,
        is_view_mode: false,
        user_roles: ["role"],
      });
    });
  });
});
