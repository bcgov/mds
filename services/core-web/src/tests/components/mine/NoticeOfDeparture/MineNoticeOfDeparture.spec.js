import React from "react";
import { shallow } from "enzyme";
import { MineNoticeOfDeparture } from "@/components/mine/NoticeOfDeparture/MineNoticeOfDeparture";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.fetchNoticesOfDeparture = jest.fn(() => Promise.resolve());
  dispatchProps.fetchPermits = jest.fn(() => Promise.resolve());
};

const setupReducerProps = () => {
  reducerProps.mines = MOCK.MINES.mines;
  [reducerProps.mineGuid] = MOCK.MINES.mineIds;
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
