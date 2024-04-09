import React from "react";
import { render, fireEvent } from "@testing-library/react";
import RenderCancelButton from "./RenderCancelButton";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import FormWrapper from "./FormWrapper";

const changedState = {
  form: {
    FORM_NAME: {
      registeredFields: {
        field_name: { name: "field_name", type: "Field", count: 1 },
      },
      values: { field_name: "changed" },
      initial: { field_name: "original" },
    },
  },
};

const unchangedState = {
  form: {
    FORM_NAME: {
      registeredFields: {
        field_name: { name: "field_name", type: "Field", count: 1 },
      },
      values: { field_name: "original" },
      initial: { field_name: "original" },
    },
  },
};

describe("RenderCancelButton component", () => {
  const cancelFunction = jest.fn();
  const buttonText = "Cancel Edit";
  const renderedForm = (
    <FormWrapper name="FORM_NAME" onSubmit={() => {}} isModal>
      <RenderCancelButton buttonText={buttonText} cancelFunction={cancelFunction} />
    </FormWrapper>
  );

  test("renders properly, does not show confirm on pristine form", () => {
    const { getByText, container } = render(
      <ReduxWrapper initialState={changedState}>{renderedForm}</ReduxWrapper>
    );
    const button = getByText(buttonText);
    fireEvent.click(button);
    expect(cancelFunction).toHaveBeenCalledTimes(0);
    expect(container).toMatchSnapshot();
  });

  test("shows modal on dirty form", () => {
    const { getByText } = render(
      <ReduxWrapper initialState={unchangedState}>{renderedForm}</ReduxWrapper>
    );
    const button = getByText(buttonText);
    fireEvent.click(button);
    expect(cancelFunction).toHaveBeenCalledTimes(1);
  });
});
