import React from "react";
import { shallow } from "enzyme";
import Routes from "@/routes/Routes";
// import * as routes from "@/constants/routes";
// import * as String from "@/constants/strings";

const props = {};

const setupProps = () => {};

beforeEach(() => {
  setupProps();
});

describe("Routes ", () => {
  it("renders properly", () => {
    const component = shallow(<Routes {...props} />);
    expect(component).toMatchSnapshot();
  });
});
