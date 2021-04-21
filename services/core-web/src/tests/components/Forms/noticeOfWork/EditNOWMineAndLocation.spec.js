import React from "react";
import { shallow } from "enzyme";
import { EditNOWMineAndLocation } from "@/components/Forms/noticeOfWork/EditNOWMineAndLocation";

const props = {};

const setupProps = () => {
  props.locationOnly = true;
  props.latitude = "";
  props.longitude = "";
};

beforeEach(() => {
  setupProps();
});

describe("EditNOWMineAndLocation", () => {
  it("renders properly", () => {
    const component = shallow(<EditNOWMineAndLocation {...props} />);
    expect(component).toMatchSnapshot();
  });
});
