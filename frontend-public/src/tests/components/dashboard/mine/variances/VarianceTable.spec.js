import React from "react";
import { shallow } from "enzyme";
import { VarianceTable } from "@/components/dashboard/mine/variances/VarianceTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.variances = MOCK.VARIANCES.records;
  props.complianceCodesHash = MOCK.HSRCM_HASH;
  props.varianceStatusOptionsHash = MOCK.VARIANCE_STATUS_OPTIONS_HASH;
  props.isApplication = false;
};

beforeEach(() => {
  setupProps();
});

describe("VarianceTable", () => {
  it("renders properly", () => {
    const component = shallow(<VarianceTable {...props} />);
    expect(component).toMatchSnapshot();
  });
});
