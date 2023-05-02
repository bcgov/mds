import React from "react";
import { shallow } from "enzyme";
import TSFContact from "@/components/mine/ContactInfo/PartyRelationships/TSFContact";
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
  reducerProps.partyRelationship = {
    mine_party_appt_type_code: "EOR",
    related_guid: "e2629897-053e-4218-9299-479375e47f78",
  };
  reducerProps.partyRelationshipTitle = "Engineer of Record";
  reducerProps.otherDetails = {};
  reducerProps.isEditable = false;
  reducerProps.compact = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("TSFContact", () => {
  it("renders properly", () => {
    const component = shallow(<TSFContact {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
