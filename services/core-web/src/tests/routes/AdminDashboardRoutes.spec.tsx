import React from "react";
import { render } from "@testing-library/react";
import AdminDashboardRoutes from "@/routes/AdminDashboardRoutes";
import { BrowserRouter } from "react-router-dom";

describe("AdminDashboardRoutes ", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><AdminDashboardRoutes /></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
