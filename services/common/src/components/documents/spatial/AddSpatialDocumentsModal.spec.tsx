import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import AddSpatialDocumentsModal from "./AddSpatialDocumentsModal";
import FormWrapper from "../../forms/FormWrapper";
import { BrowserRouter } from "react-router-dom";

describe("AddSpatialDocumentsModal", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper>
        <BrowserRouter>
          <FormWrapper name="formName" onSubmit={() => {}} initialValues={{ fieldName: [] }}>
            <AddSpatialDocumentsModal
              formName="formName"
              fieldName="fieldName"
              uploadUrl="uploadUrl"
            />
          </FormWrapper>
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
