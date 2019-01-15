import React from "react";
import { shallow } from "enzyme";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

describe("AdminDashboard", () => {
  it("renders properly", () => {
    const component = shallow(<AdminDashboard />);
    expect(component).toMatchSnapshot();
  });
});
