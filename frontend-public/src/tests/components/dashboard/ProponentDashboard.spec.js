import React from "react";
import { shallow } from "enzyme";
import ProponentDashboard from "@/components/dashboard/ProponentDashboard";

describe("ProponentDashboard", () => {
  it("renders properly", () => {
    const wrapper = shallow(<ProponentDashboard />);
    expect(wrapper).toMatchSnapshot();
  });
});
