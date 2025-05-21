import React from "react";
import { render } from "@testing-library/react";
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
    const { container: component } = render(<AmazonS3Provider {...props} />);
    expect(component).toMatchSnapshot();
  });
});
