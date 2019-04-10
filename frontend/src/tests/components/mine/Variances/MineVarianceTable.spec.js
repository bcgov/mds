import React from "react";
import { shallow } from "enzyme";
import { MineVarianceTable } from "@/components/mine/Variances/MineVarianceTable";
import * as MOCK from "@/tests/mocks/dataMocks";

const reducerProps = {};

const setupReducerProps = () => {
  reducerProps.variances = MOCK.VARIANCES.records;
  reducerProps.complianceCodesHash = MOCK.HSRCM_HASH;
};

beforeEach(() => {
  setupReducerProps();
});

describe("MineVarianceTable", () => {
  it("renders properly", () => {
    const component = shallow(<MineVarianceTable {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
