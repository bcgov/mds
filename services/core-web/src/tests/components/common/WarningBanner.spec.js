import React from "react";
import { render } from "@testing-library/react";
import WarningBanner from "@/components/common/WarningBanner";

let props = {};
let dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.onClose = jest.fn();
};

const setupProps = () => {
  props.type = "test";
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("WarningBanner", () => {
  it("renders properly", () => {
    const { container: component } = render(<WarningBanner {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
