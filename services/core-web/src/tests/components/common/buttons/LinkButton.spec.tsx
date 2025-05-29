import React from "react";
import { render } from "@testing-library/react";
import LinkButton from "@/components/common/buttons/LinkButton";

const props = {
  tabIndex: 1,
  style: {},
  children: <></>,
};
const dispatchProps = {
  onClick: jest.fn(),
};

describe("LinkButton", () => {
  it("renders properly", () => {
    const { container: component } = render(<LinkButton {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
