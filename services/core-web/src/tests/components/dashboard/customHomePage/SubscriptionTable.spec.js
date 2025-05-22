import React from "react";
import { render } from "@testing-library/react";
import { SubscriptionTable } from "@/components/dashboard/customHomePage/SubscriptionTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";

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
    const { container: component } = render(<BrowserRouter><SubscriptionTable {...dispatchProps} {...reducerProps} /></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
