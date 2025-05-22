import React from "react";
import { render } from "@testing-library/react";
import { MajorMineApplicationGetStarted } from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationGetStarted";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {};

const setupProps = () => {};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MajorMineApplicationGetStarted", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <MajorMineApplicationGetStarted {...dispatchProps} {...props} />
    );
    expect(component).toMatchSnapshot();
  });
});
