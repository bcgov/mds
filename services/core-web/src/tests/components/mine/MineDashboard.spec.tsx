import React from "react";
import { shallow } from "enzyme";
import { MineDashboard } from "@/components/mine/MineDashboard";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const dispatchProps = {
  fetchMineRecordById: jest.fn(() => Promise.resolve({})),
  updateMineRecord: jest.fn(() => Promise.resolve()),
  fetchSubscribedMinesByUser: jest.fn(() => Promise.resolve()),
  subscribe: jest.fn(() => Promise.resolve()),
  unSubscribe: jest.fn(() => Promise.resolve()),
  createVariance: jest.fn(() => Promise.resolve()),
  fetchVarianceDocumentCategoryOptions: jest.fn(() => Promise.resolve()),
  fetchMineComplianceCodes: jest.fn(() => Promise.resolve()),
  fetchMineComplianceInfo: jest.fn(() => Promise.resolve()),
  fetchVariancesByMine: jest.fn(() => Promise.resolve()),
  fetchStatusOptions: jest.fn(() => Promise.resolve()),
  fetchMineDisturbanceOptions: jest.fn(() => Promise.resolve()),
  fetchRegionOptions: jest.fn(() => Promise.resolve()),
  fetchMineTenureTypes: jest.fn(() => Promise.resolve()),
  fetchMineCommodityOptions: jest.fn(() => Promise.resolve()),
  fetchRelationshipTypes: jest.fn(() => Promise.resolve()),
  fetchPartyRelationshipTypes: jest.fn(() => Promise.resolve()),
  fetchPartyRelationships: jest.fn(() => Promise.resolve()),
  fetchPermits: jest.fn(() => Promise.resolve()),
  fetchExplosivesPermits: jest.fn(() => Promise.resolve()),
  fetchPermitStatusOptions: jest.fn(() => Promise.resolve()),
  fetchInspectors: jest.fn(() => Promise.resolve()),
  updateVariance: jest.fn(() => Promise.resolve()),
  fetchVarianceStatusOptions: jest.fn(() => Promise.resolve()),
  fetchMineReportDefinitionOptions: jest.fn(() => Promise.resolve()),
  fetchMineReportStatusOptions: jest.fn(() => Promise.resolve()),
  fetchMineNoticeOfWorkApplications: jest.fn(() => Promise.resolve()),
  fetchAllPartyRelationships: jest.fn(() => Promise.resolve()),
  fetchMineReclamationInvoices: jest.fn(() => Promise.resolve()),
};

const reducerProps = {
  match: {},
  location: { pathname: "" },
  mine: MOCK.MINES.mines[MOCK.MINES.mineIds[0]],
  mines: MOCK.MINES.mines,
  mineIds: MOCK.MINES.mineIds,
  variances: MOCK.VARIANCES.records,
  complianceCodesHash: MOCK.HSRCM_HASH,
  complianceCodes: MOCK.DROPDOWN_HSRCM_CODES,
  mineStatusOptions: MOCK.STATUS_OPTIONS.records,
  mineRegionOptions: MOCK.REGION_DROPDOWN_OPTIONS,
  mineDisturbanceOptions: MOCK.DISTURBANCE_OPTIONS,
  mineTenureTypes: MOCK.TENURE_TYPES_DROPDOWN_OPTIONS,
  mineTenureHash: MOCK.TENURE_HASH,
  varianceStatusOptions: MOCK.VARIANCE_DROPDOWN_STATUS_OPTIONS,
  varianceStatusOptionsHash: MOCK.VARIANCE_STATUS_OPTIONS_HASH,
  varianceDocumentCategoryOptions: MOCK.VARIANCE_DOCUMENT_CATEGORY_OPTIONS_DROPDOWN,
  userRoles: MOCK.USER_ACCESS_DATA,
};

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
