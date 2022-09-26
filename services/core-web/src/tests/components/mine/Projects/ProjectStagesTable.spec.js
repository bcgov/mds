import React from "react";
import { shallow } from "enzyme";
import { ProjectStagesTable } from "@/components/mine/Projects/ProjectStagesTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.projectStages = [
    {
      title: "Project description",
      key: 1,
      status: "SUB",
      payload: MOCK.PROJECT_SUMMARY,
      statusHash: MOCK.PROJECT_SUMMARY_STATUS_CODES_HASH,
      link: null,
    },
  ];
};

beforeEach(() => {
  setupProps();
});

describe("ProjectStagesTable", () => {
  it("renders properly", () => {
    const component = shallow(<ProjectStagesTable {...props} />);
    expect(component).toMatchSnapshot();
  });
});
