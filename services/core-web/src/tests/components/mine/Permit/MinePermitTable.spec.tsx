import React from "react";
import { shallow } from "enzyme";
import { MinePermitTable } from "@/components/mine/Permit/MinePermitTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps: any = {};
const props: any = {};

jest.mock("@mds/common/providers/featureFlags/useFeatureFlag", () => ({
  useFeatureFlag: () => ({
    isFeatureEnabled: () => true,
  }),
}));

const setupDispatchProps = () => {
  dispatchProps.openEditPermitModal = jest.fn();
  dispatchProps.openAddPermitAmendmentModal = jest.fn();
  dispatchProps.openAddAmalgamatedPermitModal = jest.fn();
  dispatchProps.openAddPermitHistoricalAmendmentModal = jest.fn();
  dispatchProps.openEditAmendmentModal = jest.fn();
  dispatchProps.onExpand = jest.fn();
  dispatchProps.handleDeletePermit = jest.fn();
  dispatchProps.handleDeletePermitAmendment = jest.fn();
  dispatchProps.handlePermitAmendmentIssueVC = jest.fn();
  dispatchProps.openEditSitePropertiesModal = jest.fn();
  dispatchProps.openViewConditionModal = jest.fn();
};

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  props.permits = MOCK.MINES.mines[MOCK.MINES.mineIds[0]].mine_permit_numbers;
  props.partyRelationships = MOCK.PARTYRELATIONSHIPS;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MinePermitTable", () => {
  it("renders properly", () => {
    const component = shallow(<MinePermitTable {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
