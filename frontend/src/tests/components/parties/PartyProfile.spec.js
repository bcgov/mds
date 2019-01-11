import React from "react";
import { shallow } from "enzyme";
import { PartyProfile } from "@/components/parties/PartyProfile";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchPartyById = jest.fn();
  dispatchProps.fetchPartyRelationships = jest.fn(() => Promise.resolve());
  dispatchProps.fetchPartyRelationshipTypes = jest.fn();
  dispatchProps.match = {};
};

const setupReducerProps = () => {
  reducerProps.parties = MOCK.PARTY.parties[MOCK.PARTY.partyIds[0]];
  reducerProps.partyRelationshipTypes = MOCK.PARTYRELATIONSHIPTYPES;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("PartyProfile", () => {
  it("renders properly", () => {
    const component = shallow(
      <PartyProfile
        {...dispatchProps}
        {...reducerProps}
        match={{ params: { id: 1 }, isExact: true, path: "", url: "" }}
      />
    );
    expect(component).toMatchSnapshot();
  });
});
