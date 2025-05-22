import React from "react";
import { render } from "@testing-library/react";
import { ProcessPermit } from "@/components/noticeOfWork/applications/process/ProcessPermit";
import * as NOWMocks from "@mds/common/tests/mocks/noticeOfWorkMock";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";

const props = {};
const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.fetchApplicationDelay = jest.fn();
  dispatchProps.updateNoticeOfWorkStatus = jest.fn();
  dispatchProps.fetchDraftPermitByNOW = jest.fn();
  dispatchProps.fetchImportedNoticeOfWorkApplication = jest.fn();
};

const setupProps = () => {
  props.noticeOfWork = NOWMocks.IMPORTED_NOTICE_OF_WORK;
  props.draftPermit = MOCK.PERMITS[0];
  props.draftAmendment = MOCK.PERMITS[0].permit_amendments;
  props.progress = [];
  props.progressStatusCodes = [];
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("ProcessPermit", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><ReduxWrapper><ProcessPermit {...props} {...dispatchProps} /></ReduxWrapper></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
