import React from "react";
import { shallow } from "enzyme";
import { LandingPage } from "@/components/pages/LandingPage";

describe("LandingPage", () => {
  it("renders properly", () => {
    const component = shallow(<LandingPage />);
    expect(component).toMatchSnapshot();
  });
});
