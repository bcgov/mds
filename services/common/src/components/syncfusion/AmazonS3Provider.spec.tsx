import React from "react";
import { render } from "@testing-library/react";
import { AmazonS3Provider } from "./AmazonS3Provider";

const props = {
  path: "mock path",
};

describe("AmazonS3Provider", () => {
  it("renders properly", () => {
    const { container: component } = render(<AmazonS3Provider {...props} />);
    expect(component).toMatchSnapshot();
  });
});
