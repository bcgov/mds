import React from "react";
import { shallow } from "enzyme";
import { AdminVerifiedMinesList } from "@/components/admin/AdminVerifiedMinesList";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.fetchMineVerifiedStatuses = jest.fn(() => Promise.resolve({ data: [] }));
};

const setupProps = () => {
  props.location = { pathname: "" };
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AdminVerifiedMinesList", () => {
  it("renders properly", () => {
    const component = shallow(<AdminVerifiedMinesList {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
