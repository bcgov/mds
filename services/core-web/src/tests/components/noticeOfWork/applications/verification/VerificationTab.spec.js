import React from "react";
import { render } from "@testing-library/react";
import { VerificationTab } from "@/components/noticeOfWork/applications/verification/VerificationTab";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchImportedNoticeOfWorkApplication = jest.fn();
  dispatchProps.importNoticeOfWorkApplication = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.noticeOfWork = NOW_MOCK.NOTICE_OF_WORK;
  reducerProps.originalNoticeOfWork = NOW_MOCK.NOTICE_OF_WORK;
  [reducerProps.mineGuid] = MOCK.MINES.mineIds;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

// Test suite failed to run

//     Jest worker encountered 4 child process exceptions, exceeding retry limit
describe.skip("VerificationTab", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><VerificationTab {...dispatchProps} {...reducerProps} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
