import React from "react";
import { shallow } from "enzyme";
import { Projects } from "@/components/dashboard/mine/projects/Projects";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.match = { params: { id: "18133c75-49ad-4101-85f3-a43e35ae989a" } };
  props.mines = { [props.match.params.id]: MOCK.MINES.mines[MOCK.MINES.mineIds[0]] };
  props.projects = MOCK.PROJECTS;
};

const setupDispatchProps = () => {
  dispatchProps.fetchMineRecordById = jest.fn(() => Promise.resolve());
  dispatchProps.fetchProjectsByMine = jest.fn(({ mineGuid }) => Promise.resolve({}));
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("Projects", () => {
  it("renders properly", () => {
    const component = shallow(<Projects {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
