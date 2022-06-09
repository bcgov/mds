import React from "react";
import { shallow } from "enzyme";
import { InformationRequirementsTableTab } from "@/components/mine/Projects/InformationRequirementsTableTab";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.project = MOCK.PROJECT;
  props.informationRequirementsTable = MOCK.INFORMATION_REQUIREMENTS_TABLE;
  props.requirements = MOCK.REQUIREMENTS.records;
  props.match = { params: { projectGuid: "123", irtGuid: "456" } };
  props.history = { push: jest.fn() };
};

const setupDispatchProps = () => {
  dispatchProps.fetchRequirements = jest.fn(() => Promise.resolve());
  dispatchProps.fetchProjectById = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("InformationRequirementsTableTab", () => {
  it("renders properly", () => {
    const component = shallow(<InformationRequirementsTableTab {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
