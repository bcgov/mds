import React from "react";
import { render } from "@testing-library/react";
import { VarianceHomePage } from "@/components/dashboard/varianceHomePage/VarianceHomePage";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  fetchMineTenureTypes: jest.fn(),
  fetchVarianceDocumentCategoryOptions: jest.fn(),
  addDocumentToVariance: jest.fn(),
  updateVariance: jest.fn(),
  fetchMineComplianceCodes: jest.fn(),
  fetchRegionOptions: jest.fn(),
  openModal: jest.fn(),
  closeModal: jest.fn(),
  fetchInspectors: jest.fn(),
  fetchMineCommodityOptions: jest.fn(),
  fetchVarianceStatusOptions: jest.fn(),
  fetchVariances: jest.fn(() => Promise.resolve({})),
};
const reducerProps = {
  location: { search: " " },
  history: {
    replace: jest.fn(),
    location: {},
  },
  variances: MOCK.VARIANCES.records,
  variancePageData: MOCK.VARIANCE_PAGE_DATA,
  complianceCodesHash: MOCK.COMPLIANCE_CODES,
  getDropdownHSRCMComplianceCodes: MOCK.DROPDOWN_HSRCM_CODES,
  filterVarianceStatusOptions: MOCK.BULK_STATIC_CONTENT_RESPONSE.varianceStatusOptions,
};

describe("VarianceHomePage", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><VarianceHomePage {...dispatchProps} {...reducerProps} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
