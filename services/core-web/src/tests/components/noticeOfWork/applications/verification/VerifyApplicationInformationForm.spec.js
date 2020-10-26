import React from "react";
import { shallow } from "enzyme";
import { VerifyApplicationInformationForm } from "@/components/noticeOfWork/applications/verification/VerifyApplicationInformationForm";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
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
