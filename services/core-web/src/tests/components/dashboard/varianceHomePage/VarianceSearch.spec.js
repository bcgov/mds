import React from "react";
import { render } from "@testing-library/react";
import VarianceSearch from "@/components/dashboard/varianceHomePage/VarianceSearch";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.handleVarianceSearch = jest.fn();
};

const setupProps = () => {
  props.initialValues = {};
  props.mineRegionOptions = MOCK.REGION_OPTIONS;
  props.complianceCodes = MOCK.COMPLIANCE_CODES;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("Variance Search Component", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><VarianceSearch {...props} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
