import React from "react";
import { shallow } from "enzyme";
import { MineVarianceTable } from "@/components/mine/Variances/MineVarianceTable";
import * as MOCK from "@/tests/mocks/dataMocks";

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
    const component = shallow(<MineVarianceTable {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
