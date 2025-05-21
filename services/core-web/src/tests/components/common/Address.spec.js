import React from "react";
import { render } from "@testing-library/react";
import Address from "@/components/common/Address";

const props = {};

const setupProps = () => {
  props.address = {};
};

beforeEach(() => {
  setupProps();
});

describe("Address", () => {
  it("renders properly", () => {
    const { container: component } = render(<Address {...props} />);
    expect(component).toMatchSnapshot();
  });
});
