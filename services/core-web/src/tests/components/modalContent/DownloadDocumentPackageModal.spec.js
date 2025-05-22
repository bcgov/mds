import React from "react";
import { render } from "@testing-library/react";
import { DownloadDocumentPackageModal } from "@/components/modalContent/DownloadDocumentPackageModal";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import * as MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";


const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
};

const setupProps = () => {
  props.title = "mockTitle";
  props.submissionDocuments = [];
  props.coreDocuments = [];
  props.mineGuid = "";
  props.noticeOfWorkGuid = "";
  props.documentDownloadState = { downloading: false, currentFile: 1, totalFiles: 1 };
  props.noticeOfWork = { filtered_submission_documents: [], documents: [] };
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

const initialState = {
  [NOTICE_OF_WORK]: {
    noticeOfWork: MOCK.IMPORTED_NOTICE_OF_WORK,
    applicationDelays: [],
  }
}

describe("DownloadDocumentPackageModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper initialState={initialState}><BrowserRouter><DownloadDocumentPackageModal {...dispatchProps} {...props} /></BrowserRouter></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
