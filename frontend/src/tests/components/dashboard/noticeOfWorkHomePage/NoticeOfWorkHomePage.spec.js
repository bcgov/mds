import React from "react";
import { shallow } from "enzyme";
import { NoticeOfWorkHomePage } from "@/components/dashboard/noticeOfWorkHomePage/NoticeOfWorkHomePage";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchNoticeOfWorkSubmissions = jest.fn(() => Promise.resolve({}));
  dispatchProps.fetchRegionOptions = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.location = { search: "mine_region=SW,NE" };
  reducerProps.history = {
    push: jest.fn(),
    location: {},
  };
  reducerProps.noticeOfWorkSubmissions = MOCK.NOW.applications;
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
