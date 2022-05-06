import React from "react";
import { shallow } from "enzyme";
import { ProjectsTable } from "@/components/dashboard/mine/projects/ProjectsTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.projects = MOCK.PROJECTS.records;
};

const setupDispatchProps = () => {};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("ProjectsTable", () => {
  it("renders properly", () => {
    const component = shallow(<ProjectsTable {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
