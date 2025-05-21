import React from "react";
import { render } from "@testing-library/react";
import AddButton from "@/components/common/buttons/AddButton";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.children = <></>;
};

const setupDispatchProps = () => {
  dispatchProps.onClick = jest.fn();
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("AddButton", () => {
  it("renders properly", () => {
    const { container: component } = render(<AddButton {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
