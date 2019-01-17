import React from "react";
import { shallow } from "enzyme";
import Loading from "@/components/common/Loading";

describe("Loading", () => {
  it("renders properly", () => {
    const wrapper = shallow(<Loading />);
    expect(wrapper).toMatchSnapshot();
  });
});
