import React from "react";
import { shallow } from "enzyme";
import { VarianceDetails } from "@/components/dashboard/mine/variances/VarianceDetails";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.removeDocument = jest.fn();
};
const setupProps = () => {
  props.variance = MOCK.VARIANCE;
  props.complianceCodesHash = MOCK.HSRCM_HASH;
  props.varianceStatusOptionsHash = MOCK.VARIANCE_STATUS_OPTIONS_HASH;
  props.mineName = "mockMineName";
  props.isViewOnly = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("VarianceDetails", () => {
  it("renders properly", () => {
    const component = shallow(<VarianceDetails {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
