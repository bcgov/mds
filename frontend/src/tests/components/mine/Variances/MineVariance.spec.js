import React from "react";
import { shallow } from "enzyme";
import { MineVariance } from "@/components/mine/Variances/MineVariance";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.createVariance = jest.fn();
  dispatchProps.fetchVariancesByMine = jest.fn(() => Promise.resolve());
  dispatchProps.addDocumentToVariance = jest.fn();
  dispatchProps.updateVariance = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.mines = MOCK.MINES.mines;
  [reducerProps.mineGuid] = MOCK.MINES.mineIds;
  reducerProps.varianceApplications = MOCK.VARIANCES.records;
  reducerProps.approvedVariances = MOCK.VARIANCES.records;
  reducerProps.complianceCodesHash = MOCK.HSRCM_HASH;
  reducerProps.complianceCodes = MOCK.DROPDOWN_HSRCM_CODES;
  reducerProps.coreUsers = MOCK.PARTY.parties;
  reducerProps.varianceStatusOptions = MOCK.VARIANCE_DROPDOWN_STATUS_OPTIONS;
  reducerProps.varianceStatusOptionsHash = MOCK.VARIANCE_STATUS_OPTIONS_HASH;
  reducerProps.inspectors = MOCK.INSPECTORS.results;
  reducerProps.varianceDocumentCategoryOptions = {};
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("MineVariance", () => {
  it("renders properly", () => {
    const component = shallow(<MineVariance {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
