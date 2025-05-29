import React from "react";
import { render } from "@testing-library/react";
import { ViewBondModal } from "@/components/modalContent/ViewBondModal";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  closeModal: jest.fn(),
};
const props = {
  bondTypeOptionsHash: MOCK.BOND_TYPE_OPTIONS_HASH,
  bondStatusOptionsHash: MOCK.BOND_STATUS_OPTIONS_HASH,
  bondDocumentTypeOptionsHash: MOCK.BOND_DOCUMENT_TYPE_OPTIONS_HASH,
  bond: MOCK.BONDS.records[0],
};

describe("ViewBondModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><ViewBondModal {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
