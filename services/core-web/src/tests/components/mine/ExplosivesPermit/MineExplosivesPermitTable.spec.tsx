import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "@/App";
import MineExplosivesPermitTable from "@/components/mine/ExplosivesPermit/MineExplosivesPermitTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { IExplosivesPermit } from "@mds/common/interfaces";

const props = {
  data: MOCK.EXPLOSIVES_PERMITS.data.records as IExplosivesPermit[],
  isPermitTab: false,
  isLoaded: false,
  expandedRowKeys: [],
  explosivesPermitStatusOptionsHash: {},
  explosivesPermitDocumentTypeDropdownOptions: [],
  explosivesPermitDocumentTypeOptionsHash: {},
  onExpand: jest.fn(),
  handleOpenExplosivesPermitDecisionModal: jest.fn(),
  handleOpenExplosivesPermitStatusModal: jest.fn(),
  handleDeleteExplosivesPermit: jest.fn(),
  handleOpenAddExplosivesPermitModal: jest.fn(),
  handleOpenViewMagazineModal: jest.fn(),
  handleOpenExplosivesPermitCloseModal: jest.fn(),
  handleOpenEditExplosivesPermitModal: jest.fn(),
  handleOpenViewExplosivesPermitModal: jest.fn(),
  handleOpenAmendExplosivesPermitModal: jest.fn(),
};

// See SO for matchMedia issue: https://stackoverflow.com/questions/39830580/jest-test-fails-typeerror-window-matchmedia-is-not-a-function
// if we switch over more to this testing setup, may want to move this somewhere more general
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      matches: false,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
  });
});

describe("MineExplosivesPermitTable", () => {
  it("renders properly", () => {
    const { container } = render(
      <BrowserRouter basename="">
        <Provider store={store}>
          <MineExplosivesPermitTable {...props} />
        </Provider>
      </BrowserRouter>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
