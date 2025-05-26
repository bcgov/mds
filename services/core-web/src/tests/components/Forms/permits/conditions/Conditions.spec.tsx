import React from "react";
import { render } from "@testing-library/react";
import { Conditions } from "@/components/Forms/permits/conditions/Conditions";

const dispatchProps = {
  openModal: jest.fn(),
  closeModal: jest.fn(),
  fetchPermitConditions: jest.fn(),
  setEditingConditionFlag: jest.fn(),
  deletePermitCondition: jest.fn(),
  updatePermitCondition: jest.fn(),
  fetchDraftPermitByNOW: jest.fn(),
};
const props = {
  conditions: [],
  permitConditionCategoryOptions: [],
  editingConditionFlag: false,
  isNoWApplication: true,
  isSourcePermitGeneratedInCore: true,
  draftPermitAmendment: {},
};

describe("Conditions", () => {
  it("renders properly", () => {
    const { container: component } = render(<Conditions {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
