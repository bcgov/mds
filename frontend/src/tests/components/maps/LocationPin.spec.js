import React from "react";
import { shallow } from "enzyme";
import { LocationPin } from "@/components/maps/LocationPin";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.center = MOCK.COORDINATES;
  props.map = {};
  props.view = {};
};

beforeEach(() => {
  setupProps();
});

describe("LocationPin", () => {
  it("renders properly", () => {
    const component = shallow(<LocationPin {...props} />);
    expect(component).toMatchSnapshot();
  });
});
