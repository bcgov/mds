import React from "react";
import { render } from "@testing-library/react";
import { TransferBondModal } from "@/components/modalContent/TransferBondModal";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  oSubmit: jest.fn(),
  closeModal: jest.fn(),
};
const props = {
  title: "Transfer Bond",
  permitGuid: "1628847c-060b-45f2-990f-815877174801",
  mineGuid: "3512521",
  bond: MOCK.BONDS.records[0],
  permits: MOCK.PERMITS,
};

describe("TransferBondModal", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><TransferBondModal {...dispatchProps} {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
