import React from "react";
import { render } from "@testing-library/react";
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
describe("NOWSubmissionDocuments", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper initialState={initialState}><BrowserRouter><NOWSubmissionDocuments {...props} {...dispatchProps} /></BrowserRouter></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
