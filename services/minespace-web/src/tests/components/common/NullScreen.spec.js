import React from "react";
import { render } from "@testing-library/react";
import UnauthenticatedNotice from "@/components/common/UnauthenticatedNotice";

const props = {
  type: "unauthorized",
};

describe("NullScreen", () => {
  it("renders properly", () => {
    const { container: component } = render(<UnauthenticatedNotice {...props} />);
    expect(component).toMatchSnapshot();
  });
});
