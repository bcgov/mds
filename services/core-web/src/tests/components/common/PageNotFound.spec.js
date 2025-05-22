import React from "react";
import { render } from "@testing-library/react";
import PageNotFound from "@/components/common/PageNotFound";
import { BrowserRouter } from "react-router-dom";

const props = {};

const setupProps = () => {
  props.type = "generic";
};

beforeEach(() => {
  setupProps();
});

describe("PageNotFound", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><PageNotFound {...props} /></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
