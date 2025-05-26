import React from "react";
import { render } from "@testing-library/react";
import { LoadingWrapper } from "@/components/common/wrappers/LoadingWrapper";

const props = {
  condition: false,
  children: "",
};
const dispatchProps = {};

describe("LoadingWrapper", () => {
  it("renders properly", () => {
    const { container: component } = render(<LoadingWrapper {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
