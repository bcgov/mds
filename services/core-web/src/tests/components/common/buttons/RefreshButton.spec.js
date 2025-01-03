import React from "react";
import { shallow } from "enzyme";
import RefreshButton from "@/components/common/buttons/RefreshButton";

describe("RefreshButton", () => {
  it("renders properly", () => {
    const wrapper = shallow(<RefreshButton />);
    expect(wrapper).toMatchSnapshot();
  });
});
