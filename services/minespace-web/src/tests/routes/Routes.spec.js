import React from "react";
import { shallow } from "enzyme";
import Routes from "@/routes/Routes";

const props = {};

const setupProps = () => {};

beforeEach(() => {
  setupProps();
});

// react testing library passes but doesn't provide useful results.
describe("PrivateRoutes ", () => {
  it("renders properly", () => {
    const component = shallow(<Routes {...props} />);
    expect(component).toMatchSnapshot();
  });
});
