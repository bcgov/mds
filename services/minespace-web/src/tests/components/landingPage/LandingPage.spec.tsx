import React from "react";
import { shallow } from "enzyme";
import { LandingPage } from "@/components/pages/LandingPage";

const props = { isAuthenticated: false };
describe("LandingPage", () => {
  it("renders properly", () => {
    const component = shallow(<LandingPage {...props} />);
    expect(component).toMatchSnapshot();
  });
});
