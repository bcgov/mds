import React from "react";
import { render } from "@testing-library/react";
import { FinalPermitDocuments } from "@/components/noticeOfWork/applications/FinalPermitDocuments";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { IMPORTED_NOTICE_OF_WORK } from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.setNoticeOfWorkApplicationDocumentDownloadState = jest.fn();
  dispatchProps.updateNoticeOfWorkApplication = jest.fn();
  dispatchProps.fetchImportedNoticeOfWorkApplication = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.openModal = jest.fn();
};

const setupProps = () => {
  props.documents = [];
  [props.mineGuid] = MOCK.MINES.mineIds;
  props.noticeOfWork = IMPORTED_NOTICE_OF_WORK;
  props.documentDownloadState = { downloading: false, currentFile: 1, totalFiles: 1 };
  props.progress = {};
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

const initialState = {
  [NOTICE_OF_WORK]: {
    noticeOfWork: IMPORTED_NOTICE_OF_WORK,
    applicationDelays: [],
  }
}
describe("FinalPermitDocuments", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><ReduxWrapper initialState={initialState}><FinalPermitDocuments {...dispatchProps} {...props} /></ReduxWrapper></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
