import React from "react";
import { shallow } from "enzyme";
import { AmazonS3Provider } from "@/components/syncfusion/AmazonS3Provider";

const props = {};

const setupReducerProps = () => {
  props.path = "mock path";
};

beforeEach(() => {
  setupReducerProps();
});

describe("AmazonS3Provider", () => {
  it("renders properly", () => {
    const component = shallow(<AmazonS3Provider {...props} />);
    expect(component).toMatchSnapshot();
  });
});
