import React from "react";
import { shallow } from "enzyme";
import { PartyProfile } from "@/components/parties/PartyProfile";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchPartyById = jest.fn(() => Promise.resolve({}));
  dispatchProps.fetchPartyRelationships = jest.fn(() => Promise.resolve());
  dispatchProps.fetchPartyRelationshipTypes = jest.fn(() => Promise.resolve());
  dispatchProps.fetchProvinceCodes = jest.fn();
  dispatchProps.fetchMineBasicInfoList = jest.fn(() => Promise.resolve());
  dispatchProps.openModal = jest.fn();
  dispatchProps.closrModal = jest.fn();
  dispatchProps.updateParty = jest.fn();
};

const setupReducerProps = () => {
  reducerProps.match = {};
  reducerProps.parties = {
    [MOCK.PARTY.partyIds[0]]: MOCK.PARTY.partiesWithAppointments[MOCK.PARTY.partyIds[0]],
  };
  reducerProps.partyRelationships = MOCK.PARTYRELATIONSHIPS;
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
        match={{ params: { id: MOCK.PARTY.partyIds[0] }, isExact: true, path: "", url: "" }}
      />
    );
    expect(component).toMatchSnapshot();
  });
});
