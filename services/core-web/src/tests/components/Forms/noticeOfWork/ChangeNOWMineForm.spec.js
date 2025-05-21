import React from "react";
import { render } from "@testing-library/react";
import { ChangeNOWMineForm } from "@/components/Forms/noticeOfWork/ChangeNOWMineForm";
import { NOW } from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
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
    const { container: component } = render(<ReduxWrapper><ChangeNOWMineForm {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
