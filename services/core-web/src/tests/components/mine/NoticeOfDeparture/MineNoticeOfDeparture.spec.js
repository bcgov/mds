import React from "react";
import { shallow } from "enzyme";
import { MineNoticeOfDeparture } from "@/components/mine/NoticeOfDeparture/MineNoticeOfDeparture";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

function mockFunction() {
  const original = require.requireActual("react-router-dom");
  return {
    ...original,
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
  dispatchProps.fetchNoticesOfDeparture = jest.fn(() => Promise.resolve());
  dispatchProps.fetchDetailedNoticeOfDeparture = jest.fn(() => Promise.resolve());
  dispatchProps.fetchPermits = jest.fn(() => Promise.resolve());
};

const setupReducerProps = () => {
  reducerProps.mines = MOCK.MINES.mines;
  [reducerProps.mineGuid] = MOCK.MINES.mineIds;
  reducerProps.nods = MOCK.NOTICES_OF_DEPARTURE.records;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("MineNoticeOfDeparture", () => {
  it("renders properly", () => {
    const component = shallow(<MineNoticeOfDeparture {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
