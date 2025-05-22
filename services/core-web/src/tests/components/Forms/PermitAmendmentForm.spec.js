import React from "react";
import { render } from "@testing-library/react";
import { PermitAmendmentForm } from "@/components/Forms/PermitAmendmentForm";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.getDropdownPermitStatusOptions = jest.fn();
};

const setupProps = () => {
  props.title = "mockTitle";
  props.submitting = false;
  props.permitStatusOptions = [];
  props.mine_guid = "";
  props.isMajorMine = true;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("PermitAmendmentForm", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <PermitAmendmentForm
          {...dispatchProps}
          {...props}
          handleRemovePermitAmendmentDocument={jest.fn()}
        />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
