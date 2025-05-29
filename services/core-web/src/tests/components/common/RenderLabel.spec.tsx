import React from "react";
import { render } from "@testing-library/react";
import RenderLabel from "@/components/common/RenderLabel";
import { inputMeta, inputProps } from "@mds/common/components/forms/testHelper";

const props = {
  id: "1",
  input: { value: "", name: "field", ...inputProps },
  label: "",
  indentText: "test",
  className: "template-letter-content",
  meta: inputMeta,
};

describe("RenderLabel", () => {
  it("renders properly", () => {
    const { container: component } = render(<RenderLabel {...props} />);
    expect(component).toMatchSnapshot();
  });
});
