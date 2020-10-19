import React from "react";
import { shallow } from "enzyme";
import { DeleteConditionModal } from "@/components/modalContent/DeleteConditionModal";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.closeModal = jest.fn();
  dispatchProps.deleteCondition = jest.fn(() => Promise.resolve());
};

const setupProps = () => {
  props.title = "mockTitle";
  props.condition = {};
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("DeleteConditionModal", () => {
  it("renders properly", () => {
    const component = shallow(<DeleteConditionModal {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
