import React from "react";
import { shallow } from "enzyme";
import UnauthenticatedNotice from "@/components/common/UnauthenticatedNotice";

const props = {};

const setupProps = () => {
  props.type = "unauthorized";
};

beforeEach(() => {
  setupProps();
});

describe("NullScreen", () => {
  it("renders properly", () => {
    const wrapper = shallow(<UnauthenticatedNotice {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
