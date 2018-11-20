import React from "react";
import { shallow } from "enzyme";
import { Dashboard } from "@/components/dashboard/Dashboard";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchMineRecords = jest.fn(() => Promise.resolve({}));
  dispatchProps.createMineRecord = jest.fn();
  dispatchProps.fetchStatusOptions = jest.fn();
  dispatchProps.fetchRegionOptions = jest.fn();
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.location = { search: "" };
  reducerProps.history = { push: jest.fn() };
  reducerProps.mines = MOCK.MINES.mines;
  reducerProps.mineIds = MOCK.MINES.mineIds;
  reducerProps.pageData = MOCK.PAGE_DATA;
  reducerProps.mineStatusOptions = MOCK.STATUS_OPTIONS.options;
  reducerProps.mineRegionOptions = MOCK.REGION_OPTIONS.options;
  reducerProps.mineRegionHash = MOCK.REGION_HASH;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("Dashboard", () => {
  it("renders properly", () => {
    const component = shallow(
      <Dashboard {...dispatchProps} {...reducerProps} />
    );
    expect(component).toMatchSnapshot();
  });
});
