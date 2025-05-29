import React from "react";
import { render } from "@testing-library/react";
import UnauthenticatedNotice from "@/components/common/UnauthenticatedNotice";

describe("NullScreen", () => {
  it("renders properly", () => {
    const { container: component } = render(<UnauthenticatedNotice />);
    expect(component).toMatchSnapshot();
  });
});
