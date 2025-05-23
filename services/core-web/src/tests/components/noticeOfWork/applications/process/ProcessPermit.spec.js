import React from "react";
import { render } from "@testing-library/react";
import { ProcessPermit } from "@/components/noticeOfWork/applications/process/ProcessPermit";
import * as NOWMocks from "@mds/common/tests/mocks/noticeOfWorkMock";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";

const dispatchProps = {
  openModal: jest.fn(),
  closeModal: jest.fn(),
  fetchApplicationDelay: jest.fn(),
  updateNoticeOfWorkStatus: jest.fn(),
  fetchDraftPermitByNOW: jest.fn(),
  fetchImportedNoticeOfWorkApplication: jest.fn(),
};
const props = {
  noticeOfWork: NOWMocks.IMPORTED_NOTICE_OF_WORK,
  draftPermit: MOCK.PERMITS[0],
  draftAmendment: MOCK.PERMITS[0].permit_amendments,
  progress: [],
  progressStatusCodes: [],
};

describe("ProcessPermit", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><ReduxWrapper><ProcessPermit {...props} {...dispatchProps} /></ReduxWrapper></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
