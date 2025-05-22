import React from "react";
import { render } from "@testing-library/react";
import { UpdateNOWDateForm } from "@/components/Forms/noticeOfWork/UpdateNOWDateForm";
import { ReduxWrapper } from "@/tests/utils/ReduxWrapper";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.closeModal = jest.fn();
  dispatchProps.onSubmit = jest.fn();
};

const setupProps = () => {
  props.showCommentFields = false;
  props.initialValues = {};
  props.title = "Update Dates";
  props.recordType = "VER";
  props.importedDate = "July 1st";
};

beforeEach(() => {
  setupProps();
  setupDispatchProps();
});

describe("UpdateNOWDateForm", () => {
  it("renders properly", () => {
    const { container: component } = render(<ReduxWrapper><UpdateNOWDateForm {...props} {...dispatchProps} /></ReduxWrapper>);
    expect(component).toMatchSnapshot();
  });
});
