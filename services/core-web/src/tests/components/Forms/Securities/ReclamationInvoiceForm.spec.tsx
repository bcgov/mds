import React from "react";
import { render } from "@testing-library/react";
import { ReclamationInvoiceForm } from "@/components/Forms/Securities/ReclamationInvoiceForm";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  onSubmit: jest.fn(),
  closeModal: jest.fn(),
};
const props = {
  title: "Add Reclamation Invoice",
  mineGuid: "462562457",
  submitting: false,
  invoice: MOCK.RECLAMATION_INVOICES.records[0],
};

describe("ReclamationInvoiceForm", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <ReclamationInvoiceForm {...dispatchProps} {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
