import React from "react";
import { render } from "@testing-library/react";
import { FinalPermitDocuments } from "@/components/noticeOfWork/applications/FinalPermitDocuments";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { IMPORTED_NOTICE_OF_WORK } from "@mds/common/tests/mocks/noticeOfWorkMock";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";

const dispatchProps = {
  setNoticeOfWorkApplicationDocumentDownloadState: jest.fn(),
  updateNoticeOfWorkApplication: jest.fn(),
  fetchImportedNoticeOfWorkApplication: jest.fn(),
  closeModal: jest.fn(),
  openModal: jest.fn(),
};
const props = {
  documents: [],
  mineGuid: MOCK.MINES.mineIds[0],
  noticeOfWork: IMPORTED_NOTICE_OF_WORK,
  documentDownloadState: { downloading: false, currentFile: 1, totalFiles: 1 },
  progress: {},
};

const initialState = {
  [NOTICE_OF_WORK]: {
    noticeOfWork: IMPORTED_NOTICE_OF_WORK,
    applicationDelays: [],
  }
};
describe("FinalPermitDocuments", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><ReduxWrapper initialState={initialState}><FinalPermitDocuments {...dispatchProps} {...props} /></ReduxWrapper></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
