import React from "react";
import { shallow } from "enzyme";
import Permittee from "@/components/mine/ContactInfo/PartyRelationships/Permittee";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.handleChange = jest.fn();
  dispatchProps.openEditPartyRelationshipModal = jest.fn();
  dispatchProps.onSubmitEditPartyRelationship = jest.fn();
  dispatchProps.removePartyRelationship = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.mine = MOCK.MINES.mines[MOCK.MINES.mineIds[0]];
  reducerProps.partyRelationship = { mine_party_appt_type_code: "PMT" };
  reducerProps.partyRelationshipTitle = "Permittee";
  reducerProps.otherDetails = {};
  reducerProps.isEditable = false;
  reducerProps.compact = false;
  reducerProps.permits = MOCK.MINE_BASIC_INFO[0].mine_permit;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("Permittee", () => {
  it("renders properly", () => {
    const component = shallow(<Permittee {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
