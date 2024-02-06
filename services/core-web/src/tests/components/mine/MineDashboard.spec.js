import React from "react";
import { shallow } from "enzyme";
import { MineDashboard } from "@/components/mine/MineDashboard";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchMineRecordById = jest.fn(() => Promise.resolve({}));
  dispatchProps.updateMineRecord = jest.fn(() => Promise.resolve());
  dispatchProps.fetchSubscribedMinesByUser = jest.fn(() => Promise.resolve());
  dispatchProps.subscribe = jest.fn(() => Promise.resolve());
  dispatchProps.unSubscribe = jest.fn(() => Promise.resolve());
  dispatchProps.createVariance = jest.fn(() => Promise.resolve());
  dispatchProps.fetchVarianceDocumentCategoryOptions = jest.fn(() => Promise.resolve());
  dispatchProps.fetchMineComplianceCodes = jest.fn(() => Promise.resolve());
  dispatchProps.fetchMineComplianceInfo = jest.fn(() => Promise.resolve());
  dispatchProps.fetchVariancesByMine = jest.fn(() => Promise.resolve());
  dispatchProps.fetchStatusOptions = jest.fn(() => Promise.resolve());
  dispatchProps.fetchMineDisturbanceOptions = jest.fn(() => Promise.resolve());
  dispatchProps.fetchRegionOptions = jest.fn(() => Promise.resolve());
  dispatchProps.fetchMineTenureTypes = jest.fn(() => Promise.resolve());
  dispatchProps.fetchMineCommodityOptions = jest.fn(() => Promise.resolve());
  dispatchProps.fetchRelationshipTypes = jest.fn(() => Promise.resolve());
  dispatchProps.fetchPartyRelationshipTypes = jest.fn(() => Promise.resolve());
  dispatchProps.fetchPartyRelationships = jest.fn(() => Promise.resolve());
  dispatchProps.fetchPermits = jest.fn(() => Promise.resolve());
  dispatchProps.fetchExplosivesPermits = jest.fn(() => Promise.resolve());
  dispatchProps.fetchPermitStatusOptions = jest.fn(() => Promise.resolve());
  dispatchProps.fetchInspectors = jest.fn(() => Promise.resolve());
  dispatchProps.updateVariance = jest.fn(() => Promise.resolve());
  dispatchProps.fetchVarianceStatusOptions = jest.fn(() => Promise.resolve());
  dispatchProps.fetchMineReportDefinitionOptions = jest.fn(() => Promise.resolve());
  dispatchProps.fetchMineReportStatusOptions = jest.fn(() => Promise.resolve());
  dispatchProps.fetchMineNoticeOfWorkApplications = jest.fn(() => Promise.resolve());
  dispatchProps.fetchAllPartyRelationships = jest.fn(() => Promise.resolve());
  dispatchProps.fetchMineReclamationInvoices = jest.fn(() => Promise.resolve());
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
        match={{ params: { id: MOCK.MINES.mineIds[0] }, isExact: true, path: "", url: "" }}
      />
    );
    expect(component).toMatchSnapshot();
  });
});
