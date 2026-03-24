import React from "react";
import { render } from "@testing-library/react";
import InactiveContact from "@/components/mine/ContactInfo/PartyRelationships/InactiveContact";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const reducerProps = {
  mine: MOCK.MINES.mines[MOCK.MINES.mineIds[0]],
  partyRelationshipTypeCode: "EOR",
  partyRelationshipTitle: "Engineer of Record",
};

describe("InactiveContact", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <InactiveContact {...reducerProps} />
    );
    expect(component).toMatchSnapshot();
  });
});
