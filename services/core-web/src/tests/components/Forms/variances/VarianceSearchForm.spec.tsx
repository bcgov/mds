import React from "react";
import { render } from "@testing-library/react";
import { VarianceSearchForm, validate } from "@/components/Forms/variances/VarianceSearchForm";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {
  onSubmit: jest.fn(),
  handleVarianceSearch: jest.fn(),
  reset: jest.fn(),
  complianceCodes: [{ value: "11", label: "Person must comply" }],
  mineRegionOptions: [{ value: "11", label: "Region must comply" }],
};
const props = {
  isAdvanceSearch: true,
};

describe("VarianceSearchForm form", () => {
  it("renders properly", () => {
    const { container: component } = render(
      <ReduxWrapper>
        <VarianceSearchForm {...dispatchProps} {...props} />
      </ReduxWrapper>
    );
    expect(component).toMatchSnapshot();
  });

  it("throws an error when issue_date_after occurs after issue_date_before", () => {
    const values = { issue_date_after: "1999-12-12", issue_date_before: "1989-12-12" };
    const errors = validate(values);
    expect(errors.issue_date_before).toEqual("Must be after issue date.");
    expect(errors.expiry_date_before).toBeUndefined();
  });

  it("throws an error when expiry_date_after occurs after expiry_date_before", () => {
    const values = { expiry_date_after: "1999-12-12", expiry_date_before: "1989-12-12" };
    const errors = validate(values);
    expect(errors.issue_date_before).toBeUndefined();
    expect(errors.expiry_date_before).toEqual("Must be after expiry date.");
  });
});
