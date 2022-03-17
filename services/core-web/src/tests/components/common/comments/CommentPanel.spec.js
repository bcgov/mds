import React from "react";
import { shallow } from "enzyme";
import { CommentPanel } from "@/components/common/comments/CommentPanel";
import { MINE_COMMENTS } from "@/tests/mocks/dataMocks";

const dispatchProps = {};
const props = {};

const setupDispatchProps = () => {
  dispatchProps.onSubmit = jest.fn();
  dispatchProps.onChange = jest.fn();
  dispatchProps.onRemove = jest.fn();
};

const setupProps = () => {
  props.location = { hash: "", pathname: "/dashboard" };
  props.children = "";

  props.loading = false;
  props.renderEditor = false;
  props.comments = MINE_COMMENTS;
  props.userRoles = [];
};

beforeEach(() => {
  setupDispatchProps();
  setupProps();
});

describe("Comment", () => {
  it("renders properly", () => {
    const wrapper = shallow(<CommentPanel {...dispatchProps} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
