import React from "react";
import { shallow } from "enzyme";
import Address from "@/components/common/Address";

const props = {};

const setupProps = () => {
  props.address = {};
};

beforeEach(() => {
  setupProps();
});

describe("Address", () => {
  it("renders properly", () => {
    const wrapper = shallow(<Address {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
