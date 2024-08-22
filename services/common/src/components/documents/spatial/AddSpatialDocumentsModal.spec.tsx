import React from "react";
import { render } from "@testing-library/react";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import AddSpatialDocumentsModal from "./AddSpatialDocumentsModal";
import { BrowserRouter } from "react-router-dom";

const initialState = {
  form: {
    formName: {
      registeredFields: {
        fieldName: { name: "fieldName", type: "Field", count: 1 },
      },
      initial: { fieldName: [] },
      values: { fieldName: [] },
    },
  },
};
describe("AddSpatialDocumentsModal", () => {
  it("renders properly", () => {
    const { container } = render(
      <ReduxWrapper initialState={initialState}>
        <BrowserRouter>
          <AddSpatialDocumentsModal
            formName="formName"
            fieldName="fieldName"
            uploadUrl="uploadUrl"
          />
        </BrowserRouter>
      </ReduxWrapper>
    );
    expect(container).toMatchSnapshot();
  });
});
