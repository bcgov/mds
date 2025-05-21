import React from "react";
import { render } from "@testing-library/react";
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
    const { container: component } = render(<AdminVerifiedMinesList {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
