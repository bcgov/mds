import React from "react";
import { render } from "@testing-library/react";
import { LoadingWrapper } from "@/components/common/wrappers/LoadingWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => { };

const setupProps = () => {
  props.condition = false;
  props.children = "";
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("LoadingWrapper", () => {
  it("renders properly", () => {
    const { container: component } = render(<LoadingWrapper {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
