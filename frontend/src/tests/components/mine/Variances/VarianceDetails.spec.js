import React from "react";
import { shallow } from "enzyme";
import { VarianceDetails } from "@/components/mine/Variances/VarianceDetails";
import * as MOCK from "@/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.variance = MOCK.VARIANCES.records;
  props.mineName = "mockMineName";
};

beforeEach(() => {
  setupProps();
});

describe("VarianceDetails", () => {
  it("renders properly", () => {
    const component = shallow(<VarianceDetails {...props} />);
    expect(component).toMatchSnapshot();
  });
});
