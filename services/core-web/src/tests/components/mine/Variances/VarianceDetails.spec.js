import React from "react";
import { shallow } from "enzyme";
import { VarianceDetails } from "@/components/mine/Variances/VarianceDetails";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.removeDocument = jest.fn();
};
const setupProps = () => {
  props.variance = MOCK.VARIANCES.records;
  props.complianceCodesHash = MOCK.HSRCM_HASH;
  props.mineName = "mockMineName";
  props.documentCategoryOptionsHash = MOCK.VARIANCE_DOCUMENT_CATEGORY_OPTIONS_HASH;
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
