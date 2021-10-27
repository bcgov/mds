import React from "react";
import { shallow } from "enzyme";
import { DefaultContact } from "@/components/mine/ContactInfo/PartyRelationships/DefaultContact";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.openEditPartyRelationshipModal = jest.fn();
  dispatchProps.onSubmitEditPartyRelationship = jest.fn();
  dispatchProps.handleChange = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.mine = { mine_guid: "3124624567" };
  reducerProps.partyRelationship = {
    mine_party_appt_type_code: "PMT",
    party: { party_guid: "253462" },
  };
  reducerProps.partyRelationshipTitle = "Permittee";
  reducerProps.partyRelationshipSubTitle = "Permittee since";
  reducerProps.otherDetails = {};
  reducerProps.isEditable = false;
  reducerProps.compact = false;
  reducerProps.editPermission = "Admin";
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("DefaultContact", () => {
  it("renders properly", () => {
    const component = shallow(<DefaultContact {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
