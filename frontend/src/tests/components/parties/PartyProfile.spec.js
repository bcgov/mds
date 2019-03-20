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
  dispatchProps.fetchProvinceCodes = jest.fn();
  dispatchProps.fetchMineBasicInfoList = jest.fn();
  dispatchProps.openModal = jest.fn();
  dispatchProps.closrModal = jest.fn();
  dispatchProps.updateParty = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.match = {};
  reducerProps.parties = MOCK.PARTY.parties[MOCK.PARTY.partyIds[0]];
  reducerProps.partyRelationships = MOCK.PARTY_RELATIONSHIPS;
  reducerProps.partyRelationshipTypeHash = MOCK.PARTY_RELATIONSHIP_TYPE_HASH;
  reducerProps.mineBasicInfoListHash = MOCK.MINE_INFO_HASH;
  reducerProps.provinceOptions = MOCK.DROPDOWN_PROVINCE_OPTIONS;
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
