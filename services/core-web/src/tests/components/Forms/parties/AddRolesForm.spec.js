import React from "react";
import { render } from "@testing-library/react";
import { AddRolesForm } from "@/components/Forms/parties/AddRolesForm";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.togglePartyChange = jest.fn();
};

const setupProps = () => {
  props.addField = () => { };
  props.removeField = () => { };
  props.handleChange = () => { };
  props.handleSelect = () => { };
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
    const { container: component } = render(<ReduxWrapper><AddRolesForm {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
