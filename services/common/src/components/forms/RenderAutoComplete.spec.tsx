import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Field } from "redux-form";
import FormWrapper from "./FormWrapper";
import RenderAutoComplete from "./RenderAutoComplete";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const initialState = {
  form: {
    test_autocomplete: {
      values: {}
    }
  }
};
const mockProps = {
  id: "test_autocomplete",
  input: {
    name: "test",
    value: "",
    onChange: jest.fn()
  },
  meta: {
    touched: false,
    error: undefined,
    warning: undefined
  },
  label: "Test Label",
  required: true,
  data: [
    { label: "Option 1", value: "1" },
    { label: "Option 2", value: "2" }
  ],
  addMissing: false,
  handleChange: jest.fn(),
  handleSelect: jest.fn()
};

describe("RenderAutoComplete", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders in view mode", () => {
    render(
      <ReduxWrapper initialState={initialState}>
        <FormWrapper name="test_autocomplete" isEditMode={false} onSubmit={jest.fn()}>
          <Field
            {...mockProps}
            component={RenderAutoComplete}
          />
        </FormWrapper>
      </ReduxWrapper>
    );
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("renders in edit mode", () => {
    render(
      <ReduxWrapper initialState={initialState}>
        <FormWrapper name="test_autocomplete" isEditMode={true} onSubmit={jest.fn()}>
          <Field
            {...mockProps}
            component={RenderAutoComplete}
          />
        </FormWrapper>
      </ReduxWrapper>
    );
    expect(screen.getByRole("combobox", { name: "test" })).toBeInTheDocument();
  });

  it("shows validation error when touched", () => {
    const propsWithError = {
      ...mockProps,
      meta: {
        touched: true,
        error: "Required field",
        warning: undefined
      }
    };

    render(
      <ReduxWrapper initialState={initialState}>
        <FormWrapper name="test_autocomplete" isEditMode={true} onSubmit={jest.fn()}>
          <Field
            {...propsWithError}
            component={RenderAutoComplete}
          />
        </FormWrapper>
      </ReduxWrapper>
    );
    expect(screen.getByText("Required field")).toBeInTheDocument();
  });

  it("adds missing option when addMissing is true", async () => {
    const propsWithAddMissing = {
      ...mockProps,
      addMissing: true,
      input: {
        ...mockProps.input,
        value: "New Option"
      }
    };

    render(
      <ReduxWrapper initialState={initialState}>
        <FormWrapper name="test_autocomplete" isEditMode={true} onSubmit={jest.fn()}>
          <Field
            {...propsWithAddMissing}
            component={RenderAutoComplete}
          />
        </FormWrapper>
      </ReduxWrapper>
    );

    const select = screen.getByRole("combobox");
    fireEvent.mouseDown(select);
    const options = await screen.findAllByText("New Option");
    expect(options).toHaveLength(2);
  });

  it("calls handleChange and input.onChange on search", () => {
    render(
      <ReduxWrapper initialState={initialState}>
        <FormWrapper name="test_autocomplete" isEditMode={true} onSubmit={jest.fn()}>
          <Field
            {...mockProps}
            component={RenderAutoComplete}
          />
        </FormWrapper>
      </ReduxWrapper>
    );

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "test" } });

    expect(mockProps.handleChange).toHaveBeenCalledWith("test");
    expect(mockProps.input.onChange).toHaveBeenCalledWith("test");
  });

  it("calls handleSelect on option selection", () => {
    render(
      <ReduxWrapper initialState={initialState}>
        <FormWrapper name="test_autocomplete" isEditMode={true} onSubmit={jest.fn()}>
          <Field
            {...mockProps}
            component={RenderAutoComplete}
          />
        </FormWrapper>
      </ReduxWrapper>
    );

    const select = screen.getByRole("combobox");
    fireEvent.mouseDown(select);
    fireEvent.click(screen.getByText("Option 1"));

    expect(mockProps.handleSelect).toHaveBeenCalledWith("1", { label: "Option 1", value: "1" });
  });
});