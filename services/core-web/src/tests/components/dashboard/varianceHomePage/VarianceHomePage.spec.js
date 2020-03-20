import React from "react";
import { shallow } from "enzyme";
import {
  VarianceHomePage,
  joinOrRemove,
  removeEmptyStings,
  formatParams,
} from "@/components/dashboard/varianceHomePage/VarianceHomePage";
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
    push: jest.fn(),
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

describe("Helper functions", () => {
  describe("joinOrRemove", () => {
    it("joins an array", () => {
      const param = ["1", "2", "3", "4"];
      const key = "friend";
      const param_object = joinOrRemove(param, key);
      expect(param_object.key === "1,2,3,4");
    });
    it("does not throw an error if a string is given", () => {
      const param = "66";
      const key = "friend";
      const param_object = joinOrRemove(param, key);
      expect(param_object.key === null);
    });
  });

  describe("removeEmptyStings", () => {
    it("removes an empty string", () => {
      const param = "";
      const key = "friend";
      const param_object = removeEmptyStings(param, key);
      expect(param_object.key === null);
    });
    it("does not remove a non empty string", () => {
      const param = "66";
      const key = "friend";
      const param_object = removeEmptyStings(param, key);
      expect(param_object.key === param);
    });
  });

  describe("formatParams", () => {
    it("formats the parameters into a usable form", () => {
      const param_in = {
        region: [20, 22, 23],
        compliance_code: [1, 2, 3, 4, 5],
        issue_date_after: "12-12-2020",
        issue_date_before: "",
        search: "The Rains of castemere",
        major: "",
      };
      const param_out = formatParams(param_in);
      expect(param_out.region === "20,22,23");
      expect(param_out.compliance_code === "1,2,3,4,5");
      expect(param_out.issue_date_after === "12-12-2020");
      expect(param_out.issue_date_before === null);
      expect(param_out.search === "The Rains of castemere");
      expect(param_out.major === null);
    });
  });
});
