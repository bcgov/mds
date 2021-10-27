import React from "react";
import { shallow } from "enzyme";
import Contact from "@/components/mine/ContactInfo/PartyRelationships/Contact";
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
  reducerProps.mine = MOCK.MINES.mines[0];
  reducerProps.partyRelationship = { mine_party_appt_type_code: "PMT" };
  reducerProps.partyRelationshipTitle = "Permittee";
  reducerProps.permits = MOCK.MINE_BASIC_INFO[0].mine_permit;
  reducerProps.otherDetails = {};
  reducerProps.isEditable = false;
  reducerProps.compact = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("Contact", () => {
  it("renders properly", () => {
    const component = shallow(<Contact {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
