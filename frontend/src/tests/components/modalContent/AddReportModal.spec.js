import React from "react";
import { shallow } from "enzyme";
import { AddReportModal } from "@/components/modalContent/AddReportModal";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
};

const setupProps = () => {
  props.title = "mockTitle";
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AddReportModal", () => {
  it("renders properly", () => {
    const component = shallow(<AddReportModal {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
