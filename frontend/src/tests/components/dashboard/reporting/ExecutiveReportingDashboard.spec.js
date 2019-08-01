import React from "react";
import { shallow } from "enzyme";
import { ExecutiveReportingDashboard } from "@/components/dashboard/reporting/ExecutiveReportingDashboard";

describe("ExecutiveReportingDashboard", () => {
  it("renders properly", () => {
    const component = shallow(<ExecutiveReportingDashboard />);
    expect(component).toMatchSnapshot();
  });
});
