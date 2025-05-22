import React from "react";
import { render } from "@testing-library/react";
import Contact from "@/components/mine/ContactInfo/PartyRelationships/Contact";
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
  reducerProps.partyRelationship = MOCK.PARTYRELATIONSHIPS[0];
  reducerProps.partyRelationshipTitle = "Permittee";
  reducerProps.permits = MOCK.MINE_BASIC_INFO[0].mine_permit;
  reducerProps.otherDetails = "other details";
  reducerProps.isEditable = false;
  reducerProps.compact = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("Contact", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><Contact {...dispatchProps} {...reducerProps} /></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
