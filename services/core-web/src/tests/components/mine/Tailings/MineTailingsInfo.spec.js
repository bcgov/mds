import React from "react";
import { shallow } from "enzyme";
import { MineTailingsInfo } from "@/components/mine/Tailings/MineTailingsInfo";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.mines = MOCK.MINES.mines;
  [props.mineGuid] = MOCK.MINES.mineIds;
  props.mineReports = [];

  props.TSFOperatingStatusCodeHash = {};
  props.consequenceClassificationStatusCodeHash = {};
};

const setupDispatchProps = () => {
  dispatchProps.updateMineRecord = jest.fn();
  dispatchProps.updateMineReport = jest.fn();
  dispatchProps.deleteMineReport = jest.fn();
  dispatchProps.createTailingsStorageFacility = jest.fn();
  dispatchProps.fetchMineRecordById = jest.fn();
  dispatchProps.fetchMineReports = jest.fn(() => Promise.resolve());
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.fetchMineRecordById = jest.fn();
  dispatchProps.fetchPartyRelationships = jest.fn();
  dispatchProps.updateTailingsStorageFacility = jest.fn();
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("MineTailingsInfo", () => {
  it("renders properly", () => {
    const component = shallow(<MineTailingsInfo {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
