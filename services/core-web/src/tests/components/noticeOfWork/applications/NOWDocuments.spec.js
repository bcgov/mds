import React from "react";
import { render } from "@testing-library/react";
import { NOWDocuments } from "@/components/noticeOfWork/applications/NOWDocuments";
import * as NOWMocks from "@mds/common/tests/mocks/noticeOfWorkMock";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";

const props = {};
const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.updateNoticeOfWorkApplication = jest.fn();
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.fetchImportedNoticeOfWorkApplication = jest.fn();
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
describe("NOWDocuments", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper initialState={initialState}><BrowserRouter><NOWDocuments {...props} {...dispatchProps} /></BrowserRouter></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
