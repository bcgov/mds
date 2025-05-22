import React from "react";
import { render } from "@testing-library/react";
import TSFContact from "@/components/mine/ContactInfo/PartyRelationships/TSFContact";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";

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
    party: { party_guid: "party-guid" }
  };
  reducerProps.partyRelationshipTitle = "Engineer of Record";
  reducerProps.otherDetails = "other details";
  reducerProps.isEditable = false;
  reducerProps.compact = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("TSFContact", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><TSFContact {...dispatchProps} {...reducerProps} /></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
