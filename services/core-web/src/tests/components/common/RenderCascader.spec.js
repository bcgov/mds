import React from "react";
import { shallow } from "enzyme";
import RenderCascader from "@/components/common/RenderCascader";

let props = {};

const setupProps = () => {
  props = {
    id: 1,
    input: "",
    options: [],
    placeholder: "",
    meta: {
      touched: false,
      error: false,
      warning: false,
    },
  };
};

beforeEach(() => {
  setupProps();
});

describe("RenderCascader", () => {
  it("renders properly", () => {
    const props = {
      input: {
        onChange: jest.fn(), // Mock the onChange function
      },
      meta: {
        touched: true, // Set the desired value for 'touched'
      },
    };
    const wrapper = shallow(<RenderCascader {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
