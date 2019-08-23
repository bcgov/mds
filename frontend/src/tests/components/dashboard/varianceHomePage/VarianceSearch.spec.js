import React from "react";
import { shallow } from "enzyme";
import VarianceSearch from "@/components/dashboard/varianceHomePage/VarianceSearch";
import * as MOCK from "@/tests/mocks/dataMocks";

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
    const component = shallow(<VarianceSearch {...props} />);
    expect(component).toMatchSnapshot();
  });
});
