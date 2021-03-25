import React from "react";
import { shallow } from "enzyme";
import { AdminAmendmentApplication } from "@/components/noticeOfWork/applications/AdminAmendmentApplication";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.renderTabTitle = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.match = {};
  reducerProps.history = { push: jest.fn(), location: { state: {} } };
  reducerProps.noticeOfWork = NOW_MOCK.NOTICE_OF_WORK;
  reducerProps.applicationPageFromRoute = "mock/url";
  reducerProps.fixedTop = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("AdminAmendmentApplication", () => {
  it("renders properly", () => {
    const component = shallow(
      <AdminAmendmentApplication
        {...dispatchProps}
        {...reducerProps}
        match={{ params: { id: 1, tab: "application" } }}
      />
    );
    expect(component).toMatchSnapshot();
  });
});
