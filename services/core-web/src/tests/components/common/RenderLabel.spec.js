import React from "react";
import { render } from "@testing-library/react";
import RenderLabel from "@/components/common/RenderLabel";

const props = {
  id: 1,
  input: "",
  label: "",
  indentText: "test",
  className: "template-letter-content",
  meta: {
    touched: false,
    error: false,
    warning: false,
  },
};

describe("RenderLabel", () => {
  it("renders properly", () => {
    const { container: component } = render(<RenderLabel {...props} />);
    expect(component).toMatchSnapshot();
  });
});
