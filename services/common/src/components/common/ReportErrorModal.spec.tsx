import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportErrorModal, ERROR_SEVERITY } from "./ReportErrorModal";

window.scrollTo = jest.fn();

describe("ReportErrorModal", () => {
  const setup = (props = {}) => {
    const onCancel = jest.fn();
    const onSubmit = jest.fn();
    render(
      <ReportErrorModal open onCancel={onCancel} onSubmit={onSubmit} {...props} />
    );
    return { onCancel, onSubmit };
  };

  it("defaults severity to Low and keeps Send enabled", () => {
    setup();

    expect(screen.getByText(ERROR_SEVERITY.LOW)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send" })).toBeEnabled();
  });

  it("shows a validation error and does not submit when description is empty", async () => {
    const user = userEvent.setup();
    const { onSubmit } = setup();

    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("Please describe what you were doing")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits the expected payload once a description is entered", async () => {
    const user = userEvent.setup();
    const { onSubmit } = setup();

    const textarea = screen.getByPlaceholderText(
      "Describe what you were doing when this happened"
    );
    await user.type(textarea, "I clicked save and got an error.");

    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(onSubmit).toHaveBeenCalledWith({
      severity: ERROR_SEVERITY.LOW,
      description: "I clicked save and got an error.",
      seenBefore: undefined,
    });
  });

  it("submits the selected severity and seen-before answer", async () => {
    const user = userEvent.setup();
    const { onSubmit } = setup();

    await user.type(
      screen.getByPlaceholderText("Describe what you were doing when this happened"),
      "Something broke"
    );
    await user.click(screen.getByText(ERROR_SEVERITY.HIGH));
    await user.click(screen.getByLabelText("Yes"));

    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(onSubmit).toHaveBeenCalledWith({
      severity: ERROR_SEVERITY.HIGH,
      description: "Something broke",
      seenBefore: true,
    });
  });

  it("submits seenBefore as false when No is selected and null when Not sure is selected", async () => {
    const user = userEvent.setup();
    const { onSubmit } = setup();

    await user.type(
      screen.getByPlaceholderText("Describe what you were doing when this happened"),
      "Encountered error"
    );
    await user.click(screen.getByLabelText("No"));
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(onSubmit).toHaveBeenLastCalledWith(
      expect.objectContaining({ seenBefore: false })
    );

    await user.click(screen.getByLabelText("Not sure"));
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(onSubmit).toHaveBeenLastCalledWith(
      expect.objectContaining({ seenBefore: null })
    );
  });

  it("calls onCancel when the modal is cancelled", async () => {
    const user = userEvent.setup();
    const { onCancel } = setup();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalled();
  });
});
