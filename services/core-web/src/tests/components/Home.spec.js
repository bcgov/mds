import React from "react";
import { shallow } from "enzyme";
import { Home } from "@/components/Home";

const props = {};

const setupReducerProps = () => {
  props.location = { pathname: " " };
  props.loadBulkStaticContent = jest.fn();
  props.fetchInspectors = jest.fn();
  props.fetchProjectLeads = jest.fn();
  props.staticContentLoadingIsComplete = true;
};

beforeEach(() => {
  setupReducerProps();
});

describe("Home", () => {
  it("renders properly", () => {
    const component = shallow(<Home {...props} />);
    expect(component).toMatchSnapshot();
  });
});
