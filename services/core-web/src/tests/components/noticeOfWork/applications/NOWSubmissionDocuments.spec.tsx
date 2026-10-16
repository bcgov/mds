import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { USER_ROLES } from "@mds/common/constants/environment";
import { NOWSubmissionDocuments } from "@/components/noticeOfWork/applications/NOWSubmissionDocuments";
import * as NOWMocks from "@mds/common/tests/mocks/noticeOfWorkMock";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";

const dispatchProps = {
  openModal: jest.fn(),
  closeModal: jest.fn(),
  updateNoticeOfWorkApplication: jest.fn(),
  editNoticeOfWorkDocument: jest.fn(),
  fetchImportedNoticeOfWorkApplication: jest.fn(),
  deleteNoticeOfWorkApplicationDocument: jest.fn(),
  createNoticeOfWorkApplicationImportSubmissionDocumentsJob: jest.fn(),
  fetchImportNoticeOfWorkSubmissionDocumentsJob: jest.fn(),
};
const props = {
  noticeOfWork: NOWMocks.IMPORTED_NOTICE_OF_WORK,
  documents: [],
  noticeOfWorkApplicationDocumentTypeOptions: NOWMocks.DROPDOWN_APPLICATION_DOCUMENT_TYPES,
  isViewMode: false,
  selectedRows: null,
  categoriesToShow: ["ANS", "OTH"],
  disclaimerText: "This test is explaining the purpose of this section",
  isAdminView: false,
  addDescriptionColumn: true,
  importNowSubmissionDocumentsJob: {},
  noticeOfWorkApplicationDocumentTypeOptionsHash: {},
  now_application_guid: "23968472346",
  displayTableDescription: true,
  tableDescription: "mock description",
  hideImportStatusColumn: true,
  disableCategoryFilter: true,
  hideJobStatusColumn: false,
  showDescription: true,
  allowAfterProcess: true,
};

const initialState = {
  [NOTICE_OF_WORK]: {
    noticeOfWork: NOWMocks.IMPORTED_NOTICE_OF_WORK,
    applicationDelays: [],
  }
};
const spatialDocument = (filename: string) => ({
  mine_document_guid: `guid-${filename}`,
  document_manager_guid: `dm-${filename}`,
  filename,
  category: "Spatial File",
  is_imported_submission: true,
});

// Documents added in Core arrive as a now_application_document_xref: the bundle id is buried on
// the nested mine_document, so only the guids can be matched against the panel.
const coreAddedDocument = (filename: string) => ({
  now_application_document_xref_guid: `xref-${filename}`,
  mine_document_guid: `guid-${filename}`,
  document_manager_guid: `dm-${filename}`,
  filename,
  category: "No Interest Acknowledgement Form",
  notForImport: true,
  mine_document: {
    mine_document_guid: `guid-${filename}`,
    document_manager_guid: `dm-${filename}`,
    document_name: filename,
    mine_document_bundle_id: 7,
  },
});

const renderTable = (overrides = {}) =>
  render(
    <ReduxWrapper initialState={initialState}>
      <BrowserRouter>
        <NOWSubmissionDocuments {...props} {...dispatchProps} {...overrides} />
      </BrowserRouter>
    </ReduxWrapper>
  );

describe("NOWSubmissionDocuments", () => {
  it("renders properly", () => {
    const { container: component } = renderTable();
    expect(component).toMatchSnapshot();
  });

  describe("spatial file rows", () => {
    const spatialDocuments = [
      spatialDocument("Antler_2026.shp"),
      spatialDocument("Antler_2026.dbf"),
      spatialDocument("Antler_2026.prj"),
      { ...spatialDocument("application.pdf"), category: "Application" },
    ];

    // Bundle 7 holds the shapefile parts, so the panel lists exactly those three files.
    const withValidatedBundle = {
      noticeOfWork: {
        ...NOWMocks.IMPORTED_NOTICE_OF_WORK,
        spatial_document_bundles: [
          {
            bundle_id: 7,
            validation_status: "VALID",
            bundle_documents: [
              { mine_document_guid: "guid-Antler_2026.shp", document_manager_guid: "dm-Antler_2026.shp" },
              { mine_document_guid: "guid-Antler_2026.dbf", document_manager_guid: "dm-Antler_2026.dbf" },
              { mine_document_guid: "guid-Antler_2026.prj", document_manager_guid: "dm-Antler_2026.prj" },
            ],
          },
        ],
      },
    };

    it("gives every shapefile part its own row", () => {
      const { getByText } = renderTable({ documents: spatialDocuments });

      expect(getByText("Antler_2026.shp")).toBeInTheDocument();
      expect(getByText("Antler_2026.dbf")).toBeInTheDocument();
      expect(getByText("Antler_2026.prj")).toBeInTheDocument();
      expect(getByText("application.pdf")).toBeInTheDocument();
    });

    it("renders the per-document columns on spatial rows like any other document", () => {
      const { getByText } = renderTable({ documents: spatialDocuments });

      const spatialRow = getByText("Antler_2026.shp").closest("tr");
      const pdfRow = getByText("application.pdf").closest("tr");

      expect(within(spatialRow).queryAllByTitle(/Package$/)).toHaveLength(
        within(pdfRow).queryAllByTitle(/Package$/).length
      );
      expect(within(spatialRow).queryAllByTitle(/Package$/).length).toBeGreaterThan(0);
    });

    it("leaves rows plain where no Spatial Files panel sits above the table", () => {
      const { getByText, queryAllByText } = renderTable({
        documents: spatialDocuments,
        ...withValidatedBundle,
      });

      expect(queryAllByText("in Spatial Files above")).toHaveLength(0);
      expect(getByText("Antler_2026.shp").closest("tr")).not.toHaveClass("spatial-file-row");
    });

    it("links the rows listed in the panel and asks it to scroll when clicked", () => {
      const onSpatialFileLinkClick = jest.fn();
      const { getByText, getAllByText } = renderTable({
        documents: spatialDocuments,
        onSpatialFileLinkClick,
        ...withValidatedBundle,
      });

      expect(getAllByText("in Spatial Files above")).toHaveLength(3);

      const spatialRow = getByText("Antler_2026.shp").closest("tr");
      fireEvent.click(within(spatialRow).getByText("in Spatial Files above"));

      expect(onSpatialFileLinkClick).toHaveBeenCalled();
    });

    // Their bundle id never reaches the top level of the record, so guid matching is what saves them.
    it("tints documents added in Core that the panel lists", () => {
      const { getByText } = renderTable({
        documents: [coreAddedDocument("Antler_2026.shp"), coreAddedDocument("report.pdf")],
        onSpatialFileLinkClick: jest.fn(),
        ...withValidatedBundle,
      });

      const bundledRow = getByText("Antler_2026.shp").closest("tr");

      expect(bundledRow).toHaveClass("spatial-file-row");
      expect(within(bundledRow).getByText("in Spatial Files above")).toBeInTheDocument();
      expect(getByText("report.pdf").closest("tr")).not.toHaveClass("spatial-file-row");
    });

    // The tint marks exactly the rows carrying the link, so the two never disagree.
    it("tints the linked rows so they read as a set", () => {
      const { getByText } = renderTable({
        documents: spatialDocuments,
        onSpatialFileLinkClick: jest.fn(),
        ...withValidatedBundle,
      });

      expect(getByText("Antler_2026.shp").closest("tr")).toHaveClass("spatial-file-row");
      expect(getByText("application.pdf").closest("tr")).not.toHaveClass("spatial-file-row");
    });

    it("leaves spatial files that are not in the Spatial Files panel untouched", () => {
      const unvalidated = [
        spatialDocument("Orphan_2026.shp"),
        spatialDocument("Pending_2026.shp"),
      ];
      const { getByText, queryAllByText } = renderTable({
        documents: unvalidated,
        onSpatialFileLinkClick: jest.fn(),
        ...withValidatedBundle,
      });

      expect(getByText("Orphan_2026.shp").closest("tr")).not.toHaveClass("spatial-file-row");
      expect(getByText("Pending_2026.shp").closest("tr")).not.toHaveClass("spatial-file-row");
      expect(queryAllByText("in Spatial Files above")).toHaveLength(0);
    });
  });

  describe("file management", () => {
    const APPLICATION_GUID = NOWMocks.IMPORTED_NOTICE_OF_WORK.now_application_guid;

    // vFCBC submission documents arrive flat, with their previous versions at the top level
    const importedDocument = (overrides: Record<string, unknown> = {}) => ({
      id: 1,
      messageid: 1,
      documenturl: "https://vfcbc/application.pdf",
      documenttype: "Application Form",
      filename: "application-v2.pdf",
      now_application_document_xref_guid: "imported-xref",
      mine_document_guid: "imported-mine-doc",
      document_manager_guid: "imported-doc-manager",
      is_final_package: false,
      is_referral_package: false,
      is_consultation_package: false,
      versions: [
        {
          mine_document_version_guid: "imported-version",
          document_manager_version_guid: "imported-doc-manager-version",
          document_name: "application-v1.pdf",
        },
      ],
      ...overrides,
    });

    // Documents added in Core are mapped like this by NOWApplicationManageDocuments
    const coreApplicationDocument = (overrides: Record<string, unknown> = {}) => ({
      ...coreAddedDocument("water-plan.pdf"),
      now_application_document_sub_type_code: "AAF",
      is_final_package: false,
      ...overrides,
    });

    const renderFileManagement = (overrides: Record<string, unknown> = {}) =>
      renderTable({
        noticeOfWork: { ...NOWMocks.IMPORTED_NOTICE_OF_WORK, now_application_status_code: "REC" },
        isAdminView: true,
        userRoles: [USER_ROLES.role_edit_permits],
        documents: [importedDocument()],
        enableFileManagement: true,
        createNoticeOfWorkDocumentVersion: jest.fn(),
        archiveNoticeOfWorkDocuments: jest.fn().mockResolvedValue(undefined),
        openDocument: jest.fn(),
        ...overrides,
      });

    const openActionsMenu = async () => {
      await userEvent.hover(screen.getByRole("button", { name: /Actions/ }));
      await screen.findByText("Download file");
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("doesn't show the Actions menu or version history unless enabled", () => {
      renderFileManagement({ enableFileManagement: false });

      expect(screen.queryByRole("button", { name: /Actions/ })).not.toBeInTheDocument();
      expect(document.querySelector(".expand-row-icon")).toBeNull();
    });

    it.each([
      ["only when file management is enabled", { enableFileManagement: false }, false],
      ["on Application Documents", {}, true],
      ["not in the Create Final Application Package modal", { isPackageModal: true }, false],
    ])("offers Download All %s", (_description, overrides, isShown) => {
      renderFileManagement(overrides);

      expect(Boolean(screen.queryByRole("button", { name: /Download All/ }))).toBe(isShown);
    });

    it.each([
      ["an imported vFCBC document", importedDocument()],
      ["a document added in Core", coreApplicationDocument()],
    ])("lets %s be replaced and archived", async (_description, document) => {
      renderFileManagement({ documents: [document] });

      await openActionsMenu();
      expect(screen.getByText("Replace file")).toBeInTheDocument();
      expect(screen.getByText("Archive file")).toBeInTheDocument();
    });

    it("doesn't offer any actions for a vFCBC document that hasn't been imported yet", () => {
      renderFileManagement({
        documents: [
          importedDocument({ mine_document_guid: undefined, document_manager_guid: undefined, versions: [] }),
        ],
      });

      expect(screen.queryByRole("button", { name: /Actions/ })).not.toBeInTheDocument();
    });

    it("shows the current name of a replaced vFCBC file", () => {
      renderFileManagement({
        documents: [importedDocument({ filename: "original.pdf", document_name: "replaced.pdf" })],
        hideImportStatusColumn: false,
      });

      expect(screen.getByText("replaced.pdf")).toBeInTheDocument();
      expect(screen.queryByText("original.pdf")).not.toBeInTheDocument();
      expect(screen.getByText("Success")).toBeInTheDocument();
    });

    it("only lets a permit package document be viewed and downloaded once the application is decided", async () => {
      renderFileManagement({
        noticeOfWork: { ...NOWMocks.IMPORTED_NOTICE_OF_WORK, now_application_status_code: "AIA" },
        documents: [importedDocument({ is_final_package: true })],
      });

      await openActionsMenu();
      expect(screen.queryByText("Replace file")).not.toBeInTheDocument();
      expect(screen.queryByText("Archive file")).not.toBeInTheDocument();
    });

    it("leaves the per-document cells empty on previous versions", async () => {
      const { container } = renderFileManagement({ hideImportStatusColumn: false });

      await userEvent.click(container.querySelector(".expand-row-icon"));

      expect(screen.getByRole("button", { name: "application-v1.pdf" })).toBeInTheDocument();
      expect(screen.getAllByTitle("Part of Permit")).toHaveLength(1);
      expect(screen.getAllByTitle("Referral Package")).toHaveLength(1);
      expect(screen.getAllByTitle("Consultation Package")).toHaveLength(1);
      expect(screen.getAllByTitle("Import Status")).toHaveLength(1);
    });

    it("doesn't tint or link previous versions of a file in the Spatial Files panel", async () => {
      const { container } = renderFileManagement({
        onSpatialFileLinkClick: jest.fn(),
        noticeOfWork: {
          ...NOWMocks.IMPORTED_NOTICE_OF_WORK,
          now_application_status_code: "REC",
          spatial_document_bundles: [
            { bundle_id: 1, bundle_documents: [{ mine_document_guid: "imported-mine-doc" }] },
          ],
        },
      });

      await userEvent.click(container.querySelector(".expand-row-icon"));

      expect(screen.getAllByText("in Spatial Files above")).toHaveLength(1);
      expect(container.querySelectorAll(".spatial-file-row")).toHaveLength(1);
    });

    it("archives the file from Application Documents, then refreshes the application", async () => {
      const archiveNoticeOfWorkDocuments = jest.fn().mockResolvedValue(undefined);
      renderFileManagement({ archiveNoticeOfWorkDocuments });

      await openActionsMenu();
      await userEvent.click(screen.getByText("Archive file"));

      const { props: modalProps } = dispatchProps.openModal.mock.calls[0][0];
      expect(modalProps.alertDescription).toContain("removes this file from Application Documents");

      await modalProps.handleSubmit();
      expect(archiveNoticeOfWorkDocuments).toHaveBeenCalledWith(APPLICATION_GUID, ["imported-mine-doc"]);
      expect(dispatchProps.fetchImportedNoticeOfWorkApplication).toHaveBeenCalledWith(APPLICATION_GUID);
    });
  });
});
