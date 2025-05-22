import React from "react";
import { render } from "@testing-library/react";
import { ScrollToTopWrapper } from "@/components/common/wrappers/ScrollToTopWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => { };

const setupProps = () => {
  props.location = { hash: "", pathname: "/dashboard" };
  props.children = "";
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("ScrollToTopWrapper", () => {
  it("renders properly", () => {
    const { container: component } = render(<ScrollToTopWrapper {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
