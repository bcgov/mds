import React from "react";
import { render } from "@testing-library/react";
import { EditFinalPermitDocumentPackage } from "@/components/modalContent/EditFinalPermitDocumentPackage";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import * as MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.title = "mockTitle";
  props.documents = [];
  props.finalDocuments = [];
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

describe("EditFinalPermitDocumentPackage", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper initialState={initialState}><EditFinalPermitDocumentPackage {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
