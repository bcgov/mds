import React from "react";
import { shallow } from "enzyme";
import { EditPartyRelationshipForm } from "@/components/Forms/PartyRelationships/EditPartyRelationshipForm";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
};

const setupProps = () => {
  props.partyRelationship = { mine_party_appt_type_code: "EOR" };
  props.submitting = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("EditPartyRelationshipForm", () => {
  it("renders properly", () => {
    const component = shallow(<EditPartyRelationshipForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
