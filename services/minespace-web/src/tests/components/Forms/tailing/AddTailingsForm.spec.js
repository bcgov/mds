import React from "react";
import { render } from "@testing-library/react";
import { AddTailingsForm } from "@/components/Forms/tailing/AddTailingsForm";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.title = "mockTitle";
  props.submitting = false;
  props.consequenceClassificationStatusCodeOptions = [];
  props.itrbExemptionStatusCodeOptions = [];
  props.TSFOperatingStatusCodeOptions = [];
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AddTailingsForm", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <AddTailingsForm {...dispatchProps} {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
