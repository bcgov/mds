import React from "react";
import { shallow } from "enzyme";
import { MineTailingsInfo } from "@/components/mine/Tailings/MineTailingsInfo";

describe("MineTailingsInfo", () => {
  it("renders properly", () => {
    const component = shallow(<MineTailingsInfo />);
    expect(component).toMatchSnapshot();
  });
});
