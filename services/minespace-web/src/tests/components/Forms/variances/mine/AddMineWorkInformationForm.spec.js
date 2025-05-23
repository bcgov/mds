import React from "react";
import { render } from "@testing-library/react";
import { AddMineWorkInformationForm } from "@/components/Forms/AddMineWorkInformationForm";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  onSubmit: jest.fn(),
  cancelEdit: jest.fn(),
};
const props = {
  submitting: false,
  mineWorkInformationGuid: "1738472",
  complianceCodes: MOCK.COMPLIANCE_CODES.records,
  title: "testing title",
  isEditMode: true,
  formValues: {},
};

describe("AddMineWorkInformationForm", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <AddMineWorkInformationForm {...props} {...dispatchProps} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
