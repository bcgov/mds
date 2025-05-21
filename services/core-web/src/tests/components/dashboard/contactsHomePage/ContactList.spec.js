import React from "react";
import { render } from "@testing-library/react";
import ContactList from "@/components/dashboard/contactsHomePage/ContactList";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";

const props = {};

const setupProps = () => {
  props.partyIds = MOCK.PARTY.partyIds;
  props.parties = MOCK.PARTY.partiesWithAppointments;
  props.relationshipTypeHash = MOCK.PARTY_RELATIONSHIP_TYPE_HASH;
};

beforeEach(() => {
  setupProps();
});

describe("ContactList", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><ContactList {...props} /></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
