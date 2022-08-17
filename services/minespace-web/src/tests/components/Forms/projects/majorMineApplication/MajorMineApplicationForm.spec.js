import React from "react";
import { shallow } from "enzyme";
import { MajorMineApplicationForm } from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationForm";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.change = jest.fn(() => Promise.resolve());
};

const setupProps = () => {
  props.project = MOCK.PROJECT;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MajorMineApplicationForm", () => {
  it("renders properly", () => {
    const component = shallow(<MajorMineApplicationForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
