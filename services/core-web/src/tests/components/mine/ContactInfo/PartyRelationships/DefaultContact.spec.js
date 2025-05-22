import React from "react";
import { render } from "@testing-library/react";
import DefaultContact from "@/components/mine/ContactInfo/PartyRelationships/DefaultContact";
import { BrowserRouter } from "react-router-dom";

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
  reducerProps.otherDetails = "other details";
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
    const { container: component } = render(<BrowserRouter><DefaultContact {...dispatchProps} {...reducerProps} /></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
