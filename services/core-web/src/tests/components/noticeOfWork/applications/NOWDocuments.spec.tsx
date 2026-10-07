import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NOWDocuments } from "@/components/noticeOfWork/applications/NOWDocuments";
import * as NOWMocks from "@mds/common/tests/mocks/noticeOfWorkMock";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { AUTHENTICATION, NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";
import { USER_ROLES } from "@mds/common/constants/environment";
import ReplaceDocumentModal from "@mds/common/components/documents/ReplaceDocumentModal";
import ArchiveDocumentModal from "@mds/common/components/documents/ArchiveDocumentModal";
import { NOTICE_OF_WORK_DOCUMENT_VERSION_UPLOAD } from "@mds/common/constants/API";
import { downloadFileFromDocumentManager } from "@mds/common/redux/utils/actionlessNetworkCalls";

jest.mock("@mds/common/redux/utils/actionlessNetworkCalls", () => ({
  ...jest.requireActual("@mds/common/redux/utils/actionlessNetworkCalls"),
  downloadFileFromDocumentManager: jest.fn(),
}));

jest.mock("antd", () => {
  const actual = jest.requireActual("antd");
  const Popconfirm = ({ title, onConfirm, okText, children }: any) => (
    <>
      {children}
      <div data-testid="popconfirm-title">{title}</div>
      <button type="button" onClick={onConfirm}>
        {okText}
      </button>
    </>
  );
  return { ...actual, Popconfirm };
});

const dispatchProps = {
  updateNoticeOfWorkApplication: jest.fn(),
  openModal: jest.fn(),
  closeModal: jest.fn(),
  fetchImportedNoticeOfWorkApplication: jest.fn(),
  deleteNoticeOfWorkApplicationDocument: jest.fn().mockResolvedValue(undefined),
  editNoticeOfWorkDocument: jest.fn(),
  sortNoticeOfWorkDocuments: jest.fn(),
  createNoticeOfWorkDocumentVersion: jest.fn(),
  archiveNoticeOfWorkDocuments: jest.fn(),
  openDocument: jest.fn(),
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
};

const initialState = {
  [NOTICE_OF_WORK]: {
    noticeOfWork: NOWMocks.IMPORTED_NOTICE_OF_WORK,
    applicationDelays: [],
  }
};

const renderComponent = (overrides: Record<string, unknown> = {}) =>
  render(
    <ReduxWrapper initialState={initialState}>
      <BrowserRouter>
        <NOWDocuments {...props} {...dispatchProps} {...overrides} />
      </BrowserRouter>
    </ReduxWrapper>
  );

// noticeOfWorkApplicationDocumentTypeOptionsHash isn't wired up in this unconnected render,
// so category resolution falls back to Strings.EMPTY_FIELD - irrelevant to the assertions below.
const orderedDocument = {
  now_application_document_xref_guid: "doc-xref-1",
  final_package_order: 0,
  is_final_package: true,
  permit_package_document_type_code: "DOCUMENT",
  description: "Test document",
  now_application_document_type_code: "OTH",
  mine_document: {
    mine_document_guid: "mine-doc-1",
    document_manager_guid: "doc-mgr-1",
    document_name: "test-file.pdf",
    upload_date: "2025-01-15",
  },
};

describe("NOWDocuments", () => {
  it("renders properly", () => {
    const { container: component } = renderComponent();
    expect(component).toMatchSnapshot();
  });

  it("shows an Order column when isFinalPackageTable and showOrderColumn are true", () => {
    const { getByText } = renderComponent({
      documents: [orderedDocument],
      isFinalPackageTable: true,
      showOrderColumn: true,
    });
    expect(getByText("Order")).toBeInTheDocument();
  });

  it("hides the Order column when showOrderColumn is false", () => {
    const { queryByText } = renderComponent({
      documents: [orderedDocument],
      isFinalPackageTable: true,
      showOrderColumn: false,
    });
    expect(queryByText("Order")).not.toBeInTheDocument();
  });

  it("renders order numbers in decimal format (1.N) by default", () => {
    const { container } = renderComponent({
      documents: [orderedDocument],
      isFinalPackageTable: true,
      showOrderColumn: true,
    });
    // No locked NTR row present, so the offset is 2: index 0 -> "1.2".
    expect(container.textContent).toMatch(/1\.2/);
  });

  it("renders order numbers without a decimal point when documentNumberFormat is 'whole'", () => {
    const { container } = renderComponent({
      documents: [orderedDocument],
      isFinalPackageTable: true,
      showOrderColumn: true,
      documentNumberFormat: "whole",
    });
    expect(container.textContent).not.toMatch(/1\.\d/);
  });

  it("renders a drag handle in the Order column when isSortingAllowed is true", () => {
    const { container } = renderComponent({
      documents: [orderedDocument],
      isFinalPackageTable: true,
      showOrderColumn: true,
      isSortingAllowed: true,
    });
    expect(container.querySelector(".anticon-menu")).not.toBeNull();
  });

  it("renders no drag handle when isSortingAllowed is false, even with the Order column visible", () => {
    const { container } = renderComponent({
      documents: [orderedDocument],
      isFinalPackageTable: true,
      showOrderColumn: true,
      isSortingAllowed: false,
    });
    expect(container.querySelector(".anticon-menu")).toBeNull();
  });

  describe("delete document reference warning", () => {
    const FILE_GUID = "figure-guid-123";

    const documentRow = () => ({
      now_application_document_xref_guid: FILE_GUID,
      now_application_document_type_code: "OTH",
      is_final_package: false,
      is_referral_package: false,
      is_consultation_package: false,
      description: "Test document",
      mine_document: {
        mine_document_guid: "mine-doc-guid",
        document_name: "test.pdf",
        document_manager_guid: "doc-manager-guid",
        upload_date: "2026-01-01",
      },
    });

    const authenticatedInitialState = {
      ...initialState,
      [AUTHENTICATION]: {
        userAccessData: [USER_ROLES.role_edit_permits],
      },
    };

    const renderWithReference = (referencesFile: boolean) =>
      render(
        <ReduxWrapper initialState={authenticatedInitialState}>
          <BrowserRouter>
            <NOWDocuments
              {...props}
              {...dispatchProps}
              isAdminView
              isStandardDocuments
              applicationDelay={{}}
              documents={[documentRow()]}
              draftPermitAmendment={{
                conditions: referencesFile
                  ? [{ condition: `See {permit_package_file:${FILE_GUID}}`, sub_conditions: [] }]
                  : [{ condition: "No reference here.", sub_conditions: [] }],
              }}
            />
          </BrowserRouter>
        </ReduxWrapper>
      );

    it("shows the reference warning for a file referenced in a permit condition", () => {
      renderWithReference(true);
      expect(screen.getByTestId("popconfirm-title").textContent).toContain(
        "This file is currently being referenced in a permit condition."
      );
    });

    it("shows the plain removal message for a file that isn't referenced anywhere", () => {
      renderWithReference(false);
      expect(screen.getByTestId("popconfirm-title").textContent).toBe(
        "Are you sure you want to remove this document?"
      );
    });

    it("still deletes the document when confirmed", async () => {
      renderWithReference(true);
      await userEvent.click(screen.getByRole("button", { name: "Delete" }));
      expect(dispatchProps.deleteNoticeOfWorkApplicationDocument).toHaveBeenCalled();
    });
  });

  describe("file management", () => {
    const APPLICATION_GUID = NOWMocks.IMPORTED_NOTICE_OF_WORK.now_application_guid;
    const XREF_GUID = "gov-doc-xref";
    const MINE_DOCUMENT_GUID = "gov-doc-mine-document";

    const governmentDocument = (overrides: Record<string, unknown> = {}) => ({
      now_application_document_xref_guid: XREF_GUID,
      now_application_document_type_code: "OTH",
      now_application_document_sub_type_code: "GDO",
      is_final_package: false,
      is_referral_package: false,
      is_consultation_package: false,
      description: "Test document",
      mine_document: {
        mine_document_guid: MINE_DOCUMENT_GUID,
        mine_guid: "mine-guid",
        document_name: "report-v2.pdf",
        document_manager_guid: "doc-manager-guid",
        upload_date: "2026-02-01",
        versions: [
          {
            mine_document_version_guid: "version-guid",
            document_manager_version_guid: "doc-manager-version-guid",
            document_name: "report-v1.pdf",
            upload_date: "2026-01-01",
          },
        ],
      },
      ...overrides,
    });

    const renderFileManagement = (overrides: Record<string, unknown> = {}) =>
      render(
        <ReduxWrapper initialState={initialState}>
          <BrowserRouter>
            <NOWDocuments
              {...props}
              {...dispatchProps}
              noticeOfWork={{
                ...NOWMocks.IMPORTED_NOTICE_OF_WORK,
                now_application_status_code: "REC",
              }}
              isAdminView
              isStandardDocuments
              applicationDelay={{}}
              userRoles={[USER_ROLES.role_edit_permits]}
              documents={[governmentDocument()]}
              enableFileManagement
              {...overrides}
            />
          </BrowserRouter>
        </ReduxWrapper>
      );

    const openActionsMenu = async (rowIndex = 0) => {
      await userEvent.hover(screen.getAllByRole("button", { name: /Actions/ })[rowIndex]);
      await screen.findByText("Download file");
    };

    const lastOpenModalCall = () =>
      dispatchProps.openModal.mock.calls[dispatchProps.openModal.mock.calls.length - 1][0];

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("doesn't show the Actions menu or version history unless enabled", () => {
      renderFileManagement({ enableFileManagement: false });

      expect(screen.queryByRole("button", { name: /Actions/ })).not.toBeInTheDocument();
      expect(document.querySelector(".expand-row-icon")).toBeNull();
    });

    it("shows the Actions menu and the number of previous versions", async () => {
      renderFileManagement();

      expect(screen.getByRole("button", { name: /Actions/ })).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();

      await openActionsMenu();
      expect(screen.getByText("Open in document viewer")).toBeInTheDocument();
      expect(screen.getByText("Replace file")).toBeInTheDocument();
      expect(screen.getByText("Archive file")).toBeInTheDocument();
      expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    });

    it("only offers view and download while the application is delayed", async () => {
      renderFileManagement({ applicationDelay: { start_date: "2026-01-01" } });

      await openActionsMenu();
      expect(screen.getByText("Open in document viewer")).toBeInTheDocument();
      expect(screen.queryByText("Replace file")).not.toBeInTheDocument();
      expect(screen.queryByText("Archive file")).not.toBeInTheDocument();
    });

    it("shows previous versions as download-only rows without the package columns", async () => {
      const { container } = renderFileManagement();

      await userEvent.click(container.querySelector(".expand-row-icon"));

      expect(screen.getByText("report-v1.pdf")).toBeInTheDocument();
      // Referral, Consultation and Permit Package columns only show for the current file
      expect(screen.getAllByText("No")).toHaveLength(3);

      await openActionsMenu(1);
      expect(screen.queryByText("Open in document viewer")).not.toBeInTheDocument();
      expect(screen.queryByText("Replace file")).not.toBeInTheDocument();
    });

    it("downloads a previous version when its file name is clicked", async () => {
      const { container } = renderFileManagement();

      await userEvent.click(container.querySelector(".expand-row-icon"));
      await userEvent.click(screen.getByRole("button", { name: "report-v1.pdf" }));

      expect(downloadFileFromDocumentManager).toHaveBeenCalledWith(
        expect.objectContaining({ document_manager_version_guid: "doc-manager-version-guid" })
      );
    });

    it("replaces the file through the NoW endpoints", async () => {
      renderFileManagement();

      await openActionsMenu();
      await userEvent.click(screen.getByText("Replace file"));

      const { content, props: modalProps } = lastOpenModalCall();
      expect(content).toBe(ReplaceDocumentModal);
      expect(modalProps.uploadUrl).toBe(
        NOTICE_OF_WORK_DOCUMENT_VERSION_UPLOAD(APPLICATION_GUID, MINE_DOCUMENT_GUID)
      );

      modalProps.createVersion("new-version-guid");
      expect(dispatchProps.createNoticeOfWorkDocumentVersion).toHaveBeenCalledWith(
        APPLICATION_GUID,
        MINE_DOCUMENT_GUID,
        "new-version-guid"
      );

      await modalProps.handleSubmit();
      expect(dispatchProps.fetchImportedNoticeOfWorkApplication).toHaveBeenCalledWith(APPLICATION_GUID);
    });

    it("archives the file, then refreshes the application and closes the modal", async () => {
      dispatchProps.archiveNoticeOfWorkDocuments.mockResolvedValue(undefined);
      renderFileManagement();

      await openActionsMenu();
      await userEvent.click(screen.getByText("Archive file"));

      const { content, props: modalProps } = lastOpenModalCall();
      expect(content).toBe(ArchiveDocumentModal);
      expect(modalProps.extraWarning).toBeUndefined();

      await modalProps.handleSubmit();
      expect(dispatchProps.archiveNoticeOfWorkDocuments).toHaveBeenCalledWith(APPLICATION_GUID, [
        MINE_DOCUMENT_GUID,
      ]);
      expect(dispatchProps.fetchImportedNoticeOfWorkApplication).toHaveBeenCalledWith(APPLICATION_GUID);
      expect(dispatchProps.closeModal).toHaveBeenCalled();
    });

    it("keeps the archive modal open when archiving fails", async () => {
      dispatchProps.archiveNoticeOfWorkDocuments.mockRejectedValue(new Error("400"));
      renderFileManagement();

      await openActionsMenu();
      await userEvent.click(screen.getByText("Archive file"));
      await lastOpenModalCall().props.handleSubmit();

      expect(dispatchProps.fetchImportedNoticeOfWorkApplication).not.toHaveBeenCalled();
      expect(dispatchProps.closeModal).not.toHaveBeenCalled();
    });

    it.each([
      [false, "This file is in the permit package. Archiving it will remove it from the permit package."],
      [true, "break that reference"],
    ])(
      "warns before archiving a permit package file (referenced in a condition: %s)",
      async (isReferenced, expectedWarning) => {
        renderFileManagement({
          documents: [governmentDocument({ is_final_package: true })],
          draftPermitAmendment: {
            conditions: isReferenced
              ? [{ condition: `See {permit_package_file:${XREF_GUID}}`, sub_conditions: [] }]
              : [],
          },
        });

        await openActionsMenu();
        await userEvent.click(screen.getByText("Archive file"));

        expect(lastOpenModalCall().props.extraWarning).toContain(expectedWarning);
      }
    );
  });
});
