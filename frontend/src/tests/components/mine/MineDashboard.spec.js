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
  dispatchProps.fetchVarianceDocumentCategoryOptions = jest.fn();
  dispatchProps.fetchMineComplianceCodes = jest.fn();
  dispatchProps.fetchVariancesByMine = jest.fn();
  dispatchProps.fetchStatusOptions = jest.fn();
  dispatchProps.fetchMineDisturbanceOptions = jest.fn();
  dispatchProps.fetchRegionOptions = jest.fn();
  dispatchProps.fetchMineTenureTypes = jest.fn();
  dispatchProps.fetchMineCommodityOptions = jest.fn();
  dispatchProps.fetchRelationshipTypes = jest.fn();
  dispatchProps.fetchPartyRelationshipTypes = jest.fn();
  dispatchProps.fetchPartyRelationships = jest.fn(() => Promise.resolve());
  dispatchProps.fetchPermitStatusOptions = jest.fn(() => Promise.resolve());
  dispatchProps.fetchInspectors = jest.fn();
  dispatchProps.updateVariance = jest.fn();
  dispatchProps.fetchVarianceStatusOptions = jest.fn();
  dispatchProps.fetchMineReportDefinitionOptions = jest.fn();
  dispatchProps.fetchMineReportStatusOptions = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.match = {};
  reducerProps.location = { pathname: "" };
  reducerProps.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  reducerProps.mines = MOCK.MINES.mines;
  reducerProps.mineIds = MOCK.MINES.mineIds;
  reducerProps.variances = MOCK.VARIANCES.records;
  reducerProps.complianceCodesHash = MOCK.HSRCM_HASH;
  reducerProps.complianceCodes = MOCK.DROPDOWN_HSRCM_CODES;
  reducerProps.mineStatusOptions = MOCK.STATUS_OPTIONS.records;
  reducerProps.mineRegionOptions = MOCK.REGION_DROPDOWN_OPTIONS;
  reducerProps.mineDisturbanceOptions = MOCK.DISTURBANCE_OPTIONS;
  reducerProps.mineTenureTypes = MOCK.TENURE_TYPES_DROPDOWN_OPTIONS;
  reducerProps.mineTenureHash = MOCK.TENURE_HASH;
  reducerProps.varianceStatusOptions = MOCK.VARIANCE_DROPDOWN_STATUS_OPTIONS;
  reducerProps.varianceStatusOptionsHash = MOCK.VARIANCE_STATUS_OPTIONS_HASH;
  reducerProps.varianceDocumentCategoryOptions = MOCK.VARIANCE_DOCUMENT_CATEGORY_OPTIONS_DROPDOWN;
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
