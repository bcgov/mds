import React from "react";
import { render } from "@testing-library/react";
import { AddBondModal } from "@/components/modalContent/AddBondModal";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  oSubmit: jest.fn(),
  closeModal: jest.fn(),
};
const props = {
  title: "Add Bond",
  permitGuid: "462562457",
  provinceOptions: MOCK.DROPDOWN_PROVINCE_OPTIONS,
  bondTypeOptions: [],
  bond: MOCK.BONDS.records[0],
  formValues: MOCK.BONDS.records[0],
  bondStatusOptionsHash: MOCK.BOND_STATUS_OPTIONS_HASH,
};

describe("AddBondModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><AddBondModal {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
