import React from "react";
import { render } from "@testing-library/react";
import { ExecutiveReportingDashboard } from "@/components/dashboard/reporting/ExecutiveReportingDashboard";

describe("ExecutiveReportingDashboard", () => {
  it("renders properly", () => {
    const { container: component } = render(<ExecutiveReportingDashboard />);
    expect(component).toMatchSnapshot();
  });
});
