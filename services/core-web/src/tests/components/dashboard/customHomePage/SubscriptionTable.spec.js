import React from "react";
import { render } from "@testing-library/react";
import { SubscriptionTable } from "@/components/dashboard/customHomePage/SubscriptionTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";

const dispatchProps = {
  unSubscribe: jest.fn(),
};
const reducerProps = {
  subscribedMines: MOCK.SUBSCRIBED_MINES.mines,
  mineCommodityOptionsHash: MOCK.COMMODITY_OPTIONS_HASH,
  mineRegionHash: MOCK.REGION_HASH,
  mineTenureHash: MOCK.TENURE_HASH,
};

describe("SubscriptionTable", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><SubscriptionTable {...dispatchProps} {...reducerProps} /></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
