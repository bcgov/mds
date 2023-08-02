import React from "react";
import { shallow } from "enzyme";
import { ReviewApplicationFeeContent } from "@/components/noticeOfWork/applications/review/ReviewApplicationFeeContent";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const props = {};

const setupProps = () => {
  props.isViewMode = false;
  props.initialValues = {
    notice_of_work_type_code: "SAG",
    proposed_start_date: "2016-03-01",
    proposed_end_date: "2020-03-01",
    adjusted_annual_maximum_tonnage: null,
    proposed_annual_maximum_tonnage: 10000,
    ...NOW_MOCK.IMPORTED_NOTICE_OF_WORK,
  };
  props.adjustedTonnage = null;
  props.proposedTonnage = 10000;
  props.proposedStartDate = "2016-03-01";
  props.proposedAuthorizationEndDate = "2020-03-01";
  props.change = () => {};
};

beforeEach(() => {
  setupProps();
});

describe("ReviewApplicationFeeContent", () => {
  it("renders properly", () => {
    const component = shallow(<ReviewApplicationFeeContent {...props} />);
    expect(component).toMatchSnapshot();
  });
});
