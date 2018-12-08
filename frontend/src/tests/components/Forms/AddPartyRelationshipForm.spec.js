import React from "react";
import { shallow } from "enzyme";
import { AddPartyRelationshipForm } from "@/components/Forms/PartyRelationships/AddPartyRelationshipForm";

const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
};

beforeEach(() => {
  setupDispatchProps();
});

describe("AddPartyRelationshipForm", () => {
  it("renders properly", () => {
    const component = shallow(<AddPartyRelationshipForm {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
