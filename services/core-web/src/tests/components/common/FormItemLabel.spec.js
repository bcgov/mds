import React from "react";
import { shallow } from "enzyme";
import FormItemLabel from "@/components/common/FormItemLabel";

const props = {};

const setupProps = () => {
  props.children = <></>;
  props.underline = false;
};

beforeEach(() => {
  setupProps();
});

describe("FormItemLabel", () => {
  it("renders properly", () => {
    const wrapper = shallow(<FormItemLabel {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
