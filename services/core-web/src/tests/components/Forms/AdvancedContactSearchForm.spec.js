import React from "react";
import { shallow } from "enzyme";
import { render } from "@testing-library/react";
import { AdvancedContactSearchForm } from "@/components/Forms/AdvancedContactSearchForm";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.handleSearch = jest.fn();
  dispatchProps.handleNameFieldReset = jest.fn();
  dispatchProps.toggleAdvancedSearch = jest.fn();
  dispatchProps.reset = jest.fn();
  dispatchProps.partyTypeOptions = [{ value: "PER", label: "Person" }, { value: "ORG", label: "Organization" }];
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
    const { container: component } = render(<ReduxWrapper><AdvancedContactSearchForm {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });

  // TypeError: component.instance is not a function
  it("resets the stat to a person when handleReset is called", () => {
    const wrapper = shallow(<AdvancedContactSearchForm {...dispatchProps} {...props} />);
    const instance = wrapper.instance();
    const testString = "test String";
    instance.handleContactTypeChange(testString, "ORG");
    expect(wrapper.state("contactType")).toBe("ORG");
    instance.handleReset();
    expect(wrapper.state("contactType")).toBe("PER");
  });
});
