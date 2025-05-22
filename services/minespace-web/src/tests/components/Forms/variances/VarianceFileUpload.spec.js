import React from "react";
import { render } from "@testing-library/react";
import { VarianceFileUpload } from "@/components/Forms/variances/VarianceFileUpload";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.mineGuid = "1738472";
};

const setupDispatchProps = () => {
  dispatchProps.onRemoveFile = jest.fn();
  dispatchProps.onFileLoad = jest.fn();
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("VarianceFileUpload", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <FormWrapper name="formName">
          <VarianceFileUpload {...props} {...dispatchProps} />
        </FormWrapper>
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
