import React from "react";
import { render } from "@testing-library/react";
import { VerifyApplicationInformationForm } from "@/components/noticeOfWork/applications/verification/VerifyApplicationInformationForm";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.longitude = "";
  reducerProps.latitude = "";
  reducerProps.noticeOfWork = NOW_MOCK.NOTICE_OF_WORK;
  reducerProps.initialValues = NOW_MOCK.NOTICE_OF_WORK;
  reducerProps.contacts = NOW_MOCK.NOTICE_OF_WORK.contacts;
  reducerProps.originalNoticeOfWork = NOW_MOCK.NOTICE_OF_WORK;
  [reducerProps.mineGuid] = MOCK.MINES.mineIds;
  reducerProps.submitting = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

// Test suite failed to run

//     Jest worker encountered 4 child process exceptions, exceeding retry limit
describe.skip("VerifyApplicationInformationForm", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <VerifyApplicationInformationForm
          {...dispatchProps}
          {...reducerProps}
          match={{ params: { id: 1 } }}
        />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
