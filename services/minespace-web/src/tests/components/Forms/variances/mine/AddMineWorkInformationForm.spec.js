import React from "react";
import { render } from "@testing-library/react";
import { AddMineWorkInformationForm } from "@/components/Forms/AddMineWorkInformationForm";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.submitting = false;
  props.mineWorkInformationGuid = "1738472";
  props.complianceCodes = MOCK.COMPLIANCE_CODES.records;
  props.title = "testing title";
  props.isEditMode = true;
  props.formValues = {};
};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.cancelEdit = jest.fn();
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("AddMineWorkInformationForm", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <AddMineWorkInformationForm {...props} {...dispatchProps} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
