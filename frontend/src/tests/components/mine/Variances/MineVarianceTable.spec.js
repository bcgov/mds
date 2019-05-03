import React from "react";
import { shallow } from "enzyme";
import { MineVarianceTable } from "@/components/mine/Variances/MineVarianceTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};
const dispatchProps = {};

const setupDispatchProps = () => {
  props.openModal = jest.fn();
};

const setupProps = () => {
  props.variances = MOCK.VARIANCES.records;
  props.complianceCodesHash = MOCK.HSRCM_HASH;
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
