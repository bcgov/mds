import React from "react";
import { shallow } from "enzyme";
import UnauthorizedNotice from "@/components/common/UnauthorizedNotice";

const props = {};

const setupProps = () => {
  props.type = "unauthorized";
};

beforeEach(() => {
  setupProps();
});

describe("NullScreen", () => {
  it("renders properly", () => {
    const wrapper = shallow(<UnauthorizedNotice {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
