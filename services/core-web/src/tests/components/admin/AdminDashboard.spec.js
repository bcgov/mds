import React from "react";
import { shallow } from "enzyme";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchMineVerifiedStatuses = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupDispatchProps();
});

describe("AdminDashboard", () => {
  it("renders properly", () => {
    const component = shallow(<AdminDashboard {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
