import React from "react";
import { render } from "@testing-library/react";
import MineVariance from "@/components/mine/Variances/MineVariance";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";

const dispatchProps = {
  openModal: jest.fn(),
  closeModal: jest.fn(),
  createVariance: jest.fn(),
  fetchVariancesByMine: jest.fn(() => () => Promise.resolve()),
  addDocumentToVariance: jest.fn(),
  updateVariance: jest.fn(),
  deleteVariance: jest.fn(),
};

const reducerProps = {
  mines: { [MOCK.MINES.mineIds[0]]: MOCK.MINES.mines[MOCK.MINES.mineIds[0]] },
  mineGuid: MOCK.MINES.mineIds[0],
  varianceApplications: [MOCK.VARIANCE],
  approvedVariances: [MOCK.VARIANCE],
  complianceCodesHash: MOCK.HSRCM_HASH,
  complianceCodes: MOCK.DROPDOWN_HSRCM_CODES,
  inspectors: [
    {
      groupName: "Inspectors",
      opt: MOCK.INSPECTORS.results.map((inspector) => ({
        value: inspector.core_user_guid,
        label: inspector.idir_user_detail.username,
        ...inspector,
      })),
    },
  ],
  inspectorsHash: {},
  varianceStatusOptions: MOCK.VARIANCE_DROPDOWN_STATUS_OPTIONS,
  varianceStatusOptionsHash: MOCK.VARIANCE_STATUS_OPTIONS_HASH,
  varianceDocumentCategoryOptions: [],
  varianceDocumentCategoryOptionsHash: {},
};

describe("MineVariance", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><ReduxWrapper><MineVariance {...dispatchProps} {...reducerProps} /></ReduxWrapper></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
