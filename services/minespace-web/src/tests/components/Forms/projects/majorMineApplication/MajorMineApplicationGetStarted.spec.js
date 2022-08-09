import React from "react";
import { shallow } from "enzyme";
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
    const component = shallow(<MajorMineApplicationGetStarted {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
