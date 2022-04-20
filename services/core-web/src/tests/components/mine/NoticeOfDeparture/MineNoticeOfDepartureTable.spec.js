import React from "react";
import { shallow } from "enzyme";
import { MineNoticeOfDepartureTable } from "@/components/mine/NoticeOfDeparture/MineNoticeOfDepartureTable";
import { NOTICES_OF_DEPARTURE } from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.openViewNodModal = jest.fn();
};

const setupProps = () => {
  props.nods = NOTICES_OF_DEPARTURE.records;
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("MineNoticeOfDepartureTable", () => {
  it("renders properly", () => {
    const component = shallow(<MineNoticeOfDepartureTable {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
