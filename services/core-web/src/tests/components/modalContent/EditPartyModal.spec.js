import React from "react";
import { shallow } from "enzyme";
import { EditPartyModal } from "@/components/modalContent/EditPartyModal";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.oSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.isPerson = true;
  props.provinceOptions = MOCK.DROPDOWN_PROVINCE_OPTIONS;
  props.parties = MOCK.PARTY.parties;
  props.partyGuid = MOCK.PARTY.parties[MOCK.PARTY.partyIds[0]].party_guid;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("EditPartyModal", () => {
  it("renders properly", () => {
    const component = shallow(<EditPartyModal {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
