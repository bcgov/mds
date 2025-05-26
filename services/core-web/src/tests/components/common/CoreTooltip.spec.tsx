import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  CoreTooltip,
  NOWFieldOriginTooltip,
  NOWOriginalValueTooltip,
} from "@/components/common/CoreTooltip";

const props = {
  title: "tooltip title",
  iconColor: "white",
  style: {},
  isVisible: true,
  originalValue: "mock value"
};

describe("CoreTooltip", () => {
  it("CoreTooltip renders tooltip title on hover", async () => {
    render(<CoreTooltip {...props} />);
    // The icon is the trigger, so hover over it
    const icon = screen.getByRole("img", { hidden: true });
    await userEvent.hover(icon);
    expect(await screen.findByText(props.title)).toBeInTheDocument();
  });

  it("NOWFieldOriginTooltip renders tooltip on hover", async () => {
    render(<NOWFieldOriginTooltip />);
    // The icon is the trigger, so hover over it
    const icon = screen.getByRole("img", { hidden: true });
    await userEvent.hover(icon);
    expect(await screen.findByText(/This field was not being sent by NROS or vFCBC/)).toBeInTheDocument();
  });

  it("NOWOriginalValueTooltip renders tooltip on hover when visible", async () => {
    render(<NOWOriginalValueTooltip originalValue={props.originalValue} isVisible={props.isVisible} />);
    // The trigger is the 'Edited' span
    const trigger = screen.getByText("Edited");
    await userEvent.hover(trigger);
    expect(await screen.findByText(`Original Value: ${props.originalValue}`)).toBeInTheDocument();
  });
});
