import React from "react";
import { shallow } from "enzyme";
import PrivateRoutes from "@/routes/PrivateRoutes";

const props = {};

const setupProps = () => {};

beforeEach(() => {
  setupProps();
});

describe("PrivateRoutes ", () => {
  it("renders properly", () => {
    const component = shallow(<PrivateRoutes {...props} />);
    expect(component).toMatchSnapshot();
  });
});
