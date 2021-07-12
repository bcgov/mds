import React from "react";
import { shallow } from "enzyme";
import { MagazineForm } from "@/components/Forms/ExplosivesPermit/MagazineForm";

const props = {};

const setupProps = () => {
  props.isApproved = false;
};

beforeEach(() => {
  setupProps();
});

describe("MagazineForm", () => {
  it("renders properly", () => {
    const component = shallow(<MagazineForm {...props} />);
    expect(component).toMatchSnapshot();
  });
});
