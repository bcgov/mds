import React from "react";
import { render } from "@testing-library/react";
import { CustomHomePage } from "@/components/dashboard/customHomePage/CustomHomePage";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";

const dispatchProps = {
  fetchSubscribedMinesByUser: jest.fn(() => Promise.resolve()),
  fetchMineTenureTypes: jest.fn(),
  fetchMineComplianceCodes: jest.fn(),
  fetchRegionOptions: jest.fn(),
  openModal: jest.fn(),
  closeModal: jest.fn(),
  fetchMineCommodityOptions: jest.fn(),
  unSubscribe: jest.fn(),
};
const reducerProps = {
  subscribedMines: MOCK.SUBSCRIBED_MINES.mines,
  mineRegionHash: MOCK.REGION_HASH,
  mineCommodityOptionsHash: MOCK.COMMODITY_OPTIONS_HASH,
  mineTenureHash: MOCK.TENURE_HASH,
};

// Test suite failed to run
//
//     Jest worker encountered 4 child process exceptions, exceeding retry limit
describe("CustomHomePage", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><CustomHomePage {...dispatchProps} {...reducerProps} /></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
