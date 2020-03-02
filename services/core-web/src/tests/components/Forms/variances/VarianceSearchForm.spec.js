import React from "react";
import { shallow } from "enzyme";
import { VarianceSearchForm, validate } from "@/components/Forms/variances/VarianceSearchForm";

const dispatchProps = {};
const props = {};
const setupDispatchProps = () => {
  dispatchProps.handleSubmit = jest.fn();
  dispatchProps.handleVarianceSearch = jest.fn();
  dispatchProps.reset = jest.fn();
  dispatchProps.complianceCodes = [{ value: "11", label: "Person must comply" }];
  dispatchProps.mineRegionOptions = [{ value: "11", label: "Region must comply" }];
};

const setupProps = () => {
  props.isAdvanceSearch = true;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("VarianceSearchForm form", () => {
  it("renders properly", () => {
    const component = shallow(<VarianceSearchForm {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });

  it("throws an error when issue_date_after occurs after issue_date_before", () => {
    const values = { issue_date_after: "1999-12-12", issue_date_before: "1989-12-12" };
    const errors = validate(values);
    expect(errors.issue_date_before === "Must be after issue date.");
    expect(errors.expiry_date_before === null);
  });

  it("throws an error when expiry_date_after occurs after expiry_date_before", () => {
    const values = { expiry_date_after: "1999-12-12", expiry_date_before: "1989-12-12" };
    const errors = validate(values);
    expect(errors.issue_date_before === null);
    expect(errors.expiry_date_before === "Must be after expiry date.");
  });
});
