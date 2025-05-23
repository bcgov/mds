import React from "react";
import { render } from "@testing-library/react";
import { ExplosivesPermitDecisionForm } from "@/components/Forms/ExplosivesPermit/ExplosivesPermitDecisionForm";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const props = {
  submitting: false,
  title: "Close Permit",
  onSubmit: jest.fn(),
  closeModal: jest.fn(),
  previewDocument: jest.fn(),
  inspectors: [],
  formValues: {},
  documentType: {
    document_template: {
      form_spec: [],
    },
  },
};

describe("ExplosivesPermitDecisionForm", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <ExplosivesPermitDecisionForm {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
