import React from "react";
import { shallow } from "enzyme";
import { UpdateNOWDateForm } from "@/components/Forms/noticeOfWork/UpdateNOWDateForm";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.closeModal = jest.fn();
  dispatchProps.handleSubmit = jest.fn();
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
    const component = shallow(<UpdateNOWDateForm {...props} {...dispatchProps} />);
    expect(component).toMatchSnapshot();
  });
});
