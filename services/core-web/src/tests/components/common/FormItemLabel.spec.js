import React from "react";
import { render } from "@testing-library/react";
import FormItemLabel from "@/components/common/FormItemLabel";

const props = {};

const setupProps = () => {
  props.children = <></>;
  props.underline = false;
};

beforeEach(() => {
  setupProps();
});

describe("FormItemLabel", () => {
  it("renders properly", () => {
    const { container: component } = render(<FormItemLabel {...props} />);
    expect(component).toMatchSnapshot();
  });
});
