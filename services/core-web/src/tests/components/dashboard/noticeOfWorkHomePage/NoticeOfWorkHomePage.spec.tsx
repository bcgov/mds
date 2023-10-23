import React from "react";
import { shallow } from "enzyme";
import { NoticeOfWorkHomePage } from "@/components/dashboard/noticeOfWorkHomePage/NoticeOfWorkHomePage";
import * as MOCK from "@/tests/mocks/dataMocks";
import { INoticeOfWork, IOption } from "@mds/common";

const dispatchProps = {
  fetchNoticeOfWorkApplications: jest.fn(() => Promise.resolve({} as INoticeOfWork)),
  fetchRegionOptions: jest.fn(),
  fetchNoticeOfWorkApplicationStatusOptions: jest.fn(),
  fetchNoticeOfWorkApplicationTypeOptions: jest.fn(),
};

const NowApplications: INoticeOfWork[] = MOCK.NOW.applications;
const reducerProps = {
  noticeOfWorkApplications: NowApplications,
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
  dispatchProps.fetchNoticeOfWorkApplications = jest.fn(() => Promise.resolve({} as INoticeOfWork));
  dispatchProps.fetchRegionOptions = jest.fn();
  dispatchProps.fetchNoticeOfWorkApplicationStatusOptions = jest.fn();
  dispatchProps.fetchNoticeOfWorkApplicationTypeOptions = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.noticeOfWorkApplications = NowApplications;

  reducerProps.pageData = MOCK.PAGE_DATA;
};

const requiredProps = {
  mineRegionHash: {},
  mineRegionOptions: {} as IOption,
  applicationTypeOptions: {} as IOption,
  applicationStatusOptions: {} as IOption,
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
