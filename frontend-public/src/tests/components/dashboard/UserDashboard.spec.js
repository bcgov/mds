import React from "react";
import { shallow } from "enzyme";
import { UserDashboard } from "@/components/dashboard/UserDashboard";

const props = {};

const setupProps = () => {
  props.userInfo = { perferred_username: "MockName" };
};

beforeEach(() => {
  setupProps();
});

describe("UserDashboard", () => {
  it("renders properly", () => {
    const wrapper = shallow(<UserDashboard {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
