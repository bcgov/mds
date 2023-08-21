import React from "react";
import { shallow } from "enzyme";
import AdminNavigation from "@/components/admin/AdminNavigation";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => { };

const setupProps = () => {
  props.activeButton = "verified";
  props.openSubMenuKey = [];
  props.userRoles = [];
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AdminNavigation", () => {
  it("renders properly", () => {
    const component = shallow(<AdminNavigation {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
