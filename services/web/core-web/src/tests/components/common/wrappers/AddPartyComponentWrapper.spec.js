import React from "react";
import { shallow } from "enzyme";
import { AddPartyComponentWrapper } from "@/components/common/wrappers/AddPartyComponentWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.closeModal = jest.fn();
  dispatchProps.content = jest.fn();
  dispatchProps.clearOnSubmit = false;
  dispatchProps.createParty = jest.fn();
  dispatchProps.setAddPartyFormState = jest.fn();
};

const setupProps = () => {
  props.childProps = {
    title: "mockTitle",
  };

  props.addPartyFormState = {
    showingAddPartyForm: false,
    person: true,
    organization: true,
    partyLabel: "contact",
  };
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AddPartyComponentWrapper", () => {
  it("renders properly", () => {
    const wrapper = shallow(<AddPartyComponentWrapper {...dispatchProps} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
