import React from "react";
import { render } from "@testing-library/react";
import { DocumentCategoryForm } from "@/components/Forms/DocumentCategoryForm";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const props = {
  documents: [],
  categories: [],
  isProcessed: false,
  mineGuid: "52783475",
  change: jest.fn(),
  arrayPush: jest.fn(),
  infoText: "some info",
  esupGuid: "dummy-esup-guid",
  isAmendment: false,
};

describe("DocumentCategoryForm", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <FormWrapper name="formName">
          <DocumentCategoryForm {...props} />
        </FormWrapper>
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
