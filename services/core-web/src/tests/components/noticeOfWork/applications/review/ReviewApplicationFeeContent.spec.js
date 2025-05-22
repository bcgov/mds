import React from "react";
import { render } from "@testing-library/react";
import { ReviewApplicationFeeContent } from "@/components/noticeOfWork/applications/review/ReviewApplicationFeeContent";
import * as NOW_MOCK from "@mds/common/tests/mocks/noticeOfWorkMock";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

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
  props.change = () => { };
};

beforeEach(() => {
  setupProps();
});

describe("ReviewApplicationFeeContent", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><FormWrapper name="formName"><ReviewApplicationFeeContent {...props} /></FormWrapper></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
