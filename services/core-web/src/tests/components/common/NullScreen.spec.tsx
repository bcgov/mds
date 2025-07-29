import React from "react";
import { render } from "@testing-library/react";
import NullScreen from "@/components/common/NullScreen";

describe("NullScreen", () => {
  it("renders properly", () => {
    const { container: component } = render(<NullScreen type="generic" />);
    expect(component).toMatchSnapshot();
  });
});
