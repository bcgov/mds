import React from "react";
import { shallow } from "enzyme";
import { MajorMineApplicationReviewSubmit } from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationReviewSubmit";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.removeDocumentFromMajorMineApplication = jest.fn(() => Promise.resolve());
  dispatchProps.fetchProjectById = jest.fn(() => Promise.resolve());
};

const setupProps = () => {
  props.project = MOCK.PROJECT;
  props.confirmedSubmission = false;
  props.setConfirmedSubmission = jest.fn();
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("MajorMineApplicationReviewSubmit", () => {
  it("renders properly", () => {
    const component = shallow(<MajorMineApplicationReviewSubmit {...dispatchProps} {...props} />);
    expect(component).toMatchSnapshot();
  });
});
