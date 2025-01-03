import React from "react";
import { shallow } from "enzyme";
import AdminDashboardRoutes from "@/routes/AdminDashboardRoutes";

describe("AdminDashboardRoutes ", () => {
  it("renders properly", () => {
    const component = shallow(<AdminDashboardRoutes />);
    expect(component).toMatchSnapshot();
  });
});
