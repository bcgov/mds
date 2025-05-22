import React from "react";
import { render } from "@testing-library/react";
import RefreshButton from "@/components/common/buttons/RefreshButton";

describe("RefreshButton", () => {
  it("renders properly", () => {
    const { container: component } = render(<RefreshButton />);
    expect(component).toMatchSnapshot();
  });
});
