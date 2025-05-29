import React from "react";
import { render } from "@testing-library/react";
import { TransferBondForm } from "@/components/Forms/Securities/TransferBondForm";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  onSubmit: jest.fn(),
  closeModal: jest.fn(),
};
const props = {
  title: "Transfer Bond",
  permitGuid: "1628847c-060b-45f2-990f-815877174801",
  submitting: false,
  provinceOptions: MOCK.DROPDOWN_PROVINCE_OPTIONS,
  bondTypeOptions: [],
  bond: MOCK.BONDS.records[0],
  permits: MOCK.PERMITS,
};

describe("TransferBondForm", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <TransferBondForm {...dispatchProps} {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
