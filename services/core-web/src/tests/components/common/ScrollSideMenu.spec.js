import React from "react";
import { shallow } from "enzyme";
import ScrollSideMenu from "@/components/common/ScrollSideMenu";

const props = {};

const setupProps = () => {
  props.menuOptions = [{ href: "section-1", title: "Section #1" }];
  props.featureUrlRoute = jest.fn();
  props.featureUrlRouteArguments = ["1stGuid", "2ndGuid"];
  props.match = { params: { id: "1234-4567-xwqy-j765" } };
  props.history = {
    push: jest.fn(),
    replace: jest.fn(),
    action: "",
    location: { hash: "1x4v6b8m" },
  };
  props.location = { hash: "1x4v6b8m" };
};

beforeEach(() => {
  setupProps();
});

describe("ScrollSideMenu", () => {
  it("renders properly", () => {
    const component = shallow(<ScrollSideMenu {...props} />);
    expect(component).toMatchSnapshot();
  });
});
