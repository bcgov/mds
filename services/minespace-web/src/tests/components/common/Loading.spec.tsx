import React from "react";
import { render } from "@testing-library/react";
import Loading from "@/components/common/Loading";

describe("Loading", () => {
  it("renders properly", () => {
    const { container: component } = render(<Loading />);
    expect(component).toMatchSnapshot();
  });
});
