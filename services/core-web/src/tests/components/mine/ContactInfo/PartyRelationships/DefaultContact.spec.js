import React from "react";
import { render } from "@testing-library/react";
import DefaultContact from "@/components/mine/ContactInfo/PartyRelationships/DefaultContact";
import { BrowserRouter } from "react-router-dom";

const dispatchProps = {
  openEditPartyRelationshipModal: jest.fn(),
  onSubmitEditPartyRelationship: jest.fn(),
  handleChange: jest.fn(),
};
const reducerProps = {
  mine: { mine_guid: "3124624567" },
  partyRelationship: {
    mine_party_appt_type_code: "PMT",
    party: { party_guid: "253462" },
  },
  partyRelationshipTitle: "Permittee",
  partyRelationshipSubTitle: "Permittee since",
  otherDetails: "other details",
  isEditable: false,
  compact: false,
  editPermission: "Admin",
};

describe("DefaultContact", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><DefaultContact {...dispatchProps} {...reducerProps} /></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
