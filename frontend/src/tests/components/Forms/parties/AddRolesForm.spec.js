import React from "react";
import { shallow } from "enzyme";
import { AddRolesForm } from "@/components/Forms/parties/AddRolesForm";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.togglePartyChange = jest.fn();
};

const setupProps = () => {
  props.addField = () => {};
  props.removeField = () => {};
  props.handleChange = () => {};
  props.handleSelect = () => {};
  props.roleNumbers = [];
  props.partyRelationshipTypesList = [];
  props.mineNameList = [];
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AddFullPartyForm", () => {
  it("renders properly", () => {
    const component = shallow(<AddRolesForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
