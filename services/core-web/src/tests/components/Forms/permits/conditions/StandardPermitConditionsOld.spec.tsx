import React from "react";
import { render } from "@testing-library/react";
import { StandardPermitConditionsOld } from "@/components/Forms/permits/conditions/StandardPermitConditionsOld";

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

describe("StandardPermitConditionsOld", () => {
  it("renders properly", () => {
    const { container: component } = render(<StandardPermitConditionsOld {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
