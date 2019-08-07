import React from "react";
import { shallow } from "enzyme";
import { MineHeader } from "@/components/mine/MineHeader";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.updateMineRecord = jest.fn();
  dispatchProps.fetchMineRecordById = jest.fn();
  dispatchProps.removeMineType = jest.fn();
  dispatchProps.createTailingsStorageFacility = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.openModal = jest.fn();
};

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  props.mineStatusOptions = MOCK.STATUS_OPTIONS.records;
  props.mineRegionOptions = MOCK.REGION_DROPDOWN_OPTIONS;
  props.mineRegionHash = MOCK.REGION_HASH;
  props.mineTenureTypes = MOCK.TENURE_TYPES_DROPDOWN_OPTIONS;
  props.mineTenureHash = MOCK.TENURE_HASH;
  [props.transformedMineTypes] = MOCK.MINE_TYPES;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MineHeader", () => {
  it("renders dispatchProperly", () => {
    const component = shallow(<MineHeader {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
