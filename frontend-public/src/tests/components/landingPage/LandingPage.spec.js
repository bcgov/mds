import React from "react";
import { shallow } from "enzyme";
import { LandingPage } from "@/components/landingPage/LandingPage";

describe("LandingPage", () => {
  it("renders properly", () => {
    const component = shallow(<LandingPage />);
    expect(component).toMatchSnapshot();
  });
});
