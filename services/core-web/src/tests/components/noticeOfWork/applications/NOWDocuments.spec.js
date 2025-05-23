import React from "react";
import { render } from "@testing-library/react";
import { NOWDocuments } from "@/components/noticeOfWork/applications/NOWDocuments";
import * as NOWMocks from "@mds/common/tests/mocks/noticeOfWorkMock";
import { BrowserRouter } from "react-router-dom";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { NOTICE_OF_WORK } from "@mds/common/constants/reducerTypes";

const dispatchProps = {
  updateNoticeOfWorkApplication: jest.fn(),
  openModal: jest.fn(),
  closeModal: jest.fn(),
  fetchImportedNoticeOfWorkApplication: jest.fn(),
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
};

const initialState = {
  [NOTICE_OF_WORK]: {
    noticeOfWork: NOWMocks.IMPORTED_NOTICE_OF_WORK,
    applicationDelays: [],
  }
};
describe("NOWDocuments", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper initialState={initialState}><BrowserRouter><NOWDocuments {...props} {...dispatchProps} /></BrowserRouter></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
