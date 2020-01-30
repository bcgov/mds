import React from "react";
import { shallow } from "enzyme";
import { ViewPartyRelationships } from "@/components/mine/ContactInfo/ViewPartyRelationships";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.handleChange = jest.fn();
  dispatchProps.createParty = jest.fn();
  dispatchProps.fetchParties = jest.fn();
  dispatchProps.fetchMineRecordById = jest.fn();
  dispatchProps.addPartyRelationship = jest.fn();
  dispatchProps.fetchPartyRelationships = jest.fn(() => Promise.resolve());
  dispatchProps.createTailingsStorageFacility = jest.fn();
  dispatchProps.fetchMineRecordById = jest.fn();
  dispatchProps.updatePartyRelationship = jest.fn();
  dispatchProps.removePartyRelationship = jest.fn();
};

const setupProps = () => {
  props.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("ViewPartyRelationships", () => {
  it("renders properly", () => {
    const component = shallow(<ViewPartyRelationships {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
