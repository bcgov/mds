import React from "react";
import { render } from "@testing-library/react";
import { VarianceFileUpload } from "@/components/Forms/variances/VarianceFileUpload";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  onFileLoad: jest.fn(),
  onRemoveFile: jest.fn(),
};
const props = {
  mineGuid: "48593",
  mineNo: "B01034",
};

describe("VarianceFileUpload", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <FormWrapper name="formName">
          <VarianceFileUpload {...dispatchProps} {...props} />
        </FormWrapper>
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
