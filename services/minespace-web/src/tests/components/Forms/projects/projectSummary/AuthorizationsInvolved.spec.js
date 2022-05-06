import React from "react";
import { shallow } from "enzyme";
import { AuthorizationsInvolved } from "@/components/Forms/projects/projectSummary/AuthorizationsInvolved";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.change = jest.fn();
};

const setupProps = () => {
  props.formattedProjectSummary = {};
  props.dropdownProjectSummaryPermitTypes = [];
  props.transformedProjectSummaryAuthorizationTypes = [];
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AuthorizationsInvolved", () => {
  it("renders properly", () => {
    const component = shallow(<AuthorizationsInvolved {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
