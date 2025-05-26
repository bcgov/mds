import React from "react";
import { render } from "@testing-library/react";
import { DownloadDocumentPackageModal } from "@/components/modalContent/DownloadDocumentPackageModal";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import * as MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";


const dispatchProps = {
  onSubmit: jest.fn(),
};
const props = {
  title: "mockTitle",
  submissionDocuments: [],
  coreDocuments: [],
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

describe("DownloadDocumentPackageModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper initialState={initialState}><BrowserRouter><DownloadDocumentPackageModal {...dispatchProps} {...props} /></BrowserRouter></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
