import React from "react";
import { shallow } from "enzyme";
import { AdvancedSearchForm } from "@/components/Forms/AdvancedSearchForm";

const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
};

beforeEach(() => {
  setupDispatchProps();
});

describe("AdvancedSearchForm", () => {
  it("renders properly", () => {
    const component = shallow(<AdvancedSearchForm {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
