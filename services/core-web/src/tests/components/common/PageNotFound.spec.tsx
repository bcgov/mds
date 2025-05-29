import React from "react";
import { render } from "@testing-library/react";
import PageNotFound from "@/components/common/PageNotFound";
import { BrowserRouter } from "react-router-dom";

describe("PageNotFound", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <PageNotFound />
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});
