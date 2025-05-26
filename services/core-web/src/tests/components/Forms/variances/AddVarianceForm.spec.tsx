import React from "react";
import { render } from "@testing-library/react";
import { AddVarianceForm } from "@/components/Forms/variances/AddVarianceForm";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  onSubmit: jest.fn(),
  closeModal: jest.fn(),
};
const props = {
  mineGuid: "48593",
  submitting: false,
  complianceCodes: MOCK.DROPDOWN_HSRCM_CODES,
  documentCategoryOptions: MOCK.VARIANCE_DOCUMENT_CATEGORY_OPTIONS_DROPDOWN,
  inspectors: MOCK.PARTY.parties,
};

describe("AddVarianceForm", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <AddVarianceForm {...dispatchProps} {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
