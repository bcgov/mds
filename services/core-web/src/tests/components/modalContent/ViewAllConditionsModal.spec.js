import React from "react";
import { shallow } from "enzyme";
import { ViewAllConditionsModal } from "@/components/modalContent/ViewAllConditionsModal";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.permitConditionCategoryOptions = [];
  props.conditions = [];
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("ViewAllConditionsModal", () => {
  it("renders properly", () => {
    const component = shallow(<ViewAllConditionsModal {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
