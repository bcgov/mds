import React from "react";
import { render } from "@testing-library/react";
import { VariancesTable } from "@/components/dashboard/mine/variances/VariancesTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const dispatchProps = {
  openEditVarianceModal: jest.fn(),
  openViewVarianceModal: jest.fn(),
};
const props = {
  variances: MOCK.VARIANCES.records,
  complianceCodesHash: MOCK.HSRCM_HASH,
  varianceStatusOptionsHash: MOCK.VARIANCE_STATUS_OPTIONS_HASH,
  isApplication: false,
  inspectorsHash: {},
};

describe("VariancesTable", () => {
  it("renders properly", () => {
    const { container: component } = render(<VariancesTable {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
