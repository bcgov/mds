import React from "react";
import { shallow } from "enzyme";
import { AddPartyRelationshipForm } from "@/components/Forms/PartyRelationships/AddPartyRelationshipForm";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
  dispatchProps.fetchPartyRelationships = jest.fn(() => Promise.resolve());
};

const setupProps = () => {
  [props.partyRelationshipType] = MOCK.PARTY_RELATIONSHIP_TYPES;
  props.submitting = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AddPartyRelationshipForm", () => {
  it("renders properly", () => {
    const component = shallow(<AddPartyRelationshipForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
