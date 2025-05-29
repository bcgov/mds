import React from "react";
import { render } from "@testing-library/react";
import { AddTailingsModal } from "@/components/modalContent/AddTailingsModal";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  onSubmit: jest.fn(),
};
const props = {
  title: "mockTitle",
};

describe("AddTailingsModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><AddTailingsModal {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
