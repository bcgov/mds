import React from "react";
import { shallow } from "enzyme";
import { CustomHomePage } from "@/components/dashboard/customHomePage/CustomHomePage";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchSubscribedMinesByUser = jest.fn(() => Promise.resolve());
  dispatchProps.fetchMineTenureTypes = jest.fn();
  dispatchProps.fetchMineComplianceCodes = jest.fn();
  dispatchProps.fetchRegionOptions = jest.fn();
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.fetchMineCommodityOptions = jest.fn();
  dispatchProps.unSubscribe = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.subscribedMines = MOCK.SUBSCRIBED_MINES.mines;
  reducerProps.mineRegionHash = MOCK.REGION_HASH;
  reducerProps.mineCommodityOptionsHash = MOCK.COMMODITY_OPTIONS_HASH;
  reducerProps.mineTenureHash = MOCK.TENURE_HASH;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("CustomHomePage", () => {
  it("renders properly", () => {
    const component = shallow(<CustomHomePage {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
