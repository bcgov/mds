import React from "react";
import { shallow } from "enzyme";
import { NoticeOfWorkHomePage } from "@/components/dashboard/noticeOfWorkHomePage/NoticeOfWorkHomePage";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {
  fetchNoticeOfWorkApplications: jest.fn(() => Promise.resolve({})),
  fetchRegionOptions: jest.fn(),
  fetchNoticeOfWorkApplicationStatusOptions: jest.fn(),
  fetchNoticeOfWorkApplicationTypeOptions: jest.fn(),
};
const reducerProps = {
  noticeOfWorkApplications: MOCK.NOW.applications,
  pageData: MOCK.PAGE_DATA,
};

function mockFunction() {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useLocation: jest.fn().mockReturnValue({
      search: "mine_region=SW,NE",
    }),
    useHistory: jest.fn().mockReturnValue({
      replace: jest.fn(),
    }),
  };
}

jest.mock("react-router-dom", () => mockFunction());

const setupDispatchProps = () => {
  dispatchProps.fetchNoticeOfWorkApplications = jest.fn(() => Promise.resolve({}));
  dispatchProps.fetchRegionOptions = jest.fn();
  dispatchProps.fetchNoticeOfWorkApplicationStatusOptions = jest.fn();
  dispatchProps.fetchNoticeOfWorkApplicationTypeOptions = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.noticeOfWorkApplications = MOCK.NOW.applications;
  reducerProps.pageData = MOCK.PAGE_DATA;
};

const requiredProps = {
  mineRegionHash: {},
  mineRegionOptions: {},
  applicationTypeOptions: [],
  applicationStatusOptions: [],
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("NoticeOfWorkHomePage", () => {
  it("renders properly", () => {
    const component = shallow(
      <NoticeOfWorkHomePage {...dispatchProps} {...reducerProps} {...requiredProps} />
    );
    expect(component).toMatchSnapshot();
  });
});
