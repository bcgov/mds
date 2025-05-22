import React from "react";
import { render } from "@testing-library/react";
import { NOWSubmissionDocuments } from "@/components/noticeOfWork/applications/NOWSubmissionDocuments";
import * as NOWMocks from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";

const props = {};
const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.updateNoticeOfWorkApplication = jest.fn();
  dispatchProps.editNoticeOfWorkDocument = jest.fn();
  dispatchProps.fetchImportedNoticeOfWorkApplication = jest.fn();
  dispatchProps.deleteNoticeOfWorkApplicationDocument = jest.fn();
  dispatchProps.createNoticeOfWorkApplicationImportSubmissionDocumentsJob = jest.fn();
  dispatchProps.fetchImportNoticeOfWorkSubmissionDocumentsJob = jest.fn();
};

const setupProps = () => {
  props.noticeOfWork = NOWMocks.IMPORTED_NOTICE_OF_WORK;
  props.documents = [];
  props.noticeOfWorkApplicationDocumentTypeOptions = NOWMocks.DROPDOWN_APPLICATION_DOCUMENT_TYPES;
  props.isViewMode = false;
  props.selectedRows = null;
  props.categoriesToShow = ["ANS", "OTH"];
  props.disclaimerText = "This test is explaining the purpose of this section";
  props.isAdminView = false;
  props.addDescriptionColumn = true;
  props.importNowSubmissionDocumentsJob = {};
  props.noticeOfWorkApplicationDocumentTypeOptionsHash = {};
  props.now_application_guid = "23968472346";
  props.displayTableDescription = true;
  props.tableDescription = "mock description";
  props.hideImportStatusColumn = true;
  props.disableCategoryFilter = true;
  props.hideJobStatusColumn = false;
  props.showDescription = true;
  props.allowAfterProcess = true;
  props.isFinalPackageTable = true;
  props.isPackageModal = false;
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

const initialState = {
  [NOTICE_OF_WORK]: {
    noticeOfWork: NOWMocks.IMPORTED_NOTICE_OF_WORK,
    applicationDelays: [],
  }
}
describe("NOWSubmissionDocuments", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><ReduxWrapper initialState={initialState}><NOWSubmissionDocuments {...props} {...dispatchProps} /></ReduxWrapper></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
