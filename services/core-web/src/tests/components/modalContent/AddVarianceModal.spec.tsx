import React from "react";
import { render } from "@testing-library/react";
import { AddVarianceModal } from "@/components/modalContent/AddVarianceModal";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@mds/common/tests/utils/ReduxWrapper";

const dispatchProps = {
  onSubmit: jest.fn(),
  closeModal: jest.fn(),
};
const props = {
  mineGuid: "48593",
  mineNo: "B01034",
  complianceCodes: MOCK.DROPDOWN_HSRCM_CODES,
  inspectors: Object.values(MOCK.PARTY.parties),
};

describe("AddVarianceModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><AddVarianceModal {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
