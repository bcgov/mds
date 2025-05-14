import React from "react";
import { shallow } from "enzyme";
import { VerifyApplicationInformationForm } from "@/components/noticeOfWork/applications/verification/VerifyApplicationInformationForm";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

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

describe("VerifyApplicationInformationForm", () => {
  it("renders properly", () => {
    const component = shallow(
      <VerifyApplicationInformationForm
        {...dispatchProps}
        {...reducerProps}
        match={{ params: { id: 1 } }}
      />
    );
    expect(component).toMatchSnapshot();
  });
});
