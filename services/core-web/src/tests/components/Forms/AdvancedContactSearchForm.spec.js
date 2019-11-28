import React from "react";
import { shallow } from "enzyme";
import { AdvancedContactSearchForm } from "@/components/Forms/AdvancedContactSearchForm";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.handleSearch = jest.fn();
  dispatchProps.handleNameFieldReset = jest.fn();
  dispatchProps.toggleAdvancedSearch = jest.fn();
  dispatchProps.reset = jest.fn();
  dispatchProps.partyTypeOptions = { value: "PER", label: "Person" };
  dispatchProps.relationshipTypes = [{ value: "PER", label: "Person" }];
  dispatchProps.initialValues = { type: "PER" };
};

const setupProps = () => {
  props.title = "mockTitle";
  props.submitting = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AdvancedContactSearch form", () => {
  it("renders properly", () => {
    const component = shallow(<AdvancedContactSearchForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});

describe("AdvancedContactSearch resets properly", () => {
  it("resets the stat to a person when handleReset is called", () => {
    const component = shallow(<AdvancedContactSearchForm {...dispatchProps} {...props} />);
    const instance = component.instance();
    const testString = "test String";
    instance.handleContactTypeChange(testString, "ORG");
    expect(component.state("contactType")).toBe("ORG");
    instance.handleReset();
    expect(component.state("contactType")).toBe("PER");
  });
});
