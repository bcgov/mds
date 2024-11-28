import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { searchConditionCategories } from "@mds/common/redux/slices/permitConditionCategorySlice";
import PermitConditionCategorySelector from "./PermitConditionCategorySelector";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

jest.mock("@mds/common/redux/slices/permitConditionCategorySlice", () => ({
  searchConditionCategories: jest.fn().mockReturnValue({ type: "mockAction" }),
  getConditionCategories: () => mockCategories
}));

const mockCategories = [
  {
    condition_category_code: "CAT-1",
    description: "Category 1",
    step: "A",
    display_order: 1
  },
  {
    condition_category_code: "CAT-2",
    description: "Category 2",
    step: "B",
    display_order: 2
  }
];

describe("PermitConditionCategorySelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders category selector field", () => {
    render(
      <ReduxWrapper>
        <FormWrapper onSubmit={() => { }} name="test_form">
          <PermitConditionCategorySelector />
        </FormWrapper>
      </ReduxWrapper>
    );
    const input = screen.getByRole("combobox", { name: "description" })
    expect(input).toBeInTheDocument();
  });

  it("displays category options from redux state", async () => {
    render(
      <ReduxWrapper>
        <FormWrapper onSubmit={() => { }} name="test_form">
          <PermitConditionCategorySelector />
        </FormWrapper>
      </ReduxWrapper>
    );

    expect(screen.getByRole("combobox")).toHaveValue("");

    expect(screen.queryByText("Category 1")).not.toBeInTheDocument();
    const input = screen.getByRole("combobox");
    fireEvent.mouseDown(input);
    expect(screen.getAllByText("Category 1")[0]).toBeInTheDocument();

    const cat2 = screen.getByText("Category 2")
    expect(cat2).toBeInTheDocument();
  });

  it("calls search action when typing with debounce", async () => {

    jest.useFakeTimers();
    await act(async () => {
      render(
        <ReduxWrapper>
          <FormWrapper onSubmit={() => { }} name="test_form">
            <PermitConditionCategorySelector />
          </FormWrapper>
        </ReduxWrapper>
      );

      const input = screen.getByRole("combobox");
      fireEvent.change(input, { target: { value: "test" } });
      expect(searchConditionCategories).not.toHaveBeenCalledWith({ query: "test" });

      jest.runAllTimers();
      await waitFor(() => {
        expect(searchConditionCategories).toHaveBeenCalledWith({ query: "test" });
      });
    });

  });
  it("should be able to select what you're writing", async () => {
    jest.useFakeTimers();

    await act(async () => {
      const { container } = render(
        <ReduxWrapper>
          <FormWrapper onSubmit={() => { }} name="test_form">
            <PermitConditionCategorySelector />
          </FormWrapper>
        </ReduxWrapper>
      );

      const input = screen.getByRole("combobox");
      fireEvent.mouseDown(input);

      fireEvent.change(input, { target: { value: "this is a new input" } });

      jest.runAllTimers();
      await waitFor(() => {
        const opts = screen.getAllByText("this is a new input");
        const opt = opts.find(o => o.className === 'ant-select-item-option-content');
        expect(opt).toBeInTheDocument();

        fireEvent.mouseDown(opt);

        expect(screen.getByRole("combobox")).toHaveValue("this is a new input");
      });

    });

  });


});