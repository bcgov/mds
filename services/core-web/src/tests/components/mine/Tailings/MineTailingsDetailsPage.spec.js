import React from "react";
import { shallow } from "enzyme";
import { MineTailingsDetailsPage } from "@/components/mine/Tailings/MineTailingsDetailsPage";
// reduxForm is not defined
describe("MineTailingsDetailsPage", () => {
  it("renders properly", () => {
    const component = shallow(<MineTailingsDetailsPage />);
    expect(component).toMatchSnapshot();
  });
});
