import React from "react";
import { render } from "@testing-library/react";
import { MineVariance } from "@/components/mine/Variances/MineVariance";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";

const dispatchProps = {
  openModal: jest.fn(),
  closeModal: jest.fn(),
  createVariance: jest.fn(),
  fetchVariancesByMine: jest.fn(() => Promise.resolve()),
  addDocumentToVariance: jest.fn(),
  updateVariance: jest.fn(),
};

const reducerProps = {
  mines: MOCK.MINES.mines,
  mineGuid: MOCK.MINES.mineIds[0],
  varianceApplications: MOCK.VARIANCES.records,
  approvedVariances: MOCK.VARIANCES.records,
  complianceCodesHash: MOCK.HSRCM_HASH,
  complianceCodes: MOCK.DROPDOWN_HSRCM_CODES,
  coreUsers: MOCK.PARTY.parties,
  varianceStatusOptions: MOCK.VARIANCE_DROPDOWN_STATUS_OPTIONS,
  varianceStatusOptionsHash: MOCK.VARIANCE_STATUS_OPTIONS_HASH,
  inspectors: MOCK.INSPECTORS.results,
  varianceDocumentCategoryOptions: {},
};

describe("MineVariance", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><ReduxWrapper><MineVariance {...dispatchProps} {...reducerProps} /></ReduxWrapper></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
