import React from "react";
import { render } from "@testing-library/react";
import { ViewAllConditionsModal } from "@/components/modalContent/ViewAllConditionsModal";

const dispatchProps = {
  closeModal: jest.fn(),
};
const props = {
  permitConditionCategoryOptions: [],
  conditions: [],
};

describe("ViewAllConditionsModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ViewAllConditionsModal {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
