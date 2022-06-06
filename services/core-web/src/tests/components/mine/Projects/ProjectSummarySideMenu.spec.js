import React from "react";
import { shallow } from "enzyme";
import { ProjectSummarySideMenu } from "@/components/mine/Projects/ProjectSummarySideMenu";

const props = {};

const setupProps = () => {
  props.history = { push: jest.fn(), replace: jest.fn(), action: "", location: { hash: "" } };
  props.location = { hash: "" };
  props.match = { params: { id: "18145c75-49ad-0101-85f3-a43e45ae989a" } };
};

beforeEach(() => {
  setupProps();
});

describe("ProjectSummarySideMenu", () => {
  it("renders properly", () => {
    const component = shallow(<ProjectSummarySideMenu {...props} />);
    expect(component).toMatchSnapshot();
  });
});
