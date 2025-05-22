import React from "react";
import { render } from "@testing-library/react";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";

describe("LoadingWrapper", () => {
  it("renders properly", () => {
    const { container: component } = render(<LoadingWrapper />);
    expect(component).toMatchSnapshot();
  });
});
