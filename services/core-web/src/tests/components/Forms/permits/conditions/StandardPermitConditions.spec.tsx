import React from "react";
import { render } from "@testing-library/react";
import { StandardPermitConditions } from "@/components/Forms/permits/conditions/StandardPermitConditions";

const dispatchProps = {
  openModal: jest.fn(),
  closeModal: jest.fn(),
  fetchStandardPermitConditions: jest.fn(() => Promise.resolve()),
  setEditingConditionFlag: jest.fn(),
  deleteStandardPermitCondition: jest.fn(),
  updateStandardPermitCondition: jest.fn(),
};
const props = {
  conditions: [],
  permitConditionCategoryOptions: [],
  editingConditionFlag: false,
  match: { params: { type: "SAG" } },
};

describe("StandardPermitConditions", () => {
  it("renders properly", () => {
    const { container: component } = render(<StandardPermitConditions {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
