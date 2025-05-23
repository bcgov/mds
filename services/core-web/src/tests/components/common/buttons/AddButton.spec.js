import React from "react";
import { render } from "@testing-library/react";
import AddButton from "@/components/common/buttons/AddButton";

const props = {
  children: <></>,
};
const dispatchProps = {
  onClick: jest.fn(),
};

describe("AddButton", () => {
  it("renders properly", () => {
    const { container: component } = render(<AddButton {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
