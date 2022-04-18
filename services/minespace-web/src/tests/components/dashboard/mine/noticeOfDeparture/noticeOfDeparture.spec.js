import React from "react";
import { shallow } from "enzyme";
import * as MOCK from "@/tests/mocks/dataMocks";
import { NoticeOfDeparture } from "@/components/dashboard/mine/noticeOfDeparture/NoticeOfDeparture";

const dispatchProps = {};
const reducerProps = {};

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
