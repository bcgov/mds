import React from "react";
import { shallow } from "enzyme";
import { AddTailingsModal } from "@/components/modalContent/AddTailingsModal";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
};

const setupProps = () => {
  props.title = "mockTitle";
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AddTailingsModal", () => {
  it("renders properly", () => {
    const component = shallow(<AddTailingsModal {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
