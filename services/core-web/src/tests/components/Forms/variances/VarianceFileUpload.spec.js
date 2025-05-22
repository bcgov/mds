import React from "react";
import { render } from "@testing-library/react";
import { VarianceFileUpload } from "@/components/Forms/variances/VarianceFileUpload";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onFileLoad = jest.fn();
  dispatchProps.onRemoveFile = jest.fn();
};

const setupProps = () => {
  props.mineGuid = "48593";
  props.mineNo = "B01034";
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("VarianceFileUpload", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><FormWrapper name="formName"><VarianceFileUpload {...dispatchProps} {...props} /></FormWrapper></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
