import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NOWDocuments } from "@/components/noticeOfWork/applications/NOWDocuments";
import * as NOWMocks from "@mds/common/tests/mocks/noticeOfWorkMock";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { AUTHENTICATION, NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";
import { USER_ROLES } from "@mds/common/constants/environment";

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
});
