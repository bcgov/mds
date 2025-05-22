import React from "react";
import { render } from "@testing-library/react";
import { PermitPackage } from "@/components/noticeOfWork/applications/PermitPackage";
import * as NOWMocks from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";

const props = {};
const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.change = jest.fn();
  dispatchProps.updateNoticeOfWorkApplication = jest.fn();
  dispatchProps.fetchImportedNoticeOfWorkApplication = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.openModal = jest.fn();
  dispatchProps.setNoticeOfWorkApplicationDocumentDownloadState = jest.fn();
};

const setupProps = () => {
  props.noticeOfWork = NOWMocks.IMPORTED_NOTICE_OF_WORK;
  props.isAdminView = true;
  props.isTableHeaderView = true;
  props.importNowSubmissionDocumentsJob = {};
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
describe("PermitPackage", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><ReduxWrapper initialState={initialState}><PermitPackage {...props} {...dispatchProps} /></ReduxWrapper></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
