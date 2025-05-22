import React from "react";
import { render } from "@testing-library/react";
import { EditWorkerInformationForm } from "@/components/Forms/mines/EditWorkerInformationForm";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const props = {};
const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.handleToggleEdit = jest.fn();
};

const setupProps = () => {
  props.title = "mockTitle";
  props.submitting = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("EditWorkerInformationForm", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <EditWorkerInformationForm {...props} {...dispatchProps} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
