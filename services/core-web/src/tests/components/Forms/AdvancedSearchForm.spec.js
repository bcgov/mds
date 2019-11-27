import React from "react";
import { shallow } from "enzyme";
import { AdvancedMineSearchForm } from "@/components/Forms/AdvancedMineSearchForm";

const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
};

beforeEach(() => {
  setupDispatchProps();
});

describe("AdvancedMineSearchForm", () => {
  it("renders properly", () => {
    const component = shallow(<AdvancedMineSearchForm {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
