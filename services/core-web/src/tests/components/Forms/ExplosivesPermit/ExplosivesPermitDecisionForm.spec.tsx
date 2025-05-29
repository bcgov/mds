import React from "react";
import { render } from "@testing-library/react";
import { ExplosivesPermitDecisionForm } from "@/components/Forms/ExplosivesPermit/ExplosivesPermitDecisionForm";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";
import { EXPLOSIVES_PERMITS } from "@mds/common/tests/mocks/dataMocks";

const props = {
  submitting: false,
  title: "Close Permit",
  initialValues: EXPLOSIVES_PERMITS.data.records[0],
  onSubmit: jest.fn(),
  closeModal: jest.fn(),
  previewDocument: jest.fn(),
  inspectors: [],
  formValues: {},
  documentType: {
    explosives_permit_document_type_code: "TEST_CODE",
    description: "Test Description",
    active_ind: true,
    display_order: 1,
    document_template: {
      document_template_code: "TEST_TEMPLATE_CODE",
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
