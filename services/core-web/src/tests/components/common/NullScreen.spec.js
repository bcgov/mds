import React from "react";
import { render } from "@testing-library/react";
import NullScreen from "@/components/common/NullScreen";

const props = {};

const setupProps = () => {
  props.type = "generic";
};

beforeEach(() => {
  setupProps();
});

describe("NullScreen", () => {
  it("renders properly", () => {
    const { container: component } = render(<NullScreen {...props} />);
    expect(component).toMatchSnapshot();
  });
});
