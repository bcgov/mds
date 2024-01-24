import React from "react";
import { shallow } from "enzyme";
import { InformationRequirementsTablePage } from "@/components/pages/Project/InformationRequirementsTablePage";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.match = { params: { projectGuid: "123", tab: "overview" } };
  props.project = MOCK.PROJECT;
};

const setupDispatchProps = () => {
  dispatchProps.clearInformationRequirementsTable = jest.fn(() => Promise.resolve());
  dispatchProps.fetchProjectById = jest.fn(() => Promise.resolve());
  dispatchProps.fetchRequirements = jest.fn(() => Promise.resolve());
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("InformationRequirementsTablePage", () => {
  it("renders properly", () => {
    const component = shallow(<InformationRequirementsTablePage {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
