import React from "react";
import { shallow } from "enzyme";
import { SubscriptionTable } from "@/components/dashboard/customHomePage/SubscriptionTable";
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

describe("SubscriptionTable", () => {
  it("renders properly", () => {
    const component = shallow(<SubscriptionTable {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
