import React from "react";
import { shallow } from "enzyme";
import RefreshButton from "@/components/common/RefreshButton";

describe("RefreshButton", () => {
  it("renders properly", () => {
    const wrapper = shallow(<RefreshButton />);
    expect(wrapper).toMatchSnapshot();
  });
});
