import React from "react";
import { shallow } from "enzyme";
import { CommentEditor } from "@mds/common/components/comments/CommentEditor";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
};

const setupProps = () => {
  props.submitting = false;
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("Comment", () => {
  it("renders properly", () => {
    const wrapper = shallow(<CommentEditor {...dispatchProps} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
