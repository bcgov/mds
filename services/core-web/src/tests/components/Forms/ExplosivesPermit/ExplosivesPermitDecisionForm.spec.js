import React from "react";
import { render } from "@testing-library/react";
import { ExplosivesPermitDecisionForm } from "@/components/Forms/ExplosivesPermit/ExplosivesPermitDecisionForm";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const props = {};

const setupProps = () => {
  props.submitting = false;
  props.title = "Close Permit";
  props.onSubmit = jest.fn();
  props.closeModal = jest.fn();
  props.previewDocument = jest.fn();
  props.inspectors = [];
  props.formValues = {};
  props.documentType = {
    document_template: {
      form_spec: [],
    },
  };
};

beforeEach(() => {
  setupProps();
});

describe("ExplosivesPermitDecisionForm", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><ExplosivesPermitDecisionForm {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
