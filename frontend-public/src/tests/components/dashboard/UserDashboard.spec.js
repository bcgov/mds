import React from "react";
import { shallow } from "enzyme";
import { UserDashboard } from "@/components/dashboard/UserDashboard";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.userInfo = { perferred_username: "MockName" };
  props.userMineInfo = {
    guid: "1234mn-sgf2gj-1234sjfg",
    mine_no: "test",
    mine_name: "test",
  };
};

const setupDispatchProps = () => {
  dispatchProps.fetchUserMineInfo = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("UserDashboard", () => {
  it("renders properly", () => {
    const wrapper = shallow(<UserDashboard {...props} {...dispatchProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
