import React from "react";
import { shallow } from "enzyme";
import { MineSubscriptionTable } from "@/components/dashboard/customHomePage/MineSubscriptionTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.unSubscribe = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.subscribedMines = MOCK.SUBSCRIBED_MINES.mines;
  reducerProps.mineCommodityOptionsHash = MOCK.COMMODITY_OPTIONS_HASH;
  reducerProps.mineRegionHash = MOCK.REGION_HASH;
  reducerProps.mineTenureHash = MOCK.TENURE_HASH;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("MineSubscriptionTable", () => {
  it("renders properly", () => {
    const component = shallow(<MineSubscriptionTable {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
