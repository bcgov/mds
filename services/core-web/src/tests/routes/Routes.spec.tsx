import React from "react";
import { shallow } from "enzyme";
import Routes from "@/routes/Routes";

const props = {};

describe("Routes ", () => {
  it("renders properly", () => {
    const component = shallow(<Routes {...props} />);
    expect(component).toMatchSnapshot();
  });
});
