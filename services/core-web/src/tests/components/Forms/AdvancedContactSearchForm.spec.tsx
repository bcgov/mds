import React from "react";
import { shallow } from "enzyme";
import { render } from "@testing-library/react";
import { AdvancedContactSearchForm } from "@/components/Forms/AdvancedContactSearchForm";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  onSubmit: jest.fn(),
  closeModal: jest.fn(),
  handleSearch: jest.fn(),
  handleNameFieldReset: jest.fn(),
  toggleAdvancedSearch: jest.fn(),
  reset: jest.fn(),
  partyTypeOptions: [
    { value: "PER", label: "Person" },
    { value: "ORG", label: "Organization" },
  ],
  relationshipTypes: [{ value: "PER", label: "Person" }],
  initialValues: { type: "PER" },
};
const props = {
  title: "mockTitle",
  submitting: false,
};

describe("AdvancedContactSearch form", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <AdvancedContactSearchForm {...dispatchProps} {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });

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
