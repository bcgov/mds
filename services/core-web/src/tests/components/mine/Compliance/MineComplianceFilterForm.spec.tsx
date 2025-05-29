import React from "react";
import { render } from "@testing-library/react";
import { MineComplianceFilterForm } from "@/components/mine/Compliance/MineComplianceFilterForm";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  onSubmit: jest.fn(),
  reset: jest.fn(),
};
const props = {
  complianceCodes: MOCK.DROPDOWN_HSRCM_CODES,
};

describe("MineComplianceFilterForm", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <MineComplianceFilterForm {...dispatchProps} {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });
});
