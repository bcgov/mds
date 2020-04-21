import React from "react";
import { shallow } from "enzyme";
import { VarianceHomePage } from "@/components/dashboard/varianceHomePage/VarianceHomePage";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const reducerProps = {};

const setupDispatchProps = () => {
  dispatchProps.fetchMineTenureTypes = jest.fn();
  dispatchProps.fetchVarianceDocumentCategoryOptions = jest.fn();
  dispatchProps.addDocumentToVariance = jest.fn();
  dispatchProps.updateVariance = jest.fn();
  dispatchProps.fetchMineComplianceCodes = jest.fn();
  dispatchProps.fetchRegionOptions = jest.fn();
  dispatchProps.openModal = jest.fn();
  dispatchProps.closeModal = jest.fn();
  dispatchProps.fetchInspectors = jest.fn();
  dispatchProps.fetchMineCommodityOptions = jest.fn();
  dispatchProps.fetchVarianceStatusOptions = jest.fn();
  dispatchProps.fetchVariances = jest.fn(() => Promise.resolve({}));
};

const setupReducerProps = () => {
  reducerProps.location = { search: " " };
  reducerProps.history = {
    replace: jest.fn(),
    location: {},
  };

  reducerProps.variances = MOCK.VARIANCES;
  reducerProps.variancePageData = MOCK.VARIANCE_PAGE_DATA;
  reducerProps.complianceCodesHash = MOCK.COMPLIANCE_CODES;
  reducerProps.getDropdownHSRCMComplianceCodes = MOCK.DROPDOWN_HSRCM_CODES;
  reducerProps.filterVarianceStatusOptions =
    MOCK.BULK_STATIC_CONTENT_RESPONSE.varianceStatusOptions;
};

beforeEach(() => {
  setupDispatchProps();
  setupReducerProps();
});

describe("VarianceHomePage", () => {
  it("renders properly", () => {
    const component = shallow(<VarianceHomePage {...dispatchProps} {...reducerProps} />);
    expect(component).toMatchSnapshot();
  });
});
