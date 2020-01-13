import React from "react";
import { shallow } from "enzyme";
import { RelationshipProfile } from "@/components/parties/RelationshipProfile";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchMineRecordById = jest.fn();
  dispatchProps.fetchPermits = jest.fn();
  dispatchProps.fetchPartyRelationshipTypes = jest.fn();
  dispatchProps.fetchPartyRelationships = jest.fn(() => Promise.resolve());
};

const setupReducerProps = () => {
  reducerProps.match = {};
  reducerProps.parties = MOCK.PARTY.parties[MOCK.PARTY.partyIds[0]];
  reducerProps.partyRelationships = MOCK.PARTY_RELATIONSHIPS;
  reducerProps.partyRelationshipTypes = MOCK.PARTY_RELATIONSHIP_TYPES;
  reducerProps.mines = MOCK.MINES;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("RelationshipProfile", () => {
  it("renders properly", () => {
    const component = shallow(
      <RelationshipProfile
        {...dispatchProps}
        {...reducerProps}
        match={{ params: { id: 1 }, isExact: true, path: "", url: "" }}
      />
    );
    expect(component).toMatchSnapshot();
  });
});
