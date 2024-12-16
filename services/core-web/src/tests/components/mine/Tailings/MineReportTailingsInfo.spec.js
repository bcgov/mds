import React from "react";
import { shallow } from "enzyme";
import { MineReportTailingsInfo } from "@/components/mine/Tailings/MineReportTailingsInfo";
// reduxForm is not defined
describe("MineReportTailingsInfo", () => {
  it("renders properly", () => {
    const component = shallow(<MineReportTailingsInfo />);
    expect(component).toMatchSnapshot();
  });
});
