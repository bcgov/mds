import React from "react";
import { shallow } from "enzyme";
import SlidingForms from "@/components/common/SlidingForms";

let props = {};
let dispatchProps = {};

const setupDispatchProps = () => {};

const setupProps = () => {
  props.formContent = [];
  props.selectedForm = 1;
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("SlidingForms", () => {
  it("renders properly", () => {
    const wrapper = shallow(<SlidingForms {...props} {...dispatchProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
