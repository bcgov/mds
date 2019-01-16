import React from "react";
import { shallow } from "enzyme";
import DashboardRoutes from "@/routes/DashboardRoutes";

const props = {};

const setupProps = () => {};

beforeEach(() => {
  setupProps();
});

describe("DashboardRoutes ", () => {
  it("renders properly", () => {
    const component = shallow(<DashboardRoutes {...props} />);
    expect(component).toMatchSnapshot();
  });
});
