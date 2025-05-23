import React from "react";
import { render } from "@testing-library/react";
import { RelationshipProfile } from "@/components/parties/RelationshipProfile";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const dispatchProps = {
  fetchMineRecordById: jest.fn(),
  fetchPermits: jest.fn(),
  fetchPartyRelationshipTypes: jest.fn(),
  fetchPartyRelationships: jest.fn(() => Promise.resolve()),
};
const reducerProps = {
  match: {},
  parties: MOCK.PARTY.parties[MOCK.PARTY.partyIds[0]],
  partyRelationships: MOCK.PARTY_RELATIONSHIPS,
  partyRelationshipTypes: MOCK.PARTY_RELATIONSHIP_TYPES,
  mines: MOCK.MINES,
};

describe("RelationshipProfile", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <RelationshipProfile
        {...dispatchProps}
        {...reducerProps}
        match={{ params: { id: 1 }, isExact: true, path: "", url: "" }}
      />
    );
    expect(component).toMatchSnapshot();
  });
});
