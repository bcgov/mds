import React from "react";
import { render } from "@testing-library/react";
import FormItemLabel from "@/components/common/FormItemLabel";

const props = {
  children: <></>,
  underline: false,
};

describe("FormItemLabel", () => {
  it("renders properly", () => {
    const { container: component } = render(<FormItemLabel {...props} />);
    expect(component).toMatchSnapshot();
  });
});
