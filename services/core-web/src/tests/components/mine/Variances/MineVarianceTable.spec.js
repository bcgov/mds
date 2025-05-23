import React from "react";
import { render } from "@testing-library/react";
import { MineVarianceTable } from "@/components/mine/Variances/MineVarianceTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";

const props = {
  variances: MOCK.VARIANCES.records,
  complianceCodesHash: MOCK.HSRCM_HASH,
  varianceStatusOptionsHash: MOCK.VARIANCE_STATUS_OPTIONS_HASH,
  inspectorsHash: MOCK.INSPECTORS_HASH,
  isApplication: false,
  params: {
    variance_application_status_code: [],
  },
};
const dispatchProps = {
  openModal: jest.fn(),
  openEditVarianceModal: jest.fn(),
  openViewVarianceModal: jest.fn(),
};

describe("MineVarianceTable", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <BrowserRouter>
        <ReduxWrapper>
          <MineVarianceTable {...props} {...dispatchProps} />
        </ReduxWrapper>
      </BrowserRouter>
    );
    expect(component).toMatchSnapshot();
  });
});
