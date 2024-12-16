import React from "react";
import { shallow } from "enzyme";
import DashboardRoutes from "@/routes/DashboardRoutes";
// reduxForm is not defined
describe("DashboardRoutes ", () => {
  it("renders properly", () => {
    const component = shallow(<DashboardRoutes />);
    expect(component).toMatchSnapshot();
  });
});
