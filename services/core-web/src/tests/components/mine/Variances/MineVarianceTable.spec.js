import React from "react";
import { render } from "@testing-library/react";
import { MineVarianceTable } from "@/components/mine/Variances/MineVarianceTable";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";
import { BrowserRouter } from "react-router-dom";

const props = {};
const dispatchProps = {};

const setupDispatchProps = () => {
  dispatchProps.openModal = jest.fn();
  dispatchProps.openEditVarianceModal = jest.fn();
  dispatchProps.openViewVarianceModal = jest.fn();
};

const setupProps = () => {
  props.variances = MOCK.VARIANCES.records;
  props.complianceCodesHash = MOCK.HSRCM_HASH;
  props.varianceStatusOptionsHash = MOCK.VARIANCE_STATUS_OPTIONS_HASH;
  props.inspectorsHash = MOCK.INSPECTORS_HASH;
  props.isApplication = false;
  props.params = {
    variance_application_status_code: [],
  };
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("MineVarianceTable", () => {
  it("renders properly", () => {
    const { container: component } = render(<BrowserRouter><ReduxWrapper><MineVarianceTable {...props} {...dispatchProps} /></ReduxWrapper></BrowserRouter>);
    expect(component).toMatchSnapshot();
  });
});
