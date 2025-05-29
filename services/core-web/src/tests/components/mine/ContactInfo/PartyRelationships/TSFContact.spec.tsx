import React from "react";
import { render } from "@testing-library/react";
import TSFContact from "@/components/mine/ContactInfo/PartyRelationships/TSFContact";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";

const dispatchProps = {
  handleChange: jest.fn(),
  openEditPartyRelationshipModal: jest.fn(),
  onSubmitEditPartyRelationship: jest.fn(),
  removePartyRelationship: jest.fn(),
};

const reducerProps = {
  mine: MOCK.MINES.mines[MOCK.MINES.mineIds[0]],
  partyRelationship: {
    mine_party_appt_type_code: "EOR",
    related_guid: "e2629897-053e-4218-9299-479375e47f78",
    party: { party_guid: "party-guid" },
  },
  partyRelationshipTitle: "Engineer of Record",
  otherDetails: "other details",
  isEditable: false,
  compact: false,
};

describe("TSFContact", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        {/* @ts-ignore Something is set up improperly with otherDetails */}
        <TSFContact {...dispatchProps} {...reducerProps} />
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});
