import React from "react";
import { shallow } from "enzyme";
import { ProjectDates } from "@/components/Forms/projects/projectSummary/ProjectDates";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {};

const setupProps = () => {
  props.expected_permit_application_date = undefined;
  props.expected_draft_irt_submission_date = undefined;
  props.expected_permit_receipt_date = undefined;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("ProjectDates", () => {
  it("renders properly", () => {
    const component = shallow(<ProjectDates {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
