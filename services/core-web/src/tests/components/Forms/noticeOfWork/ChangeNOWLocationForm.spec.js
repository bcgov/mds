import React from "react";
import { shallow } from "enzyme";
import { ChangeNOWLocationForm } from "@/components/Forms/noticeOfWork/ChangeNOWLocationForm";
import { NOW, MINES } from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.title = "mockTitle";
  props.submitting = false;
  props.locationOnly = true;
  // eslint-disable-next-line prefer-destructuring
  props.mine = MINES.mines[0];
  props.latitude = "";
  props.longitude = "";
  // eslint-disable-next-line prefer-destructuring
  props.noticeOfWork = NOW.applications[0];
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("ChangeNOWLocationForm", () => {
  it("renders properly", () => {
    const component = shallow(<ChangeNOWLocationForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
