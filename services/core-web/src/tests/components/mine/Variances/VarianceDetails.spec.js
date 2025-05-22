import React from "react";
import { render } from "@testing-library/react";
import { VarianceDetails } from "@/components/mine/Variances/VarianceDetails";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

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
    const { container: component } = render(<ReduxWrapper><VarianceDetails {...props} {...dispatchProps} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
