import React from "react";
import { shallow } from "enzyme";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";

describe("LoadingWrapper", () => {
  it("renders properly", () => {
    const wrapper = shallow(<LoadingWrapper />);
    expect(wrapper).toMatchSnapshot();
  });
});
