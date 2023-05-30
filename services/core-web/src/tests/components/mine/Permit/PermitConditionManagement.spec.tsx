import React from "react";
import { shallow } from "enzyme";
import { PermitConditionManagement } from "@/components/mine/Permit/PermitConditionManagement";

const dispatchProps: any = {};
const props: any = {};

const setupDispatchProps = () => {
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.fetchPermitConditions = jest.fn();
  dispatchProps.setEditingConditionFlag = jest.fn();
  dispatchProps.deletePermitCondition = jest.fn();
  dispatchProps.updatePermitCondition = jest.fn();
  dispatchProps.fetchDraftPermitByNOW = jest.fn();
  dispatchProps.getPermitAmendment = jest.fn(() => Promise.resolve());
  dispatchProps.fetchMineRecordById = jest.fn(() => Promise.resolve());
};

const setupProps = () => {
  props.conditions = [];
  props.permitConditionCategoryOptions = [];
  props.editingConditionFlag = false;
  props.match = { params: { mine_guid: "" } };
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("PermitConditionManagement", () => {
  it("renders properly", () => {
    const component = shallow(<PermitConditionManagement {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
