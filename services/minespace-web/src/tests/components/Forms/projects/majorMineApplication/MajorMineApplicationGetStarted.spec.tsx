import React from "react";
import { render } from "@testing-library/react";
import { MajorMineApplicationGetStarted } from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationGetStarted";
import { BrowserRouter } from "react-router-dom";

const dispatchProps = {};
const props = {};

describe("MajorMineApplicationGetStarted", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <MajorMineApplicationGetStarted {...dispatchProps} {...props} />
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});
