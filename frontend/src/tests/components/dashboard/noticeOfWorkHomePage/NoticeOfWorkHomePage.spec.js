import React from "react";
import { shallow } from "enzyme";
import { NoticeOfWorkHomePage } from "@/components/dashboard/noticeOfWorkHomePage/NoticeOfWorkHomePage";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchNoticeOfWorkApplications = jest.fn(() => Promise.resolve({}));
};

const setupReducerProps = () => {
  reducerProps.location = { search: " " };
  reducerProps.history = {
    push: jest.fn(),
    location: {},
  };
  reducerProps.noticeOfWorkApplications = MOCK.NOW.applications;
  reducerProps.pageData = MOCK.PAGE_DATA;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("NoticeOfWorkHomePage", () => {
  it("renders properly", () => {
    const component = shallow(<NoticeOfWorkHomePage {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
