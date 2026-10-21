import React from "react";
import { render, screen } from "@testing-library/react";
import Callout from "./Callout";
import { CALLOUT_SEVERITY } from "@mds/common/constants/strings";

describe("Callout", () => {
  it("renders a string message and title without an icon by default", () => {
    const { container } = render(<Callout title="Heads up" message="Something happened" />);

    expect(screen.getByText("Heads up")).toBeInTheDocument();
    expect(screen.getByText("Something happened")).toBeInTheDocument();
    expect(container.querySelector(".bcgov-callout--info")).toBeInTheDocument();
    expect(container.querySelector(".anticon")).not.toBeInTheDocument();
    expect(container.querySelector(".bcgov-callout-content")).not.toBeInTheDocument();
  });

  it("renders a ReactNode message as-is", () => {
    render(<Callout message={<span>Custom node</span>} />);
    expect(screen.getByText("Custom node")).toBeInTheDocument();
  });

  it.each([
    [CALLOUT_SEVERITY.info, "anticon-info-circle"],
    [CALLOUT_SEVERITY.success, "anticon-check-circle"],
    [CALLOUT_SEVERITY.warning, "anticon-exclamation-circle"],
    [CALLOUT_SEVERITY.danger, "anticon-close-circle"],
  ])("shows the %s icon when showIcon is set", (severity, iconClass) => {
    const { container } = render(<Callout showIcon severity={severity} message="Message" />);

    expect(container.querySelector(`.bcgov-callout--${severity}`)).toBeInTheDocument();
    expect(container.querySelector(".bcgov-callout--with-icon")).toBeInTheDocument();
    expect(container.querySelector(`.${iconClass}`)).toBeInTheDocument();
    expect(container.querySelector(".bcgov-callout-content")).toHaveTextContent("Message");
  });

  it("falls back to the info icon for an unknown severity", () => {
    const { container } = render(<Callout showIcon severity="default" message="Message" />);
    expect(container.querySelector(".anticon-info-circle")).toBeInTheDocument();
  });
});
