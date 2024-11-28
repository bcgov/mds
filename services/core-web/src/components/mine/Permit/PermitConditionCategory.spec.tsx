import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { EditPermitConditionCategoryInline } from "./PermitConditionCategory";

const mockCategory = {
  condition_category_code: "TEST-CAT",
  step: 'A',
  display_order: 1,
  description: "Test Category"
};

const mockProps = {
  category: mockCategory,
  conditionCount: 0,
  currentPosition: 1,
  categoryCount: 3,
  onChange: jest.fn(),
  onDelete: jest.fn(),
  moveUp: jest.fn(),
  moveDown: jest.fn()
};

const initialState = {};

describe("PermitConditionCategory", () => {
  it("renders category title with count in view mode", () => {
    render(
      <ReduxWrapper initialState={initialState}>
        <EditPermitConditionCategoryInline {...mockProps} />
      </ReduxWrapper>
    );

    expect(screen.getByText(`A. Test Category (0)`)).toBeInTheDocument();
  });

  it("switches to edit mode on click", () => {
    render(
      <ReduxWrapper initialState={initialState}>
        <EditPermitConditionCategoryInline {...mockProps} />
      </ReduxWrapper>
    );

    fireEvent.click(screen.getByText(`A. Test Category (0)`));
    expect(screen.getByRole("textbox", { name: 'step' })).toBeInTheDocument();
  });

  it("calls moveUp when up arrow clicked", () => {
    render(
      <ReduxWrapper initialState={initialState}>
        <EditPermitConditionCategoryInline {...mockProps} />
      </ReduxWrapper>
    );

    fireEvent.click(screen.getByText(`A. Test Category (0)`));
    const upButton = screen.getByRole("button", { name: "Move Category Up" });
    fireEvent.click(upButton);

    expect(mockProps.moveUp).toHaveBeenCalledWith(mockCategory);
  });

  it("calls moveDown when down arrow clicked", () => {
    render(
      <ReduxWrapper initialState={initialState}>
        <EditPermitConditionCategoryInline {...mockProps} />
      </ReduxWrapper>
    );

    fireEvent.click(screen.getByText(`A. Test Category (0)`));
    const upButton = screen.getByRole("button", { name: "Move Category Down" });
    fireEvent.click(upButton);

    expect(mockProps.moveDown).toHaveBeenCalledWith(mockCategory);
  });

  it("disables delete button when condition count > 0", () => {
    render(
      <ReduxWrapper initialState={initialState}>
        <EditPermitConditionCategoryInline {...mockProps} conditionCount={1} />
      </ReduxWrapper>
    );

    fireEvent.click(screen.getByText(`A. Test Category (1)`));
    const deleteButton = screen.getByRole("button", { name: "Delete Category" });

    expect(deleteButton).toBeDisabled();
  });

  it("enables delete button when condition count = 0", () => {
    render(
      <ReduxWrapper initialState={initialState}>
        <EditPermitConditionCategoryInline {...mockProps} conditionCount={0} />
      </ReduxWrapper>
    );

    fireEvent.click(screen.getByText(`A. Test Category (0)`));
    const deleteButton = screen.getByRole("button", { name: "Delete Category" });

    expect(deleteButton).not.toBeDisabled();

    fireEvent.click(deleteButton);

    const confirmDeleteButton = screen.getByRole("button", { name: "Yes, Delete Category" });
    fireEvent.click(confirmDeleteButton);

    expect(mockProps.onDelete).toHaveBeenCalledWith(mockCategory);
  });

  it("submits form with updated values", async () => {
    render(
      <ReduxWrapper initialState={initialState}>
        <EditPermitConditionCategoryInline {...mockProps} />
      </ReduxWrapper>
    );

    fireEvent.click(screen.getByText(`A. Test Category (0)`));

    const stepInput = screen.getByRole("textbox", { name: 'step' });
    fireEvent.change(stepInput, { target: { value: "B" } });

    const submitButton = screen.getByRole("button", { name: "Confirm" });
    expect(submitButton).not.toBeDisabled();
  });
});
