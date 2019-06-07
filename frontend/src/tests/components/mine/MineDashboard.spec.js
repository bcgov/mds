import React from "react";
import { shallow } from "enzyme";
import { MineDashboard } from "@/components/mine/MineDashboard";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchMineRecordById = jest.fn(() => Promise.resolve({}));
  dispatchProps.updateMineRecord = jest.fn();
  dispatchProps.fetchSubscribedMinesByUser = jest.fn();
  dispatchProps.subscribe = jest.fn();
  dispatchProps.unSubscribe = jest.fn();
  dispatchProps.createVariance = jest.fn();
  dispatchProps.fetchVariancesByMine = jest.fn();
  dispatchProps.fetchStatusOptions = jest.fn();
  dispatchProps.fetchRelationshipTypes = jest.fn();
  dispatchProps.fetchPartyRelationships = jest.fn(() => Promise.resolve());
  dispatchProps.fetchCoreUsers = jest.fn();
  dispatchProps.match = {};
  dispatchProps.fetchCoreUsers = jest.fn();
  dispatchProps.updateVariance = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  reducerProps.mines = MOCK.MINES.mines;
  reducerProps.mineIds = MOCK.MINES.mineIds;
  reducerProps.variances = MOCK.VARIANCES.records;
  reducerProps.complianceCodesHash = MOCK.HSRCM_HASH;
  reducerProps.complianceCodes = MOCK.DROPDOWN_HSRCM_CODES;
  reducerProps.mineStatusOptions = MOCK.STATUS_OPTIONS.records;
  reducerProps.mineRegionOptions = MOCK.REGION_OPTIONS.options;
  reducerProps.mineDisturbanceOptions = MOCK.DISTURBANCE_OPTIONS;
  reducerProps.mineTenureTypes = MOCK.TENURE_TYPES;
  reducerProps.mineTenureHash = MOCK.TENURE_HASH;
  reducerProps.coreUsers = MOCK.CORE_USERS.results;
  reducerProps.varianceStatusOptions = MOCK.VARIANCE_DROPDOWN_STATUS_OPTIONS;
  reducerProps.varianceStatusOptionsHash = MOCK.VARIANCE_STATUS_OPTIONS_HASH;
  reducerProps.userRoles = MOCK.USER_ACCESS_DATA;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("MineDashboard", () => {
  it("renders properly", () => {
    const component = shallow(
      <MineDashboard
        {...dispatchProps}
        {...reducerProps}
        match={{ params: { id: 1 }, isExact: true, path: "", url: "" }}
      />
    );
    expect(component).toMatchSnapshot();
  });
});
