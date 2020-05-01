import React from "react";
import { shallow } from "enzyme";
import { NoticeOfWorkHomePage } from "@/components/dashboard/noticeOfWorkHomePage/NoticeOfWorkHomePage";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchNoticeOfWorkApplications = jest.fn(() => Promise.resolve({}));
  dispatchProps.fetchRegionOptions = jest.fn();
  dispatchProps.fetchNoticeOfWorkApplicationStatusOptions = jest.fn();
  dispatchProps.fetchNoticeOfWorkApplicationTypeOptions = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.location = { search: "mine_region=SW,NE" };
  reducerProps.history = {
    replace: jest.fn(),
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
