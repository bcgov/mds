import React from "react";
import { shallow } from "enzyme";
import PageNotFound from "@/components/common/PageNotFound";

const props = {};

const setupProps = () => {
  props.type = "generic";
};

beforeEach(() => {
  setupProps();
});
// reduxForm is not defined
describe("PageNotFound", () => {
  it("renders properly", () => {
    const wrapper = shallow(<PageNotFound {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
