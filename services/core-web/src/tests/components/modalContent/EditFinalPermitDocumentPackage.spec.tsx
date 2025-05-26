import React from "react";
import { render } from "@testing-library/react";
import { EditFinalPermitDocumentPackage } from "@/components/modalContent/EditFinalPermitDocumentPackage";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import * as MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";

const dispatchProps = {
  onSubmit: jest.fn(),
  closeModal: jest.fn(),
};
const props = {
  title: "mockTitle",
  documents: [],
  finalDocuments: [],
  mineGuid: "",
  noticeOfWorkGuid: "",
  documentDownloadState: { downloading: false, currentFile: 1, totalFiles: 1 },
  noticeOfWork: { filtered_submission_documents: [], documents: [] },
};

const initialState = {
  [NOTICE_OF_WORK]: {
    noticeOfWork: MOCK.IMPORTED_NOTICE_OF_WORK,
    applicationDelays: [],
  }
};

describe("EditFinalPermitDocumentPackage", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper initialState={initialState}><EditFinalPermitDocumentPackage {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
