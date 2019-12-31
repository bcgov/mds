import React from "react";
import { shallow } from "enzyme";
import { ChangeNOWMineForm } from "@/components/Forms/noticeOfWork/ChangeNOWMineForm";
import { NOW } from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
  dispatchProps.handleChange = jest.fn();
  dispatchProps.handleSelect = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.title = "mockTitle";
  props.submitting = false;
  // eslint-disable-next-line prefer-destructuring
  props.noticeOfWork = NOW.applications[0];
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("ChangeNOWMineForm", () => {
  it("renders properly", () => {
    const component = shallow(<ChangeNOWMineForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
