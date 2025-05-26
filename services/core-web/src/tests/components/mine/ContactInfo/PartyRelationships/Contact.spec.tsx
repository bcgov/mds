import React from "react";
import { render } from "@testing-library/react";
import Contact from "@/components/mine/ContactInfo/PartyRelationships/Contact";
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
  partyRelationship: MOCK.PARTYRELATIONSHIPS[0],
  partyRelationshipTitle: "Permittee",
  permits: MOCK.MINE_BASIC_INFO[0].mine_permit,
  otherDetails: "other details",
  isEditable: false,
  compact: false,
};

describe("Contact", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter>
      {/* @ts-ignore */}
      <Contact {...dispatchProps} {...reducerProps} />
    </BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
