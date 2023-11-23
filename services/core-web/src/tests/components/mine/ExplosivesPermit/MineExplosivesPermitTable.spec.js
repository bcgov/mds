import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "@/App";
import MineExplosivesPermitTable from "@/components/mine/ExplosivesPermit/MineExplosivesPermitTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.data = [];
  props.isPermitTab = false;
  props.isLoaded = false;
  props.expandedRowKeys = [];
  props.data = MOCK.EXPLOSIVES_PERMITS.data.records;
  props.explosivesPermitStatusOptionsHash = {};
  props.explosivesPermitDocumentTypeDropdownOptions = [];
  props.explosivesPermitDocumentTypeOptionsHash = {};

  props.onExpand = jest.fn();
  props.handleOpenExplosivesPermitDecisionModal = jest.fn();
  props.handleOpenExplosivesPermitStatusModal = jest.fn();
  props.handleDeleteExplosivesPermit = jest.fn();
  props.handleOpenAddExplosivesPermitModal = jest.fn();
  props.handleOpenViewMagazineModal = jest.fn();
  props.handleOpenExplosivesPermitCloseModal = jest.fn();
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
beforeEach(() => {
  setupProps();
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
