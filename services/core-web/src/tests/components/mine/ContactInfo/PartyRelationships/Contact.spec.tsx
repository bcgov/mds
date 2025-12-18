import React from "react";
import { render } from "@testing-library/react";
import Contact from "@/components/mine/ContactInfo/PartyRelationships/Contact";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { BrowserRouter } from "react-router-dom";

const props = {
  mine: MOCK.MINES.mines[MOCK.MINES.mineIds[0]],
  partyRelationship: MOCK.PARTYRELATIONSHIPS[0],
  partyRelationshipTitle: "Permittee",
  permits: MOCK.PERMITS,
  otherDetails: "other details",
  isEditable: false,
  compact: false,
};

describe("Contact", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <Contact  {...props} />
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});
