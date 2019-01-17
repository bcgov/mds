import React from "react";
import { shallow } from "enzyme";
import { ProponentDashboard } from "@/components/dashboard/ProponentDashboard";

const props = {};

const setupProps = () => {
  props.userInfo = { perferred_username: "MockName" };
};

beforeEach(() => {
  setupProps();
});

describe("ProponentDashboard", () => {
  it("renders properly", () => {
    const wrapper = shallow(<ProponentDashboard {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
