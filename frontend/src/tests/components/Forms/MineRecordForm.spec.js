import React from "react";
import { shallow } from "enzyme";
import { MineRecordForm } from "@/components/Forms/MineRecordForm";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.handleDelete = jest.fn();
  dispatchProps.change = jest.fn();
};

const setupProps = () => {
  props.title = "mockTitle";
  props.mineStatusOptions = MOCK.STATUS_OPTIONS.records;
  props.mineRegionOptions = MOCK.REGION_DROPDOWN_OPTIONS;
  props.mineTenureTypes = MOCK.TENURE_TYPES_DROPDOWN_OPTIONS;
  props.mineCommodityOptionsHash = MOCK.COMMODITY_OPTIONS_HASH;
  props.mineDisturbanceOptionsHash = MOCK.DISTURBANCE_OPTIONS_HASH;
  props.mine_types = MOCK.MINE_TYPES;
  props.mineTenureHash = MOCK.TENURE_HASH;
  props.conditionalDisturbanceOptions = MOCK.CONDITIONAL_DISTURBANCE_OPTIONS;
  props.conditionalCommodityOptions = MOCK.CONDITIONAL_COMMODITY_OPTIONS.records;
  props.currentMineTypes = MOCK.MINE_TYPES;
  props.submitting = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MineRecordForm", () => {
  it("renders properly", () => {
    const component = shallow(<MineRecordForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
