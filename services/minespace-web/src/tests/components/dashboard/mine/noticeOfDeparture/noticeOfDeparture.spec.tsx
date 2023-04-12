import React from "react";
import { shallow } from "enzyme";
import * as MOCK from "@/tests/mocks/dataMocks";
import { NoticeOfDeparture } from "@/components/dashboard/mine/noticeOfDeparture/NoticeOfDeparture";
// import * as original from "react-router-dom";

const dispatchProps: any = {};
const reducerProps: any = {};

function mockFunction() {

  // @ts-ignore
  const original = require.requireActual("react-router-dom");
  return {
    ...original,
    useParams: jest.fn().mockReturnValue({ id: "abcde1234567", activeTab: "nods?nod=xyz1234567" }),
    useLocation: jest.fn().mockReturnValue({
      pathname: "/mine/notice-of-departure",
      search: "",
      hash: "",
      state: null,
      key: "5nvxpbdafa",
    }),
  };
}

jest.mock("react-router-dom", () => mockFunction());

const setupDispatchProps = () => {
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.fetchPermits = jest.fn(() => Promise.resolve());
  dispatchProps.fetchNoticesOfDeparture = jest.fn(() => Promise.resolve());
  dispatchProps.createNoticeOfDeparture = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  reducerProps.permits = MOCK.PERMITS.permits;
  reducerProps.nods = MOCK.NOTICES_OF_DEPARTURE.records;
  reducerProps.isAuthenticated = true;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("NoticesOfDeparture", () => {
  it("renders properly", () => {
    const component = shallow(<NoticeOfDeparture {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
