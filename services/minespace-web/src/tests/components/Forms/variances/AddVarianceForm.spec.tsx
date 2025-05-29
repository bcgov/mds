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
  submitting: false,
  mineGuid: "1738472",
  complianceCodes: MOCK.COMPLIANCE_CODES.records,
};

describe("AddVarianceForm", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <AddVarianceForm {...props} {...dispatchProps} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
