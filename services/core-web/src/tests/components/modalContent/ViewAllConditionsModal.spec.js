import React from "react";
import { render } from "@testing-library/react";
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
    const { container: component } = render(<ViewAllConditionsModal {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
