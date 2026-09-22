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
describe("NOWDocuments", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper initialState={initialState}><BrowserRouter><NOWDocuments {...props} {...dispatchProps} /></BrowserRouter></ReduxWrapper>);
    expect(component).toMatchSnapshot();
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
