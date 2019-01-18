import React from "react";
import { shallow } from "enzyme";
import PublicRoutes from "@/routes/PublicRoutes";

const props = {};

const setupProps = () => {};

beforeEach(() => {
  setupProps();
});

describe("PublicRoutes ", () => {
  it("renders properly", () => {
    const component = shallow(<PublicRoutes {...props} />);
    expect(component).toMatchSnapshot();
  });
});
