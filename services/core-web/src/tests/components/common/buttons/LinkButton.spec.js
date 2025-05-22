import React from "react";
import { render } from "@testing-library/react";
import LinkButton from "@/components/common/buttons/LinkButton";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.tabIndex = 1;
  props.style = {};
  props.children = <></>;
};

const setupDispatchProps = () => {
  dispatchProps.onClick = jest.fn();
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("LinkButton", () => {
  it("renders properly", () => {
    const { container: component } = render(<LinkButton {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
