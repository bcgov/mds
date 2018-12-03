import React from "react";
import { shallow } from "enzyme";
import DashboardRoutes from "@/routes/DashboardRoutes";

describe("DashboardRoutes ", () => {
  it("renders properly", () => {
    const component = shallow(<DashboardRoutes />);
    expect(component).toMatchSnapshot();
  });
});
