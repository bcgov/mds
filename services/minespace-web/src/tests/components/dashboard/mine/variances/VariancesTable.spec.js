import React from "react";
import { shallow } from "enzyme";
import { VariancesTable } from "@/components/dashboard/mine/variances/VariancesTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupProps = () => {
  props.variances = MOCK.VARIANCES.records;
  props.complianceCodesHash = MOCK.HSRCM_HASH;
  props.varianceStatusOptionsHash = MOCK.VARIANCE_STATUS_OPTIONS_HASH;
  props.isApplication = false;
  props.inspectorsHash = {};
};

const setupDispatchProps = () => {
  dispatchProps.openEditVarianceModal = jest.fn();
  dispatchProps.openViewVarianceModal = jest.fn();
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("VariancesTable", () => {
  it("renders properly", () => {
    const component = shallow(<VariancesTable {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
