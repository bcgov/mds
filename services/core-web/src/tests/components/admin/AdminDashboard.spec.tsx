import React from "react";
import { render } from "@testing-library/react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { BrowserRouter } from "react-router-dom";

const dispatchProps = {};
const props = {
  location: { pathname: "" },
};

describe("AdminDashboard", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><AdminDashboard {...dispatchProps} {...props} /></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
