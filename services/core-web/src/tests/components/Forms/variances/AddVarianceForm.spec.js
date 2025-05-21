import React from "react";
import { render } from "@testing-library/react";
import { AddVarianceForm } from "@/components/Forms/variances/AddVarianceForm";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.closeModal = jest.fn();
};

const setupProps = () => {
  props.mineGuid = "48593";
  props.submitting = false;
  props.complianceCodes = MOCK.DROPDOWN_HSRCM_CODES;
  props.documentCategoryOptions = MOCK.VARIANCE_DOCUMENT_CATEGORY_OPTIONS_DROPDOWN;
  props.inspectors = MOCK.PARTY.parties;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("AddVarianceForm", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><AddVarianceForm {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
