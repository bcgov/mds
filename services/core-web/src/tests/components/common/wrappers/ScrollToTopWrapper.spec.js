import React from "react";
import { render } from "@testing-library/react";
import { ScrollToTopWrapper } from "@/components/common/wrappers/ScrollToTopWrapper";

const props = {
  location: { hash: "", pathname: "/dashboard" },
  children: "",
};
const dispatchProps = {};

describe("ScrollToTopWrapper", () => {
  it("renders properly", () => {
    const { container: component } = render(<ScrollToTopWrapper {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
